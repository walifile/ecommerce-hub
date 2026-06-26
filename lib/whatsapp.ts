import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderTemplateKey =
  | "order_created"
  | "order_confirmed"
  | "order_processing"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled";

export type OrderNotifyInput = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string | null;
  total: number;
  templateKey: OrderTemplateKey;
};

function money(value: number) {
  return `$${Number(value).toFixed(0)}`;
}

const TEMPLATES: Record<OrderTemplateKey, (o: OrderNotifyInput) => string> = {
  order_created: (o) =>
    `Hi ${o.customerName}! 🎉 We received your ToyVerse order ${o.orderNumber} (${money(o.total)}). We'll confirm it shortly.`,
  order_confirmed: (o) =>
    `Good news ${o.customerName}! Your ToyVerse order ${o.orderNumber} is confirmed and being prepared. 📦`,
  order_processing: (o) =>
    `Your ToyVerse order ${o.orderNumber} is now being processed. We'll let you know once it ships. ⚙️`,
  order_shipped: (o) =>
    `🚚 Your ToyVerse order ${o.orderNumber} has shipped and is on its way!`,
  order_delivered: (o) =>
    `✅ Your ToyVerse order ${o.orderNumber} has been delivered. Enjoy! Thank you for shopping with us.`,
  order_cancelled: (o) =>
    `Your ToyVerse order ${o.orderNumber} has been cancelled. If this wasn't expected, please contact support.`,
};

/** Map an order status to its notification template (null = no message). */
export function templateForStatus(status: string): OrderTemplateKey | null {
  switch (status) {
    case "confirmed":
      return "order_confirmed";
    case "processing":
      return "order_processing";
    case "shipped":
      return "order_shipped";
    case "delivered":
      return "order_delivered";
    case "cancelled":
      return "order_cancelled";
    default:
      return null;
  }
}

/**
 * Sends an order WhatsApp notification and records it in whatsapp_logs.
 * Uses the WhatsApp Cloud API when WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID
 * are set; otherwise it records the message as "simulated" so the flow works
 * end-to-end without external setup. Never throws (best-effort).
 */
export async function notifyOrder(input: OrderNotifyInput): Promise<void> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const message = TEMPLATES[input.templateKey](input);
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const digits = (input.phone ?? "").replace(/[^\d]/g, "");

  let status: "sent" | "failed" | "simulated" = "simulated";

  if (token && phoneNumberId && digits) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: digits,
            type: "text",
            text: { body: message },
          }),
        }
      );
      if (res.ok) {
        status = "sent";
      } else {
        status = "failed";
        console.error("[whatsapp] send failed:", await res.text());
      }
    } catch (error) {
      status = "failed";
      console.error("[whatsapp] send error:", error);
    }
  }

  try {
    await supabase.from("whatsapp_logs").insert({
      order_id: input.orderId,
      template_name: input.templateKey,
      phone: input.phone || null,
      status,
      sent_at:
        status === "sent" || status === "simulated"
          ? new Date().toISOString()
          : null,
    } as never);
  } catch (error) {
    console.error("[whatsapp] log insert failed:", error);
  }
}
