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

      <div className={styles.footerSocial} aria-label="Social media links">
        <a
          href="https://www.instagram.com/_empaerial_"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Empaerial on Instagram"
        >
          {t.footer_instagram}
        </a>
        <a
          href="https://www.linkedin.com/company/emp%C3%A6rial/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Connect with Empaerial on LinkedIn"
        >
          {t.footer_linkedin}
        </a>
        <a
          href="https://www.youtube.com/@Emp%C3%A6rial_UAV"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Visit Empaerial YouTube channel"
        >
          {t.footer_youtube}
        </a>
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
