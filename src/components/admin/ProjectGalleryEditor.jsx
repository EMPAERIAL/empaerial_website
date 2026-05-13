'use client'
import { useState } from "react"
import { moveItem } from "@/Lib/adminUtils"
import {
  gridThumbs,
  thumbBox,
  thumbImg,
  thumbClose,
  formLayout,
} from "@/app/admin/adminStyles"
import { FileDropMulti } from "@/components/admin/FileDroppers"

export default function ProjectGalleryEditor({ images, onChange }) {
  const [dragIdx, setDragIdx] = useState(null)

  const onThumbDragStart = (i) => setDragIdx(i)
  const onThumbDragOver = (e) => e.preventDefault()
  const onThumbDrop = (i) => {
    if (dragIdx === null || dragIdx === i) return
    const next = moveItem(images || [], dragIdx, i)
    onChange(next)
    setDragIdx(null)
  }

  return (
    <div style={formLayout}>
      <FileDropMulti
        label="Upload Project Gallery Images"
        folder=""
        onUploaded={(urls) => onChange([...(images || []), ...urls])}
      />
      {Array.isArray(images) && images.length > 0 && (
        <div style={gridThumbs}>
          {images.map((url, idx) => (
            <div
              key={`${url}-${idx}`}
              style={thumbBox}
              draggable
              onDragStart={() => onThumbDragStart(idx)}
              onDragOver={onThumbDragOver}
              onDrop={() => onThumbDrop(idx)}
              title="Drag to reorder"
            >
              <img src={url} alt={`proj-gallery-${idx}`} style={thumbImg}/>
              <button
                type="button"
                onClick={() => {
                  const arr = [...images]
                  arr.splice(idx, 1)
                  onChange(arr)
                }}
                title="Remove"
                style={thumbClose}
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
