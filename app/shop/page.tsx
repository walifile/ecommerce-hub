import Link from "next/link";
import {
  PackageOpen,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Truck,
  Undo2,
  X,
  Zap,
} from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getCatalogData, listProducts } from "@/lib/ecommerce-data";

const SORT_LABELS: Record<string, string> = {
  featured: "Featured",
  "price-asc": "Price: Low to high",
  "price-desc": "Price: High to low",
  rating: "Top rated",
};

const trustItems = [
  { icon: Truck, label: "Free shipping over $50" },
  { icon: Zap, label: "48-hour dispatch" },
  { icon: Undo2, label: "30-day returns" },
  { icon: ShieldCheck, label: "Lab-safe & certified" },
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

  // Merge current filters, apply overrides (undefined removes a key), build href.
  const buildHref = (overrides: Record<string, string | undefined>) => {
    const current: Record<string, string | undefined> = {
      category: category !== "all" ? category : undefined,
      query: query || undefined,
      sort: sort !== "featured" ? sort : undefined,
      maxPrice: maxPrice ? String(maxPrice) : undefined,
    };
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...current, ...overrides })) {
      if (v) params.set(k, v);
    }
    const qs = params.toString();
    return qs ? `/shop?${qs}` : "/shop";
  };

  const pills = [
    { id: "all", name: "All", count: catalog.products.length },
    ...catalog.categories.map((c) => ({
      id: c.id,
      name: c.name,
      count: c.productCount,
    })),
  ];

  const activeFilters = [
    category !== "all" && { label: category, href: buildHref({ category: undefined }) },
    query && { label: `“${query}”`, href: buildHref({ query: undefined }) },
    maxPrice && { label: `Under $${maxPrice}`, href: buildHref({ maxPrice: undefined }) },
    sort !== "featured" && { label: SORT_LABELS[sort], href: buildHref({ sort: undefined }) },
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-white/6">
          <div className="pointer-events-none absolute -right-20 -top-32 size-[36rem] rounded-full bg-brand/8 blur-[130px]" />
          <div className="pointer-events-none absolute -left-32 top-10 size-96 rounded-full bg-brand-2/6 blur-[120px]" />

          <div className="section-shell relative pb-7 pt-12 sm:pt-16">
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
              ToyVerse Shop
            </p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  Find the perfect toy.
                </h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-white/45">
                  Premium, lab-safe picks for every age and interest — filtered,
                  sorted, and ready to ship.
                </p>
              </div>
              <p className="pb-1 text-sm font-semibold text-white/40">
                {products.length} product{products.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* Trust strip */}
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3">
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 text-xs font-semibold text-white/55"
                >
                  <Icon className="size-4 text-brand" />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sticky filter bar */}
        <div className="sticky top-[68px] z-30 border-b border-white/6 bg-surface/80 backdrop-blur-xl">
          <div className="section-shell space-y-3 py-4">
            <form
              action="/shop"
              className="flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <input type="hidden" name="category" value={category} />
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                <Input
                  name="query"
                  defaultValue={query}
                  placeholder="Search toys, brands, categories…"
                  className="h-11 rounded-xl border-white/10 bg-black/30 pl-11 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30"
                />
              </div>
              <Input
                name="maxPrice"
                defaultValue={maxPrice ?? ""}
                placeholder="Max $"
                className="h-11 rounded-xl border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30 sm:w-28"
              />
              <Select name="sort" defaultValue={sort}>
                <SelectTrigger className="w-full rounded-xl border-white/10 bg-black/30 text-white data-[size=default]:h-11 sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border border-white/10 bg-surface text-white">
                  <SelectItem value="featured" className="text-white/80 focus:bg-white/10 focus:text-white">
                    Featured
                  </SelectItem>
                  <SelectItem value="price-asc" className="text-white/80 focus:bg-white/10 focus:text-white">
                    Price: Low to high
                  </SelectItem>
                  <SelectItem value="price-desc" className="text-white/80 focus:bg-white/10 focus:text-white">
                    Price: High to low
                  </SelectItem>
                  <SelectItem value="rating" className="text-white/80 focus:bg-white/10 focus:text-white">
                    Top rated
                  </SelectItem>
                </SelectContent>
              </Select>
              <Button className="h-11 rounded-xl bg-linear-to-r from-brand to-brand-strong px-6 text-sm font-bold text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_28%,transparent)]">
                <SlidersHorizontal className="size-4" />
                Apply
              </Button>
            </form>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden">
              {pills.map((c) => {
                const active =
                  category === c.name || (c.id === "all" && category === "all");
                return (
                  <Link
                    key={c.id}
                    href={buildHref({
                      category: c.id === "all" ? undefined : c.name,
                    })}
                    className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                      active
                        ? "border-brand/40 bg-brand/15 text-brand"
                        : "border-white/10 bg-white/3 text-white/55 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    {c.name}
                    <span
                      className={`rounded-full px-1.5 text-[11px] ${
                        active ? "bg-brand/20 text-brand" : "bg-white/8 text-white/40"
                      }`}
                    >
                      {c.count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active filters */}
        {activeFilters.length > 0 && (
          <section className="section-shell pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/35">
                Active
              </span>
              {activeFilters.map((f) => (
                <Link
                  key={f.label}
                  href={f.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70 transition-colors hover:border-white/20 hover:text-white"
                >
                  {f.label}
                  <X className="size-3" />
                </Link>
              ))}
              <Link
                href="/shop"
                className="ml-1 text-xs font-bold text-brand hover:underline"
              >
                Clear all
              </Link>
            </div>
          </section>
        )}

        {/* Product grid */}
        <section className="section-shell pb-16 pt-6">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-white/3 px-6 py-20 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-white/5 text-white/40">
                <PackageOpen className="size-7" />
              </div>
              <h2 className="mt-5 text-xl font-black text-white">No products found</h2>
              <p className="mt-2 max-w-sm text-sm text-white/45">
                Try a different search, category, or a higher max price.
              </p>
              <Link
                href="/shop"
                className="mt-6 rounded-full bg-linear-to-r from-brand to-brand-strong px-6 py-2.5 text-sm font-bold text-white"
              >
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </StoreShell>
  );
}
