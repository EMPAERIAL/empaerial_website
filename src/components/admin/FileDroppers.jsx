'use client'
import { useState } from "react"
import { useDropzone } from "react-dropzone"
import { uploadWithProgress } from "@/Lib/uploadService"

export function FileDrop({ label, folder, onUploaded }) {
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: async (files) => {
      const file = files[0]
      if (!file) return
      setUploading(true)
      try {
        const url = await uploadWithProgress(file, folder, setProgress)
        onUploaded(url)
        alert(`✅ ${label} uploaded!`)
      } catch (err) {
        alert("❌ Upload failed")
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
  })

  return (
    <div
      {...getRootProps()}
      style={{
        border: "2px dashed rgba(0,180,216,0.4)",
        borderRadius: "10px",
        padding: "1rem",
        textAlign: "center",
        color: "#00B4D8",
        background: isDragActive ? "rgba(0,180,216,0.1)" : "rgba(255,255,255,0.04)",
        cursor: "pointer",
        marginBottom: "0.5rem",
        transition: "0.3s",
      }}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <p>Uploading... {progress}%</p>
      ) : (
        <p>{isDragActive ? "Drop file here" : `${label} (click or drop)`}</p>
      )}
    </div>
  )
}

export function FileDropMulti({ label, folder, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [overall, setOverall] = useState(0)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "image/*": [] },
    onDrop: async (files) => {
      if (!files || files.length === 0) return
      setUploading(true)
      try {
        const total = files.length
        let done = 0
        const urls = []
        for (const f of files) {
          const url = await uploadWithProgress(f, folder, () => {})
          urls.push(url)
          done += 1
          setOverall(Math.round((done / total) * 100))
        }
        onUploaded(urls)
        alert(`✅ Uploaded ${urls.length} file(s)!`)
      } catch (e) {
        alert("❌ Some uploads failed")
      } finally {
        setUploading(false)
        setOverall(0)
      }
    },
  })

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed rgba(0,180,216,0.4)",
          borderRadius: "10px",
          padding: "1rem",
          textAlign: "center",
          color: "#00B4D8",
          background: isDragActive ? "rgba(0,180,216,0.1)" : "rgba(255,255,255,0.04)",
          cursor: "pointer",
          transition: "0.3s",
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading... {overall}%</p>
        ) : (
          <p>{isDragActive ? "Drop images here" : `${label} (click or drop multiple)`}</p>
        )}
      </div>
    </div>
  )
}

export function FileDropMultiVideo({ label, folder, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [overall, setOverall] = useState(0)
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "video/*": [] },
    onDrop: async (files) => {
      if (!files || files.length === 0) return
      setUploading(true)
      try {
        const total = files.length
        let done = 0
        const urls = []
        for (const f of files) {
          const url = await uploadWithProgress(f, folder, () => {})
          urls.push(url)
          done += 1
          setOverall(Math.round((done / total) * 100))
        }
        onUploaded(urls)
        alert(`✅ Uploaded ${urls.length} video(s)!`)
      } catch (e) {
        alert("❌ Some uploads failed")
      } finally {
        setUploading(false)
        setOverall(0)
      }
    },
  })

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed rgba(0,180,216,0.4)",
          borderRadius: "10px",
          padding: "1rem",
          textAlign: "center",
          color: "#00B4D8",
          background: isDragActive ? "rgba(0,180,216,0.1)" : "rgba(255,255,255,0.04)",
          cursor: "pointer",
          transition: "0.3s",
        }}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <p>Uploading... {overall}%</p>
        ) : (
          <p>{isDragActive ? "Drop videos here" : `${label} (click or drop multiple)`}</p>
        )}
      </div>
    </div>
  )
}
