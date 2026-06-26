"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

  if (error) console.error("[admin] updateOrderStatus failed:", error.message);
  revalidatePath("/admin/orders");
}
