'use client';
export const dynamic = "force-dynamic";

import React from "react";
import Link from "next/link";
import styles from "./Projects.module.css";
import useProjects from "@/hooks/useProjects";

export default function Projects({ t }) {
const { projects, loading } = useProjects();

if (!t || !t.projects) {
return ( <section className={styles.projectSection} id="projects">
<p style={{ textAlign: "center", color: "#00B4D8" }}>
Loading translations... </p> </section>
);
}

if (loading) {
return ( <section className={styles.projectSection} id="projects"> <div className={styles.header}> <h2 className={styles.title}>{t.projects.title}</h2> <p className={styles.subtitle}>{t.projects.subtitle}</p> </div>
<p style={{ textAlign: "center", color: "#888" }}>Loading projects...</p> </section>
);
}

return ( <section className={styles.projectSection} id="projects"> <div className={styles.header}> <h2 className={styles.title}>{t.projects.title}</h2> <p className={styles.subtitle}>{t.projects.subtitle}</p> </div>

  <div className={styles.projectRow}>
    {!Array.isArray(projects) || projects.length === 0 ? (
      <p style={{ textAlign: "center", color: "#888" }}>No projects found.</p>
    ) : (
      projects.map((project, index) => (
        <div key={index} className={styles.projectCard}>
          <div className={styles.previewImageContainer}>
            <img
              src={project.image_url || "/images/default-drone.png"}
              alt={`${project.name || "Project"} drone image`}
              className={styles.previewImage}
            />
          </div>

          <div className={styles.projectOverview}>
            <h2>{project.name || "Untitled Project"}</h2>
            <p>{project.summary || "No summary available."}</p>

            <Link
              href={`/projects/${project.slug || "project"}`}
              style={{ textDecoration: "none" }}
            >
              <button className={styles.expandButton}>
                {t.projects.viewDetails || "View Details"} →
              </button>
            </Link>
          </div>
        </div>
      ))
    )}
  </div>
</section>

);
}
