"use server";

import { revalidatePath } from "next/cache";
import { updateStoreDetails } from "@/lib/ecommerce-data";
import { storeDetailsSchema } from "@/lib/validations/admin";
import { requireAdmin } from "@/lib/auth";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function saveStoreDetailsAction(
  _prevState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  await requireAdmin();
  const parsed = storeDetailsSchema.safeParse({
    storeName: String(formData.get("storeName") ?? ""),
    supportEmail: String(formData.get("supportEmail") ?? ""),
    supportPhone: String(formData.get("supportPhone") ?? ""),
    heroTitle: String(formData.get("heroTitle") ?? ""),
    heroSubtitle: String(formData.get("heroSubtitle") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check store settings.",
    };
  }

  const result = await updateStoreDetails(parsed.data);
  if (!result.ok) {
    return {
      status: "error",
      message: result.error ?? "Could not save store settings.",
    };
  }

  revalidatePath("/", "layout");
  revalidatePath("/admin/settings");
  return { status: "success", message: "Store settings updated." };
}
