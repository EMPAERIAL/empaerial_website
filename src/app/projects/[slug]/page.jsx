"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import useProjects from "@/hooks/useProjects";
import { normalizeProjectRecord } from "@/Lib/projectData";
import en from "@/translations/en.json";
import tr from "@/translations/tr.json";
import styles from "./ProjectDetail.module.css";

const STATUS_TRANSLATIONS = {
  en: {
    active: "Active",
    "work in progress": "Work in Progress",
    completed: "Completed",
    archived: "Archived",
  },
  tr: {
    active: "Aktif",
    "work in progress": "Devam Ediyor",
    completed: "Tamamlandi",
    archived: "Arsivlendi",
  },
};

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
      key: row?.key || "-",
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

function slugifyAnchor(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getProjectDetailCopy(lang, projectName) {
  const statusLabels = STATUS_TRANSLATIONS[lang] || STATUS_TRANSLATIONS.en;

  return {
    back: lang === "tr" ? "Projelere Don" : "Back to Projects",
    dossier: lang === "tr" ? "Proje Dosyasi" : "Project Dossier",
    heroEyebrow: lang === "tr" ? "Atmosferik Brifing" : "Atmospheric Briefing",
    loading: lang === "tr" ? "Proje yukleniyor..." : "Loading project...",
    notFound: lang === "tr" ? "Proje bulunamadi." : "Project not found.",
    heroPlaceholder:
      lang === "tr"
        ? "Kurgulanmis kahraman medyasi yakinda eklenecek."
        : "Curated hero media will be added soon.",
    gallery: lang === "tr" ? "Galeri" : "Gallery",
    videos: lang === "tr" ? "Videolar" : "Videos",
    materials: lang === "tr" ? "Materyaller" : "Materials",
    textSection: lang === "tr" ? "Proje Hakkinda" : "About the Project",
    sectionFallback: lang === "tr" ? "Detay Bolumu" : "Detail Section",
    specEmpty:
      lang === "tr"
        ? "Teknik ozellikler yakinda eklenecek."
        : "Specifications will be added soon.",
    materialsEmpty:
      lang === "tr"
        ? "Materyal bilgileri yakinda eklenecek."
        : "Material details will be added soon.",
    videosEmpty:
      lang === "tr"
        ? "Video icerigi yakinda eklenecek."
        : "Video content will be added soon.",
    detailFallback:
      lang === "tr" ? "Detaylar yakinda eklenecek." : "Details coming soon.",
    contactTitle:
      lang === "tr"
        ? `${projectName || "Bu proje"} ile ilgileniyor musunuz?`
        : `Interested in ${projectName || "this project"}?`,
    contactText:
      lang === "tr"
        ? "Is birlikleri, sponsorluklar veya proje detaylari icin bizimle iletisime gecin."
        : "Reach out for collaborations, sponsorships, or a deeper technical conversation about the build.",
    reachOut: lang === "tr" ? "Iletisime Gec" : "Reach Out",
    emailUs: lang === "tr" ? "E-Posta Gonder" : "Email Us",
    contactSection: lang === "tr" ? "Iletisim Bolumu ->" : "Contact Section ->",
    contactNav: lang === "tr" ? "Iletisim" : "Contact",
    metaLabels: {
      status: lang === "tr" ? "Durum" : "Status",
      year: lang === "tr" ? "Yil" : "Year",
      purpose: lang === "tr" ? "Amac" : "Purpose",
    },
    statusLabels,
  };
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [activeSectionId, setActiveSectionId] = useState("");
  const t = lang === "tr" ? tr : en;
  const { projects, loading } = useProjects();

  useEffect(() => {
    const userLang = navigator.language.startsWith("tr") ? "tr" : "en";
    setLang(userLang);
  }, []);

  const project = useMemo(() => {
    const matched = projects.find((item) => item.slug === slug);
    return matched ? normalizeProjectRecord(matched) : null;
  }, [projects, slug]);

  const sections = useMemo(
    () => parseSections(project?.sections),
    [project?.sections]
  );

  const galleryImages = useMemo(() => {
    const sectionImages = sections.flatMap((section) =>
      Array.isArray(section?.data?.images) ? section.data.images : []
    );

    return [...new Set([project?.image_url, ...sectionImages].filter(Boolean))];
  }, [project?.image_url, sections]);

  const contactSection = useMemo(
    () => sections.find((section) => section.type === "contact"),
    [sections]
  );

  const copy = useMemo(
    () => getProjectDetailCopy(lang, project?.name),
    [lang, project?.name]
  );

  const dossierRows = useMemo(
    () => [
      {
        label: copy.metaLabels.status,
        value: project?.status
          ? copy.statusLabels[project.status] || project.status
          : "-",
      },
      {
        label: copy.metaLabels.year,
        value: project?.year || "-",
      },
      {
        label: copy.metaLabels.purpose,
        value: project?.purpose || "-",
      },
    ],
    [
      copy.metaLabels,
      copy.statusLabels,
      project?.purpose,
      project?.status,
      project?.year,
    ]
  );

  const contactTitle = contactSection?.data?.message || copy.contactTitle;
  const heroMedia = project?.hero_media;
  const heroAlt = heroMedia?.alt || project?.name || "Project hero";
  const heroPoster = heroMedia?.poster_url || project?.image_url || "";
  const heroImage = heroMedia?.url || project?.image_url || "";
  const hasHeroVideo = heroMedia?.type === "video" && Boolean(heroMedia?.url);
  const hasHeroImage = heroMedia?.type !== "video" && Boolean(heroImage);

  const renderedSections = useMemo(() => {
    const visualGalleryImages = [...new Set(galleryImages.filter(Boolean))];

    return sections
      .filter((section) => section.type !== "contact")
      .map((section, index) => {
        const fallbackLabelMap = {
          specs: t.vespasian?.specifications || "Specifications",
          materials: t.vespasian?.materials || copy.materials,
          gallery: copy.gallery,
          videos: copy.videos,
          text: section?.data?.heading || copy.textSection,
        };

        const fallbackLabel =
          fallbackLabelMap[section.type] || copy.sectionFallback;
        const label = section.navLabel || fallbackLabel;
        const anchorBase = slugifyAnchor(
          section.navLabel ||
            section?.data?.heading ||
            `${section.type}-${index + 1}`
        );
        const anchor =
          anchorBase || `${section.type || "section"}-${index + 1}`;

        if (section.type === "gallery") {
          return {
            id: section.id,
            anchor,
            label,
            type: "gallery",
            title: section?.data?.heading || copy.gallery,
            images: visualGalleryImages,
          };
        }

        if (section.type === "specs") {
          return {
            id: section.id,
            anchor,
            label,
            type: "specs",
            title: section?.data?.heading || fallbackLabel,
            rows: normalizeRows(section),
          };
        }

        if (section.type === "materials") {
          return {
            id: section.id,
            anchor,
            label,
            type: "materials",
            title: section?.data?.heading || fallbackLabel,
            rows: normalizeRows(section),
          };
        }

        if (section.type === "videos") {
          return {
            id: section.id,
            anchor,
            label,
            type: "videos",
            title: section?.data?.heading || copy.videos,
            videos: normalizeVideos([section]),
          };
        }

        if (section.type === "text") {
          return {
            id: section.id,
            anchor,
            label,
            type: "text",
            title: section?.data?.heading || copy.textSection,
            content: section?.data?.content || copy.detailFallback,
          };
        }

        return null;
      })
      .filter(Boolean);
  }, [copy, galleryImages, sections, t.vespasian]);

  const railItems = useMemo(
    () => [
      ...renderedSections.map((section) => ({
        id: section.anchor,
        label: section.label,
      })),
      {
        id: "project-contact",
        label: contactSection?.navLabel || copy.contactNav,
      },
    ],
    [contactSection?.navLabel, copy.contactNav, renderedSections]
  );

  useEffect(() => {
    if (railItems.length === 0) {
      setActiveSectionId("");
      return;
    }

    const sectionElements = railItems
      .map(({ id }) => document.getElementById(id))
      .filter(Boolean);

    if (sectionElements.length === 0) {
      setActiveSectionId(railItems[0].id);
      return;
    }

    setActiveSectionId(railItems[0].id);

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visibleEntries.length > 0) {
          setActiveSectionId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.2, 0.35, 0.5, 0.7],
      }
    );

    sectionElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [railItems]);

  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (!element) return;

    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  if (loading) {
    return (
      <>
        <Header t={t} lang={lang} setLang={setLang} />
        <main className={styles.pageMain}>
          <p className={styles.loading}>{copy.loading}</p>
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
              className={styles.fallbackBackBtn}
            >
              {copy.back}
            </button>
            <p className={styles.loading}>{copy.notFound}</p>
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
          <div className={styles.layout}>
            <aside className={styles.railColumn} aria-label={copy.dossier}>
              <div className={styles.railCard}>
                <div className={styles.railEyebrow}>{copy.dossier}</div>
                <nav className={styles.railNav}>
                  {railItems.map((item, index) => {
                    const isActive = item.id === activeSectionId;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        className={`${styles.railLink} ${isActive ? styles.railLinkActive : ""}`}
                        onClick={() => scrollToSection(item.id)}
                        aria-current={isActive ? "true" : undefined}
                      >
                        <span className={styles.railIndex}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            <div className={styles.inner}>
              <section className={styles.heroCard}>
                <div className={styles.heroMediaShell}>
                  {hasHeroVideo ? (
                    <video
                      className={styles.heroMedia}
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={heroPoster || undefined}
                    >
                      <source src={heroMedia.url} type="video/mp4" />
                    </video>
                  ) : hasHeroImage ? (
                    <img
                      src={heroImage}
                      alt={heroAlt}
                      className={styles.heroMedia}
                    />
                  ) : heroPoster ? (
                    <img
                      src={heroPoster}
                      alt={heroAlt}
                      className={styles.heroMedia}
                    />
                  ) : (
                    <div className={styles.heroPlaceholder}>
                      {copy.heroPlaceholder}
                    </div>
                  )}

                  <div className={styles.heroScrim} />

                  <div className={styles.heroTopbar}>
                    <button
                      type="button"
                      onClick={() => router.push("/projects")}
                      className={styles.heroBackBtn}
                    >
                      {copy.back}
                    </button>
                    <div className={styles.heroEyebrow}>{copy.heroEyebrow}</div>
                  </div>

                  <div className={styles.heroOverlay}>
                    <div className={styles.heroIntro}>
                      <div className={styles.dossierTag}>{copy.dossier}</div>
                      <h1 className={styles.title}>{project.name}</h1>
                      <p className={styles.summary}>
                        {project.summary ||
                          t.vespasian?.subtitle ||
                          "A modular UAV platform built for testing, iteration, and field performance."}
                      </p>
                    </div>

                    <div className={styles.dossierPanel}>
                      {dossierRows.map((row) => (
                        <div key={row.label} className={styles.dossierRow}>
                          <span className={styles.dossierLabel}>
                            {row.label}
                          </span>
                          <strong className={styles.dossierValue}>
                            {row.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={styles.heroActions}>
                  <a
                    href={`mailto:${contactSection?.data?.email || "empaerial.uav@gmail.com"}`}
                    className={styles.primaryBtn}
                  >
                    {copy.emailUs}
                  </a>
                  <button
                    type="button"
                    onClick={() => scrollToSection("project-contact")}
                    className={styles.secondaryBtn}
                  >
                    {copy.reachOut}
                  </button>
                </div>
              </section>

              {renderedSections.map((section) => (
                <section
                  key={section.id}
                  id={section.anchor}
                  className={styles.blockCard}
                >
                  <div className={styles.blockHeader}>
                    <h2 className={styles.blockTitle}>{section.title}</h2>
                  </div>

                  {section.type === "gallery" ? (
                    section.images.length > 0 ? (
                      <div className={styles.galleryGrid}>
                        {section.images.map((src, index) => (
                          <img
                            key={`${src}-${index}`}
                            src={src}
                            alt={`${project.name} view ${index + 1}`}
                            className={styles.galleryImage}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyText}>{copy.detailFallback}</p>
                    )
                  ) : null}

                  {section.type === "specs" ? (
                    section.rows.length > 0 ? (
                      <div className={styles.dataGrid}>
                        {section.rows.map((row, index) => (
                          <div
                            key={`${row.key}-${index}-spec`}
                            className={styles.dataRow}
                          >
                            <span className={styles.dataKey}>{row.key}</span>
                            <span className={styles.dataValue}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyText}>{copy.specEmpty}</p>
                    )
                  ) : null}

                  {section.type === "materials" ? (
                    section.rows.length > 0 ? (
                      <div className={styles.dataGrid}>
                        {section.rows.map((row, index) => (
                          <div
                            key={`${row.key}-${index}-material`}
                            className={styles.dataRow}
                          >
                            <span className={styles.dataKey}>{row.key}</span>
                            <span className={styles.dataValue}>
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className={styles.emptyText}>{copy.materialsEmpty}</p>
                    )
                  ) : null}

                  {section.type === "text" ? (
                    <p className={styles.bodyText}>{section.content}</p>
                  ) : null}

                  {section.type === "videos" ? (
                    section.videos.length > 0 ? (
                      <div className={styles.videoGrid}>
                        {section.videos.map((video) => {
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
                    ) : (
                      <p className={styles.emptyText}>{copy.videosEmpty}</p>
                    )
                  ) : null}
                </section>
              ))}

              <section
                id="project-contact"
                className={`${styles.blockCard} ${styles.contactCard}`}
              >
                <div className={styles.blockHeader}>
                  <h2 className={styles.blockTitle}>{contactTitle}</h2>
                </div>
                <p className={styles.bodyText}>{copy.contactText}</p>
                <div className={styles.contactActions}>
                  <a
                    href={`mailto:${contactSection?.data?.email || "empaerial.uav@gmail.com"}`}
                    className={styles.primaryBtn}
                  >
                    {copy.emailUs}
                  </a>
                  <a
                    href={contactSection?.data?.link || "/#contact"}
                    className={styles.secondaryBtn}
                  >
                    {copy.contactSection}
                  </a>
                </div>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer t={t} />
    </>
  );
}
