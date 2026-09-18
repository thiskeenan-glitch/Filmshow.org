import Image from "next/image";
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
        <a
          href={USA_NEWS_ARTICLE_URL}
          className="news-article-preview"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="news-article-preview-image-wrap">
            <Image
              src="/images/news/filmshow-usa-news.jpg"
              alt="Filmshow featured by USA News"
              fill
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="news-article-preview-image"
            />
          </div>
          <div className="news-article-preview-copy">
            <p className="copy-wide small-label text-red-300">
              USA News • Lifestyle • August 5, 2026
            </p>
            <h2 className="news-article-preview-title text-stone-100">
              Filmshow Turns Short Films Into A Night Out
            </h2>
            <p className="body-copy text-stone-300">
              Filmshow brings local films, live theater, and audience voting to
              Brooklyn&apos;s independent cinema scene.
            </p>
            <span className="news-article-preview-cta">Read the full article</span>
          </div>
        </a>
      </section>
    </main>
  );
}
