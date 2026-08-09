/*
 * Site-wide search index.
 *
 * The index is assembled in the browser from the same three endpoints the
 * pages themselves render (/api/projects, /api/blogs, /api/teams) plus the
 * active translation bundle. Building it here rather than server-side keeps a
 * single source of truth: if a page renders a string, this file indexes that
 * same string, in the language the visitor is actually reading.
 *
 * Each document is one addressable fragment of one page — a spec row, a
 * callout, a paragraph — so a hit for "980 g" can point at the exact section of
 * the project dossier that carries it rather than just the page.
 */

const LIGATURES = { Æ: "ae", æ: "ae", Œ: "oe", œ: "oe", ß: "ss" };

/**
 * Fold a string down to something comparable: ligatures expanded, diacritics
 * stripped, Turkish dotted/dotless i unified, whitespace collapsed.
 * "EMPÆRIAL" and "empaerial" match; so do "İHA" and "iha".
 */
export function normalizeForSearch(value) {
  return String(value ?? "")
    .replace(/[ÆæŒœß]/g, (char) => LIGATURES[char])
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ıİ]/g, "i")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function text(value) {
  return typeof value === "string" ? value.trim() : "";
}

/** Strip a blog body down to plain prose for indexing and snippets. */
function plainText(value) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/[#*_`>]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

let docCounter = 0;

function doc({ kind, page, pageUrl, section, label, body, hash }) {
  const content = text(body);
  if (!content) return null;

  docCounter += 1;

  return {
    id: `${kind}-${docCounter}`,
    kind,
    page,
    pageUrl,
    url: hash ? `${pageUrl}#${hash}` : pageUrl,
    section: section || "",
    label: label || "",
    body: content,
    // Precomputed so filtering a few hundred documents per keystroke stays cheap.
    haystack: normalizeForSearch([label, content].filter(Boolean).join(" ")),
  };
}

/* ── Project sections ─────────────────────────────────── */

function sectionLabel(type, detailT) {
  return detailT?.section_labels?.[type] || "Section";
}

function sectionAnchor(section, index, detailT) {
  const label = text(section?.navLabel) || sectionLabel(section?.type, detailT);
  return `section-${index + 1}-${slugify(label || section?.type)}`;
}

/** Mirrors the detail page's normalizeRows: rows array, or a flat key/value object. */
function sectionRows(section) {
  if (Array.isArray(section?.data?.rows)) {
    return section.data.rows
      .map((row) => ({ key: text(row?.key), value: text(row?.value) }))
      .filter((row) => row.key || row.value);
  }

  if (section?.data && typeof section.data === "object") {
    return Object.entries(section.data)
      .filter(([, value]) => text(value))
      .map(([key, value]) => ({
        key: key.replaceAll("_", " "),
        value: text(value),
      }));
  }

  return [];
}

function projectSectionDocs(section, index, project, detailT) {
  const pageUrl = `/projects/${project.slug}`;
  const page = project.name;
  const hash = sectionAnchor(section, index, detailT);
  const heading =
    text(section?.navLabel) ||
    (section?.type === "text" && text(section?.data?.heading)) ||
    sectionLabel(section?.type, detailT);

  const base = { kind: "project", page, pageUrl, section: heading, hash };
  const docs = [];

  switch (section?.type) {
    case "specs":
    case "materials":
      // One document per row, so "980 g" resolves to the row that holds it.
      sectionRows(section).forEach((row) => {
        docs.push(doc({ ...base, label: row.key, body: row.value }));
      });
      break;

    case "text":
      docs.push(
        doc({
          ...base,
          label: text(section?.data?.heading),
          body: section?.data?.content,
        })
      );
      break;

    case "links":
      (Array.isArray(section?.data?.links) ? section.data.links : []).forEach(
        (link) => {
          docs.push(
            doc({
              ...base,
              label: text(link?.label),
              body: [text(link?.description), text(link?.url)]
                .filter(Boolean)
                .join(" — "),
            })
          );
        }
      );
      break;

    case "videos":
      (Array.isArray(section?.data?.videos) ? section.data.videos : []).forEach(
        (video) => {
          docs.push(
            doc({
              ...base,
              body: typeof video === "string" ? video : text(video?.title),
            })
          );
        }
      );
      break;

    case "callouts":
      (Array.isArray(section?.data?.items) ? section.data.items : []).forEach(
        (callout) => {
          docs.push(
            doc({
              ...base,
              label: text(callout?.label),
              body: text(callout?.detail),
            })
          );
        }
      );
      break;

    case "media-interval":
      docs.push(
        doc({
          ...base,
          label: text(section?.data?.label),
          body: section?.data?.subline,
        })
      );
      break;

    default:
      break;
  }

  return docs.filter(Boolean);
}

export function buildProjectDocs(projects, t) {
  const detailT = t?.project_detail || {};
  const metaLabels = detailT?.meta_labels || {};
  const docs = [];

  (Array.isArray(projects) ? projects : []).forEach((project) => {
    if (!project?.name || !project?.slug) return;

    const pageUrl = `/projects/${project.slug}`;
    const base = { kind: "project", page: project.name, pageUrl };

    docs.push(
      doc({
        ...base,
        label: project.name,
        body: project.summary || project.name,
      })
    );

    [
      [
        metaLabels.status || "Status",
        detailT?.status_labels?.[project.status] || project.status,
      ],
      [metaLabels.year || "Year", project.year],
      [metaLabels.purpose || "Purpose", project.purpose],
    ].forEach(([label, value]) => {
      docs.push(
        doc({
          ...base,
          section: detailT?.dossier || "Dossier",
          label,
          body: value,
        })
      );
    });

    (Array.isArray(project.sections) ? project.sections : []).forEach(
      (section, index) => {
        docs.push(...projectSectionDocs(section, index, project, detailT));
      }
    );
  });

  return docs.filter(Boolean);
}

/* ── Blogs ────────────────────────────────────────────── */

export function buildBlogDocs(blogs, t) {
  const copy = t?.blog_detail || {};
  const docs = [];

  (Array.isArray(blogs) ? blogs : []).forEach((blog) => {
    if (!blog?.title || !blog?.slug) return;

    const pageUrl = `/blogs/${blog.slug}`;
    const base = { kind: "blog", page: blog.title, pageUrl };

    docs.push(doc({ ...base, label: blog.title, body: blog.title }));
    docs.push(
      doc({
        ...base,
        section: copy?.meta_labels?.author || "Author",
        body: text(blog.author),
      })
    );
    docs.push(
      doc({
        ...base,
        section: copy?.section_labels?.article || "Article",
        body: plainText(blog.content),
      })
    );
  });

  return docs.filter(Boolean);
}

/* ── Team ─────────────────────────────────────────────── */

export function buildTeamDocs(teams, t) {
  const docs = [];

  (Array.isArray(teams) ? teams : []).forEach((group) => {
    const section = text(group?.title) || t?.team_title || "Team";

    (Array.isArray(group?.members) ? group.members : []).forEach((member) => {
      if (!member?.name) return;

      const base = {
        kind: "team",
        page: t?.team_title || "Meet Our Team",
        pageUrl: "/",
        hash: "team",
        section,
      };

      docs.push(
        doc({
          ...base,
          label: member.name,
          body: [member.name, member.role].filter(Boolean).join(" — "),
        })
      );
      docs.push(
        doc({ ...base, label: member.name, body: text(member.skills) })
      );
      docs.push(
        doc({ ...base, label: member.name, body: text(member.funFact) })
      );
    });
  });

  return docs.filter(Boolean);
}

/* ── Static page copy ─────────────────────────────────── */

export function buildStaticDocs(t) {
  if (!t) return [];

  const home = { kind: "page", page: "Home", pageUrl: "/" };
  const apply = t.apply_page || {};
  const blogsPage = t.blogs_page || {};

  const entries = [
    doc({ ...home, label: t.hero_title || "EMPÆRIAL", body: t.hero_subtitle }),
    doc({
      ...home,
      hash: "team",
      section: t.team_title,
      label: t.team_title,
      body: t.team_subtitle,
    }),
    doc({
      ...home,
      hash: "team",
      section: t.team_title,
      label: t.team_software_title,
      body: t.team_software_desc,
    }),
    doc({
      ...home,
      hash: "team",
      section: t.team_title,
      label: t.team_electronics_title,
      body: t.team_electronics_desc,
    }),
    doc({
      ...home,
      hash: "team",
      section: t.team_title,
      label: t.team_mechanical_title,
      body: t.team_mechanical_desc,
    }),
    doc({
      ...home,
      hash: "team",
      section: t.team_title,
      label: t.team_coord_title,
      body: t.team_coord_desc,
    }),
    doc({
      ...home,
      hash: "projects",
      section: t.projects?.title,
      label: t.projects?.title,
      body: t.projects?.subtitle,
    }),
    doc({
      ...home,
      hash: "sponsors",
      section: t.sponsors_title,
      label: t.sponsors_title,
      body: t.sponsors_note_prefix,
    }),
    doc({
      ...home,
      hash: "contact",
      section: t.contact_heading,
      label: t.contact_heading,
      body: t.contact_sub,
    }),
    doc({
      ...home,
      hash: "contact",
      section: t.contact_heading,
      label: t.contact_email_label,
      body: t.contact_email,
    }),
    doc({
      ...home,
      hash: "contact",
      section: t.contact_heading,
      label: t.contact_number_label,
      body: t.contact_number,
    }),

    doc({
      kind: "page",
      page: apply.title || "Apply",
      pageUrl: "/apply",
      label: apply.title,
      body: apply.subtitle,
    }),
    doc({
      kind: "page",
      page: apply.title || "Apply",
      pageUrl: "/apply",
      section: apply.aside_title,
      body: (apply.steps || []).join(" "),
    }),

    doc({
      kind: "page",
      page: blogsPage.title || "Blogs",
      pageUrl: "/blogs",
      label: blogsPage.title,
      body: blogsPage.subtitle,
    }),
  ];

  return entries.filter(Boolean);
}

export function buildSearchIndex({ projects, blogs, teams, t }) {
  docCounter = 0;

  return [
    ...buildStaticDocs(t),
    ...buildProjectDocs(projects, t),
    ...buildBlogDocs(blogs, t),
    ...buildTeamDocs(teams, t),
  ];
}

/* ── Querying ─────────────────────────────────────────── */

const SNIPPET_LEAD = 48;
const SNIPPET_TAIL = 96;

/**
 * Fold a string the same way normalizeForSearch does, but keep a map from each
 * folded character back to the source index it came from. That lets a match
 * found in folded space be reported as a range in the original text, so
 * snippets show real casing and punctuation.
 */
function foldWithOffsets(body) {
  let folded = "";
  const offsets = [];
  let pendingSpace = false;

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i];

    if (/\s/.test(char)) {
      // Collapse runs, and never emit a leading space.
      if (folded.length > 0) pendingSpace = true;
      continue;
    }

    if (pendingSpace) {
      folded += " ";
      offsets.push(i);
      pendingSpace = false;
    }

    for (const piece of normalizeForSearch(char)) {
      folded += piece;
      offsets.push(i);
    }
  }

  return { folded, offsets };
}

