"use server";

import { revalidatePath } from "next/cache";
import { updateStoreTheme } from "@/lib/ecommerce-data";
import { resolveTheme } from "@/lib/themes";

export type ThemeActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function saveThemeAction(
  _prevState: ThemeActionState,
  formData: FormData
): Promise<ThemeActionState> {
  const theme = resolveTheme(formData.get("theme"));
  const result = await updateStoreTheme(theme);

  if (!result.ok) {
    return {
      status: "error",
      message: result.error ?? "Could not save the theme. Please try again.",
    };
  }

  // Re-render every route (incl. the root layout's data-theme attribute).
  revalidatePath("/", "layout");
  return { status: "success", message: "Theme applied to the storefront." };
}
