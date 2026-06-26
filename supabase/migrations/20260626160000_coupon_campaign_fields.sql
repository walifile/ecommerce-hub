alter table public.coupons
  add column if not exists min_order_amount numeric(12, 2) not null default 0,
  add column if not exists max_discount_amount numeric(12, 2),
  add column if not exists starts_at timestamptz,
  add column if not exists usage_limit integer,
  add column if not exists used_count integer not null default 0,
  add column if not exists created_at timestamptz not null default now();

alter table public.orders
  add column if not exists coupon_code text;
