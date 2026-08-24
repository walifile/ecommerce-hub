-- Phase 1 completion: safe tracking, real reviews, editable operations settings,
-- customer aggregates, and atomic checkout/inventory handling.

alter table public.coupons add column if not exists created_at timestamptz not null default now();

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  subject text not null,
  message text not null,
  order_number text,
  source text not null default 'contact-page',
  status text not null default 'new' check (status in ('new', 'in_progress', 'resolved')),
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create index if not exists idx_contact_messages_status_created
  on public.contact_messages(status, created_at desc);

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
alter table public.order_events enable row level security;
create index if not exists idx_order_events_order_id on public.order_events(order_id, created_at);

alter table public.orders
  add column if not exists tracking_token uuid not null default gen_random_uuid();
create unique index if not exists idx_orders_tracking_token on public.orders(tracking_token);

alter table public.settings
  add column if not exists shipping_flat_rate numeric(12, 2) not null default 10,
  add column if not exists free_shipping_threshold numeric(12, 2) not null default 50;

create table if not exists public.product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  reviewer_name text not null,
  reviewer_email text,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index if not exists idx_product_reviews_product_status
  on public.product_reviews(product_id, status, created_at desc);

alter table public.product_reviews enable row level security;
grant select, insert on public.product_reviews to anon, authenticated;
drop policy if exists "Public can read approved reviews" on public.product_reviews;
create policy "Public can read approved reviews"
  on public.product_reviews for select to anon, authenticated
  using (status = 'approved');
drop policy if exists "Public can submit pending reviews" on public.product_reviews;
create policy "Public can submit pending reviews"
  on public.product_reviews for insert to anon, authenticated
  with check (status = 'pending');

