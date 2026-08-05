"use client";

import { useState } from "react";
import KVEditor from "@/components/admin/KVEditor";
import ProjectGalleryEditor from "@/components/admin/ProjectGalleryEditor";
import { FileDrop, FileDropMultiVideo } from "@/components/admin/FileDroppers";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import styles from "@/app/admin/adminTheme.module.css";
import {
  toTitleCaseNoUnderscore,
  generateSlug,
  normalizeKeyValueSection,
  DEFAULT_SPECS_ROWS,
  DEFAULT_MATERIALS_ROWS,
} from "@/Lib/adminUtils";
import {
  PROJECT_STATUS_OPTIONS,
  normalizeProjectRecord,
} from "@/Lib/projectData";

const sectionTemplates = {
  specs: { rows: DEFAULT_SPECS_ROWS.map((row) => ({ ...row })) },
  materials: { rows: DEFAULT_MATERIALS_ROWS.map((row) => ({ ...row })) },
  gallery: { images: [] },
  callouts: { items: [{ label: "", detail: "", x: 50, y: 50 }] },
  videos: { videos: [{ title: "", url: "" }] },
  text: { heading: "ABOUT THIS PROJECT", content: "" },
  links: { links: [{ label: "", url: "", description: "" }] },
  "media-interval": {
    mediaType: "video",
    mediaUrl: "",
    posterUrl: "",
    label: "",
    subline: "",
  },
};

const sectionTypeLabels = {
  specs: "Specs",
  materials: "Materials",
  gallery: "Gallery",
  callouts: "Callouts",
  videos: "Videos",
  text: "Text",
  links: "Links",
  "media-interval": "Media Interval",
  contact: "Contact",
};

function createEmptyHeroMedia() {
  return {
    type: "image",
    url: "",
    poster_url: "",
    alt: "",
  };
}

function createEmptyForm() {
  return {
    name: "",
    summary: "",
    image_url: "",
    slug: "",
    id: null,
    status: "",
    year: "",
    purpose: "",
    hero_media: createEmptyHeroMedia(),
  };
}

function createSection(type) {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    navLabel: "",
    data: structuredClone(sectionTemplates[type] || {}),
  };
}

function normalizeCalloutSection(section) {
  const items = Array.isArray(section?.data?.items) ? section.data.items : [];

  return {
    items: items.map((item) => ({
      label: item?.label || "",
      detail: item?.detail || "",
      x: Number.isFinite(Number(item?.x)) ? Number(item.x) : 50,
      y: Number.isFinite(Number(item?.y)) ? Number(item.y) : 50,
    })),
  };
}

function normalizeVideoSection(section) {
  const videos = Array.isArray(section?.data?.videos)
    ? section.data.videos
    : [];

  return {
    videos: videos
      .map((item) =>
        typeof item === "string"
          ? { title: "", url: item }
          : { title: item?.title || "", url: item?.url || "" }
      )
      .filter((item) => item.title || item.url),
  };
}

function normalizeLinkSection(section) {
  const links = Array.isArray(section?.data?.links) ? section.data.links : [];

  return {
    links: links
      .map((item) =>
        typeof item === "string"
          ? { label: "", url: item, description: "" }
          : {
              label: item?.label || "",
              url: item?.url || "",
              description: item?.description || "",
            }
      )
      .filter((item) => item.label || item.url),
  };
}

function normalizeMediaIntervalSection(section) {
  return {
    mediaType: section?.data?.mediaType === "image" ? "image" : "video",
    mediaUrl: section?.data?.mediaUrl || section?.data?.url || "",
    posterUrl: section?.data?.posterUrl || section?.data?.poster_url || "",
    label: section?.data?.label || "",
    subline: section?.data?.subline || "",
  };
}

function normalizeEditorSection(section) {
  if (section.type === "gallery") {
    return {
      ...section,
      data: {
        images: Array.isArray(section?.data?.images) ? section.data.images : [],
      },
    };
  }

  if (section.type === "specs" || section.type === "materials") {
    return { ...section, data: normalizeKeyValueSection(section) };
  }

  if (section.type === "callouts") {
    return { ...section, data: normalizeCalloutSection(section) };
  }

  if (section.type === "videos") {
    return { ...section, data: normalizeVideoSection(section) };
  }

  if (section.type === "links") {
    return { ...section, data: normalizeLinkSection(section) };
  }

  if (section.type === "media-interval") {
    return { ...section, data: normalizeMediaIntervalSection(section) };
  }

  if (section.type === "text") {
    return {
      ...section,
      data: {
        heading: section?.data?.heading || "ABOUT THIS PROJECT",
        content: section?.data?.content || "",
      },
    };
  }

  return section;
}

