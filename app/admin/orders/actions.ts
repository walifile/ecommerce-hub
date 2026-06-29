"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notifyOrder, templateForStatus } from "@/lib/whatsapp";

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const reason = String(formData.get("reason") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const refundAmountRaw = String(formData.get("refundAmount") ?? "").trim();
  const refundAmount = refundAmountRaw ? Number(refundAmountRaw) : null;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { data, error } = await supabase.rpc(
    "update_order_status_with_inventory",
    {
      p_order_id: id,
      p_status: status,
      p_reason: reason,
      p_refund_amount: Number.isFinite(refundAmount as number) ? refundAmount : null,
      p_note: note,
    } as never
  );

  if (error) {
    console.error("[admin] updateOrderStatus failed:", error.message);
    revalidatePath("/admin/orders");
    return;
  }

  const order = (Array.isArray(data) ? data[0] : data) as
    | {
        order_id: string;
        order_number: string;
        customer_name: string | null;
        customer_phone: string | null;
        total: number;
        previous_status: string;
        new_status: string;
      }
    | null;

  if (!order) {
    revalidatePath("/admin/orders");
    return;
  }

  const templateKey = templateForStatus(status);
  if (templateKey) {
    await notifyOrder({
      orderId: order.order_id,
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "there",
      phone: order.customer_phone ?? null,
      total: Number(order.total),
      templateKey,
    });
  }

  revalidatePath("/admin/orders");
}
