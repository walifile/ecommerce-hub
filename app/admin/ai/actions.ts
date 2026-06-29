"use server";

import { generateProductContent } from "@/lib/ai";

export async function generateProductContentAction(
  productName: string,
  category?: string
) {
  return generateProductContent(productName, category);
}
