-- ───────────────────────────────────────────────────────────────
-- Auth profiles
--
-- Adds a profiles table linked to Supabase auth.users, RLS so each
-- user can only see/update their own row, and a trigger that creates
-- a 'customer' profile on signup.
--
-- The optional "first signup becomes admin" bootstrap lives in a
-- SEPARATE migration (20260626130000_first_admin_bootstrap.sql) so it
-- can be applied for setup and disabled for production independently.
-- ───────────────────────────────────────────────────────────────

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by their owner" on public.profiles;
create policy "Profiles are viewable by their owner"
  on public.profiles for select to authenticated
  using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a 'customer' profile whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Promote/demote a user manually at any time:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
