-- Normalize customer phone identities, merge pre-existing duplicates, and
-- prevent checkout races from creating multiple profiles for one customer.

update public.customers
set phone = nullif(regexp_replace(coalesce(phone, ''), '[^0-9]+', '', 'g'), '');

-- Legacy/test rows may contain values too short or too long to be usable as a
-- customer identity. Keep the customer and their order history, but clear the
-- invalid phone before the new constraint is installed.
update public.customers
set phone = null
where phone is not null
  and length(phone) not between 7 and 15;

create temporary table customer_duplicate_map on commit drop as
with ranked as (
  select
    id,
    first_value(id) over (
      partition by phone
      order by created_at, id
    ) as canonical_id,
    row_number() over (
      partition by phone
      order by created_at, id
    ) as position
  from public.customers
  where phone is not null
)
select id as duplicate_id, canonical_id
from ranked
where position > 1;

-- Keep the newest contact details while retaining the oldest stable customer id.
update public.customers canonical
set
  name = coalesce(latest.name, canonical.name),
  email = coalesce(nullif(latest.email, ''), canonical.email),
  address = coalesce(nullif(latest.address, ''), canonical.address),
  city = coalesce(nullif(latest.city, ''), canonical.city)
from (
  select distinct on (mapping.canonical_id)
    mapping.canonical_id,
    duplicate.name,
    duplicate.email,
    duplicate.address,
    duplicate.city
  from customer_duplicate_map mapping
  join public.customers duplicate on duplicate.id = mapping.duplicate_id
  order by mapping.canonical_id, duplicate.created_at desc
) latest
where canonical.id = latest.canonical_id;

update public.orders o
set customer_id = m.canonical_id
from customer_duplicate_map m
where o.customer_id = m.duplicate_id;

delete from public.customers c
using customer_duplicate_map m
where c.id = m.duplicate_id;

create unique index if not exists customers_phone_unique
  on public.customers(phone)
  where phone is not null;

create index if not exists customers_email_lower_idx
  on public.customers(lower(email))
  where email is not null;

alter table public.customers
  add constraint customers_phone_format_check
  check (phone is null or (phone ~ '^[0-9]+$' and length(phone) between 7 and 15))
  not valid;

create or replace function public.sync_customer_coupon_identity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.phone is distinct from new.phone then
    update public.coupon_redemptions cr
    set customer_identity = new.phone
    where exists (
      select 1
      from public.orders o
      where o.id = cr.order_id
        and o.customer_id = new.id
        and o.status not in ('cancelled', 'returned')
    );
  end if;
  return new;
end;
$$;

drop trigger if exists customer_coupon_identity_changed on public.customers;
create trigger customer_coupon_identity_changed
  before update of phone on public.customers
  for each row
  when (old.phone is distinct from new.phone)
  execute function public.sync_customer_coupon_identity();

revoke all on function public.sync_customer_coupon_identity()
  from public, anon, authenticated;

do $$
declare customer_row record;
begin
  for customer_row in select id from public.customers loop
    perform public.refresh_customer_metrics(customer_row.id);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
