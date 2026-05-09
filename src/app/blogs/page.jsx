"use client";

import Link from "next/link";
import useBlogs from "@/hooks/useBlogs";

export default function BlogsPage() {
  const { blogs, loading } = useBlogs();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#00B4D8",
          fontFamily: "Fira Code, monospace",
        }}
      >
        Loading blogs...
      </div>
    );
  }

  return (
    <section
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, #051727, #000)",
        color: "#EAEAEA",
        fontFamily: "'Poppins', sans-serif",
        padding: "80px 20px",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "60px" }}>
        <h1
          style={{
            fontSize: "3rem",
            fontWeight: "800",
            color: "#00B4D8",
            marginBottom: "15px",
          }}
        >
          Our Blogs
        </h1>
        <p
          style={{
            fontSize: "1.2rem",
            color: "#aaa",
            fontStyle: "italic",
          }}
        >
          Explore our latest updates, stories, and UAV insights.
        </p>
      </div>

      {blogs.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No blog posts yet. Check back soon!
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "25px",
            width: "90%",
            maxWidth: "1050px",
            margin: "0 auto",
            justifyItems: "center",
          }}
        >
          {blogs.map((blog) => {
            const cover = blog?.image_url || "/images/default-drone.png";
            const snippet =
              (blog?.content || "").length > 100
                ? blog.content.slice(0, 100) + "..."
                : blog?.content || "";

            return (
              <div
                key={blog.id}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "14px",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                  overflow: "hidden",
                  width: "100%",
                  maxWidth: "320px",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-6px)";
                  e.currentTarget.style.boxShadow =
                    "0 16px 40px rgba(0, 200, 255, 0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0,0,0,0.35)";
                }}
              >
                {}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "180px",
                    overflow: "hidden",
                  }}
                >
                  <img
                    src={cover}
                    alt={blog.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.35s ease",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.transform = "scale(1.05)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  />
                </div>

                {/* ✅ CONTENT */}
                <div
                  style={{
                    textAlign: "center",
                    padding: "18px 20px 25px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    flexGrow: 1,
                  }}
                >
                  <h2
                    style={{
                      color: "#00B4D8",
                      fontSize: "1.2rem",
                      marginBottom: "6px",
                      fontWeight: "700",
                      fontFamily: "Fira Code, monospace",
                    }}
                  >
                    {blog.title}
                  </h2>

                  <p
                    style={{
                      color: "#9ad3e3",
                      fontStyle: "italic",
                      marginBottom: "10px",
                      fontFamily: "Fira Code, monospace",
                      fontSize: ".9rem",
                    }}
                  >
                    By {blog.author}
                  </p>

                  <p
                    style={{
                      color: "#e9eef2",
                      fontSize: ".9rem",
                      marginBottom: "16px",
                      fontFamily: "Fira Code, monospace",
                      minHeight: "3em",
                    }}
                  >
                    {snippet}
                  </p>

                  <Link
                    href={`/blogs/${blog.slug}`}
                    style={{ alignSelf: "center", textDecoration: "none" }}
                  >
                    <div
                      style={{
                        background: "rgba(102, 217, 239, 0.15)",
                        border: "1px solid #00B4D8",
                        color: "#00B4D8",
                        fontFamily: "Fira Code, monospace",
                        padding: "8px 18px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.25s ease",
                        fontSize: ".9rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#00B4D8";
                        e.currentTarget.style.color = "#0b1622";
                        e.currentTarget.style.transform =
                          "translateY(-1px) scale(1.02)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "rgba(102, 217, 239, 0.15)";
                        e.currentTarget.style.color = "#00B4D8";
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                      }}
                    >
                      Read More →
                    </div>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
