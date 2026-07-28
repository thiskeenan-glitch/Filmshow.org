# Filmshow SEO Audit

Audit date: 2026-07-28  
Scope: Audit-only review of the current Filmshow repository. No implementation changes were made as part of this audit.

## Executive Summary

Filmshow is technically indexable and has a strong visual identity, but it is under-optimized for the searches it most wants to win. The biggest SEO limitations are not basic crawlability; they are incomplete event data, weak local specificity, missing or thin dedicated landing pages, stale prize language in metadata/schema, an indexable success page, oversized hero media, and incomplete structured data.

The site currently communicates a compelling experience to humans, especially visually. Search engines and answer engines, however, need more stable factual information: exact event venue, time, neighborhood, ticket details, submission rules, selection process, organizer/founder details, event archive, and page-specific schema.

Current overall SEO score: **56 / 100**

Current verdict: **Technically indexable but under-optimized.**

## Scorecard

| Category | Score | Status | Biggest issue | Highest-impact opportunity |
|---|---:|---|---|---|
| Overall SEO | 56 | Needs improvement | Strong brand, but incomplete event/local/submission signals | Build a stronger technical and content foundation around event, tickets, submissions, and local NYC/Brooklyn relevance |
| Technical SEO | 72 | Good | `/originals/success` is indexable and not intentionally excluded | Add noindex to private/confirmation routes; add redirect/canonical policy for domain variants |
| On-page SEO | 65 | Needs improvement | Page topics are clear, but several titles/descriptions still use stale or generic prize language | Rewrite metadata around current positioning, event intent, tickets, submissions, and Originals |
| Content and topical relevance | 58 | Needs improvement | Beautiful copy often lacks searchable facts: venue, neighborhood, time, deadline, submission details | Add concise factual blocks without weakening the cinematic tone |
| Structured data | 45 | Poor | Event schema is incomplete and still vague: no start time, venue address, ticket price, end date, or page-specific event URL | Expand Organization, WebSite, Event, FAQPage, WebPage, Person, and Breadcrumb schema |
| Local SEO | 42 | Poor | Brooklyn appears, but Greenpoint/Williamsburg/venue/local proof are missing | Add confirmed neighborhood, venue, transit, local partnerships, and local event listing strategy |
| Event SEO | 44 | Poor | No stable detailed event page with full date/time/location/offers/status | Create one stable event page per Filmshow event and keep past events archived |
| Image and video SEO | 47 | Poor | Hero videos are 56-57 MB and lack VideoObject schema, captions, and transcript support | Optimize video delivery and add video/image metadata where meaningful |
| Performance and Core Web Vitals readiness | 38 | Poor | Autoplay hero video with `preload="auto"` and 50MB+ media is a major mobile/LCP risk | Use compressed MP4/WebM variants, lazy strategy, poster-first loading, and measured Lighthouse testing |
| Mobile SEO | 72 | Good | Mobile structure is mostly sound, but hero media and fixed nav can push core facts down | Keep CTAs visible and surface event facts sooner on mobile |
| Accessibility as it affects SEO | 68 | Needs improvement | Sponsor form uses placeholders instead of real labels; videos lack captions/transcripts | Add labels, transcripts, captions, and stronger semantic support |
| Internal linking and information architecture | 52 | Needs improvement | Important public pages are sitemap-only or weakly linked; ticket CTA bypasses `/tickets` | Link pages contextually: event, tickets, submit, Originals, about, archive |
| Social sharing metadata | 72 | Good | Social image is square and generic across pages; some page previews are not specific | Add page-specific social titles/images for tickets, submit, Originals, and event pages |
| Conversion-focused SEO | 60 | Needs improvement | Ticket buyers lack exact time/venue/price; filmmakers lack standalone submission detail | Create dedicated ticket/event and submit pages built for high-intent visitors |
| AI search and answer-engine visibility | 55 | Needs improvement | Entity facts are inconsistent or incomplete; “Film Show” vs “Filmshow” appears in hero copy | Add concise factual answer blocks and consistent entity naming |
| Measurement and analytics readiness | 70 | Good | GA4 is present, but purchase attribution and UTM/cross-domain tracking are incomplete | Track ticket/submission funnel stages and preserve campaign attribution |

### How Scores Were Calculated

I scored each category against the checklist in the audit brief using observable repository evidence only. A category starts at 100 and loses points for confirmed issues, likely crawl/render/performance risks, and missing required SEO elements. Confirmed blocking issues carry larger deductions than opportunities that require owner-supplied data.

Overall SEO is a weighted score:

| Category | Weight |
|---|---:|
| Technical SEO | 12% |
| On-page SEO | 10% |
| Content and topical relevance | 10% |
| Structured data | 10% |
| Local SEO | 8% |
| Event SEO | 8% |
| Image and video SEO | 7% |
| Performance/Core Web Vitals readiness | 8% |
| Mobile SEO | 5% |
| Accessibility as SEO | 5% |
| Internal linking and architecture | 5% |
| Social metadata | 4% |
| Conversion SEO | 4% |
| AI search visibility | 2% |
| Measurement readiness | 2% |

Weighted result: **56 / 100**.

## Public Route Inventory

### Intended public pages found in the App Router

| Route | Source | Sitemap? | Metadata source | Indexability assessment |
|---|---|---:|---|---|
| `/` | `app/page.tsx` | Yes | `routeMetadata.home` in `lib/seo.ts` via `app/layout.tsx` | Indexable |
| `/tickets` | `app/tickets/page.tsx` | Yes | `routeMetadata.tickets` | Indexable |
| `/how-it-works` | `app/how-it-works/page.tsx` | Yes | `routeMetadata.howItWorks` | Indexable |
| `/about` | `app/about/page.tsx` | Yes | `routeMetadata.about` | Indexable |
| `/sponsors` | `app/sponsors/page.tsx` | Yes | `routeMetadata.sponsors` | Indexable but weakly linked |
| `/originals` | `app/originals/page.tsx` | Yes | `routeMetadata.originals` | Indexable |
| `/originals/success` | `app/originals/success/page.tsx` | No | inline `createPageMetadata` call | Should not be indexable; currently no noindex directive |

### Non-page public endpoints and assets

| Route/File | Source | SEO note |
|---|---|---|
| `/robots.txt` | `app/robots.ts` | Allows all crawlers and points to sitemap |
| `/sitemap.xml` | `app/sitemap.ts` | Generated from `publicRoutes` in `lib/seo.ts` |
| `/icon.png` | `app/icon.png` | App icon route |
| `/apple-icon.png` | `app/apple-icon.png` | App icon route |
| `/api/originals/checkout` | `app/api/originals/checkout/route.ts` | POST-only funnel endpoint; not a search landing page |
| `/api/originals/retry-checkout` | `app/api/originals/retry-checkout/route.ts` | POST-only funnel endpoint; not a search landing page |
| `/api/stripe/originals/webhook` | `app/api/stripe/originals/webhook/route.ts` | Webhook endpoint; should never appear in sitemap |

### Stale, hidden, or legacy artifacts

