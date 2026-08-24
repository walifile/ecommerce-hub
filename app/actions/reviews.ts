"use server";

import { revalidatePath } from "next/cache";
import { createProductReview } from "@/lib/review-store";

export type ReviewState = { status: "idle" | "success" | "error"; message: string };

export async function submitReviewAction(
  _previous: ReviewState,
  formData: FormData
): Promise<ReviewState> {
  const productId = String(formData.get("productId") ?? "").trim();
  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const reviewerName = String(formData.get("reviewerName") ?? "").trim();
  const reviewerEmail = String(formData.get("reviewerEmail") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const rating = Number(formData.get("rating"));
  if (!productId || !reviewerName || body.length < 10 || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { status: "error", message: "Add your name, rating, and a review of at least 10 characters." };
  }
  if (reviewerName.length > 80 || body.length > 1500 || title.length > 120) {
    return { status: "error", message: "Review content is too long." };
  }
  const result = await createProductReview({
    productId,
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
