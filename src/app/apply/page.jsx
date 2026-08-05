"use client";

import { useEffect, useMemo, useState } from "react";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import WingCut from "@/components/WingCut/WingCut";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";
import styles from "./Apply.module.css";

const DEPARTMENTS = ["software", "electronics", "mechanical", "coordination"];

const EMPTY_FORM = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  university: "",
  department: "",
  skills: "",
  portfolio: "",
  motivation: "",
};

function getApplyCopy(pageT) {
  return {
    eyebrow: pageT?.eyebrow || "JOIN THE CREW",
    title: pageT?.title || "APPLY TO EMPÆRIAL",
    subtitle:
      pageT?.subtitle ||
      "Tell us who you are, what you build, and which department you want to fly with. No prior UAV experience required — curiosity and commitment count more.",
    back: pageT?.back || "Back to team",
    formEyebrow: pageT?.form_eyebrow || "APPLICATION",
    formTitle: pageT?.form_title || "CREW INTAKE FORM",
    formNote: pageT?.form_note || "Fields marked * are required.",
    asideTitle: pageT?.aside_title || "WHAT HAPPENS NEXT",
    steps: pageT?.steps || [
      "We read every application as a team.",
      "Shortlisted candidates get an intro call within two weeks.",
      "You join a department and start on a live build.",
    ],
    asideContactLabel: pageT?.aside_contact_label || "QUESTIONS?",
    submit: pageT?.submit || "SUBMIT APPLICATION",
    submitting: pageT?.submitting || "SENDING…",
    successTitle: pageT?.success_title || "APPLICATION RECEIVED",
    successText:
      pageT?.success_text ||
      "Thanks for applying. We have logged your application and will reach out by email once the team has reviewed it.",
    successAction: pageT?.success_action || "BACK TO HOME",
    successAgain: pageT?.success_again || "Submit another application",
    errorGeneric:
      pageT?.error_generic ||
      "We could not send your application. Please try again in a moment.",
    errorRequired:
      pageT?.error_required || "Please fill in all required fields.",
    errorEmail: pageT?.error_email || "Please enter a valid email address.",
    labels: {
      fullName: pageT?.labels?.full_name || "Full name",
      email: pageT?.labels?.email || "Email",
      phone: pageT?.labels?.phone || "Phone / WhatsApp",
      country: pageT?.labels?.country || "Country",
      university: pageT?.labels?.university || "University & programme",
      department: pageT?.labels?.department || "Preferred department",
      skills: pageT?.labels?.skills || "Skills & tools",
      portfolio: pageT?.labels?.portfolio || "Portfolio / GitHub / LinkedIn",
      motivation: pageT?.labels?.motivation || "Why do you want to join?",
    },
    placeholders: {
      fullName: pageT?.placeholders?.full_name || "Ada Lovelace",
      email: pageT?.placeholders?.email || "you@example.com",
      phone: pageT?.placeholders?.phone || "+90 5xx xxx xx xx",
      country: pageT?.placeholders?.country || "Türkiye",
      university:
        pageT?.placeholders?.university ||
        "Istanbul Aydın University — Computer Engineering",
      department: pageT?.placeholders?.department || "Select a department",
      skills: pageT?.placeholders?.skills || "Python, KiCad, Fusion 360, ROS…",
      portfolio:
        pageT?.placeholders?.portfolio || "https://github.com/yourname",
      motivation:
        pageT?.placeholders?.motivation ||
        "Tell us what draws you to UAVs and what you would like to build with us.",
    },
    optional: pageT?.optional || "Optional",
    departments: {
      software: pageT?.departments?.software || "Software",
      electronics: pageT?.departments?.electronics || "Electronics",
      mechanical: pageT?.departments?.mechanical || "Mechanical",
      coordination: pageT?.departments?.coordination || "Coordination",
    },
  };
}

