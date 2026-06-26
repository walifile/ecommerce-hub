import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatCurrency, type Product } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: Product }) {
  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round((1 - product.price / product.comparePrice) * 100)
      : 0;
  const inStock = product.stockQuantity > product.lowStockLimit;

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/15">
      {/* Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-surface-2"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Status badge (one, top-left) */}
        {product.bestSeller ? (
          <span className="absolute left-3 top-3 rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_35%,transparent)]">
            Best seller
          </span>
        ) : product.isNew ? (
          <span className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-md">
            New
          </span>
        ) : null}

        {/* Discount badge (top-right) */}
        {discount > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-black">
            -{discount}%
          </span>
        )}

        {/* Out-of-stock veil */}
        {!inStock && (
          <span className="absolute bottom-3 left-3 rounded-full border border-white/15 bg-black/60 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/80 backdrop-blur-md">
            Low stock
          </span>
        )}
      </Link>

      {/* Body */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-white/35">
            {product.category}
          </span>
          <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-white/60">
            <Star className="size-3.5 fill-[#fbbf24] text-[#fbbf24]" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <h3 className="mt-1.5 line-clamp-1 text-base font-black tracking-tight text-white">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-sm text-white/45">
          {product.shortDescription}
        </p>

        <div className="mt-3 flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black tracking-tight text-white">
              {formatCurrency(product.price)}
            </span>
            {product.comparePrice ? (
              <span className="text-sm text-white/30 line-through">
                {formatCurrency(product.comparePrice)}
              </span>
            ) : null}
          </div>
          <span className="text-[11px] font-medium text-white/35">
            {product.reviewsCount} reviews
          </span>
        </div>

        {/* Actions */}
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          <Link
            href={`/products/${product.slug}`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "h-11 rounded-xl border-white/10 bg-white/[0.04] text-sm font-semibold text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            )}
          >
            View details
          </Link>
          <Link
            href="/cart"
            aria-label="Add to cart"
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-r from-brand to-brand-strong text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_28%,transparent)] transition-shadow hover:shadow-[0_0_30px_color-mix(in_srgb,var(--brand)_42%,transparent)]"
          >
            <ShoppingCart className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
