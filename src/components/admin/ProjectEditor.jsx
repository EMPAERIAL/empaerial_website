"use client";
import { useState } from "react";
import KVEditor from "@/components/admin/KVEditor";
import ProjectGalleryEditor from "@/components/admin/ProjectGalleryEditor";
import { FileDrop } from "@/components/admin/FileDroppers";
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
  sectionEditorBox,
  listContainer,
  scrollList,
  miniHeader,
  listItem,
  deleteButton,
  editButton,
  thumbBox,
  thumbImg,
  thumbClose,
  modeSwitchBar,
  modeSwitchButton,
  modeSwitchButtonActive,
} from "@/app/admin/adminStyles";
import {
  toTitleCaseNoUnderscore,
  generateSlug,
  normalizeKeyValueSection,
  DEFAULT_SPECS_ROWS,
  DEFAULT_MATERIALS_ROWS,
} from "@/Lib/adminUtils";

const sectionTemplates = {
  specs: { rows: DEFAULT_SPECS_ROWS.map((r) => ({ ...r })) },
  materials: { rows: DEFAULT_MATERIALS_ROWS.map((r) => ({ ...r })) },
  gallery: { images: [] },
  text: { heading: "ABOUT THIS PROJECT", content: "" },
};

const createContactSection = (projectName = "this project") => ({
  id: "contact-fixed",
  type: "contact",
  data: {
    email: "empaerial.uav@gmail.com",
    link: "/#contact",
    message: `Interested in ${projectName}?`,
  },
});

