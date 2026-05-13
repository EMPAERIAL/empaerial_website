No CONTEXT.md or ADRs exist yet — I'll create a CONTEXT.md as we go. Here are the deepening opportunities I found:

  ---
  Deepening Opportunities

  1. Admin Dashboard Monolith
  - Files: src/app/admin/page.jsx (1,655 lines)
  - Problem: Shallow in the extreme — one file embeds form state, upload logic, project builder, blog editor, team manager, API calls, and 6 sub-component definitions.
  The interface is the whole file. Every change requires navigating and understanding 1,600 lines. No seam exists anywhere; the deletion test collapses everything into 
  chaos.
  - Solution: Extract into deep modules: ProjectEditor, BlogEditor, TeamManager, each owning their form state, validation, and API calls behind a narrow interface. Lift
   shared upload logic into a useUpload hook.
  - Benefits: Locality — bugs in blog editing stay in BlogEditor; tests can target one editor in isolation via its interface, not the entire admin page.

  ---
  2. No Data-Fetching Seam
  - Files: src/components/Team/Team.jsx, src/app/projects/page.jsx, src/app/blogs/page.jsx, src/app/admin/page.jsx
  - Problem: Every page and component reaches directly to /api/* endpoints with the same fetch-then-setState pattern repeated across 4+ places. Shallow: no abstraction 
  earns any leverage. Delete a fetch call and the same complexity reappears everywhere.
  - Solution: Introduce data hooks (useTeams, useProjects, useBlogs) that own fetching, caching, error state, and refetch logic behind a narrow interface. Components   
  call const { teams, loading, error } = useTeams() and stop there.
  - Benefits: Leverage — one hook change propagates everywhere; tests mock the hook interface, not global.fetch.

  ---
  3. Scattered Supabase Client Initialization
  - Files: src/Lib/supabaseClient.js, src/app/api/teams/route.js, src/app/api/projects/route.js, src/app/api/blogs/route.js, src/app/admin/page.jsx
  - Problem: Supabase clients are created inline in 4+ places. This is a pass-through seam: the real configuration logic (env vars, anon vs service-role key, error     
  handling on missing config) is duplicated. Deletion test: remove supabaseClient.js and the duplication is already there in the API routes.
  - Solution: A single getSupabaseClient(role: 'anon' | 'service') factory in src/Lib/supabaseClient.ts that centralizes both client variants, validates env vars at    
  startup, and is the only import site.
  - Benefits: Locality — misconfigured keys are caught in one place; tests swap the factory, not every route.

  ---
  4. Hardcoded Search Data
  - Files: src/components/Search/SearchBar.jsx
  - Problem: The search command palette hardcodes team member names and LinkedIn links directly in the component. This is the shallowest possible design — the interface
   (a search box) is as complex as the implementation (a hardcoded array). Adding a team member requires editing the search component, not the team data source.        
  - Solution: Drive SearchBar from the /api/teams endpoint (already consumed by Team.jsx), or from the useTeams hook if candidate #2 is addressed. The interface narrows
   to: "given a data source, render a command palette."
  - Benefits: Single source of truth; SearchBar tests only need to check rendering logic against injected data.

  ---
  5. Language State Prop-Drilling
  - Files: src/app/page.tsx, src/components/Header/Header.jsx, src/app/projects/page.jsx, src/app/blogs/page.jsx
  - Problem: Language detection (navigator.language.startsWith('tr')) is re-implemented or passed as props across multiple components. Shallow: no module owns language 
  state; every consumer carries the full complexity.
  - Solution: A LanguageContext (or integrate with next-intl already in the dependencies) that exposes { locale, t, setLocale }. Components call useTranslation() and   
  stop; no prop drilling.
  - Benefits: Leverage — one locale change site; tests set context once and verify translations across the whole tree.