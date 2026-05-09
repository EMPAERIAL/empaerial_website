'use client'
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectEditor from "@/components/admin/ProjectEditor";
import BlogEditor from "@/components/admin/BlogEditor";
import TeamManager from "@/components/admin/TeamManager";
import styles from "./admin.module.css"
import useProjects from "@/hooks/useProjects";
import useBlogs from "@/hooks/useBlogs";
import useTeams from "@/hooks/useTeams";

import {
  pageContainer, panelContainer, title, subtitle, gridContainer,
} from "./adminStyles"

export default function AdminPage() {
  const router = useRouter()

  const { projects, refetch: refetchProjects } = useProjects()
  const { blogs, refetch: refetchBlogs } = useBlogs()
  const { teams, refetch: refetchTeams } = useTeams()

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("isAdmin") !== "true") {
      router.push("/admin-login")
    }
  }, [router])

  return (
    <div style={pageContainer}>
      <div style={panelContainer}>
        <h1 style={title}>ADMIN DASHBOARD</h1>
        <p style={subtitle}>Build drone pages dynamically & manage blogs</p>

        <div style={gridContainer} className={styles.panelGrid}>
          <ProjectEditor projects={projects} onProjectsChange={() => refetchProjects()} />

          <BlogEditor blogs={blogs} onBlogsChange={() => refetchBlogs()} />

          <TeamManager teams={teams} onTeamsChange={() => refetchTeams()} />
        </div>
      </div>
    </div>
  )
}
