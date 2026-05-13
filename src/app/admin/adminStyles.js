export const pageContainer = {
  minHeight: "100vh",
  background: "var(--admin-bg)",
  padding: "2rem 1rem",
  color: "var(--admin-fg)",
  fontFamily: "var(--font-body)",
  display: "flex",
  justifyContent: "center",
};

export const panelContainer = {
  background: "var(--admin-panel)",
  backdropFilter: "blur(12px)",
  borderRadius: "20px",
  border: "1px solid var(--admin-panel-border)",
  padding: "2rem",
  width: "100%",
  maxWidth: "1400px",
  boxShadow: "0 0 30px rgba(0, 255, 255, 0.1)",
};
export const title = {
  textAlign: "center",
  color: "var(--admin-title)",
  fontWeight: "700",
  marginBottom: "0.5rem",
  fontSize: "2rem",
};
export const subtitle = {
  textAlign: "center",
  color: "var(--admin-muted)",
  marginBottom: "2rem",
};
export const gridContainer = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))",
  gap: "2rem",
  width: "100%",
};

export const sectionCard = {
  background: "var(--admin-card)",
  borderRadius: "18px",
  padding: "1.5rem",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 0 15px rgba(0, 180, 216, 0.1)",
};
export const sectionTitle = {
  color: "var(--admin-info-fg)",
  fontSize: "1.2rem",
  marginBottom: "1rem",
  fontWeight: "600",
};

export const formLayout = {
  display: "flex",
  flexDirection: "column",
  gap: "0.8rem",
};
export const inputField = {
  background: "var(--admin-input)",
  border: "1px solid var(--admin-input-border)",
  borderRadius: "10px",
  padding: "0.7rem 1rem",
  color: "var(--blog-fg)",
  fontSize: "0.95rem",
  outline: "none",
};
export const readonlyInput = {
  ...inputField,
  border: "1px dashed rgba(255,255,255,0.2)",
  color: "#888",
};

export const submitButton = {
  background: "var(--admin-action-bg)",
  border: "none",
  borderRadius: "10px",
  padding: "0.8rem",
  color: "white",
  fontWeight: "600",
  cursor: "pointer",
  marginTop: "0.3rem",
  fontSize: "1rem",
  letterSpacing: "0.3px",
};
export const builderBox = {
  marginTop: "1.5rem",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "12px",
  padding: "1rem",
  border: "1px solid rgba(255,255,255,0.08)",
};
export const addSectionBtn = {
  background: "rgba(0,180,216,0.1)",
  border: "1px solid rgba(0,180,216,0.3)",
  color: "var(--admin-info-fg)",
  padding: "6px 10px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: "600",
};
export const builderTextarea = {
  background: "var(--admin-input)",
  color: "var(--blog-fg)",
  width: "100%",
  minHeight: "100px",
  borderRadius: "10px",
  border: "1px solid var(--admin-input-border)",
  padding: "0.8rem",
  fontFamily: "monospace",
};

export const sectionEditorBox = {
  background: "rgba(0,0,0,0.3)",
  padding: "1rem",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
};
export const listContainer = {
  marginTop: "1.8rem",
  borderTop: "1px solid rgba(255,255,255,0.1)",
  paddingTop: "1rem",
  background: "rgba(255,255,255,0.03)",
  borderRadius: "12px",
  padding: "1rem",
  boxShadow: "inset 0 0 10px rgba(0,0,0,0.2)",
  width: "100%",
};
export const scrollList = {
  maxHeight: "230px",
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
  gap: "0.7rem",
};
export const miniHeader = {
  color: "var(--admin-info-fg)",
  marginBottom: "1rem",
  fontWeight: "600",
};

export const listItem = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  background: "rgba(255,255,255,0.06)",
  padding: "0.9rem 1rem",
  borderRadius: "10px",
  border: "1px solid rgba(255,255,255,0.1)",
  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
  marginBottom: "0.8rem",
};
export const deleteButton = {
  background: "var(--admin-danger-bg)",
  border: "1px solid var(--admin-danger-border)",
  color: "var(--admin-danger-fg)",
  padding: "6px 13px",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
};
export const iconDeleteBtn = {
  background: "var(--admin-danger-bg)",
  border: "1px solid var(--admin-danger-border)",
  color: "var(--admin-danger-fg)",
  borderRadius: "8px",
  cursor: "pointer",
  padding: "0.3rem 0.8rem",
  fontWeight: "700",
};
export const editButton = {
  background: "var(--admin-info-bg)",
  border: "1px solid var(--admin-info-border)",
  color: "var(--admin-info-fg)",
  padding: "6px 13px",
  borderRadius: "8px",
  fontWeight: "600",
  cursor: "pointer",
};
export const modeSwitchBar = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
  flexWrap: "wrap",
};
export const modeSwitchButton = { ...addSectionBtn, padding: "8px 14px" };
export const modeSwitchButtonActive = {
  ...modeSwitchButton,
  background: "var(--admin-info-bg)",
  border: "1px solid var(--admin-info-border)",
};

export const gridThumbs = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))",
  gap: "10px",
  marginTop: "10px",
};
export const thumbBox = {
  position: "relative",
  width: "100%",
  paddingTop: "100%",
  borderRadius: "10px",
  overflow: "hidden",
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.04)",
  transition: "transform 350ms ease, box-shadow 350ms ease",
};
export const thumbImg = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
};
export const thumbClose = {
  position: "absolute",
  top: 4,
  right: 4,
  background: "rgba(0,0,0,0.6)",
  color: "#fff",
  border: "1px solid rgba(255,255,255,0.3)",
  borderRadius: "6px",
  fontSize: "12px",
  padding: "2px 6px",
  cursor: "pointer",
};
