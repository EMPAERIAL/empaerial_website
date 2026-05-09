'use client';

import WingCut from '../WingCut/WingCut';
import styles from './Hero.module.css';

export default function Hero({ t }) {
  return (
    <section className={styles.hero} id="hero">
      {/* Propeller watermark */}
      <svg className={styles.prop} viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <g transform="translate(100,100)">
          {[0, 120, 240].map((deg) => (
            <ellipse
              key={deg}
              cx="0"
              cy="-55"
              rx="18"
              ry="55"
              fill="#fff"
              transform={`rotate(${deg})`}
            />
          ))}
          <circle cx="0" cy="0" r="10" fill="#fff" />
        </g>
      </svg>

      {/* Main content */}
      <div className={styles.content}>
        <p className={styles.eyebrow}>UAV TEAM · TEKNOFEST</p>
        <h1 className={styles.title}>EMPÆRIAL</h1>
        <p className={styles.subtitle}>{t?.hero_subtitle}</p>
        <div className={styles.ctas}>
          <a href="/#team" className="btn-white">MEET THE TEAM</a>
          <a href="/#projects" className="btn-ghost">VIEW PROJECTS</a>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className={styles.scroll} aria-hidden="true">
        <span className={styles.scrollLine} />
      </div>

      {/* Telemetry */}
      <div className={styles.telemetry} aria-hidden="true">
        <span>LAT 41.0082°N</span>
        <span>LNG 28.9784°E</span>
        <span>ALT 0m</span>
        <span>STATUS GROUNDED</span>
      </div>

      <WingCut fill="#000" bgColor="#fff" />
    </section>
  );
}
