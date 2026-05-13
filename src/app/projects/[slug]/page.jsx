"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";
import useProjects from "@/hooks/useProjects";
import styles from "./ProjectDetail.module.css";

function parseSections(rawSections) {
  if (Array.isArray(rawSections)) return rawSections;
  if (typeof rawSections !== "string") return [];

  try {
    const parsed = JSON.parse(rawSections);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeRows(section) {
  if (Array.isArray(section?.data?.rows)) {
    return section.data.rows.map((row) => ({
      key: row?.key || "—",
      value: row?.value || "N/A",
    }));
  }

  if (section?.data && typeof section.data === "object") {
    return Object.entries(section.data).map(([key, value]) => ({
      key: key.replaceAll("_", " "),
      value: value || "N/A",
    }));
  }

  return [];
}

function normalizeCallouts(section) {
  const rawItems = Array.isArray(section?.data?.items)
    ? section.data.items
    : [];

  return rawItems
    .map((item, index) => ({
      id: item?.id || `${item?.label || "callout"}-${index}`,
      label: item?.label || `Point ${index + 1}`,
      detail: item?.detail || "",
      x: Number(item?.x),
      y: Number(item?.y),
    }))
    .filter((item) => Number.isFinite(item.x) && Number.isFinite(item.y))
    .map((item) => ({
      ...item,
      x: Math.max(4, Math.min(96, item.x)),
      y: Math.max(6, Math.min(94, item.y)),
    }));
}

function normalizeVideos(sections) {
  return sections.flatMap((section) => {
    const rawVideos = Array.isArray(section?.data?.videos)
      ? section.data.videos
      : [];

    return rawVideos
      .map((item, index) => {
        if (typeof item === "string") {
          return {
            id: `${item}-${index}`,
            title: "",
            url: item,
          };
        }

        return {
          id: item?.id || `${item?.url || "video"}-${index}`,
          title: item?.title || "",
          url: item?.url || "",
        };
      })
      .filter((item) => item.url);
  });
}

function getYouTubeEmbedUrl(url) {
  if (!url) return "";
  if (url.includes("youtube.com/embed/")) return url;
  if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
  if (url.includes("youtu.be/")) {
    const videoId = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
  }
  return url;
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const t = lang === "tr" ? tr : en;
  const { projects, loading } = useProjects();

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  const project = useMemo(
    () => projects.find((item) => item.slug === slug),
    [projects, slug]
  );

  const sections = useMemo(
    () => parseSections(project?.sections),
    [project?.sections]
  );

  const galleryImages = useMemo(() => {
    const sectionImages = sections
      .filter((section) => section.type === "gallery")
      .flatMap((section) =>
        Array.isArray(section?.data?.images) ? section.data.images : []
      );

    return [...new Set([project?.image_url, ...sectionImages].filter(Boolean))];
  }, [project?.image_url, sections]);

  const specs = useMemo(() => {
    const specSection = sections.find((section) => section.type === "specs");
    return normalizeRows(specSection);
  }, [sections]);

  const materials = useMemo(() => {
    const materialSection = sections.find(
      (section) => section.type === "materials"
    );
    return normalizeRows(materialSection);
  }, [sections]);

  const callouts = useMemo(() => {
    const calloutSection = sections.find(
      (section) => section.type === "callouts"
    );
    return normalizeCallouts(calloutSection);
  }, [sections]);

  const textSections = useMemo(
    () => sections.filter((section) => section.type === "text"),
    [sections]
  );

  const videos = useMemo(
    () =>
      normalizeVideos(sections.filter((section) => section.type === "videos")),
    [sections]
  );

  const contactSection = useMemo(
    () => sections.find((section) => section.type === "contact"),
    [sections]
  );

  const contactTitle =
    contactSection?.data?.message ||
    (lang === "tr"
      ? `${project?.name || "Bu proje"} ile ilgileniyor musunuz?`
      : `Interested in ${project?.name || "this project"}?`);

  const contactText =
    lang === "tr"
      ? "Is birlikleri, sponsorluklar veya proje detaylari icin bizimle iletisime gecin."
      : "Reach out for collaborations, sponsorships, or a deeper technical conversation about the build.";

  if (loading) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <p className={styles.loading}>Loading project...</p>
        </main>
        <Footer t={t} />
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <div className={styles.inner}>
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className={styles.backBtn}
            >
              Back to Projects
            </button>
            <p className={styles.loading}>Project not found.</p>
          </div>
        </main>
        <Footer t={t} />
      </>
    );
  }

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <section className={styles.pageSection}>
          <div className={styles.inner}>
            <div className={styles.backRow}>
              <button
                type="button"
                onClick={() => router.push("/projects")}
                className={styles.backBtn}
              >
                Back to Projects
              </button>
            </div>

            <section className={styles.heroCard}>
              <div className={styles.heroMedia}>
                <div className={styles.heroImageFrame}>
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.name}
                      className={styles.heroImage}
                    />
                  ) : (
                    <div className={styles.heroPlaceholder}>
                      Project image coming soon.
                    </div>
                  )}

                  {callouts.map((callout, index) => (
                    <div
                      key={callout.id}
                      className={styles.calloutPin}
                      style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
                    >
                      <span className={styles.calloutDot}>{index + 1}</span>
                      <span className={styles.calloutLabel}>
                        {callout.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.heroContent}>
                <div className={styles.eyebrow}>Project Detail</div>
                <h1 className={styles.title}>{project.name}</h1>
                <p className={styles.summary}>
                  {project.summary ||
                    t.vespasian?.subtitle ||
                    "A modular UAV platform built for testing, iteration, and field performance."}
                </p>

                {specs.length > 0 && (
                  <div className={styles.quickSpecGrid}>
                    {specs.slice(0, 4).map((spec, index) => (
                      <div
                        key={`${spec.key}-${index}`}
                        className={styles.quickSpecCard}
                      >
                        <span className={styles.quickSpecLabel}>
                          {spec.key}
                        </span>
                        <strong className={styles.quickSpecValue}>
                          {spec.value}
                        </strong>
                      </div>
                    ))}
                  </div>
                )}

                {callouts.length > 0 && (
                  <div className={styles.calloutPanel}>
                    <div className={styles.panelTitle}>
                      Technical Highlights
                    </div>
                    <ol className={styles.calloutList}>
                      {callouts.map((callout, index) => (
                        <li
                          key={`${callout.id}-list`}
                          className={styles.calloutListItem}
                        >
                          <span className={styles.calloutIndex}>
                            {index + 1}
                          </span>
                          <div>
                            <div className={styles.calloutListLabel}>
                              {callout.label}
                            </div>
                            {callout.detail ? (
                              <p className={styles.calloutListDetail}>
                                {callout.detail}
                              </p>
                            ) : null}
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                <div className={styles.heroActions}>
                  <a
                    href={`mailto:${contactSection?.data?.email || "empaerial.uav@gmail.com"}`}
                    className={styles.primaryBtn}
                  >
                    {t.vespasian?.email_us || "Email Us"}
                  </a>
                  <a
                    href={contactSection?.data?.link || "#project-contact"}
                    className={styles.secondaryBtn}
                  >
                    {lang === "tr" ? "Iletisime Gec" : "Reach Out"}
                  </a>
                </div>
              </div>
            </section>

            {galleryImages.length > 1 && (
              <section className={styles.blockCard}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>Gallery</h2>
                </div>
                <div className={styles.galleryGrid}>
                  {galleryImages.map((src, index) => (
                    <img
                      key={`${src}-${index}`}
                      src={src}
                      alt={`${project.name} view ${index + 1}`}
                      className={styles.galleryImage}
                    />
                  ))}
                </div>
              </section>
            )}

            <section className={styles.dualGrid}>
              <div className={styles.blockCard}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>
                    {t.vespasian?.specifications || "Specifications"}
                  </h2>
                </div>
                {specs.length > 0 ? (
                  <div className={styles.dataGrid}>
                    {specs.map((spec, index) => (
                      <div
                        key={`${spec.key}-${index}-full`}
                        className={styles.dataRow}
                      >
                        <span className={styles.dataKey}>{spec.key}</span>
                        <span className={styles.dataValue}>{spec.value}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={styles.emptyText}>
                    Specifications will be added soon.
                  </p>
                )}
              </div>

              {materials.length > 0 && (
                <div className={styles.blockCard}>
                  <div className={styles.blockHeader}>
                    <h2 className={styles.blockTitle}>
                      {t.vespasian?.materials || "Materials"}
                    </h2>
                  </div>
                  <div className={styles.dataGrid}>
                    {materials.map((item, index) => (
                      <div
                        key={`${item.key}-${index}-material`}
                        className={styles.dataRow}
                      >
                        <span className={styles.dataKey}>{item.key}</span>
                        <span className={styles.dataValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {textSections.map((section, index) => (
              <section key={`text-${index}`} className={styles.blockCard}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>
                    {section?.data?.heading || "About the Project"}
                  </h2>
                </div>
                <p className={styles.bodyText}>
                  {section?.data?.content || "Details coming soon."}
                </p>
              </section>
            ))}

            {videos.length > 0 && (
              <section className={styles.blockCard}>
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>Videos</h2>
                </div>
                <div className={styles.videoGrid}>
                  {videos.map((video) => {
                    const isYouTube =
                      video.url.includes("youtube") ||
                      video.url.includes("youtu.be");

                    return (
                      <div key={video.id} className={styles.videoCard}>
                        {isYouTube ? (
                          <iframe
                            className={styles.videoFrame}
                            src={getYouTubeEmbedUrl(video.url)}
                            title={video.title || project.name}
                            allowFullScreen
                          />
                        ) : (
                          <video className={styles.videoFrame} controls>
                            <source src={video.url} type="video/mp4" />
                          </video>
                        )}
                        {video.title ? (
                          <div className={styles.videoCaption}>
                            {video.title}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            <section
              id="project-contact"
              className={`${styles.blockCard} ${styles.contactCard}`}
            >
              <div className={styles.blockHeader}>
                <h2 className={styles.blockTitle}>{contactTitle}</h2>
              </div>
              <p className={styles.bodyText}>{contactText}</p>
              <div className={styles.heroActions}>
                <a
                  href={`mailto:${contactSection?.data?.email || "empaerial.uav@gmail.com"}`}
                  className={styles.primaryBtn}
                >
                  {t.vespasian?.email_us || "Email Us"}
                </a>
                <a
                  href={contactSection?.data?.link || "/#contact"}
                  className={styles.secondaryBtn}
                >
                  {t.vespasian?.contact_section || "Contact Section ->"}
                </a>
              </div>
            </section>
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
