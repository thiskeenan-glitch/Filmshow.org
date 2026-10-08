# Filmshow V2 — Proposed Design System

This document describes the shared system demonstrated by the three concept routes. It is a proposal, not a production migration. The existing homepage and production integrations remain unchanged.

## Creative position

Filmshow is one event made from two alternating states:

`SHOW / FILM / SHOW / FILM`

The interface should behave like an engineered room: restrained from a distance, strange in motion, and precise at every seam. Red is a signal, not a decoration. Images should feel documentary and immediate rather than promotional.

## Foundation

### Color

| Token | Value | Use |
| --- | --- | --- |
| Graphite | `#080909` | Primary dark environment |
| Paper | `#f0eee8` | Primary text on dark |
| Concrete | `#e3e2dc` | Editorial light environment |
| Muted metal | `#9c9a94` | Secondary text |
| Signal red | `#d41c13` | Direction, active state, and live cues only |
| Hairline | `rgba(240, 238, 232, 0.18)` | Architectural divisions |

### Type

- Display: condensed grotesque/system sans, very large, tight tracking.
- Editorial: Georgia (temporary system serif) for human, narrative copy.
- Utility: Arial/system sans in uppercase, 10–12px equivalent, tracked widely.
- Production recommendation: license and self-host one condensed display family and one editorial serif. Do not load them from a third-party runtime.

### Space and geometry

- Page gutter: `clamp(20px, 5vw, 80px)`.
- Hairlines divide content; cards should not float in decorative shadows.
- Glass uses a single translucent layer, subtle border, and restrained blur.
- Large sections should alternate open space with tightly controlled image crops.

## Interaction language

- Motion should describe physical state: doors open, a word separates, a frame gives way.
- Default timing: 550–900ms with a weighted ease-out curve.
- Hover reveals information; it must never be the only way to access it.
- All controls remain native links or buttons with keyboard focus.
- Reduced-motion mode removes transforms and leaves all meaning visible.
- No high-resolution video autoplays. A poster loads first; motion media should begin only after user intent or when a small optimized loop is deliberately approved.

## Reusable content model

Operational state belongs in `lib/filmshow-v2-config.ts`, separate from presentation. The first production pass should expand it to include:

- Ticket state: `available`, `waitlist`, or `unannounced`.
- Submission state: `open`, `closed`, or `announcing-soon`.
- Current edition date, venue, and links.
- Archive volumes with verified film, filmmaker, press, quote, and award records.

Unknown information must remain visibly labeled as pending. Testimonials, press, awards, filmmakers, and winners must never be synthesized.

## Proposed site structure

### Home

An abbreviated version of the selected opening concept, followed immediately by a plain-language description and two state-aware actions: tickets and submissions.

### The Experience

The sequence component becomes the core explainer. Use real Volume 1 stills and short optimized clips once approved.

### Past Shows

`/shows` is the archive index. Each edition uses `/shows/v1`, `/shows/v2`, and so on. Archive fields support hero media, gallery, screened films and credits, highlights, verified press, verified quotes, winning film, and audience award.

### Submissions

Status, deadline, eligibility, FilmFreeway action, instructions, and FAQs read from configuration. Date changes should be content-only edits.

### Tickets

The next edition reads from configuration. `unannounced` shows an interest/waitlist state; `available` exposes the Luma action. Existing payment and ticket integrations are not altered by this concept work.

### About

A concise mission, origin, and expandable team roster. Keep the primary story short; use a separate team section for biographies.

## Prototype routes

- `/concepts/doors` — most theatrical and distinctive; requires careful media direction.
- `/concepts/sequence` — clearest explanation of the event rhythm.
- `/concepts/glass` — strongest foundation for the complete long-term website.

## Production recommendation

Use **The Glass Theater** as the homepage foundation and reuse the **Sequence** as the Experience page. Glass is the most maintainable: its signature moment needs one wordmark interaction, while the content below uses durable editorial sections. It does not make the whole site depend on a complex interaction and remains legible when motion, blur, or JavaScript is unavailable.
