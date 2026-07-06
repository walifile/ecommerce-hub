"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, ShoppingCart, Trash2 } from "lucide-react";
import { createManualOrderAction, type OrderFormState } from "@/app/admin/orders/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";

type ProductOption = {
  id: string;
  name: string;
  sku: string;
  price: number;
  stockQuantity: number;
};

type LineItem = {
  productId: string;
  quantity: number;
};

export function ManualOrderDialog({ products }: { products: ProductOption[] }) {
  const initialProductId = products[0]?.id ?? "";
  const [items, setItems] = useState<LineItem[]>(
    initialProductId ? [{ productId: initialProductId, quantity: 1 }] : []
  );
  const initialState: OrderFormState = { status: "idle", message: "" };
  const [state, formAction, pending] = useActionState(createManualOrderAction, initialState);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + Math.max(1, item.quantity), 0),
    [items]
  );

  const updateItem = (index: number, patch: Partial<LineItem>) => {
    setItems((current) =>
      current.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    );
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-border/70 bg-background/80 px-3.5 shadow-sm"
          >
            <ShoppingCart className="size-4" />
            Custom order
          </Button>
        }
      />
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-2xl border-border/70 bg-background p-5 sm:p-6">
        <DialogHeader className="space-y-2 border-b border-border/70 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4 text-primary" />
            <DialogTitle>Create a manual order</DialogTitle>
          </div>
          <DialogDescription className="max-w-2xl">
            Add an offline order from calls, WhatsApp, or in-store requests. Stock is deducted the same way as checkout orders.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-5 pt-1">
          <input
            type="hidden"
            name="itemsJson"
            value={JSON.stringify(items.map(({ productId, quantity }) => ({ productId, quantity })))}
          />

          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="name" placeholder="Customer name" required className="rounded-xl" />
            <Input name="phone" placeholder="Phone number" required className="rounded-xl" />
            <Input name="email" type="email" placeholder="Email address" className="rounded-xl" />
            <Input name="city" placeholder="City" className="rounded-xl" />
          </div>

          <Input name="address" placeholder="Shipping address" className="rounded-xl" />

          <div className="grid gap-3 sm:grid-cols-2">
            <NativeSelect name="payment" defaultValue="cod" className="w-full">
              <NativeSelectOption value="cod">COD</NativeSelectOption>
              <NativeSelectOption value="stripe">Stripe</NativeSelectOption>
            </NativeSelect>
            <NativeSelect name="status" defaultValue="confirmed" className="w-full">
              <NativeSelectOption value="pending">pending</NativeSelectOption>
              <NativeSelectOption value="confirmed">confirmed</NativeSelectOption>
              <NativeSelectOption value="processing">processing</NativeSelectOption>
              <NativeSelectOption value="shipped">shipped</NativeSelectOption>
              <NativeSelectOption value="delivered">delivered</NativeSelectOption>
            </NativeSelect>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Line items</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() =>
                  setItems((current) => [
                    ...current,
                    { productId: initialProductId, quantity: 1 },
                  ])
                }
                disabled={!initialProductId}
              >
                <Plus className="size-4" />
                Add item
              </Button>
            </div>

            <div className="space-y-3">
              {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-5 text-sm text-muted-foreground">
                  No items added yet.
                </div>
              ) : null}

              {items.map((item, index) => {
                const selected = products.find((product) => product.id === item.productId);
                return (
                  <div
                    key={`${item.productId}-${index}`}
                    className="grid gap-3 rounded-2xl border border-border/70 bg-muted/20 p-4 sm:grid-cols-[1.4fr_0.5fr_auto]"
                  >
                    <NativeSelect
                      value={item.productId}
                      onChange={(event) =>
                        updateItem(index, { productId: event.target.value })
                      }
                      className="w-full"
                    >
                      {products.map((product) => (
                        <NativeSelectOption key={product.id} value={product.id}>
                          {product.name} ({product.sku})
                        </NativeSelectOption>
                      ))}
                    </NativeSelect>

                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={item.quantity}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: Math.max(1, Number(event.target.value) || 1),
                        })
                      }
                      className="rounded-xl"
                    />

                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      className="rounded-full"
                      onClick={() =>
                        setItems((current) =>
                          current.filter((_, currentIndex) => currentIndex !== index)
                        )
                      }
                      disabled={items.length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>

                    <div className="sm:col-span-3">
                      <p className="text-xs text-muted-foreground">
                        {selected ? (
                          <>
                            {selected.stockQuantity} in stock · {selected.price.toFixed(0)} each
                          </>
                        ) : (
                          "Choose a product"
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Textarea
            name="notes"
            placeholder="Internal notes or delivery notes"
            className="min-h-24 rounded-xl"
          />

          <div className="flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {totalItems} item{totalItems === 1 ? "" : "s"} selected
              </p>
              {state.status !== "idle" && state.message ? (
                <p
                  className={
                    state.status === "success"
                      ? "text-sm text-emerald-600 dark:text-emerald-400"
                      : "text-sm text-rose-600 dark:text-rose-400"
                  }
                >
                  {state.message}
                </p>
              ) : null}
            </div>
            <Button type="submit" className="rounded-full px-5" disabled={pending}>
              {pending ? "Saving..." : "Save order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
