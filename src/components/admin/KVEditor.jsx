"use client";
import { useState } from "react";
import { moveItem } from "@/Lib/adminUtils";
import styles from "@/app/admin/adminTheme.module.css";

export default function KVEditor({ rows, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);

  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    onChange(moveItem(rows || [], dragIdx, i));
    setDragIdx(null);
  };

  const updateKey = (i, val) => onChange(rows.map((r, idx) => (idx === i ? { ...r, key: val } : r)));
  const updateValue = (i, val) => onChange(rows.map((r, idx) => (idx === i ? { ...r, value: val } : r)));

  return (
    <div className={styles.formLayout}>
      {(rows || []).map((r, i) => (
        <div
          key={i}
          draggable
          onDragStart={() => setDragIdx(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => onDrop(i)}
          title="Drag to reorder"
          className={styles.kvRow}
        >
          <div className={styles.dragHandle}>?</div>
          <input
            type="text"
            value={r.key ?? ""}
            onChange={(e) => updateKey(i, e.target.value)}
            placeholder="Attribute"
            className={styles.inputField}
          />
          <input
            type="text"
            value={r.value ?? ""}
            onChange={(e) => updateValue(i, e.target.value)}
            placeholder="Value"
            className={styles.inputField}
          />
          <button type="button" onClick={() => onChange(rows.filter((_, idx) => idx !== i))} className={styles.deleteButton}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" onClick={() => onChange([...(rows || []), { key: "", value: "" }])} className={styles.addSectionBtn}>
        + Add Row
      </button>
    </div>
  );
}

