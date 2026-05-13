# EMPÆRIAL — Design System

> **EMPÆRIAL** is a student technology team. The brand reads as a tightly-engineered, corporate-grade studio operated by students — disciplined, monochrome, and aerodynamic.

The name fuses *Empire* + *Aerial*, bound together by the **Æ** ligature. The visual identity is built around two recurring motifs:

1. **The Propeller** — two opposed, lens-shaped wings rotating around a central hub. This is the literal logo construction (two black blades cradling the **Æ** badge) and also the system's compositional engine.
2. **The Wing Cut** — a sharp, elongated horizontal blade with a soft outer arc and a hard inner edge. It appears as a divider, a button shape, a banner cap, and a section transition.

Everything else in the system supports those two ideas: hard edges, thin rules, wide geometric typography, and a strict black-and-white palette with absolutely no chromatic accents.

---

## Provided Sources

| Source | Path | Notes |
|---|---|---|
| Primary logo | `uploads/Empaerial Logo.png` (1080×1080, PNG) | Full wordmark with **Æ** badge cradled by two propeller blades. Black on white. The only brand asset provided. |

No additional codebase, Figma file, slide template, or product screenshots were attached. Visual decisions outside the logo (typography, components, motion, copy tone) are inferred from the user's brief — *"black and white theme, sharp propeller and wing shapes, slick corporate fonts and layout"* — and clearly flagged below as inferences. **See "Caveats & Asks" at the bottom.**

---

## Index

Read these in order if you're new to the system:

| # | File | What it covers |
|---|---|---|
| 1 | `README.md` | This file. Brand context, content fundamentals, visual foundations, iconography. |
| 2 | `colors_and_type.css` | CSS custom properties for color tokens, type scale, spacing, radii, shadows, motion. Drop-in. |
| 3 | `fonts/` | Web font files (Saira, Inter, JetBrains Mono — all OFL/SIL). |
| 4 | `assets/` | Logo lockups (black, white, transparent) and propeller mark glyphs. |
| 5 | `preview/` | Specimen cards (rendered in the Design System tab). |
| 6 | `SKILL.md` | Cross-compatible Agent Skill manifest. |

---

## Content Fundamentals

EMPÆRIAL writes the way it builds — precise, declarative, and a little serious. Copy reads like an engineering brief written by a student team that aspires to ship aerospace-grade work. **Confident, never cute. Spare, never breezy.**

### Voice

- **Declarative.** Statements, not pitches. *"We design and ship technology for our campus."* not *"Helping you do more, faster!"*
- **Technical-leaning.** Borrow vocabulary from aerospace and engineering: *flight, payload, lift, axis, vector, telemetry, airframe, deploy, ship*. Use sparingly — never as decoration.
- **Earnest.** This is a student team taking itself seriously. No irony, no winks, no "made with ❤️".

### Tone

- **Corporate-formal, but not stuffy.** Treat the reader as a peer engineer, not a customer.
- **First-person plural.** *"We"* for the team, *"you"* for the reader. Avoid *"I"* unless it's a signed note.
- **Direct address is fine.** *"Submit your proposal by Friday."* — imperative is comfortable here.

### Casing

- **Headlines:** UPPERCASE for the brand mark and primary section headers (echoes the wordmark). Sentence case for sub-headers and most UI labels.
- **Body:** Sentence case. Standard punctuation.
- **Buttons:** Either UPPERCASE (with letter-spacing) for primary CTAs, or sentence case for secondary actions. Pick one per surface and stay consistent.
- **Brand spelling:** Always **EMPÆRIAL** (uppercase, with the **Æ** ligature) when used as a wordmark. **Empærial** in running prose. Never *"Empaerial"* (no AE). Never *"empaerial"* (lowercase).

### Examples

| ✅ Yes | ❌ No |
|---|---|
| *"Submissions close Friday at 23:59 ET."* | *"Don't forget to submit by Friday — see you there! ✨"* |
| *"EMPÆRIAL ships student-built technology."* | *"We're a fun team of student innovators 🚀"* |
| *"Telemetry: 12 active projects, 4 deployed this term."* | *"Lots of cool things happening at Empaerial!"* |
| *"Apply"*, *"View project"*, *"Read brief"* | *"Click here!"*, *"Let's go →"* |

### Emoji

**Do not use emoji** in product surfaces, marketing, or documentation. The aesthetic is monochrome and typographic — emoji break the system. Unicode glyphs (arrows, mathematical operators, geometric shapes) are acceptable as in-line marks: `→ ← ↗ ↘ ◆ ◇ ▲ ▼ ✕ + −`.

---

## Visual Foundations

### Palette

A **strict monochrome** system. Black and white are the only brand colors. Greys exist solely as functional neutrals (borders, disabled states, scrim layers). No blues, no greens, no warm whites. The single permitted exception is `--ink-inverse-warning` for destructive confirmations, kept far from marketing surfaces.

