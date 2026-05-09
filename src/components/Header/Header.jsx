'use client';

import { useEffect, useState } from 'react';
import styles from './Header.module.css';

export default function Header({ t, lang, setLang }) {
  const [light, setLight] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('hero');
      const threshold = hero ? hero.offsetHeight - 80 : 80;
      setLight(window.scrollY > threshold);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <nav
      className={`${styles.nav} ${light ? styles.light : ''}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className={styles.inner}>
        {/* Brand */}
        <a href="/" className={styles.brand} aria-label="EMPÆRIAL home">
          <span className={styles.ae}>Æ</span>
          <span className={styles.wordmark}>EMPÆRIAL</span>
        </a>

        {/* Desktop links */}
        <div className={styles.links}>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="/" className={styles.link}>{t.nav_home}</a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="/blogs" className={styles.link}>{t.nav_blogs}</a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="/#projects" className={styles.link}>{t.nav_projects}</a>
          <span className={styles.dot} aria-hidden="true">·</span>
          <a href="/#contact" className={styles.link}>{t.nav_contact}</a>
          <span className={styles.dot} aria-hidden="true">·</span>
        </div>

        {/* Right controls */}
        <div className={styles.right}>
          <div className={styles.lang} role="group" aria-label="Language switch">
            <button
              className={lang === 'en' ? styles.langActive : styles.langBtn}
              onClick={() => setLang('en')}
              aria-label="Switch to English"
            >EN</button>
            <span className={styles.langSep} aria-hidden="true">|</span>
            <button
              className={lang === 'tr' ? styles.langActive : styles.langBtn}
              onClick={() => setLang('tr')}
              aria-label="Switch to Turkish"
            >TR</button>
          </div>
          <a href="/#contact" className={styles.apply}>APPLY →</a>
        </div>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${open ? styles.open : ''}`}
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="nav-drawer"
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div id="nav-drawer" className={styles.drawer} role="dialog" aria-modal="true" aria-label="Navigation menu">
          <a href="/" className={styles.drawerLink} onClick={close}>{t.nav_home}</a>
          <a href="/blogs" className={styles.drawerLink} onClick={close}>{t.nav_blogs}</a>
          <a href="/#projects" className={styles.drawerLink} onClick={close}>{t.nav_projects}</a>
          <a href="/#contact" className={styles.drawerLink} onClick={close}>{t.nav_contact}</a>
          <div className={styles.drawerLang}>
            <button className={lang === 'en' ? styles.langActive : styles.langBtn} onClick={() => setLang('en')}>EN</button>
            <span className={styles.langSep} aria-hidden="true">|</span>
            <button className={lang === 'tr' ? styles.langActive : styles.langBtn} onClick={() => setLang('tr')}>TR</button>
          </div>
          <a href="/#contact" className={`${styles.apply} ${styles.drawerApply}`} onClick={close}>APPLY →</a>
        </div>
      )}
    </nav>
  );
}
