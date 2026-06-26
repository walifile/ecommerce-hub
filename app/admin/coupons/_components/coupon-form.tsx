"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import {
  createCouponAction,
  type AdminActionState,
} from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

const initialState: AdminActionState = { status: "idle", message: "" };

export function CouponForm() {
  const [state, formAction, pending] = useActionState(
    createCouponAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="grid gap-5">
      <div className="flex items-start gap-3 rounded-2xl border border-border/70 bg-muted/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <TicketPercent className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">Create coupon</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Build fixed or percentage discounts with campaign limits.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="code">Code</Label>
          <Input id="code" name="code" placeholder="TOY10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountType">Discount type</Label>
          <NativeSelect id="discountType" name="discountType" className="w-full">
            <NativeSelectOption value="fixed">Fixed amount</NativeSelectOption>
            <NativeSelectOption value="percentage">Percentage</NativeSelectOption>
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="discountValue">Discount value</Label>
          <Input
            id="discountValue"
            name="discountValue"
            type="number"
            min="0"
            step="0.01"
            placeholder="10"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="minOrderAmount">Minimum order</Label>
          <Input
            id="minOrderAmount"
            name="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscountAmount">Max discount</Label>
          <Input
            id="maxDiscountAmount"
            name="maxDiscountAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Usage limit</Label>
          <Input
            id="usageLimit"
            name="usageLimit"
            type="number"
            min="1"
            step="1"
            placeholder="Optional"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="startsAt">Starts at</Label>
          <Input id="startsAt" name="startsAt" type="datetime-local" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expiresAt">Expires at</Label>
          <Input id="expiresAt" name="expiresAt" type="datetime-local" />
        </div>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 text-sm font-medium text-foreground">
        <input
          name="active"
          type="checkbox"
          defaultChecked
          className="size-4 rounded border-border accent-primary"
        />
        Active immediately
      </label>

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating...
          </>
        ) : (
          "Create coupon"
        )}
      </Button>
    </form>
  );
}
