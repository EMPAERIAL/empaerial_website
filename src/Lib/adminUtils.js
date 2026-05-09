export const clamp = (n, min, max) => Math.max(min, Math.min(max, n))

export function moveItem(arr, from, to) {
  const copy = [...arr]
  const start = clamp(from, 0, copy.length - 1)
  const end = clamp(to, 0, copy.length - 1)
  const [item] = copy.splice(start, 1)
  copy.splice(end, 0, item)
  return copy
}

export function toTitleCaseNoUnderscore(s) {
  return (s || "")
    .replaceAll("_", " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export const generateSlug = text =>
  (text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")

export function rowsFromObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) return []
  return Object.entries(obj).map(([key, value]) => ({
    key,
    value: String(value ?? "")
  }))
}

export function normalizeKeyValueSection(sec) {
  if (!sec?.data) return { rows: [] }
  if (Array.isArray(sec.data?.rows)) {
    return { rows: sec.data.rows.map(r => ({ key: r.key ?? "", value: String(r.value ?? "") })) }
  }
  return { rows: rowsFromObject(sec.data) }
}

export const DEFAULT_SPECS_ROWS = [
  { key: "Weight", value: "" },
  { key: "Max Takeoff Weight", value: "" },
  { key: "Flight Duration", value: "" },
  { key: "Frame Length", value: "" },
  { key: "Height", value: "" },
]

export const DEFAULT_MATERIALS_ROWS = [
  { key: "Arms", value: "" },
  { key: "Motor Mounts", value: "" },
  { key: "Arm To Chassis", value: "" },
  { key: "Chassis", value: "" },
  { key: "ESCs", value: "" },
  { key: "Motors", value: "" },
  { key: "Battery", value: "" },
  { key: "Props", value: "" },
  { key: "Flight Controller", value: "" },
  { key: "Firmware", value: "" },
]
