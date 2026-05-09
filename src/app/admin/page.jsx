'use client'
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import ProjectEditor from "@/components/admin/ProjectEditor";
import BlogEditor from "@/components/admin/BlogEditor";
import TeamManager from "@/components/admin/TeamManager";
import styles from "./admin.module.css"

import {
  pageContainer, panelContainer, title, subtitle, gridContainer,
} from "./adminStyles"

export default function AdminPage() {
  const router = useRouter()

  const [projects, setProjects] = useState([])
  const [blogs, setBlogs] = useState([])
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("isAdmin") !== "true") {
      router.push("/admin-login")
    }
  }, [router])

  useEffect(() => {
    async function fetchData() {
      try {
        const [projRes, blogRes, teamRes] = await Promise.all([
          fetch("/api/projects").then(r => r.json()),
          fetch("/api/blogs").then(r => r.json()),
          fetch("/api/teams").then(r => r.json()),
        ])

        setProjects((projRes || []).filter(p => p && p.name))
        setBlogs((blogRes || []).filter(b => b && b.title))
        setTeams((teamRes || []).filter(t => t && (t.title || t.name)))
      } catch (err) {
        console.error("❌ Fetch failed:", err)
      }
    }
    fetchData()
  }, [])

  return (
    <div style={pageContainer}>
      <div style={panelContainer}>
        <h1 style={title}>ADMIN DASHBOARD</h1>
        <p style={subtitle}>Build drone pages dynamically & manage blogs</p>

        <div style={gridContainer} className={styles.panelGrid}>
          <ProjectEditor projects={projects} onProjectsChange={setProjects} />

          <BlogEditor blogs={blogs} onBlogsChange={setBlogs} />

          <TeamManager teams={teams} onTeamsChange={setTeams} />
        </div>
      </div>
    </div>
  )
}
