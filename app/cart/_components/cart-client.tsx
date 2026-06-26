"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo } from "react";
import {
  ArrowRight,
  Minus,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  validateCouponAction,
  type CouponValidationState,
} from "@/app/actions/coupons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/cart/cart-provider";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

const initialCouponState: CouponValidationState = {
  status: "idle",
  message: "",
};

export function CartClient() {
  const cart = useCart();
  const {
    items,
    subtotal,
    ready,
    setQuantity,
    removeItem,
    count,
    coupon,
    applyCoupon,
    clearCoupon,
  } = cart;
  const [couponState, couponAction, couponPending] = useActionState(
    validateCouponAction,
    initialCouponState
  );

  const shipping = subtotal >= 50 || subtotal === 0 ? 0 : 10;
  const discount = useMemo(() => {
    if (!coupon || subtotal < coupon.minOrderAmount) return 0;
    const raw =
      coupon.discountType === "percentage"
        ? subtotal * (coupon.discountValue / 100)
        : coupon.discountValue;
    const capped =
      coupon.maxDiscountAmount && coupon.maxDiscountAmount > 0
        ? Math.min(raw, coupon.maxDiscountAmount)
        : raw;
    return Math.max(0, Math.min(subtotal, Number(capped.toFixed(2))));
  }, [coupon, subtotal]);
  const total = Math.max(0, subtotal + shipping - discount);
  const hasItems = items.length > 0;

  useEffect(() => {
    if (couponState.status === "success" && couponState.coupon) {
      applyCoupon({
        id: couponState.coupon.id,
        code: couponState.coupon.code,
        discountType: couponState.coupon.discountType,
        discountValue: couponState.coupon.discountValue,
        minOrderAmount: couponState.coupon.minOrderAmount,
        maxDiscountAmount: couponState.coupon.maxDiscountAmount,
      });
      toast.success(couponState.message);
    } else if (couponState.status === "error") {
      toast.error(couponState.message);
    }
  }, [couponState, applyCoupon]);

  if (!ready) {
    return (
      <div className="h-64 animate-pulse rounded-[28px] border border-white/8 bg-white/3" />
    );
  }

  if (!hasItems) {
    return (
      <Card className="rounded-[28px] border border-white/8 bg-white/3 py-0 backdrop-blur-xl">
        <CardContent className="flex flex-col items-start gap-4 p-8">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
            <ShoppingBag className="size-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-black tracking-tight text-white">
              Your cart is empty
            </h3>
            <p className="max-w-xl text-sm leading-7 text-white/50">
              Browse the shop and add a few toys — your cart is saved on this
              device until you check out.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong px-5 text-sm font-semibold text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]"
          >
            Browse products
            <ArrowRight className="size-4" />
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="overflow-hidden rounded-[28px] border border-white/8 bg-white/3 py-0 backdrop-blur-xl"
          >
            <CardContent className="grid gap-4 p-4 sm:grid-cols-[110px_1fr] sm:gap-5 sm:p-5">
              <Link
                href={`/products/${item.slug}`}
                className="aspect-square overflow-hidden rounded-2xl bg-surface-2"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </Link>

              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                      {item.category}
                    </span>
                    <h3 className="truncate text-base font-black text-white">
                      {item.name}
                    </h3>
                  </div>
                  <p className="shrink-0 text-base font-black text-white">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-full border border-white/8 bg-black/20 p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Decrease quantity"
                      className="size-9 rounded-full text-white/60 hover:bg-white/8 hover:text-white"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-semibold text-white">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Increase quantity"
                      className="size-9 rounded-full text-white/60 hover:bg-white/8 hover:text-white"
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-sm text-white/45">
                      Line{" "}
                      <span className="font-semibold text-white">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove item"
                      className="size-9 rounded-full text-white/45 hover:bg-white/8 hover:text-white"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="h-fit rounded-[28px] border border-white/8 bg-white/3 py-0 backdrop-blur-xl">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                Order summary
              </p>
              <h3 className="text-lg font-black text-white">{count} items</h3>
            </div>
          </div>

          <form action={couponAction} className="space-y-3">
            <input type="hidden" name="subtotal" value={subtotal} />
            <div className="flex items-center gap-2">
              <Input
                name="couponCode"
                placeholder="Coupon code"
                defaultValue={coupon?.code ?? ""}
                className="h-11 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-brand/40"
              />
              <Button
                type="submit"
                disabled={couponPending}
                variant="outline"
                className="h-11 rounded-full border-white/10 bg-white/4 text-white hover:border-white/20 hover:bg-white/8 hover:text-white"
              >
                {couponPending ? "Checking..." : "Apply"}
              </Button>
            </div>

            {coupon ? (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-brand/25 bg-brand/10 px-4 py-3 text-sm text-white">
                <div>
                  <span className="inline-flex items-center gap-2 font-semibold">
                    <Tag className="size-4 text-brand" />
                    {coupon.code} applied
                  </span>
                  {discount === 0 && subtotal < coupon.minOrderAmount ? (
                    <p className="mt-1 text-xs text-white/55">
                      Spend {formatCurrency(coupon.minOrderAmount - subtotal)} more
                      to unlock this discount.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={clearCoupon}
                  className="inline-flex size-7 items-center justify-center rounded-full bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
                  aria-label="Remove coupon"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : null}
          </form>

          <div className="rounded-[22px] border border-white/8 bg-black/20 p-4 text-sm">
            <div className="flex items-center justify-between py-2 text-white/55">
              <span>Subtotal</span>
              <span className="text-white/80">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between py-2 text-white/55">
              <span>Shipping</span>
              <span className={shipping === 0 ? "font-semibold text-brand-3" : "text-white/80"}>
                {shipping === 0 ? "FREE" : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex items-center justify-between py-2 text-white/55">
              <span>Coupon discount</span>
              <span className={discount > 0 ? "font-semibold text-brand-3" : "text-white/80"}>
                {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-white/8 pt-3 text-base font-black text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>

          {subtotal < 50 && (
            <div className="grid gap-2 rounded-[22px] border border-white/8 bg-black/20 p-4">
              <div className="flex items-center justify-between text-sm text-white/60">
                <span>Free shipping at $50</span>
                <span>{formatCurrency(50 - subtotal)} to go</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-linear-to-r from-brand to-brand-strong"
                  style={{ width: `${Math.min(100, (subtotal / 50) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <Link
            href="/checkout"
            className={cn(
              "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong text-sm font-bold text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]"
            )}
          >
            Proceed to checkout
            <ArrowRight className="size-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/4 text-sm font-medium text-white/65 transition-colors hover:border-white/20 hover:text-white"
          >
            Continue shopping
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
