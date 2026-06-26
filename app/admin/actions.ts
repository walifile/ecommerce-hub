"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notifyOrder, templateForStatus } from "@/lib/whatsapp";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ── Expenses ──────────────────────────────────────────────────────────
export async function createExpenseAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const expenseType = String(formData.get("expenseType") ?? "miscellaneous")
    .trim()
    .toLowerCase();
  const amount = Number(formData.get("amount"));
  const date =
    String(formData.get("date") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  if (!title) return { status: "error", message: "Enter an expense title." };
  if (!Number.isFinite(amount) || amount <= 0)
    return { status: "error", message: "Enter a valid amount." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const { error } = await supabase.from("expenses").insert({
    title,
    expense_type: expenseType,
    amount,
    expense_date: date,
  } as never);

  if (error) {
    console.error("[admin] createExpense failed:", error.message);
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/expenses");
  revalidatePath("/admin/profit");
  return { status: "success", message: "Expense added." };
}

// ── Products ──────────────────────────────────────────────────────────
async function resolveCategoryId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  name: string
): Promise<string | null> {
  if (!name) return null;
  const { data } = await supabase
    .from("categories")
    .select("id")
    .ilike("name", name)
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (data?.id) return data.id;

  const { data: created } = await supabase
    .from("categories")
    .insert({ name, slug: slugify(name) } as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  return created?.id ?? null;
}

export async function createProductAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const sellingPrice = Number(formData.get("sellingPrice"));

  if (!name) return { status: "error", message: "Product name is required." };
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0)
    return { status: "error", message: "Enter a valid selling price." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);
  const sku =
    String(formData.get("sku") ?? "").trim() ||
    `SKU-${slug.slice(0, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const categoryName = String(formData.get("category") ?? "").trim();
  const num = (key: string) => {
    const n = Number(formData.get(key));
    return Number.isFinite(n) ? n : 0;
  };
  const compareRaw = Number(formData.get("comparePrice"));
  const specifications = String(formData.get("specifications") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const status =
    String(formData.get("status") ?? "published") === "draft"
      ? "draft"
      : "published";

  const categoryId = await resolveCategoryId(supabase, categoryName);

  const { error } = await supabase.from("products").insert({
    name,
    slug,
    sku,
    category_id: categoryId,
    cost_price: num("costPrice"),
    selling_price: sellingPrice,
    compare_price: Number.isFinite(compareRaw) && compareRaw > 0 ? compareRaw : null,
    stock_quantity: num("stockQuantity"),
    low_stock_limit: Number(formData.get("lowStockLimit")) || 5,
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    specifications,
    meta_title: String(formData.get("metaTitle") ?? "").trim() || null,
    meta_description: String(formData.get("metaDescription") ?? "").trim() || null,
    image_url: String(formData.get("imageUrl") ?? "").trim() || null,
    status,
  } as never);

  if (error) {
    console.error("[admin] createProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "A product with that slug or SKU already exists." };
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { status: "success", message: `“${name}” saved.` };
}

export async function updateProductAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const sellingPrice = Number(formData.get("sellingPrice"));

  if (!id) return { status: "error", message: "Missing product id." };
  if (!name) return { status: "error", message: "Product name is required." };
  if (!Number.isFinite(sellingPrice) || sellingPrice <= 0)
    return { status: "error", message: "Enter a valid selling price." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const categoryName = String(formData.get("category") ?? "").trim();
  const num = (key: string) => {
    const n = Number(formData.get(key));
    return Number.isFinite(n) ? n : 0;
  };
  const compareRaw = Number(formData.get("comparePrice"));
  const specifications = String(formData.get("specifications") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const status =
    String(formData.get("status") ?? "published") === "draft"
      ? "draft"
      : "published";
  const categoryId = await resolveCategoryId(supabase, categoryName);

  const updates: Record<string, unknown> = {
    name,
    slug,
    category_id: categoryId,
    cost_price: num("costPrice"),
    selling_price: sellingPrice,
    compare_price: Number.isFinite(compareRaw) && compareRaw > 0 ? compareRaw : null,
    stock_quantity: num("stockQuantity"),
    low_stock_limit: Number(formData.get("lowStockLimit")) || 5,
    short_description: String(formData.get("shortDescription") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim() || null,
    specifications,
    meta_title: String(formData.get("metaTitle") ?? "").trim() || null,
    meta_description: String(formData.get("metaDescription") ?? "").trim() || null,
    image_url: String(formData.get("imageUrl") ?? "").trim() || null,
    status,
  };
  // Only overwrite SKU if a value was provided.
  const sku = String(formData.get("sku") ?? "").trim();
  if (sku) updates.sku = sku;

  const { error } = await supabase
    .from("products")
    .update(updates as never)
    .eq("id", id);

  if (error) {
    console.error("[admin] updateProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "Another product already uses that slug or SKU." };
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  return { status: "success", message: `“${name}” updated.` };
}

export async function deleteProductAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) console.error("[admin] deleteProduct failed:", error.message);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

// ── Orders ────────────────────────────────────────────────────────────
export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase
    .from("orders")
    .update({ status } as never)
    .eq("id", id);

  if (error) {
    console.error("[admin] updateOrderStatus failed:", error.message);
    revalidatePath("/admin/orders");
    return;
  }

  // Notify the customer about the new status (WhatsApp Cloud API or simulated).
  const templateKey = templateForStatus(status);
  if (templateKey) {
    const { data } = await supabase
      .from("orders")
      .select("order_number, total, customers(name, phone)")
      .eq("id", id)
      .maybeSingle();

    const order = data as
      | {
          order_number: string;
          total: number;
          customers: { name: string | null; phone: string | null } | null;
        }
      | null;

    if (order) {
      await notifyOrder({
        orderId: id,
        orderNumber: order.order_number,
        customerName: order.customers?.name ?? "there",
        phone: order.customers?.phone ?? null,
        total: Number(order.total),
        templateKey,
      });
    }
  }

  revalidatePath("/admin/orders");
}

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
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    return { status: "error", message: "Enter a valid discount value." };
  }
  if (discountType === "percentage" && discountValue > 100) {
    return { status: "error", message: "Percentage discount cannot exceed 100%." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const { error } = await supabase.from("coupons").insert({
    code,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_discount_amount: maxDiscountAmount,
    active: formData.get("active") === "on",
    starts_at: nullableDate(formData.get("startsAt")),
    expires_at: nullableDate(formData.get("expiresAt")),
    usage_limit: usageLimit,
  } as never);

  if (error) {
    console.error("[admin] createCoupon failed:", error.message);
    if (error.code === "23505") {
      return { status: "error", message: "A coupon with this code already exists." };
    }
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/coupons");
  return { status: "success", message: `${code} coupon created.` };
}

export async function toggleCouponAction(formData: FormData) {
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
  const id = String(formData.get("couponId") ?? "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) console.error("[admin] deleteCoupon failed:", error.message);
  revalidatePath("/admin/coupons");
}
