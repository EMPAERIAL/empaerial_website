"use client";
import { useState, useRef, useEffect } from "react";
import styles from "@/app/admin/adminTheme.module.css";

export default function CustomSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={styles.selectRoot}>
      <label className={styles.selectLabel}>{label}</label>
      <div onClick={() => setOpen(!open)} className={styles.selectBox}>
        {value ? options.find((o) => o.value === value)?.label : "Select a team..."}
        <span style={{ float: "right", opacity: 0.7 }}>?</span>
        {open && (
          <div className={styles.selectMenu}>
            {options.map((opt) => (
              <div
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`${styles.selectMenuItem} ${value === opt.value ? styles.selectMenuItemActive : ""}`}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

