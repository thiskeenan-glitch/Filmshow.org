# Filmshow SEO Audit

Audit date: 2026-07-17

## Critical

### Missing crawl files
- What was wrong: The project did not expose a dedicated `robots.txt` or `sitemap.xml`.
- Why it matters: Search engines need a clean list of public routes and a clear crawl policy.
- What changed: Added Next.js metadata routes at `app/robots.ts` and `app/sitemap.ts`.
- Manual action: Submit `https://www.filmshow.org/sitemap.xml` in Google Search Console and Bing Webmaster Tools after deployment.

### Thin and duplicated metadata
- What was wrong: Route metadata repeated the same generic social title and description, and major pages did not have unique search titles.
- Why it matters: Duplicate titles and descriptions make pages harder to distinguish in search results.
- What changed: Added centralized SEO configuration in `lib/seo.ts` and unique metadata for home, tickets, how-it-works, about, and sponsors.
- Manual action: Re-check live snippets after Google recrawls; search engines may rewrite titles.

### Structured data was incomplete
- What was wrong: JSON-LD only covered a minimal Organization/Event graph and did not include WebSite or breadcrumbs.
- Why it matters: Structured data helps search engines understand Filmshow as an organization, website, and event.
- What changed: Added Organization, WebSite, and Event schema on the homepage, plus BreadcrumbList schema on internal pages.
- Manual action: Add exact venue name, street address, ticket price, start time, end time, and official Filmshow social profiles when confirmed.

## High Impact

