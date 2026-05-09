'use client';

import React from "react";
import WingCut from "@/components/WingCut/WingCut";
import styles from "./Sponsors.module.css";

export default function Sponsors({ t }) {
  const placeholders = [0, 1, 2];

  return (
    <section className={styles.sponsorsSection} id="sponsors" aria-labelledby="sponsors-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>{t.sponsors_eyebrow || "SPONSORS"}</div>
          <h2 id="sponsors-title" className={styles.title}>
            {t.sponsors_title}
          </h2>
        </div>

        <div className={styles.sponsorsTier}>
          <div className={styles.tierLabel}>GOLD</div>
          <div className={styles.goldWrap}>
            <a
              href="https://batuelektroteknik.com.tr/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visit Batu Elektrik website"
              className={styles.goldLink}
            >
              <img src="/images/batu.png" alt="Batu Elektrik" loading="lazy" />
            </a>
          </div>
        </div>

        <div className={styles.sponsorsTier}>
          <div className={styles.tierLabel}>SILVER</div>
          <div className={styles.placeholderRow}>
            {placeholders.map((item) => (
              <div className={styles.sponsorPlaceholder} key={`silver-${item}`}>
                <span>OPEN</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.sponsorsTier}>
          <div className={styles.tierLabel}>BRONZE</div>
          <div className={styles.placeholderRow}>
            {placeholders.map((item) => (
              <div className={styles.sponsorPlaceholder} key={`bronze-${item}`}>
                <span>OPEN</span>
              </div>
            ))}
          </div>
        </div>

        <p className={styles.sponsorsNote}>
          {t.sponsors_note_prefix || "Interested in supporting EMPÆRIAL?"}{" "}
          <a href={`mailto:${t.contact_email || "empaerial.uav@gmail.com"}`}>
            {t.sponsors_note_link || "Contact us →"}
          </a>
        </p>
      </div>

      <WingCut fill="#000" style={{ marginTop: 80 }} />
    </section>
  );
}