/** Locate the query inside the original body. Returns source-text offsets. */
function findMatch(body, needle) {
  const normalizedNeedle = normalizeForSearch(needle);
  if (!normalizedNeedle) return null;

  const { folded, offsets } = foldWithOffsets(body);
  const at = folded.indexOf(normalizedNeedle);
  if (at === -1) return null;

  return {
    start: offsets[at],
    // End at the last matched character rather than the next one, so a match
    // ending at a word boundary does not swallow the following space.
    end: offsets[at + normalizedNeedle.length - 1] + 1,
  };
}

export function buildSnippet(body, query) {
  const found = findMatch(body, query);

  // No hit in this field — the match was in the label. Show a plain opening
  // rather than an empty highlight.
  if (!found) {
    const head = body.slice(0, SNIPPET_TAIL);
    return {
      before: head + (body.length > head.length ? "…" : ""),
      match: "",
      after: "",
    };
  }

  const from = Math.max(0, found.start - SNIPPET_LEAD);
  const to = Math.min(body.length, found.end + SNIPPET_TAIL);

  return {
    before: (from > 0 ? "…" : "") + body.slice(from, found.start),
    match: body.slice(found.start, found.end),
    after: body.slice(found.end, to) + (to < body.length ? "…" : ""),
  };
}

/**
 * Substring search over the folded haystack — deliberately not word-based, so
 * "980 g", "betafl" and "quadcopter" all hit.
 */
