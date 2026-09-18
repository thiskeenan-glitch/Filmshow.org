import Image from "next/image";
import { JsonLd } from "@/components/json-ld";
import {
  buildWebPageJsonLd,
  createPageMetadata,
  routeMetadata,
} from "@/lib/seo";

const articles = [
  {
    publication: "Greenpointers",
    category: "Culture",
    date: "September 14, 2026",
    title:
      "New Festival Filmshow Brings Shorts, and Live Performances, to Rollin Studios This Fall",
    summary:
      "Greenpointers previews Filmshow's mix of short films, live performance, audience voting, and a $1,000 filmmaker prize.",
    image: "/images/lots-of-people.jpg",
    alt: "Audience gathered for Filmshow at Rollin Studios",
    url: "https://greenpointers.com/2026/09/14/new-festival-filmshow-brings-shorts-and-live-performances-to-rollin-studios-this-fall/",
  },
  {
    publication: "USA News",
    category: "Lifestyle",
    date: "August 5, 2026",
    title: "Filmshow Turns Short Films Into A Night Out",
    summary:
      "Filmshow brings local films, live theater, and audience voting to Brooklyn's independent cinema scene.",
    image: "/images/news/filmshow-usa-news.jpg",
    alt: "Filmshow featured by USA News",
    url: "https://usanews.com/newsroom/filmshow-turns-short-films-into-a-night-out",
  },
] as const;

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
          Filmshow in the news.
        </h1>
        <p className="body-copy mt-8 max-w-3xl text-stone-300">
          Read the latest coverage below.
        </p>
      </section>

      <section
        className="container-page news-article-section"
        aria-label="Filmshow press coverage"
      >
        <div className="news-article-list">
          {articles.map((article) => (
            <a
              href={article.url}
              className="news-article-preview"
              target="_blank"
              rel="noopener noreferrer"
              key={article.url}
            >
              <div className="news-article-preview-image-wrap">
                <Image
                  src={article.image}
                  alt={article.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="news-article-preview-image"
                />
              </div>
              <div className="news-article-preview-copy">
                <p className="copy-wide small-label text-red-300">
                  {article.publication} • {article.category} • {article.date}
                </p>
                <h2 className="news-article-preview-title text-stone-100">
                  {article.title}
                </h2>
                <p className="body-copy text-stone-300">{article.summary}</p>
                <span className="news-article-preview-cta">
                  Read the full article
                </span>
              </div>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
