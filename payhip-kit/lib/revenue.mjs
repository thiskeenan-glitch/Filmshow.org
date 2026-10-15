export function summarizeRevenue(events) {
  const summary = {gross: 0, refunds: 0, net: 0, orders: 0, currency: null, byProduct: {}};
  for (const event of events) {
    const sign = event.type === "refunded" ? -1 : 1;
    if (event.type === "paid") summary.orders += 1;
    if (event.type === "paid") summary.gross += event.price;
    if (event.type === "refunded") summary.refunds += event.price;
    summary.net += sign * event.price;
    summary.currency ||= event.currency;
    for (const item of event.items || []) {
      const key = item.product_id || item.product_name;
      const product = summary.byProduct[key] ||= {name: item.product_name, paidOrders: 0, refunds: 0};
      if (event.type === "paid") product.paidOrders += 1;
      if (event.type === "refunded") product.refunds += 1;
    }
  }
  return summary;
}

function eventMatchesOpportunity(event, opportunity) {
  if (event.opportunity_id === opportunity.id || event.opportunityId === opportunity.id) return true;
  const storeProductId = opportunity.store?.productId;
  return (event.items || []).some((item) =>
    item.opportunity_id === opportunity.id ||
    item.opportunityId === opportunity.id ||
    (storeProductId && String(item.product_id) === String(storeProductId))
  );
}

export function summarizeOpportunityRevenue(opportunity, events) {
  const matching = events.filter((event) => eventMatchesOpportunity(event, opportunity));
  const summary = {paidOrders: 0, refunds: 0, gross: 0, net: 0, currency: null};
  for (const event of matching) {
    const amount = Number(event.price) || 0;
    if (event.type === "paid") {
      summary.paidOrders += 1;
      summary.gross += amount;
      summary.net += amount;
    } else if (event.type === "refunded") {
      summary.refunds += 1;
      summary.net -= amount;
    }
    summary.currency ||= event.currency || null;
  }
  return summary;
}

export function revenueAdjustment(summary) {
  if (!summary.paidOrders && !summary.refunds) return 0;
  const retainedOrders = Math.max(0, summary.paidOrders - summary.refunds);
  const positive = Math.min(16, retainedOrders * 4);
  const refundPenalty = Math.min(20, summary.refunds * 6);
  return Math.max(-20, Math.min(16, positive - refundPenalty));
}
