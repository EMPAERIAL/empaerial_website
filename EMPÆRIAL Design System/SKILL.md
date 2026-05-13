---
name: empaerial-design
description: Use this skill to generate well-branded interfaces and assets for EMPÆRIAL, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## Quick reference

- **Palette:** strict black + white + neutral grey scale. No color accents.
- **Type:** Saira (display, uppercase, wide), Inter (body), JetBrains Mono (code / telemetry).
- **Radii:** sharp `0` (default) or pill `9999px` (wing buttons). Never in-between.
- **Shadows:** near-shadowless. Hairline rules carry hierarchy.
- **Motion:** sharp / mechanical, `cubic-bezier(0.2, 0, 0, 1)`. Hover = invert. No bounces.
- **Motifs:** propeller (two opposed wing-cuts) and the Æ ligature badge.
- **Voice:** declarative, technical, earnest. No emoji. UPPERCASE for the wordmark and headers.
- **Imagery:** B&W high-contrast, slightly grainy, full-bleed.

Drop `colors_and_type.css` into any HTML to inherit tokens and semantic styles.
