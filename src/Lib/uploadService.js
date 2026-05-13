export async function uploadWithProgress(file, folder, onProgress) {
  const xhr = new XMLHttpRequest()
  const body = new FormData()

  body.append("file", file)
  body.append("folder", folder || "")

  const promise = new Promise((resolve, reject) => {
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable && onProgress) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText)
          resolve(data.publicUrl)
        } catch (err) {
          reject(new Error("Invalid upload response"))
        }
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

  xhr.open("POST", "/api/upload")
  xhr.send(body)
  return promise
}
