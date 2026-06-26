"use client";

import { useActionState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { useCart } from "@/components/cart/cart-provider";
import { createOrderAction, type CheckoutState } from "@/app/checkout/actions";
import { formatCurrency } from "@/lib/format";

const initialState: CheckoutState = { status: "idle", message: "" };
const inputClass =
  "h-11 border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30";

export function CheckoutClient() {
  const { items, subtotal, ready, clear, coupon, clearCoupon } = useCart();
  const [state, formAction, pending] = useActionState(
    createOrderAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success" && state.orderNumber) {
      toast.success(state.message);
      clear();
      clearCoupon();
      router.push(`/track-order?order=${state.orderNumber}`);
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, clear, clearCoupon, router]);

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
  const itemsPayload = JSON.stringify(
    items.map((i) => ({ id: i.id, quantity: i.quantity }))
  );

  if (ready && items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-white/8 bg-white/3 px-6 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
          <ShoppingBag className="size-7" />
        </div>
        <h2 className="mt-5 text-xl font-black text-white">Your cart is empty</h2>
        <p className="mt-2 max-w-sm text-sm text-white/45">
          Add a few products before checking out.
        </p>
        <Link
          href="/shop"
          className="mt-6 rounded-full bg-linear-to-r from-brand to-brand-strong px-6 py-2.5 text-sm font-bold text-white"
        >
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      {/* Form */}
      <form
        action={formAction}
        className="rounded-3xl border border-white/8 bg-white/3 p-6 backdrop-blur-xl sm:p-7"
      >
        <input type="hidden" name="items" value={itemsPayload} />
        <input type="hidden" name="couponCode" value={coupon?.code ?? ""} />
        <h2 className="text-lg font-black text-white">Shipping details</h2>
        <p className="mt-1 text-sm text-white/45">Where should we send your order?</p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/70">Full name</Label>
            <Input id="name" name="name" required placeholder="Jane Doe" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white/70">Phone number</Label>
            <Input id="phone" name="phone" required placeholder="+1 555 123 4567" className={inputClass} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="email" className="text-white/70">Email (optional)</Label>
            <Input id="email" name="email" type="email" placeholder="you@example.com" className={inputClass} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address" className="text-white/70">Address</Label>
            <Input id="address" name="address" placeholder="House, street, area" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city" className="text-white/70">City</Label>
            <Input id="city" name="city" placeholder="City" className={inputClass} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment" className="text-white/70">Payment method</Label>
            <NativeSelect id="payment" name="payment" className="w-full border-white/10 bg-black/30 text-white">
              <NativeSelectOption value="cod">Cash on Delivery</NativeSelectOption>
              <NativeSelectOption value="stripe">Stripe (Optional)</NativeSelectOption>
            </NativeSelect>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes" className="text-white/70">Order notes (optional)</Label>
            <Textarea
              id="notes"
              name="notes"
              placeholder="Anything we should know?"
              className="min-h-24 border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30"
            />
          </div>
          <Button
            type="submit"
            disabled={pending || !ready}
            className="h-12 rounded-full bg-linear-to-r from-brand to-brand-strong text-sm font-bold text-white shadow-[0_0_24px_color-mix(in_srgb,var(--brand)_28%,transparent)] hover:shadow-[0_0_34px_color-mix(in_srgb,var(--brand)_40%,transparent)] sm:col-span-2"
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Placing order…
              </>
            ) : (
              <>
                <Lock className="size-4" />
                Place order · {formatCurrency(total)}
              </>
            )}
          </Button>
        </div>
      </form>

      {/* Summary */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-white/8 bg-white/3 p-6 backdrop-blur-xl">
          <h2 className="text-lg font-black text-white">Order summary</h2>
          <div className="mt-5 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative size-14 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-surface-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-white">{item.name}</p>
                  <p className="text-xs text-white/40">{item.category}</p>
                </div>
                <span className="text-sm font-bold text-white">
                  {formatCurrency(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm">
            <div className="flex items-center justify-between text-white/55">
              <span>Subtotal</span>
              <span className="text-white/80">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-white/55">
              <span>Shipping</span>
              <span className={shipping === 0 ? "font-semibold text-brand-3" : "text-white/80"}>
                {shipping === 0 ? "FREE" : formatCurrency(shipping)}
              </span>
            </div>
            <div className="flex items-center justify-between text-white/55">
              <span>{coupon ? `Coupon (${coupon.code})` : "Coupon"}</span>
              <span className={discount > 0 ? "font-semibold text-brand-3" : "text-white/80"}>
                {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-white/8 pt-3 text-base font-black text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-xs text-white/55">
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-brand-3" />
            Secure, SSL-encrypted checkout
          </div>
          <div className="flex items-center gap-2">
            <Truck className="size-4 text-brand" />
            Free shipping over $50 · 48-hour dispatch
          </div>
        </div>
      </div>
    </div>
  );
}
