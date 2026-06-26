-- ───────────────────────────────────────────────────────────────
-- RLS hardening
--
-- The anon key is PUBLIC (shipped to the browser), so every table it
-- can reach is world-readable/writable via the Supabase REST API unless
-- RLS is enabled. This migration:
--   • makes the storefront CATALOG publicly readable (products, etc.)
--   • LOCKS everything else (customers, orders, expenses, settings, …)
--
-- Server-side privileged access (admin dashboard, theme save, catalog
-- writes) must use the SERVICE-ROLE key, which bypasses RLS. Set
-- SUPABASE_SERVICE_ROLE_KEY in the server environment (never NEXT_PUBLIC).
-- ───────────────────────────────────────────────────────────────

-- ── Public catalog: anyone may READ ──────────────────────────────
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

drop policy if exists "Public can read categories" on public.categories;
create policy "Public can read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

-- Only expose published products to the public; drafts stay hidden.
drop policy if exists "Public can read published products" on public.products;
create policy "Public can read published products"
  on public.products for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "Public can read product images" on public.product_images;
create policy "Public can read product images"
  on public.product_images for select
  to anon, authenticated
  using (true);

-- ── Locked tables: RLS on, NO anon/authenticated policies ────────
-- (default-deny; only the service-role key can touch these)
alter table public.users           enable row level security;
alter table public.customers       enable row level security;
alter table public.orders          enable row level security;
alter table public.order_items     enable row level security;
alter table public.expenses        enable row level security;
alter table public.coupons         enable row level security;
alter table public.settings        enable row level security;
alter table public.ai_generations  enable row level security;
alter table public.whatsapp_logs   enable row level security;
