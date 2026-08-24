"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateOperationsSettings } from "@/lib/ecommerce-data";

export type OperationsState = { status: "idle" | "success" | "error"; message: string };

export async function saveOperationsSettingsAction(
  _previous: OperationsState,
  formData: FormData
): Promise<OperationsState> {
  await requireAdmin();
  const shippingFlatRate = Number(formData.get("shippingFlatRate"));
  const freeShippingThreshold = Number(formData.get("freeShippingThreshold"));
  const text = (key: string) => String(formData.get(key) ?? "").trim();
  if (![shippingFlatRate, freeShippingThreshold].every((value) => Number.isFinite(value) && value >= 0)) {
    return { status: "error", message: "Enter valid shipping amounts." };
  }
  const templates = ["whatsappTemplateOrderCreated", "whatsappTemplateOrderConfirmed", "whatsappTemplateOrderShipped", "whatsappTemplateOrderDelivered"];
  if (templates.some((key) => !text(key))) return { status: "error", message: "All WhatsApp templates are required." };
  const result = await updateOperationsSettings({
    whatsappTemplateOrderCreated: text("whatsappTemplateOrderCreated"),
    whatsappTemplateOrderConfirmed: text("whatsappTemplateOrderConfirmed"),
    whatsappTemplateOrderShipped: text("whatsappTemplateOrderShipped"),
    whatsappTemplateOrderDelivered: text("whatsappTemplateOrderDelivered"),
    shippingFlatRate,
    freeShippingThreshold,
  });
  if (!result.ok) return { status: "error", message: result.error || "Could not save settings." };
  revalidatePath("/", "layout");
  return { status: "success", message: "Operations settings updated." };
}
