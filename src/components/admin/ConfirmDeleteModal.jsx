'use client'

import { useEffect, useState } from "react"
import styles from "./ConfirmDeleteModal.module.css"

export default function ConfirmDeleteModal({
  open,
  itemLabel,
  submitting,
  error,
  onCancel,
  onConfirm,
}) {
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!open) {
      setPassword("")
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="confirm-delete-title" className={styles.title}>
          Confirm Delete
        </h3>
        <p className={styles.description}>
          This will permanently delete {itemLabel}. Enter admin password to continue.
        </p>

        <label htmlFor="delete-password" className={styles.label}>
          Admin Password
        </label>
        <input
          id="delete-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={styles.input}
          autoFocus
        />

        {error ? <p className={styles.error} role="alert">{error}</p> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.cancel} onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className={styles.confirm}
            onClick={() => onConfirm(password)}
            disabled={submitting || !password.trim()}
          >
            {submitting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
