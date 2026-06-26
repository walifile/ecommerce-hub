create extension if not exists "pgcrypto";

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null unique,
  sku text not null unique,
  cost_price numeric(12, 2) not null default 0,
  selling_price numeric(12, 2) not null default 0,
  compare_price numeric(12, 2),
  stock_quantity integer not null default 0,
  low_stock_limit integer not null default 5,
  short_description text,
  description text,
  specifications jsonb not null default '[]'::jsonb,
  meta_title text,
  meta_description text,
  status text not null default 'draft',
  featured boolean not null default false,
  is_new boolean not null default false,
  best_seller boolean not null default false,
  rating numeric(3, 2) not null default 0,
  reviews_count integer not null default 0,
  image_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 0
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  address text,
  city text,
  total_orders integer not null default 0,
  total_revenue numeric(12, 2) not null default 0,
  lifetime_value numeric(12, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers(id) on delete set null,
  order_number text not null unique,
  status text not null default 'pending',
  payment_method text not null default 'cod',
  shipping_cost numeric(12, 2) not null default 0,
  ad_cost numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  coupon_code text,
  revenue numeric(12, 2) not null default 0,
  total numeric(12, 2) not null default 0,
  notes text,
  reversal_reason text,
  refund_amount numeric(12, 2),
  reversal_note text,
  reversed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists reversal_reason text;
alter table public.orders add column if not exists refund_amount numeric(12, 2);
alter table public.orders add column if not exists reversal_note text;
alter table public.orders add column if not exists reversed_at timestamptz;

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price numeric(12, 2) not null default 0,
  product_cost numeric(12, 2) not null default 0
);

create table if not exists public.order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  previous_status text,
  new_status text not null,
  reason text,
  refund_amount numeric(12, 2),
  note text,
  actor_role text not null default 'admin',
  created_at timestamptz not null default now()
);

create or replace function public.update_order_status_with_inventory(
  p_order_id uuid,
  p_status text,
  p_reason text default null,
  p_refund_amount numeric default null,
  p_note text default null
)
returns table (
  order_id uuid,
  order_number text,
  customer_name text,
  customer_phone text,
  total numeric,
  previous_status text,
  new_status text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
  v_customer_name text;
  v_customer_phone text;
  v_status text := lower(trim(coalesce(p_status, '')));
  v_previous_status text;
  v_reason text := nullif(trim(coalesce(p_reason, '')), '');
  v_note text := nullif(trim(coalesce(p_note, '')), '');
  v_refund_amount numeric := case
    when p_refund_amount is null then null
    else greatest(0, p_refund_amount)
  end;
  v_item record;
begin
  if v_status = '' then
    raise exception 'Order status is required' using errcode = '22023';
  end if;

  if v_status not in (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'returned'
  ) then
    raise exception 'Unsupported order status: %', p_status using errcode = '22023';
  end if;

  select *
    into v_order
  from public.orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'Order not found' using errcode = 'P0002';
  end if;

  v_previous_status := v_order.status;

  select coalesce(c.name, 'there'), c.phone
    into v_customer_name, v_customer_phone
  from public.customers c
  where c.id = v_order.customer_id;

  if v_previous_status <> v_status then
    if v_previous_status not in ('cancelled', 'returned')
      and v_status in ('cancelled', 'returned') then
      for v_item in
        select product_id, quantity
        from public.order_items
        where order_id = p_order_id
          and product_id is not null
      loop
        update public.products p
          set stock_quantity = p.stock_quantity + v_item.quantity
        where p.id = v_item.product_id;
      end loop;
    elsif v_previous_status in ('cancelled', 'returned')
      and v_status not in ('cancelled', 'returned') then
      if exists (
        select 1
        from public.order_items oi
        join public.products p on p.id = oi.product_id
        where oi.order_id = p_order_id
          and oi.product_id is not null
          and p.stock_quantity < oi.quantity
      ) then
        raise exception 'Insufficient stock to reopen order %', v_order.order_number
          using errcode = '23514';
      end if;

      for v_item in
        select product_id, quantity
        from public.order_items
        where order_id = p_order_id
          and product_id is not null
      loop
        update public.products p
          set stock_quantity = p.stock_quantity - v_item.quantity
        where p.id = v_item.product_id;
      end loop;
    end if;

    update public.orders
      set status = v_status,
          reversal_reason = case when v_status in ('cancelled', 'returned') then v_reason else reversal_reason end,
          refund_amount = case when v_status in ('cancelled', 'returned') then v_refund_amount else refund_amount end,
          reversal_note = case when v_status in ('cancelled', 'returned') then v_note else reversal_note end,
          reversed_at = case when v_status in ('cancelled', 'returned') then now() else reversed_at end
    where id = p_order_id;

    insert into public.order_events (
      order_id,
      previous_status,
      new_status,
      reason,
      refund_amount,
      note
    )
    values (
      p_order_id,
      v_previous_status,
      v_status,
      v_reason,
      v_refund_amount,
      v_note
    );
  end if;

  return query
    select
      v_order.id,
      v_order.order_number,
      coalesce(v_customer_name, 'there'),
      v_customer_phone,
      v_order.total,
      v_previous_status,
      v_status;
end;
$$;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  expense_type text not null,
  amount numeric(12, 2) not null default 0,
  expense_date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  discount_type text not null default 'fixed',
  discount_value numeric(12, 2) not null default 0,
  min_order_amount numeric(12, 2) not null default 0,
  max_discount_amount numeric(12, 2),
  active boolean not null default true,
  starts_at timestamptz,
  expires_at timestamptz,
  usage_limit integer,
  used_count integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.coupons add column if not exists min_order_amount numeric(12, 2) not null default 0;
alter table public.coupons add column if not exists max_discount_amount numeric(12, 2);
alter table public.coupons add column if not exists starts_at timestamptz;
alter table public.coupons add column if not exists usage_limit integer;
alter table public.coupons add column if not exists used_count integer not null default 0;
alter table public.coupons add column if not exists created_at timestamptz not null default now();

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  store_name text not null default 'Ecommerce Hub',
  support_email text,
  support_phone text,
  hero_title text,
  hero_subtitle text,
  whatsapp_template_order_created text,
  whatsapp_template_order_confirmed text,
  whatsapp_template_order_shipped text,
  whatsapp_template_order_delivered text,
  theme text not null default 'midnight',
  announcement_enabled boolean not null default false,
  announcement_message text,
  announcement_link_text text,
  announcement_link_href text,
  created_at timestamptz not null default now()
);

