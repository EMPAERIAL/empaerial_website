"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useBlogs from "@/hooks/useBlogs";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";
import styles from "./Blogs.module.css";

export default function BlogsPage() {
  const [lang, setLang] = useState("en");
  const { blogs, loading, error } = useBlogs();
  const t = lang === "tr" ? tr : en;

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  const renderContent = () => {
    if (loading) {
      return <p className={styles.status}>Loading blogs...</p>;
    }

    if (error) {
      return (
        <p className={styles.status} role="alert">
          We could not load blogs right now. Please try again shortly.
        </p>
      );
    }

    if (blogs.length === 0) {
      return <p className={styles.status}>No blog posts yet. Check back soon!</p>;
    }

    return (
      <div className={styles.grid}>
        {blogs.map((blog, index) => {
          const cover = blog?.image_url || "/images/default-drone.png";
          const snippet =
            (blog?.content || "").length > 120
              ? `${blog.content.slice(0, 120)}...`
              : blog?.content || "";

          return (
            <article key={blog.id} className={styles.card}>
              <div className={styles.mediaWrap}>
                <img src={cover} alt={blog.title} className={styles.media} />
              </div>

              <div className={styles.body}>
                <p className={styles.meta}>POST - {String(index + 1).padStart(2, "0")}</p>
                <h2 className={styles.cardTitle}>{blog.title}</h2>
                <p className={styles.author}>By {blog.author || "EMPAERIAL Team"}</p>
                <p className={styles.snippet}>{snippet}</p>

                <Link href={`/blogs/${blog.slug}`} className={styles.cta}>
                  Read More {"->"}
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <section className={styles.blogsSection} aria-labelledby="blogs-title" aria-busy={loading}>
          <div className={styles.inner}>
            <div className={styles.header}>
              <p className={styles.eyebrow}>INSIGHTS - BLOGS</p>
              <h1 id="blogs-title" className={styles.title}>
                Our Blogs
              </h1>
              <p className={styles.subtitle}>
                Explore our latest updates, stories, and UAV insights.
              </p>
            </div>
            {renderContent()}
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
