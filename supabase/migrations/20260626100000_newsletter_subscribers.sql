-- ───────────────────────────────────────────────────────────────
-- Newsletter subscribers
--
-- Stores footer newsletter signups. RLS allows anonymous INSERT only
-- (public signups via the anon key) while keeping the list private.
-- ───────────────────────────────────────────────────────────────

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

alter table public.newsletter_subscribers enable row level security;
grant insert on public.newsletter_subscribers to anon;

drop policy if exists "Allow anonymous newsletter signups" on public.newsletter_subscribers;
create policy "Allow anonymous newsletter signups"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);