| Location | Assessment |
|---|---|
| `preview/` | Old static previews exist at repository root. They are not under `public/`, so they are not served by this Next app, but they should remain excluded from deployment packages and source commits where possible. |
| `.next-corrupt-preview/` | Old generated build artifacts exist. Not served by Next as a public route, but it is repository clutter and could confuse tooling if deployment packaging is nonstandard. |
| `README.md` | Contains stale language: `$6,000 cash prize` and page list missing `/originals` and `/how-it-works`. Not a production webpage, but it can create brand/entity inconsistency if reused on GitHub, in docs, or by AI tools. |
| `public/images/optimized/prize-bg.jpg` | Legacy prize asset remains unused in current route code. Not an SEO problem by itself, but points to stale prize-era content. |

## Technical SEO Audit

### Confirmed strengths

- `app/robots.ts` allows crawling and declares the sitemap.
- `app/sitemap.ts` generates canonical sitemap URLs from `lib/seo.ts`.
- Canonicals are absolute through `absoluteUrl()` and `SITE_URL = "https://www.filmshow.org"`.
- `html lang="en"` is set in `app/layout.tsx`.
- Most intended public pages have unique title/description metadata.
- App Router static generation is available for main marketing pages; `/originals` and `/originals/success` are dynamic for form/payment state.
- No obvious client-side-only core copy. Important page text is rendered as normal JSX text, not only in video/image assets.

### Technical issues and recommendations

| Severity | Affected route/file | What is happening | Why it matters | Recommended fix | Expected impact | Difficulty | Visual/function risk |
|---|---|---|---|---|---|---|---|
| Critical | `/originals/success`, `app/originals/success/page.tsx` | The confirmation page has metadata and a canonical URL, but no `robots: { index: false, follow: false }`. It is not in the sitemap, but it can still be discovered. | Confirmation/status pages are thin, private-context pages and should not appear in Google. | Add noindex/nofollow metadata to `/originals/success`. Keep it out of sitemap. | Prevents low-quality/private flow page from indexing. | Small | None |
| High | `lib/seo.ts` Event schema | Event schema has only `startDate: "2026-10-08"` with no time or timezone; venue is `Brooklyn, New York venue TBA`; no endDate, price, priceCurrency, validFrom, or exact availability state. | Google event discovery depends heavily on complete event data. Vague event schema can be ignored or considered incomplete. | Add full event date/time, timezone, venue name/address, ticket offer, price, availability, event URL, organizer, and image when confirmed. | Major event-search improvement. | Medium | None if data is correct |
| High | Domain configuration | No `vercel.json`, middleware, or config verifies redirects from `http`, non-www, or alternate hosts to `https://www.filmshow.org`. | Duplicate domain variants can split signals and create inconsistent previews. | Confirm hosting-level redirects: `http://filmshow.org`, `https://filmshow.org`, and preview/staging should canonicalize or noindex appropriately. | Consolidates ranking signals. | Small/Medium | None |
| High | `app/robots.ts`, preview/staging | Robots allows all environments if deployed with the same app. No preview-specific noindex policy exists. | Vercel preview URLs can become indexable if shared and crawled. | Add environment-aware noindex headers or metadata for non-production hosts. | Prevents duplicate preview indexing. | Medium | None |
| High | `app/tickets/page.tsx`, header CTAs | Main “Get Tickets” CTAs go directly to Luma through `LumaCheckoutLink`, bypassing `/tickets`. | `/tickets` is a high-intent SEO page, but internal link equity and user flow skip it. | Decide whether header CTA should open checkout directly or route first to `/tickets`. If keeping checkout direct, add contextual homepage links to `/tickets`. | Improves discoverability and conversion measurement. | Small | Minor flow change |
| Medium | `lib/seo.ts` `lastModified` | Sitemap uses a fixed `new Date("2026-07-17")`. | Search engines use sitemap freshness as a hint. A static old date becomes stale. | Update `lastModified` manually with releases or derive per-route dates from build/deploy metadata. | Better crawl freshness signal. | Small | None |
| Medium | `routeMetadata` vs public routes | `/originals/success` is not in `publicRoutes`, but still has indexable metadata. | Sitemap exclusion alone is not enough. | Add a `nonIndexableRoutes` convention or page-specific noindex. | Cleaner route intent. | Small | None |
| Medium | `preview/`, `.next-corrupt-preview/`, `README.md` | Old preview/build/docs files remain in repo. | Not served by this Next app, but can confuse audits, AI tools, or accidental static hosting. | Keep ignored; remove from repo if committed. Update README. | Reduces stale entity signals. | Small | None |
| Medium | Query state on `/originals` | `/originals?payment=cancelled&submission=...#application` can exist. Canonical points to `/originals` through metadata inheritance. | Canonical likely handles it, but crawl tools may discover infinite-ish parameter variants if externally linked. | Keep canonical; optionally add `robots` or URL parameter policy in Search Console if it appears. | Prevents duplicate crawl noise. | Small | None |
| Medium | API endpoints | POST endpoints exist with JSON error responses. | Usually fine, but if GET returns nonstandard responses, crawlers may report noise. | Confirm GET status behavior in production. Do not sitemap API routes. | Clean crawl diagnostics. | Small | None |
| Low | `app/robots.ts` `host` | `host: SITE_URL` is not a Google directive. | Harmless, but not useful for Google. | Keep or remove; do not rely on it. | Minimal. | Small | None |

### Crawlability and rendering

- Core copy is server-rendered in page components, which is good.
- Header, gallery, hero video, and motion effects are client components, but they do not hide the primary page text from crawlers.
- The mobile menu and gallery depend on JavaScript for interaction, but navigation links are still real anchors.
- `MotionEffects` reveals elements with IntersectionObserver. The source text is still present in the DOM; this is generally safe for SEO.

## Page-by-Page Metadata Audit

