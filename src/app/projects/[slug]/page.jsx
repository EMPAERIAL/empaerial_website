"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const SECTION_LABELS = {
  specs: { en: "Specifications", tr: "Ozellikler" },
  materials: { en: "Materials", tr: "Malzemeler" },
  gallery: { en: "Gallery", tr: "Galeri" },
  callouts: { en: "Callouts", tr: "Aciklamalar" },
  videos: { en: "Videos", tr: "Videolar" },
  text: { en: "Overview", tr: "Genel Bakis" },
  "media-interval": { en: "Transition", tr: "Gecis" },
  contact: { en: "Contact", tr: "Iletisim" },
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeRows(section) {
  if (Array.isArray(section?.data?.rows)) {
    return section.data.rows
      .map((row) => ({
        key: row?.key || "-",
        value: row?.value || "-",
      }))
      .filter((row) => row.key || row.value);
  }

  if (section?.data && typeof section.data === "object") {
    return Object.entries(section.data)
      .map(([key, value]) => ({
        key: key.replaceAll("_", " "),
        value: value || "-",
      }))
      .filter((row) => row.key || row.value);
  }

  return [];
}

function normalizeVideoItems(rawVideos) {
  return (Array.isArray(rawVideos) ? rawVideos : [])
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: `video-${index}`,
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

function getSectionLabel(type, lang) {
  return SECTION_LABELS[type]?.[lang] || SECTION_LABELS[type]?.en || "Section";
}

function getSectionHeading(section, lang) {
  if (section?.type === "text" && section?.data?.heading) {
    return section.data.heading;
  }

  return getSectionLabel(section?.type, lang);
}

function getSectionNavLabel(section, lang) {
  return section?.navLabel?.trim() || getSectionLabel(section?.type, lang);
}

function getProjectDetailCopy(lang, projectName) {
  const statusLabels = STATUS_TRANSLATIONS[lang] || STATUS_TRANSLATIONS.en;

  return {
    back: lang === "tr" ? "Projelere Don" : "Back to Projects",
    dossier: lang === "tr" ? "Proje Dosyasi" : "Project Dossier",
    heroEyebrow: lang === "tr" ? "Atmosferik Brifing" : "Atmospheric Briefing",
    routeEyebrow: lang === "tr" ? "Dossier Route" : "Dossier Route",
    loading: lang === "tr" ? "Proje yukleniyor..." : "Loading project...",
    notFound: lang === "tr" ? "Proje bulunamadi." : "Project not found.",
    heroPlaceholder:
      lang === "tr"
        ? "Kurgulanmis acilis medyasi bekleniyor."
        : "Curated opening media pending.",
    autoplayFallback:
      lang === "tr"
        ? "Otomatik oynatma engellendi. Oynatma kontrolleri kullanilabilir."
        : "Autoplay was blocked. Playback controls remain available.",
    galleryEmpty:
      lang === "tr"
        ? "Gorsel dosya yakinda eklenecek."
        : "Visual dossier pending.",
    specsEmpty:
      lang === "tr" ? "Teknik telemetri bekleniyor." : "Telemetry pending.",
    materialsEmpty:
      lang === "tr"
        ? "Malzeme kaydi bekleniyor."
        : "Material register pending.",
    textEmpty:
      lang === "tr"
        ? "Anlatim notlari yakinda eklenecek."
        : "Narrative notes pending.",
    videosEmpty:
      lang === "tr"
        ? "Video belgeleri yakinda eklenecek."
        : "Video dossier pending.",
    calloutsEmpty:
      lang === "tr"
        ? "Aciklama noktalarinin islenmesi suruyor."
        : "Annotation pass pending.",
    intervalEmpty:
      lang === "tr" ? "Gecis medyasi bekleniyor." : "Transition media pending.",
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
    contactSection: lang === "tr" ? "Iletisim Bolumu" : "Contact Section",
    intervalLabel: lang === "tr" ? "Gecis" : "Interval",
    metaLabels: {
      status: lang === "tr" ? "Durum" : "Status",
      year: lang === "tr" ? "Yil" : "Year",
      purpose: lang === "tr" ? "Amac" : "Purpose",
    },
    statusLabels,
  };
}

function AtmosphericMedia({
  type = "image",
  src,
  poster,
  alt,
  className,
  desktopAutoplay = false,
  copy,
}) {
  const mediaRef = useRef(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(min-width: 769px)");
    const syncViewport = () => setIsDesktop(mediaQuery.matches);

    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);

    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (type !== "video" || !src) return undefined;
    if (desktopAutoplay && !isDesktop) return undefined;

    const mediaNode = mediaRef.current;
    if (!mediaNode) return undefined;

    let cancelled = false;
    setAutoplayBlocked(false);
    mediaNode.muted = true;
    mediaNode.defaultMuted = true;

    const playAttempt = mediaNode.play();

    if (playAttempt?.catch) {
      playAttempt.catch(() => {
        if (!cancelled) setAutoplayBlocked(true);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [desktopAutoplay, isDesktop, src, type]);

  if (!src) return null;

  if (type === "video") {
    const shouldAutoplay = desktopAutoplay ? isDesktop : true;

    return (
      <div className={styles.mediaWrap}>
        <video
          ref={mediaRef}
          className={className}
          autoPlay={shouldAutoplay}
          muted
          loop
          playsInline
          controls={autoplayBlocked || !shouldAutoplay}
          poster={poster || undefined}
        >
          <source src={src} type="video/mp4" />
        </video>
        {autoplayBlocked ? (
          <div className={styles.mediaFallbackBadge}>
            {copy.autoplayFallback}
          </div>
        ) : null}
      </div>
    );
  }

  return <img src={src} alt={alt} className={className} />;
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const router = useRouter();
  const [lang, setLang] = useState("en");
  const [activeSection, setActiveSection] = useState("");
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
    () =>
      Array.isArray(project?.sections)
        ? project.sections.filter((section) => section.type !== "contact")
        : [],
    [project?.sections]
  );

  const contactSection = useMemo(
    () =>
      Array.isArray(project?.sections)
        ? project.sections.find((section) => section.type === "contact")
        : null,
    [project?.sections]
  );

  const copy = useMemo(
    () => getProjectDetailCopy(lang, project?.name),
    [lang, project?.name]
  );

  const heroMedia = project?.hero_media;
  const heroAlt = heroMedia?.alt || project?.name || "Project hero";
  const heroPoster = heroMedia?.poster_url || project?.image_url || "";
  const heroImage = heroMedia?.url || project?.image_url || "";
  const heroType = heroMedia?.type === "video" ? "video" : "image";
  const fallbackStageImage = heroPoster || heroImage;

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

  const railItems = useMemo(() => {
    const dynamicItems = sections.map((section, index) => {
      const label = getSectionNavLabel(section, lang);
      return {
        id: `section-${index + 1}-${slugify(label || section.type)}`,
        index,
        label,
        type: section.type,
        heading: getSectionHeading(section, lang),
        section,
      };
    });

    return [
      ...dynamicItems,
      {
        id: "project-contact",
        index: dynamicItems.length,
        label: contactSection?.navLabel || getSectionLabel("contact", lang),
        type: "contact",
        heading: getSectionLabel("contact", lang),
        section: contactSection,
      },
    ];
  }, [contactSection, lang, sections]);

  useEffect(() => {
    if (!railItems.length || typeof window === "undefined") return undefined;

    setActiveSection((current) => current || railItems[0].id);

    const elements = railItems
      .map((item) => document.getElementById(item.id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (left, right) => right.intersectionRatio - left.intersectionRatio
          );

        if (visibleEntries[0]?.target?.id) {
          setActiveSection(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.15, 0.35, 0.6],
      }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [railItems]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (!element) return;

    const offset = window.innerWidth <= 768 ? 148 : 112;
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
  };

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
          <div className={styles.notFoundShell}>
            <button
              type="button"
              onClick={() => router.push("/projects")}
              className={styles.heroBackBtn}
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

  const renderSectionBody = (section, item, sectionNumber) => {
    if (section.type === "gallery") {
      const galleryImages = [
        ...new Set(
          [
            ...(Array.isArray(section?.data?.images)
              ? section.data.images
              : []),
            project?.image_url,
          ].filter(Boolean)
        ),
      ];

      if (!galleryImages.length) {
        return <p className={styles.emptyText}>{copy.galleryEmpty}</p>;
      }

      return (
        <div className={styles.galleryGrid}>
          {galleryImages.map((src, index) => (
            <figure
              key={`${item.id}-${src}-${index}`}
              className={`${styles.galleryCard} ${
                index === 0 ? styles.galleryCardFeatured : ""
              }`}
            >
              <img
                src={src}
                alt={`${project.name} view ${index + 1}`}
                className={styles.galleryImage}
              />
              <figcaption className={styles.galleryMeta}>
                {String(sectionNumber).padStart(2, "0")} /{" "}
                {String(index + 1).padStart(2, "0")}
              </figcaption>
            </figure>
          ))}
        </div>
      );
    }

    if (section.type === "specs" || section.type === "materials") {
      const rows = normalizeRows(section);

      if (!rows.length) {
        return (
          <p className={styles.emptyText}>
            {section.type === "specs" ? copy.specsEmpty : copy.materialsEmpty}
          </p>
        );
      }

      return (
        <div className={styles.dataGrid}>
          {rows.map((row, index) => (
            <div
              key={`${item.id}-${row.key}-${index}`}
              className={styles.dataRow}
            >
              <span className={styles.dataKey}>{row.key}</span>
              <span className={styles.dataValue}>{row.value}</span>
            </div>
          ))}
        </div>
      );
    }

    if (section.type === "text") {
      return (
        <p className={styles.bodyText}>
          {section?.data?.content?.trim() || copy.textEmpty}
        </p>
      );
    }

    if (section.type === "videos") {
      const videos = normalizeVideoItems(section?.data?.videos);

      if (!videos.length) {
        return <p className={styles.emptyText}>{copy.videosEmpty}</p>;
      }

      return (
        <div className={styles.videoGrid}>
          {videos.map((video) => {
            const isYouTube =
              video.url.includes("youtube") || video.url.includes("youtu.be");

            return (
              <article key={video.id} className={styles.videoCard}>
                {isYouTube ? (
                  <iframe
                    className={styles.videoFrame}
                    src={getYouTubeEmbedUrl(video.url)}
                    title={video.title || project.name}
                    allowFullScreen
                  />
                ) : (
                  <video className={styles.videoFrame} controls playsInline>
                    <source src={video.url} type="video/mp4" />
                  </video>
                )}
                <div className={styles.videoMeta}>
                  <span className={styles.videoIndex}>
                    {String(sectionNumber).padStart(2, "0")}
                  </span>
                  <span className={styles.videoTitle}>
                    {video.title || getSectionHeading(section, lang)}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      );
    }

    if (section.type === "callouts") {
      const items = Array.isArray(section?.data?.items)
        ? section.data.items
        : [];

      if (!items.length) {
        return <p className={styles.emptyText}>{copy.calloutsEmpty}</p>;
      }

      return (
        <div className={styles.calloutLayout}>
          <div className={styles.calloutStage}>
            {fallbackStageImage ? (
              <img
                src={fallbackStageImage}
                alt={project.name}
                className={styles.calloutStageImage}
              />
            ) : (
              <div className={styles.calloutStageFallback}>
                {copy.galleryEmpty}
              </div>
            )}
            <div className={styles.calloutStageScrim} />
            {items.map((callout, index) => (
              <div
                key={`${item.id}-callout-${index}`}
                className={styles.calloutPin}
                style={{
                  left: `${Number(callout?.x ?? 50)}%`,
                  top: `${Number(callout?.y ?? 50)}%`,
                }}
              >
                <span className={styles.calloutDot} />
                <div className={styles.calloutTooltip}>
                  <strong>{callout?.label || `Point ${index + 1}`}</strong>
                  <span>{callout?.detail || copy.calloutsEmpty}</span>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.calloutList}>
            {items.map((callout, index) => (
              <div
                key={`${item.id}-callout-copy-${index}`}
                className={styles.calloutListItem}
              >
                <span className={styles.calloutListIndex}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <strong className={styles.calloutListLabel}>
                    {callout?.label || `Point ${index + 1}`}
                  </strong>
                  <p className={styles.calloutListDetail}>
                    {callout?.detail || copy.calloutsEmpty}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (section.type === "media-interval") {
      const mediaType =
        section?.data?.mediaType === "image" ? "image" : "video";
      const mediaUrl = section?.data?.mediaUrl || "";
      const posterUrl = section?.data?.posterUrl || "";
      const overlayLabel =
        section?.data?.label || item.label || copy.intervalLabel;
      const overlaySubline = section?.data?.subline || "";

      return (
        <div className={styles.intervalFrame}>
          {mediaUrl ? (
            <AtmosphericMedia
              type={mediaType}
              src={mediaUrl}
              poster={posterUrl}
              alt={overlayLabel}
              className={styles.intervalMedia}
              desktopAutoplay={mediaType === "video"}
              copy={copy}
            />
          ) : posterUrl ? (
            <img
              src={posterUrl}
              alt={overlayLabel}
              className={styles.intervalMedia}
            />
          ) : (
            <div className={styles.intervalFallback}>{copy.intervalEmpty}</div>
          )}

          {(overlayLabel || overlaySubline) && (
            <div className={styles.intervalOverlay}>
              <span className={styles.intervalOverlayLabel}>
                {overlayLabel}
              </span>
              {overlaySubline ? (
                <p className={styles.intervalOverlayText}>{overlaySubline}</p>
              ) : null}
            </div>
          )}
        </div>
      );
    }

    return <p className={styles.emptyText}>{copy.textEmpty}</p>;
  };

  return (
    <>
      <Header t={t} lang={lang} setLang={setLang} />
      <main className={styles.pageMain}>
        <section className={styles.heroSection}>
          <div className={styles.heroMediaShell}>
            {heroImage ? (
              <AtmosphericMedia
                type={heroType}
                src={heroImage}
                poster={heroPoster}
                alt={heroAlt}
                className={styles.heroMedia}
                copy={copy}
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
              <span className={styles.heroEyebrow}>{copy.heroEyebrow}</span>
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
                    <span className={styles.dossierLabel}>{row.label}</span>
                    <strong className={styles.dossierValue}>{row.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          <div className={styles.contentGrid}>
            <aside className={styles.rail}>
              <div className={styles.railInner}>
                <span className={styles.railEyebrow}>{copy.routeEyebrow}</span>
                <nav className={styles.railNav} aria-label={copy.dossier}>
                  {railItems.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      aria-current={activeSection === item.id ? "true" : undefined}
                      className={`${styles.railLink} ${
                        activeSection === item.id ? styles.railLinkActive : ""
                      }`}
                    >
                      <span className={styles.railIndex}>
                        {String(item.index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.railLabel}>{item.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </aside>

            <div className={styles.sectionColumn}>
              {railItems
                .filter((item) => item.type !== "contact")
                .map((item) => (
                  <section
                    key={item.id}
                    id={item.id}
                    className={`${styles.sectionFrame} ${
                      item.type === "media-interval"
                        ? styles.intervalSection
                        : styles.contentFrame
                    }`}
                  >
                    <header className={styles.sectionHeader}>
                      <span className={styles.sectionIndex}>
                        {String(item.index + 1).padStart(2, "0")}
                      </span>
                      <span className={styles.sectionLabel}>{item.label}</span>
                      <span className={styles.sectionLine} />
                    </header>
                    {item.type !== "media-interval" ? (
                      <h2 className={styles.sectionTitle}>{item.heading}</h2>
                    ) : null}
                    {renderSectionBody(item.section, item, item.index + 1)}
                  </section>
                ))}

              <section
                id="project-contact"
                className={`${styles.sectionFrame} ${styles.contactFrame}`}
              >
                <header className={styles.sectionHeader}>
                  <span className={styles.sectionIndex}>
                    {String(railItems.length).padStart(2, "0")}
                  </span>
                  <span className={styles.sectionLabel}>
                    {contactSection?.navLabel ||
                      getSectionLabel("contact", lang)}
                  </span>
                  <span className={styles.sectionLine} />
                </header>
                <h2 className={styles.sectionTitle}>
                  {contactSection?.data?.message || copy.contactTitle}
                </h2>
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
