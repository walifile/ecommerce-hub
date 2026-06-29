import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Check,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { ProductGallery } from "@/app/products/[slug]/_components/product-gallery";
import { ProductPurchase } from "@/app/products/[slug]/_components/product-purchase";
import { ProductCard } from "@/components/ecommerce/product-card";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getProductBySlug, getRelatedProducts } from "@/lib/ecommerce-data";

const TRUST = [
  { icon: Truck, title: "Fast delivery", text: "Ships in 24–48 hours" },
  { icon: ShieldCheck, title: "Secure checkout", text: "Encrypted payments" },
  { icon: RefreshCw, title: "Easy returns", text: "7-day return window" },
];

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const [product, relatedProducts] = await Promise.all([
    getProductBySlug(slug),
    getRelatedProducts(slug),
  ]);

  if (!product) {
    notFound();
  }

  const gallery = product.gallery.length ? product.gallery : [product.image];
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = !isOutOfStock && product.stockQuantity <= product.lowStockLimit;
  const tagline = product.shortDescription || product.description;

  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface">
        <section className="section-shell py-8 sm:py-10">
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/40"
          >
            <Link href="/" className="transition-colors hover:text-white/70">
              Home
            </Link>
            <ChevronRight className="size-3.5" />
            <Link href="/shop" className="transition-colors hover:text-white/70">
              Shop
            </Link>
            <ChevronRight className="size-3.5" />
            <span className="truncate text-white/70">{product.name}</span>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <ProductGallery images={gallery} name={product.name} />

            <div className="space-y-5">
              <div className="space-y-5 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-7">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/75">
                    {product.category}
                  </Badge>
                  {isOutOfStock ? (
                    <Badge className="rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1 text-[11px] font-semibold text-red-400">
                      Out of stock
                    </Badge>
                  ) : isLowStock ? (
                    <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-[11px] font-semibold text-amber-400">
                      Only {product.stockQuantity} left
                    </Badge>
                  ) : (
                    <Badge className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400">
                      In stock
                    </Badge>
                  )}
                  {product.isNew ? (
                    <Badge className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand">
                      New drop
                    </Badge>
                  ) : product.bestSeller ? (
                    <Badge className="rounded-full border border-brand/25 bg-brand/10 px-3 py-1 text-[11px] font-semibold text-brand">
                      Top seller
                    </Badge>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={
                            i < Math.round(product.rating)
                              ? "size-4 fill-[#fbbf24] text-[#fbbf24]"
                              : "size-4 text-white/20"
                          }
                        />
                      ))}
                    </div>
                    <span className="text-white/60">
                      {product.rating.toFixed(1)} · {product.reviewsCount} reviews
                    </span>
                  </div>
                  <p className="max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                    {tagline}
                  </p>
                </div>

                <div className="h-px bg-white/[0.08]" />

                <ProductPurchase
                  item={{
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    costPrice: product.costPrice,
                    image: product.image,
                    category: product.category,
                  }}
                  price={product.price}
                  comparePrice={product.comparePrice}
                  stock={product.stockQuantity}
                  isOutOfStock={isOutOfStock}
                />
              </div>

              {/* Trust row */}
              <div className="grid gap-3 sm:grid-cols-3">
                {TRUST.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-4"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-white">{item.title}</p>
                        <p className="truncate text-xs text-white/45">{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Tabbed details */}
        <section className="section-shell pb-4">
          <Tabs defaultValue="description" className="gap-6">
            <TabsList className="h-auto flex-wrap gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
              <TabsTrigger
                value="description"
                className="rounded-full px-5 py-2 text-sm text-white/60 data-active:bg-white/8 data-active:text-white"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-full px-5 py-2 text-sm text-white/60 data-active:bg-white/8 data-active:text-white"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-full px-5 py-2 text-sm text-white/60 data-active:bg-white/8 data-active:text-white"
              >
                Shipping &amp; returns
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description">
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
                <p className="max-w-3xl text-sm leading-7 text-white/60 sm:text-base">
                  {product.description}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="specifications">
              <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 sm:p-7">
                {product.specifications.length ? (
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {product.specifications.map((spec) => (
                      <li
                        key={spec}
                        className="flex items-start gap-2 rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white/60"
                      >
                        <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                        <span>{spec}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-white/45">No specifications listed.</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shipping">
              <div className="grid gap-3 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 text-sm text-white/60 sm:p-7">
                {[
                  "Dispatched within 24–48 hours of order confirmation.",
                  "Free delivery on orders over the store threshold.",
                  "7-day hassle-free returns on unused items in original packaging.",
                  "Secure, encrypted checkout with Cash on Delivery available.",
                ].map((line) => (
                  <div key={line} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-brand" />
                    <span>{line}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {relatedProducts.length ? (
          <section className="section-shell pb-14 pt-8">
            <div className="mb-6 max-w-3xl space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/80">
                Related products
              </p>
              <h2 className="text-3xl font-black tracking-tight text-white">
                More products in the same lane.
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </StoreShell>
  );
}
