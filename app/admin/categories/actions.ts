"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { categorySchema } from "@/lib/validations/admin";

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";
const IMAGE_BUCKET = "product-images";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function generatedSlug(name: string) {
  return slugify(name) || `category-${Date.now().toString(36)}`;
}

function parseCategoryForm(formData: FormData) {
  return categorySchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
  });
}

function extractStoragePath(url: string): string | null {
  const marker = `/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

async function deleteUnusedStorageImage(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  url: string
) {
  const path = extractStoragePath(url);
  if (!path) return;
  const [categories, products, gallery] = await Promise.all([
    supabase.from("categories").select("id").eq("image_url", url).limit(1),
    supabase.from("products").select("id").eq("image_url", url).limit(1),
    supabase.from("product_images").select("id").eq("image_url", url).limit(1),
  ]);
  if (categories.data?.length || products.data?.length || gallery.data?.length) return;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
  if (error) console.error("[admin] category image cleanup failed:", error.message);
}

function revalidateCategorySurfaces() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
}

async function categoryConflict(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  name: string,
  slug: string,
  excludedId?: string
) {
  const { data, error } = await supabase.from("categories").select("id, name, slug");
  if (error) return { error: error.message };
  const normalizedName = name.toLocaleLowerCase();
  const duplicate = (data as Array<{ id: string; name: string; slug: string }> | null)?.find(
    (category) =>
      category.id !== excludedId &&
      (category.slug === slug || category.name.toLocaleLowerCase() === normalizedName)
  );
  return { duplicate };
}

export async function createCategoryAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the category details." };
  }
  const input = parsed.data;
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const slug = input.slug || generatedSlug(input.name);
  const conflict = await categoryConflict(supabase, input.name, slug);
  if (conflict.error) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    return { status: "error", message: conflict.error };
  }
  if (conflict.duplicate) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    return { status: "error", message: "A category with that name or slug already exists." };
  }
  const { error } = await supabase.from("categories").insert({
    name: input.name,
    slug,
    description: input.description || null,
    image_url: input.imageUrl || null,
  } as never);
  if (error) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    console.error("[admin] createCategory failed:", error.message);
    if (error.code === "23505") {
      return { status: "error", message: "A category with that name or slug already exists." };
    }
    return { status: "error", message: error.message };
  }
  revalidateCategorySurfaces();
  return { status: "success", message: `"${input.name}" category created.` };
}

export async function updateCategoryAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Missing category id." };
  const parsed = parseCategoryForm(formData);
  if (!parsed.success) {
    return { status: "error", message: parsed.error.issues[0]?.message ?? "Check the category details." };
  }
  const input = parsed.data;
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data: existing, error: readError } = await supabase
    .from("categories").select("image_url").eq("id", id)
    .maybeSingle<{ image_url: string | null }>();
  if (readError || !existing) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    return { status: "error", message: readError?.message ?? "Category not found." };
  }
  const slug = input.slug || generatedSlug(input.name);
  const conflict = await categoryConflict(supabase, input.name, slug, id);
  if (conflict.error) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    return { status: "error", message: conflict.error };
  }
  if (conflict.duplicate) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    return { status: "error", message: "Another category already uses that name or slug." };
  }
  const { data: updated, error } = await supabase.from("categories").update({
    name: input.name,
    slug,
    description: input.description || null,
    image_url: input.imageUrl || null,
  } as never).eq("id", id).select("id").maybeSingle();
  if (error || !updated) {
    if (formData.get("uploadedImage") === "true") {
      await deleteUnusedStorageImage(supabase, input.imageUrl);
    }
    console.error("[admin] updateCategory failed:", error?.message);
    if (error?.code === "23505") {
      return { status: "error", message: "Another category already uses that name or slug." };
    }
    return { status: "error", message: error?.message ?? "Category not found." };
  }
  if (existing.image_url && existing.image_url !== input.imageUrl) {
    await deleteUnusedStorageImage(supabase, existing.image_url);
  }
  revalidateCategorySurfaces();
  return { status: "success", message: `"${input.name}" updated.` };
}

export async function deleteCategoryAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("categoryId") ?? "").trim();
  if (!id) return { status: "error", message: "Missing category id." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const [categoryResult, productsResult] = await Promise.all([
    supabase.from("categories").select("name, image_url").eq("id", id).maybeSingle(),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("category_id", id),
  ]);
  if (categoryResult.error || !categoryResult.data) {
    return { status: "error", message: categoryResult.error?.message ?? "Category not found." };
  }
  if (productsResult.error) return { status: "error", message: productsResult.error.message };
  const category = categoryResult.data as { name: string; image_url: string | null };
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteCategory failed:", error.message);
    return { status: "error", message: error.message };
  }
  if (category.image_url) await deleteUnusedStorageImage(supabase, category.image_url);
  revalidateCategorySurfaces();
  const affected = productsResult.count ?? 0;
  return {
    status: "success",
    message: affected
      ? `${category.name} deleted; ${affected} product${affected === 1 ? " is" : "s are"} now uncategorized.`
      : `${category.name} deleted.`,
  };
}
