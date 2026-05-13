"use client";
import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { uploadWithProgress } from "@/Lib/uploadService";
import styles from "@/app/admin/adminTheme.module.css";

function DropZone({ uploading, progress, label, isDragActive, getRootProps, getInputProps, dragText, idleText }) {
  return (
    <div {...getRootProps()} className={`${styles.dropZone} ${isDragActive ? styles.dropZoneActive : ""}`}>
      <input {...getInputProps()} />
      {uploading ? <p>Uploading... {progress}%</p> : <p>{isDragActive ? dragText : idleText || `${label} (click or drop)`}</p>}
    </div>
  );
}

export function FileDrop({ label, folder, onUploaded }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    onDrop: async (files) => {
      const file = files[0];
      if (!file) return;
      setUploading(true);
      try {
        const url = await uploadWithProgress(file, folder, setProgress);
        onUploaded(url);
        alert(`? ${label} uploaded!`);
      } catch {
        alert("Upload failed");
      } finally {
        setUploading(false);
        setProgress(0);
      }
    },
  });

  return <DropZone uploading={uploading} progress={progress} label={label} isDragActive={isDragActive} getRootProps={getRootProps} getInputProps={getInputProps} dragText="Drop file here" />;
}

async function uploadMany(files, folder, setOverall) {
  const total = files.length;
  let done = 0;
  const urls = [];
  for (const f of files) {
    const url = await uploadWithProgress(f, folder, () => {});
    urls.push(url);
    done += 1;
    setOverall(Math.round((done / total) * 100));
  }
  return urls;
}

export function FileDropMulti({ label, folder, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [overall, setOverall] = useState(0);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "image/*": [] },
    onDrop: async (files) => {
      if (!files?.length) return;
      setUploading(true);
      try {
        const urls = await uploadMany(files, folder, setOverall);
        onUploaded(urls);
        alert(`? Uploaded ${urls.length} file(s)!`);
      } catch {
        alert("Some uploads failed");
      } finally {
        setUploading(false);
        setOverall(0);
      }
    },
  });

  return <DropZone uploading={uploading} progress={overall} label={label} isDragActive={isDragActive} getRootProps={getRootProps} getInputProps={getInputProps} dragText="Drop images here" idleText={`${label} (click or drop multiple)`} />;
}

export function FileDropMultiVideo({ label, folder, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [overall, setOverall] = useState(0);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: true,
    accept: { "video/*": [] },
    onDrop: async (files) => {
      if (!files?.length) return;
      setUploading(true);
      try {
        const urls = await uploadMany(files, folder, setOverall);
        onUploaded(urls);
        alert(`? Uploaded ${urls.length} video(s)!`);
      } catch {
        alert("Some uploads failed");
      } finally {
        setUploading(false);
        setOverall(0);
      }
    },
  });

  return <DropZone uploading={uploading} progress={overall} label={label} isDragActive={isDragActive} getRootProps={getRootProps} getInputProps={getInputProps} dragText="Drop videos here" idleText={`${label} (click or drop multiple)`} />;
}

