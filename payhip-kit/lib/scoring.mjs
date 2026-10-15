export function validateWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);
  if (Math.abs(total - 1) > 0.0001) throw new Error(`Scoring weights must total 1; received ${total}`);
}

export function evidenceSummary(opportunityId, signals) {
  const matches = signals.filter((signal) => signal.opportunityIds.includes(opportunityId));
  const supporting = matches.filter((signal) => signal.effect !== "risk");
  const risks = matches.filter((signal) => signal.effect === "risk");
  return {
    count: matches.length,
    sourceTypes: [...new Set(matches.map((signal) => signal.sourceType))],
    strength: matches.reduce((sum, signal) => sum + signal.strength, 0),
    supportingCount: supporting.length,
    supportingSourceTypes: [...new Set(supporting.map((signal) => signal.sourceType))],
    supportingStrength: supporting.reduce((sum, signal) => sum + signal.strength, 0),
    riskCount: risks.length,
    riskStrength: risks.reduce((sum, signal) => sum + signal.strength, 0),
    signals: matches,
  };
}

export function scoreOpportunity(opportunity, weights, evidence) {
  const base = Object.entries(weights).reduce((sum, [key, weight]) => {
    const value = opportunity.scores[key];
    if (!Number.isFinite(value) || value < 0 || value > 5) throw new Error(`${opportunity.id}.${key} must be between 0 and 5`);
    return sum + (value / 5) * weight * 100;
  }, 0);
  const supportingCount = evidence.supportingCount ?? evidence.count ?? 0;
  const supportingSourceTypes = evidence.supportingSourceTypes ?? evidence.sourceTypes ?? [];
  const riskStrength = evidence.riskStrength ?? 0;
  const evidenceBonus = Math.min(6, supportingCount * 1.5 + supportingSourceTypes.length);
  const riskPenalty = Math.min(15, riskStrength * 1.25);
  return Math.max(0, Math.min(100, Math.round((base + evidenceBonus - riskPenalty) * 10) / 10));
}

export function recommendation(score, thresholds) {
  if (score >= thresholds.buildCandidate) return "build";
  if (score >= thresholds.researchMore) return "research";
  return "hold";
}