export default function ApplyPage() {
  const [lang, setLang] = useState("en");
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const t = lang === "tr" ? tr : en;
  const copy = useMemo(() => getApplyCopy(t.apply_page), [t]);

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  // Local reveal observer — the shared one lives on the home page only.
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("on");
        });
      },
      { threshold: 0.12 }
    );

    const nodes = document.querySelectorAll(".reveal");
    nodes.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [status]);

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (status === "sending") return;

    const required = ["fullName", "email", "department", "motivation"];
    if (required.some((field) => !form[field].trim())) {
      setStatus("error");
      setErrorMsg(copy.errorRequired);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus("error");
      setErrorMsg(copy.errorEmail);
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || copy.errorGeneric);
      }

      setForm(EMPTY_FORM);
      setStatus("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || copy.errorGeneric);
    }
  };

  const sending = status === "sending";

  return (
    <>
      <header role="banner">
        <Header t={t} lang={lang} setLang={setLang} />
      </header>

      <main role="main">
        {/* ── Dark intro band ─────────────────────────── */}
        <section
          className={styles.intro}
          id="hero"
          aria-labelledby="apply-title"
        >
          <svg className={styles.prop} viewBox="0 0 200 60" aria-hidden="true">
            <use href="#prop-bare" />
          </svg>

          <div className={styles.introInner}>
            <a href="/#team" className={styles.back}>
              ← {copy.back}
            </a>
            <p className={styles.introEyebrow}>{copy.eyebrow}</p>
            <h1 id="apply-title" className={styles.introTitle}>
              {copy.title}
            </h1>
            <p className={styles.introSub}>{copy.subtitle}</p>
          </div>

          <div className={styles.telemetry} aria-hidden="true">
            <span>INTAKE OPEN</span>
            <span>4 DEPARTMENTS</span>
            <span>STUDENTS WELCOME</span>
          </div>

          <WingCut fill="#fff" bgColor="#000" />
        </section>

        {/* ── Form ────────────────────────────────────── */}
        <section className="sec sec-light" aria-labelledby="apply-form-title">
          <div className="sec-inner">
            {status === "success" ? (
              <div className={`${styles.success} reveal`} role="status">
                <p className="sec-eyebrow">{copy.formEyebrow}</p>
                <h2 className="sec-h2">{copy.successTitle}</h2>
                <p className="sec-sub">{copy.successText}</p>
                <div className={styles.successActions}>
                  <a href="/" className={styles.submit}>
                    {copy.successAction} →
                  </a>
                  <button
                    type="button"
                    className={styles.ghostBtn}
                    onClick={() => setStatus("idle")}
                  >
                    {copy.successAgain}
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.layout}>
                {/* Aside */}
                <aside className={`${styles.aside} reveal`}>
                  <p className={styles.asideTitle}>{copy.asideTitle}</p>
                  <ol className={styles.steps}>
                    {copy.steps.map((step, i) => (
                      <li key={i} className={styles.step}>
                        <span className={styles.stepIndex}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className={styles.asideContact}>
                    <p className={styles.asideContactLabel}>
                      {copy.asideContactLabel}
                    </p>
                    <a
                      href={`mailto:${t.contact_email}`}
                      className={styles.asideEmail}
                    >
                      {t.contact_email}
                    </a>
                  </div>
                </aside>

                {/* Form */}
                <div className={`${styles.formWrap} reveal`}>
                  <div className={styles.formHead}>
                    <p className="sec-eyebrow">{copy.formEyebrow}</p>
                    <h2 id="apply-form-title" className={styles.formTitle}>
                      {copy.formTitle}
                    </h2>
                    <p className={styles.formNote}>{copy.formNote}</p>
                  </div>

                  <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                    noValidate
                  >
                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="fullName">
                          {copy.labels.fullName} *
                        </label>
                        <input
                          id="fullName"
                          name="fullName"
                          className={styles.input}
                          value={form.fullName}
                          onChange={update("fullName")}
                          placeholder={copy.placeholders.fullName}
                          autoComplete="name"
                          required
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="email">
                          {copy.labels.email} *
                        </label>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          className={styles.input}
                          value={form.email}
                          onChange={update("email")}
                          placeholder={copy.placeholders.email}
                          autoComplete="email"
                          required
                        />
                      </div>
                    </div>

                    <div className={styles.row}>
                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="phone">
                          {copy.labels.phone}{" "}
                          <span className={styles.optional}>
                            ({copy.optional})
                          </span>
                        </label>
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          className={styles.input}
                          value={form.phone}
                          onChange={update("phone")}
                          placeholder={copy.placeholders.phone}
                          autoComplete="tel"
                        />
                      </div>

                      <div className={styles.field}>
                        <label className={styles.label} htmlFor="country">
                          {copy.labels.country}{" "}
                          <span className={styles.optional}>
                            ({copy.optional})
                          </span>
                        </label>
                        <input
                          id="country"
                          name="country"
                          className={styles.input}
                          value={form.country}
                          onChange={update("country")}
                          placeholder={copy.placeholders.country}
                          autoComplete="country-name"
                        />
                      </div>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="university">
                        {copy.labels.university}{" "}
                        <span className={styles.optional}>
                          ({copy.optional})
                        </span>
                      </label>
                      <input
                        id="university"
                        name="university"
                        className={styles.input}
                        value={form.university}
                        onChange={update("university")}
                        placeholder={copy.placeholders.university}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="department">
                        {copy.labels.department} *
                      </label>
                      <select
                        id="department"
                        name="department"
                        className={styles.select}
                        value={form.department}
                        onChange={update("department")}
                        required
                      >
                        <option value="" disabled>
                          {copy.placeholders.department}
                        </option>
                        {DEPARTMENTS.map((key) => (
                          <option key={key} value={key}>
                            {copy.departments[key]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="skills">
                        {copy.labels.skills}{" "}
                        <span className={styles.optional}>
                          ({copy.optional})
                        </span>
                      </label>
                      <input
                        id="skills"
                        name="skills"
                        className={styles.input}
                        value={form.skills}
                        onChange={update("skills")}
                        placeholder={copy.placeholders.skills}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="portfolio">
                        {copy.labels.portfolio}{" "}
                        <span className={styles.optional}>
                          ({copy.optional})
                        </span>
                      </label>
                      <input
                        id="portfolio"
                        name="portfolio"
                        type="url"
                        className={styles.input}
                        value={form.portfolio}
                        onChange={update("portfolio")}
                        placeholder={copy.placeholders.portfolio}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="motivation">
                        {copy.labels.motivation} *
                      </label>
                      <textarea
                        id="motivation"
                        name="motivation"
                        rows={6}
                        className={styles.textarea}
                        value={form.motivation}
                        onChange={update("motivation")}
                        placeholder={copy.placeholders.motivation}
                        required
                      />
                    </div>

                    {status === "error" && errorMsg && (
                      <p className={styles.error} role="alert">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      className={styles.submit}
                      disabled={sending}
                    >
                      {sending ? copy.submitting : `${copy.submit} →`}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer t={t} />
    </>
  );
}
