"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart";
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

      <div className="grid gap-3 sm:grid-cols-2">
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
        <Link
          href="/cart"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-12 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          )}
        >
          View cart
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}
