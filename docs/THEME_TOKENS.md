# Shared Theme Tokens and Component Rules

This repo uses shared design tokens so public pages and admin surfaces stay consistent.

## Source of Truth

Primary token source:
- `src/app/globals.css` (`:root` variables)

Admin style layer:
- `src/app/admin/adminStyles.js` (consumes `--admin-*` and shared tokens)

## Token Groups

In `globals.css`, keep these groups stable and reusable:
- Typography: `--font-display`, `--font-body`, `--font-mono`
- Global neutrals/timing: `--ink-*`, `--dur-*`, `--ease-prop`
- Semantic UI: `--ui-*`
- Blog surface: `--blog-*`
- Admin surface: `--admin-*`

## Usage Rules

1. Do not hardcode one-off colors/spacing in admin/editor components when an existing token fits.
2. Prefer semantic tokens (`--ui-*`, `--admin-*`, `--blog-*`) over raw hex values.
3. For new reusable surfaces (card/input/button), expose style from shared files instead of duplicating inline values.
4. Keep visual variants intentional:
   - Public/light sections use `sec-light` and core shared styles.
   - Dark sections and admin use semantic dark-surface tokens.

## Anti-Drift Checklist

Before merging UI work:
- New/changed styles reference existing tokens where possible.
- Repeated styles are centralized (for admin, in `adminStyles.js` or CSS modules).
- Buttons/inputs/cards preserve shared border radius, contrast, and focus behavior.
- Mobile behavior remains consistent with existing responsive patterns.

## When Adding New Tokens

Only add a token when all are true:
- The value is reused in more than one place.
- Existing tokens cannot express the intent cleanly.
- The token name is semantic (purpose-based), not page-specific.
