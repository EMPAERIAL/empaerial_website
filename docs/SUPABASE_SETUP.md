# Supabase Setup Prerequisites

This project expects Supabase Storage + database tables to be configured in a specific way.

## Required Environment Variables

Set these in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
ADMIN_PASSWORD=<admin-write-password>
ADMIN_DELETE_PASSWORD=<admin-delete-password>
```

Notes:
- `SUPABASE_SERVICE_ROLE_KEY` is used by server routes (`/api/upload`, `/api/projects`, `/api/blogs`, `/api/teams`).
- Missing/invalid Supabase env vars will cause API failures and build/runtime errors.

## Required Storage Bucket

Create this bucket in Supabase Storage:
- `uploads` (public)

Current folder conventions used by admin:
- Team photos: `team/`
- Blog videos: `videos/`
- Blog/project cover and gallery images: bucket root

## Required Database Tables

Expected tables:
- `Projects`
- `Blogs`
- `Teams` (or `teams`; code currently probes both in teams route)

The API update routes expect standard columns such as:
- `Projects`: `id`, `name`, `summary`, `image_url`, `slug`, `sections`
- `Blogs`: `id`, `title`, `slug`, `author`, `image_url`, `content`, `video_url`, `graph_data`, `gallery_images`
- `Teams`: `id`, `name`, `description`, `members`

## `updated_at` Trigger Compatibility

If your project uses DB triggers/functions that set `NEW.updated_at = now()`, each affected table must include an `updated_at` column.

Recommended SQL:

```sql
alter table public."Projects"
add column if not exists updated_at timestamptz default now();

alter table public."Blogs"
add column if not exists updated_at timestamptz default now();

alter table public."Teams"
add column if not exists updated_at timestamptz default now();
```

If you do not want `updated_at`, remove or change the trigger/function that writes to `NEW.updated_at`.

## Verification Checklist

- Upload succeeds from `/admin` for:
  - team image upload
  - blog cover/gallery upload
  - blog video upload
- Create/update succeeds for:
  - team members
  - projects
  - blogs
- `/api/projects`, `/api/blogs`, `/api/teams` return expected data without 500 errors
