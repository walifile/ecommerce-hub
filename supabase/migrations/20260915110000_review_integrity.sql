-- Verified product reviews and database-level duplicate prevention.
alter table public.product_reviews
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists customer_id uuid references public.customers(id) on delete set null,
  add column if not exists verified_purchase boolean not null default false,
  add column if not exists moderation_note text;

alter table public.product_reviews
  drop constraint if exists product_reviews_reviewer_name_length,
  add constraint product_reviews_reviewer_name_length
    check (char_length(btrim(reviewer_name)) between 1 and 80) not valid,
  drop constraint if exists product_reviews_reviewer_email_length,
  add constraint product_reviews_reviewer_email_length
    check (
      reviewer_email is null or (
        char_length(reviewer_email) <= 254
        and reviewer_email = lower(btrim(reviewer_email))
        and reviewer_email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
      )
    ) not valid,
  drop constraint if exists product_reviews_title_length,
  add constraint product_reviews_title_length
    check (title is null or char_length(title) <= 120) not valid,
  drop constraint if exists product_reviews_body_length,
  add constraint product_reviews_body_length
    check (char_length(btrim(body)) between 10 and 1500) not valid,
  drop constraint if exists product_reviews_moderation_note_length,
  add constraint product_reviews_moderation_note_length
    check (moderation_note is null or char_length(moderation_note) <= 500) not valid,
  drop constraint if exists product_reviews_verified_source,
  add constraint product_reviews_verified_source
    check (not verified_purchase or (order_id is not null and customer_id is not null)) not valid;

-- A customer may review a product once. The partial index preserves legacy
-- reviews, which do not have a customer attached.
create unique index if not exists idx_product_reviews_customer_product_unique
  on public.product_reviews(customer_id, product_id)
  where customer_id is not null;

create index if not exists idx_product_reviews_order_id
  on public.product_reviews(order_id)
  where order_id is not null;

-- Keep purchase verification true even if application code changes later.
create or replace function public.validate_verified_product_review()
returns trigger language plpgsql set search_path = public as $$
begin
  if new.verified_purchase and not exists (
    select 1
    from public.orders o
    where o.id = new.order_id
      and o.customer_id = new.customer_id
      and o.status = 'delivered'
      and exists (
        select 1 from public.order_items oi
        where oi.order_id = o.id and oi.product_id = new.product_id
      )
  ) then
    raise exception 'Review does not match a delivered purchase'
      using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists product_review_verify_purchase on public.product_reviews;
create trigger product_review_verify_purchase
  before insert or update of order_id, customer_id, product_id, verified_purchase
  on public.product_reviews
  for each row execute function public.validate_verified_product_review();

revoke all on function public.validate_verified_product_review() from public, anon, authenticated;

-- Public clients must not be able to forge verified_purchase/order/customer.
-- The validated server action submits reviews with the service role.
revoke insert on public.product_reviews from anon, authenticated;
drop policy if exists "Public can submit pending reviews" on public.product_reviews;

-- Approved reviews are public, but purchase linkage, private email, and the
-- internal moderation note must never be exposed through the REST API.
revoke select on public.product_reviews from anon, authenticated;
grant select (
  id,
  product_id,
  reviewer_name,
  rating,
  title,
  body,
  status,
  verified_purchase,
  created_at
) on public.product_reviews to anon, authenticated;

notify pgrst, 'reload schema';
