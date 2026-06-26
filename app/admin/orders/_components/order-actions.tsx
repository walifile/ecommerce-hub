"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { updateOrderStatusAction } from "@/app/admin/actions";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export function OrderActions({
  orderId,
  status,
}: {
  orderId: string;
  status: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <form action={updateOrderStatusAction} className="flex items-center gap-2">
        <input type="hidden" name="orderId" value={orderId} />
        <NativeSelect
          name="status"
          defaultValue={status}
          size="sm"
          className="w-36 capitalize"
        >
          {STATUSES.map((s) => (
            <NativeSelectOption key={s} value={s} className="capitalize">
              {s}
            </NativeSelectOption>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline" size="sm" className="rounded-md">
          Update
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="rounded-md"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        Invoice
      </Button>
    </div>
  );
}
