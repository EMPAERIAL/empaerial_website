'use client'
import { useState } from "react"
import { moveItem } from "@/Lib/adminUtils"
import { inputField, addSectionBtn } from "@/app/admin/adminStyles"

export default function KVEditor({ rows, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);

  const onDragStart = (i) => setDragIdx(i);
  const onDragOver = (e) => e.preventDefault();
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    const next = moveItem(rows || [], dragIdx, i);
    onChange(next);
    setDragIdx(null);
  };

  const updateKey = (i, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, key: val } : r));
    onChange(next);
  };
  const updateValue = (i, val) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, value: val } : r));
    onChange(next);
  };
  const addRow = () => onChange([...(rows || []), { key: "", value: "" }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {(rows || []).map((r, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => onDragStart(i)}
          onDragOver={onDragOver}
          onDrop={() => onDrop(i)}
          title="Drag to reorder"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(15, 20, 25, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            borderRadius: "8px",
            padding: "0.6rem 0.8rem",
          }}
        >
          {}
          <div
            style={{
              color: "#00B4D8",
              fontSize: "1rem",
              cursor: "grab",
              userSelect: "none",
              flex: "0 0 auto",
            }}
          >
            ⠿
          </div>

          {}
          <input
            type="text"
            value={r.key ?? ""}
            onChange={(e) => updateKey(i, e.target.value)}
            placeholder="Attribute"
            style={{
              ...inputField,
              flex: "1 1 42%",
              minWidth: "120px",
              background: "rgba(20, 25, 30, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: "0.9rem",
            }}
          />

          {}
          <input
            type="text"
            value={r.value ?? ""}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder="Value"
            style={{
              ...inputField,
              flex: "1 1 42%",
              minWidth: "120px",
              background: "rgba(20, 25, 30, 0.8)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#fff",
              fontSize: "0.9rem",
            }}
          />

          {}
          <button
            type="button"
            onClick={() => removeRow(i)}
            title="Remove row"
            style={{
              background: "rgba(255,60,60,0.15)",
              border: "1px solid rgba(255,100,100,0.25)",
              color: "#FF6B6B",
              borderRadius: "6px",
              padding: "0.4rem 0.7rem",
              cursor: "pointer",
              flex: "0 0 auto",
              transition: "0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,80,80,0.25)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,60,60,0.15)")
            }
          >
            ✖
          </button>
        </div>
      ))}

      {}
      <button
        type="button"
        onClick={addRow}
        style={{
          ...addSectionBtn,
          width: "100%",
          marginTop: "0.5rem",
          fontWeight: "600",
          padding: "0.7rem 0",
        }}
      >
        + Add Row
      </button>

      <style jsx>{`
        @media (max-width: 768px) {
          div[draggable] {
            flex-direction: column;
            align-items: stretch;
          }
          div[draggable] input {
            width: 100%;
          }
          div[draggable] button {
            align-self: flex-end;
          }
        }
      `}</style>
    </div>
  );
}
