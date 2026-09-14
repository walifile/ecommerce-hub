import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const REVIEWS_PATH = "reviews/product-reviews.json";

export type StoredProductReview = {
  id: string;
  productId: string;
  orderId: string;
  customerId: string;
  productName: string;
  productSlug: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
  status: "pending" | "approved" | "rejected";
  verifiedPurchase: boolean;
  moderationNote: string;
  createdAt: string;
};

type ReviewMutationResult =
  | { ok: true; productId: string; productSlug: string }
  | { ok: false; error: string };

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
        order_id: string | null;
        customer_id: string | null;
        reviewer_name: string;
        reviewer_email: string | null;
        rating: number;
        title: string | null;
        body: string;
        status: "pending" | "approved" | "rejected";
        verified_purchase: boolean | null;
        moderation_note: string | null;
        created_at: string;
        products?: { name?: string; slug?: string } | null;
      }>).map((row) => ({
        id: row.id,
        productId: row.product_id,
        orderId: row.order_id ?? "",
        customerId: row.customer_id ?? "",
        productName: row.products?.name ?? "Deleted product",
        productSlug: row.products?.slug ?? "",
        reviewerName: row.reviewer_name,
        reviewerEmail: row.reviewer_email ?? "",
        rating: row.rating,
        title: row.title ?? "",
        body: row.body,
        status: row.status,
        verifiedPurchase: row.verified_purchase ?? false,
        moderationNote: row.moderation_note ?? "",
        createdAt: row.created_at,
      }));
    }
    if (!isMissingTable(error)) console.error("[reviews] database read failed:", error.message);
  }
  const rows = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  return rows
    .map((row) => ({
      ...row,
      orderId: row.orderId ?? "",
      customerId: row.customerId ?? "",
      verifiedPurchase: row.verifiedPurchase ?? false,
      moderationNote: row.moderationNote ?? "",
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createProductReview(input: {
  productId: string;
  orderId: string;
  customerId: string;
  reviewerName: string;
  reviewerEmail: string;
  rating: number;
  title: string;
  body: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { error } = await supabase.from("product_reviews" as never).insert({
    product_id: input.productId,
    order_id: input.orderId,
    customer_id: input.customerId,
    reviewer_name: input.reviewerName,
    reviewer_email: input.reviewerEmail || null,
    rating: input.rating,
    title: input.title || null,
    body: input.body,
    status: "pending",
    verified_purchase: true,
  } as never);
  if (!error) return { ok: true };
  if (error.code === "23505") {
    return { ok: false, error: "You have already reviewed this product." };
  }
  if (isMissingTable(error) || error.code === "PGRST204" || error.code === "42703") {
    return { ok: false, error: "Review security update is not deployed yet. Please try again later." };
  }
  console.error("[reviews] database insert failed:", error.message);
  return { ok: false, error: "Could not submit your review." };
}

export async function moderateProductReview(
  id: string,
  status: "approved" | "rejected",
  moderationNote = ""
): Promise<ReviewMutationResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { data, error } = await supabase
    .from("product_reviews" as never)
    .update({ status, moderation_note: moderationNote || null } as never)
    .eq("id", id)
    .select("product_id, products(slug)")
    .maybeSingle();
  if (!error) {
    const row = data as unknown as { product_id?: string; products?: { slug?: string } | null } | null;
    if (!row) return { ok: false, error: "Review not found." };
    return { ok: true, productId: row?.product_id ?? "", productSlug: row?.products?.slug ?? "" };
  }
  if (!isMissingTable(error)) return { ok: false, error: error.message };

  const reviews = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  const review = reviews.find((item) => item.id === id);
  if (!review) return { ok: false, error: "Review not found." };
  review.status = status;
  review.moderationNote = moderationNote;
  const saved = await writeCompatJson(REVIEWS_PATH, reviews);
  if (!saved.ok) return { ok: false, error: saved.error || "Could not save review." };

  await syncFallbackSummary(review.productId, reviews);
  return { ok: true, productId: review.productId, productSlug: review.productSlug };
}

export async function removeProductReview(id: string): Promise<ReviewMutationResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Reviews are not configured." };
  const { data, error } = await supabase
    .from("product_reviews" as never)
    .delete()
    .eq("id", id)
    .select("product_id, products(slug)")
    .maybeSingle();
  if (!error) {
    const row = data as unknown as { product_id?: string; products?: { slug?: string } | null } | null;
    if (!row) return { ok: false, error: "Review not found." };
    return { ok: true, productId: row.product_id ?? "", productSlug: row.products?.slug ?? "" };
  }
  if (!isMissingTable(error)) return { ok: false, error: error.message };
  const reviews = await readCompatJson<StoredProductReview[]>(REVIEWS_PATH, []);
  const review = reviews.find((item) => item.id === id);
  if (!review) return { ok: false, error: "Review not found." };
  const remaining = reviews.filter((item) => item.id !== id);
  const saved = await writeCompatJson(REVIEWS_PATH, remaining);
  if (!saved.ok) return { ok: false, error: saved.error || "Could not delete review." };
  await syncFallbackSummary(review.productId, remaining);
  return { ok: true, productId: review.productId, productSlug: review.productSlug };
}
