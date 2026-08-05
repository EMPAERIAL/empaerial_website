# Context

## Terms

### Project Section

A single typed content block inside a project's `sections` array; the atomic authoring unit of the Project Detail Template's body.

Notes:
- Canonical types: `specs`, `materials`, `gallery`, `callouts`, `videos`, `text`, `links`, `media-interval`, `contact`.
- `links` renders a grid of outbound resource links (label, url, optional description) as real anchors. It exists because no other section type can produce a clickable link: `text` renders its content as escaped body copy, so a pasted URL is inert.
- In `specs` and `materials`, the large/compact value type size is decided once per section from its longest value, not per row. A single long value therefore shrinks every tile in that grid rather than only its own, which keeps tiles in one grid visually consistent.
- `contact` is not an ordinary orderable section — it always renders as the fixed final block (see Atmospheric Prototype Implementation notes).
- Each section carries an admin-editable `navLabel`, independent of its rendered body heading.
- No section type currently models a team roster or a structured bill-of-materials table; requests to reproduce those from design references need a new section type, not just a style change.
_Avoid_: block, module, widget

### Project Detail Template

The standard page structure used to present any project on the website.

Notes:
- This is a shared template for all projects, not a one-off layout for a flagship build.
- Individual projects may vary by content completeness, but they should render through the same detail-page system.

### Project Metadata

Structured project-level fields that describe the overall state and intent of a project independently from body sections.

Canonical fields:
- `status`
- `year`
- `purpose`

Notes:
- These fields power the dossier-style metadata block in the project detail page.
- They are page-level metadata, not freeform text content inside ordinary sections.
- Allowed `status` values are: `active`, `work in progress`, `completed`, `archived`.
- `year` should support either a single year or a short year range display value.
- `purpose` should be a short phrase suitable for dossier-style metadata, not a full sentence.
- Project metadata fields are optional; missing values should render as blank rather than being required for publishing.
- In the dossier metadata block, missing metadata values should still render their rows and display `-` as the value.
- The dossier metadata block should read only from the structured project metadata fields and should not support separate hero-specific overrides.
- Controlled metadata values such as `status` should be translated in the UI while remaining canonical in stored data.

### Atmospheric Prototype Implementation

Applying the atmospheric project-detail prototype means changing the visual presentation layer of the project detail page while keeping the existing project content model intact.

**Superseded in part** by Atmospheric Variant C: the notes below about the dossier rail (sticky nav, active-section tracking, mobile compact indicators) described the original prototype pass and no longer match the live page. See Dossier Rail and Atmospheric Variant C.

Notes:
- The implementation scope is limited to the project detail page route, not the projects listing page.
- The current `sections`-based project structure remains the source of truth.
- The implementation goal is to reproduce the prototype's visual language and layout behavior without replacing the admin or storage model.
- The website's existing global header and footer stay in place.
- The project-detail body between header and footer should match the prototype as closely as possible.
- When project content is incomplete, sections should collapse to simpler variants instead of disappearing entirely or showing placeholder filler.
- When content is missing, fallback states should remain visually designed and in-tone with the atmospheric template rather than using generic placeholder copy.
- Designed fallback states may include short polished copy when needed, but should stay restrained and in-tone with the dossier atmosphere.
- The dossier rail and metadata system should begin with the hero section rather than appearing independently under the global header.
- Section order remains admin-controlled through the existing project sections data.
- Admin should be able to explicitly choose which asset appears as the project's primary hero image.
- The explicitly chosen primary hero image may also be reused by the `/projects` listing page.
- The hero should support either an image or a video as its primary curated asset.
- Hero video should autoplay muted by default, with graceful fallback when autoplay is unavailable.
- The hero title and summary should continue to use the project's existing `name` and `summary` fields.
- The contact call-to-action should render as a fixed final block rather than as an ordinary reorderable section.
- The fixed final contact block should appear in the dossier rail as the last navigable item.
- The back-to-projects action should be integrated into the atmospheric hero/dossier language rather than rendered as a standard utility button.
- Fixed UI strings in the atmospheric project detail page should preserve the existing translation behavior.
- This is an explicit trade-off: the page should use prototype-faithful section designs, but overall flow can vary by project.
- The current project structure can be extended with a small number of new section types when required to reproduce the prototype faithfully.
- A dedicated `media-interval` section type may be used between ordinary sections to create cinematic background-video transitions during scroll.
- `media-interval` sections should use muted autoplay on desktop, with graceful fallback when autoplay is unavailable.
- `media-interval` sections may optionally include a small overlay caption in the same restrained atmospheric voice as the rest of the page.
- `media-interval` captions should support a label plus a short subline.
- Ordinary `videos` sections should remain available alongside `media-interval` sections because they serve different presentation roles.
- `media-interval` sections should appear in the dossier rail and use their own explicit navigation labels.
- Mobile should preserve the same atmospheric design language through deliberate adaptation rather than a compressed desktop layout.
- Motion is a core part of the atmospheric prototype and must be implemented as part of the first-pass experience rather than deferred as optional polish.
- The left dossier rail navigation should include all page sections in their rendered order.
- The left dossier rail should be clickable and should actively track the currently visible section while scrolling.
- Section navigation labels should be explicitly editable in admin, with sensible automatic fallback labels when no custom label is set.
- Existing projects will be updated manually rather than backfilled automatically, to keep the content model understandable for future project setup.
- On mobile, the dossier navigation should adapt into a more compact form, using short horizontal indicators instead of full section names where needed.
- Atmospheric overlays such as callout pins should remain interactive on desktop and collapse into cleaner non-overlay presentations on mobile.
- Scroll tracking, section activation, and atmospheric motion should use browser APIs first, with animation libraries added only if the prototype cannot be matched cleanly otherwise.
- Every rendered section should expose an editable `nav label` in admin for dossier rail navigation.
- Any new section types introduced for the atmospheric template should be supported in the admin UI in the same implementation pass as the front-end renderer.
- Section body headings and dossier rail navigation labels may differ.
- Visual styling weight should be inferred from section type for now rather than controlled by an explicit admin toggle.

