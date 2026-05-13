"use client";
import { useState } from "react";
import { moveItem } from "@/Lib/adminUtils";
import { FileDropMulti } from "@/components/admin/FileDroppers";
import styles from "@/app/admin/adminTheme.module.css";

export default function ProjectGalleryEditor({ images, onChange }) {
  const [dragIdx, setDragIdx] = useState(null);

  const onThumbDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return;
    onChange(moveItem(images || [], dragIdx, i));
    setDragIdx(null);
  };

  return (
    <div className={styles.formLayout}>
      <FileDropMulti label="Upload Project Gallery Images" folder="" onUploaded={(urls) => onChange([...(images || []), ...urls])} />
      {Array.isArray(images) && images.length > 0 && (
        <div className={styles.gridThumbs}>
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              className={styles.thumbBox}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onThumbDrop(idx)}
              title="Drag to reorder"
            >
              <img src={url} alt={`proj-gallery-${idx}`} className={styles.thumbImg} />
              <button
                type="button"
                onClick={() => {
                  const arr = [...images];
                  arr.splice(idx, 1);
                  onChange(arr);
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
  );
}

