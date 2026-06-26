# Ecommerce OS

ToyVerse is the storefront layer for an ecommerce operating system built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Supabase.

## Phase 1

This repo currently implements the Phase 1 scope from the spec:

- Premium storefront landing page
- Shop catalog with filters and product cards
- Product detail pages
- Cart and checkout flow
- Order tracking page
- Contact page with a real form action
- About, privacy policy, and terms pages
- Admin dashboard with responsive sidebar navigation
- Light and dark admin mode support
- Storefront theme switching from the admin settings page
- Supabase-backed catalog, auth, newsletter, and support workflows

## Buy Me a Coffee

If this project helps you, support it here:

[Buy me a coffee](https://buymeacoffee.com/waliahmad9)

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui style components
- Supabase for data, auth, and storage
- Framer Motion for motion polish
- Recharts for dashboard charts

## Key Routes

- `/` - Storefront landing page
- `/shop` - Catalog
- `/products/[slug]` - Product detail
- `/cart` - Cart
- `/checkout` - Checkout
- `/track-order` - Order tracking
- `/contact` - Contact form
- `/about-us` - About page
- `/privacy-policy` - Privacy policy
- `/terms-and-conditions` - Terms
- `/admin` - Admin dashboard
- `/admin/settings` - Theme and store settings

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Use the values in `.env.example` as the baseline. The app expects Supabase keys for live data and auth flows.

## Phase 1 Notes

The current codebase is structured to keep public storefront pages, admin surfaces, and shared ecommerce data in one app. The next Phase 1 work should continue inside the existing routes and shared components rather than introducing a second shell.
