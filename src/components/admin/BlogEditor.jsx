"use client";
import { useState } from "react";
import {
  FileDrop,
  FileDropMulti,
  FileDropMultiVideo,
} from "@/components/admin/FileDroppers";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import {
  sectionCard,
  sectionTitle,
  formLayout,
  inputField,
  readonlyInput,
  submitButton,
  builderBox,
  addSectionBtn,
  builderTextarea,
  listContainer,
  scrollList,
  miniHeader,
  listItem,
  deleteButton,
  editButton,
  iconDeleteBtn,
  gridThumbs,
  thumbBox,
  thumbImg,
  thumbClose,
  modeSwitchBar,
  modeSwitchButton,
  modeSwitchButtonActive,
} from "@/app/admin/adminStyles";
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
    <div style={sectionCard}>
      <h2 style={sectionTitle}>{blogForm.id ? "Edit Blog" : "Add New Blog"}</h2>

      <div style={modeSwitchBar}>
        <button
          type="button"
          style={mode === "create" ? modeSwitchButtonActive : modeSwitchButton}
          onClick={() => setMode("create")}
        >
          Create/Edit
        </button>
        <button
          type="button"
          style={mode === "manage" ? modeSwitchButtonActive : modeSwitchButton}
          onClick={() => setMode("manage")}
        >
          Manage List
        </button>
      </div>

      {mode === "create" && (
        <form onSubmit={handleBlogSubmit} style={formLayout}>
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
            style={inputField}
          />
          <input
            placeholder="Author"
            value={blogForm.author}
            onChange={(e) =>
              setBlogForm((prev) => ({ ...prev, author: e.target.value }))
            }
            style={inputField}
          />

          <div style={{ ...builderBox, padding: "1rem" }}>
            <h3 style={miniHeader}>Blog Cover</h3>
            <FileDrop
              label="Upload Blog Cover"
              folder=""
              onUploaded={(url) =>
                setBlogForm((prev) => ({ ...prev, image_url: url }))
              }
            />
            {blogForm.image_url && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px",
                  gap: "10px",
                }}
              >
                <div style={thumbBox}>
                  <img
                    src={blogForm.image_url}
                    alt="blog-cover"
                    style={thumbImg}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setBlogForm((prev) => ({ ...prev, image_url: "" }))
                    }
                    title="Remove"
                    style={thumbClose}
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
            style={{ ...builderTextarea, minHeight: "120px" }}
          />
          <input
            placeholder="Video URL (YouTube or MP4)"
            value={blogForm.video_url || ""}
            onChange={(e) =>
              setBlogForm((prev) => ({ ...prev, video_url: e.target.value }))
            }
            style={inputField}
          />

          <div style={{ ...builderBox, padding: "1rem", marginTop: "1rem" }}>
            <h3 style={miniHeader}>Blog Gallery</h3>
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
                <div style={gridThumbs}>
                  {blogForm.gallery_images.map((url, idx) => (
                    <div
                      key={`${url}-${idx}`}
                      style={thumbBox}
                      draggable
                      onDragStart={() => setDragBlogIdx(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onBlogThumbDrop(idx)}
                      title="Drag to reorder"
                    >
                      <img src={url} alt={`gallery-${idx}`} style={thumbImg} />
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
                        style={thumbClose}
                      >
                        x
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>

          <div style={{ ...builderBox, padding: "1rem", marginTop: "1rem" }}>
            <h3 style={miniHeader}>Blog Videos</h3>
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
              <div style={gridThumbs}>
                {blogForm.videos.map((url, idx) => (
                  <div
                    key={`${url}-${idx}`}
                    style={thumbBox}
                    draggable
                    onDragStart={() => setDragBlogIdx(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onVideoDrop(idx)}
                    title="Drag to reorder"
                  >
                    <video src={url} controls style={thumbImg}></video>
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
                      style={thumbClose}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ ...builderBox, padding: "1rem" }}>
            <h3 style={miniHeader}>Graph Builder</h3>
            {(blogForm.graph_data?.labels || []).map((label, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                  alignItems: "center",
                }}
              >
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
                  style={{ ...inputField, flex: "1 1 42%", minWidth: "120px" }}
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
                  style={{ ...inputField, flex: "1 1 42%", minWidth: "120px" }}
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
                  style={iconDeleteBtn}
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
              style={{ ...addSectionBtn, width: "100%" }}
            >
              + Add Data Point
            </button>
          </div>

          <input
            placeholder="Slug (auto-generated)"
            value={blogForm.slug}
            readOnly
            style={readonlyInput}
          />
          <button type="submit" style={submitButton}>
            {blogForm.id ? "Update Blog" : "+ Add Blog"}
          </button>
        </form>
      )}

      {mode === "manage" && blogs.length > 0 && (
        <div style={listContainer}>
          <h3 style={miniHeader}>Existing Blogs</h3>
          <div style={scrollList}>
            {blogs.map((b) => (
              <div key={b.id} style={listItem}>
                <div>
                  <strong>{b.title}</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
                    by {b.author}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={editButton} onClick={() => handleEdit(b)}>
                    Edit
                  </button>
                  <button
                    style={deleteButton}
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