| Route | Current title | Current description | Intended search intent | Main SEO issue | Recommended title | Recommended meta description | Primary keyword theme | Secondary keyword themes |
|---|---|---|---|---|---|---|---|---|
| `/` | `Not A Film Screening. A Film Show. | Filmshow NYC` | `Filmshow is a live short-film event in Brooklyn with curated films, live performances, audience voting, and a cash prize.` | Discover Filmshow, understand the event, buy tickets or submit | Description still says `cash prize`; brand line in brief says “This is not a festival,” while visible hero says “This is not a screening.” | `Filmshow | Live Short Films and Experimental Theater in Brooklyn` | `Filmshow combines short films from local filmmakers and live experimental theater in Brooklyn, New York. Get tickets, submit a film, or pitch Filmshow Originals.` | live short film event NYC | Brooklyn film events, experimental theater NYC, local filmmakers NYC |
| `/tickets` | `Filmshow Tickets | Live Short Films in Brooklyn` | `Get tickets to Filmshow, a live short-film event in Brooklyn with curated films, performances, audience participation, and a cash prize.` | Buy tickets | Missing venue, exact time, price, and Luma availability; description uses stale prize language. | `Filmshow Tickets | Short Films and Live Performance in Brooklyn` | `Get tickets to Filmshow, a Brooklyn live cinema event featuring local short films, experimental theater, and an audience in the room.` | Filmshow tickets | short film events Brooklyn, things to do in Brooklyn, NYC arts events |
| `/how-it-works` | `What Is Filmshow? | Live Short-Film Event NYC` | `Filmshow combines short films, live performances, audience participation, and a room full of strangers for one night in Brooklyn.` | Learn format and process | Good topic, but route name and nav label are inconsistent; page could carry stronger submission/ticket intent. | `How Filmshow Works | Short Films, Theater, and Audience Voting` | `Learn how Filmshow selects short films, presents live performance, and brings audiences together for a Brooklyn live cinema event.` | how Filmshow works | short film submissions NYC, audience voting film event, live cinema event |
| `/about` | `Why Filmshow Exists | Independent Film in Brooklyn` | `Filmshow creates a live, audience-first home for short films, filmmakers, performers, and people who want to experience something together.` | Brand trust and origin | Good but thin; founder story exists on homepage instead of a deeper About route. | `About Filmshow | A Brooklyn Live Cinema Experience` | `Filmshow is a Brooklyn live cinema experience from Keenan Gray, combining short films from local filmmakers with live experimental theater.` | about Filmshow | independent film Brooklyn, underground arts NYC, Keenan Gray Filmshow |
| `/sponsors` | `Filmshow Sponsors | Brooklyn Short-Film Event` | `Sponsor Filmshow, a Brooklyn short-film event built for filmmakers, audiences, performers, and the creative community.` | Sponsor inquiry | Orphaned/thin; sponsor form is not a real submission endpoint. | `Sponsor Filmshow | Brooklyn Film and Performance Event` | `Support Filmshow, a Brooklyn event for short films, live performance, local filmmakers, and New York City audiences.` | sponsor Filmshow | Brooklyn arts sponsorship, NYC film event sponsorship |
| `/originals` | `Filmshow Originals — $2,000 Short Film Grant` | `Pitch Filmshow an original short-film idea for the chance to receive $2,000 in production funding, support from Bluebird, and a premiere in New York City.` | Submit a pitch for Originals | Strong but could target “short film grant” and “pitch an original short film” more clearly; fee in code currently says `$10`, which should be verified against current business rule. | `Filmshow Originals | Pitch a Short Film Before It Exists` | `Pitch an original short-film idea to Filmshow Originals for production support, a $2,000 grant, and a New York City premiere.` | short film grant NYC | pitch a short film, filmmaker grant, Filmshow Originals |
| `/originals/success` | `Filmshow Originals Submission Received` | `Confirmation page for a Filmshow Originals pitch submission.` | Payment/submission confirmation only | Should not be indexable; not useful as a search result. | No indexed title | Add noindex. If metadata remains, keep title private-context only. | none | none |

### Metadata notes

- `createPageMetadata()` gives every route the same social image: `/images/filmshow-social-preview.jpg`.
- Internal routes all use absolute canonical URLs through `absoluteUrl()`.
- `keywords` in `app/layout.tsx` are broad and mostly ignored by Google; they are not harmful, but content and schema matter more.
- Open Graph `siteName` is `filmshow.org`; acceptable, though `Filmshow` may be more brand-like.
- `other: { "og:domain": DOMAIN_NAME }` is nonstandard but harmless.

## Content and Keyword Audit

### What Google can understand today

Google can understand that Filmshow is:

- A live short-film event.
- Connected to Brooklyn and NYC.
- Built around short films, live performances, and audience participation.
- A place for filmmakers to submit work through FilmFreeway.
- A place for Originals pitches through a local form and Stripe checkout.
- Visually connected to underground/New York/circus/theater energy.

### What is unclear or weak

- Exact venue name, address, and neighborhood are missing.
- Greenpoint and Williamsburg do not appear in current production page copy.
- Start time, doors time, end time, ticket price, age restrictions, accessibility details, and refund/transfer policy are missing.
- Current metadata and pages still use “cash prize,” while recent product direction removed or de-emphasized prize language except Originals funding.
- The homepage hero says `Film Show is a live show...`; entity naming should consistently be `Filmshow`.
- The brand line in the brief is “This is not a festival,” but current metadata and visible hero focus on “Not A Film Screening.” This may be intentional, but it is inconsistent with the brief.
- Main FilmFreeway submissions do not have a dedicated indexable page explaining eligibility, deadlines, selection, fee, notification, rights, or event date.
- The founder story is crawlable and unique, but the public About route is much thinner than the homepage founder section.
- Sponsors page is too thin to rank for meaningful sponsor intent and has no real backend conversion flow.

### Thin or under-supported pages

| Page | Issue |
|---|---|
| `/tickets` | Useful but incomplete for high-intent visitors because venue, time, price, and availability are missing. |
| `/about` | Good summary, but misses founder identity, history, proof, and deeper local context. |
| `/sponsors` | Thin and likely orphaned. |
| `/how-it-works` | Useful but could be merged, renamed, or strengthened with detailed selection/ticket/submission facts. |
| Homepage `#submit` | Important but not page-specific; cannot rank separately for “submit a short film NYC.” |
| Homepage `#photos` | Visual but not page-specific; cannot rank separately for event/gallery intent. |

### Keyword and topic map

#### High-intent ticket searches

| Topic | Best page | Notes |
|---|---|---|
| Filmshow tickets | `/tickets` | Needs stronger internal links and complete event facts. |
| short film events NYC | `/` and future event page | Homepage should carry entity; event page should carry conversion intent. |
| Brooklyn film events | `/tickets` or future `/events/filmshow-vol-1` | Needs exact neighborhood and venue. |
| things to do in Brooklyn | future event page | Needs date/time/location/price and local context. |
| live cinema event NYC | `/` | Current copy supports this, but phrase is not fully developed. |

#### High-intent submission searches

| Topic | Best page | Notes |
|---|---|---|
| submit a short film NYC | future `/submit` | Current homepage section is not enough. |
| short film submissions | future `/submit` | Needs rules, deadlines, fees, selection, notification. |
| FilmFreeway Filmshow | future `/submit` | Link to FilmFreeway with clear details. |
| filmmaker events NYC | `/how-it-works`, future `/submit` | Needs more filmmaker-specific proof. |
| Filmshow Originals | `/originals` | Stronger than main submission content. |

#### Local event discovery searches

| Topic | Best page | Notes |
|---|---|---|
| Greenpoint events | future event page or local detail section | Only add if venue/neighborhood is confirmed. |
| Williamsburg events | future event page or local detail section | Only add if accurate. |
| underground arts events NYC | `/` and `/about` | Strong conceptual fit; needs more factual support. |
| experimental theater NYC | `/` and future event page | Current copy supports this but could be clearer. |
| NYC arts events | future event page | Needs event calendar-style facts. |

#### Filmmaker and industry searches

| Topic | Best page | Notes |
|---|---|---|
| independent filmmakers New York | `/about`, future `/submit` | Needs credibility and community proof. |
| local filmmakers NYC | `/` and future `/submit` | Current hero says local filmmakers. |
| alternative film festival | `/` | Needs clarify “not a festival” without stuffing. |
| short film competition | `/how-it-works`, future `/submit` | Current “jury” and audience voting copy supports this. |
| short film grant | `/originals` | Current strongest opportunity. |

#### Brand searches

