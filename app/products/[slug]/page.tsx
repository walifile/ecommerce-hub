import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BadgeCheck,
  Box,
  Check,
  ChevronRight,
  CircleDot,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { ProductGallery } from "@/app/products/[slug]/_components/product-gallery";
import { ProductPurchase } from "@/app/products/[slug]/_components/product-purchase";
import { ProductReviews } from "@/app/products/[slug]/_components/product-reviews";
import { ProductCard } from "@/components/ecommerce/product-card";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { getProductBySlug, getProductReviews, getRelatedProducts } from "@/lib/ecommerce-data";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  const title = product.metaTitle || product.name;
  const description = product.metaDescription || product.shortDescription || product.description;
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${SITE_URL}/products/${product.slug}`,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(slug),
    getRelatedProducts(slug),
  ]);
  if (!product) notFound();

  const reviews = await getProductReviews(product.id);
  const gallery = Array.from(new Set([product.image, ...product.gallery].filter(Boolean)));
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockLimit;
  const discount = product.comparePrice && product.comparePrice > product.price
    ? Math.round((1 - product.price / product.comparePrice) * 100)
    : 0;
  const productUrl = `${SITE_URL}/products/${product.slug}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${productUrl}#product`,
        name: product.name,
        description: product.shortDescription || product.description || product.name,
        image: gallery,
        sku: product.sku,
        category: product.category || undefined,
        url: productUrl,
        brand: { "@type": "Brand", name: "ToyVerse" },
        offers: {
          "@type": "Offer",
          url: productUrl,
          priceCurrency: process.env.STRIPE_CURRENCY?.toUpperCase() || "USD",
          price: product.price,
          availability: isOutOfStock ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
          itemCondition: "https://schema.org/NewCondition",
        },
        ...(product.reviewsCount > 0 ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating, reviewCount: product.reviewsCount },
        } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${SITE_URL}/shop` },
          { "@type": "ListItem", position: 3, name: product.name, item: productUrl },
        ],
      },
    ],
  };

  return (
    <StoreShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main className="relative overflow-hidden bg-surface text-white">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[760px] bg-[radial-gradient(circle_at_15%_10%,color-mix(in_srgb,var(--brand)_18%,transparent),transparent_31%),radial-gradient(circle_at_85%_16%,color-mix(in_srgb,var(--brand-2)_14%,transparent),transparent_27%)]" />

        <section className="section-shell relative pb-16 pt-6 sm:pt-8 lg:pb-24">
          <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-1.5 overflow-hidden text-xs font-medium text-white/40 sm:text-sm">
            <Link href="/" className="shrink-0 hover:text-white">Home</Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <Link href="/shop" className="shrink-0 hover:text-white">Shop</Link>
            <ChevronRight className="size-3.5 shrink-0" />
            <span className="truncate text-white/70">{product.name}</span>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.12fr)_minmax(390px,0.88fr)] lg:items-start xl:gap-16">
            <ProductGallery
              images={gallery}
              name={product.name}
              discount={discount}
              label={product.bestSeller ? "Best seller" : product.isNew ? "New arrival" : undefined}
            />

            <div className="lg:sticky lg:top-24">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]">
                <Link href={`/shop?category=${encodeURIComponent(product.category)}`} className="text-brand hover:text-brand-light">
                  {product.category}
                </Link>
                <span className="size-1 rounded-full bg-white/20" />
                <span className="text-white/35">SKU {product.sku || "N/A"}</span>
              </div>

              <h1 className="mt-4 text-balance font-heading text-4xl font-black leading-[1.02] tracking-[-0.045em] text-white sm:text-5xl xl:text-6xl">
                {product.name}
              </h1>

              <a href="#reviews" className="mt-5 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] py-1.5 pl-2 pr-4 hover:border-white/20 hover:bg-white/[0.07]">
                <span className="flex items-center gap-0.5 rounded-full bg-amber-400/10 px-2 py-1">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-bold text-amber-300">{product.rating.toFixed(1)}</span>
                </span>
                <span className="text-xs font-medium text-white/55">{product.reviewsCount ? `${product.reviewsCount} verified reviews` : "Be the first to review"}</span>
              </a>

              <p className="mt-6 text-base leading-7 text-white/58 sm:text-lg sm:leading-8">
                {product.shortDescription || product.description}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${isOutOfStock ? "border-red-400/20 bg-red-400/10 text-red-300" : isLowStock ? "border-amber-400/20 bg-amber-400/10 text-amber-200" : "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"}`}>
                  <CircleDot className="size-3.5" />
                  {isOutOfStock ? "Currently unavailable" : isLowStock ? `Hurry, only ${product.stockQuantity} left` : "Ready to ship"}
                </span>
                {product.featured ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/45"><Sparkles className="size-3.5 text-brand" />Featured pick</span> : null}
              </div>

              <div className="mt-7 rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.32)] backdrop-blur-xl sm:p-6">
                <ProductPurchase
                  item={{ id: product.id, name: product.name, slug: product.slug, price: product.price, costPrice: product.costPrice, image: product.image, category: product.category }}
                  price={product.price}
                  comparePrice={product.comparePrice}
                  stock={product.stockQuantity}
                  lowStockLimit={product.lowStockLimit}
                  isOutOfStock={isOutOfStock}
                  isLowStock={isLowStock}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 divide-x divide-white/8 rounded-2xl border border-white/8 bg-black/15 py-4">
                {[
                  { icon: PackageCheck, label: "Stock checked" },
                  { icon: ShieldCheck, label: "Secure checkout" },
                  { icon: Truck, label: "Order tracking" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex flex-col items-center gap-2 px-2 text-center">
                    <Icon className="size-4 text-brand" />
                    <span className="text-[10px] font-semibold text-white/50 sm:text-xs">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-y border-white/7 bg-white/[0.025]">
          <div className="section-shell grid gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">Inside the box</p>
              <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">Made for moments that feel anything but ordinary.</h2>
              <div className="mt-6 max-w-2xl whitespace-pre-line text-base leading-8 text-white/58">
                {product.description || product.shortDescription}
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[{ icon: BadgeCheck, text: "Carefully selected for quality" }, { icon: RefreshCw, text: "Straightforward return support" }, { icon: ShieldCheck, text: "Protected checkout process" }, { icon: Box, text: "Packed with care" }].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3 text-sm text-white/65">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand"><Icon className="size-4" /></span>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/9 bg-black/20 p-5 sm:p-7">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Product details</p><h2 className="mt-2 text-2xl font-bold">Good to know</h2></div>
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand"><Sparkles className="size-5" /></span>
              </div>
              {product.specifications.length ? (
                <ul className="mt-6 space-y-2.5">
                  {product.specifications.map((spec) => (
                    <li key={spec} className="flex items-start gap-3 rounded-2xl border border-white/7 bg-white/[0.025] px-4 py-3.5 text-sm leading-6 text-white/65">
                      <Check className="mt-1 size-4 shrink-0 text-emerald-400" /><span>{spec}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="mt-6 text-sm text-white/40">Detailed specifications will be added soon.</p>}
            </div>
          </div>
        </section>

        <section className="section-shell py-14">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: Truck, title: "Tracked delivery", text: "Follow your order status from confirmation through delivery." },
              { icon: ShieldCheck, title: "Checkout confidence", text: "Your order details are validated and processed securely." },
              { icon: RefreshCw, title: "Return support", text: "Need help after delivery? Our support flow keeps things simple." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded-[26px] border border-white/8 bg-white/[0.025] p-5 transition hover:-translate-y-1 hover:border-brand/25 hover:bg-brand/[0.04]">
                <span className="flex size-11 items-center justify-center rounded-2xl border border-brand/15 bg-brand/10 text-brand"><Icon className="size-5" /></span>
                <h3 className="mt-5 text-base font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <ProductReviews productId={product.id} productSlug={product.slug} reviews={reviews} />

        {relatedProducts.length ? (
          <section className="section-shell pb-20 pt-10">
            <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div><p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">Keep exploring</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">You may also like</h2></div>
              <Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-white/55 hover:text-white">View all products <ChevronRight className="size-4" /></Link>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{relatedProducts.map((item) => <ProductCard key={item.id} product={item} />)}</div>
          </section>
        ) : null}
      </main>
    </StoreShell>
  );
}
