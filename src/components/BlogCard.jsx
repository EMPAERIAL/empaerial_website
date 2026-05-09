"use client";
import { useParams } from "next/navigation";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import useBlogs from "@/hooks/useBlogs";

export default function BlogPage() {
  const { slug } = useParams();
  const { blogs } = useBlogs();
  const blog = blogs.find((b) => b.slug === slug);

  if (!blog) return <p style={{ color: "#ccc", textAlign: "center" }}>Loading...</p>;

  return (
    <div style={{ color: "#fff", padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h1 style={{ color: "#00B4D8" }}>{blog.title}</h1>
      <p style={{ opacity: 0.7 }}>by {blog.author}</p>
      <img
        src={blog.image_url}
        alt={blog.title}
        style={{ width: "100%", borderRadius: "10px", margin: "1rem 0" }}
      />

      {blog.video_url && (
        <video src={blog.video_url} controls style={{ width: "100%", borderRadius: "10px", marginBottom: "1rem" }} />
      )}

      <p style={{ lineHeight: "1.8", marginBottom: "2rem" }}>{blog.content}</p>

      {blog.graph_data && (
        <div style={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={blog.graph_data.labels.map((label, i) => ({
                name: label,
                value: blog.graph_data.values[i],
              }))}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#00B4D8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
