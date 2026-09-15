"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { notifyOrder, templateForStatus } from "@/lib/whatsapp";
import {
  createCompatibleOrder,
  updateCompatibleOrderStatus,
} from "@/lib/order-operations";
import { customerSchema } from "@/lib/validations/admin";
import { getOrderById } from "@/lib/ecommerce-data";

export type OrderFormState = { status: "idle" | "success" | "error"; message: string };

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function updateOrderStatusAction(formData: FormData): Promise<OrderFormState> {
  await requireAdmin();
  const id = String(formData.get("orderId") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim().toLowerCase();
  if (!UUID_RE.test(id) || !ORDER_STATUSES.includes(status)) {
    return { status: "error", message: "Invalid order or status." };
  }
  const refundRaw = String(formData.get("refundAmount") ?? "").trim();
  const refund = refundRaw ? Number(refundRaw) : null;
  const reason = String(formData.get("reason") ?? "").trim();
  const note = String(formData.get("note") ?? "").trim();
  if (refundRaw && (!Number.isFinite(refund) || Number(refund) < 0)) {
    return { status: "error", message: "Refund amount must be zero or greater." };
  }
  if ((status === "cancelled" || status === "returned") && !reason) {
    return { status: "error", message: "Add a reason for a cancellation or return." };
  }
  if (reason.length > 500 || note.length > 2000) {
    return { status: "error", message: "Reason or note is too long." };
  }
  if (refund !== null) {
    const existingOrder = await getOrderById(id);
    if (!existingOrder) return { status: "error", message: "Order not found." };
    if (refund > existingOrder.total) {
      return { status: "error", message: "Refund cannot exceed the order total." };
    }
  }
  const result = await updateCompatibleOrderStatus({
    orderId: id,
    status,
    reason: reason || null,
    refundAmount: refund,
    note: note || null,
  });
  if (!result.ok) {
    console.error("[admin] updateOrderStatus failed:", result.error);
    return { status: "error", message: result.error || "Order status could not be updated." };
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
  return { status: "success", message: `Order marked ${status}.` };
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
  const phoneInput = String(formData.get("phone") ?? "").trim();
  const phone = phoneInput.replace(/\D/g, "");
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
  const customer = customerSchema.safeParse({ name, phone, email, address, city });
  if (!customer.success) {
    return { status: "error", message: customer.error.issues[0]?.message ?? "Check customer details." };
  }
  if (!items.length) {
    return { status: "error", message: "Add at least one product to the order." };
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
