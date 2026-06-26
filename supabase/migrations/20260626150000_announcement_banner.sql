alter table public.settings
  add column if not exists announcement_enabled boolean not null default false,
  add column if not exists announcement_message text,
  add column if not exists announcement_link_text text,
  add column if not exists announcement_link_href text;
