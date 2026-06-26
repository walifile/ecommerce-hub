import Link from "next/link";
import { ArrowUpRight, Flame, ShoppingCart, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatCurrency, type Product } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="group overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.035] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-t from-surface via-transparent to-transparent opacity-90" />
        <div className="absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          <Badge className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[11px] font-semibold text-white/80 backdrop-blur-md">
            {product.category}
          </Badge>
          {product.bestSeller ? (
            <Badge className="rounded-full border-0 bg-brand px-3 py-1 text-[11px] font-semibold text-white shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_25%,transparent)]">
              <Flame className="mr-1 size-3.5" />
              Best seller
            </Badge>
          ) : null}
          {product.isNew ? (
            <Badge className="rounded-full border-0 bg-white px-3 py-1 text-[11px] font-semibold text-black">
              New
            </Badge>
          ) : null}
        </div>
        <div className="aspect-[4/3] overflow-hidden bg-surface-2">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold tracking-tight text-white">
                {product.name}
              </h3>
              <p className="text-sm leading-6 text-white/50">
                {product.shortDescription}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-sm text-white/70">
              <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
              {product.rating.toFixed(1)}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-white">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice ? (
              <span className="text-sm text-white/35 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between text-xs text-white/40">
            <span>{product.reviewsCount} reviews</span>
            <span>{product.stockQuantity > product.lowStockLimit ? "In stock" : "Low stock"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-3 p-5 pt-0">
        <Link
          href={`/products/${product.slug}`}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-11 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          )}
        >
          View details
        </Link>
        <Link
          href="/cart"
          className={cn(
            buttonVariants(),
            "h-11 rounded-full bg-linear-to-r from-brand to-brand-strong text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_28%,transparent)]"
          )}
        >
          <ShoppingCart className="size-4" />
          Buy now
          <ArrowUpRight className="size-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
