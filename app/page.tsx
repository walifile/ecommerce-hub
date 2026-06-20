import Link from "next/link";
import { ArrowRight, Bot, ChartSpline, Package, ShoppingCart, Users } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCatalogData, getDashboardData, formatCurrency } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const [catalog, dashboard] = await Promise.all([
    getCatalogData(),
    getDashboardData(),
  ]);

  const featuredProducts = catalog.products.filter((product) => product.featured).slice(0, 4);
  const newArrivals = catalog.products.filter((product) => product.isNew).slice(0, 3);
  const bestSellers = catalog.products.filter((product) => product.bestSeller).slice(0, 3);

  return (
    <StoreShell cartCount={3}>
      <main>
        <section className="border-b border-border/70 bg-muted/30">
          <div className="section-shell grid gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:py-16">
            <div className="space-y-8">
              <div className="space-y-5">
                <Badge className="rounded-full bg-emerald-600 px-3 py-1 text-white">
                  Phase 1 specification
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
                    {catalog.settings.heroTitle}
                  </h1>
                  <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                    {catalog.settings.heroSubtitle}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className={cn(buttonVariants({ size: "lg" }), "rounded-md")}
                >
                  Start shopping
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="/admin"
                  className={cn(
                    buttonVariants({ size: "lg", variant: "outline" }),
                    "rounded-md"
                  )}
                >
                  Open admin
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: "Revenue", value: formatCurrency(dashboard.metrics.totalRevenue), icon: ChartSpline },
                  { label: "Orders", value: String(dashboard.metrics.totalOrders), icon: ShoppingCart },
                  { label: "Customers", value: String(dashboard.metrics.totalCustomers), icon: Users },
                  { label: "Products", value: String(catalog.products.length), icon: Package },
                ].map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <Card key={metric.label} className="rounded-lg border-border/70 bg-background py-0">
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="text-sm text-muted-foreground">{metric.label}</p>
                          <p className="mt-1 text-2xl font-semibold text-foreground">
                            {metric.value}
                          </p>
                        </div>
                        <div className="flex size-10 items-center justify-center rounded-md bg-muted">
                          <Icon className="size-5 text-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <img
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80"
                  alt="Store owner managing products and orders"
                  className="h-full min-h-72 w-full rounded-lg object-cover"
                />
              </div>
              <Card className="rounded-lg border-border/70 py-0">
                <CardContent className="space-y-3 p-5">
                  <div className="flex items-center gap-2">
                    <Bot className="size-4 text-emerald-600" />
                    <p className="text-sm font-medium text-foreground">AI product generator</p>
                  </div>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Generate title, long description, short copy, SEO metadata,
                    and FAQ from a single product name.
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-lg border-border/70 py-0">
                <CardContent className="space-y-3 p-5">
                  <p className="text-sm font-medium text-foreground">
                    Profit tracking model
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Revenue - product cost - shipping - ad spend, calculated at
                    the order level and surfaced daily, weekly, and monthly.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="section-shell space-y-8">
            <SectionHeading
              eyebrow="Featured Products"
              title="Products already positioned for margin and repeat purchase."
              description="Phase 1 starts with a store that can sell, not a placeholder catalog. These items map directly into product, order, and profit tracking flows."
            />
            <div className="grid gap-4 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-muted/30 py-16">
          <div className="section-shell space-y-8">
            <SectionHeading
              eyebrow="Categories"
              title="Category structure built for a single-store operator."
              description="Each category is positioned as a business unit: demand shape, stock profile, and pricing behavior are visible from the start."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {catalog.categories.map((category) => (
                <Card key={category.id} className="overflow-hidden rounded-lg border-border/70 py-0">
                  <div className="aspect-[16/10] overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="space-y-3 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {category.name}
                      </h3>
                      <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                        {category.productCount} items
                      </Badge>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="section-shell grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-6">
              <SectionHeading
                eyebrow="New Arrivals"
                title="New inventory slots directly into the storefront."
                description="The product pages, stock tracking, and admin modules use the same data shape, so new inventory is operational from day one."
              />
              <div className="grid gap-4">
                {newArrivals.map((product) => (
                  <Card key={product.id} className="rounded-lg border-border/70 py-0">
                    <CardContent className="flex flex-col gap-4 p-5 sm:flex-row">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-28 w-full rounded-md object-cover sm:w-36"
                      />
                      <div className="flex flex-1 flex-col justify-between gap-3">
                        <div>
                          <p className="eyebrow">{product.category}</p>
                          <h3 className="mt-1 text-lg font-semibold text-foreground">
                            {product.name}
                          </h3>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {product.shortDescription}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-foreground">
                            {formatCurrency(product.price)}
                          </span>
                          <Link
                            href={`/products/${product.slug}`}
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "rounded-md"
                            )}
                          >
                            Open
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <SectionHeading
                eyebrow="Best Sellers"
                title="Products with the strongest current signal."
                description="These are the items most likely to drive restocks, upsells, and paid traffic confidence."
              />
              <div className="grid gap-4">
                {bestSellers.map((product, index) => (
                  <Card key={product.id} className="rounded-lg border-border/70 py-0">
                    <CardContent className="flex items-center gap-4 p-5">
                      <div className="flex size-10 items-center justify-center rounded-md bg-muted text-sm font-semibold text-foreground">
                        0{index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.reviewsCount} reviews • {formatCurrency(product.price)}
                        </p>
                      </div>
                      <Link
                        href={`/products/${product.slug}`}
                        className={cn(
                          buttonVariants({ variant: "ghost" }),
                          "rounded-md"
                        )}
                      >
                        View
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border/70 bg-muted/30 py-16">
          <div className="section-shell space-y-8">
            <SectionHeading
              eyebrow="Testimonials"
              title="Built around the operator workflow, not a generic template."
              description="Phase 1 is intentionally narrow: one store, one owner, one control surface."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              {catalog.testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="rounded-lg border-border/70 py-0">
                  <CardContent className="space-y-4 p-5">
                    <p className="text-sm leading-6 text-foreground">
                      “{testimonial.quote}”
                    </p>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.company}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="section-shell">
            <div className="grid gap-6 rounded-lg border border-border/70 bg-background p-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-3">
                <p className="eyebrow">Newsletter</p>
                <h2 className="text-3xl font-semibold text-foreground">
                  Keep store operators informed about new launches and offers.
                </h2>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  This is the same surface where email capture, promotions, and
                  product launches can plug into Supabase-backed workflows later.
                </p>
              </div>
              <div className="flex flex-col items-start justify-center gap-3 sm:flex-row lg:flex-col">
                <Link
                  href="/shop"
                  className={cn(
                    buttonVariants(),
                    "w-full rounded-md sm:w-auto lg:w-full"
                  )}
                >
                  Browse products
                </Link>
                <Link
                  href="/contact"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full rounded-md sm:w-auto lg:w-full"
                  )}
                >
                  Contact store
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
