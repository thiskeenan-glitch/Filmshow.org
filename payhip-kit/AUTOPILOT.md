# Cheese Maker Autopilot

Cheese Maker now has a private, local-first research-to-revenue loop:

1. Add dated customer, marketplace, or platform evidence to `data/research-signals.json`.
2. Add or update product hypotheses in `data/opportunities.json`.
3. Run `pnpm cheese:run`.
4. Review the ranked opportunity radar, private control center, and Payhip draft manifest in `output/autopilot`.
5. Build and validate the leading product.
6. Request approval before connecting a store, uploading a draft, publishing a price, contacting an audience, or spending money.
7. After launch approval, feed sales and refund evidence back into the next run.

Verified Payhip webhook payloads can be imported with `pnpm cheese:ingest:payhip /path/to/event.json` once `PAYHIP_API_KEY` is available. The importer verifies the official signature, removes email and IP data, deduplicates events, and stores only transaction totals and product identifiers for the revenue feedback loop.

## Safety model

The configuration keeps paid APIs, advertising spend, and public launch disabled. Generated Payhip manifests use `invisible` visibility and still require approval before upload. The system does not contain credentials and does not publish or message anyone.

## What is autonomous now

- Evidence is normalized into versioned signals.
- Opportunities are scored consistently against demand, severity, willingness to pay, founder fit, competition gap, build effort, and observed paid orders or refunds attributed by opportunity or store product ID.
- Every run produces a ranked decision document, private HTML control center, draft product listings, and an approval queue.
- The safety policy fails closed if paid APIs, ad spend, or public launch are enabled in configuration.

## Account access needed later

No account access is needed for research, scoring, product generation, packaging, or local QA. Payhip authorization is needed only after approval to create private drafts. Public visibility and any distribution remain separate approval steps.
