"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, TicketPercent } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { FormRow } from "@/app/admin/_components/form-row";
import { createCouponAction } from "@/app/admin/actions";
import { couponSchema, type CouponFormInput } from "@/lib/validations/admin";

export function CouponForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CouponFormInput>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "fixed",
      discountValue: "",
      minOrderAmount: "",
      maxDiscountAmount: "",
      usageLimit: "",
      startsAt: "",
      expiresAt: "",
      active: true,
    },
  });

  function onSubmit(values: CouponFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("code", values.code);
      fd.set("discountType", values.discountType);
      fd.set("discountValue", values.discountValue);
      fd.set("minOrderAmount", values.minOrderAmount);
      fd.set("maxDiscountAmount", values.maxDiscountAmount);
      fd.set("usageLimit", values.usageLimit);
      fd.set("startsAt", values.startsAt);
      fd.set("expiresAt", values.expiresAt);
      if (values.active) fd.set("active", "on");

      const result = await createCouponAction({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        reset();
        router.refresh();
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
          <h2 className="text-base font-semibold text-foreground">Create coupon</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Build fixed or percentage discounts with campaign limits.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <FormRow label="Code" htmlFor="code" error={errors.code?.message}>
          <Input id="code" placeholder="TOY10" className="uppercase" {...register("code")} />
        </FormRow>
        <FormRow label="Discount type" htmlFor="discountType">
          <NativeSelect id="discountType" className="w-full" {...register("discountType")}>
            <NativeSelectOption value="fixed">Fixed amount</NativeSelectOption>
            <NativeSelectOption value="percentage">Percentage</NativeSelectOption>
          </NativeSelect>
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
        <FormRow label="Minimum order" htmlFor="minOrderAmount">
          <Input
            id="minOrderAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="50"
            {...register("minOrderAmount")}
          />
        </FormRow>
        <FormRow label="Max discount" htmlFor="maxDiscountAmount">
          <Input
            id="maxDiscountAmount"
            type="number"
            min="0"
            step="0.01"
            placeholder="Optional"
            {...register("maxDiscountAmount")}
          />
        </FormRow>
        <FormRow label="Usage limit" htmlFor="usageLimit">
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
        <FormRow label="Starts at" htmlFor="startsAt">
          <Input id="startsAt" type="datetime-local" {...register("startsAt")} />
        </FormRow>
        <FormRow label="Expires at" htmlFor="expiresAt">
          <Input id="expiresAt" type="datetime-local" {...register("expiresAt")} />
        </FormRow>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-border/70 bg-muted/30 p-4 text-sm font-medium text-foreground">
        <input
          type="checkbox"
          className="size-4 rounded border-border accent-primary"
          {...register("active")}
        />
        Active immediately
      </label>

      <Button type="submit" disabled={pending} className="w-fit rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Creating…
          </>
        ) : (
          "Create coupon"
        )}
      </Button>
    </form>
  );
}
