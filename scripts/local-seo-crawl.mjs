const baseUrl = (process.env.FILMSHOW_CRAWL_BASE_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);
const expectedGaId = process.env.FILMSHOW_CRAWL_EXPECT_GA_ID?.trim() || "";

const routes = ["/", "/tickets", "/about", "/sponsors"];
const privateRoutes = ["/originals/success"];
const failures = [];

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function matchAll(regex, text) {
  return [...text.matchAll(regex)].map((match) => match[1]);
}

function getAttr(tag, attr) {
  return tag.match(new RegExp(`${attr}=["']([^"']+)["']`, "i"))?.[1] || "";
}

async function fetchText(path) {
  const response = await fetch(`${baseUrl}${path}`, { redirect: "manual" });
  const text = await response.text();

  return { response, text };
}

for (const route of routes) {
  const { response, text } = await fetchText(route);

  assert(response.status === 200, `${route} returned ${response.status}.`);

  const title = text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim();
  const descriptionTag = text.match(/<meta[^>]+name=["']description["'][^>]*>/i)?.[0] || "";
  const canonicalTag = text.match(/<link[^>]+rel=["']canonical["'][^>]*>/i)?.[0] || "";
  const h1s = matchAll(/<h1\b[^>]*>/gi, text);
  const jsonLdBlocks = matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
    text,
  );

  assert(Boolean(title), `${route} is missing a title.`);
  assert(Boolean(getAttr(descriptionTag, "content")), `${route} is missing a meta description.`);
  assert(getAttr(canonicalTag, "href").startsWith("https://www.filmshow.org"), `${route} has an invalid canonical.`);
  assert(h1s.length === 1, `${route} should have exactly one H1; found ${h1s.length}.`);

  if (expectedGaId) {
    assert(text.includes(expectedGaId), `${route} is missing the expected GA measurement ID.`);
  }

  for (const block of jsonLdBlocks) {
    try {
      JSON.parse(block.replace(/\\u003c/g, "<"));
    } catch {
      failures.push(`${route} contains invalid JSON-LD.`);
    }
  }
}

for (const route of privateRoutes) {
  const { response, text } = await fetchText(route);

  assert(response.status === 200, `${route} returned ${response.status}.`);
  assert(/name=["']robots["'][^>]+content=["'][^"']*noindex/i.test(text), `${route} is missing noindex robots metadata.`);
}

const sitemap = await fetchText("/sitemap.xml");
assert(sitemap.response.status === 200, "/sitemap.xml did not return 200.");
assert(!sitemap.text.includes("/api/"), "Sitemap includes API routes.");
assert(!sitemap.text.includes("/originals/success"), "Sitemap includes the Originals success page.");
for (const route of routes) {
  assert(sitemap.text.includes(`https://www.filmshow.org${route === "/" ? "" : route}`), `Sitemap is missing ${route}.`);
}

const robots = await fetchText("/robots.txt");
assert(robots.response.status === 200, "/robots.txt did not return 200.");
assert(robots.text.includes("Sitemap: https://www.filmshow.org/sitemap.xml"), "robots.txt has an invalid sitemap URL.");

if (failures.length) {
  console.error(`SEO crawl failed against ${baseUrl}:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`SEO crawl passed against ${baseUrl}.`);
