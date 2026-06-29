"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

async function syncProductImages(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  productId: string,
  imageUrl: string,
  galleryRaw: string
) {
  const lines = galleryRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ordered: string[] = [];
  for (const url of [imageUrl.trim(), ...lines]) {
    if (url && !ordered.includes(url)) ordered.push(url);
  }

  await supabase.from("product_images").delete().eq("product_id", productId);
  if (ordered.length === 0) return;

  const { error } = await supabase.from("product_images").insert(
    ordered.map((url, index) => ({
      product_id: productId,
      image_url: url,
      sort_order: index,
    })) as never
  );
  if (error) console.error("[admin] syncProductImages failed:", error.message);
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

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
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
    String(formData.get("status") ?? "published") === "draft" ? "draft" : "published";

  const categoryId = await resolveCategoryId(supabase, categoryName);
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();

  const { data: created, error } = await supabase
    .from("products")
    .insert({
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
      image_url: imageUrl || null,
      status,
    } as never)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (error) {
    console.error("[admin] createProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "A product with that slug or SKU already exists." };
    return { status: "error", message: error.message };
  }

  if (created?.id) {
    await syncProductImages(supabase, created.id, imageUrl, String(formData.get("gallery") ?? ""));
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { status: "success", message: `"${name}" saved.` };
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
    String(formData.get("status") ?? "published") === "draft" ? "draft" : "published";
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
  const sku = String(formData.get("sku") ?? "").trim();
  if (sku) updates.sku = sku;

  const { error } = await supabase.from("products").update(updates as never).eq("id", id);

  if (error) {
    console.error("[admin] updateProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "Another product already uses that slug or SKU." };
    return { status: "error", message: error.message };
  }

  await syncProductImages(
    supabase,
    id,
    String(formData.get("imageUrl") ?? "").trim(),
    String(formData.get("gallery") ?? "")
  );

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/products/${slug}`);
  return { status: "success", message: `"${name}" updated.` };
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
