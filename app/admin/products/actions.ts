"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { productSchema, type ProductFormInput } from "@/lib/validations/admin";

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

function generatedSlug(name: string) {
  return slugify(name) || `product-${Date.now().toString(36)}`;
}

function parseProductForm(formData: FormData) {
  return productSchema.safeParse({
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    sku: String(formData.get("sku") ?? ""),
    category: String(formData.get("category") ?? ""),
    costPrice: String(formData.get("costPrice") ?? ""),
    sellingPrice: String(formData.get("sellingPrice") ?? ""),
    comparePrice: String(formData.get("comparePrice") ?? ""),
    stockQuantity: String(formData.get("stockQuantity") ?? ""),
    lowStockLimit: String(formData.get("lowStockLimit") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    gallery: String(formData.get("gallery") ?? ""),
    shortDescription: String(formData.get("shortDescription") ?? ""),
    description: String(formData.get("description") ?? ""),
    specifications: String(formData.get("specifications") ?? ""),
    metaTitle: String(formData.get("metaTitle") ?? ""),
    metaDescription: String(formData.get("metaDescription") ?? ""),
    status: String(formData.get("status") ?? "published"),
    featured: formData.get("featured") === "true",
    isNew: formData.get("isNew") === "true",
    bestSeller: formData.get("bestSeller") === "true",
  });
}

function productPayload(
  data: ProductFormInput,
  categoryId: string | null,
  slug: string
) {
  const specifications = data.specifications
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return {
    name: data.name,
    slug,
    category_id: categoryId,
    cost_price: Number(data.costPrice || 0),
    selling_price: Number(data.sellingPrice),
    compare_price: data.comparePrice ? Number(data.comparePrice) : null,
    stock_quantity: Number(data.stockQuantity || 0),
    low_stock_limit: data.lowStockLimit === "" ? 5 : Number(data.lowStockLimit),
    short_description: data.shortDescription || null,
    description: data.description.trim() || null,
    specifications,
    meta_title: data.metaTitle || null,
    meta_description: data.metaDescription || null,
    image_url: data.imageUrl || null,
    status: data.status,
    featured: data.featured,
    is_new: data.isNew,
    best_seller: data.bestSeller,
  };
}

async function resolveCategoryId(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  name: string
): Promise<{ id: string | null; error?: string }> {
  if (!name) return { id: null };
  const { data, error } = await supabase
    .from("categories")
    .select("id")
    .eq("name", name)
    .limit(1)
    .maybeSingle<{ id: string }>();
  if (error) return { id: null, error: error.message };
  if (data?.id) return { id: data.id };

  const { data: created, error: createError } = await supabase
    .from("categories")
    .insert({ name, slug: generatedSlug(name) } as never)
    .select("id")
    .maybeSingle<{ id: string }>();
  return createError
    ? { id: null, error: createError.message }
    : { id: created?.id ?? null };
}

function extractStoragePath(url: string) {
  const marker = `/${IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

async function deleteUnusedStorageImages(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  urls: string[]
) {
  for (const url of [...new Set(urls.filter(Boolean))]) {
    const path = extractStoragePath(url);
    if (!path) continue;
    const [gallery, products, categories] = await Promise.all([
      supabase.from("product_images").select("id").eq("image_url", url).limit(1),
      supabase.from("products").select("id").eq("image_url", url).limit(1),
      supabase.from("categories").select("id").eq("image_url", url).limit(1),
    ]);
    if (gallery.data?.length || products.data?.length || categories.data?.length) continue;
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) console.error("[admin] product image cleanup failed:", error.message);
  }
}

async function syncProductImages(
  supabase: NonNullable<ReturnType<typeof getSupabaseServerClient>>,
  productId: string,
  imageUrl: string,
  galleryRaw: string
) {
  const { data: currentRows, error: readError } = await supabase
    .from("product_images")
    .select("image_url, sort_order")
    .eq("product_id", productId)
    .order("sort_order");
  if (readError) return { ok: false as const, error: readError.message, removed: [] as string[], previous: [] as string[] };

  const previous = ((currentRows ?? []) as Array<{ image_url: string; sort_order: number }>);
  const lines = galleryRaw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const ordered: string[] = [];
  for (const url of [imageUrl.trim(), ...lines]) {
    if (url && !ordered.includes(url)) ordered.push(url);
  }

  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (deleteError) return { ok: false as const, error: deleteError.message, removed: [] as string[], previous: previous.map((row) => row.image_url) };

  if (ordered.length === 0) {
    return {
      ok: true as const,
      removed: previous.map((row) => row.image_url),
      previous: previous.map((row) => row.image_url),
    };
  }

  const { error } = await supabase.from("product_images").insert(
    ordered.map((url, index) => ({
      product_id: productId,
      image_url: url,
      sort_order: index,
    })) as never
  );
  if (error) {
    if (previous.length) {
      await supabase.from("product_images").insert(
        previous.map((row) => ({
          product_id: productId,
          image_url: row.image_url,
          sort_order: row.sort_order,
        })) as never
      );
    }
    console.error("[admin] syncProductImages failed:", error.message);
    return { ok: false as const, error: error.message, removed: [] as string[], previous: previous.map((row) => row.image_url) };
  }

  return {
    ok: true as const,
    removed: previous
      .map((row) => row.image_url)
      .filter((url) => !ordered.includes(url)),
    previous: previous.map((row) => row.image_url),
  };
}

export async function createProductAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the product details.",
    };
  }
  const input = parsed.data;

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const slug = input.slug || generatedSlug(input.name);
  const sku = input.sku ||
    `SKU-${slug.slice(0, 8).toUpperCase()}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const category = await resolveCategoryId(supabase, input.category);
  if (category.error) {
    return { status: "error", message: `Could not resolve category: ${category.error}` };
  }

  const { data: created, error } = await supabase
    .from("products")
    .insert({
      sku,
      ...productPayload(input, category.id, slug),
    } as never)
    .select("id")
    .single<{ id: string }>();

  if (error) {
    console.error("[admin] createProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "A product with that slug or SKU already exists." };
    return { status: "error", message: error.message };
  }

  if (created?.id) {
    const gallery = await syncProductImages(
      supabase,
      created.id,
      input.imageUrl,
      input.gallery
    );
    if (!gallery.ok) {
      await supabase.from("products").delete().eq("id", created.id);
      await deleteUnusedStorageImages(supabase, [
        input.imageUrl,
        ...input.gallery.split("\n").map((url) => url.trim()),
      ]);
      return {
        status: "error",
        message: `Product was not saved because its gallery failed: ${gallery.error}`,
      };
    }
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/products/${slug}`);
  return { status: "success", message: `"${input.name}" saved.` };
}

export async function updateProductAction(
  _prev: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { status: "error", message: "Missing product id." };
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check the product details.",
    };
  }
  const input = parsed.data;

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const { data: existing, error: existingError } = await supabase
    .from("products")
    .select("slug, sku, image_url")
    .eq("id", id)
    .maybeSingle();
  if (existingError || !existing) {
    return { status: "error", message: existingError?.message ?? "Product not found." };
  }
  const oldProduct = existing as { slug: string; sku: string; image_url: string | null };
  const slug = input.slug || generatedSlug(input.name);
  const category = await resolveCategoryId(supabase, input.category);
  if (category.error) {
    return { status: "error", message: `Could not resolve category: ${category.error}` };
  }

  const updates: Record<string, unknown> = productPayload(input, category.id, slug);
  updates.sku = input.sku || oldProduct.sku;

  const gallery = await syncProductImages(
    supabase,
    id,
    input.imageUrl,
    input.gallery
  );
  if (!gallery.ok) {
    return {
      status: "error",
      message: `Product was not updated because its gallery failed: ${gallery.error}`,
    };
  }

  const { error } = await supabase.from("products").update(updates as never).eq("id", id);

  if (error) {
    await syncProductImages(
      supabase,
      id,
      oldProduct.image_url ?? "",
      gallery.previous
        .filter((url) => url !== oldProduct.image_url)
        .join("\n")
    );
    const requestedUrls = [
      input.imageUrl,
      ...input.gallery.split("\n").map((url) => url.trim()),
    ];
    await deleteUnusedStorageImages(
      supabase,
      requestedUrls.filter((url) => !gallery.previous.includes(url))
    );
    console.error("[admin] updateProduct failed:", error.message);
    if (error.code === "23505")
      return { status: "error", message: "Another product already uses that slug or SKU." };
    return { status: "error", message: error.message };
  }

  await deleteUnusedStorageImages(supabase, [
    ...gallery.removed,
    ...(oldProduct.image_url && oldProduct.image_url !== input.imageUrl
      ? [oldProduct.image_url]
      : []),
  ]);

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  revalidatePath(`/products/${oldProduct.slug}`);
  revalidatePath(`/products/${slug}`);
  return { status: "success", message: `"${input.name}" updated.` };
}

function revalidateProductSurfaces(slug?: string) {
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath("/");
  if (slug) revalidatePath(`/products/${slug}`);
}

export async function setProductStockAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const rawStock = String(formData.get("stockQuantity") ?? "").trim();
  const stock = Number(rawStock);
  if (!id) return { status: "error", message: "Missing product id." };
  if (!rawStock || !Number.isInteger(stock) || stock < 0) {
    return { status: "error", message: "Stock must be a whole number of zero or more." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const { data, error } = await supabase
    .from("products")
    .update({ stock_quantity: stock } as never)
    .eq("id", id)
    .select("name, slug")
    .maybeSingle();
  if (error || !data) {
    return { status: "error", message: error?.message ?? "Product not found." };
  }
  const product = data as { name: string; slug: string };
  revalidateProductSurfaces(product.slug);
  return { status: "success", message: `${product.name} stock updated to ${stock}.` };
}

export async function toggleProductStatusAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  if (!id || !["draft", "published"].includes(status)) {
    return { status: "error", message: "Invalid product status." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  if (status === "published") {
    const { data: product } = await supabase
      .from("products")
      .select("image_url, description")
      .eq("id", id)
      .maybeSingle();
    const row = product as { image_url?: string | null; description?: string | null } | null;
    if (!row?.image_url || !row.description?.trim()) {
      return {
        status: "error",
        message: "Add a main image and description before publishing.",
      };
    }
  }
  const { data, error } = await supabase
    .from("products")
    .update({ status } as never)
    .eq("id", id)
    .select("name, slug")
    .maybeSingle();
  if (error || !data) {
    return { status: "error", message: error?.message ?? "Product not found." };
  }
  const product = data as { name: string; slug: string };
  revalidateProductSurfaces(product.slug);
  return {
    status: "success",
    message: `${product.name} is now ${status}.`,
  };
}

export async function duplicateProductAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Missing product id." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };
  const [productResult, imagesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("image_url, sort_order")
      .eq("product_id", id).order("sort_order"),
  ]);
  if (productResult.error || !productResult.data) {
    return { status: "error", message: productResult.error?.message ?? "Product not found." };
  }
  if (imagesResult.error) {
    return { status: "error", message: `Could not read product gallery: ${imagesResult.error.message}` };
  }
  const source = productResult.data as Record<string, unknown>;
  const suffix = Date.now().toString(36).slice(-5);
  const name = `${String(source.name)} (Copy)`;
  const { data: created, error } = await supabase.from("products").insert({
    category_id: source.category_id,
    name,
    slug: `${String(source.slug)}-copy-${suffix}`,
    sku: `${String(source.sku).slice(0, 68)}-COPY-${suffix.toUpperCase()}`,
    cost_price: source.cost_price,
    selling_price: source.selling_price,
    compare_price: source.compare_price,
    stock_quantity: 0,
    low_stock_limit: source.low_stock_limit,
    short_description: source.short_description,
    description: source.description,
    specifications: source.specifications,
    meta_title: source.meta_title,
    meta_description: source.meta_description,
    status: "draft",
    featured: false,
    is_new: false,
    best_seller: false,
    rating: 0,
    reviews_count: 0,
    image_url: source.image_url,
  } as never).select("id").single();
  if (error || !created) {
    return { status: "error", message: error?.message ?? "Could not duplicate product." };
  }
  const images = (imagesResult.data ?? []) as Array<{ image_url: string; sort_order: number }>;
  if (images.length) {
    const { error: imageError } = await supabase.from("product_images").insert(
      images.map((image) => ({
        product_id: (created as { id: string }).id,
        image_url: image.image_url,
        sort_order: image.sort_order,
      })) as never
    );
    if (imageError) {
      await supabase.from("products").delete().eq("id", (created as { id: string }).id);
      return { status: "error", message: `Could not copy gallery: ${imageError.message}` };
    }
  }
  revalidateProductSurfaces();
  return { status: "success", message: `${name} created as a draft with zero stock.` };
}

export async function deleteProductAction(
  _previous: AdminActionState,
  formData: FormData
): Promise<AdminActionState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { status: "error", message: "Missing product id." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const [productResult, imagesResult] = await Promise.all([
    supabase.from("products").select("name, slug, image_url").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("image_url").eq("product_id", id),
  ]);
  if (productResult.error || !productResult.data) {
    return { status: "error", message: productResult.error?.message ?? "Product not found." };
  }
  const product = productResult.data as { name: string; slug: string; image_url: string | null };
  const imageUrls = [
    product.image_url ?? "",
    ...((imagesResult.data ?? []) as Array<{ image_url: string }>).map((image) => image.image_url),
  ];

  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    console.error("[admin] deleteProduct failed:", error.message);
    return { status: "error", message: error.message };
  }

  await deleteUnusedStorageImages(supabase, imageUrls);
  revalidateProductSurfaces(product.slug);
  return { status: "success", message: `${product.name} deleted.` };
}
