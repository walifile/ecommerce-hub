"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { moderateProductReview, removeProductReview } from "@/lib/review-store";

export type ReviewAdminState = {
  status: "idle" | "success" | "error";
  message: string;
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function refreshReviewSurfaces(productSlug?: string) {
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  revalidatePath("/shop");
  if (productSlug) revalidatePath(`/products/${productSlug}`);
}

export async function moderateReviewAction(
  _previous: ReviewAdminState,
  formData: FormData
): Promise<ReviewAdminState> {
  await requireAdmin();
  const id = String(formData.get("reviewId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  const moderationNote = String(formData.get("moderationNote") ?? "").trim();
  if (!UUID_PATTERN.test(id) || !["approved", "rejected"].includes(status)) {
    return { status: "error", message: "Invalid review request." };
  }
  if (moderationNote.length > 500) {
    return { status: "error", message: "Moderation note must be 500 characters or less." };
  }
  const result = await moderateProductReview(id, status as "approved" | "rejected", moderationNote);
  if (!result.ok) return { status: "error", message: result.error || "Could not update review." };
  refreshReviewSurfaces(result.productSlug);
  return {
    status: "success",
    message: status === "approved" ? "Review approved and published." : "Review rejected.",
  };
}

export async function deleteReviewAction(
  _previous: ReviewAdminState,
  formData: FormData
): Promise<ReviewAdminState> {
  await requireAdmin();
  const id = String(formData.get("reviewId") ?? "").trim();
  if (!UUID_PATTERN.test(id)) return { status: "error", message: "Invalid review request." };
  const result = await removeProductReview(id);
  if (!result.ok) return { status: "error", message: result.error || "Could not delete review." };
  refreshReviewSurfaces(result.productSlug);
  return { status: "success", message: "Review permanently deleted." };
}
