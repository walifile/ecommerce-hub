<div align="center">

# 🧸 ToyVerse — Ecommerce OS

**A complete, single-store ecommerce operating system** — storefront, admin dashboard, profit tracking, AI content generation, and WhatsApp automation in one Next.js app.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres_%2B_Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com)

[![Phase 1](https://img.shields.io/badge/Phase_1-Complete-brightgreen?style=flat-square)](./Ecommerce%20OS%20-%20Phase%201%20Specification.docx)
[![License](https://img.shields.io/badge/status-active_development-blue?style=flat-square)]()

</div>

---

## ☕ Support this project

If ToyVerse saves you time, consider buying a coffee:

<a href="https://buymeacoffee.com/waliahmad9"><img src="https://img.shields.io/badge/Buy_me_a_coffee-FFDD00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy me a coffee" /></a>

---

## 📌 What is this?

ToyVerse is the reference storefront for a **Phase 1 Ecommerce OS**: one Postgres database, one Next.js app, and everything a solo store owner or small dropshipping business needs to run real orders — catalog, cart, checkout, order tracking, profit accounting, expense tracking, customer WhatsApp notifications, and AI-generated product copy — with an admin dashboard to run it all from.

Built against the [`Ecommerce OS — Phase 1 Specification`](./Ecommerce%20OS%20-%20Phase%201%20Specification.docx), and matches it closely — in a few places it goes further than the spec asked for (avg order value, expense tracking, order-level profit breakdowns, coupon campaigns).

---

## ✅ Phase 1 feature checklist

### 🛍️ Storefront
| Feature | Status |
|---|---|
| Home page — hero, featured, new arrivals, categories, best sellers, testimonials, newsletter | 🟢 Done |
| Shop — product grid, search, category filter, price filter, sorting | 🟢 Done |
| Product page — gallery (with zoom lightbox), price, discount, description, specs, stock, reviews, related products | 🟢 Done |
| Cart — quantity update, remove item, coupon codes, live shipping estimate | 🟢 Done |
| Checkout — guest checkout (name/phone/email/address/city), Cash on Delivery + Stripe, full order summary | 🟢 Done |
| Order tracking — order number + phone lookup, live status timeline | 🟢 Done |
| Contact page | 🟢 Done |
| SEO — sitemap, per-page metadata, Product/Breadcrumb structured data, canonical tags | 🟢 Done |

### 🛠️ Admin dashboard
| Feature | Status |
|---|---|
| Overview — revenue, profit, orders, customers, avg order value, expenses, trend chart | 🟢 Done |
| Product management — pricing, inventory, media, SEO fields, draft/published | 🟢 Done |
| AI product generator — title, descriptions, SEO meta, FAQ | 🟢 Done |
| Order management — status pipeline, per-order profit, invoice printing | 🟢 Done |
| Customer management — profile, order history, lifetime value | 🟢 Done |
| Profit tracking — daily / weekly / monthly net profit, top products | 🟢 Done |
| Expense tracking — advertising, shipping, salary, miscellaneous | 🟢 Done |
| WhatsApp automation — order lifecycle messages, editable templates, delivery log | 🟢 Done |
| Coupons — discount campaigns with usage limits and validity windows | 🟢 Done |

### ⚙️ Infrastructure
| Item | Status |
|---|---|
| Atomic checkout (pricing, stock, coupons in one DB transaction) | 🟢 Done |
| Row-level security — public catalog readable, everything else locked | 🟢 Done |
| Stripe webhook (signature-verified) | 🟢 Done |
| Caching layer (Redis, per spec) | 🔴 Not started — every page re-fetches the full catalog live |
| Automated tests | 🔴 None yet |
| Error monitoring / analytics | 🔴 None yet |

---

## 🧱 Tech stack

| Layer | Spec called for | Actually built |
|---|---|---|
| Frontend | Next.js | ✅ Next.js 16 (App Router) + TypeScript |
| Backend | Laravel API | ↪️ Next.js Server Actions & Route Handlers (no separate service) |
| Database | PostgreSQL | ✅ PostgreSQL via Supabase |
| Cache | Redis | 🔴 Not implemented |
| Storage | S3-compatible | ✅ Supabase Storage (S3-compatible) |
| AI | OpenAI Responses API with Structured Outputs |
| Auth | JWT | ✅ Supabase Auth (JWT-based) |
| Styling | — | Tailwind CSS v4 + shadcn/ui |
| Payments | — | Stripe Checkout |
| Charts | — | Recharts |
| Motion | — | Framer Motion |

---

## 🗺️ Key routes

**Storefront**
```
/                     Landing page
/shop                 Catalog — search, filter, sort
/products/[slug]      Product detail
/cart                 Cart
/checkout             Checkout
/track-order          Order tracking
/contact              Contact form
/about-us  /privacy-policy  /terms-and-conditions
```

**Admin** (`/admin/**`, auth-gated)
```
/admin                Dashboard overview
/admin/products        /admin/categories
/admin/orders           /admin/customers
/admin/coupons           /admin/expenses
/admin/profit             /admin/whatsapp
/admin/reviews             /admin/ai
/admin/settings
```

---

## 🚀 Getting started

```bash
npm install
npx supabase db push
npm run dev
```

Open **http://localhost:3000**.

---

## 🔑 Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public Supabase client |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only — privileged reads/writes, bypasses RLS |
| `NEXT_PUBLIC_APP_URL` | Base URL used in emails, OG tags, Stripe redirects |
| `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CURRENCY` | Card checkout — webhook endpoint is `/api/stripe/webhook` |
| `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_API_VERSION`, `WHATSAPP_DEFAULT_COUNTRY_CODE` | WhatsApp Cloud API connection |
| `WHATSAPP_APP_SECRET`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN` | Signed delivery webhook at `/api/whatsapp/webhook` |
| `WHATSAPP_TEMPLATE_*`, `WHATSAPP_TEMPLATE_LANGUAGE` | Approved Meta template names and locale |
| `OPENAI_API_KEY`, `OPENAI_MODEL` | Admin AI Product Generator; optional unless used |

Each approved WhatsApp template body must accept three positional text parameters
in this order: customer name, order number, and total. Configure Meta's callback
URL as `/api/whatsapp/webhook` and use the same webhook verification token.

Never expose `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, or `OPENAI_API_KEY` with a `NEXT_PUBLIC_` prefix.

---

## 🗄️ Database

Single PostgreSQL database (via Supabase), RLS-locked by default — the storefront catalog is publicly readable, everything else (`orders`, `customers`, `expenses`, `coupons`, `settings`, …) requires the service-role key.

```
profiles · categories · products · product_images · product_reviews
customers · orders · order_items · order_events
expenses · coupons · settings
ai_generations · whatsapp_logs
```

Run every migration in `supabase/migrations/` before deploying — the checkout flow, inventory reservation, and review moderation all depend on the later ones.

---

<div align="center">

Built for solo store owners and small ecommerce businesses — not a marketplace, not multi-vendor, not multi-store. One store, run well. 🏪

</div>
