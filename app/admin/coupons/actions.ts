"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { couponSchema, type CouponFormInput } from "@/lib/validations/admin";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase();
}

function parseCouponForm(formData: FormData) {
  return couponSchema.safeParse({
    code: String(formData.get("code") ?? ""),
    discountType: String(formData.get("discountType") ?? "fixed"),
    discountValue: String(formData.get("discountValue") ?? ""),
    minOrderAmount: String(formData.get("minOrderAmount") ?? ""),
    maxDiscountAmount: String(formData.get("maxDiscountAmount") ?? ""),
    usageLimit: String(formData.get("usageLimit") ?? ""),
    startsAt: String(formData.get("startsAt") ?? ""),
    expiresAt: String(formData.get("expiresAt") ?? ""),
    active: formData.get("active") === "true" || formData.get("active") === "on",
  });
}

function nullableNumber(value: string) {
  return value === "" ? null : Number(value);
}

function nullableDate(value: string) {
  return value === "" ? null : new Date(value).toISOString();
}

function couponPayload(input: CouponFormInput) {
  return {
    code: normalizeCouponCode(input.code),
    discount_type: input.discountType,
    discount_value: Number(input.discountValue),
    min_order_amount: Number(input.minOrderAmount || 0),
    max_discount_amount: nullableNumber(input.maxDiscountAmount),
    active: input.active,
    starts_at: nullableDate(input.startsAt),
    expires_at: nullableDate(input.expiresAt),
    usage_limit: nullableNumber(input.usageLimit),
  };
}

function revalidateCouponSurfaces() {
  revalidatePath("/admin/coupons");
  revalidatePath("/cart");
  revalidatePath("/checkout");
}

export async function createCouponAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the coupon details." };
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const payload = couponPayload(parsed.data);
  const { data: duplicate, error: duplicateError } = await supabase
    .from("coupons").select("id").ilike("code", payload.code).limit(1);
  if (duplicateError) return { status: "error", message: duplicateError.message };
  if (duplicate?.length) {
    return { status: "error", message: "A coupon with this code already exists." };
  }
  const { error } = await supabase.from("coupons").insert(payload as never);
  if (error) {
    console.error("[admin] createCoupon failed:", error.message);
    if (error.code === "23505") {
      return { status: "error", message: "A coupon with this code already exists." };
    }
    return { status: "error", message: error.message };
  }
  revalidateCouponSurfaces();
  return { status: "success", message: `${payload.code} coupon created.` };
}

export async function updateCouponAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("couponId") ?? "").trim();
  if (!id) return { status: "error", message: "Missing coupon id." };
  const parsed = parseCouponForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the coupon details." };
  }
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data: existing, error: readError } = await supabase
    .from("coupons").select("code, used_count").eq("id", id).maybeSingle();
  if (readError || !existing) {
    return { status: "error", message: readError?.message ?? "Coupon not found." };
  }
  const oldCoupon = existing as { code: string; used_count: number };
  const payload = couponPayload(parsed.data);
  if (payload.code !== oldCoupon.code) {
    return { status: "error", message: "Coupon codes cannot be changed after creation." };
  }
  if (payload.usage_limit !== null && payload.usage_limit < Number(oldCoupon.used_count)) {
    return {
      status: "error",
      message: `Usage limit cannot be lower than the current ${oldCoupon.used_count} uses.`,
    };
  }
  const { data: updated, error } = await supabase
    .from("coupons").update(payload as never).eq("id", id).select("id").maybeSingle();
  if (error || !updated) {
    console.error("[admin] updateCoupon failed:", error?.message);
    return { status: "error", message: error?.message ?? "Coupon not found." };
  }
  revalidateCouponSurfaces();
  return { status: "success", message: `${payload.code} coupon updated.` };
}

export async function toggleCouponAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("couponId") ?? "").trim();
  const active = formData.get("active") === "true";
  if (!id) return { status: "error", message: "Missing coupon id." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data: coupon, error: readError } = await supabase
    .from("coupons")
    .select("code, expires_at, usage_limit, used_count")
    .eq("id", id)
    .maybeSingle();
  if (readError || !coupon) {
    return { status: "error", message: readError?.message ?? "Coupon not found." };
  }
  const row = coupon as {
    code: string;
    expires_at: string | null;
    usage_limit: number | null;
    used_count: number;
  };
  if (active && row.expires_at && new Date(row.expires_at).getTime() <= Date.now()) {
    return { status: "error", message: "Update the expiry date before activating this coupon." };
  }
  if (active && row.usage_limit !== null && row.used_count >= row.usage_limit) {
    return { status: "error", message: "Increase the usage limit before activating this coupon." };
  }
  const { data: updated, error } = await supabase
    .from("coupons").update({ active } as never).eq("id", id).select("id").maybeSingle();
  if (error || !updated) {
    return { status: "error", message: error?.message ?? "Coupon not found." };
  }
  revalidateCouponSurfaces();
  return { status: "success", message: `${row.code} ${active ? "activated" : "paused"}.` };
}

export async function deleteCouponAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("couponId") ?? "").trim();
  if (!id) return { status: "error", message: "Missing coupon id." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data: coupon, error: readError } = await supabase
    .from("coupons").select("code, used_count").eq("id", id).maybeSingle();
  if (readError || !coupon) {
    return { status: "error", message: readError?.message ?? "Coupon not found." };
  }
  const row = coupon as { code: string; used_count: number };
  const { count, error: ordersError } = await supabase
    .from("orders").select("id", { count: "exact", head: true }).eq("coupon_code", row.code);
  if (ordersError) return { status: "error", message: ordersError.message };
  if ((count ?? 0) > 0 || row.used_count > 0) {
    return {
      status: "error",
      message: "Used coupons are retained for order history. Pause this coupon instead.",
    };
  }
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteCoupon failed:", error.message);
    return { status: "error", message: error.message };
  }
  revalidateCouponSurfaces();
  return { status: "success", message: `${row.code} coupon deleted.` };
}
