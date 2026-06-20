"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Product } from "@/lib/ecommerce-data";
import { formatCurrency } from "@/lib/ecommerce-data";

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
    () =>
      items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [items]
  );
  const shipping = subtotal > 150 ? 0 : 12;
  const discount = subtotal > 120 ? 10 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.product.id} className="rounded-lg border-border/70">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="h-24 w-full rounded-md object-cover sm:w-32"
              />
              <div className="flex flex-1 flex-col gap-3">
                <div className="flex flex-col justify-between gap-2 sm:flex-row">
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {item.product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {item.product.category}
                    </p>
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(item.product.price)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-md border border-border/70">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none"
                      onClick={() =>
                        setItems((current) =>
                          current.map((entry) =>
                            entry.product.id === item.product.id
                              ? {
                                  ...entry,
                                  quantity: Math.max(1, entry.quantity - 1),
                                }
                              : entry
                          )
                        )
                      }
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-none"
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
                  <Button
                    variant="ghost"
                    className="text-rose-600 hover:text-rose-700"
                    onClick={() =>
                      setItems((current) =>
                        current.filter((entry) => entry.product.id !== item.product.id)
                      )
                    }
                  >
                    <Trash2 className="size-4" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="h-fit rounded-lg border-border/70">
        <CardHeader>
          <CardTitle>Order summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input placeholder="Coupon code" />
            <Button variant="outline">Apply</Button>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Shipping estimate</span>
              <span>{shipping === 0 ? "Free" : formatCurrency(shipping)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Discount</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-border/70 pt-3 text-base font-semibold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
          <Button className="w-full">Proceed to checkout</Button>
        </CardContent>
      </Card>
    </div>
  );
}
