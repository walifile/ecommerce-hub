import Link from "next/link";
import { ProductCard } from "@/components/ecommerce/product-card";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { listProducts, getCatalogData } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

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

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <SectionHeading
          eyebrow="Shop"
          title="Browse the working catalog."
          description="Search, filter, and sort products against the same data model used by admin operations and Supabase storage."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-4">
            <Card className="rounded-lg border-border/70 py-0">
              <CardContent className="space-y-4 p-5">
                <form className="space-y-4" action="/shop">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Search
                    </label>
                    <Input name="query" defaultValue={query} placeholder="Product or category" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <NativeSelect name="category" defaultValue={category} className="w-full">
                      <NativeSelectOption value="all">All categories</NativeSelectOption>
                      {catalog.categories.map((item) => (
                        <NativeSelectOption key={item.id} value={item.name}>
                          {item.name}
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Max price
                    </label>
                    <Input name="maxPrice" defaultValue={search.maxPrice?.toString?.() ?? ""} placeholder="e.g. 80" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Sort
                    </label>
                    <NativeSelect name="sort" defaultValue={sort} className="w-full">
                      <NativeSelectOption value="featured">Featured</NativeSelectOption>
                      <NativeSelectOption value="price-asc">Price: Low to high</NativeSelectOption>
                      <NativeSelectOption value="price-desc">Price: High to low</NativeSelectOption>
                      <NativeSelectOption value="rating">Rating</NativeSelectOption>
                    </NativeSelect>
                  </div>
                  <Button className="w-full rounded-md">Apply filters</Button>
                </form>
              </CardContent>
            </Card>
          </aside>
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {products.length} products found
              </p>
              <Link
                href="/cart"
                className={cn(buttonVariants({ variant: "outline" }), "rounded-md")}
              >
                Go to cart
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </div>
      </main>
    </StoreShell>
  );
}