export function searchDocuments(docs, query, limit = 40) {
  const needle = normalizeForSearch(query);
  if (needle.length < 2) return [];

  const scored = [];

  for (const entry of docs) {
    const at = entry.haystack.indexOf(needle);
    if (at === -1) continue;

    const normalizedLabel = normalizeForSearch(entry.label);
    let score = 0;

    if (normalizedLabel === needle) score += 100;
    else if (normalizedLabel.startsWith(needle)) score += 60;
    else if (normalizedLabel.includes(needle)) score += 40;

    if (at === 0) score += 20;
    // A hit that covers most of the field beats one buried in a long paragraph.
    score += Math.round(
      (needle.length / Math.max(entry.haystack.length, 1)) * 30
    );
    if (entry.kind === "page") score += 5;

    scored.push({
      ...entry,
      score,
      snippet: buildSnippet(entry.body, query),
      // Highlight the label too when that is where the term actually landed.
      labelSnippet: entry.label ? buildSnippet(entry.label, query) : null,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.page.localeCompare(b.page));

  return scored.slice(0, limit);
}

/** Group ranked hits under the page they belong to, preserving rank order. */
export function groupResults(results) {
  const groups = [];
  const byPage = new Map();

  for (const result of results) {
    let group = byPage.get(result.pageUrl);

    if (!group) {
      group = {
        pageUrl: result.pageUrl,
        page: result.page,
        kind: result.kind,
        hits: [],
      };
      byPage.set(result.pageUrl, group);
      groups.push(group);
    }

    group.hits.push(result);
  }

  return groups;
}
