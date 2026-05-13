"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ProjectEditor from "@/components/admin/ProjectEditor";
import BlogEditor from "@/components/admin/BlogEditor";
import TeamManager from "@/components/admin/TeamManager";
import styles from "./adminTheme.module.css";
import useProjects from "@/hooks/useProjects";
import useBlogs from "@/hooks/useBlogs";
import useTeams from "@/hooks/useTeams";

const TABS = [
  { key: "projects", label: "Projects", description: "Create and manage project pages" },
  { key: "blogs", label: "Blogs", description: "Publish and maintain blog content" },
  { key: "team", label: "Team", description: "Manage team members and roles" },
];

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("projects");

  const { projects, refetch: refetchProjects } = useProjects();
  const { blogs, refetch: refetchBlogs } = useBlogs();
  const { teams, refetch: refetchTeams } = useTeams();

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("isAdmin") !== "true") {
      router.push("/admin-login");
    }
  }, [router]);

  const activeTabMeta = useMemo(() => TABS.find((tab) => tab.key === activeTab) || TABS[0], [activeTab]);

  return (
    <div className={styles.adminPage}>
      <div className={styles.adminShell}>
        <header className={styles.shellHeader}>
          <p className={styles.overline}>EMPÆRIAL Control</p>
          <h1 className={styles.title}>Admin Dashboard</h1>
          <p className={styles.subtitle}>{activeTabMeta.description}</p>
        </header>

        <nav className={styles.tabNav} aria-label="Admin sections">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                onClick={() => setActiveTab(tab.key)}
                aria-current={isActive ? "page" : undefined}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <section>
          {activeTab === "projects" && <ProjectEditor projects={projects} onProjectsChange={() => refetchProjects()} />}
          {activeTab === "blogs" && <BlogEditor blogs={blogs} onBlogsChange={() => refetchBlogs()} />}
          {activeTab === "team" && <TeamManager teams={teams} onTeamsChange={() => refetchTeams()} />}
        </section>
      </div>
    </div>
  );
}

