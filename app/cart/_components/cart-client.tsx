"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/ecommerce-data";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

type CartItem = {
  product: Product;
  quantity: number;
};

export function CartClient({ initialItems }: { initialItems: Product[] }) {
  const [items, setItems] = useState<CartItem[]>(
    initialItems.map((product, index) => ({
      product,
      quantity: index === 0 ? 2 : 1,
    }))
  );

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );

  const shipping = subtotal >= 120 ? 0 : 12;
  const discount = subtotal >= 150 ? 18 : subtotal >= 90 ? 10 : 0;
  const total = Math.max(0, subtotal + shipping - discount);

  const hasItems = items.length > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.85fr]">
      <div className="space-y-5">
        <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ShoppingCart className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Cart review
                </p>
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  {items.length} items ready for checkout
                </h2>
              </div>
            </div>
            <div className="rounded-full border border-white/[0.08] bg-black/20 px-4 py-2 text-sm text-white/60">
              {shipping === 0 ? "Free shipping unlocked" : "Add more for free shipping"}
            </div>
          </CardContent>
        </Card>

        {hasItems ? (
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.product.id}
                className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <CardContent className="grid gap-4 p-4 sm:grid-cols-[120px_1fr] sm:gap-5 sm:p-5">
                  <div className="overflow-hidden rounded-2xl bg-surface-2">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex min-w-0 flex-col gap-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55">
                            {item.product.category}
                          </span>
                          {item.product.bestSeller ? (
                            <span className="rounded-full bg-brand px-3 py-1 text-[11px] font-semibold text-white">
                              Best seller
                            </span>
                          ) : null}
                        </div>
                        <div>
                          <h3 className="truncate text-lg font-semibold text-white">
                            {item.product.name}
                          </h3>
                          <p className="mt-1 text-sm leading-6 text-white/50">
                            {item.product.shortDescription}
                          </p>
                        </div>
                      </div>

                      <div className="shrink-0 text-left sm:text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                          Unit price
                        </p>
                        <p className="mt-1 text-xl font-black tracking-tight text-white">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-white/[0.08] bg-black/20 p-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full text-white/60 hover:bg-white/8 hover:text-white"
                          onClick={() =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.product.id === item.product.id
                                  ? { ...entry, quantity: Math.max(1, entry.quantity - 1) }
                                  : entry
                              )
                            )
                          }
                        >
                          <Minus className="size-4" />
                        </Button>
                        <span className="w-11 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-9 rounded-full text-white/60 hover:bg-white/8 hover:text-white"
                          onClick={() =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.product.id === item.product.id
                                  ? { ...entry, quantity: entry.quantity + 1 }
                                  : entry
                              )
                            )
                          }
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-sm text-white/45">
                          Line total{" "}
                          <span className="font-semibold text-white">
                            {formatCurrency(item.product.price * item.quantity)}
                          </span>
                        </p>
                        <Button
                          variant="ghost"
                          className="rounded-full text-white/45 hover:bg-white/8 hover:text-white"
                          onClick={() =>
                            setItems((current) =>
                              current.filter((entry) => entry.product.id !== item.product.id)
                            )
                          }
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
        ) : (
          <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <CardContent className="flex flex-col items-start gap-4 p-8">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                <ShoppingBag className="size-7" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight text-white">
                  Your cart is empty
                </h3>
                <p className="max-w-xl text-sm leading-7 text-white/50">
                  Start with a best seller or browse the shop to fill your cart with
                  products that match the current theme.
                </p>
              </div>
              <Link
                href="/shop"
                className={cn(
                  "inline-flex h-11 items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong px-5 text-sm font-semibold text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]"
                )}
              >
                Browse products
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      <Card className="h-fit rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
              Order summary
            </p>
            <h3 className="mt-1 text-xl font-semibold text-white">
              Ready to checkout
            </h3>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Coupon code"
                className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-brand/40"
              />
              <Button
                variant="outline"
                className="h-12 rounded-full border-white/10 bg-white/[0.04] text-white hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
              >
                Apply
              </Button>
            </div>

            <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4 text-sm">
              <div className="flex items-center justify-between py-2 text-white/55">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-white/55">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
              </div>
              <div className="flex items-center justify-between py-2 text-white/55">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-white/[0.08] pt-3 text-base font-semibold text-white">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <Button className="h-12 w-full rounded-full bg-linear-to-r from-brand to-brand-strong text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]">
              Proceed to checkout
            </Button>

            <Link
              href="/shop"
              className="inline-flex h-11 w-full items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-sm font-medium text-white/65 transition-colors hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
            >
              Continue shopping
            </Link>
          </div>

          <div className="grid gap-3 rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
            <div className="flex items-center justify-between text-sm text-white/60">
              <span>Free shipping threshold</span>
              <span>{shipping === 0 ? "Unlocked" : `${formatCurrency(120 - subtotal)} left`}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/[0.08]">
              <div
                className="h-full rounded-full bg-linear-to-r from-brand to-brand-strong"
                style={{ width: `${Math.min(100, (subtotal / 120) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
