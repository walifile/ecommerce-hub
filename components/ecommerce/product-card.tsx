import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency, type Product } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="overflow-hidden rounded-lg border-border/70 py-0">
      <div className="aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full px-2.5 py-1">
            {product.category}
          </Badge>
          {product.isNew ? (
            <Badge className="rounded-full bg-emerald-600 px-2.5 py-1 text-white">
              New
            </Badge>
          ) : null}
          {product.bestSeller ? (
            <Badge className="rounded-full bg-amber-500 px-2.5 py-1 text-black">
              Best seller
            </Badge>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {product.shortDescription}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {product.rating.toFixed(1)}
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-semibold text-foreground">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
      <CardFooter className="grid grid-cols-2 gap-3 p-5 pt-0">
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-10 rounded-md"
          )}
        >
          View details
        </Link>
        <Link
          href="/cart"
          className={cn(buttonVariants(), "h-10 rounded-md")}
        >
          Buy now
          <ArrowUpRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
