"use client";

import { useEffect, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { buttonVariants } from "@/components/ui/button";
import type { CartInput } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

export function ProductPurchase({
  item,
  price,
  comparePrice,
  stock,
  isOutOfStock,
}: {
  item: CartInput;
  price: number;
  comparePrice?: number;
  stock: number;
  isOutOfStock: boolean;
}) {
  const max = Math.max(1, stock);
  const [qty, setQty] = useState(1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Reveal a persistent buy bar once the primary Add to cart / Buy now
  // row has scrolled out of view, so the purchase action stays reachable.
  useEffect(() => {
    const node = anchorRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBar(!entry.isIntersecting),
      { rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const discount =
    comparePrice && comparePrice > price
      ? Math.round(((comparePrice - price) / comparePrice) * 100)
      : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-4xl font-black tracking-tight text-white">
          {formatCurrency(price)}
        </span>
        {comparePrice ? (
          <span className="text-base text-white/35 line-through">
            {formatCurrency(comparePrice)}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand">
            Save {discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-white/[0.03] p-1">
          <button
            type="button"
            aria-label="Decrease quantity"
            disabled={isOutOfStock || qty <= 1}
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold text-white tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            aria-label="Increase quantity"
            disabled={isOutOfStock || qty >= max}
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="flex size-9 items-center justify-center rounded-full text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="size-4" />
          </button>
        </div>
        {!isOutOfStock ? (
          <span className="text-sm text-white/45">
            {stock} in stock
          </span>
        ) : null}
      </div>

      <div ref={anchorRef} className="grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          disabled={isOutOfStock}
          item={item}
          quantity={qty}
          className={cn(
            buttonVariants(),
            "h-12 rounded-full text-white",
            isOutOfStock
              ? "cursor-not-allowed bg-white/10 text-white/35 shadow-none"
              : "bg-linear-to-r from-brand to-brand-strong shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]"
          )}
        >
          {isOutOfStock ? "Out of stock" : "Add to cart"}
        </AddToCartButton>
        <BuyNowButton
          item={item}
          quantity={qty}
          disabled={isOutOfStock}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          )}
        />
      </div>

      {/* Persistent buy bar — mounted only once the primary actions scroll away. */}
      {showStickyBar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom fade-in border-t border-white/[0.08] bg-surface/95 shadow-[0_-12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl duration-200">
          <div className="section-shell flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {item.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={item.image}
                  alt=""
                  className="hidden size-11 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:block"
                />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{item.name}</p>
                <p className="text-lg font-black tracking-tight text-white">
                  {formatCurrency(price)}
                </p>
              </div>
            </div>
            <AddToCartButton
              disabled={isOutOfStock}
              item={item}
              quantity={qty}
              className={cn(
                buttonVariants(),
                "h-11 shrink-0 rounded-full px-5 text-sm text-white",
                isOutOfStock
                  ? "cursor-not-allowed bg-white/10 text-white/35 shadow-none"
                  : "bg-linear-to-r from-brand to-brand-strong shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_28%,transparent)]"
              )}
            >
              {isOutOfStock ? "Out of stock" : "Add to cart"}
            </AddToCartButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
