import { JsonLd } from "@/components/json-ld";
import {
  buildWebPageJsonLd,
  createPageMetadata,
  routeMetadata,
} from "@/lib/seo";

const USA_NEWS_ARTICLE_URL =
  "https://usanews.com/newsroom/filmshow-turns-short-films-into-a-night-out";

export const metadata = createPageMetadata(routeMetadata.news);

export default function NewsPage() {
  return (
    <main className="hero-pad news-page">
      <JsonLd data={buildWebPageJsonLd(routeMetadata.news)} />

      <section className="container-page news-page-hero">
        <p className="copy-wide small-label text-red-500 news-page-eyebrow">
          Filmshow • News
        </p>
        <h1 className="section-kicker max-w-5xl text-stone-100">
          Filmshow turns short films into a night out.
        </h1>
        <p className="body-copy mt-8 max-w-3xl text-stone-300">
          Read the USA News feature below.
        </p>
      </section>

      <section
        className="container-page news-article-section"
        aria-label="USA News article"
      >
        <div className="news-article-frame-shell">
          <iframe
            src={USA_NEWS_ARTICLE_URL}
            title="USA News article: Filmshow Turns Short Films Into a Night Out"
            className="news-article-frame"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
        <div className="news-article-fallback">
          <p className="body-copy text-stone-500">
            If the article does not load here, open it directly on USA News.
          </p>
          <a
            href={USA_NEWS_ARTICLE_URL}
            className="button-shift header-cta header-cta--tickets"
          >
            Open article
          </a>
        </div>
      </section>
    </main>
  );
}