function createContactSection(projectName = "this project") {
  return {
    id: "contact-fixed",
    type: "contact",
    navLabel: "Contact",
    data: {
      email: "empaerial.uav@gmail.com",
      link: "/#contact",
      message: `Interested in ${projectName}?`,
    },
  };
}

function updateListItem(list, index, nextValue) {
  const copy = [...list];
  copy[index] = nextValue;
  return copy;
}

function removeListItem(list, index) {
  return list.filter((_, currentIndex) => currentIndex !== index);
}

function moveListItem(list, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }

  const copy = [...list];
  const [movedItem] = copy.splice(fromIndex, 1);
  copy.splice(toIndex, 0, movedItem);
  return copy;
}

function renderMediaPreview(url, type, posterUrl, altText = "") {
  if (!url) return null;

  if (type === "video") {
    return (
      <video
        src={url}
        poster={posterUrl || undefined}
        controls
        className={styles.thumbImg}
      />
    );
  }

  return (
    <img
      src={url}
      alt={altText || "media-preview"}
      className={styles.thumbImg}
    />
  );
}

export default function ProjectEditor({ projects, onProjectsChange }) {
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState(createEmptyForm);
  const [sections, setSections] = useState([]);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const addSection = (type) => {
    setSections((prev) => [...prev, createSection(type)]);
  };

  const updateSection = (id, patch) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, ...patch } : section
      )
    );
  };

  const updateSectionData = (id, data) => {
    updateSection(id, { data });
  };

  const removeSection = (id) => {
    setSections((prev) => prev.filter((section) => section.id !== id));
  };

  const moveSection = (id, direction) => {
    setSections((prev) => {
      const currentIndex = prev.findIndex((section) => section.id === id);

      if (currentIndex === -1) {
        return prev;
      }

      const targetIndex =
        direction === "up" ? currentIndex - 1 : currentIndex + 1;
      return moveListItem(prev, currentIndex, targetIndex);
    });
  };

  const handleEdit = (item) => {
    const project = normalizeProjectRecord(item);

    setMode("create");
    setForm({
      name: project.name || "",
      summary: project.summary || "",
      image_url: project.image_url || "",
      slug: project.slug || "",
      id: project.id,
      status: project.status || "",
      year: project.year || "",
      purpose: project.purpose || "",
      hero_media: project.hero_media || createEmptyHeroMedia(),
    });
    setSections(
      project.sections
        .filter((section) => section.type !== "contact")
        .map(normalizeEditorSection)
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id, password) => {
    if (!password) return;
    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/projects", {
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
      onProjectsChange(projects.filter((project) => project?.id !== id));
      setDeleteTargetId(null);
    } catch (error) {
      console.error("Delete error:", error);
      setDeleteError("Deletion failed");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleProjectSubmit = async (event) => {
    event.preventDefault();

    const normalizedSections = sections.map((section) => {
      const navLabel = section.navLabel?.trim() || "";

      if (section.type === "specs" || section.type === "materials") {
        const data = normalizeKeyValueSection(section);
        const rows = (data.rows || []).map((row) => ({
          key: toTitleCaseNoUnderscore(row.key),
          value: row.value,
        }));

        return { ...section, navLabel, data: { rows } };
      }

      if (section.type === "gallery") {
        const images = Array.isArray(section?.data?.images)
          ? section.data.images
          : [];
        return { ...section, navLabel, data: { images } };
      }

      if (section.type === "callouts") {
        return {
          ...section,
          navLabel,
          data: normalizeCalloutSection(section),
        };
      }

      if (section.type === "videos") {
        return {
          ...section,
          navLabel,
          data: normalizeVideoSection(section),
        };
      }

      if (section.type === "links") {
        return {
          ...section,
          navLabel,
          data: normalizeLinkSection(section),
        };
      }

      if (section.type === "media-interval") {
        return {
          ...section,
          navLabel,
          data: normalizeMediaIntervalSection(section),
        };
      }

      if (section.type === "text") {
        return {
          ...section,
          navLabel,
          data: {
            heading: section?.data?.heading || "ABOUT THIS PROJECT",
            content: section?.data?.content || "",
          },
        };
      }

      return { ...section, navLabel };
    });

    const filteredSections = normalizedSections.filter(
      (section) => section.type !== "contact"
    );
    const payload = {
      ...form,
      hero_media: {
        type: form.hero_media?.type === "video" ? "video" : "image",
        url: form.hero_media?.url || "",
        poster_url: form.hero_media?.poster_url || "",
        alt: form.hero_media?.alt || "",
      },
      sections: [
        ...filteredSections,
        createContactSection(form.name || "this project"),
      ],
    };

    try {
      const res = await fetch("/api/projects", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const result = await res.json().catch(() => ({}));
        throw new Error(result.error || "Failed to save project");
      }

      const updated = await res.json();
      alert(form.id ? "Project updated" : "Project added");

      if (form.id) {
        onProjectsChange(
          projects.map((project) =>
            project.id === form.id ? updated : project
          )
        );
      } else {
        onProjectsChange([...projects, updated]);
      }

      setForm(createEmptyForm());
      setSections([]);
    } catch (error) {
      console.error("POST/PATCH error:", error);
      alert(error.message || "Failed to save project");
    }
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>
        {form.id ? "Edit Project" : "Add New Project"}
      </h2>
      <p className={styles.rowMetaText}>
        Manage dossier metadata, curated hero media, rail labels, and cinematic
        intervals from one editor.
      </p>

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
        <form onSubmit={handleProjectSubmit} className={styles.formLayout}>
          <input
            placeholder="Project Name"
            value={form.name}
            onChange={(event) => {
              const value = event.target.value;
              setForm((prev) => ({
                ...prev,
                name: value,
                slug: generateSlug(value),
              }));
            }}
            className={styles.inputField}
          />

          <input
            placeholder="Summary"
            value={form.summary}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, summary: event.target.value }))
            }
            className={styles.inputField}
          />

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Dossier Metadata</h3>
            <p className={styles.rowMetaText}>
              These fields feed the atmospheric dossier hero without affecting
              section order.
            </p>
            <div className={styles.formLayout}>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className={styles.inputField}
              >
                <option value="">Status</option>
                {PROJECT_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <input
                placeholder="Year or year range"
                value={form.year}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, year: event.target.value }))
                }
                className={styles.inputField}
              />
              <input
                placeholder="Purpose"
                value={form.purpose}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, purpose: event.target.value }))
                }
                className={styles.inputField}
              />
            </div>
          </div>

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Project Cover</h3>
            <FileDrop
              label="Upload Project Cover"
              folder=""
              onUploaded={(url) =>
                setForm((prev) => ({ ...prev, image_url: url }))
              }
            />
            {form.image_url && (
              <div
                className={styles.gridThumbs}
                style={{ gridTemplateColumns: "90px" }}
              >
                <div className={styles.thumbBox}>
                  <img
                    src={form.image_url}
                    alt="project-cover"
                    className={styles.thumbImg}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, image_url: "" }))
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

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Hero Media</h3>
            <p className={styles.rowMetaText}>
              Choose a dedicated hero asset separate from cover art and body
              sections.
            </p>
            <div className={styles.formLayout}>
              <select
                value={form.hero_media.type}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      type: event.target.value === "video" ? "video" : "image",
                    },
                  }))
                }
                className={styles.inputField}
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>

              <FileDrop
                label={
                  form.hero_media.type === "video"
                    ? "Upload Hero Video"
                    : "Upload Hero Image"
                }
                folder=""
                onUploaded={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      url,
                    },
                  }))
                }
              />

              <input
                placeholder="Hero media URL"
                value={form.hero_media.url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      url: event.target.value,
                    },
                  }))
                }
                className={styles.inputField}
              />

              <FileDrop
                label="Upload Hero Poster (optional)"
                folder=""
                onUploaded={(url) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      poster_url: url,
                    },
                  }))
                }
              />

              <input
                placeholder="Hero poster URL (optional)"
                value={form.hero_media.poster_url}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      poster_url: event.target.value,
                    },
                  }))
                }
                className={styles.inputField}
              />

              <input
                placeholder="Hero media alt text"
                value={form.hero_media.alt}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    hero_media: {
                      ...prev.hero_media,
                      alt: event.target.value,
                    },
                  }))
                }
                className={styles.inputField}
              />
            </div>

            {form.hero_media.url && (
              <div
                className={styles.gridThumbs}
                style={{ gridTemplateColumns: "minmax(160px, 220px)" }}
              >
                <div
                  className={styles.thumbBox}
                  style={{ aspectRatio: "16 / 9" }}
                >
                  {renderMediaPreview(
                    form.hero_media.url,
                    form.hero_media.type,
                    form.hero_media.poster_url,
                    form.hero_media.alt
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        hero_media: {
                          ...prev.hero_media,
                          url: "",
                          poster_url: "",
                        },
                      }))
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

          <input
            placeholder="Slug (auto-generated)"
            value={form.slug}
            readOnly
            className={styles.readonlyInput}
          />

          <div className={styles.builderBox}>
            <h3 className={styles.miniHeader}>Page Builder</h3>
            <p className={styles.rowMetaText}>
              Each section can define its own rail label. Use the move controls
              to keep the current storytelling order intact.
            </p>
            <div className={styles.actionRow}>
              {[
                "specs",
                "materials",
                "gallery",
                "callouts",
                "videos",
                "text",
                "links",
                "media-interval",
              ].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addSection(type)}
                  className={styles.addSectionBtn}
                >
                  + {sectionTypeLabels[type]}
                </button>
              ))}
            </div>

            <div className={styles.formLayout} style={{ marginTop: "1rem" }}>
              {sections.map((section, index) => (
                <div key={section.id} className={styles.sectionEditorBox}>
                  <div className={styles.listItem}>
                    <div>
                      <h4 className={styles.sectionAccentTitle}>
                        {sectionTypeLabels[section.type] || section.type}
                      </h4>
                      <p className={styles.rowMetaText}>
                        Section {index + 1} in page order
                      </p>
                    </div>
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, "up")}
                        className={styles.editButton}
                        disabled={index === 0}
                      >
                        Move Up
                      </button>
                      <button
                        type="button"
                        onClick={() => moveSection(section.id, "down")}
                        className={styles.editButton}
                        disabled={index === sections.length - 1}
                      >
                        Move Down
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    placeholder="Navigation label"
                    value={section.navLabel || ""}
                    onChange={(event) =>
                      updateSection(section.id, {
                        navLabel: event.target.value,
                      })
                    }
                    className={styles.inputField}
                  />
                  <p className={styles.rowMetaText}>
                    This label appears in the dossier rail navigation.
                  </p>

                  {section.type === "specs" || section.type === "materials" ? (
                    <KVEditor
                      rows={
                        Array.isArray(section?.data?.rows) &&
                        section.data.rows.length > 0
                          ? section.data.rows
                          : section.type === "specs"
                            ? DEFAULT_SPECS_ROWS
                            : DEFAULT_MATERIALS_ROWS
                      }
                      onChange={(rows) =>
                        updateSectionData(section.id, { rows })
                      }
                    />
                  ) : null}

                  {section.type === "text" ? (
                    <div className={styles.formLayout}>
                      <input
                        type="text"
                        placeholder="Heading (e.g., ABOUT THIS PROJECT)"
                        value={section.data.heading}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            heading: event.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      <textarea
                        placeholder="Write content here..."
                        value={section.data.content}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            content: event.target.value,
                          })
                        }
                        className={styles.builderTextarea}
                        style={{ minHeight: "120px" }}
                      />
                    </div>
                  ) : null}

                  {section.type === "callouts" ? (
                    <div className={styles.formLayout}>
                      {(Array.isArray(section?.data?.items)
                        ? section.data.items
                        : []
                      ).map((item, index) => (
                        <div
                          key={`${section.id}-callout-${index}`}
                          className={styles.sectionEditorBox}
                        >
                          <input
                            type="text"
                            placeholder="Label"
                            value={item.label}
                            onChange={(event) => {
                              const nextItems = updateListItem(
                                section.data.items,
                                index,
                                {
                                  ...item,
                                  label: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                items: nextItems,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <input
                            type="text"
                            placeholder="Short detail"
                            value={item.detail}
                            onChange={(event) => {
                              const nextItems = updateListItem(
                                section.data.items,
                                index,
                                {
                                  ...item,
                                  detail: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                items: nextItems,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <div className={styles.actionRow}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="X %"
                              value={item.x}
                              onChange={(event) => {
                                const nextItems = updateListItem(
                                  section.data.items,
                                  index,
                                  {
                                    ...item,
                                    x: event.target.value,
                                  }
                                );
                                updateSectionData(section.id, {
                                  items: nextItems,
                                });
                              }}
                              className={styles.inputField}
                            />
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Y %"
                              value={item.y}
                              onChange={(event) => {
                                const nextItems = updateListItem(
                                  section.data.items,
                                  index,
                                  {
                                    ...item,
                                    y: event.target.value,
                                  }
                                );
                                updateSectionData(section.id, {
                                  items: nextItems,
                                });
                              }}
                              className={styles.inputField}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionData(section.id, {
                                items: removeListItem(
                                  section.data.items,
                                  index
                                ),
                              })
                            }
                            className={styles.deleteButton}
                          >
                            Remove Callout
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateSectionData(section.id, {
                            items: [
                              ...(Array.isArray(section?.data?.items)
                                ? section.data.items
                                : []),
                              { label: "", detail: "", x: 50, y: 50 },
                            ],
                          })
                        }
                        className={styles.addSectionBtn}
                      >
                        + Add Callout
                      </button>
                    </div>
                  ) : null}

                  {section.type === "videos" ? (
                    <div className={styles.formLayout}>
                      <FileDropMultiVideo
                        label="Upload Videos"
                        folder=""
                        onUploaded={(urls) =>
                          updateSectionData(section.id, {
                            videos: [
                              ...(Array.isArray(section?.data?.videos)
                                ? section.data.videos
                                : []),
                              ...urls.map((url) => ({ title: "", url })),
                            ],
                          })
                        }
                      />
                      {(Array.isArray(section?.data?.videos)
                        ? section.data.videos
                        : []
                      ).map((item, index) => (
                        <div
                          key={`${section.id}-video-${index}`}
                          className={styles.sectionEditorBox}
                        >
                          <input
                            type="text"
                            placeholder="Video title"
                            value={item.title}
                            onChange={(event) => {
                              const nextVideos = updateListItem(
                                section.data.videos,
                                index,
                                {
                                  ...item,
                                  title: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                videos: nextVideos,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <input
                            type="text"
                            placeholder="Video URL"
                            value={item.url}
                            onChange={(event) => {
                              const nextVideos = updateListItem(
                                section.data.videos,
                                index,
                                {
                                  ...item,
                                  url: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                videos: nextVideos,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionData(section.id, {
                                videos: removeListItem(
                                  section.data.videos,
                                  index
                                ),
                              })
                            }
                            className={styles.deleteButton}
                          >
                            Remove Video
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateSectionData(section.id, {
                            videos: [
                              ...(Array.isArray(section?.data?.videos)
                                ? section.data.videos
                                : []),
                              { title: "", url: "" },
                            ],
                          })
                        }
                        className={styles.addSectionBtn}
                      >
                        + Add Video
                      </button>
                    </div>
                  ) : null}

                  {section.type === "links" ? (
                    <div className={styles.formLayout}>
                      {(Array.isArray(section?.data?.links)
                        ? section.data.links
                        : []
                      ).map((item, index) => (
                        <div
                          key={`${section.id}-link-${index}`}
                          className={styles.sectionEditorBox}
                        >
                          <input
                            type="text"
                            placeholder="Link label"
                            value={item.label}
                            onChange={(event) => {
                              const nextLinks = updateListItem(
                                section.data.links,
                                index,
                                {
                                  ...item,
                                  label: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                links: nextLinks,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <input
                            type="text"
                            placeholder="https://example.com"
                            value={item.url}
                            onChange={(event) => {
                              const nextLinks = updateListItem(
                                section.data.links,
                                index,
                                {
                                  ...item,
                                  url: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                links: nextLinks,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <input
                            type="text"
                            placeholder="Short description (optional)"
                            value={item.description}
                            onChange={(event) => {
                              const nextLinks = updateListItem(
                                section.data.links,
                                index,
                                {
                                  ...item,
                                  description: event.target.value,
                                }
                              );
                              updateSectionData(section.id, {
                                links: nextLinks,
                              });
                            }}
                            className={styles.inputField}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateSectionData(section.id, {
                                links: removeListItem(
                                  section.data.links,
                                  index
                                ),
                              })
                            }
                            className={styles.deleteButton}
                          >
                            Remove Link
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() =>
                          updateSectionData(section.id, {
                            links: [
                              ...(Array.isArray(section?.data?.links)
                                ? section.data.links
                                : []),
                              { label: "", url: "", description: "" },
                            ],
                          })
                        }
                        className={styles.addSectionBtn}
                      >
                        + Add Link
                      </button>
                    </div>
                  ) : null}

                  {section.type === "gallery" ? (
                    <ProjectGalleryEditor
                      images={
                        Array.isArray(section?.data?.images)
                          ? section.data.images
                          : []
                      }
                      onChange={(images) =>
                        updateSectionData(section.id, { images })
                      }
                    />
                  ) : null}

                  {section.type === "media-interval" ? (
                    <div className={styles.formLayout}>
                      <select
                        value={section.data.mediaType}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            mediaType:
                              event.target.value === "image"
                                ? "image"
                                : "video",
                          })
                        }
                        className={styles.inputField}
                      >
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                      </select>
                      <FileDrop
                        label={
                          section.data.mediaType === "image"
                            ? "Upload Interval Image"
                            : "Upload Interval Video"
                        }
                        folder=""
                        onUploaded={(url) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            mediaUrl: url,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Interval media URL"
                        value={section.data.mediaUrl}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            mediaUrl: event.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      <FileDrop
                        label="Upload Interval Poster (optional)"
                        folder=""
                        onUploaded={(url) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            posterUrl: url,
                          })
                        }
                      />
                      <input
                        type="text"
                        placeholder="Interval poster URL (optional)"
                        value={section.data.posterUrl}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            posterUrl: event.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      <input
                        type="text"
                        placeholder="Caption label"
                        value={section.data.label}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            label: event.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      <input
                        type="text"
                        placeholder="Caption subline"
                        value={section.data.subline}
                        onChange={(event) =>
                          updateSectionData(section.id, {
                            ...section.data,
                            subline: event.target.value,
                          })
                        }
                        className={styles.inputField}
                      />
                      {section.data.mediaUrl ? (
                        <div
                          className={styles.gridThumbs}
                          style={{
                            gridTemplateColumns: "minmax(160px, 220px)",
                          }}
                        >
                          <div
                            className={styles.thumbBox}
                            style={{ aspectRatio: "16 / 9" }}
                          >
                            {renderMediaPreview(
                              section.data.mediaUrl,
                              section.data.mediaType,
                              section.data.posterUrl,
                              section.data.label
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                updateSectionData(section.id, {
                                  ...section.data,
                                  mediaUrl: "",
                                  posterUrl: "",
                                })
                              }
                              title="Remove"
                              className={styles.thumbClose}
                            >
                              x
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  {![
                    "specs",
                    "materials",
                    "text",
                    "callouts",
                    "videos",
                    "gallery",
                    "links",
                    "media-interval",
                  ].includes(section.type) ? (
                    <textarea
                      placeholder={`Edit data for ${section.type} section (JSON)...`}
                      value={JSON.stringify(section.data, null, 2)}
                      onChange={(event) => {
                        try {
                          updateSectionData(
                            section.id,
                            JSON.parse(event.target.value)
                          );
                        } catch {
                          updateSectionData(section.id, {
                            raw: event.target.value,
                          });
                        }
                      }}
                      className={styles.builderTextarea}
                    />
                  ) : null}

                  <button
                    type="button"
                    onClick={() => removeSection(section.id)}
                    className={styles.deleteButton}
                  >
                    Remove Section
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className={styles.submitButton}>
            {form.id ? "Update Project" : "+ Save Project"}
          </button>
        </form>
      )}

      {mode === "manage" && projects.length > 0 && (
        <div className={styles.listContainer}>
          <h3 className={styles.miniHeader}>Existing Projects</h3>
          <div className={styles.scrollList}>
            {projects.map((project) => (
              <div key={project.id} className={styles.listItem}>
                <div>
                  <strong>{project.name}</strong>
                  <p className={styles.rowMetaText}>{project.summary}</p>
                </div>
                <div className={styles.actionRow}>
                  <button
                    className={styles.editButton}
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>
                  <button
                    className={styles.deleteButton}
                    onClick={() => {
                      setDeleteTargetId(project.id);
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
        itemLabel="this project"
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
