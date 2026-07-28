import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceRoots = ["app", "components", "lib", "public/site.webmanifest"];
const failures = [];

function readText(path) {
  return readFileSync(join(root, path), "utf8");
}

function collectFiles(path) {
  const fullPath = join(root, path);
  const stat = statSync(fullPath);

  if (stat.isFile()) return [path];

  return readdirSync(fullPath).flatMap((entry) => collectFiles(join(path, entry)));
}

const sourceFiles = sourceRoots
  .flatMap(collectFiles)
  .filter((file) => /\.(tsx?|jsx?|json|webmanifest)$/.test(file));

function assert(condition, message) {
  if (!condition) failures.push(message);
}

for (const file of sourceFiles) {
  const text = readText(file);
  const productionSource = !file.endsWith("next.config.ts");

  if (productionSource) {
    assert(!/localhost|127\.0\.0\.1/.test(text), `${file} contains a development URL.`);
  }

  assert(!/Film Show is|The Film Show|Keenan Gray Filmshow/.test(text), `${file} contains outdated brand spelling.`);
  assert(!/\$6,000|\$5,000|\$14|cash prize|soundstage we were on/i.test(text), `${file} contains stale prize language.`);
}

const analyticsSource = readText("lib/analytics.ts");
assert(!/G-[A-Z0-9]{8,}/.test(analyticsSource), "lib/analytics.ts hardcodes a GA measurement ID.");
assert(
  analyticsSource.includes("NEXT_PUBLIC_GA_MEASUREMENT_ID"),
  "lib/analytics.ts does not use NEXT_PUBLIC_GA_MEASUREMENT_ID.",
);

const successPageSource = readText("app/originals/success/page.tsx");
assert(
  /index:\s*false/.test(successPageSource) && /follow:\s*false/.test(successPageSource),
  "The Originals success page is missing noindex/nofollow metadata.",
);

const seoSource = readText("lib/seo.ts");
const titles = [...seoSource.matchAll(/title:\s*"([^"]+)"/g)].map((match) => match[1]);
const descriptions = [...seoSource.matchAll(/description:\s*"([^"]+)"/g)].map(
  (match) => match[1],
);

assert(
  titles.length === new Set(titles).size,
  "Route metadata contains duplicate titles.",
);
assert(
  descriptions.length === new Set(descriptions).size,
  "Route metadata contains duplicate descriptions.",
);
assert(
  !seoSource.includes("/originals/success"),
  "The noindex Originals success page should not be in route metadata or sitemap routes.",
);

const globalCssSource = readText("app/globals.css");
assert(
  !globalCssSource.includes("filmshow-originals-bg.png"),
  "app/globals.css still references the oversized Originals PNG background.",
);
assert(
  globalCssSource.includes("filmshow-originals-bg-optimized.jpg"),
  "app/globals.css does not reference the optimized Originals background.",
);

if (failures.length) {
  console.error("SEO regression check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("SEO regression check passed.");