| Token | Hex | Use |
|---|---|---|
| `--ink-100` | `#000000` | Primary type, primary surfaces (inverse), wing fills, the propeller. |
| `--ink-90` | `#0A0A0A` | Hover state for primary black surfaces. |
| `--ink-80` | `#1A1A1A` | Dark cards on light backgrounds; modal scrims (with alpha). |
| `--ink-60` | `#3A3A3A` | Secondary type on light surfaces. |
| `--ink-40` | `#707070` | Tertiary type, captions, metadata. |
| `--ink-20` | `#A8A8A8` | Disabled type, very-low-emphasis labels. |
| `--ink-10` | `#D4D4D4` | Hairline borders on light surfaces. |
| `--ink-05` | `#EFEFEF` | Subtle fills, table zebra, hover backgrounds. |
| `--paper` | `#FFFFFF` | Default canvas. |
| `--paper-warm` | `#FAFAFA` | Section breaks, alternate canvas. |

Inverted scale (`--ink-inverse-*`) mirrors these for dark surfaces. There is **no opacity-only variant** — use the scale.

### Typography

> ⚠️ **Substitution flagged.** No font files were provided. The wordmark in the supplied logo reads as a wide geometric sans (in the Eurostile / Bahnschrift family). The closest open-license matches I have access to are **Saira** (display) and **Inter** (body). **If you have the original wordmark font or a preferred substitute, please share it and I will replace these.**

| Role | Family | Weight | Tracking | Notes |
|---|---|---|---|---|
| Display / Wordmark | **Saira** | 600–700 | `+0.04em` | Wide, geometric. Used UPPERCASE for hero type and section headers. Mirrors the wordmark. |
| Body | **Inter** | 400, 500, 600 | `0` | Workhorse. Sentence case. |
| Mono / Telemetry | **JetBrains Mono** | 400, 500 | `0` | Code, data, build numbers, timestamps. |

The display face is set **wide** and **uppercase** — it is the typographic equivalent of the wordmark and should feel structural, not loud. Body type is calm and readable; the contrast carries the mood.

### Spacing & Rhythm

A **4 px base grid** with a strict scale. No off-grid values.

`4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`

Sections breathe — generous vertical rhythm (96–128 px between major blocks on desktop). Inline UI is tight (8–12 px). Avoid medium-scale gaps; pick small or large.

### Corner Radii

EMPÆRIAL is **predominantly square**. Hard 90° corners are the default for cards, inputs, and buttons. The two exceptions:

- **Pill / capsule** — for the wing-shape buttons and the **Æ** badge. Full radius (`9999px`).
- **2 px** — for very small chips and tags only, when a hairline pure-square would feel brittle.

`--radius-sharp: 0` · `--radius-chip: 2px` · `--radius-pill: 9999px`. **No 4 px, 8 px, or 12 px radii.**

### Borders & Rules

Hairlines are essential. Most surface separation is done with `1px solid var(--ink-10)` rules rather than shadows. On dark surfaces, use `1px solid var(--ink-inverse-10)`. Rules are full-bleed when delineating sections and inset 16–24 px when delineating list items.

### Shadows

The system is **near-shadowless**. Elevation is communicated by line and contrast, not depth. The two permitted shadows:

- `--shadow-lift` — `0 1px 0 var(--ink-10)`. A single hairline drop, used on sticky headers and toolbars.
- `--shadow-modal` — `0 24px 48px -12px rgba(0,0,0,0.25)`. Reserved for modals and floating popovers. Nothing else.

No glow, no inner shadow, no neumorphism, no layered colored shadows. Cards do not float.

### Backgrounds

- **Default:** flat `--paper` (white) or flat `--ink-100` (black).
- **Pattern:** sparse use of the **propeller blade** as a hero motif — large, single, off-center, never repeated as wallpaper. See `assets/propeller-mark.svg` (when added).
- **Imagery:** when photos are used, they are **black-and-white, high-contrast, slightly grainy** (think aerospace archive, not Instagram). No color grading. Subjects are studio objects, hardware, hands-on-keyboards. Full-bleed with a hard horizon — never floating in a card with rounded corners.
- **No gradients.** None. Not even subtle ones. The system is two-tone.

### Motion

Sharp, mechanical, short. Nothing bouncy.

- **Duration:** `120ms` for micro (hover, focus); `200ms` for state changes (modal in/out, drawer); `400ms` for once-per-page entrance.
- **Easing:** `cubic-bezier(0.2, 0.0, 0.0, 1.0)` — fast start, settled finish. Mirrors a propeller catching air.
- **Page transitions:** if any, a horizontal **wipe** in black, never a fade-to-color or a scale.
- **Hover:** instant inversion (black → white surface, white → black surface) on primary actions; opacity → 70% on secondary. **No translate, no scale, no shadow grow.**
- **Press:** invert, no scale.
- **Loading:** a thin black bar that sweeps across the bottom of the viewport. No spinners with rotating dots.

