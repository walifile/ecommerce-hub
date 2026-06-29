"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

const IMAGE_BUCKET = "product-images";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractStoragePath(url: string): string | null {
  const marker = `/${IMAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0]);
}

async function deleteStorageImage(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  url: string
) {
  const path = extractStoragePath(url);
  if (!path) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) console.error("[admin] deleteStorageImage failed:", error.message);
}

export async function createCategoryAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { status: "error", message: "Category name is required." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: String(formData.get("description") ?? "").trim() || null,
    image_url: String(formData.get("imageUrl") ?? "").trim() || null,
  } as never);

  if (error) {
    console.error("[admin] createCategory failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "A category with that name or slug already exists." };
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { status: "success", message: `"${name}" category created.` };
}

export async function updateCategoryAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { status: "error", message: "Missing category id." };
  if (!name) return { status: "error", message: "Category name is required." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const slug = String(formData.get("slug") ?? "").trim() || slugify(name);
  const newImageUrl = String(formData.get("imageUrl") ?? "").trim() || null;

  const { data: existing } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle<{ image_url: string | null }>();

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description: String(formData.get("description") ?? "").trim() || null,
      image_url: newImageUrl,
    } as never)
    .eq("id", id);

  if (error) {
    console.error("[admin] updateCategory failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "Another category already uses that name or slug." };
    return { status: "error", message: error.message };
  }

  const oldImageUrl = existing?.image_url ?? "";
  if (oldImageUrl && oldImageUrl !== newImageUrl) {
    await deleteStorageImage(supabase, oldImageUrl);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { status: "success", message: `"${name}" updated.` };
}

export async function deleteCategoryAction(formData: FormData) {
  const id = String(formData.get("categoryId") ?? "");
  if (!id) return;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { data: existing } = await supabase
    .from("categories")
    .select("image_url")
    .eq("id", id)
    .maybeSingle<{ image_url: string | null }>();

  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteCategory failed:", error.message);
  } else if (existing?.image_url) {
    await deleteStorageImage(supabase, existing.image_url);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