| Topic | Best page | Notes |
|---|---|---|
| Filmshow | `/` | Strong. |
| Filmshow NYC | `/` | Stronger if consistent entity naming. |
| Filmshow Originals | `/originals` | Strong. |
| Keenan Gray Filmshow | `/about` or homepage founder section | Founder is visible on homepage; About page should mention him. |

#### Informational searches

| Topic | Best page | Notes |
|---|---|---|
| what is Filmshow | `/how-it-works` or homepage About section | Route naming and nav could be clearer. |
| how Filmshow works | `/how-it-works` | Good fit. |
| how to submit a short film | future `/submit` | Needs standalone content. |
| audience-voted film event | `/how-it-works` | Good fit with expanded explanation. |

#### Long-term editorial opportunities

- Event archive: `/events`, `/events/filmshow-vol-1`, `/events/filmshow-vol-2`.
- Past selected films and filmmaker pages.
- Winner pages with film stills, bios, and interviews.
- “Guide to short film events in Brooklyn” or “Brooklyn live cinema” editorial pages.
- Venue/neighborhood page only if the relationship is durable and factual.
- Press page with assets, short boilerplate, and coverage.

## Structured Data Audit

### Existing JSON-LD objects

| Object | Source | Validity | Completeness | Accuracy | Search usefulness | Notes |
|---|---|---:|---:|---:|---:|---|
| `Organization` | `buildBaseJsonLd()` in `lib/seo.ts`, rendered on `/` | 80 | 45 | 65 | 55 | Has name, URL, logo, image, description, Brooklyn location. Missing `sameAs`, founder, contact, detailed address, social profile, and more precise entity description. |
| `WebSite` | `buildBaseJsonLd()` | 85 | 55 | 75 | 60 | Has name, URL, description, publisher. Missing `inLanguage`, `potentialAction` SearchAction if site search ever exists, and richer publisher relationship. |
| `Event` | `buildBaseJsonLd()` | 70 | 30 | 45 | 35 | Uses generic `Event`, no time/timezone/endDate/venue address/price. Venue TBA is factually cautious but weak. `availability: InStock` should be verified. |
| `BreadcrumbList` | `buildBreadcrumbJsonLd()` on internal pages | 90 | 75 | 85 | 75 | Good basic breadcrumbs on `/tickets`, `/how-it-works`, `/about`, `/sponsors`, `/originals`. Not present on `/originals/success`. |

### Missing schema opportunities

| Schema type | Where it fits | Why it matters | Owner-supplied data needed |
|---|---|---|---|
| `WebPage` / `AboutPage` / `ContactPage` | All primary pages; About/Sponsors | Helps answer engines understand page purpose. | None beyond current copy. |
| `FAQPage` | `/originals` FAQ | Can help search engines understand submission rules. | Confirm FAQ answers are final. |
| `Person` | Founder section and About page | Establishes Keenan Gray as organizer/founder. | Preferred name, bio, sameAs links, role. |
| `PerformingArtsEvent` or `ScreeningEvent` | Event-specific page | Better event classification than generic `Event`. | Exact event details. |
| `Offer` with price/currency/availability | Ticket/Event page | Event rich results need offer detail. | Ticket price, availability, validFrom, sales URL. |
| `VideoObject` | Hero trailer | Helps video understanding and discovery. | Thumbnail URL, upload date, duration, transcript/description. |
| `ImageObject` | Social image/key imagery | Better image semantics if images become content. | Captions/credit if needed. |
| `CreativeWork` / `Movie` | Future selected film pages | Strong for film archive and filmmaker authority. | Film titles, directors, stills, runtimes, descriptions. |
| `CollectionPage` | Future event/archive/gallery pages | Helps organize past events and films. | Archive content. |

### Structured data risks

- `LONG_DESCRIPTION` and route metadata still refer to a `cash prize`. If prize positioning has changed, schema and metadata are misleading.
- `Event` URL points to `SITE_URL` instead of a stable event or ticket page.
- `startDate: "2026-10-08"` is date-only. Google prefers full ISO date-time with timezone for events.
- `Brooklyn, New York venue TBA` may be accepted as text, but it will not help local event discovery.
- If tickets are not actually available, `availability: InStock` is inaccurate.
- There is no structured data for FilmFreeway submissions or Originals application terms.

## Local SEO Audit

Current local SEO status: **weak but fixable**.

### Current local signals

- Brooklyn appears in page titles, descriptions, copy, schema, and tickets/about pages.
- New York City appears in hero copy, Originals, and some metadata.
- `Greenpoint` and `Williamsburg` do not appear in current production code.
- Venue is `Brooklyn location TBA` or `Brooklyn, New York venue TBA`.
- No street address, map, transit, neighborhood, parking, accessibility, or venue partner information.

### Local SEO plan

#### On-site improvements

- Add exact venue name, address, neighborhood, borough, and transit details once confirmed.
- Write dates as `October 8, 2026` in visible copy, not only `10.8.26`.
- Add a small “Where” block to `/tickets` and the future event page.
- Add a concise “Brooklyn / NYC” sentence to `/about` explaining Filmshow’s connection to local filmmakers and live performance.
- Use `Greenpoint` or `Williamsburg` only if factually correct.

#### Structured-data improvements

- Replace `venue TBA` schema with a full `Place` and `PostalAddress` when available.
- Include `addressLocality`, `addressRegion`, `postalCode`, and `streetAddress`.
- Add `sameAs` profiles for official Filmshow social accounts.
- Use event `location` consistently across `/`, `/tickets`, and a future event page.

#### Google profile and listing opportunities

- Google Business Profile only if Filmshow has a qualifying public-facing location or event organizer profile.
- Add/verify Luma listing completeness.
- Consider Bing Places only if there is a stable qualifying local entity.

#### Local press and backlink opportunities

- Brooklyn Magazine, Greenpointers, The Skint, Brooklyn Paper, Gothamist events, DoNYC, Time Out New York, Nonsense NYC, local arts newsletters.
- Film schools and departments: NYU, Brooklyn College, Pratt, The New School, SVA, Columbia film communities.
- Theater/performance communities: experimental theater newsletters, downtown performance calendars.

#### Event-calendar distribution

- Luma, NYC.com events, Time Out, DoNYC, The Skint, Brooklyn arts calendars, venue calendar, university calendars, Greenpoint/Williamsburg calendars if applicable.

#### Venue and partner opportunities

- Venue website event page.
- Bluebird partner mention/backlink if factual.
- Participating filmmaker and performer pages/social bios linking to Filmshow.

## Event SEO Audit

Current event SEO status: **incomplete**.

### Missing event details

- Event start time.
- Doors time.
- End time.
- Venue name.
- Street address.
- Neighborhood.
- Ticket price.
- Ticket availability state.
- Age restrictions.
- Accessibility information.
- Refund/transfer policy.
- Final ticket URL and whether it should be Luma or `/tickets`.
- Participating filmmakers/performers.
- Event image specific to Vol. 1.

### Should Filmshow have stable event pages?

Yes. Each Filmshow should have a stable event URL, for example:

- `/events/filmshow-vol-1`
- `/events/filmshow-vol-2`

The page should remain live after the event as an archive with:

