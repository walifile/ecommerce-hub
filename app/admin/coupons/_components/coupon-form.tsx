"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow } from "@/app/admin/_components/form-row";
import { createCouponAction, updateCouponAction } from "@/app/admin/coupons/actions";
import { couponSchema, type CouponFormInput } from "@/lib/validations/admin";

export type CouponFormValues = {
  id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  startsAt?: string;
  expiresAt?: string;
  active: boolean;
};

function toLocalDateTime(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function CouponForm({
  coupon,
  onSuccess,
}: {
  coupon?: CouponFormValues;
  onSuccess?: () => void;
} = {}) {
  const isEdit = Boolean(coupon);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CouponFormInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: coupon?.code ?? "",
      discountType: coupon?.discountType ?? "fixed",
      discountValue: coupon ? String(coupon.discountValue) : "",
      minOrderAmount: coupon ? String(coupon.minOrderAmount) : "",
      maxDiscountAmount: coupon?.maxDiscountAmount === undefined ? "" : String(coupon.maxDiscountAmount),
      usageLimit: coupon?.usageLimit === undefined ? "" : String(coupon.usageLimit),
      startsAt: toLocalDateTime(coupon?.startsAt),
      expiresAt: toLocalDateTime(coupon?.expiresAt),
      active: coupon?.active ?? true,
    },
  });

  function onSubmit(values: CouponFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      if (coupon) fd.set("couponId", coupon.id);
      fd.set("code", values.code);
      fd.set("discountType", values.discountType);
      fd.set("discountValue", values.discountValue);
      fd.set("minOrderAmount", values.minOrderAmount);
      fd.set("maxDiscountAmount", values.maxDiscountAmount);
      fd.set("usageLimit", values.usageLimit);
      fd.set("startsAt", values.startsAt);
      fd.set("expiresAt", values.expiresAt);
      fd.set("active", String(values.active));

      const action = isEdit ? updateCouponAction : createCouponAction;
      const result = await action({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        if (!isEdit) reset();
        router.refresh();
        onSuccess?.();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="flex items-start gap-3 rounded-xl border border-border/70 bg-muted/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <TicketPercent className="size-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground">
            {isEdit ? "Edit coupon" : "Create coupon"}
          </h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            {isEdit
              ? "Update campaign rules without changing its audit code."
              : "Build fixed or percentage discounts with campaign limits."}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormRow label="Code" htmlFor="code" error={errors.code?.message}>
          <Input
            id="code"
            placeholder="TOY10"
            className="uppercase read-only:cursor-not-allowed read-only:opacity-70"
            readOnly={isEdit}
            {...register("code")}
          />
        </FormRow>
        <FormRow label="Discount type" htmlFor="discountType">
          <Controller
            control={control}
            name="discountType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="discountType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed amount</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </FormRow>
        <FormRow
          label="Discount value"
          htmlFor="discountValue"
          error={errors.discountValue?.message}
        >
          <Input
            id="discountValue"
            type="number"
            min="0"
            step="0.01"
            placeholder="10"
            {...register("discountValue")}
          />
        </FormRow>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormRow label="Minimum order" htmlFor="minOrderAmount" error={errors.minOrderAmount?.message}>
          <Input
            id="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="50"
            {...register("minOrderAmount")}
          />
        </FormRow>
        <FormRow label="Max discount" htmlFor="maxDiscountAmount" error={errors.maxDiscountAmount?.message}>
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            {...register("maxDiscountAmount")}
          />
        </FormRow>
        <FormRow label="Usage limit" htmlFor="usageLimit" error={errors.usageLimit?.message}>
          <Input
            id="usageLimit"
            type="number"
            min="1"
            step="1"
            placeholder="Optional"
            {...register("usageLimit")}
          />
        </FormRow>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormRow label="Starts at" htmlFor="startsAt" error={errors.startsAt?.message}>
          <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
        </FormRow>
        <FormRow label="Expires at" htmlFor="expiresAt" error={errors.expiresAt?.message}>
          <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
        </FormRow>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-4">
        <Controller
          control={control}
          name="active"
          render={({ field }) => (
            <Checkbox
              id="active"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <Label htmlFor="active" className="text-sm font-medium text-foreground">
          Active immediately
        </Label>
      </div>

      <Button type="submit" disabled={pending} className="w-fit rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating…
          </>
        ) : (
          isEdit ? "Update coupon" : "Create coupon"
        )}
      </Button>
    </form>
  );
}
