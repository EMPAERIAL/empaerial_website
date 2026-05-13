"use client";

import Link from "next/link";
import useBlogs from "@/hooks/useBlogs";
import styles from "./Blogs.module.css";

export default function BlogsPage() {
  const { blogs, loading } = useBlogs();

  if (loading) {
    return (
      <section className={styles.blogsSection} aria-busy="true">
        <div className={styles.inner}>
          <p className={styles.status}>Loading blogs...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.blogsSection} aria-labelledby="blogs-title">
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

        {blogs.length === 0 ? (
          <p className={styles.status}>No blog posts yet. Check back soon!</p>
        ) : (
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
        )}
      </div>
    </section>
  );
}
