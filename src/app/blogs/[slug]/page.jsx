"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
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

export default function BlogPost() {
  const { slug } = useParams();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [blog, setBlog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const t = lang === "tr" ? tr : en;

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  useEffect(() => {
    async function fetchBlog() {
      const res = await fetch(`/api/blogs`, { cache: "no-store" });
      const all = await res.json();
      const found = all.find((b) => b.slug === slug);
      setBlog(found || null);
    }
    fetchBlog();
  }, [slug]);

  const parsed = useMemo(() => {
    let graphData = null;
    let gallery = [];
    let videos = [];

    try {
      if (blog?.graph_data) {
        graphData =
          typeof blog.graph_data === "string"
            ? JSON.parse(blog.graph_data)
            : blog.graph_data;
      }
      if (blog?.gallery_images) {
        gallery =
          typeof blog.gallery_images === "string"
            ? JSON.parse(blog.gallery_images)
            : blog.gallery_images;
      }
      if (blog?.videos) {
        videos =
          typeof blog.videos === "string" ? JSON.parse(blog.videos) : blog.videos;
      }
    } catch {
      graphData = null;
      gallery = [];
      videos = [];
    }

    return {
      graphData,
      gallery: Array.isArray(gallery) ? gallery : [],
      videos: Array.isArray(videos) ? videos : [],
    };
  }, [blog]);

  if (!blog) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <p className={styles.loading}>Loading...</p>
        </main>
        <Footer t={t} />
      </>
    );
  }

  const graphRows =
    parsed.graphData?.labels?.map((label, i) => ({
      label,
      value: parsed.graphData.values?.[i],
    })) || [];

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <section className={styles.articleSection}>
          <div className={styles.inner}>
            <div className={styles.backRow}>
              <button onClick={() => router.push("/blogs")} className={styles.backBtn}>
                Back to Blogs
              </button>
            </div>

            <header className={styles.header}>
              <h1 className={styles.title}>{blog.title}</h1>
              <p className={styles.author}>By {blog.author || "EMPAERIAL Team"}</p>
            </header>

            {blog.image_url && (
              <div className={styles.coverWrap}>
                <img src={blog.image_url} alt={blog.title} className={styles.cover} />
              </div>
            )}

            <p className={styles.content}>{blog.content || ""}</p>

            {parsed.gallery.length > 0 && (
              <section className={styles.mediaBlock}>
                <h2 className={styles.blockTitle}>Gallery</h2>
                <div className={styles.galleryGrid}>
                  {parsed.gallery.map((src, i) => (
                    <img
                      key={`${src}-${i}`}
                      src={src}
                      alt={`Gallery ${i + 1}`}
                      className={styles.galleryImg}
                      onClick={() => setSelectedImage(src)}
                    />
                  ))}
                </div>
              </section>
            )}

            {graphRows.length > 0 && (
              <section className={styles.mediaBlock}>
                <h2 className={styles.blockTitle}>Graph Visualization</h2>
                <div className={styles.chartWrap}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={graphRows}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#112233" />
                      <XAxis dataKey="label" stroke="#9fb3c8" />
                      <YAxis stroke="#9fb3c8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#001933",
                          border: "1px solid var(--blog-accent-strong)",
                          borderRadius: "8px",
                          color: "#fff",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke="#00E0FF"
                        strokeWidth={2}
                        dot={{ fill: "#00E0FF" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}

            {blog.video_url && (
              <section className={styles.mediaBlock}>
                <h2 className={styles.blockTitle}>Featured Video</h2>
                {blog.video_url.includes("youtube") ? (
                  <iframe
                    className={styles.videoSingle}
                    src={blog.video_url.replace("watch?v=", "embed/")}
                    title="Featured Video"
                    allowFullScreen
                  />
                ) : (
                  <video className={styles.videoSingle} controls>
                    <source src={blog.video_url} type="video/mp4" />
                  </video>
                )}
              </section>
            )}

            {parsed.videos.length > 0 && (
              <section className={styles.mediaBlock}>
                <h2 className={styles.blockTitle}>More Videos</h2>
                <div className={styles.videoGrid}>
                  {parsed.videos.map((src, i) => (
                    <div key={`${src}-${i}`} className={styles.videoItem}>
                      {src.includes("youtube") ? (
                        <iframe
                          className={styles.videoFrame}
                          src={src.replace("watch?v=", "embed/")}
                          title={`Video ${i + 1}`}
                          allowFullScreen
                        />
                      ) : (
                        <video className={styles.videoNative} controls>
                          <source src={src} type="video/mp4" />
                        </video>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </section>
      </main>
      <Footer t={t} />

      {selectedImage && (
        <div className={styles.modal} onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="Zoomed" className={styles.modalImg} />
        </div>
      )}
    </>
  );
}
