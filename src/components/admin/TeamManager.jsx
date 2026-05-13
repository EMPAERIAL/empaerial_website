'use client'
import { useState } from "react"
import CustomSelect from "@/components/CustomSelect"
import { FileDrop } from "@/components/admin/FileDroppers"
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal"
import {
  sectionCard, sectionTitle, inputField,
  submitButton, listItem, deleteButton, editButton,
} from "@/app/admin/adminStyles"

const emptyMember = {
  name: "",
  linkedin: "",
  age: "",
  country: "",
  role: "",
  skills: "",
  funFact: "",
  photo: "",
}

export default function TeamManager({ teams, onTeamsChange }) {
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [newMember, setNewMember] = useState(null)
  const [editingMemberIndex, setEditingMemberIndex] = useState(null)
  const [deleteTargetMember, setDeleteTargetMember] = useState(null)
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteError, setDeleteError] = useState("")

  const selectedTeam = teams.find((t) => t.id === Number(selectedTeamId))

  const handleDeleteMember = async (member, password) => {
    if (!password) return
    setDeleteSubmitting(true)
    setDeleteError("")

    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          deleteName: member.name,
          password,
        }),
      })

      const result = await res.json()
      if (!res.ok) {
        setDeleteError(result.error || "Failed to delete")
        return
      }

      onTeamsChange(teams.map((t) => (t.id === selectedTeam.id ? result : t)))
      setDeleteTargetMember(null)
    } catch (err) {
      console.error("Delete error:", err)
      setDeleteError("Deletion failed.")
    } finally {
      setDeleteSubmitting(false)
    }
  }
  const handleSaveMember = async () => {
    const team = teams.find((t) => t.id === Number(selectedTeamId))
    const updated = [...team.members]

    const formattedMember = {
      ...newMember,
      url: newMember.linkedin || newMember.url || "",
    }

    if (editingMemberIndex === null) updated.push(formattedMember)
    else updated[editingMemberIndex] = formattedMember

    const res = await fetch("/api/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: team.id, members: updated }),
    })

    const result = await res.json()
    if (!res.ok) return alert(result.error)

    onTeamsChange(teams.map((t) => (t.id === team.id ? result : t)))
    setNewMember(null)
    setEditingMemberIndex(null)
  }

  return (
    <div className="team-section" style={sectionCard}>
      <h2 style={sectionTitle}>👥 Team Management</h2>

      <CustomSelect
        label="Select Team"
        value={selectedTeamId}
        onChange={(val) => {
          setSelectedTeamId(val)
          setEditingMemberIndex(null)
          setNewMember(null)
        }}
        options={teams.map((t) => ({
          value: t.id,
          label: t.title || t.name,
        }))}
      />

      {selectedTeamId && (
        <>
          <h3 style={{ marginTop: "1rem", color: "#00B4D8" }}>
            Members of {selectedTeam?.title}
          </h3>

          <button
            className="team-button"
            type="button"
            style={{ ...submitButton, marginBottom: "1rem" }}
            onClick={() => {
              setEditingMemberIndex(null)
              setNewMember({ ...emptyMember })
            }}
          >
            + Add Member
          </button>

          {(selectedTeam?.members || []).map((member, index) => (
            <div key={index} className="member-card" style={listItem}>
              <div>
                <strong>{member.name}</strong>
                <p style={{ margin: 0, opacity: 0.6, fontSize: "0.8rem" }}>
                  {member.role}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  className="team-button"
                  style={editButton}
                  onClick={() => {
                    setEditingMemberIndex(index)
                    setNewMember({
                      ...member,
                      linkedin: member.linkedin || member.url || "",
                    })
                  }}
                >
                  Edit
                </button>

                <button
                  className="team-button"
                  style={deleteButton}
                  onClick={() => { setDeleteTargetMember(member); setDeleteError("") }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {newMember && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                borderRadius: "12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              <h3 style={{ color: "#00B4D8" }}>
                {editingMemberIndex === null ? "Add Member" : "Edit Member"}
              </h3>

              {["name", "linkedin", "age", "country", "role", "skills", "funFact"].map(
                (field) => (
                  <input
                    key={field}
                    placeholder={field === "linkedin" ? "LinkedIn Profile Link" : field}
                    value={newMember[field] || ""}
                    onChange={(e) =>
                      setNewMember({ ...newMember, [field]: e.target.value })
                    }
                    style={inputField}
                    className="team-input"
                  />
                )
              )}

              <FileDrop
                label="Upload Member Photo"
                folder="team"
                onUploaded={(url) => setNewMember({ ...newMember, photo: url })}
              />

              {newMember.photo && (
                <img
                  src={newMember.photo}
                  style={{ width: "100px", borderRadius: "10px", marginTop: "10px" }}
                />
              )}

              <button
                className="team-button"
                type="button"
                style={submitButton}
                onClick={handleSaveMember}
              >
                Save
              </button>

              <button
                className="team-button"
                type="button"
                style={{ ...submitButton, background: "#444" }}
                onClick={() => {
                  setNewMember(null)
                  setEditingMemberIndex(null)
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </>
      )}
      <ConfirmDeleteModal
        open={Boolean(deleteTargetMember)}
        itemLabel={deleteTargetMember ? `member ${deleteTargetMember.name}` : "this member"}
        submitting={deleteSubmitting}
        error={deleteError}
        onCancel={() => {
          if (deleteSubmitting) return
          setDeleteTargetMember(null)
          setDeleteError("")
        }}
        onConfirm={(password) => handleDeleteMember(deleteTargetMember, password)}
      />
    </div>
  )
}


