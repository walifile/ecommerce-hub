-- Coupon invariants and one active redemption per customer identity.
-- Checkout identifies a guest customer by a normalized phone number.

alter table public.coupons
  add constraint coupons_discount_type_check
    check (discount_type in ('fixed', 'percentage')) not valid,
  add constraint coupons_discount_value_check
    check (discount_value > 0 and (discount_type <> 'percentage' or discount_value <= 100)) not valid,
  add constraint coupons_minimum_check
    check (min_order_amount >= 0) not valid,
  add constraint coupons_max_discount_check
    check (max_discount_amount is null or max_discount_amount > 0) not valid,
  add constraint coupons_usage_limit_check
    check (usage_limit is null or usage_limit > 0) not valid,
  add constraint coupons_used_count_check
    check (used_count >= 0) not valid,
  add constraint coupons_schedule_check
    check (starts_at is null or expires_at is null or expires_at > starts_at) not valid;

create table if not exists public.coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.coupons(id) on delete restrict,
  customer_identity text not null,
  order_id uuid not null unique,
  created_at timestamptz not null default now(),
  constraint coupon_redemptions_identity_check check (length(customer_identity) between 7 and 32),
  constraint coupon_redemptions_customer_once unique (coupon_id, customer_identity)
);

create index if not exists idx_coupon_redemptions_coupon_id
  on public.coupon_redemptions(coupon_id);

alter table public.coupon_redemptions enable row level security;
revoke all on table public.coupon_redemptions from public, anon, authenticated;

create or replace function public.normalized_coupon_identity(p_phone text)
returns text
language sql
immutable
strict
set search_path = public
as $$
  select regexp_replace(trim(p_phone), '[^0-9]+', '', 'g');
$$;

revoke all on function public.normalized_coupon_identity(text) from public, anon, authenticated;
grant execute on function public.normalized_coupon_identity(text) to service_role;

create or replace function public.reserve_coupon_redemption_for_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon_id uuid;
  v_phone text;
  v_identity text;
begin
  if new.coupon_code is null or new.status in ('cancelled', 'returned') then
    return new;
  end if;

  select c.id into v_coupon_id
  from public.coupons c
  where c.code = upper(trim(new.coupon_code));
  if v_coupon_id is null then
    raise exception 'Coupon code was not found' using errcode = 'P0002';
  end if;

  select c.phone into v_phone from public.customers c where c.id = new.customer_id;
  v_identity := public.normalized_coupon_identity(coalesce(v_phone, ''));
  if length(v_identity) < 7 then
    raise exception 'A valid phone number is required to use a coupon' using errcode = '22023';
  end if;

  begin
    insert into public.coupon_redemptions(coupon_id, customer_identity, order_id)
    values(v_coupon_id, v_identity, new.id);
  exception when unique_violation then
    raise exception 'This coupon has already been used by this customer'
      using errcode = '23505';
  end;
  return new;
end;
$$;

drop trigger if exists order_coupon_redemption_reserved on public.orders;
create trigger order_coupon_redemption_reserved
  before insert on public.orders
  for each row
  when (new.coupon_code is not null)
  execute function public.reserve_coupon_redemption_for_order();

revoke all on function public.reserve_coupon_redemption_for_order()
  from public, anon, authenticated;

create or replace function public.sync_coupon_redemption_for_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_coupon_id uuid;
  v_phone text;
  v_identity text;
begin
  if old.status not in ('cancelled', 'returned')
     and new.status in ('cancelled', 'returned') then
    delete from public.coupon_redemptions where order_id = new.id;
  elsif old.status in ('cancelled', 'returned')
     and new.status not in ('cancelled', 'returned')
     and new.coupon_code is not null then
    select c.id into v_coupon_id from public.coupons c where c.code = new.coupon_code;
    select c.phone into v_phone from public.customers c where c.id = new.customer_id;
    v_identity := public.normalized_coupon_identity(coalesce(v_phone, ''));
    if length(v_identity) < 7 then
      raise exception 'A valid phone number is required to restore this coupon'
        using errcode = '22023';
    end if;
    begin
      insert into public.coupon_redemptions(coupon_id, customer_identity, order_id)
      values(v_coupon_id, v_identity, new.id);
    exception when unique_violation then
      raise exception 'This coupon has already been used by this customer'
        using errcode = '23505';
    end;
  end if;
  return new;
end;
$$;

drop trigger if exists order_coupon_redemption_status_changed on public.orders;
create trigger order_coupon_redemption_status_changed
  after update of status on public.orders
  for each row
  when (old.status is distinct from new.status and new.coupon_code is not null)
  execute function public.sync_coupon_redemption_for_order_status();

revoke all on function public.sync_coupon_redemption_for_order_status()
  from public, anon, authenticated;

create or replace function public.release_coupon_redemption_for_deleted_order()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.coupon_redemptions where order_id = old.id;
  return old;
end;
$$;

drop trigger if exists order_coupon_redemption_deleted on public.orders;
create trigger order_coupon_redemption_deleted
  after delete on public.orders
  for each row
  when (old.coupon_code is not null)
  execute function public.release_coupon_redemption_for_deleted_order();

revoke all on function public.release_coupon_redemption_for_deleted_order()
  from public, anon, authenticated;

-- Preserve active historical redemptions. DISTINCT ON safely handles any
-- duplicate pre-migration orders while preventing all future re-use.
insert into public.coupon_redemptions(coupon_id, customer_identity, order_id, created_at)
select distinct on (cp.id, public.normalized_coupon_identity(c.phone))
  cp.id,
  public.normalized_coupon_identity(c.phone),
  o.id,
  o.created_at
from public.orders o
join public.coupons cp on cp.code = o.coupon_code
join public.customers c on c.id = o.customer_id
where o.coupon_code is not null
  and o.status not in ('cancelled', 'returned')
  and length(public.normalized_coupon_identity(coalesce(c.phone, ''))) >= 7
order by cp.id, public.normalized_coupon_identity(c.phone), o.created_at
on conflict do nothing;

notify pgrst, 'reload schema';
