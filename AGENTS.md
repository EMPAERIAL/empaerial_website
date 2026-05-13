# Repository Guidelines

## Project Structure & Module Organization
- `src/app/`: Next.js App Router pages, route groups, and API endpoints (`src/app/api/*/route.js`).
- `src/components/`: reusable UI and feature components (`Header`, `Hero`, `Team`, `admin`, `ui`).
- `src/hooks/`: data-access hooks (`useTeams`, `useProjects`, `useBlogs`) used across pages/components.
- `src/Lib/`: shared service and integration utilities (Supabase client, upload helpers, admin utils).
- `src/translations/`: localization dictionaries (`en.json`, `tr.json`).
- `public/`: static assets (images, videos, sitemap output).
- `EMP�RIAL Design System/`: reference design artifacts; treat as source material, not runtime app code.

## Build, Test, and Development Commands
- `npm run dev`: start local development server with Turbopack.
- `npm run build`: production build + `next-sitemap` generation.
- `npm run start`: run the built app.
- `npm run prepare`: install Husky hooks.
- `npx prettier --check .`: verify formatting before opening a PR.

## Coding Style & Naming Conventions
- Use Prettier (`prettier.config.js`); do not hand-format.
- Indentation: follow Prettier defaults (2 spaces, semicolon/quote style per formatter output).
- Components: `PascalCase` filenames for React components (e.g., `Team.jsx`, `Section.tsx`).
- Hooks: `useXxx.js` naming and keep side effects/data-fetching encapsulated.
- CSS Modules: colocate as `Component.module.css` near the component/page.
- Prefer clear folder boundaries: UI in `components`, data/service logic in `hooks`/`Lib`.

## Testing Guidelines
- No test runner is configured yet. For new features, add tests with Vitest or Jest + React Testing Library.
- Place tests next to source as `*.test.(js|jsx|ts|tsx)` or in `src/__tests__/`.
- Prioritize coverage for hooks, API routes, and admin flows.
- Minimum pre-PR checks: run `npm run build` and manually verify key routes (`/`, `/projects`, `/blogs`, `/admin`).

## Commit & Pull Request Guidelines
- Follow existing commit style: short imperative subject, optionally scoped by feature (e.g., `Redesign footer and reveal animations`, `Fix home section contrast for team and projects`).
- Keep commits focused and atomic; avoid mixing redesign, data, and infra changes.
- PRs should include:
  - concise summary and rationale,
  - linked issue(s) when applicable (e.g., `#22`),
  - screenshots/GIFs for UI updates,
  - notes on env/config changes and manual test steps.
- When creating an issue, first read and follow the relevant template under `.github/ISSUE_TEMPLATES/`.

Issue implementation flow:

1. Always switch to `master`.
2. Pull from `master` to sync your local copy.
3. Implement the issue.
4. Open a PR after implementation.
5. Merge the PR, then switch back to `master` and pull again to re-sync.
