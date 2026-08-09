"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import SearchOverlay from "@/components/Search/SearchOverlay";
import useScrollLock from "@/hooks/useScrollLock";
import styles from "./Header.module.css";

export default function Header({ t, lang, setLang }) {
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setIsMac(
      /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent)
    );
    setMounted(true);
  }, []);

  // Ctrl/Cmd+K from anywhere on the page opens search.
  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(false);
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById("hero");
      const threshold = hero ? hero.offsetHeight - 80 : 80;
      setLight(window.scrollY > threshold);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav
      className={`${styles.nav} ${light ? styles.light : ""} ${open ? styles.navOpen : ""}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.inner}>
        {/* Brand */}
        <a href="/" className={styles.brand} aria-label="EMPÆRIAL home">
          <img
            src="/images/empaerial-logo-white-transparent.png"
            alt="EMPÆRIAL"
            className={styles.logo}
          />
        </a>

        {/* Desktop links */}
        <div className={styles.links}>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <a href="/" className={styles.link}>
            {t.nav_home}
          </a>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <a href="/blogs" className={styles.link}>
            {t.nav_blogs}
          </a>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <a href="/#projects" className={styles.link}>
            {t.nav_projects}
          </a>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <a href="/#contact" className={styles.link}>
            {t.nav_contact}
          </a>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
        </div>

        {/* Right controls */}
        <div className={styles.right}>
          <button
            type="button"
            className={styles.search}
            onClick={() => setSearchOpen(true)}
            aria-label={t?.search?.label || "Search"}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <circle
                cx="9"
                cy="9"
                r="6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              />
              <path
                d="M13.5 13.5 L17.5 17.5"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
            </svg>
            <span className={styles.searchKeys} aria-hidden="true">
              {isMac ? "⌘" : "Ctrl"} K
            </span>
          </button>

          <div
            className={styles.lang}
            role="group"
            aria-label="Language switch"
          >
            <button
              className={lang === "en" ? styles.langActive : styles.langBtn}
              onClick={() => setLang("en")}
              aria-label="Switch to English"
            >
              EN
            </button>
            <span className={styles.langSep} aria-hidden="true">
              |
            </span>
            <button
              className={lang === "tr" ? styles.langActive : styles.langBtn}
              onClick={() => setLang("tr")}
              aria-label="Switch to Turkish"
            >
              TR
            </button>
          </div>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${open ? styles.open : ""}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-drawer"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/*
        Mobile drawer — portalled onto document.body rather than left inside
        <nav>. The bar carries a backdrop-filter, which makes it the containing
        block for position:fixed descendants in every engine that applies the
        property. Nested here, the drawer's inset:0 resolved against the 64px
        bar instead of the viewport: on iOS the menu collapsed into the header,
        throwing the first links off-screen and letting the page show through.
      */}
      {open &&
        mounted &&
        createPortal(
          <div
            id="nav-drawer"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <a href="/" className={styles.drawerLink} onClick={close}>
              {t.nav_home}
            </a>
            <a href="/blogs" className={styles.drawerLink} onClick={close}>
              {t.nav_blogs}
            </a>
            <a href="/#projects" className={styles.drawerLink} onClick={close}>
              {t.nav_projects}
            </a>
            <a href="/#contact" className={styles.drawerLink} onClick={close}>
              {t.nav_contact}
            </a>
            <div className={styles.drawerLang}>
              <button
                className={lang === "en" ? styles.langActive : styles.langBtn}
                onClick={() => setLang("en")}
              >
                EN
              </button>
              <span className={styles.langSep} aria-hidden="true">
                |
              </span>
              <button
                className={lang === "tr" ? styles.langActive : styles.langBtn}
                onClick={() => setLang("tr")}
              >
                TR
              </button>
            </div>
          </div>,
          document.body
        )}

      <SearchOverlay
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        t={t}
        lang={lang}
      />
    </nav>
  );
}
