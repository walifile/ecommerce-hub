"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { getOrderById } from "@/lib/ecommerce-data";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notifyOrder } from "@/lib/whatsapp";
import { ORDER_TEMPLATE_KEYS, type OrderTemplateKey } from "@/lib/whatsapp-core";

export type WhatsAppActionState = { status: "success" | "error"; message: string };
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function retryWhatsAppAction(logId: string): Promise<WhatsAppActionState> {
  await requireAdmin();
  if (!UUID_RE.test(logId)) return { status: "error", message: "Invalid notification." };
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Database is not configured." };
  const { data, error } = await supabase.from("whatsapp_logs")
    .select("order_id, template_name, status")
    .eq("id", logId)
    .maybeSingle();
  if (error || !data) return { status: "error", message: "Notification was not found." };
  const log = data as { order_id: string | null; template_name: string; status: string };
  if (!["failed", "simulated", "skipped", "configuration_error"].includes(log.status)) {
    return { status: "error", message: "Only failed, skipped, simulated, or configuration-error messages can be retried." };
  }
  if (!log.order_id || !ORDER_TEMPLATE_KEYS.includes(log.template_name as OrderTemplateKey)) {
    return { status: "error", message: "The notification is not linked to a valid order event." };
  }
  const order = await getOrderById(log.order_id);
  if (!order) return { status: "error", message: "The linked order no longer exists." };
  const result = await notifyOrder({
    orderId: order.id,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    phone: order.customerPhone,
    total: order.total,
    templateKey: log.template_name as OrderTemplateKey,
  }, { forceRetry: true });
  revalidatePath("/admin/whatsapp");
  return result.status === "accepted" || result.status === "simulated"
    ? { status: "success", message: result.message }
    : { status: "error", message: result.message };
}
