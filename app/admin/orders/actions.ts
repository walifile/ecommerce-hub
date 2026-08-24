"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { notifyOrder, templateForStatus } from "@/lib/whatsapp";
import {
  createCompatibleOrder,
  updateCompatibleOrderStatus,
} from "@/lib/order-operations";

export type OrderFormState = { status: "idle" | "success" | "error"; message: string };

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;
  const refundRaw = String(formData.get("refundAmount") ?? "").trim();
  const refund = refundRaw ? Number(refundRaw) : null;
  const result = await updateCompatibleOrderStatus({
    orderId: id,
    status,
    reason: String(formData.get("reason") ?? "").trim() || null,
    refundAmount: Number.isFinite(refund as number) ? refund : null,
    note: String(formData.get("note") ?? "").trim() || null,
  });
  if (!result.ok) {
    console.error("[admin] updateOrderStatus failed:", result.error);
    return;
  }
  const order = result.data;
  const templateKey = templateForStatus(status);
  if (order && templateKey) {
    await notifyOrder({
      orderId: order.orderId, orderNumber: order.orderNumber,
      customerName: order.customerName, phone: order.customerPhone,
      total: Number(order.total), templateKey,
    });
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/shop");
}

type ManualOrderItem = { productId: string; quantity: number };
function parseManualOrderItems(value: FormDataEntryValue | null): ManualOrderItem[] {
  try {
    const raw = JSON.parse(String(value ?? "[]")) as unknown;
    if (!Array.isArray(raw)) return [];
    const aggregate = new Map<string, number>();
    for (const row of raw) {
      if (!row || typeof row !== "object") continue;
      const id = String((row as { productId?: unknown }).productId ?? "").trim();
      const quantity = Math.floor(Number((row as { quantity?: unknown }).quantity));
      if (id && Number.isFinite(quantity) && quantity > 0) {
        aggregate.set(id, Math.min(100, (aggregate.get(id) ?? 0) + quantity));
      }
    }
    return [...aggregate].map(([productId, quantity]) => ({ productId, quantity }));
  } catch {
    return [];
  }
}

export async function createManualOrderAction(
  _previous: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const payment = String(formData.get("payment") ?? "cod") === "stripe" ? "stripe" : "cod";
  const requestedStatus = String(formData.get("status") ?? "confirmed").toLowerCase();
  const status = ["pending", "confirmed", "processing", "shipped", "delivered"].includes(requestedStatus)
    ? requestedStatus : "confirmed";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const adCost = Math.max(0, Number(formData.get("adCost")) || 0);
  const items = parseManualOrderItems(formData.get("itemsJson"));
  if (!name || !phone || !items.length) {
    return { status: "error", message: "Customer name, phone, and at least one item are required." };
  }
  const created = await createCompatibleOrder({
    name,
    phone,
    email,
    address,
    city,
    paymentMethod: payment,
    notes,
    couponCode: "",
    items: items.map((item) => ({ id: item.productId, quantity: item.quantity })),
    adCost,
  });
  if (!created.ok) return { status: "error", message: created.error };
  const order = created.data;
  if (status !== "pending") {
    const statusResult = await updateCompatibleOrderStatus({
      orderId: order.orderId,
      status,
      note: "Created manually by admin",
    });
    if (!statusResult.ok) {
      console.error("[admin] manual order status failed:", statusResult.error);
      return { status: "error", message: "Order was created but its requested status could not be set." };
    }
  }
  revalidatePath("/admin", "layout");
  const templateKey = templateForStatus(status) ?? "order_created";
  await notifyOrder({
    orderId: order.orderId, orderNumber: order.orderNumber,
    customerName: name, phone, total: Number(order.total), templateKey,
  });
  return { status: "success", message: `Manual order ${order.orderNumber} created.` };
}
