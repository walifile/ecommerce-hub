"use server";

import { generateProductContent } from "@/lib/ai";
import { requireAdmin } from "@/lib/auth";

export async function generateProductContentAction(
  productName: string,
  category?: string
) {
  await requireAdmin();
  return generateProductContent(productName, category);
}