- Date, venue, neighborhood.
- Selected films.
- Filmmakers.
- Performers.
- Winners.
- Photos/video.
- Press links.
- Sponsor/partner credits.

This builds authority over time. A recurring event without archives looks temporary; an archive creates topical depth for “Brooklyn short film events,” “local filmmakers NYC,” and “underground arts events NYC.”

## Image and Video SEO Audit

### Strengths

- Gallery images use `next/image`, descriptive `alt`, `sizes`, lazy loading, and stable visual card dimensions.
- Decorative background imagery is hidden from assistive tech where appropriate.
- Hero logo has `alt="Filmshow"`.
- Founder portrait has descriptive alt text.
- Social image has declared metadata dimensions.

### Asset attention list

| Asset | Size/dimensions | Used where | Issue | Recommended action |
|---|---:|---|---|---|
| `public/videos/website-background.mov` | 56 MB | Hero trailer | Very large; `preload="auto"` in `components/hero-trailer.tsx`; MOV compatibility/performance risk | Export compressed MP4/WebM variants; use poster-first strategy; consider `preload="metadata"` or deferred load |
| `public/videos/filmshow-web-trailer-cropped.mov` | 57 MB | Legacy/possibly unused | Very large unused/legacy video | Remove if unused or compress if needed |
| `public/videos/tickets-loop.mp4` | 3.1 MB | Not currently used in inspected pages | Reasonable size but unused | Remove if legacy or use intentionally |
| `public/images/filmshow-originals-bg.png` | 8.6 MB, 3454x1820 | Originals hero CSS | Large PNG background | Convert to optimized JPEG/WebP/AVIF if still used |
| `public/images/what-is-filmshow-placeholder.png` | 8.6 MB, 3250x3250 | Appears legacy/unused | Large legacy asset | Remove or compress if unused |
| `public/images/originals/tootsie-background.jpg` | 4.6 MB, 3840x2160 | Homepage Originals teaser CSS | Large full-width background | Create optimized 2000px and mobile variants |
| `public/images/the-team.jpg` | 3.6 MB, 5712x4284 | Gallery fallback/visible source | Very large original served via Next Image but still a heavy source | Replace with optimized asset |
| `public/images/lots-of-people.jpg` | 2.2 MB, 4032x3024 | Gallery | Large | Replace with optimized asset |
| `public/images/what-is-filmshow-high-five-bg.png` | 2.2 MB, 1085x1450 | About section background | PNG photo background | Convert to JPEG/WebP/AVIF |
| `public/images/official-tfs-logo.png` | 8247x1889, 141 KB | Header, hero, footer | Dimensions huge; several uses set `unoptimized` | Use SVG or smaller transparent PNG variants |
| `public/images/filmshow-social-preview.jpg` | 1200x1200, 551 KB | OG/Twitter image | Square crop can be less ideal for wide link previews | Add 1200x630 page-specific OG image |

### Video SEO gaps

- No `VideoObject` schema.
- No captions.
- No transcript.
- No thumbnail metadata beyond `poster`.
- Autoplay with sound is fragile because browsers can block sound until user interaction.
- Important atmosphere in the video is not accessible to crawlers unless supported by nearby text.

## Performance and Core Web Vitals Audit

### Confirmed code-level risks

- Hero video uses `preload="auto"` and a 56 MB MOV source in `components/hero-trailer.tsx`.
- Hero tries to autoplay with sound, then falls back to muted autoplay. This increases browser work and can create inconsistent behavior.
- Global Luma script is loaded on every page via `app/layout.tsx`, even when a page may not need ticket checkout.
- Multiple client components attach scroll listeners: `SiteHeader`, `HeroTrailer`, `MotionEffects`, `ScrollFadeVideo` if used.
- Large CSS file and multiple visual effects increase rendering complexity.
- Several large background images are CSS backgrounds, so Next Image optimization does not apply.
- Header/logo images use `unoptimized`.

### Likely risks requiring Lighthouse or field data

- LCP may be dominated by the hero video/frame/background.
- Mobile FCP/LCP likely suffers on slow networks.
- INP may be affected by scroll listeners and mobile menu/gallery interactions.
- CLS risk appears moderate/low because many visual elements have fixed dimensions/aspect ratios, but live measurement is needed.
- TTFB depends on hosting; static pages should be good, dynamic Originals routes depend on environment/server behavior.

### Items that require live tools

- Lighthouse mobile and desktop reports.
- PageSpeed Insights field data.
- Chrome UX Report if there is enough traffic.
- Vercel function timing for `/originals`.
- Real network waterfalls for Luma, GA4, Stripe redirects, and video loading.

## Mobile SEO Audit

### Strengths

- Mobile header is dedicated and clear.
- Mobile tap targets are generally at least 44px high.
- Mobile gallery supports horizontal scrolling.
- CTAs are visible in the menu.
- `prefers-reduced-motion` is respected in CSS and hero behavior.
- Text sizes are generally readable.

### Risks

- Hero video and visuals can delay comprehension on slow mobile connections.
- The homepage primary factual event details are spread across sections; a new visitor may not see date/location/CTA within five seconds if the hero media dominates.
- Mobile header is visually prominent and fixed; ensure it never covers anchor-target headings.
- The submit and ticket flows split between Luma, FilmFreeway, Stripe, and Brevo, which can create mobile attribution and friction issues.

## Accessibility Audit as SEO

### Strengths

- Landmarks: `header`, `nav`, `main`, `footer` exist.
- Most meaningful images have alt text.
- Decorative images are often `alt=""` and `aria-hidden`.
- Focus-visible styling exists.
- Originals form fields have real labels and error messages.
- Reduced-motion handling exists.
- Gallery buttons have aria labels.

### Findings

| Severity | Location | Finding | SEO/usability relevance | Recommended fix |
|---|---|---|---|---|
| High | `components/sponsor-inquiry-form.tsx` | Inputs/select/textarea rely on placeholders and have no labels. | Poor form accessibility; screen readers and autofill have less context. | Add visible or visually hidden labels tied to each input. |
| High | `components/hero-trailer.tsx`, `components/scroll-fade-video.tsx` | Videos have labels but no captions or transcripts. | Search engines and assistive tech cannot understand video content. | Add transcript below/near the video or dedicated text summary; add captions if spoken audio matters. |
| Medium | `app/originals/success/page.tsx` | Confirmation page is indexable. | Not exactly accessibility, but creates low-quality search result risk. | Noindex. |
| Medium | `components/site-header.tsx` | Mobile menu is a div with links and no explicit modal/dialog semantics. | Probably usable, but screen-reader state could be clearer. | Consider `aria-modal`/dialog pattern or simpler navigation disclosure semantics. |
| Medium | Visual background sections | Important emotional content in background images has no accessible equivalent. | Fine if decorative; weak if the image communicates actual event proof. | Add captions or nearby crawlable context for proof images. |
| Low | `HeroTrailer` autoplay sound | Audio behavior can be intrusive or blocked. | Usability concern; not direct ranking, but affects engagement. | Keep if intentional, but ensure accessible controls or mute state if feasible. |

## Internal Linking and Site Architecture Audit

### Current architecture

