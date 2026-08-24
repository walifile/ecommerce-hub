import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const REVIEWS_PATH = "reviews/product-reviews.json";

export type StoredProductReview = {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

function isMissingTable(error: { code?: string; message?: string } | null) {
  return error?.code === "PGRST205" || /product_reviews.*schema cache/i.test(error?.message ?? "");
}

async function syncFallbackSummary(
  productId: string,
  reviews: StoredProductReview[]
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const approved = reviews.filter(
    (item) => item.productId === productId && item.status === "approved"
  );
  const rating = approved.length
    ? approved.reduce((sum, item) => sum + item.rating, 0) / approved.length
    : 0;
  await supabase
    .from("products")
    .update({ rating: Number(rating.toFixed(2)), reviews_count: approved.length } as never)
    .eq("id", productId);
}

export async function listAllProductReviews(): Promise<StoredProductReview[]> {
  const supabase = getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("product_reviews" as never)
      .select("*, products(name, slug)")
      .order("created_at", { ascending: false });
    if (!error) {
      return ((data ?? []) as unknown as Array<{
        id: string;
        product_id: string;
        reviewer_name: string;
        reviewer_email: string | null;
        rating: number;
        title: string | null;
        body: string;
        status: "pending" | "approved" | "rejected";
        created_at: string;
        products?: { name?: string; slug?: string } | null;
      }>).map((row) => ({
        id: row.id,
        productId: row.product_id,
        productName: row.products?.name ?? "Deleted product",
        productSlug: row.products?.slug ?? "",
        reviewerName: row.reviewer_name,
        reviewerEmail: row.reviewer_email ?? "",
        rating: row.rating,
        title: row.title ?? "",
        body: row.body,
        status: row.status,
        createdAt: row.created_at,
      }));
    }
    if (!isMissingTable(error)) console.error("[reviews] database read failed:", error.message);
  }
  const rows = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  return rows.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createProductReview(input: {
  productId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { error } = await supabase.from("product_reviews" as never).insert({
    product_id: input.productId,
    reviewer_name: input.reviewerName,
    reviewer_email: input.reviewerEmail || null,
    rating: input.rating,
    title: input.title || null,
    body: input.body,
    status: "pending",
  } as never);
  if (!error) return { ok: true };
  if (!isMissingTable(error)) return { ok: false, error: error.message };

  const { data: product } = await supabase
    .from("products")
    .select("name, slug")
    .eq("id", input.productId)
    .maybeSingle();
  if (!product) return { ok: false, error: "Product not found." };
  const productRow = product as { name: string; slug: string };
  const reviews = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  reviews.push({
    id: crypto.randomUUID(),
    productId: input.productId,
    productName: productRow.name,
    productSlug: productRow.slug,
    reviewerName: input.reviewerName,
    reviewerEmail: input.reviewerEmail,
    rating: input.rating,
    title: input.title,
    body: input.body,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  return writeCompatJson(REVIEWS_PATH, reviews);
}

export async function moderateProductReview(
  id: string,
  status: "approved" | "rejected"
) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { data, error } = await supabase
    .from("product_reviews" as never)
    .update({ status } as never)
    .eq("id", id)
    .select("product_id, products(slug)")
    .maybeSingle();
  if (!error) {
    const row = data as unknown as { product_id?: string; products?: { slug?: string } | null } | null;
    return { ok: true, productId: row?.product_id ?? "", productSlug: row?.products?.slug ?? "" };
  }
  if (!isMissingTable(error)) return { ok: false, error: error.message };

  const reviews = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  const review = reviews.find((item) => item.id === id);
  if (!review) return { ok: false, error: "Review not found." };
  review.status = status;
  const saved = await writeCompatJson(REVIEWS_PATH, reviews);
  if (!saved.ok) return saved;

  await syncFallbackSummary(review.productId, reviews);
  return { ok: true, productId: review.productId, productSlug: review.productSlug };
}

export async function removeProductReview(id: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { error } = await supabase.from("product_reviews" as never).delete().eq("id", id);
  if (!error) return { ok: true };
  if (!isMissingTable(error)) return { ok: false, error: error.message };
  const reviews = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  const review = reviews.find((item) => item.id === id);
  const remaining = reviews.filter((item) => item.id !== id);
  const saved = await writeCompatJson(REVIEWS_PATH, remaining);
  if (saved.ok && review) await syncFallbackSummary(review.productId, remaining);
  return saved;
}
