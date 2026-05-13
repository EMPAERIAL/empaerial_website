
## EMPAERIAL Website

Next.js website for EMPAERIAL, including landing pages and an admin panel backed by Supabase.

## Quick Start

1. Install dependencies:
```bash
npm install
```
2. Create `.env.local` with required variables:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ADMIN_PASSWORD=<admin-write-password>
ADMIN_DELETE_PASSWORD=<admin-delete-password>
```
3. Run development server:
```bash
npm run dev
```

## Setup Guides

- Supabase storage/schema setup: [docs/SUPABASE_SETUP.md](/C:/Users/Ahmed%20Osman/Desktop/Teknofest/EMPAERIAL_WEBSITE/docs/SUPABASE_SETUP.md)
- Shared theme token usage: [docs/THEME_TOKENS.md](/C:/Users/Ahmed%20Osman/Desktop/Teknofest/EMPAERIAL_WEBSITE/docs/THEME_TOKENS.md)
