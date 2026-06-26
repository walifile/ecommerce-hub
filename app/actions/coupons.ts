"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ValidatedCoupon = {
  id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  discountAmount: number;
};

export type CouponValidationState = {
  status: "idle" | "success" | "error";
  message: string;
  coupon?: ValidatedCoupon;
};

function normalizeCode(value: FormDataEntryValue | null) {
  return String(value ?? "").trim().toUpperCase();
}

function calculateDiscount(input: {
  discountType: "fixed" | "percentage";
  discountValue: number;
  maxDiscountAmount?: number;
  subtotal: number;
}) {
  const raw =
    input.discountType === "percentage"
      ? input.subtotal * (input.discountValue / 100)
      : input.discountValue;
  const capped =
    input.maxDiscountAmount && input.maxDiscountAmount > 0
      ? Math.min(raw, input.maxDiscountAmount)
      : raw;

  return Math.max(0, Math.min(input.subtotal, Number(capped.toFixed(2))));
}

export async function validateCouponAction(
  _prev: CouponValidationState,
  formData: FormData
): Promise<CouponValidationState> {
  const code = normalizeCode(formData.get("couponCode"));
  const subtotal = Number(formData.get("subtotal"));

  if (!code) {
    return { status: "error", message: "Enter a coupon code." };
  }
  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    return { status: "error", message: "Add products before applying a coupon." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      status: "error",
      message: "Coupon validation is unavailable because Supabase is not configured.",
    };
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code)
    .maybeSingle();

  if (error) {
    console.error("[coupons] validate failed:", error.message);
    return { status: "error", message: "Could not validate coupon." };
  }

  if (!data) {
    return { status: "error", message: "Coupon code was not found." };
  }

  const coupon = data as {
    id: string;
    code: string;
    discount_type: string;
    discount_value: number;
    min_order_amount: number | null;
    max_discount_amount: number | null;
    active: boolean;
    starts_at: string | null;
    expires_at: string | null;
    usage_limit: number | null;
    used_count: number | null;
  };

  if (!coupon.active) {
    return { status: "error", message: "This coupon is not active." };
  }

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { status: "error", message: "This coupon is not live yet." };
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return { status: "error", message: "This coupon has expired." };
  }
  if (
    coupon.usage_limit !== null &&
    coupon.usage_limit !== undefined &&
    (coupon.used_count ?? 0) >= coupon.usage_limit
  ) {
    return { status: "error", message: "This coupon has reached its usage limit." };
  }

  const minOrderAmount = Number(coupon.min_order_amount ?? 0);
  if (subtotal < minOrderAmount) {
    return {
      status: "error",
      message: `Spend ${new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(minOrderAmount - subtotal)} more to use this coupon.`,
    };
  }

  const discountType =
    coupon.discount_type === "percentage" ? "percentage" : "fixed";
  const discountValue = Number(coupon.discount_value);
  const maxDiscountAmount =
    coupon.max_discount_amount === null || coupon.max_discount_amount === undefined
      ? undefined
      : Number(coupon.max_discount_amount);
  const discountAmount = calculateDiscount({
    discountType,
    discountValue,
    maxDiscountAmount,
    subtotal,
  });

  if (discountAmount <= 0) {
    return { status: "error", message: "This coupon has no valid discount value." };
  }

  return {
    status: "success",
    message: `${coupon.code} applied.`,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discountType,
      discountValue,
      minOrderAmount,
      maxDiscountAmount,
      discountAmount,
    },
  };
}