- Homepage sections: `#top`, `#what-is-this`, `#photos`, `#submit`, Originals teaser, `#why-submit`.
- Header nav links to homepage anchors and `/originals`.
- Header ticket CTA links directly to Luma, not `/tickets`.
- Header submit CTA links directly to FilmFreeway, not a local `/submit` page.
- `/tickets`, `/about`, `/how-it-works`, and `/sponsors` are in sitemap but not all are prominent in navigation.
- Footer no longer contains small text links; it contains signup and brand links only.

### Orphan or weakly linked pages

| Page | Current linking issue |
|---|---|
| `/tickets` | Sitemap page, but primary ticket CTAs go directly to Luma. |
| `/about` | Sitemap page, but header uses homepage `About` anchor instead. |
| `/sponsors` | Sitemap page, weak/no primary navigation link. |
| `/how-it-works` | Linked from homepage submit section and About page, but not in main nav. |

### Recommended internal linking model

- Keep the minimalist nav, but ensure key SEO pages receive contextual links.
- Homepage hero/about: link to `/tickets` and `/originals` in addition to checkout where appropriate.
- Submit section: link to future `/submit` plus FilmFreeway.
- Ticket page: link to `/how-it-works`, `/about`, and future event page.
- Originals page: link back to `/submit` or FilmFreeway only if it helps distinguish pitch vs completed film submissions.
- About page: include founder story and links to tickets/submissions.
- Sponsors page: link from footer or a discreet partner/sponsor section.
- Add breadcrumbs to future event, archive, submit, and filmmaker pages.

## Conversion-Focused SEO Audit

### Ticket buyer journey

Current visitor can see:

- Event is in Brooklyn/NYC.
- Event date appears as `10.8.26`.
- Tickets are handled by Luma.
- Short films, live performances, audience participation.

Missing or weak:

- Start time.
- Doors time.
- Exact venue and neighborhood.
- Ticket price.
- Availability/sold-out state.
- Refund/transfer policy.
- Age restrictions.
- Accessibility details.
- Trust proof: past turnout, selected films, press, venue, partners.
- Stable event page.

### Filmmaker submission journey

Current visitor can see:

- Completed short films go to FilmFreeway.
- Runtime: 15 minutes or under.
- Genres welcome.
- Filmmakers anywhere can submit.
- Event is Brooklyn/New York.
- Originals pitch flow has rules, criteria, form, Stripe checkout, and FAQ.

Missing or weak:

- Main completed-film submission deadline.
- Main completed-film submission fee.
- Main selection criteria beyond broad facts.
- Rights, premiere status, notification date, screening format.
- Whether submitters need to attend.
- Whether there is still a cash prize, jury prize, audience prize, or no prize.
- FilmFreeway dependency means the site may lose conversion attribution and context.
- Originals fee currently reads `$10` in `lib/originals.ts` and form copy; verify if that is still correct.

## AI Search and Answer-Engine Audit

### What answer engines can cite now

- “Filmshow combines short films from local filmmakers and live experimental theater to create a glimpse into the underground scene of New York City.”
- “Filmshow is a live short-film event in Brooklyn.”
- “Filmshow Originals lets filmmakers pitch an unproduced short-film idea.”
- “One filmmaker receives $2,000 production funding and a premiere.”

### Problems for AI engines

- Entity naming inconsistency: visible hero says `Film Show`, while brand is `Filmshow`.
- Brand line mismatch: audit brief says “This is not a festival,” current hero/social says “Not A Film Screening. A Film Show.”
- Stale prize language appears in metadata, schema, homepage, tickets, README.
- Venue/time/details are incomplete.
- No external corroboration is visible in the repository.
- No press page or sourceable boilerplate.
- Founder identity is strong on homepage but not enough in `/about` metadata/content.
- Important visual proof is largely image/video-based, not accompanied by archive pages or captions.

### Answer-engine optimization plan

- Add a concise factual “What is Filmshow?” answer block.
- Add an About page paragraph naming Keenan Gray and the founding story.
- Add event facts in a stable event page.
- Add FAQPage schema for Originals and future Submit page.
- Add event archive and selected-films pages.
- Add official social `sameAs` links.
- Keep tone cinematic, but pair each poetic line with one factual sentence.

## Social Metadata Audit

### Current setup

- Centralized in `lib/seo.ts`.
- Open Graph and Twitter cards are generated by `createPageMetadata()`.
- Default social title: `Not A Film Screening. A Film Show.`
- Social image: `/images/filmshow-social-preview.jpg`, 1200x1200.
- Manifest uses `Not A Film Screening. A Film Show.` and the short description.

### Strengths

- Metadata is centralized and consistent.
- Canonical/social URLs are absolute.
- Social image dimensions are declared.
- Title capitalization matches the requested social line.

### Issues

- Same social image is used for all pages.
- Square 1200x1200 image can crop less predictably than 1200x630 in link previews.
- `/tickets`, `/originals`, and future `/submit` deserve distinct preview images.
- Current route descriptions still include `cash prize`.
- `/originals/success` has social metadata but should not be shared/indexed.
- No official social profile references in Organization schema.

## Analytics and Measurement Audit

### Current setup

- GA4 is installed with `@next/third-parties/google` in `app/layout.tsx`.
- GA is production-only through `IS_GA_ENABLED`.
- Default Measurement ID is hardcoded: `G-NPX863DEQL` in `lib/analytics.ts`.
- Client-side navigation page views are tracked in `GoogleAnalyticsPageView`.
- Click events are tracked in `GoogleAnalyticsInteractions`.

### Current events

| Event | Source | Notes |
|---|---|---|
| `buy_tickets_click` | Luma links | Includes `link_url`, `link_text`, `page_path`, `luma_event_id`. |
| `submit_film_click` | FilmFreeway links | Includes outbound link params. |
| `email_signup` | Brevo form submit | Captures form ID/action/placement/page path. |
| `instagram_click` | Keenan Instagram link | Tracks founder Instagram outbound click. |
| `originals_form_started` | Originals form | Starts when user changes fields. |
| `originals_form_completed` | Originals form | Fires before checkout attempt. |
| `originals_checkout_started` | Originals form/retry | Fires before redirect to Stripe. |
| `originals_payment_completed` | Success page | Fires only if server verifies paid submission via cookie/Supabase. |

### Measurement gaps

- No Search Console verification values confirmed.
- `.env.example` does not include `NEXT_PUBLIC_GA_MEASUREMENT_ID`, even though code supports it.
- Hardcoded default GA ID works, but public env var is cleaner for deployment.
- No privacy policy or cookie/analytics disclosure found.
- No Luma completed-purchase tracking unless Luma/GA integration is configured externally.
- No FilmFreeway completed-submission tracking unless FilmFreeway provides conversion callbacks or reports.
- No UTM preservation into Luma or FilmFreeway URLs.
- No scroll depth tracking.
- No video play/progress tracking.
- Sponsor inquiry form is client-only and not tracked as a conversion.
- No Meta Pixel found.
- No Vercel Analytics found.

### Recommended events to add later

