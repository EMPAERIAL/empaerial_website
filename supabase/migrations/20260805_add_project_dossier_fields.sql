-- Adds the atmospheric project-detail authoring fields to public."Projects".
--
-- src/Lib/projectData.js#normalizeProjectPayload writes status, year, purpose
-- and hero_media on every create and edit. Without these columns PostgREST
-- rejects the whole insert/update with PGRST204 ("Could not find the 'status'
-- column of 'Projects' in the schema cache"), which surfaced in the admin panel
-- as a generic database error on both "create project" and "edit project".

alter table public."Projects"
  add column if not exists status text,
  add column if not exists year text,
  add column if not exists purpose text,
  add column if not exists hero_media jsonb
    default '{"type":"image","url":"","poster_url":"","alt":""}'::jsonb;

-- status is a controlled vocabulary in the app (PROJECT_STATUS_OPTIONS), and
-- the payload normaliser already coerces anything else to null. Enforcing it in
-- the database keeps hand-written rows honest too.
alter table public."Projects"
  drop constraint if exists "Projects_status_check";

alter table public."Projects"
  add constraint "Projects_status_check"
  check (
    status is null
    or status in ('active', 'work in progress', 'completed', 'archived')
  );

-- Backfill hero_media for rows created before the column existed so the detail
-- page has a curated hero instead of an empty one.
--
-- Note the condition: `add column ... default` fills existing rows with the
-- default, so they are never null here. Matching on a null hero_media would be
-- a silent no-op and leave every existing project with an empty hero url —
-- normalizeHeroMedia only falls back to image_url when hero_media is not an
-- object, so an empty-but-present object never recovers.
update public."Projects"
set hero_media = jsonb_build_object(
  'type', 'image',
  'url', image_url,
  'poster_url', '',
  'alt', ''
)
where coalesce(hero_media->>'url', '') = ''
  and coalesce(image_url, '') <> '';
