"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { saveOperationsSettingsAction, type OperationsState } from "@/app/actions/operations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { StoreSettings } from "@/lib/ecommerce-data";

const initial: OperationsState = { status: "idle", message: "" };
export function OperationsSettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState(saveOperationsSettingsAction, initial);
  useEffect(() => {
    if (state.status === "success") toast.success(state.message);
    if (state.status === "error") toast.error(state.message);
  }, [state]);
  return (
    <form action={action} className="space-y-5">
      <p className="text-sm text-muted-foreground">Available placeholders: {`{customerName}, {orderNumber}, {total}`}</p>
      {([
        ["whatsappTemplateOrderCreated", "Order created", settings.whatsappTemplateOrderCreated],
        ["whatsappTemplateOrderConfirmed", "Order confirmed", settings.whatsappTemplateOrderConfirmed],
        ["whatsappTemplateOrderShipped", "Order shipped", settings.whatsappTemplateOrderShipped],
        ["whatsappTemplateOrderDelivered", "Order delivered", settings.whatsappTemplateOrderDelivered],
      ] as const).map(([name, label, value]) => (
        <label key={name} className="grid gap-2 text-sm font-medium">{label}
          <Textarea name={name} required defaultValue={value} className="min-h-20" />
        </label>
      ))}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">Flat shipping rate
          <Input name="shippingFlatRate" type="number" min="0" step="0.01" defaultValue={settings.shippingFlatRate} required />
        </label>
        <label className="grid gap-2 text-sm font-medium">Free shipping threshold
          <Input name="freeShippingThreshold" type="number" min="0" step="0.01" defaultValue={settings.freeShippingThreshold} required />
        </label>
      </div>
      <Button disabled={pending}>{pending ? "Saving..." : "Save operations settings"}</Button>
    </form>
  );
}
