import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Star, Truck } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getProductBySlug, getRelatedProducts, formatCurrency } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

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

  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface">
        <section className="section-shell py-10 sm:py-12">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="aspect-[4/3] overflow-hidden rounded-[22px] bg-surface-2">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {gallery.slice(0, 3).map((image) => (
                  <div
                    key={image}
                    className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2"
                  >
                    <div className="aspect-[4/3] overflow-hidden rounded-xl bg-surface-2">
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-4 rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/75">
                    {product.category}
                  </Badge>
                  <StatusBadge status={product.status} />
                </div>

                <div className="space-y-3">
                  <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                    {product.name}
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                    {product.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/70">
                    <Star className="size-4 fill-[#fbbf24] text-[#fbbf24]" />
                    {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-sm text-white/60">
                    <Truck className="size-4" />
                    Ships in 24-48 hours
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "SKU", value: product.sku },
                    {
                      label: "Stock",
                      value:
                        product.stockQuantity > product.lowStockLimit
                          ? `${product.stockQuantity} available`
                          : `${product.stockQuantity} left`,
                    },
                    {
                      label: "Status",
                      value: product.isNew ? "New drop" : product.bestSeller ? "Top seller" : "Live now",
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl border border-white/[0.08] bg-black/20 p-4"
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-white">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-black tracking-tight text-white">
                      {formatCurrency(product.price)}
                    </span>
                    {product.comparePrice ? (
                      <span className="text-base text-white/35 line-through">
                        {formatCurrency(product.comparePrice)}
                      </span>
                    ) : null}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Button className="h-12 rounded-full bg-linear-to-r from-brand to-brand-strong text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]">
                      Add to cart
                    </Button>
                    <Link
                      href="/checkout"
                      className={cn(
                        buttonVariants({ variant: "outline" }),
                        "h-12 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                      )}
                    >
                      Buy now
                      <ArrowRight className="size-4" />
                    </Link>
                  </div>

                  <div className="grid gap-2 rounded-2xl border border-white/[0.08] bg-black/20 p-4 text-sm text-white/60">
                    {[
                      "Premium product imagery",
                      "Mobile-first checkout ready",
                      "Made for quick add-to-cart decisions",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        <Check className="size-4 text-brand" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
                <CardContent className="space-y-4 p-6">
                  <h2 className="text-lg font-semibold text-white">Specifications</h2>
                  <ul className="grid gap-2">
                    {product.specifications.map((spec) => (
                      <li
                        key={spec}
                        className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-sm text-white/60"
                      >
                        {spec}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="section-shell pb-14">
          <div className="mb-6 max-w-3xl space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand/80">
              Related products
            </p>
            <h2 className="text-3xl font-black tracking-tight text-white">
              More products in the same lane.
            </h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
