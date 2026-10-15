import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evidenceSummary, recommendation, scoreOpportunity, validateWeights } from "./lib/scoring.mjs";
import { revenueAdjustment, summarizeOpportunityRevenue, summarizeRevenue } from "./lib/revenue.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(here, "output", "autopilot");
const readJson = async (relative) => JSON.parse(await fs.readFile(path.join(here, relative), "utf8"));
const escapeHtml = (value) => String(value).replace(/[&<>\"]/g, (char) => ({"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"})[char]);

function makeRunId(date = new Date()) {
  return date.toISOString().replace(/[:.]/g, "-");
}

function lifecycleRecommendation(opportunity, score, thresholds) {
  if (opportunity.status.startsWith("killed")) return "hold";
  if (opportunity.status.startsWith("rework") || opportunity.status.startsWith("paused")) return "research";
  return recommendation(score, thresholds);
}

function buildListing(opportunity) {
  return {
    title: opportunity.name,
    price: opportunity.price,
    visibility: "invisible",
    headline: opportunity.job,
    audience: opportunity.audience,
    includes: opportunity.format,
    description: `${opportunity.job}\n\nBuilt for ${opportunity.audience}. You receive a ${opportunity.format.toLowerCase()}. Clear inputs, visible calculations, and practical instructions make it easy to replace the examples and start working.`,
    approvalRequiredBeforeUpload: true,
    approvalRequiredBeforePublicVisibility: true,
  };
}

function approvalQueue(leader) {
  if (leader.id === "event-ops-systems-sprint") {
    return [
      {id: "concierge-outreach", label: "Approve ten tailored validation messages or project applications", reason: "Contacting or applying to buyers represents Keenan externally and requires explicit approval."},
      {id: "client-access", label: "Approve access separately for each engaged client's systems", reason: "No client workspace, account, or operational data will be accessed without that client's authorization and a defined scope."},
      {id: "public-service-page", label: "Approve a public service page only after demand is confirmed", reason: "Public publication remains unnecessary until concierge validation produces serious buyer interest."}
    ];
  }
  return [
    {id: "private-update", label: "Approve any replacement of the existing unlisted Payhip file or listing", reason: "Updating an external store product changes the seller account even when it remains unlisted."},
    {id: "pricing", label: "Approve final prices", reason: "Current prices are positioning hypotheses, not public commitments."},
    {id: "launch", label: "Approve public launch and distribution", reason: "This remains blocked until explicitly authorized."}
  ];
}

function markdown(run) {
  const rows = run.opportunities.map((item, index) => `| ${index + 1} | ${item.name} | ${item.score.toFixed(1)} | ${item.recommendation} | ${item.evidence.count} | ${item.revenue.paidOrders} / ${item.revenue.refunds} | ${item.status} |`).join("\n");
  const sources = run.sources.map((source) => `- [${source.source}](${source.url}) — ${source.problem}`).join("\n");
  const leader = run.opportunities[0];
  const move = leader.recommendation === "build" ? "Build and privately test" : leader.recommendation === "research" ? "Research and strengthen" : "Hold";
  return `# Cheese Maker opportunity radar\n\nGenerated ${run.generatedAt}. This is a private decision document. Nothing was uploaded, published, emailed, or purchased.\n\n| Rank | Opportunity | Score | Next step | Evidence | Orders / refunds | Product status |\n|---:|---|---:|---|---:|---:|---|\n${rows}\n\n## Recommended move\n\n${move} **${leader.name}**. ${leader.job}\n\nThe score includes a ${leader.revenueAdjustment >= 0 ? "+" : ""}${leader.revenueAdjustment.toFixed(1)}-point observed-revenue adjustment from ${leader.revenue.paidOrders} paid order(s) and ${leader.revenue.refunds} refund(s).\n\n## Approval queue\n\n${run.approvals.map((item) => `- [ ] ${item.label} — ${item.reason}`).join("\n")}\n\n## Evidence reviewed\n\n${sources}\n`;
}

function dashboard(run) {
  const cards = run.opportunities.map((item, index) => `<article><div class="rank">${index + 1}</div><div><p class="eyebrow">${escapeHtml(item.recommendation)} · ${item.evidence.count} signals · ${item.revenue.paidOrders} orders</p><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.job)}</p><div class="meta"><strong>${item.score.toFixed(1)}</strong><span>opportunity score</span><b>$${item.price}</b><span>draft price</span></div></div></article>`).join("");
  const approvals = run.approvals.map((item) => `<li><span></span><div><strong>${escapeHtml(item.label)}</strong><p>${escapeHtml(item.reason)}</p></div></li>`).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cheese Maker Control Center</title><style>
  :root{--ink:#2d2438;--cheese:#f5b942;--cream:#fff8e7;--paper:#f7f3ec;--muted:#6d6475}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 Arial,sans-serif}main{max-width:1120px;margin:auto;padding:56px 24px 80px}.top{display:grid;grid-template-columns:1.5fr 1fr;gap:32px;align-items:end;border-bottom:4px solid var(--cheese);padding-bottom:28px;margin-bottom:28px}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:700;color:var(--muted);margin:0 0 8px}h1{font-size:clamp(40px,7vw,78px);line-height:.95;margin:0;letter-spacing:-.05em}.guard{background:var(--ink);color:white;padding:20px;border-radius:14px}.guard strong{color:var(--cheese)}.grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}article{display:grid;grid-template-columns:44px 1fr;gap:16px;background:white;border:1px solid #e4ddd3;border-radius:16px;padding:24px;box-shadow:0 7px 25px #2d24380c}.rank{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:var(--cheese);font-weight:800}h2{margin:0 0 8px;font-size:24px}article p{margin:0;color:var(--muted)}.meta{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:8px;align-items:baseline;margin-top:20px;border-top:1px solid #eee5db;padding-top:14px}.meta strong{font-size:28px}.meta b{font-size:20px}.meta span{font-size:12px;color:var(--muted)}section{margin-top:46px}h3{font-size:28px;margin:0 0 16px}ul{list-style:none;padding:0;margin:0;display:grid;gap:10px}li{display:flex;gap:14px;background:var(--cream);padding:16px;border-radius:12px}li>span{width:20px;height:20px;border:2px solid var(--ink);border-radius:4px;flex:0 0 auto;margin-top:2px}li p{margin:2px 0 0;color:var(--muted)}footer{margin-top:44px;color:var(--muted);font-size:13px}@media(max-width:760px){.top,.grid{grid-template-columns:1fr}.top{align-items:start}.meta{grid-template-columns:auto 1fr}}
  </style></head><body><main><header class="top"><div><p class="eyebrow">Private control center · ${escapeHtml(run.generatedAt.slice(0,10))}</p><h1>Research into revenue.</h1></div><div class="guard"><strong>Safety lock active.</strong><br>No spend, upload, outreach, or public launch can happen from this system.</div></header><div class="grid">${cards}</div><section><p class="eyebrow">Human decisions</p><h3>Approval queue</h3><ul>${approvals}</ul></section><footer>Generated from versioned research signals and scoring rules in the Cheese Maker repository.</footer></main></body></html>`;
}

async function createRun() {
  const [config, signals, opportunities, revenueEvents] = await Promise.all([
    readJson("cheese-maker.config.json"),
    readJson("data/research-signals.json"),
    readJson("data/opportunities.json"),
    readJson("data/revenue-events.json"),
  ]);
  validateWeights(config.scoringWeights);
  if (config.safety.allowPaidApis || config.safety.allowAdSpend || config.safety.allowPublicLaunch) throw new Error("Safety policy must keep paid APIs, ad spend, and public launch disabled.");

  const ranked = opportunities.map((opportunity) => {
    const evidence = evidenceSummary(opportunity.id, signals);
    const researchScore = scoreOpportunity(opportunity, config.scoringWeights, evidence);
    const revenue = summarizeOpportunityRevenue(opportunity, revenueEvents);
    const observedRevenueAdjustment = revenueAdjustment(revenue);
    const score = Math.max(0, Math.min(100, Math.round((researchScore + observedRevenueAdjustment) * 10) / 10));
    return {...opportunity, evidence, revenue, revenueAdjustment: observedRevenueAdjustment, researchScore, score, recommendation: lifecycleRecommendation(opportunity, score, config.thresholds), listing: buildListing(opportunity)};
  }).sort((a, b) => {
    const aKilled = a.status.startsWith("killed") ? 1 : 0;
    const bKilled = b.status.startsWith("killed") ? 1 : 0;
    return aKilled - bKilled || b.score - a.score || a.name.localeCompare(b.name);
  });

  const run = {
    runId: makeRunId(),
    generatedAt: new Date().toISOString(),
    safety: config.safety,
    revenue: summarizeRevenue(revenueEvents),
    opportunities: ranked,
    sources: signals,
    approvals: approvalQueue(ranked[0])
  };

  await fs.mkdir(outputDir, {recursive: true});
  await Promise.all([
    fs.writeFile(path.join(outputDir, "latest.json"), JSON.stringify(run, null, 2) + "\n"),
    fs.writeFile(path.join(outputDir, "opportunity-radar.md"), markdown(run)),
    fs.writeFile(path.join(outputDir, "control-center.html"), dashboard(run)),
    fs.writeFile(path.join(outputDir, "payhip-draft-manifest.json"), JSON.stringify(ranked.map((item) => ({id: item.id, artifact: item.artifact, ...item.listing})), null, 2) + "\n")
  ]);
  return run;
}

async function status() {
  try {
    const run = JSON.parse(await fs.readFile(path.join(outputDir, "latest.json"), "utf8"));
    console.log(JSON.stringify({generatedAt: run.generatedAt, leader: run.opportunities[0].name, score: run.opportunities[0].score, approvals: run.approvals.length, safety: run.safety}, null, 2));
  } catch (error) {
    if (error.code === "ENOENT") throw new Error("No Cheese Maker run exists yet. Run `pnpm cheese:run` first.");
    throw error;
  }
}

const command = process.argv[2] || "run";
if (command === "run") {
  const run = await createRun();
  console.log(JSON.stringify({runId: run.runId, leader: run.opportunities[0].name, score: run.opportunities[0].score, outputDir}, null, 2));
} else if (command === "status") {
  await status();
} else {
  throw new Error(`Unknown command: ${command}`);
}
