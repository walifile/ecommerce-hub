-- ───────────────────────────────────────────────────────────────
-- Storefront theme setting
--
-- Adds the admin-controlled storefront theme column to settings.
-- Value maps to a [data-theme="..."] palette in app/globals.css
-- (midnight | ocean | violet | emerald | crimson).
-- ───────────────────────────────────────────────────────────────

alter table public.settings
  add column if not exists theme text not null default 'midnight';
