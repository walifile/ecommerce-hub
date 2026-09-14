"use server";

import { revalidatePath } from "next/cache";
import { createProductReview } from "@/lib/review-store";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type ReviewState = { status: "idle" | "success" | "error"; message: string };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ORDER_NUMBER_PATTERN = /^[a-z0-9-]{3,40}$/i;

function comparablePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 7 ? digits.slice(-10) : "";
}

export async function submitReviewAction(
  _previous: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const productId = String(formData.get("productId") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim().toUpperCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const reviewerName = String(formData.get("reviewerName") ?? "").trim();
  const reviewerEmail = String(formData.get("reviewerEmail") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating"));
  if (!UUID_PATTERN.test(productId) || !productSlug || !reviewerName || body.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Add your name, rating, and a review of at least 10 characters." };
  }
  if (reviewerName.length > 80 || body.length > 1500 || title.length > 120 || reviewerEmail.length > 254) {
    return { status: "error", message: "Review content is too long." };
  }
  if (reviewerEmail && !EMAIL_PATTERN.test(reviewerEmail)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (!ORDER_NUMBER_PATTERN.test(orderNumber) || !comparablePhone(phone)) {
    return { status: "error", message: "Enter the order number and phone used at checkout." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Reviews are not configured." };

  const [{ data: product, error: productError }, { data: order, error: orderError }] = await Promise.all([
    supabase
      .from("products")
      .select("id, slug, status")
      .eq("id", productId)
      .eq("slug", productSlug)
      .eq("status", "published")
      .maybeSingle(),
    supabase
      .from("orders")
      .select("id, customer_id, status, customers(phone), order_items(product_id)")
      .eq("order_number", orderNumber)
      .maybeSingle(),
  ]);
  if (productError || orderError) {
    console.error("[reviews] purchase verification failed:", productError?.message ?? orderError?.message);
    return { status: "error", message: "Could not verify this purchase. Please try again." };
  }
  type VerifiedOrder = {
    id: string;
    customer_id: string | null;
    status: string;
    customers: { phone: string | null } | null;
    order_items: Array<{ product_id: string | null }>;
  };
  const verifiedOrder = order as unknown as VerifiedOrder | null;
  const phoneMatches = comparablePhone(verifiedOrder?.customers?.phone ?? "") === comparablePhone(phone);
  const containsProduct = verifiedOrder?.order_items?.some((item) => item.product_id === productId) ?? false;
  if (!product || !verifiedOrder?.customer_id || verifiedOrder.status !== "delivered" || !phoneMatches || !containsProduct) {
    return {
      status: "error",
      message: "These details do not match a delivered order containing this product.",
    };
  }

  const result = await createProductReview({
    productId,
    orderId: verifiedOrder.id,
    customerId: verifiedOrder.customer_id,
    reviewerName,
    reviewerEmail,
    rating,
    title,
    body,
  });
  if (!result.ok) return { status: "error", message: result.error || "Could not submit your review." };
  if (productSlug) revalidatePath(`/products/${productSlug}`);
  return { status: "success", message: "Thanks! Your review is awaiting approval." };
}
