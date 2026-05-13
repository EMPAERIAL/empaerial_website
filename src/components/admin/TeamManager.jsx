"use client";
import { useState } from "react";
import CustomSelect from "@/components/CustomSelect";
import { FileDrop } from "@/components/admin/FileDroppers";
import ConfirmDeleteModal from "@/components/admin/ConfirmDeleteModal";
import styles from "@/app/admin/adminTheme.module.css";

const emptyMember = {
  name: "",
  linkedin: "",
  age: "",
  country: "",
  role: "",
  skills: "",
  funFact: "",
  photo: "",
};

export default function TeamManager({ teams, onTeamsChange }) {
  const [mode, setMode] = useState("create");
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [newMember, setNewMember] = useState(null);
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [deleteTargetMember, setDeleteTargetMember] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const selectedTeam = teams.find((t) => t.id === Number(selectedTeamId));

  const handleDeleteMember = async (member, password) => {
    if (!password) return;
    setDeleteSubmitting(true);
    setDeleteError("");

    try {
      const res = await fetch("/api/teams", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam.id,
          deleteName: member.name,
          password,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        setDeleteError(result.error || "Failed to delete");
        return;
      }

      onTeamsChange(teams.map((t) => (t.id === selectedTeam.id ? result : t)));
      setDeleteTargetMember(null);
    } catch (err) {
      console.error("Delete error:", err);
      setDeleteError("Deletion failed.");
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const handleSaveMember = async () => {
    const team = teams.find((t) => t.id === Number(selectedTeamId));
    const updated = [...team.members];

    const formattedMember = {
      ...newMember,
      url: newMember.linkedin || newMember.url || "",
    };

    if (editingMemberIndex === null) updated.push(formattedMember);
    else updated[editingMemberIndex] = formattedMember;

    const res = await fetch("/api/teams", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId: team.id, members: updated }),
    });

    const result = await res.json();
    if (!res.ok) return alert(result.error);

    onTeamsChange(teams.map((t) => (t.id === team.id ? result : t)));
    setNewMember(null);
    setEditingMemberIndex(null);
  };

  return (
    <div className={styles.sectionCard}>
      <h2 className={styles.sectionTitle}>Team Management</h2>

      <CustomSelect
        label="Select Team"
        value={selectedTeamId}
        onChange={(val) => {
          setSelectedTeamId(val);
          setEditingMemberIndex(null);
          setNewMember(null);
        }}
        options={teams.map((t) => ({
          value: t.id,
          label: t.title || t.name,
        }))}
      />

      {selectedTeamId && (
        <>
          <div className={styles.modeSwitchBar}>
            <button
              type="button"
              className={`${styles.modeSwitchButton} ${mode === "create" ? styles.modeSwitchButtonActive : ""}`}
              onClick={() => setMode("create")}
            >
              Create/Edit
            </button>
            <button
              type="button"
              className={`${styles.modeSwitchButton} ${mode === "manage" ? styles.modeSwitchButtonActive : ""}`}
              onClick={() => setMode("manage")}
            >
              Manage List
            </button>
          </div>

          <h3 className={styles.sectionAccentTitle} style={{ marginTop: "0.5rem" }}>
            Members of {selectedTeam?.title}
          </h3>

          {mode === "manage" && (
            <div className={styles.listContainer}>
              <h3 className={styles.miniHeader}>Current Members</h3>
              <div className={styles.scrollList}>
                {(selectedTeam?.members || []).map((member, index) => (
                  <div key={index} className={styles.listItem}>
                    <div>
                      <strong>{member.name}</strong>
                      <p className={styles.rowMetaText} style={{ fontSize: "0.8rem", opacity: 0.6 }}>
                        {member.role}
                      </p>
                    </div>

                    <div className={styles.actionRow}>
                      <button
                        className={styles.editButton}
                        onClick={() => {
                          setMode("create");
                          setEditingMemberIndex(index);
                          setNewMember({
                            ...member,
                            linkedin: member.linkedin || member.url || "",
                          });
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className={styles.deleteButton}
                        onClick={() => {
                          setDeleteTargetMember(member);
                          setDeleteError("");
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mode === "create" && (
            <>
              <button
                type="button" className={styles.submitButton}
                style={{ marginBottom: "1rem" }}
                onClick={() => {
                  setEditingMemberIndex(null);
                  setNewMember({ ...emptyMember });
                }}
              >
                + Add Member
              </button>

              {newMember && (
                <div
                  className={styles.formCard}
                >
                  <h3 className={styles.sectionAccentTitle}>
                    {editingMemberIndex === null ? "Add Member" : "Edit Member"}
                  </h3>

                  {[
                    "name",
                    "linkedin",
                    "age",
                    "country",
                    "role",
                    "skills",
                    "funFact",
                  ].map((field) => (
                    <input
                      key={field}
                      placeholder={
                        field === "linkedin" ? "LinkedIn Profile Link" : field
                      }
                      value={newMember[field] || ""}
                      onChange={(e) =>
                        setNewMember({ ...newMember, [field]: e.target.value })
                      }
                      className={styles.inputField}
                    />
                  ))}

                  <FileDrop
                    label="Upload Member Photo"
                    folder="team"
                    onUploaded={(url) =>
                      setNewMember({ ...newMember, photo: url })
                    }
                  />

                  {newMember.photo && (
                    <img
                      src={newMember.photo}
                      alt="member"
                      className={styles.thumbImg}
                      style={{ width: "100px", height: "100px", borderRadius: "10px", marginTop: "10px" }}
                    />
                  )}

                  <button
                    type="button" className={styles.submitButton}
                    onClick={handleSaveMember}
                  >
                    Save
                  </button>

                  <button
                    type="button" className={styles.submitButton}
                    style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
                    onClick={() => {
                      setNewMember(null);
                      setEditingMemberIndex(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </>
          )}
        </>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTargetMember)}
        itemLabel={
          deleteTargetMember
            ? `member ${deleteTargetMember.name}`
            : "this member"
        }
        submitting={deleteSubmitting}
        error={deleteError}
        onCancel={() => {
          if (deleteSubmitting) return;
          setDeleteTargetMember(null);
          setDeleteError("");
        }}
        onConfirm={(password) =>
          handleDeleteMember(deleteTargetMember, password)
        }
      />
    </div>
  );
}





