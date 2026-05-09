"use client";

import { useState, useEffect, useCallback } from "react";

export default function useBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/blogs", { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch blogs: ${res.status}`);
      const data = await res.json();
      const normalized = (Array.isArray(data) ? data : []).filter(
        (b) => b && b.title
      );
      setBlogs(normalized);
    } catch (err) {
      setError(err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return { blogs, loading, error, refetch: fetchBlogs };
}
