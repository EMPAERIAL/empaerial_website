"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import useBlogs from "@/hooks/useBlogs";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import styles from "./BlogPost.module.css";

const WORDS_PER_MINUTE = 220;
const RELATED_POST_LIMIT = 3;

/*
 * Recharts writes these onto SVG presentation attributes, where `var()` is not
 * reliably resolved — so the atmospheric chart palette is mirrored here from the
 * `--blog-chart-*` tokens in globals.css. Keep both sides in sync.
 */
const CHART_THEME = {
  line: "#fff",
  grid: "rgba(255, 255, 255, 0.08)",
  axis: "rgba(255, 255, 255, 0.35)",
  tooltipBg: "rgba(0, 0, 0, 0.88)",
  tooltipBorder: "rgba(255, 255, 255, 0.16)",
};

function parseJsonList(value) {
  if (!value) return [];

  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseGraphData(value) {
  if (!value) return null;

  try {
    return typeof value === "string" ? JSON.parse(value) : value;
  } catch {
    return null;
  }
}

function getBlogDetailCopy(detailT) {
  return {
    back: detailT?.back || "Back to Blogs",
    blogsCrumb: detailT?.blogs_crumb || "Blogs",
    postTag: detailT?.post_tag || "Post",
    readCta: detailT?.read_cta || "Read Article",
    entryTag: detailT?.entry_tag || "Journal Entry",
    journalTag: detailT?.journal_tag || "EMPAERIAL JOURNAL",
    loading: detailT?.loading || "Loading entry...",
    notFound: detailT?.not_found || "Entry not found.",
    heroPlaceholder: detailT?.hero_placeholder || "Cover media pending.",
    articleEmpty: detailT?.article_empty || "Field notes pending.",
    galleryEmpty: detailT?.gallery_empty || "Visual log pending.",
    authorFallback: detailT?.author_fallback || "EMPAERIAL Team",
    readUnit: detailT?.read_unit || "min",
    moreHeading: detailT?.more_heading || "Keep reading the journal.",
    moreText:
      detailT?.more_text ||
      "Field notes, build logs, and flight-test debriefs from the EMPAERIAL workshop.",
    allPosts: detailT?.all_posts || "All Posts",
    contactSection: detailT?.contact_section || "Contact Section",
    metaLabels: {
      author: detailT?.meta_labels?.author || "Author",
      date: detailT?.meta_labels?.date || "Date",
      read: detailT?.meta_labels?.read || "Read",
    },
    sectionLabels: {
      article: detailT?.section_labels?.article || "Article",
      gallery: detailT?.section_labels?.gallery || "Gallery",
      data: detailT?.section_labels?.data || "Data",
      feature: detailT?.section_labels?.feature || "Feature Video",
      videos: detailT?.section_labels?.videos || "Videos",
      more: detailT?.section_labels?.more || "Continue",
    },
  };
}

function getEmbedUrl(url) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

function isEmbeddable(url) {
  return url.includes("youtube") || url.includes("youtu.be");
}

function getPublishedDate(blog) {
  const raw = blog?.created_at || blog?.inserted_at || blog?.date;
  if (!raw) return null;

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatPublishedDate(date, lang) {
  if (!date) return "-";

  try {
    return new Intl.DateTimeFormat(lang === "tr" ? "tr-TR" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function getReadingMinutes(content) {
  const words = String(content || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return words ? Math.max(1, Math.round(words / WORDS_PER_MINUTE)) : 0;
}

function buildExcerpt(content, limit = 190) {
  const clean = String(content || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  if (clean.length <= limit) return clean;

  const truncated = clean.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${truncated.slice(0, lastSpace > 80 ? lastSpace : limit)}...`;
}

export default function BlogPost() {
  const { slug } = useParams();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [selectedImage, setSelectedImage] = useState(null);
  const { blogs, loading } = useBlogs();
  const t = lang === "tr" ? tr : en;
  const copy = useMemo(() => getBlogDetailCopy(t.blog_detail), [t]);

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  useEffect(() => {
    if (!selectedImage) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setSelectedImage(null);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedImage]);

  const blog = useMemo(
    () => blogs.find((item) => item.slug === slug) || null,
    [blogs, slug]
  );

  const blogIndex = useMemo(() => {
    const position = blogs.findIndex((item) => item.slug === slug);
    return position >= 0 ? position + 1 : 1;
  }, [blogs, slug]);

  const relatedPosts = useMemo(() => {
    if (!blogs.length) return [];

    const position = blogs.findIndex((item) => item.slug === slug);
    if (position < 0) return blogs.slice(0, RELATED_POST_LIMIT);

    return Array.from(
      { length: Math.min(RELATED_POST_LIMIT, blogs.length - 1) },
      (_, offset) => blogs[(position + offset + 1) % blogs.length]
    );
  }, [blogs, slug]);

  const parsed = useMemo(
    () => ({
      graphData: parseGraphData(blog?.graph_data),
      gallery: parseJsonList(blog?.gallery_images).filter(Boolean),
      videos: parseJsonList(blog?.videos).filter(Boolean),
    }),
    [blog]
  );

  const graphRows = useMemo(() => {
    const labels = parsed.graphData?.labels;
    if (!Array.isArray(labels)) return [];

    return labels.map((label, index) => ({
      label,
      value: parsed.graphData?.values?.[index],
    }));
  }, [parsed.graphData]);

  const sections = useMemo(() => {
    const items = [{ id: "entry-article", type: "article" }];

    if (parsed.gallery.length)
      items.push({ id: "entry-gallery", type: "gallery" });
    if (graphRows.length) items.push({ id: "entry-data", type: "data" });
    if (blog?.video_url) items.push({ id: "entry-feature", type: "feature" });
    if (parsed.videos.length)
      items.push({ id: "entry-videos", type: "videos" });

    return items.map((item, index) => ({
      ...item,
      index,
      label: copy.sectionLabels[item.type],
    }));
  }, [
    blog?.video_url,
    copy.sectionLabels,
    graphRows.length,
    parsed.gallery.length,
    parsed.videos.length,
  ]);

  const publishedDate = getPublishedDate(blog);
  const readingMinutes = getReadingMinutes(blog?.content);

  const dossierRows = useMemo(
    () => [
      {
        label: copy.metaLabels.author,
        value: blog?.author?.trim() || copy.authorFallback,
      },
      {
        label: copy.metaLabels.date,
        value: formatPublishedDate(publishedDate, lang),
      },
      {
        label: copy.metaLabels.read,
        value: readingMinutes ? `${readingMinutes} ${copy.readUnit}` : "-",
      },
    ],
    [
      blog?.author,
      copy.authorFallback,
      copy.metaLabels,
      copy.readUnit,
      lang,
      publishedDate,
      readingMinutes,
    ]
  );

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = window.innerWidth <= 768 ? 148 : 112;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

  if (loading) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <div className={styles.gridOverlay} aria-hidden="true" />
          <p className={styles.loading}>{copy.loading}</p>
        </main>
        <Footer t={t} />
      </>
    );
  }

  if (!blog) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <div className={styles.gridOverlay} aria-hidden="true" />
          <div className={styles.notFoundShell}>
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className={styles.heroCta}
            >
              {copy.back}
            </button>
            <p className={styles.loading}>{copy.notFound}</p>
          </div>
        </main>
        <Footer t={t} />
      </>
    );
  }

  const excerpt = buildExcerpt(blog.content);
  const heroYear = publishedDate
    ? publishedDate.getFullYear()
    : new Date().getFullYear();

  const renderSectionBody = (section) => {
    if (section.type === "article") {
      return blog.content?.trim() ? (
        <p className={styles.articleBody}>{blog.content}</p>
      ) : (
        <p className={styles.emptyText}>{copy.articleEmpty}</p>
      );
    }

    if (section.type === "gallery") {
      return (
        <div className={styles.galleryGrid}>
          {parsed.gallery.map((src, index) => (
            <figure key={`${src}-${index}`} className={styles.galleryCard}>
              <img
                src={src}
                alt={`${blog.title} — ${index + 1}`}
                className={styles.galleryImage}
                onClick={() => setSelectedImage(src)}
              />
              <figcaption className={styles.galleryMeta}>
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(parsed.gallery.length).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      );
    }

    if (section.type === "data") {
      return (
        <div className={styles.chartFrame}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={graphRows}
              margin={{ top: 16, right: 20, bottom: 8, left: -12 }}
            >
              <CartesianGrid strokeDasharray="2 4" stroke={CHART_THEME.grid} />
              <XAxis
                dataKey="label"
                stroke={CHART_THEME.axis}
                tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                stroke={CHART_THEME.axis}
                tick={{ fontFamily: "JetBrains Mono, monospace", fontSize: 10 }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: CHART_THEME.grid }}
                contentStyle={{
                  backgroundColor: CHART_THEME.tooltipBg,
                  border: `1px solid ${CHART_THEME.tooltipBorder}`,
                  borderRadius: "4px",
                  color: "#fff",
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke={CHART_THEME.line}
                strokeWidth={1.5}
                dot={{ fill: CHART_THEME.line, r: 2.5 }}
                activeDot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }

    if (section.type === "feature") {
      return (
        <div className={styles.featureFrame}>
          {isEmbeddable(blog.video_url) ? (
            <iframe
              className={styles.featureMedia}
              src={getEmbedUrl(blog.video_url)}
              title={blog.title}
              allowFullScreen
            />
          ) : (
            <video className={styles.featureMedia} controls playsInline>
              <source src={blog.video_url} type="video/mp4" />
            </video>
          )}
        </div>
      );
    }

    if (section.type === "videos") {
      return (
        <div className={styles.videoGrid}>
          {parsed.videos.map((src, index) => (
            <article key={`${src}-${index}`} className={styles.videoCard}>
              {isEmbeddable(src) ? (
                <iframe
                  className={styles.videoFrame}
                  src={getEmbedUrl(src)}
                  title={`${blog.title} — ${index + 1}`}
                  allowFullScreen
                />
              ) : (
                <video className={styles.videoFrame} controls playsInline>
                  <source src={src} type="video/mp4" />
                </video>
              )}
              <div className={styles.videoMeta}>
                <span className={styles.videoIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={styles.videoTitle}>{section.label}</span>
              </div>
            </article>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <div className={styles.gridOverlay} aria-hidden="true" />

        <div className={styles.crumbBar}>
          <nav className={styles.crumbNav} aria-label={copy.entryTag}>
            <button
              type="button"
              onClick={() => router.push("/blogs")}
              className={styles.crumbLink}
            >
              {copy.blogsCrumb}
            </button>
            <span className={styles.crumbSep}>/</span>
            <span className={styles.crumbCur}>{blog.title}</span>
          </nav>
        </div>

        <section className={styles.heroSection}>
          <div className={styles.heroFrame}>
            <span
              className={`${styles.corner} ${styles.cornerTl}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.corner} ${styles.cornerTr}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.corner} ${styles.cornerBl}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.corner} ${styles.cornerBr}`}
              aria-hidden="true"
            />

            <div className={styles.heroLeft}>
              <div className={styles.postTag}>
                {copy.postTag} · {String(blogIndex).padStart(2, "0")}
                <span className={styles.blinkCursor}>_</span>
              </div>
              <h1 className={styles.title}>{blog.title}</h1>
              {excerpt ? <p className={styles.summary}>{excerpt}</p> : null}
              <div className={styles.dossierPanel}>
                {dossierRows.map((row) => (
                  <div key={row.label} className={styles.dossierRow}>
                    <strong
                      className={`${styles.dossierValue} ${
                        row.value.length > 10 ? styles.dossierValueCompact : ""
                      }`}
                    >
                      {row.value}
                    </strong>
                    <span className={styles.dossierLabel}>{row.label}</span>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => scrollToSection(sections[0].id)}
                className={styles.heroCta}
              >
                {copy.readCta} →
              </button>
            </div>

            <div className={styles.heroRight}>
              <div className={styles.heroMediaShell}>
                {blog.image_url ? (
                  <img
                    src={blog.image_url}
                    alt={blog.title}
                    className={styles.heroMedia}
                  />
                ) : (
                  <div className={styles.heroPlaceholder}>
                    {copy.heroPlaceholder}
                  </div>
                )}
                <span className={styles.scanline} aria-hidden="true" />
              </div>
              <span className={`${styles.hudLbl} ${styles.hudLblTr}`}>
                {copy.entryTag} · {String(blogIndex).padStart(2, "0")}
              </span>
              <span className={`${styles.hudLbl} ${styles.hudLblBl}`}>
                {copy.journalTag} · {heroYear}
              </span>
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={styles.sectionFrame}
            >
              <header className={styles.sectionHeader}>
                <span className={styles.sectionIndex}>
                  {String(section.index + 1).padStart(2, "0")}
                </span>
                <span className={styles.sectionLabel}>{section.label}</span>
                <span className={styles.sectionLine} />
              </header>
              {renderSectionBody(section)}
            </section>
          ))}

          <section id="entry-more" className={styles.sectionFrame}>
            <header className={styles.sectionHeader}>
              <span className={styles.sectionIndex}>
                {String(sections.length + 1).padStart(2, "0")}
              </span>
              <span className={styles.sectionLabel}>
                {copy.sectionLabels.more}
              </span>
              <span className={styles.sectionLine} />
            </header>
            <h2 className={styles.sectionTitle}>{copy.moreHeading}</h2>
            <p className={styles.bodyText}>{copy.moreText}</p>

            {relatedPosts.length > 0 ? (
              <div className={styles.relatedGrid}>
                {relatedPosts.map((post, index) => (
                  <Link
                    key={post.id || post.slug || index}
                    href={`/blogs/${post.slug}`}
                    className={styles.relatedCard}
                  >
                    <span className={styles.relatedIndex}>
                      {copy.postTag} ·{" "}
                      {String(
                        blogs.findIndex((item) => item.slug === post.slug) + 1
                      ).padStart(2, "0")}
                    </span>
                    <span className={styles.relatedTitle}>{post.title}</span>
                    <span className={styles.relatedAuthor}>
                      {post.author?.trim() || copy.authorFallback}
                    </span>
                  </Link>
                ))}
              </div>
            ) : null}

            <div className={styles.contactActions}>
              <Link href="/blogs" className={styles.primaryBtn}>
                {copy.allPosts}
              </Link>
              <a href="/#contact" className={styles.secondaryBtn}>
                {copy.contactSection}
              </a>
            </div>
          </section>
        </section>
      </main>
      <Footer t={t} />

      {selectedImage && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-label={blog.title}
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt={blog.title}
            className={styles.modalImg}
          />
        </div>
      )}
    </>
  );
}
