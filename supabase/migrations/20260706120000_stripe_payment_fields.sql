alter table public.orders add column if not exists payment_status text not null default 'unpaid';
alter table public.orders add column if not exists stripe_session_id text;
alter table public.orders add column if not exists stripe_payment_intent_id text;
alter table public.orders add column if not exists paid_at timestamptz;

create index if not exists idx_orders_stripe_session_id on public.orders(stripe_session_id);
create index if not exists idx_orders_payment_status on public.orders(payment_status);
