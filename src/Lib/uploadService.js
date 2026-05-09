const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const BUCKET = "uploads"

export async function uploadWithProgress(file, folder, onProgress) {
  const ext = file.name.split(".").pop()
  const filename = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
  const path = folder ? `${folder}/${filename}` : filename

  const url = `${SUPABASE_URL}/storage/v1/object/${encodeURIComponent(BUCKET)}/${encodeURIComponent(path)}`
  const xhr = new XMLHttpRequest()

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`)
      } else {
        console.error("Upload failed:", xhr.status, xhr.responseText)
        reject(new Error("Upload failed"))
      }
    }
    xhr.onerror = (e) => {
      console.error("XHR error", e)
      reject(e)
    }
  })

  xhr.open("PUT", url)
  xhr.setRequestHeader("Authorization", `Bearer ${SUPABASE_ANON}`)
  xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream")
  xhr.send(file)
  return promise
}