### Hover & Press States

| State | Primary (black) | Secondary (outline) | Tertiary (text link) |
|---|---|---|---|
| Default | bg `--ink-100`, text `--paper` | bg `--paper`, border `--ink-100`, text `--ink-100` | text `--ink-100`, no underline |
| Hover | bg `--ink-90` | bg `--ink-100`, text `--paper` (full inversion) | underline 1 px, offset 2 px |
| Pressed | bg `--ink-80` | bg `--ink-80`, text `--paper` | text `--ink-60` |
| Focus | `2px` outline at `--ink-100`, offset `2px` | same | same |
| Disabled | bg `--ink-20`, text `--paper` | border `--ink-20`, text `--ink-20` | text `--ink-20` |

### Transparency & Blur

Used sparingly, and only to **establish layer hierarchy** — never decoratively.

- **Modal scrim:** `rgba(0, 0, 0, 0.6)`. No blur on light surfaces.
- **Dark-surface scrim:** `rgba(0, 0, 0, 0.7)` over hero photography.
- **Backdrop blur:** allowed on the sticky top nav only — `backdrop-filter: blur(8px)` over a `rgba(255,255,255,0.85)` background. Nowhere else.

### Layout Rules

- **12-column grid**, 80 px outer margin on desktop, 24 px on mobile. Column gap 24 px.
- **Sticky top nav** (64 px tall, hairline bottom rule).
- **No floating elements** other than modals and toasts. No FAB. No bottom-sheet drawers.
- **Section headers** are full-bleed: a horizontal wing-cut (the propeller blade silhouette) caps the top of major sections, in solid black on white or solid white on black.
- **Maximum content width:** 1280 px for primary content, 720 px for prose.

### Cards

A "card" in this system is **a rectangle with a hairline border** — no shadow, no rounded corners, no fill change. Hover *may* swap to a 2 px black border (no offset, no shift). Use the wing motif as a top accent only when a card represents a project or initiative.

---

## Iconography

EMPÆRIAL uses **Lucide** as its icon library (CDN-linked: `https://unpkg.com/lucide@latest`). Lucide's stroke-based, geometric, monochrome icons match the system's hard-edge sensibility and are trivially recolorable to pure black/white.

Defaults:

- **Stroke width:** `1.5` (slightly tighter than Lucide's `2` default — keeps icons feeling precise).
- **Size scale:** `16 · 20 · 24 · 32 · 48` px. No off-scale sizes.
- **Color:** `currentColor`, always. Icons inherit type color. No two-tone icons.
- **No fill icons** in nav or buttons; reserve filled glyphs (e.g. ▲ ▼ ◆) for typographic micro-marks.

> ⚠️ **Substitution flagged.** No icon set was provided. Lucide is the closest match in spirit (geometric, hairline, monochrome). If EMPÆRIAL has an in-house icon set, swap the CDN reference in `colors_and_type.css` and `assets/icons/`.

### Brand Marks (in `assets/`)

| File | Use |
|---|---|
| `empaerial-logo.png` | Primary lockup, black on light. |
| `empaerial-logo-white.png` | Inverse lockup, white on dark. |
| `empaerial-logo-transparent.png` | Logo with transparent paper, for layering. |

The **Æ** ligature in its circle badge is the most compact mark — use it as a favicon, app icon, or single-character bug. The full propeller-with-wordmark needs ≥ 240 px of horizontal room to read; below that, fall back to the badge alone.

### Emoji and Unicode

**No emoji**, ever, in product surfaces. Acceptable Unicode marks for in-line use: `→ ← ↗ ↘ ↑ ↓ ◆ ◇ ▲ ▼ ✕ + − · ·` and the brand's own `Æ`.

---

## Caveats & Asks

This system is built from a **single uploaded logo** (`Empaerial Logo.png`) plus the user's brief. Specifically:

1. **Typography is a substitution.** Saira + Inter + JetBrains Mono are open-license stand-ins. *Please share the original wordmark font* so we can replace Saira.
2. **Iconography is a substitution.** Lucide is linked from CDN. *Please confirm or share an in-house set.*
3. **No product / codebase / Figma was attached.** No UI kits or sample slides were generated — there's no source product to recreate. *If EMPÆRIAL has a website, app, internal tool, or slide deck, attach it (Import → codebase / Figma / files) and I'll build matching UI kits and slide templates.*
4. **Photographic style is inferred** (B&W, high contrast, grainy). *Share 3–5 reference photos* so we can lock the look.
5. **Brand voice examples are inferred** from the "student technology team" framing. *Send 2–3 real pieces of EMPÆRIAL copy* (a recruiting email, a project page, a slide intro) so we can calibrate.

**Strong ask: please attach a codebase, website, Figma file, or anything EMPÆRIAL has shipped.** With a real product surface, I can extend this system into proper UI kits and slide templates instead of foundations alone.