### Dossier Rail (retired)

The sticky section-navigation list that used to accompany `/projects/[slug]`, listing every rendered Project Section with an active-section highlight that tracked scroll position.

Notes:
- Retired as of Atmospheric Variant C, which replaced it with a flat, single-column section flow and no persistent navigation.
- The underlying `navLabel` field on each Project Section is still stored and admin-editable, but nothing currently renders it.
_Avoid_: sidebar nav, dossier navigation — both read as still-current under the retired design

### Atmospheric Variant C

The current live visual treatment of the Project Detail Template: a black blueprint-grid background, corner-bracket hero frame, and flat numbered sections (`01 GALLERY`, `02 SPECIFICATIONS`, …) with no persistent section navigation.

Notes:
- Named after the "C · Atmospheric" option in the design system's `Project Detail - Standalone.html` reference, which also offers unimplemented "A · Dossier" and "B · Editorial" variants.
- Supersedes the Dossier Rail: no sticky nav, no active-section scroll-tracking, no mobile compact indicators.
- The hero's curated media renders as a fixed-aspect side panel rather than a full-bleed background image; project metadata renders as an inline stat row rather than a floating dossier card.
- Individual section "frames" (bordered, rounded cards) from the original prototype were removed in favor of a flat background with a numbered header row per section.
- The reference mockup also shows a team roster and a structured bill-of-materials table for this variant; neither has a matching Project Section type yet, so neither is implemented on the live page.

### Admin Session

Access to the `/admin` dashboard itself, granted by an ID/password check on `/admin-login` that sets a `sessionStorage` flag.

Notes:
- Distinct from the Confirmation Password below: reaching the dashboard does not by itself authorize writes or deletes.
- The `/admin-login` credential check runs client-side against a fixed ID/password pair, not against a server-verified account.
_Avoid_: login, auth — both too generic to distinguish from the Confirmation Password

### Confirmation Password

A server-side password required on write/delete API calls (projects, blogs, teams), checked against the `ADMIN_PASSWORD` / `ADMIN_DELETE_PASSWORD` env vars, independent of the Admin Session.

Notes:
- Enforcement is inconsistent across content types as of this writing: teams writes only require it when `ADMIN_PASSWORD` is set in the environment, while projects/blogs deletes always require it but fall back to a hardcoded default password when `ADMIN_DELETE_PASSWORD` is unset.
_Avoid_: admin password alone — ambiguous with the Admin Session's login password

### Team Member

A person profile shown on the site's team roster, authored through the admin Team Manager.

Notes:
- Fields: name, age, country, role, skills, fun fact, photo.
- Unrelated to the Atmospheric Variant C reference mockup's per-project team roster (see Project Section) — this is the site-wide team, not project-scoped.

### Blog Post

A CMS-authored article shown on `/blogs`, with title, slug, and content, authored through the admin Blog Editor.
