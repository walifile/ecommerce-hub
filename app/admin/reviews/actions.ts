"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { moderateProductReview, removeProductReview } from "@/lib/review-store";

export async function moderateReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("reviewId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["approved", "rejected"].includes(status)) return;
  const result = await moderateProductReview(id, status as "approved" | "rejected");
  revalidatePath("/admin/reviews");
  if (result.ok && "productSlug" in result && result.productSlug) {
    revalidatePath(`/products/${result.productSlug}`);
  }
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("reviewId") ?? "");
  if (!id) return;
  await removeProductReview(id);
  revalidatePath("/admin/reviews");
}