### Social sharing metadata
- What was wrong: Social metadata was split across route files and was using heavier preview assets.
- Why it matters: iMessage, Slack, Facebook, X, and similar platforms depend on Open Graph and Twitter/X tags.
- What changed: Centralized `og:title`, `og:description`, `og:url`, `og:site_name`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`.
- Manual action: Refresh cached previews in platform debuggers after deployment.

### Oversized social image
- What was wrong: The poster artwork used for sharing was 8.6 MB.
- Why it matters: Large social images can slow previews and create inconsistent link cards.
- What changed: Created `public/images/filmshow-social-preview.jpg`, a 1200x1200 social image based on the same artwork.
- Manual action: Consider creating a dedicated 1200x630 crop later if you want a more cinematic horizontal card.

### Weak Brooklyn and NYC context
- What was wrong: The site used mostly generic NYC language and did not clearly establish Brooklyn relevance.
- Why it matters: Filmshow wants discovery for Brooklyn, NYC, short-film, and live-event searches.
- What changed: Added natural Brooklyn context to metadata, homepage copy, tickets, about, and how-it-works without keyword stuffing.
- Manual action: Add Greenpoint only if the event neighborhood is confirmed.

### Internal linking gaps
- What was wrong: Public pages were partly orphaned from the main experience.
- Why it matters: Internal links help users and crawlers understand site structure.
- What changed: Added contextual links from the homepage to Tickets and How It Works, from How It Works to Tickets and submissions, from About to How It Works, and a restrained footer nav.
- Manual action: If standalone Submit or Gallery pages are added later, include them in the footer and sitemap.

### Search Console readiness
- What was wrong: There was no verification-tag support.
- Why it matters: Verification is required for Search Console and Bing Webmaster Tools.
- What changed: Added support for `GOOGLE_SITE_VERIFICATION` and `BING_SITE_VERIFICATION` environment variables in Next metadata.
- Manual action: Set the real tokens in the hosting environment. Do not commit fake tokens.

## Medium Impact

### Heading hierarchy
- What was wrong: One tickets section heading was styled as a paragraph.
- Why it matters: Logical headings help crawlers and assistive technology parse page structure.
- What changed: Converted the tickets “What the night includes” label to an `h2`. Confirmed routed pages each have one clear `h1`.
- Manual action: Keep future section titles semantic, not just visually styled.

### Image SEO
- What was wrong: Some meaningful images were large, and the social preview image was oversized.
- Why it matters: Image size affects Core Web Vitals, while descriptive alt text helps accessibility and image understanding.
- What changed: Added/kept descriptive alt text for meaningful images, lazy-loaded the gallery, added stable dimensions to the hero backdrop, and optimized the social image.
- Manual action: Re-export the largest gallery originals with a reliable image pipeline. Two attempted local gallery exports rendered blank and were not kept.

### Core Web Vitals risks
- What was wrong: The homepage relies on a large hero video and several rich images.
- Why it matters: Video and image weight can hurt LCP and mobile performance.
- What changed: Confirmed the hero video uses a poster and `preload="metadata"`, lazy-loaded gallery images, and reduced the social preview image weight.
- Manual action: Consider generating a smaller web-optimized hero video. The current autoplay-with-sound behavior is intentionally preserved because it was requested.

### Manifest metadata
- What was wrong: The manifest description was generic.
- Why it matters: App metadata should match the current brand/search positioning.
- What changed: Updated `public/site.webmanifest` with the current social title and description.
- Manual action: Re-test installed-app previews if the site is ever used as a PWA.

## Optional

### Local discovery listings
- What was wrong: Code alone cannot place Filmshow in local discovery surfaces.
- Why it matters: Brooklyn and NYC event discovery often happens through local calendars and listings.
- What changed: No code change needed.
- Manual action: Consider Google Business Profile only if Filmshow qualifies, Bing Places, Luma/Eventbrite listings, Time Out New York, The Skint, Brooklyn event calendars, Greenpointers, local arts calendars, and short-film event directories.

### Future indexable content
- What was wrong: The site is intentionally minimal and has limited indexable depth.
- Why it matters: Useful, real pages can build relevance without making the homepage feel crowded.
- What changed: No placeholder pages were added.
- Manual action: Consider future pages for upcoming Filmshow events, past events, selected films, winners, filmmaker interviews, a Brooklyn short-film guide, how the Filmshow audience vote works, submission deadlines, and press.

### Standalone Submit and Gallery pages
- What was wrong: Submit and Photos are homepage sections, so they cannot have separate page metadata or appear separately in the sitemap.
- Why it matters: Standalone pages could target “short film submissions” and “Brooklyn short-film event photos” more directly.
- What changed: Left the current architecture intact and improved the homepage sections.
- Manual action: Build real standalone pages only when there is enough useful content.

## Search Console Setup

1. Add `filmshow.org` as a domain property in Google Search Console.
2. Verify ownership using the DNS method, or set `GOOGLE_SITE_VERIFICATION` if using the HTML meta-tag method.
3. Submit `https://www.filmshow.org/sitemap.xml`.
4. Inspect `https://www.filmshow.org`.
5. Request indexing for the homepage after deployment.
6. Repeat for key routes: `/tickets`, `/how-it-works`, `/about`, and `/sponsors`.
7. Add the site to Bing Webmaster Tools.
8. Set `BING_SITE_VERIFICATION` if using Bing’s meta-tag method.
9. Submit the sitemap in Bing.
10. Monitor indexing, impressions, queries, and crawl errors over the next few weeks.

## Missing Event Details

Add these when confirmed:
- Venue name
- Street address
- Start time
- End time
- Ticket price
- Ticket availability status if it changes
- Official Filmshow social profile URLs
- Confirmed neighborhood, such as Greenpoint, only if accurate

## Pages Still Thin

- Sponsors: useful enough for sponsors, but thin for organic search unless sponsorship is a real acquisition channel.
- About: improved, but could rank better with founder context, press mentions, or a concise Filmshow origin story.
- How It Works: useful, but could become stronger if the selection and audience-vote process are explained with real event details.
- Submit: currently a homepage section, not a standalone page.
- Gallery: currently a homepage section, not a standalone page.

## Validation Notes

- External links to Luma, FilmFreeway, and Instagram should be checked manually after deployment.
- Search ranking and indexing are not guaranteed by these changes.
- Structured data should be tested in Google Rich Results Test once the changes are live.