- `ticket_checkout_opened`
- `ticket_purchase_completed` if Luma can send it or if server-side integration exists.
- `submit_film_outbound_click`
- `filmfreeway_submission_completed` if externally available.
- `originals_application_started`
- `originals_application_validated`
- `originals_checkout_started`
- `originals_payment_completed`
- `newsletter_signup`
- `sponsor_inquiry_submitted`
- `video_play`, `video_25`, `video_50`, `video_75`, `video_complete`
- `scroll_depth_50`, `scroll_depth_90`
- `instagram_click`
- `external_partner_click`

## External Authority and Backlink Strategy

### Easy wins

- Complete and optimize the Luma event page.
- Ask participating filmmakers and performers to link to Filmshow.
- Add Filmshow to filmmaker bios and project pages.
- Add links from Bluebird if partnership is public.
- Add event to venue calendar once venue is confirmed.

### Partner-driven opportunities

- Venue website.
- Sponsors.
- Local film collectives.
- Theater/performance groups.
- Film schools and student newsletters.
- Production companies or collaborators.

### Press opportunities

- Brooklyn Magazine.
- Greenpointers, if neighborhood applies.
- Williamsburg/Greenpoint neighborhood blogs if venue applies.
- The Skint.
- Time Out New York.
- Gothamist/WNYC events.
- Nonsense NYC.
- Local arts podcasts/newsletters.

### Long-term authority building

- Event archive with selected films.
- Filmmaker interviews.
- Winner announcements.
- Behind-the-scenes photo essays.
- Press kit.
- Local guide pages only when they are genuinely useful.

### Tactics to avoid

- Generic directory spam.
- Keyword-stuffed neighborhood pages without real venue relevance.
- Fake “film festival” positioning if Filmshow is intentionally not a festival.
- Schema claims that are not visible or confirmed.
- Invented awards, press, attendance, or partners.

## Competitive Positioning

Using only repository evidence, Filmshow’s strongest differentiators are:

- Short films plus live experimental theater.
- Local filmmakers.
- Audience participation and live voting.
- A curated live-event experience.
- Brooklyn/NYC underground arts identity.
- Strong visual brand.
- “This is not a festival” / “Not A Film Screening” anti-category positioning.
- Originals: funding an unmade short film.

Search weakness: the creative positioning is strong but needs factual reinforcement. “Underground,” “exhibition,” “not a screening,” and “not a festival” are memorable, but Google also needs clear answers: what, where, when, who, tickets, submit, deadline, venue, price.

## Prioritized Remediation Roadmap

### Critical

| Priority | Task | Affected page/file | Reason | Expected benefit | Complexity | Visual impact | Risk | Dependencies | Success measurement |
|---|---|---|---|---|---|---|---|---|---|
| Critical | Noindex Originals success page | `app/originals/success/page.tsx` | Prevent thin/private confirmation route from indexing | Cleaner index | Small | None | Low | None | URL Inspection shows noindex; page absent from index |
| Critical | Correct stale prize language if no longer accurate | `lib/seo.ts`, `app/page.tsx`, `app/tickets/page.tsx`, `README.md` | Avoid misleading metadata/schema/copy | Better trust and snippet accuracy | Small | None/Minor | Low | Final prize policy | No stale prize terms in codebase |
| Critical | Complete event data before launch | `lib/seo.ts`, `/tickets`, future event page | Event search needs full date/time/location/offers | Major event visibility | Medium | Minor | Medium if details change | Venue/time/price | Rich Results Test validates Event |

### High impact

| Priority | Task | Affected page/file | Reason | Expected benefit | Complexity | Visual impact | Risk | Dependencies | Success measurement |
|---|---|---|---|---|---|---|---|---|---|
| High | Create stable event page | New `/events/filmshow-vol-1` | Better event SEO than homepage/tickets alone | Higher event discovery and conversions | Medium | Minor/Significant depending design | Low | Event details | Event page impressions/clicks |
| High | Create dedicated Submit page | New `/submit` | Homepage section cannot rank as a submission landing page | More filmmaker traffic | Medium | Minor | Low | Submission rules/deadline/fee | Organic queries for submission terms |
| High | Strengthen `/tickets` and link CTAs to it contextually | `/tickets`, `components/site-header.tsx`, homepage | High-intent visitors need facts before checkout | Better conversion and crawl value | Small/Medium | Minor | Medium if CTA flow changes | Ticket policy | Ticket-page organic traffic and CTA click rate |
| High | Add FAQPage schema for Originals | `/originals` | Existing FAQ is useful but not marked up | Better answer-engine clarity | Small | None | Low | Confirm answers | Rich Results Test |
| High | Optimize hero video delivery | `components/hero-trailer.tsx`, `public/videos/*` | 56MB hero media is performance risk | Better LCP/mobile performance | Medium | None/Minor | Medium | Re-export video | Lighthouse LCP and total bytes |
| High | Add local venue/neighborhood block | `/tickets`, event page, schema | Local search needs exact place | Better local discovery | Small | Minor | Low | Venue confirmed | Local query impressions |

### Medium impact

| Priority | Task | Affected page/file | Reason | Expected benefit | Complexity | Visual impact | Risk | Dependencies | Success measurement |
|---|---|---|---|---|---|---|---|---|---|
| Medium | Expand About page with founder/context | `/about`, `lib/seo.ts` | Entity trust and AI answers | Better brand/entity understanding | Small/Medium | Minor | Low | Founder-approved copy | Branded/entity query performance |
| Medium | Add page-specific OG images | `lib/seo.ts`, `public/images/*` | Better social previews | Better share conversion | Medium | None | Low | Assets | Social debugger previews |
| Medium | Add video transcript/summary | Homepage hero | Crawlers cannot understand video | Better accessibility and AI visibility | Small/Medium | Minor | Low | Transcript | Accessibility and content depth |
| Medium | Add labels to sponsor form | `components/sponsor-inquiry-form.tsx` | Accessibility and form usability | Better UX | Small | None/Minor | Low | None | Accessibility checks |
| Medium | Add UTM preservation to outbound Luma/FilmFreeway | `components/luma-checkout-link.tsx`, submit links | Better attribution | Better campaign measurement | Medium | None | Low | Analytics plan | GA campaign attribution |
| Medium | Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to env example | `.env.example`, deployment docs | Cleaner production setup | Lower analytics config risk | Small | None | Low | None | Environment parity |

### Low impact

| Priority | Task | Affected page/file | Reason | Expected benefit | Complexity | Visual impact | Risk | Dependencies | Success measurement |
|---|---|---|---|---|---|---|---|---|---|
| Low | Remove unused legacy assets | `public/images/*`, `public/videos/*` | Repo cleanliness/performance hygiene | Smaller deploy/repo | Small | None | Low | Confirm unused | Bundle/deploy size |
| Low | Update README | `README.md` | Avoid stale public repo/AI signals | Cleaner external docs | Small | None | Low | Current event policy | No stale claims |
| Low | Add `sameAs` links | `lib/seo.ts` | Entity consistency | Better knowledge graph support | Small | None | Low | Official URLs | Schema validation |
| Low | Consider 1200x630 social preview | `public/images/*`, `lib/seo.ts` | Better cropping | Better link cards | Small/Medium | None | Low | Asset | Social debugger previews |

