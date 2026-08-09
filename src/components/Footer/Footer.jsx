"use client";
import React from "react";
import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer({ t }) {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={styles.footerProp} aria-hidden="true">
        <svg width="64" height="20">
          <use href="#prop-bare" />
        </svg>
      </div>

      <div className={styles.footerCopy}>
        <Link
          href="/admin-login"
          className={styles.adminLink}
          aria-label="Return to admin login"
          tabIndex={-1}
        >
          Return
        </Link>{" "}
        <span>{t.footer_copyright}</span>
      </div>
    </footer>
  );
}