export default function ProjectEditor({ projects, onProjectsChange }) {
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({
    name: "",
    summary: "",
    image_url: "",
    slug: "",
    id: null,
    gallery_images: [],
  });
  const [sections, setSections] = useState([]);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const addSection = (type) =>
    setSections((prev) => [
      ...prev,
      { id: Date.now(), type, data: sectionTemplates[type] || {} },
    ]);
  const updateSection = (id, newData) =>
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, data: newData } : s))
    );
  const removeSection = (id) =>
    setSections((prev) => prev.filter((s) => s.id !== id));

  const handleEdit = (item) => {
    setMode("create");
    setForm({
      name: item.name || "",
      summary: item.summary || "",
      image_url: item.image_url || "",
      slug: item.slug || "",
      id: item.id,
      gallery_images: item.gallery_images || [],
      videos: item.videos || [],
    });
    try {
      if (item.sections) {
        const parsed = Array.isArray(item.sections)
          ? item.sections
          : JSON.parse(item.sections);
        setSections(
          parsed
            .filter((s) => s.type !== "contact")
            .map((sec) => {
              if (sec.type === "gallery") {
                return {
                  ...sec,
                  data: {
                    images: Array.isArray(sec.data?.images)
                      ? sec.data.images
                      : [],
                  },
                };
              }
              if (sec.type === "specs" || sec.type === "materials") {
                return { ...sec, data: normalizeKeyValueSection(sec) };
              }
              return sec;
            })
        );
      } else {
        setSections([]);
      }
    } catch {
      setSections([]);
    }
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
      onProjectsChange(projects.filter((p) => p?.id !== id));
      setDeleteTargetId(null);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Deletion failed");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();

    const normalized = sections.map((sec) => {
      if (sec.type === "specs" || sec.type === "materials") {
        const data = normalizeKeyValueSection(sec);
        const rows = (data.rows || []).map((r) => ({
          key: toTitleCaseNoUnderscore(r.key),
          value: r.value,
        }));
        return { ...sec, data: { rows } };
      }
      if (sec.type === "gallery") {
        const images = Array.isArray(sec.data?.images) ? sec.data.images : [];
        return { ...sec, data: { images } };
      }
      return sec;
    });

    const filteredSections = normalized.filter((s) => s.type !== "contact");
    const contact = createContactSection(form.name || "this project");
    const payload = { ...form, sections: [...filteredSections, contact] };

    try {
      const res = await fetch("/api/projects", {
        method: form.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      alert(form.id ? "Project updated" : "Project added");
      if (form.id)
        onProjectsChange(projects.map((p) => (p.id === form.id ? updated : p)));
      else onProjectsChange([...projects, updated]);
      setForm({
        name: "",
        summary: "",
        image_url: "",
        slug: "",
        id: null,
        gallery_images: [],
      });
      setSections([]);
    } catch (err) {
      console.error("POST/PATCH error:", err);
      alert("Failed to save project");
    }
  };

  return (
    <div style={sectionCard}>
      <h2 style={sectionTitle}>
        {form.id ? "Edit Project" : "Add New Project"}
      </h2>

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
        <form onSubmit={handleProjectSubmit} style={formLayout}>
          <input
            placeholder="Project Name"
            value={form.name}
            onChange={(e) => {
              const val = e.target.value;
              setForm((prev) => ({
                ...prev,
                name: val,
                slug: generateSlug(val),
              }));
            }}
            style={inputField}
          />
          <input
            placeholder="Summary"
            value={form.summary}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, summary: e.target.value }))
            }
            style={inputField}
          />

          <div style={{ ...builderBox, padding: "1rem" }}>
            <h3 style={miniHeader}>Project Cover</h3>
            <FileDrop
              label="Upload Project Cover"
              folder=""
              onUploaded={(url) =>
                setForm((prev) => ({ ...prev, image_url: url }))
              }
            />
            {form.image_url && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px",
                  gap: "10px",
                }}
              >
                <div style={thumbBox}>
                  <img
                    src={form.image_url}
                    alt="project-cover"
                    style={thumbImg}
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, image_url: "" }))
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

          <input
            placeholder="Slug (auto-generated)"
            value={form.slug}
            readOnly
            style={readonlyInput}
          />

          <div style={builderBox}>
            <h3 style={miniHeader}>Page Builder</h3>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["specs", "materials", "gallery", "text"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addSection(type)}
                  style={addSectionBtn}
                >
                  + {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>

            <div
              style={{
                marginTop: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {sections.map((s) => (
                <div key={s.id} style={sectionEditorBox}>
                  <h4 style={{ color: "#00B4D8" }}>{s.type.toUpperCase()}</h4>

                  {s.type === "specs" || s.type === "materials" ? (
                    <KVEditor
                      rows={
                        Array.isArray(s.data?.rows) && s.data.rows.length > 0
                          ? s.data.rows
                          : s.type === "specs"
                            ? DEFAULT_SPECS_ROWS
                            : DEFAULT_MATERIALS_ROWS
                      }
                      onChange={(rows) => updateSection(s.id, { rows })}
                    />
                  ) : s.type === "text" ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem",
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Heading (e.g., ABOUT THIS PROJECT)"
                        value={s.data.heading}
                        onChange={(e) =>
                          updateSection(s.id, {
                            ...s.data,
                            heading: e.target.value,
                          })
                        }
                        style={inputField}
                      />
                      <textarea
                        placeholder="Write content here..."
                        value={s.data.content}
                        onChange={(e) =>
                          updateSection(s.id, {
                            ...s.data,
                            content: e.target.value,
                          })
                        }
                        style={{ ...builderTextarea, minHeight: "120px" }}
                      />
                    </div>
                  ) : s.type === "gallery" ? (
                    <ProjectGalleryEditor
                      images={
                        Array.isArray(s.data?.images) ? s.data.images : []
                      }
                      onChange={(images) => updateSection(s.id, { images })}
                    />
                  ) : (
                    <textarea
                      placeholder={`Edit data for ${s.type} section (JSON)...`}
                      value={JSON.stringify(s.data, null, 2)}
                      onChange={(e) => {
                        try {
                          updateSection(s.id, JSON.parse(e.target.value));
                        } catch {
                          updateSection(s.id, { raw: e.target.value });
                        }
                      }}
                      style={builderTextarea}
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removeSection(s.id)}
                    style={deleteButton}
                  >
                    Remove Section
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={submitButton}>
            {form.id ? "Update Project" : "+ Save Project"}
          </button>
        </form>
      )}

      {mode === "manage" && projects.length > 0 && (
        <div style={listContainer}>
          <h3 style={miniHeader}>Existing Projects</h3>
          <div style={scrollList}>
            {projects.map((p) => (
              <div key={p.id} style={listItem}>
                <div>
                  <strong>{p.name}</strong>
                  <p style={{ margin: 0, fontSize: "0.85rem", opacity: 0.7 }}>
                    {p.summary}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button style={editButton} onClick={() => handleEdit(p)}>
                    Edit
                  </button>
                  <button
                    style={deleteButton}
                    onClick={() => {
                      setDeleteTargetId(p.id);
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
