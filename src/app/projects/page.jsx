'use client';
export const dynamic = "force-dynamic";

import React, { useState } from "react";
import Link from "next/link";
import WingCut from "@/components/WingCut/WingCut";
import useProjects from "@/hooks/useProjects";
import styles from "./Projects.module.css";

const FALLBACK_IMAGES = [
  "/images/vespasian1.png",
  "/images/vespasian2.png",
  "/images/vespasian3.png",
];

const FALLBACK_SPECS = [
  ["weight", "650 g"],
  ["max_takeoff", "1.2 kg"],
  ["flight_duration", "~8 min"],
  ["frame_length", "330 mm"],
  ["motors", "4x BLDC"],
  ["firmware", "Betaflight"],
];

function getGalleryImages(project) {
  const sectionImages = Array.isArray(project?.sections)
    ? project.sections
        .filter((section) => section.type === "gallery")
        .flatMap((section) => section.data?.images || [])
    : [];

  return [
    ...new Set([project?.image_url, ...sectionImages, ...FALLBACK_IMAGES].filter(Boolean)),
  ].slice(0, 3);
}

function getProjectSpecs(project, t) {
  const rows = Array.isArray(project?.sections)
    ? project.sections.find((section) => section.type === "specs")?.data?.rows
    : null;

  if (Array.isArray(rows) && rows.length > 0) {
    return rows.slice(0, 6).map((row) => ({
      label: row.key,
      value: row.value || "N/A",
    }));
  }

  const labels = t.projects?.vespasian?.specs || {};
  return FALLBACK_SPECS.map(([key, value]) => ({
    label: labels[key] || key.replaceAll("_", " "),
    value,
  }));
}

export default function Projects({ t }) {
  const { projects, loading } = useProjects();
  const [activeImage, setActiveImage] = useState(0);

  if (!t || !t.projects) {
    return (
      <section className={styles.projectSection} id="projects">
        <p className={styles.status}>Loading translations...</p>
      </section>
    );
  }

  if (loading) {
    return (
      <section className={styles.projectSection} id="projects">
        <div className={`${styles.header} reveal`}>
          <div className={styles.eyebrow}>PROJECTS</div>
          <h2 className={styles.title}>{t.projects.title}</h2>
          <p className={styles.subtitle}>{t.projects.subtitle}</p>
        </div>
        <p className={styles.status}>Loading projects...</p>
      </section>
    );
  }

  const featuredProject = Array.isArray(projects) && projects.length > 0 ? projects[0] : null;
  const galleryImages = getGalleryImages(featuredProject);
  const specs = getProjectSpecs(featuredProject, t);
  const comingSoon = t.projects.comingSoon || "Coming Soon";

  return (
    <section className={styles.projectSection} id="projects" aria-labelledby="projects-title">
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.eyebrow}>PROJECTS · 4 BUILDS</div>
          <h2 id="projects-title" className={styles.title}>
            {t.projects.title}
          </h2>
          <p className={styles.subtitle}>{t.projects.subtitle}</p>
        </div>

        {!featuredProject ? (
          <p className={styles.status}>No projects found.</p>
        ) : (
          <>
            <div className={`${styles.projectFeatured} reveal`}>
              <div className={styles.projGallery}>
                <img
                  src={galleryImages[activeImage] || featuredProject.image_url || FALLBACK_IMAGES[0]}
                  alt={`${featuredProject.name || "Project"} view ${activeImage + 1}`}
                  className={styles.projGalleryMain}
                />
                <div className={styles.projGalleryThumbs}>
                  {galleryImages.map((src, index) => (
                    <button
                      type="button"
                      key={src}
                      className={`${styles.projThumbButton} ${
                        activeImage === index ? styles.activeThumb : ""
                      }`}
                      onClick={() => setActiveImage(index)}
                      aria-label={`Show ${featuredProject.name || "project"} image ${index + 1}`}
                    >
                      <img src={src} alt={`${featuredProject.name || "Project"} thumbnail ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.projBody}>
                <div>
                  <div className={styles.projEyebrow}>PROJECT · 01</div>
                  <h3 className={styles.projName}>{featuredProject.name || "Untitled Project"}</h3>
                  <p className={styles.projSummary}>
                    {featuredProject.summary ||
                      t.projects.vespasian?.summary ||
                      "No summary available."}
                  </p>
                  <div className={styles.specs}>
                    {specs.map((spec, index) => (
                      <div className={styles.spec} key={`${spec.label}-${index}`}>
                        <div className={styles.specLabel}>{spec.label}</div>
                        <div className={styles.specValue}>{spec.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.projCta}>
                  <Link href={`/projects/${featuredProject.slug || "project"}`}>
                    {t.projects.viewDetails || "View Details"} →
                  </Link>
                </div>
              </div>
            </div>

            <div className={`${styles.projPlaceholders} reveal`}>
              {[2, 3, 4].map((projectNumber) => (
                <div className={styles.projPlaceholder} key={projectNumber}>
                  <div className={styles.placeholderNumber}>
                    PROJECT · {String(projectNumber).padStart(2, "0")}
                  </div>
                  <div className={styles.placeholderLabel}>{comingSoon}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <WingCut fill="#fff" bgColor="#000" style={{ marginTop: 80 }} />
    </section>
  );
}