-- For existing installs: add the storefront theme column if missing.
alter table public.settings add column if not exists theme text not null default 'midnight';
alter table public.settings add column if not exists announcement_enabled boolean not null default false;
alter table public.settings add column if not exists announcement_message text;
alter table public.settings add column if not exists announcement_link_text text;
alter table public.settings add column if not exists announcement_link_href text;

create table if not exists public.ai_generations (
  id uuid primary key default gen_random_uuid(),
  product_name text not null,
  product_title text,
  short_description text,
  long_description text,
  meta_title text,
  meta_description text,
  faq jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete set null,
  template_name text not null,
  phone text,
  status text not null default 'queued',
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text,
  created_at timestamptz not null default now()
);

-- Public signups via the anon key: allow INSERT only, keep the list private.
alter table public.newsletter_subscribers enable row level security;
grant insert on public.newsletter_subscribers to anon;
drop policy if exists "Allow anonymous newsletter signups" on public.newsletter_subscribers;
create policy "Allow anonymous newsletter signups"
  on public.newsletter_subscribers
  for insert
  to anon
  with check (true);

-- ── Auth profiles (linked to Supabase auth.users) ──────────────────────
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
-- (The optional "first signup becomes admin" bootstrap lives in
--  supabase/migrations/20260626130000_first_admin_bootstrap.sql.)
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

-- ── RLS: public catalog read, everything else service-role only ──────────
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select to anon, authenticated using (true);

drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products for select to anon, authenticated using (status = 'published');

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
  on public.product_images for select to anon, authenticated using (true);

alter table public.customers       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.expenses        enable row level security;
alter table public.coupons         enable row level security;
alter table public.settings        enable row level security;
alter table public.ai_generations  enable row level security;
alter table public.whatsapp_logs   enable row level security;

create index if not exists idx_products_category_id on public.products(category_id);
create index if not exists idx_orders_customer_id on public.orders(customer_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order_id on public.order_items(order_id);
create index if not exists idx_expenses_expense_date on public.expenses(expense_date);
