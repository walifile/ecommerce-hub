"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";
const COUPON_RULES_PATH = "coupons/rules.json";

function normalizeCouponCode(value: FormDataEntryValue | null) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, "");
}

function nullableNumber(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  if (!value) return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function nullableDate(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text ? new Date(text).toISOString() : null;
}

export async function createCouponAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const code = normalizeCouponCode(formData.get("code"));
  const discountType =
    String(formData.get("discountType") ?? "fixed") === "percentage"
      ? "percentage"
      : "fixed";
  const discountValue = Number(formData.get("discountValue"));
  const minOrderAmount = nullableNumber(formData, "minOrderAmount") ?? 0;
  const maxDiscountAmount = nullableNumber(formData, "maxDiscountAmount");
  const usageLimitRaw = nullableNumber(formData, "usageLimit");
  const usageLimit =
    usageLimitRaw === null ? null : Math.max(1, Math.floor(usageLimitRaw));

  if (!code) return { status: "error", message: "Enter a coupon code." };
  if (!Number.isFinite(discountValue) || discountValue <= 0)
    return { status: "error", message: "Enter a valid discount value." };
  if (discountType === "percentage" && discountValue > 100)
    return { status: "error", message: "Percentage discount cannot exceed 100%." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const payload = {
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_discount_amount: maxDiscountAmount,
    active: formData.get("active") === "on",
    starts_at: nullableDate(formData.get("startsAt")),
    expires_at: nullableDate(formData.get("expiresAt")),
    usage_limit: usageLimit,
  };
  let { error } = await supabase.from("coupons").insert(payload as never);

  if (error && /column|schema cache/i.test(error.message)) {
    const legacyResult = await supabase.from("coupons").insert({
      code,
      discount_type: discountType,
      discount_value: discountValue,
      active: formData.get("active") === "on",
      expires_at: nullableDate(formData.get("expiresAt")),
    } as never);
    error = legacyResult.error;
  }

  if (error) {
    console.error("[admin] createCoupon failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "A coupon with this code already exists." };
    return { status: "error", message: error.message };
  }

  const rules = await readCompatJson<Record<string, Record<string, unknown>>>(COUPON_RULES_PATH, {});
  await writeCompatJson(COUPON_RULES_PATH, {
    ...rules,
    [code]: {
      minOrderAmount,
      maxDiscountAmount,
      startsAt: nullableDate(formData.get("startsAt")),
      usageLimit,
      usedCount: 0,
    },
  });

  revalidatePath("/admin/coupons");
  return { status: "success", message: `${code} coupon created.` };
}

export async function toggleCouponAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("couponId") ?? "");
  const active = formData.get("active") === "true";
  if (!id) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("coupons")
    .update({ active } as never)
    .eq("id", id);

  if (error) console.error("[admin] toggleCoupon failed:", error.message);
  revalidatePath("/admin/coupons");
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("couponId") ?? "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { data: existing } = await supabase.from("coupons").select("code").eq("id", id).maybeSingle();
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) console.error("[admin] deleteCoupon failed:", error.message);
  if (!error && existing) {
    const code = (existing as { code: string }).code;
    const rules = await readCompatJson<Record<string, Record<string, unknown>>>(COUPON_RULES_PATH, {});
    delete rules[code];
    await writeCompatJson(COUPON_RULES_PATH, rules);
  }
  revalidatePath("/admin/coupons");
}
