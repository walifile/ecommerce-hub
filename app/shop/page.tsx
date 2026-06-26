import Link from "next/link";
import { ArrowRight, Filter, Search, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { getCatalogData, listProducts } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

const quickFilters = [
  { label: "All drops", value: "all" },
  { label: "New arrivals", value: "new" },
  { label: "Best sellers", value: "best" },
  { label: "Under $50", value: "budget" },
];

export default async function ShopPage(props: PageProps<"/shop">) {
  const search = await props.searchParams;
  const category = typeof search.category === "string" ? search.category : "all";
  const query = typeof search.query === "string" ? search.query : "";
  const sort = typeof search.sort === "string" ? search.sort : "featured";
  const maxPrice =
    typeof search.maxPrice === "string" ? Number(search.maxPrice) : undefined;

  const [products, catalog] = await Promise.all([
    listProducts({ category, query, sort, maxPrice }),
    getCatalogData(),
  ]);

  const featuredCategories = catalog.categories.slice(0, 3);

  return (
    <StoreShell cartCount={3}>
      <main className="bg-[#07070f]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_60%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                    <Sparkles className="mr-1 size-3.5 text-[#f97316]" />
                    ToyVerse shop
                  </Badge>
                  <Badge className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[11px] font-semibold text-white/55">
                    {products.length} live products
                  </Badge>
                </div>

                <div className="space-y-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                    Curated catalog
                  </p>
                  <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                    A cleaner way to browse products that actually sell.
                  </h1>
                  <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                    Search by need, filter by category, and move faster through the
                    catalog with a layout that feels premium, focused, and built for
                    conversion.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link
                    href="#products"
                    className={cn(
                      buttonVariants(),
                      "h-11 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-5 text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
                    )}
                  >
                    Browse products
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/cart"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "h-11 rounded-full border-white/10 bg-white/[0.04] px-5 text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                    )}
                  >
                    Go to cart
                  </Link>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <Card className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] py-0 backdrop-blur-xl">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Store focus
                    </p>
                    <p className="mt-3 text-2xl font-black text-white">ToyVerse</p>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Playful, premium, conversion-first shopping.
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] py-0 backdrop-blur-xl">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Fast lane
                    </p>
                    <p className="mt-3 text-2xl font-black text-white">Filtered search</p>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Categories, price, and sort are one tap away.
                    </p>
                  </CardContent>
                </Card>
                <Card className="rounded-[24px] border border-white/[0.08] bg-white/[0.03] py-0 backdrop-blur-xl">
                  <CardContent className="p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
                      Featured lane
                    </p>
                    <p className="mt-3 text-2xl font-black text-white">
                      {featuredCategories.length} categories
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Highlighted lanes for quick scanning.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8">
          <div className="flex flex-wrap items-center gap-2">
            {quickFilters.map((item, index) => (
              <Badge
                key={item.label}
                className={cn(
                  "rounded-full border px-4 py-2 text-[11px] font-semibold tracking-[0.16em]",
                  index === 0
                    ? "border-white/10 bg-white/[0.08] text-white"
                    : "border-white/10 bg-white/[0.03] text-white/55"
                )}
              >
                {item.label}
              </Badge>
            ))}
          </div>
        </section>

        <section id="products" className="section-shell pb-14">
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <CardContent className="space-y-6 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        Filters
                      </p>
                      <h2 className="mt-1 text-lg font-semibold text-white">
                        Refine the shelf
                      </h2>
                    </div>
                    <Filter className="size-5 text-white/40" />
                  </div>

                  <form className="space-y-4" action="/shop">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                        <Input
                          name="query"
                          defaultValue={query}
                          placeholder="Product or category"
                          className="h-12 rounded-full border-white/10 bg-black/30 pl-11 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Category
                      </label>
                      <NativeSelect
                        name="category"
                        defaultValue={category}
                        className="h-12 w-full rounded-full border-white/10 bg-black/30 text-white"
                      >
                        <NativeSelectOption value="all">All categories</NativeSelectOption>
                        {catalog.categories.map((item) => (
                          <NativeSelectOption key={item.id} value={item.name}>
                            {item.name}
                          </NativeSelectOption>
                        ))}
                      </NativeSelect>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Max price
                      </label>
                      <Input
                        name="maxPrice"
                        defaultValue={search.maxPrice?.toString?.() ?? ""}
                        placeholder="e.g. 80"
                        className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/70">
                        Sort
                      </label>
                      <NativeSelect
                        name="sort"
                        defaultValue={sort}
                        className="h-12 w-full rounded-full border-white/10 bg-black/30 text-white"
                      >
                        <NativeSelectOption value="featured">Featured</NativeSelectOption>
                        <NativeSelectOption value="price-asc">
                          Price: Low to high
                        </NativeSelectOption>
                        <NativeSelectOption value="price-desc">
                          Price: High to low
                        </NativeSelectOption>
                        <NativeSelectOption value="rating">Rating</NativeSelectOption>
                      </NativeSelect>
                    </div>

                    <Button
                      className="h-12 w-full rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
                    >
                      Apply filters
                    </Button>
                  </form>

                  <div className="grid gap-3 rounded-[22px] border border-white/[0.07] bg-black/20 p-4">
                    {featuredCategories.map((category) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-white">
                            {category.name}
                          </p>
                          <p className="text-xs text-white/40">
                            {category.productCount} products
                          </p>
                        </div>
                        <ArrowRight className="size-4 text-white/30" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section className="space-y-4">
              <div className="flex flex-col gap-3 rounded-[24px] border border-white/[0.08] bg-white/[0.03] px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-white/45">
                    {products.length} products found
                  </p>
                  <p className="mt-1 text-xs text-white/30">
                    Same catalog used by the admin, checkout, and product detail views.
                  </p>
                </div>
                <Link
                  href="/cart"
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "h-11 rounded-full border-white/10 bg-white/[0.04] px-5 text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  )}
                >
                  Go to cart
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
