"use client";
import { useState } from "react";
import { FileDrop, FileDropMulti, FileDropMultiVideo } from "@/components/admin/FileDroppers";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import styles from "@/app/admin/adminTheme.module.css";
import { moveItem, generateSlug } from "@/Lib/adminUtils";

const emptyForm = {
  title: "",
  slug: "",
  author: "",
  image_url: "",
  content: "",
  video_url: "",
  graph_data: { labels: [], values: [] },
  gallery_images: [],
  videos: [],
  id: null,
};

export default function BlogEditor({ blogs, onBlogsChange }) {
  const [mode, setMode] = useState("create");
  const [blogForm, setBlogForm] = useState(emptyForm);
  const [dragBlogIdx, setDragBlogIdx] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    const method = blogForm.id ? "PATCH" : "POST";
    try {
      const res = await fetch("/api/blogs", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blogForm),
      });
      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "Failed to save blog");
      }
      const updated = await res.json();
      alert(blogForm.id ? "Blog updated" : "Blog added");
      if (blogForm.id) {
        onBlogsChange(blogs.map((b) => (b.id === blogForm.id ? updated : b)));
      } else {
        onBlogsChange([...blogs, updated]);
      }
      setBlogForm(emptyForm);
    } catch (err) {
      console.error("POST error:", err);
      alert(err.message || "Failed to save blog");
    }
  };

  const handleEdit = (item) => {
    setMode("create");
    setBlogForm({
      title: item.title || "",
      slug: item.slug || "",
      author: item.author || "",
      image_url: item.image_url || "",
      content: item.content || "",
      video_url: item.video_url || "",
      graph_data: item.graph_data || { labels: [], values: [] },
      gallery_images: item.gallery_images || [],
      videos: item.videos || [],
      id: item.id,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, password) => {
    if (!password) return;
    setDeleteSubmitting(true);
    setDeleteError("");
    try {
      const res = await fetch("/api/blogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const result = await res.json();
      if (!res.ok) {
        setDeleteError(result.error || "Failed to delete");
        return;
      }
      alert("Deleted successfully");
      onBlogsChange(blogs.filter((b) => b?.id !== id));
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Deletion failed.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const onBlogThumbDrop = (i) => {
    if (dragBlogIdx === null || dragBlogIdx === i) return;
    setBlogForm((prev) => ({
      ...prev,
      gallery_images: moveItem(prev.gallery_images || [], dragBlogIdx, i),
    }));
    setDragBlogIdx(null);
  };

  const onVideoDrop = (i) => {
    if (dragBlogIdx === null || dragBlogIdx === i) return;
    setBlogForm((prev) => ({
      ...prev,
      videos: moveItem(prev.videos || [], dragBlogIdx, i),
    }));
    setDragBlogIdx(null);
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>{blogForm.id ? "Edit Blog" : "Add New Blog"}</h2>

      <div className={styles.modeSwitchBar}>
        <button
          type="button"
          className={`${styles.modeSwitchButton} ${mode === "create" ? styles.modeSwitchButtonActive : ""}`}
          onClick={() => setMode("create")}
        >
          Create/Edit
        </button>
        <button
          type="button"
          className={`${styles.modeSwitchButton} ${mode === "manage" ? styles.modeSwitchButtonActive : ""}`}
          onClick={() => setMode("manage")}
        >
          Manage List
        </button>
      </div>

      {mode === "create" && (
        <form onSubmit={handleBlogSubmit} className={styles.formLayout}>
          <input
            placeholder="Blog Title"
            value={blogForm.title}
            onChange={(e) =>
              setBlogForm((prev) => ({
                ...prev,
                title: e.target.value,
                slug: generateSlug(e.target.value),
              }))
            }
            className={styles.inputField}
          />
          <input
            placeholder="Author"
            value={blogForm.author}
            onChange={(e) =>
              setBlogForm((prev) => ({ ...prev, author: e.target.value }))
            }
            className={styles.inputField}
          />

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Blog Cover</h3>
            <FileDrop
              label="Upload Blog Cover"
              folder=""
              onUploaded={(url) =>
                setBlogForm((prev) => ({ ...prev, image_url: url }))
              }
            />
            {blogForm.image_url && (
              <div className={styles.gridThumbs} style={{ gridTemplateColumns: "90px" }}>
                <div className={styles.thumbBox}>
                  <img
                    src={blogForm.image_url}
                    alt="blog-cover"
                    className={styles.thumbImg}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBlogForm((prev) => ({ ...prev, image_url: "" }))
                    }
                    title="Remove"
                    className={styles.thumbClose}
                  >
                    x
                  </button>
                </div>
              </div>
            )}
          </div>

          <textarea
            placeholder="Write blog content..."
            value={blogForm.content}
            onChange={(e) =>
              setBlogForm((prev) => ({ ...prev, content: e.target.value }))
            }
            className={styles.builderTextarea}
            style={{ minHeight: "120px" }}
          />
          <input
            placeholder="Video URL (YouTube or MP4)"
            value={blogForm.video_url || ""}
            onChange={(e) =>
              setBlogForm((prev) => ({ ...prev, video_url: e.target.value }))
            }
            className={styles.inputField}
          />

          <div className={styles.builderBox} style={{ marginTop: "1rem" }}>
            <h3 className={styles.miniHeader}>Blog Gallery</h3>
            <FileDropMulti
              label="Upload Gallery Images"
              folder=""
              onUploaded={(urls) =>
                setBlogForm((prev) => ({
                  ...prev,
                  gallery_images: [...(prev.gallery_images || []), ...urls],
                }))
              }
            />
            {Array.isArray(blogForm.gallery_images) &&
              blogForm.gallery_images.length > 0 && (
                <div className={styles.gridThumbs}>
                  {blogForm.gallery_images.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      className={styles.thumbBox}
                      draggable
                      onDragStart={() => setDragBlogIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onBlogThumbDrop(idx)}
                      title="Drag to reorder"
                    >
                      <img src={url} alt={`gallery-${idx}`} className={styles.thumbImg} />
                      <button
                        type="button"
                        onClick={() => {
                          setBlogForm((prev) => {
                            const copy = [...(prev.gallery_images || [])];
                            copy.splice(idx, 1);
                            return { ...prev, gallery_images: copy };
                          });
                        }}
                        title="Remove"
                        className={styles.thumbClose}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div className={styles.builderBox} style={{ marginTop: "1rem" }}>
            <h3 className={styles.miniHeader}>Blog Videos</h3>
            <FileDropMultiVideo
              label="Upload Blog Videos"
              folder="videos"
              onUploaded={(urls) =>
                setBlogForm((prev) => ({
                  ...prev,
                  videos: [...(prev.videos || []), ...urls],
                }))
              }
            />
            {Array.isArray(blogForm.videos) && blogForm.videos.length > 0 && (
              <div className={styles.gridThumbs}>
                {blogForm.videos.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    className={styles.thumbBox}
                    draggable
                    onDragStart={() => setDragBlogIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onVideoDrop(idx)}
                    title="Drag to reorder"
                  >
                    <video src={url} controls className={styles.thumbImg}></video>
                    <button
                      type="button"
                      onClick={() => {
                        setBlogForm((prev) => {
                          const copy = [...(prev.videos || [])];
                          copy.splice(idx, 1);
                          return { ...prev, videos: copy };
                        });
                      }}
                      title="Remove"
                      className={styles.thumbClose}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Graph Builder</h3>
            {(blogForm.graph_data?.labels || []).map((label, i) => (
              <div key={i} className={styles.actionRow} style={{ marginBottom: "0.5rem", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder={`X${i + 1} Label`}
                  value={label}
                  onChange={(e) => {
                    const newLabels = [...(blogForm.graph_data?.labels || [])];
                    newLabels[i] = e.target.value;
                    setBlogForm((prev) => ({
                      ...prev,
                      graph_data: {
                        labels: newLabels,
                        values: prev.graph_data?.values || [],
                      },
                    }));
                  }}
                  className={styles.inputField}
                  style={{ flex: "1 1 42%", minWidth: "120px" }}
                />
                <input
                  type="number"
                  placeholder={`Y${i + 1} Value`}
                  value={blogForm.graph_data?.values?.[i] || ""}
                  onChange={(e) => {
                    const newValues = [...(blogForm.graph_data?.values || [])];
                    newValues[i] = Number(e.target.value);
                    setBlogForm((prev) => ({
                      ...prev,
                      graph_data: {
                        labels: prev.graph_data?.labels || [],
                        values: newValues,
                      },
                    }));
                  }}
                  className={styles.inputField}
                  style={{ flex: "1 1 42%", minWidth: "120px" }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newLabels = [...(blogForm.graph_data?.labels || [])];
                    const newValues = [...(blogForm.graph_data?.values || [])];
                    newLabels.splice(i, 1);
                    newValues.splice(i, 1);
                    setBlogForm((prev) => ({
                      ...prev,
                      graph_data: { labels: newLabels, values: newValues },
                    }));
                  }}
                  className={styles.iconDeleteBtn}
                >
                  x
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                setBlogForm((prev) => ({
                  ...prev,
                  graph_data: {
                    labels: [...(prev.graph_data?.labels || []), ""],
                    values: [...(prev.graph_data?.values || []), 0],
                  },
                }));
              }}
              className={styles.addSectionBtn}
              style={{ width: "100%" }}
            >
              + Add Data Point
            </button>
          </div>

          <input
            placeholder="Slug (auto-generated)"
            value={blogForm.slug}
            readOnly
            className={styles.readonlyInput}
          />
          <button type="submit" className={styles.submitButton}>
            {blogForm.id ? "Update Blog" : "+ Add Blog"}
          </button>
        </form>
      )}

      {mode === "manage" && blogs.length > 0 && (
        <div className={styles.listContainer}>
          <h3 className={styles.miniHeader}>Existing Blogs</h3>
          <div className={styles.scrollList}>
            {blogs.map((b) => (
              <div key={b.id} className={styles.listItem}>
                <div>
                  <strong>{b.title}</strong>
                  <p className={styles.rowMetaText}>
                    by {b.author}
                  </p>
                </div>
                <div className={styles.actionRow}>
                  <button className={styles.editButton} onClick={() => handleEdit(b)}>
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      setDeleteTargetId(b.id);
                      setDeleteError("");
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTargetId)}
        itemLabel="this blog post"
        submitting={deleteSubmitting}
        error={deleteError}
        onCancel={() => {
          if (deleteSubmitting) return;
          setDeleteTargetId(null);
          setDeleteError("");
        }}
        onConfirm={(password) => handleDelete(deleteTargetId, password)}
      />
    </div>
  );
}




