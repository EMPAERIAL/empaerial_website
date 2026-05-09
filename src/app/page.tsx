'use client';

import { useState, useEffect } from "react";
import Header from "../components/Header/Header";
import Hero from "../components/Hero/Hero";
import Section from "../components/Section/Section";
import Footer from "../components/Footer/Footer";
import Team from "../components/Team/Team";
import Projects from "./projects/page";
import Sponsors from "../components/Sponsors/Sponsors";
import styles from "./page.module.css";

import en from "@/translations/en.json";
import tr from "@/translations/tr.json";

export default function Page() {
  const [lang, setLang] = useState<"en" | "tr">("en");

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  const t = lang === "tr" ? tr : en;

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal");
    const revealObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("on");
        });
      },
      { threshold: 0.12 }
    );

    elements.forEach((el) => revealObs.observe(el));
    return () => elements.forEach((el) => revealObs.unobserve(el));
  }, []);

  return (
    <>
      <header role="banner">
        <Header t={t} lang={lang} setLang={setLang} />
      </header>

      <main role="main">
        <Hero />

        <Section id="team" aria-labelledby="team-title">
          <Team t={t} />
        </Section>

        <Projects t={t} />

        <Sponsors t={t} />

        <section className={styles.contactSection} id="contact" aria-labelledby="contact-title">
          <div className={styles.contactInner}>
            <div className={`${styles.contactHeader} reveal`}>
              <div className={styles.eyebrow}>{t.contact_eyebrow || "CONTACT"}</div>
              <h2 id="contact-title" className={styles.contactTitle}>
                {t.contact_heading || t.contact_title}
              </h2>
              <p className={styles.contactSubtitle}>
                {t.contact_sub || "Reach out for collaborations, sponsorships, or to join the team."}
              </p>
            </div>

            <div className={`${styles.contactGrid} reveal`}>
              <div className={styles.contactItem}>
                <div className={styles.contactChannel}>
                  {t.contact_email_short_label || t.contact_email_label}
                </div>
                <a href={`mailto:${t.contact_email}`} className={styles.contactValue}>
                  {t.contact_email}
                </a>
              </div>
              <div className={styles.contactItem}>
                <div className={styles.contactChannel}>
                  {t.contact_number_short_label || t.contact_number_label}
                </div>
                <a
                  href={`https://wa.me/${t.contact_number.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.contactValue}
                >
                  {t.contact_number}
                </a>
              </div>
            </div>

            <div className={`${styles.contactSocial} reveal`}>
              <a href="https://www.instagram.com/_empaerial_" target="_blank" rel="noopener noreferrer">
                {t.footer_instagram}
              </a>
              <a
                href="https://www.linkedin.com/company/emp%C3%A6rial/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.footer_linkedin}
              </a>
              <a href="https://www.youtube.com/@Emp%C3%A6rial_UAV" target="_blank" rel="noopener noreferrer">
                {t.footer_youtube}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer t={t} />
    </>
  );
}
