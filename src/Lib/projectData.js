export const PROJECT_STATUS_OPTIONS = [
  "active",
  "work in progress",
  "completed",
  "archived",
];

export const HERO_MEDIA_TYPES = ["image", "video"];

export const PROJECT_SECTION_TYPES = [
  "specs",
  "materials",
  "gallery",
  "callouts",
  "videos",
  "text",
  "links",
  "media-interval",
  "contact",
];

function asText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function asOptionalText(value) {
  const text = asText(value);
  return text || null;
}

function asMediaType(value) {
  return HERO_MEDIA_TYPES.includes(value) ? value : "image";
}

export function parseProjectSections(rawSections) {
  if (Array.isArray(rawSections)) return rawSections;
  if (typeof rawSections !== "string") return [];

  try {
    const parsed = JSON.parse(rawSections);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeHeroMedia(heroMedia, fallbackImageUrl = "") {
  if (heroMedia && typeof heroMedia === "object" && !Array.isArray(heroMedia)) {
    return {
      type: asMediaType(heroMedia.type),
      url: asText(heroMedia.url),
      poster_url: asText(heroMedia.poster_url),
      alt: asText(heroMedia.alt),
    };
  }

  if (fallbackImageUrl) {
    return {
      type: "image",
      url: fallbackImageUrl,
      poster_url: "",
      alt: "",
    };
  }

  return {
    type: "image",
    url: "",
    poster_url: "",
    alt: "",
  };
}

export function normalizeProjectSection(section, index = 0) {
  const type = asText(section?.type);

  return {
    id: section?.id ?? `${type || "section"}-${index}`,
    type,
    navLabel: asText(section?.navLabel),
    data:
      section?.data &&
      typeof section.data === "object" &&
      !Array.isArray(section.data)
        ? section.data
        : {},
  };
}

export function normalizeProjectRecord(project) {
  const imageUrl = asText(project?.image_url);
  const sections = parseProjectSections(project?.sections).map(
    (section, index) => normalizeProjectSection(section, index)
  );

  return {
    ...project,
    status: asText(project?.status),
    year: asText(project?.year),
    purpose: asText(project?.purpose),
    hero_media: normalizeHeroMedia(project?.hero_media, imageUrl),
    sections,
  };
}

export function normalizeProjectPayload(body) {
  const imageUrl = asText(body?.image_url);
  const sections = parseProjectSections(body?.sections).map((section, index) =>
    normalizeProjectSection(section, index)
  );
  const status = asText(body?.status);

  return {
    name: asText(body?.name),
    summary: asText(body?.summary),
    image_url: imageUrl,
    slug: asText(body?.slug),
    status: status && PROJECT_STATUS_OPTIONS.includes(status) ? status : null,
    year: asOptionalText(body?.year),
    purpose: asOptionalText(body?.purpose),
    hero_media: normalizeHeroMedia(body?.hero_media, imageUrl),
    sections,
  };
}
