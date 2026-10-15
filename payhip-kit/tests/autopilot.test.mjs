import test from "node:test";
import assert from "node:assert/strict";
import { evidenceSummary, recommendation, scoreOpportunity, validateWeights } from "../lib/scoring.mjs";
import { revenueAdjustment, summarizeOpportunityRevenue, summarizeRevenue } from "../lib/revenue.mjs";

const weights = {demand: .22, pain: .2, willingnessToPay: .18, founderFit: .16, competitionGap: .14, buildEase: .1};

test("weights must total one", () => {
  assert.doesNotThrow(() => validateWeights(weights));
  assert.throws(() => validateWeights({...weights, demand: .5}), /must total 1/);
});

test("evidence is limited to the matching opportunity", () => {
  const summary = evidenceSummary("a", [
    {opportunityIds: ["a"], sourceType: "community", strength: 5},
    {opportunityIds: ["a"], sourceType: "competitor", strength: 4, effect: "risk"},
    {opportunityIds: ["b"], sourceType: "marketplace", strength: 4},
  ]);
  assert.equal(summary.count, 2);
  assert.equal(summary.supportingCount, 1);
  assert.equal(summary.riskCount, 1);
  assert.equal(summary.riskStrength, 4);
});

test("credible competitive risks reduce rather than inflate a score", () => {
  const opportunity = {id: "a", scores: {demand: 5, pain: 5, willingnessToPay: 4, founderFit: 5, competitionGap: 2, buildEase: 5}};
  const supportOnly = scoreOpportunity(opportunity, weights, {supportingCount: 2, supportingSourceTypes: ["community"], riskStrength: 0});
  const withRisk = scoreOpportunity(opportunity, weights, {supportingCount: 2, supportingSourceTypes: ["community"], riskStrength: 10});
  assert.ok(withRisk < supportOnly);
});

test("strong supported opportunity clears build threshold", () => {
  const opportunity = {id: "a", scores: {demand: 5, pain: 5, willingnessToPay: 4, founderFit: 5, competitionGap: 4, buildEase: 5}};
  const score = scoreOpportunity(opportunity, weights, {count: 2, sourceTypes: ["community", "marketplace"]});
  assert.ok(score >= 70);
  assert.equal(recommendation(score, {buildCandidate: 70, researchMore: 55}), "build");
});

test("revenue feedback nets refunds without retaining customer data", () => {
  const result = summarizeRevenue([
    {type: "paid", price: 2900, currency: "USD", items: [{product_id: "1", product_name: "Offer"}]},
    {type: "refunded", price: 2900, currency: "USD", items: [{product_id: "1", product_name: "Offer"}]},
  ]);
  assert.equal(result.gross, 2900);
  assert.equal(result.refunds, 2900);
  assert.equal(result.net, 0);
  assert.equal(result.byProduct["1"].refunds, 1);
});

test("observed revenue is attributed to the matching opportunity and changes its score", () => {
  const opportunity = {id: "offer", store: {productId: "XjrgG"}};
  const result = summarizeOpportunityRevenue(opportunity, [
    {type: "paid", price: 2900, currency: "USD", items: [{product_id: "XjrgG"}]},
    {type: "paid", price: 95000, currency: "USD", opportunity_id: "service", items: []},
  ]);
  assert.equal(result.paidOrders, 1);
  assert.equal(result.net, 2900);
  assert.equal(revenueAdjustment(result), 4);
});

test("refunds reverse retained-order confidence and can penalize an opportunity", () => {
  const summary = {paidOrders: 1, refunds: 1};
  assert.equal(revenueAdjustment(summary), -6);
});
