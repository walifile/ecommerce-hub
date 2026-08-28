-- Align older projects whose migration history predates columns that the
-- current order-status and storefront-banner functions already expect.

alter table public.orders
  add column if not exists reversal_reason text,
  add column if not exists refund_amount numeric(12, 2),
  add column if not exists reversal_note text,
  add column if not exists reversed_at timestamptz;

alter table public.settings
  add column if not exists announcement_enabled boolean not null default false,
  add column if not exists announcement_message text,
  add column if not exists announcement_link_text text,
  add column if not exists announcement_link_href text;

notify pgrst, 'reload schema';