create or replace function public.refresh_product_review_summary(p_product_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.products p set
    rating = coalesce((select round(avg(r.rating)::numeric, 2) from public.product_reviews r
                       where r.product_id = p_product_id and r.status = 'approved'), 0),
    reviews_count = (select count(*) from public.product_reviews r
                     where r.product_id = p_product_id and r.status = 'approved')
  where p.id = p_product_id;
end;
$$;

create or replace function public.product_review_summary_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_product_review_summary(old.product_id);
    return old;
  end if;
  perform public.refresh_product_review_summary(new.product_id);
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform public.refresh_product_review_summary(old.product_id);
  end if;
  return coalesce(new, old);
end;
$$;
drop trigger if exists product_review_summary_changed on public.product_reviews;
create trigger product_review_summary_changed
  after insert or update or delete on public.product_reviews
  for each row execute function public.product_review_summary_trigger();

create or replace function public.refresh_customer_metrics(p_customer_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.customers c set
    total_orders = coalesce((select count(*) from public.orders o
      where o.customer_id = p_customer_id and o.status not in ('cancelled', 'returned')), 0),
    total_revenue = coalesce((select sum(o.revenue) from public.orders o
      where o.customer_id = p_customer_id and o.status not in ('cancelled', 'returned')), 0),
    lifetime_value = coalesce((select sum(o.total) from public.orders o
      where o.customer_id = p_customer_id and o.status not in ('cancelled', 'returned')), 0)
  where c.id = p_customer_id;
end;
$$;

create or replace function public.customer_metrics_order_trigger()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.customer_id is not null then
    perform public.refresh_customer_metrics(old.customer_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.customer_id is not null then
    perform public.refresh_customer_metrics(new.customer_id);
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$$;
drop trigger if exists customer_metrics_order_changed on public.orders;
create trigger customer_metrics_order_changed
  after insert or update or delete on public.orders
  for each row execute function public.customer_metrics_order_trigger();

do $$ declare r record; begin
  for r in select id from public.customers loop
    perform public.refresh_customer_metrics(r.id);
  end loop;
end $$;

create or replace function public.adjust_coupon_for_order_status()
returns trigger language plpgsql security definer set search_path = public as $$
declare v_coupon public.coupons%rowtype;
begin
  if old.status not in ('cancelled', 'returned') and new.status in ('cancelled', 'returned')
     and old.coupon_code is not null then
    update public.coupons set used_count = greatest(0, used_count - 1) where code = old.coupon_code;
  elsif old.status in ('cancelled', 'returned') and new.status not in ('cancelled', 'returned')
     and new.coupon_code is not null then
    select * into v_coupon from public.coupons where code = new.coupon_code for update;
    if found and v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
      raise exception 'Coupon usage limit reached' using errcode = '23514';
    end if;
    update public.coupons set used_count = used_count + 1 where code = new.coupon_code;
  end if;
  return new;
end;
$$;
drop trigger if exists order_status_coupon_usage_changed on public.orders;
create trigger order_status_coupon_usage_changed before update of status on public.orders
  for each row when (old.status is distinct from new.status)
  execute function public.adjust_coupon_for_order_status();

-- All pricing, stock checks, coupon consumption, order and item writes happen
-- under one database transaction. Duplicate cart rows are aggregated first.
create or replace function public.create_store_order(
  p_name text,
  p_phone text,
  p_email text,
  p_address text,
  p_city text,
  p_payment_method text,
  p_notes text,
  p_coupon_code text,
  p_items jsonb,
  p_ad_cost numeric default 0
)
returns table(order_id uuid, order_number text, tracking_token uuid, subtotal numeric,
              shipping numeric, discount numeric, total numeric)
language plpgsql security definer set search_path = public as $$
declare
  v_customer_id uuid;
  v_order_id uuid;
  v_order_number text;
  v_tracking_token uuid;
  v_subtotal numeric := 0;
  v_shipping numeric := 0;
  v_discount numeric := 0;
  v_total numeric := 0;
  v_coupon public.coupons%rowtype;
  v_flat_rate numeric := 10;
  v_free_threshold numeric := 50;
  v_item record;
  v_requested_count integer;
  v_found_count integer := 0;
begin
  if nullif(trim(p_name), '') is null or nullif(trim(p_phone), '') is null then
    raise exception 'Customer name and phone are required' using errcode = '22023';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty' using errcode = '22023';
  end if;

  select count(*) into v_requested_count from (
    select (x.id)::uuid from jsonb_to_recordset(p_items) as x(id text, quantity numeric)
    group by (x.id)::uuid
  ) q;

  for v_item in
    with requested as (
      select (x.id)::uuid id, sum(greatest(1, floor(x.quantity)))::integer quantity
      from jsonb_to_recordset(p_items) as x(id text, quantity numeric)
      group by (x.id)::uuid
    )
    select p.id, p.name, p.slug, p.selling_price, p.cost_price,
           p.stock_quantity, r.quantity
    from requested r join public.products p on p.id = r.id
    where p.status = 'published'
    order by p.id for update of p
  loop
    v_found_count := v_found_count + 1;
    if v_item.quantity > v_item.stock_quantity then
      raise exception 'Only % units of % are available', v_item.stock_quantity, v_item.name
        using errcode = '23514';
    end if;
    v_subtotal := v_subtotal + v_item.selling_price * v_item.quantity;
  end loop;
  if v_found_count <> v_requested_count then
    raise exception 'One or more products are unavailable' using errcode = '23503';
  end if;

  select coalesce((select shipping_flat_rate from public.settings limit 1), 10),
         coalesce((select free_shipping_threshold from public.settings limit 1), 50)
    into v_flat_rate, v_free_threshold;
  v_shipping := case when v_subtotal >= v_free_threshold then 0 else v_flat_rate end;

  if nullif(upper(trim(coalesce(p_coupon_code, ''))), '') is not null then
    select * into v_coupon from public.coupons
      where code = upper(trim(p_coupon_code)) for update;
    if not found then raise exception 'Coupon code was not found' using errcode = 'P0002'; end if;
    if not v_coupon.active then raise exception 'Coupon is not active' using errcode = '23514'; end if;
    if v_coupon.starts_at is not null and v_coupon.starts_at > now() then raise exception 'Coupon is not live yet' using errcode = '23514'; end if;
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then raise exception 'Coupon has expired' using errcode = '23514'; end if;
    if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then raise exception 'Coupon usage limit reached' using errcode = '23514'; end if;
    if v_subtotal < coalesce(v_coupon.min_order_amount, 0) then raise exception 'Cart total is below coupon minimum' using errcode = '23514'; end if;
    v_discount := case when v_coupon.discount_type = 'percentage'
      then v_subtotal * v_coupon.discount_value / 100 else v_coupon.discount_value end;
    if coalesce(v_coupon.max_discount_amount, 0) > 0 then
      v_discount := least(v_discount, v_coupon.max_discount_amount);
    end if;
    v_discount := greatest(0, least(v_subtotal, round(v_discount, 2)));
    update public.coupons set used_count = used_count + 1 where id = v_coupon.id;
  end if;

  select id into v_customer_id from public.customers where phone = trim(p_phone) limit 1 for update;
  if v_customer_id is null then
    insert into public.customers(name, phone, email, address, city)
      values(trim(p_name), trim(p_phone), nullif(trim(p_email), ''), trim(p_address), trim(p_city))
      returning id into v_customer_id;
  else
    update public.customers set name = trim(p_name), email = coalesce(nullif(trim(p_email), ''), email),
      address = trim(p_address), city = trim(p_city) where id = v_customer_id;
  end if;

  v_order_number := 'TV-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12));
  v_tracking_token := gen_random_uuid();
  v_total := greatest(0, v_subtotal + v_shipping - v_discount);
  insert into public.orders(customer_id, order_number, tracking_token, status, payment_method,
    payment_status, shipping_cost, ad_cost, discount_amount, coupon_code, revenue, total, notes)
  values(v_customer_id, v_order_number, v_tracking_token, 'pending',
    case when lower(p_payment_method) = 'stripe' then 'stripe' else 'cod' end,
    case when lower(p_payment_method) = 'stripe' then 'unpaid' else 'cod' end,
    v_shipping, greatest(0, coalesce(p_ad_cost, 0)), v_discount,
    nullif(upper(trim(coalesce(p_coupon_code, ''))), ''), v_subtotal - v_discount, v_total, p_notes)
  returning id into v_order_id;

  for v_item in
    with requested as (
      select (x.id)::uuid id, sum(greatest(1, floor(x.quantity)))::integer quantity
      from jsonb_to_recordset(p_items) as x(id text, quantity numeric)
      group by (x.id)::uuid
    )
    select p.id, p.name, p.selling_price, p.cost_price, r.quantity
    from requested r join public.products p on p.id = r.id order by p.id
  loop
    insert into public.order_items(order_id, product_id, product_name, quantity, unit_price, product_cost)
      values(v_order_id, v_item.id, v_item.name, v_item.quantity, v_item.selling_price, v_item.cost_price);
    update public.products set stock_quantity = stock_quantity - v_item.quantity where id = v_item.id;
  end loop;

  return query select v_order_id, v_order_number, v_tracking_token, v_subtotal,
    v_shipping, v_discount, v_total;
end;
$$;

-- Definer functions are service-only. Public storefront writes use table RLS.
revoke all on function public.create_store_order(text,text,text,text,text,text,text,text,jsonb,numeric) from public, anon, authenticated;
grant execute on function public.create_store_order(text,text,text,text,text,text,text,text,jsonb,numeric) to service_role;

create or replace function public.discard_unpaid_store_order(p_order_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare v_order public.orders%rowtype; v_item record;
begin
  select * into v_order from public.orders where id = p_order_id for update;
  if not found then return; end if;
  if v_order.payment_status not in ('unpaid', 'pending') then
    raise exception 'Paid orders cannot be discarded' using errcode = '23514';
  end if;
  for v_item in select product_id, quantity from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products set stock_quantity = stock_quantity + v_item.quantity
      where id = v_item.product_id;
  end loop;
  if v_order.coupon_code is not null then
    update public.coupons set used_count = greatest(0, used_count - 1)
      where code = v_order.coupon_code;
  end if;
  delete from public.orders where id = p_order_id;
end;
$$;
revoke all on function public.discard_unpaid_store_order(uuid) from public, anon, authenticated;
grant execute on function public.discard_unpaid_store_order(uuid) to service_role;
revoke all on function public.update_order_status_with_inventory(uuid,text,text,numeric,text) from public, anon, authenticated;
grant execute on function public.update_order_status_with_inventory(uuid,text,text,numeric,text) to service_role;
revoke all on function public.refresh_customer_metrics(uuid) from public, anon, authenticated;
revoke all on function public.refresh_product_review_summary(uuid) from public, anon, authenticated;
