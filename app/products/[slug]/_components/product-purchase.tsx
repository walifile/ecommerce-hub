"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { BuyNowButton } from "@/components/cart/buy-now-button";
import { buttonVariants } from "@/components/ui/button";
import type { CartInput } from "@/components/cart/cart-provider";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type ProductPurchaseProps = {
  item: CartInput;
  price: number;
  comparePrice?: number;
  stock: number;
  lowStockLimit: number;
  isOutOfStock: boolean;
  isLowStock: boolean;
};

export function ProductPurchase({
  item,
  price,
  comparePrice,
  stock,
  lowStockLimit,
  isOutOfStock,
  isLowStock,
}: ProductPurchaseProps) {
  const max = Math.max(1, stock);
  const [qty, setQty] = useState(1);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);

  useEffect(() => {
    const node = anchorRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting && entry.boundingClientRect.top < 72);
      },
      { rootMargin: "-72px 0px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const discount = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : 0;
  const savings = comparePrice && comparePrice > price ? (comparePrice - price) * qty : 0;
  const subtotal = price * qty;
  const stockRatio = Math.max(8, Math.min(100, (stock / Math.max(1, lowStockLimit)) * 100));

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/35">Price</p>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-4xl font-black tracking-[-0.045em] text-white sm:text-[44px]">
              {formatCurrency(price)}
            </span>
            {comparePrice && comparePrice > price ? (
              <span className="text-base font-medium text-white/32 line-through">
                {formatCurrency(comparePrice)}
              </span>
            ) : null}
          </div>
        </div>
        {discount > 0 ? (
          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
            Save {discount}%
          </span>
        ) : null}
      </div>

      <div className="my-5 h-px bg-white/8" />

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <label className="text-xs font-semibold text-white/50">Quantity</label>
          <div className="mt-2 inline-flex items-center rounded-2xl border border-white/10 bg-black/20 p-1">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={isOutOfStock || qty <= 1}
              onClick={() => setQty((current) => Math.max(1, current - 1))}
              className="flex size-10 items-center justify-center rounded-xl text-white/65 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Minus className="size-4" />
            </button>
            <output aria-live="polite" className="w-11 text-center text-sm font-bold text-white tabular-nums">
              {qty}
            </output>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={isOutOfStock || qty >= max}
              onClick={() => setQty((current) => Math.min(max, current + 1))}
              className="flex size-10 items-center justify-center rounded-xl text-white/65 transition hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-25"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="text-right">
          <p className="text-xs font-medium text-white/35">Total for {qty}</p>
          <p className="mt-1 text-xl font-black text-white">{formatCurrency(subtotal)}</p>
          {savings > 0 ? <p className="mt-0.5 text-[11px] font-semibold text-emerald-300">You save {formatCurrency(savings)}</p> : null}
        </div>
      </div>

      {isLowStock ? (
        <div className="mt-5 rounded-2xl border border-amber-300/15 bg-amber-300/[0.055] p-3.5">
          <div className="flex items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-amber-200">Selling quickly</span>
            <span className="text-amber-100/60">{stock} left in stock</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/8">
            <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400" style={{ width: `${stockRatio}%` }} />
          </div>
        </div>
      ) : !isOutOfStock ? (
        <p className="mt-5 flex items-center gap-2 text-xs font-medium text-emerald-300">
          <span className="flex size-5 items-center justify-center rounded-full bg-emerald-400/10"><Check className="size-3" /></span>
          In stock and ready to order
        </p>
      ) : null}

      <div ref={anchorRef} className="mt-6 grid gap-3 sm:grid-cols-2">
        <AddToCartButton
          disabled={isOutOfStock}
          item={item}
          quantity={qty}
          className={cn(
            buttonVariants({ variant: "outline" }),
            "group h-13 rounded-2xl border-white/12 bg-white/[0.045] text-white hover:border-white/25 hover:bg-white/[0.09] hover:text-white",
            isOutOfStock && "cursor-not-allowed opacity-45"
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <ShoppingBag className="size-4 transition group-hover:-translate-y-0.5" />
            {isOutOfStock ? "Out of stock" : "Add to cart"}
          </span>
        </AddToCartButton>
        <BuyNowButton
          item={item}
          quantity={qty}
          disabled={isOutOfStock}
          className={cn(
            buttonVariants(),
            "group h-13 rounded-2xl bg-linear-to-r from-brand to-brand-strong text-white shadow-[0_14px_34px_color-mix(in_srgb,var(--brand)_24%,transparent)] transition hover:-translate-y-0.5 hover:brightness-110",
            isOutOfStock && "cursor-not-allowed opacity-45"
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            <Zap className="size-4 fill-current transition group-hover:scale-110" />
            {isOutOfStock ? "Unavailable" : "Buy now"}
          </span>
        </BuyNowButton>
      </div>

      <p className="mt-4 text-center text-[11px] leading-5 text-white/32">
        You can review your items and delivery details before placing the order.
      </p>

      {showStickyBar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 animate-in slide-in-from-bottom fade-in border-t border-white/8 bg-surface/92 shadow-[0_-14px_50px_rgba(0,0,0,0.4)] backdrop-blur-2xl duration-200">
          <div className="section-shell flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              {item.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.image} alt="" className="hidden size-12 shrink-0 rounded-xl object-cover ring-1 ring-white/10 sm:block" />
              ) : null}
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-white/55 sm:text-sm">{item.name}</p>
                <p className="text-lg font-black tracking-tight text-white">{formatCurrency(subtotal)}</p>
              </div>
            </div>
            <AddToCartButton
              disabled={isOutOfStock}
              item={item}
              quantity={qty}
              className={cn(
                buttonVariants(),
                "h-11 shrink-0 rounded-xl bg-linear-to-r from-brand to-brand-strong px-5 text-sm text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--brand)_24%,transparent)]",
                isOutOfStock && "cursor-not-allowed opacity-45"
              )}
            >
              <span className="inline-flex items-center gap-2"><ShoppingBag className="size-4" />{isOutOfStock ? "Out of stock" : `Add ${qty} to cart`}</span>
            </AddToCartButton>
          </div>
        </div>
      ) : null}
    </div>
  );
}