## Implementation Phases

### Phase 1: Technical Foundation

1. Noindex `/originals/success`.
2. Remove or correct stale prize/cash-prize language.
3. Add complete event schema fields as soon as venue/time/price are known.
4. Confirm domain redirects and preview noindex policy.
5. Compress hero video and large CSS background images.
6. Add labels to sponsor form.
7. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` to `.env.example`.

Expected score after Phase 1: **70 / 100**.

### Phase 2: Content, Event, Local, and Conversion Optimization

1. Create stable event page for Filmshow Vol. 1.
2. Create dedicated Submit page for completed short-film submissions.
3. Strengthen `/tickets` with exact facts and contextual internal links.
4. Expand `/about` with founder and local mission.
5. Add FAQPage schema to `/originals` and future `/submit`.
6. Add local venue/neighborhood block when confirmed.
7. Add page-specific social previews.

Expected score after Phases 1 and 2: **82 / 100**.

### Phase 3: Authority, Editorial Growth, and Advanced Optimization

1. Build event archive.
2. Add selected film and filmmaker pages.
3. Add winner announcements and interviews.
4. Add press/partner page.
5. Build local backlinks through venue, filmmakers, performers, schools, calendars, sponsors, and press.
6. Add advanced analytics attribution for Luma, FilmFreeway, Stripe, video, and scroll depth.

Realistic maximum score after all recommended work: **90 / 100**. The remaining 10 points depend on live field data, backlinks, event details, press, and real-world authority.

## Final Verdict

1. Current overall SEO score: **56 / 100**
2. Realistic score after Phase 1: **70 / 100**
3. Realistic score after Phases 1 and 2: **82 / 100**
4. Realistic maximum score after all recommended work: **90 / 100**

### Five biggest weaknesses

1. Incomplete event details and incomplete Event schema.
2. Stale or conflicting prize/brand language across metadata, schema, page copy, and README.
3. No dedicated event archive or standalone submit landing page.
4. Weak local specificity beyond “Brooklyn/NYC.”
5. Very heavy hero media and missing video SEO/transcript support.

### Five strongest existing elements

1. Strong visual identity and memorable positioning.
2. Centralized metadata utility in `lib/seo.ts`.
3. Crawlable text content despite cinematic design.
4. GA4 and custom event tracking foundation.
5. Clear Originals program page with real FAQ and conversion flow.

### Ten highest-return actions

1. Noindex `/originals/success`.
2. Add exact event time, venue, address, price, and availability.
3. Create a stable Filmshow Vol. 1 event page.
4. Correct stale cash-prize language if it is no longer accurate.
5. Compress and reformat hero video.
6. Create a dedicated Submit page.
7. Strengthen `/tickets` and link to it internally.
8. Add FAQPage and richer Event schema.
9. Add venue/neighborhood/local context once confirmed.
10. Build event archive after Vol. 1.

### Single most important action to take first

**Noindex `/originals/success` and clean up stale/misleading metadata/schema language.** This is small, safe, and prevents low-quality or inaccurate search signals.

### Single biggest missed opportunity

**Filmshow does not yet have a stable, fully detailed event page.** That one page could serve ticket buyers, Google event discovery, local search, social previews, and AI answer engines at the same time.

### Blunt assessment

Filmshow is **technically indexable but under-optimized**. It is not fundamentally broken. The site has a strong brand and a crawlable foundation, but event SEO, local SEO, submission SEO, and media performance are materially limiting its discovery potential.

## Audit Confirmation

- No production website files were changed during this audit.
- Nothing was deployed.
- This was audit-only.
- `SEO-AUDIT.md` is the only file intentionally changed for this audit deliverable.
- Pre-existing uncommitted site changes were present before the audit in `app/globals.css`, `app/page.tsx`, and `public/images/originals/`; they were not part of this audit work.

## Files Inspected

- `.env.example`
- `.gitignore`
- `README.md`
- `SEO-AUDIT.md` previous version
- `app/about/page.tsx`
- `app/api/originals/checkout/route.ts`
- `app/api/originals/retry-checkout/route.ts`
- `app/api/stripe/originals/webhook/route.ts`
- `app/globals.css`
- `app/how-it-works/page.tsx`
- `app/layout.tsx`
- `app/originals/originals-application-form.tsx`
- `app/originals/page.tsx`
- `app/originals/success/page.tsx`
- `app/originals/success/success-analytics.tsx`
- `app/page.tsx`
- `app/robots.ts`
- `app/sitemap.ts`
- `app/sponsors/page.tsx`
- `app/tickets/page.tsx`
- `components/brevo-signup.tsx`
- `components/button-link.tsx`
- `components/google-analytics-interactions.tsx`
- `components/google-analytics-page-view.tsx`
- `components/hero-trailer.tsx`
- `components/json-ld.tsx`
- `components/luma-checkout-link.tsx`
- `components/motion-effects.tsx`
- `components/photo-gallery.tsx`
- `components/plastic-card.tsx`
- `components/route-scroll-manager.tsx`
- `components/scroll-fade-video.tsx`
- `components/site-footer.tsx`
- `components/site-header.tsx`
- `components/sponsor-inquiry-form.tsx`
- `eslint.config.mjs`
- `lib/analytics.ts`
- `lib/google-analytics-events.ts`
- `lib/luma.ts`
- `lib/originals-config.ts`
- `lib/originals-email.ts`
- `lib/originals.ts`
- `lib/rate-limit.ts`
- `lib/seo.ts`
- `lib/stripe-originals.ts`
- `lib/supabase-originals.ts`
- `next.config.ts`
- `package.json`
- `public/site.webmanifest`
- `public/images/*`
- `public/images/hero/*`
- `public/images/optimized/*`
- `public/images/originals/*`
- `public/videos/*`
- `supabase/migrations/20260727000000_create_originals_submissions.sql`
- `supabase/migrations/20260727001000_add_confirmation_email_sent_at_to_originals.sql`
- `tsconfig.json`

## Areas Not Verified

- Live HTTP status codes.
- Live redirect behavior for `http`, non-www, www, Vercel preview, and staging URLs.
- Live robots/sitemap output after deployment.
- Google indexed pages.
- Google Search Console coverage, queries, enhancements, or manual actions.
- GA4 Realtime/DebugView.
- Luma checkout completion attribution.
- FilmFreeway submission completion attribution.
- Stripe production webhook behavior.
- Brevo production signup success.
- Real Lighthouse scores.
- Real Core Web Vitals field data.
- External backlink profile.
- Whether venue, price, event time, and prize/submission details are final.

## Tools or Account Access Required for Deeper Verification

- Google Search Console.
- GA4 Realtime and DebugView.
- PageSpeed Insights.
- Lighthouse mobile and desktop.
- Chrome DevTools network trace on production.
- Vercel Analytics and deployment settings.
- Vercel redirect/domain configuration.
- Luma event analytics.
- FilmFreeway listing/submission analytics.
- Stripe dashboard and webhook logs.
- Brevo form analytics.
- Social preview debuggers for Facebook, X, LinkedIn, Slack, and iMessage-style unfurls.
- Schema.org validator and Google Rich Results Test on the deployed production URLs.
