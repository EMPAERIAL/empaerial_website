"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import useBlogs from "@/hooks/useBlogs";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import SearchHighlight from "@/components/Search/SearchHighlight";
import { useLanguage } from "@/components/LanguageProvider";
import styles from "./Blogs.module.css";

function getBlogsPageCopy(pageT) {
  return {
    eyebrow: pageT?.eyebrow || "Insights",
    postsWord: pageT?.posts_word || "Posts",
    title: pageT?.title || "Our Blogs",
    subtitle:
      pageT?.subtitle ||
      "Explore our latest updates, stories, and UAV insights.",
    loading: pageT?.loading || "Loading blogs...",
    error:
      pageT?.error ||
      "We could not load blogs right now. Please try again shortly.",
    empty: pageT?.empty || "No blog posts yet. Check back soon!",
    postTag: pageT?.post_tag || "Post",
    readMore: pageT?.read_more || "Read More",
    by: pageT?.by || "By",
    authorFallback: pageT?.author_fallback || "EMPAERIAL Team",
    coverPending: pageT?.cover_pending || "Cover media pending.",
  };
}

function buildSnippet(content, limit) {
  const clean = String(content || "")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";
  return clean.length > limit ? `${clean.slice(0, limit).trimEnd()}...` : clean;
}

export default function BlogsPage() {
  const { lang, setLang, t } = useLanguage();
  const { blogs, loading, error } = useBlogs();
  const copy = useMemo(() => getBlogsPageCopy(t.blogs_page), [t]);

  const featured = blogs[0] || null;
  const rest = blogs.slice(1);

  const renderContent = () => {
    if (loading) {
      return <p className={styles.status}>{copy.loading}</p>;
    }

    if (error) {
      return (
        <p className={styles.status} role="alert">
          {copy.error}
        </p>
      );
    }

    if (!featured) {
      return <p className={styles.status}>{copy.empty}</p>;
    }

    return (
      <>
        <article className={styles.featured}>
          <div className={styles.featuredMedia}>
            {featured.image_url ? (
              <img
                src={featured.image_url}
                alt={featured.title}
                className={styles.featuredImage}
              />
            ) : (
              <div className={styles.mediaPlaceholder}>{copy.coverPending}</div>
            )}
            <span className={styles.scanline} aria-hidden="true" />
          </div>

          <div className={styles.featuredBody}>
            <p className={styles.meta}>{`${copy.postTag} · 01`}</p>
            <h2 className={styles.featuredTitle}>{featured.title}</h2>
            <p className={styles.author}>
              {`${copy.by} ${featured.author?.trim() || copy.authorFallback}`}
            </p>
            <p className={styles.snippet}>
              {buildSnippet(featured.content, 260)}
            </p>
            <div className={styles.featuredCta}>
              <Link href={`/blogs/${featured.slug}`} className={styles.cta}>
                {`${copy.readMore} →`}
              </Link>
            </div>
          </div>
        </article>

        {rest.length > 0 && (
          <div className={styles.grid}>
            {rest.map((blog, index) => (
              <Link
                key={blog.id || blog.slug || index}
                href={`/blogs/${blog.slug}`}
                className={styles.card}
              >
                <div className={styles.mediaWrap}>
                  {blog.image_url ? (
                    <img
                      src={blog.image_url}
                      alt={blog.title}
                      className={styles.media}
                    />
                  ) : (
                    <div
                      className={`${styles.mediaPlaceholder} ${styles.mediaPlaceholderCard}`}
                    >
                      {copy.coverPending}
                    </div>
                  )}
                </div>

                <div className={styles.body}>
                  <p className={styles.meta}>
                    {`${copy.postTag} · ${String(index + 2).padStart(2, "0")}`}
                  </p>
                  <h2 className={styles.cardTitle}>{blog.title}</h2>
                  <p className={styles.author}>
                    {`${copy.by} ${blog.author?.trim() || copy.authorFallback}`}
                  </p>
                  <p className={styles.snippet}>
                    {buildSnippet(blog.content, 140)}
                  </p>
                  <span className={styles.cardCta}>{`${copy.readMore} →`}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <SearchHighlight />

        <div className={styles.gridOverlay} aria-hidden="true" />
        <section
          className={styles.blogsSection}
          aria-labelledby="blogs-title"
          aria-busy={loading}
        >
          <div className={styles.inner}>
            <div className={styles.header}>
              <p className={styles.eyebrow}>
                {blogs.length
                  ? `${copy.eyebrow} · ${blogs.length} ${copy.postsWord}`
                  : copy.eyebrow}
              </p>
              <h1 id="blogs-title" className={styles.title}>
                {copy.title}
              </h1>
              <p className={styles.subtitle}>{copy.subtitle}</p>
            </div>
            {renderContent()}
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
