"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";
import { cn } from "@/lib/utils";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
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
      <Link
        href={`/admin/orders/${orderId}`}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "rounded-md"
        )}
      >
        <ExternalLink className="size-4" />
        View
      </Link>
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
      <Link
        href={`/admin/orders/${orderId}/invoice`}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "rounded-md"
        )}
      >
        Invoice
      </Link>
    </div>
  );
}
