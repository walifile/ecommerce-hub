import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Truck } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import { SectionHeading } from "@/components/ecommerce/section-heading";
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

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-4">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {product.gallery.slice(0, 3).map((image) => (
                <div key={image} className="aspect-[4/3] overflow-hidden rounded-md bg-muted">
                  <img src={image} alt={product.name} className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                  {product.category}
                </Badge>
                <StatusBadge status={product.status} />
              </div>
              <div>
                <h1 className="text-4xl font-semibold text-foreground">
                  {product.name}
                </h1>
                <p className="mt-3 text-base leading-7 text-muted-foreground">
                  {product.description}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  {product.rating.toFixed(1)} ({product.reviewsCount} reviews)
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="size-4" />
                  Ships in 24-48 hours
                </div>
              </div>
            </div>

            <Card className="rounded-lg border-border/70 py-0">
              <CardContent className="space-y-5 p-5">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-foreground">
                    {formatCurrency(product.price)}
                  </span>
                  {product.comparePrice ? (
                    <span className="text-base text-muted-foreground line-through">
                      {formatCurrency(product.comparePrice)}
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Button className="rounded-md">Add to cart</Button>
                  <Link
                    href="/checkout"
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "rounded-md"
                    )}
                  >
                    Buy now
                  </Link>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>SKU: {product.sku}</p>
                  <p>Stock status: {product.stockQuantity} units available</p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-border/70 py-0">
              <CardContent className="space-y-4 p-5">
                <h2 className="text-lg font-semibold text-foreground">
                  Specifications
                </h2>
                <ul className="grid gap-2 text-sm text-muted-foreground">
                  {product.specifications.map((spec) => (
                    <li key={spec} className="rounded-md bg-muted px-3 py-2">
                      {spec}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <section className="mt-16 space-y-6">
          <SectionHeading
            eyebrow="Related products"
            title="More products in the same operating lane."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
