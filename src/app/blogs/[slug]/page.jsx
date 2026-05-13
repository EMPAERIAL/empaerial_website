"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function BlogPost() {
  const { slug } = useParams();
  const router = useRouter();
  const [blog, setBlog] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    async function fetchBlog() {
      const res = await fetch(`/api/blogs`, { cache: "no-store" });
      const all = await res.json();
      const found = all.find((b) => b.slug === slug);
      setBlog(found);
    }
    fetchBlog();
  }, [slug]);

  if (!blog)
    return (
      <div
        style={{
          color: "var(--blog-heading)",
          textAlign: "center",
          marginTop: "3rem",
          fontFamily: "Fira Code, monospace",
        }}
      >
        Loading...
      </div>
    );

  // ---------------- Data Parsing ----------------
  let graphData = null;
  let gallery = [];
  let videos = [];
  try {
    if (blog.graph_data)
      graphData =
        typeof blog.graph_data === "string"
          ? JSON.parse(blog.graph_data)
          : blog.graph_data;
    if (blog.gallery_images)
      gallery =
        typeof blog.gallery_images === "string"
          ? JSON.parse(blog.gallery_images)
          : blog.gallery_images;
    if (blog.videos)
      videos =
        typeof blog.videos === "string"
          ? JSON.parse(blog.videos)
          : blog.videos;
  } catch {
    graphData = null;
    gallery = [];
    videos = [];
  }
  if (!Array.isArray(gallery)) gallery = [];
  if (!Array.isArray(videos)) videos = [];

  // ---------------- JSX ----------------
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--blog-bg)",
        color: "var(--blog-fg)",
        fontFamily: "'Poppins', sans-serif",
        padding: "3rem 1rem 5rem",
        width: "100%",
        overflowX: "hidden",
      }}
    >
      {/* Close Button */}
      <button
        onClick={() => router.push("/blogs")}
        style={{
          position: "fixed",
          top: "20px",
          right: "25px",
          background: "transparent",
          border: "none",
          color: "var(--admin-fg)",
          fontSize: "2.2rem",
          cursor: "pointer",
          fontWeight: "600",
          zIndex: 10,
          transition: "transform 0.2s ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        ×
      </button>

      {/* Blog Header */}
      <h1
        style={{
          color: "var(--blog-heading)",
          marginBottom: "0.3rem",
          fontSize: "2.6rem",
          textAlign: "center",
        }}
      >
        {blog.title}
      </h1>
      <p
        style={{
          color: "var(--blog-muted)",
          fontStyle: "italic",
          textAlign: "center",
          marginBottom: "2rem",
        }}
      >
        By {blog.author}
      </p>

      {/* Blog Content */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          fontSize: "1.1rem",
          lineHeight: "1.8",
          color: "var(--blog-fg)",
          textAlign: "justify",
        }}
      >
        {/* Gallery Images */}
        <div
          style={{
            float: "left",
            width: "340px",
            marginRight: "2rem",
            marginBottom: "1rem",
          }}
        >
          {gallery.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`Gallery ${i + 1}`}
              onClick={() => setSelectedImage(src)}
              style={{
                width: "100%",
                borderRadius: "12px",
                objectFit: "cover",
                aspectRatio: "16 / 9",
                marginBottom: "1rem",
                boxShadow: "0 0 14px rgba(0,180,216,0.35)",
                cursor: "pointer",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "var(--blog-surface-hover-shadow)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 0 14px rgba(0,180,216,0.35)";
              }}
            />
          ))}
        </div>

        {/* Blog Text */}
        <div>{blog.content}</div>

        {/* Graph Section */}
        {graphData &&
          graphData.labels &&
          graphData.values &&
          graphData.labels.length > 0 && (
            <div style={{ marginTop: "3rem", clear: "both" }}>
              <h3
                style={{
                  color: "var(--blog-heading)",
                  marginBottom: "1rem",
                  textAlign: "center",
                }}
              >
                📊 Graph Visualization
              </h3>
              <div
                style={{
                  width: "100%",
                  height: "320px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(180deg, rgba(0,30,50,0.4), rgba(0,0,0,0.3))",
                  boxShadow: "0 0 20px rgba(0,180,216,0.15)",
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={graphData.labels.map((label, i) => ({
                      label,
                      value: graphData.values[i],
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#112233" />
                    <XAxis dataKey="label" stroke="#aaa" />
                    <YAxis stroke="#aaa" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#001933",
                        border: "1px solid var(--blog-accent-strong)",
                        borderRadius: "8px",
                        color: "var(--admin-fg)",
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
            </div>
          )}
      </div>

      {/* Single Video URL */}
      {blog.video_url && (
        <div
          style={{
            marginTop: "4rem",
            width: "100%",
            maxWidth: "1200px",
            marginInline: "auto",
          }}
        >
          {blog.video_url.includes("youtube") ? (
            <iframe
              width="100%"
              height="480"
              src={blog.video_url.replace("watch?v=", "embed/")}
              title="Video"
              allowFullScreen
              style={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 0 20px rgba(0,180,216,0.25)",
              }}
            ></iframe>
          ) : (
            <video
              width="100%"
              controls
              style={{
                borderRadius: "12px",
                boxShadow: "0 0 20px rgba(0,180,216,0.25)",
              }}
            >
              <source src={blog.video_url} type="video/mp4" />
            </video>
          )}
        </div>
      )}

      {/* 🎬 Multiple Uploaded Videos */}
      {videos.length > 0 && (
        <div
          style={{
            marginTop: "4rem",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "1.5rem",
            width: "100%",
            maxWidth: "1200px",
            marginInline: "auto",
          }}
        >
          {videos.map((src, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 0 20px rgba(0,180,216,0.25)",
              }}
            >
              {src.includes("youtube") ? (
                <iframe
                  width="100%"
                  height="260"
                  src={src.replace("watch?v=", "embed/")}
                  title={`Video ${i + 1}`}
                  allowFullScreen
                  style={{
                    border: "none",
                    width: "100%",
                    height: "260px",
                  }}
                ></iframe>
              ) : (
                <video
                  width="100%"
                  height="260"
                  controls
                  style={{
                    width: "100%",
                    height: "260px",
                    objectFit: "cover",
                    borderRadius: "12px",
                  }}
                >
                  <source src={src} type="video/mp4" />
                </video>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "var(--blog-overlay)",
            backdropFilter: "blur(6px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <img
            src={selectedImage}
            alt="Zoomed"
            style={{
              maxWidth: "92%",
              maxHeight: "88%",
              borderRadius: "15px",
              boxShadow: "0 0 40px rgba(0,200,255,0.5)",
              animation: "popIn 0.3s ease",
            }}
          />
        </div>
      )}

      {/* Animations + Responsive */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes popIn {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
        @media (max-width: 900px) {
          div[style*="float: left"] {
            float: none !important;
            width: 100% !important;
            margin-right: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
