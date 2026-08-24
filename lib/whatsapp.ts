import { getSupabaseServerClient } from "@/lib/supabase/server";

export type OrderTemplateKey =
  | "order_created"
  | "order_confirmed"
  | "order_processing"
  | "order_shipped"
  | "order_delivered"
  | "order_cancelled"
  | "order_returned";

export type OrderNotifyInput = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string | null;
  total: number;
  templateKey: OrderTemplateKey;
};

function normalizePhone(value: string | null) {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/[^\d]/g, "");
  if (raw.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);

  const defaultCountryCode = (process.env.WHATSAPP_DEFAULT_COUNTRY_CODE ?? "")
    .replace(/[^\d]/g, "");
  if (defaultCountryCode && !digits.startsWith(defaultCountryCode)) {
    return `${defaultCountryCode}${digits.replace(/^0+/, "")}`;
  }

  return digits;
}

function money(value: number) {
  return `$${Number(value).toFixed(0)}`;
}

const TEMPLATES: Record<OrderTemplateKey, (o: OrderNotifyInput) => string> = {
  order_created: (o) =>
    `Hi ${o.customerName}! We received your ToyVerse order ${o.orderNumber} (${money(o.total)}). We'll confirm it shortly.`,
  order_confirmed: (o) =>
    `Good news ${o.customerName}! Your ToyVerse order ${o.orderNumber} is confirmed and being prepared.`,
  order_processing: (o) =>
    `Your ToyVerse order ${o.orderNumber} is now being processed. We'll let you know once it ships.`,
  order_shipped: (o) =>
    `Your ToyVerse order ${o.orderNumber} has shipped and is on its way.`,
  order_delivered: (o) =>
    `Your ToyVerse order ${o.orderNumber} has been delivered. Enjoy! Thank you for shopping with us.`,
  order_cancelled: (o) =>
    `Your ToyVerse order ${o.orderNumber} has been cancelled. If this wasn't expected, please contact support.`,
  order_returned: (o) =>
    `Your ToyVerse order ${o.orderNumber} was returned. Inventory has been updated and support can help with the next step.`,
};

const CUSTOM_TEMPLATE_COLUMNS: Partial<Record<OrderTemplateKey, string>> = {
  order_created: "whatsapp_template_order_created",
  order_confirmed: "whatsapp_template_order_confirmed",
  order_shipped: "whatsapp_template_order_shipped",
  order_delivered: "whatsapp_template_order_delivered",
};

function fillTemplate(template: string, input: OrderNotifyInput) {
  return template
    .replaceAll("{customerName}", input.customerName)
    .replaceAll("{orderNumber}", input.orderNumber)
    .replaceAll("{total}", money(input.total));
}

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
    case "returned":
      return "order_returned";
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

  let message = TEMPLATES[input.templateKey](input);
  const customColumn = CUSTOM_TEMPLATE_COLUMNS[input.templateKey];
  if (customColumn) {
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    const custom = data ? (data as unknown as Record<string, unknown>)[customColumn] : null;
    if (typeof custom === "string" && custom.trim()) message = fillTemplate(custom, input);
  }
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  const digits = normalizePhone(input.phone);

  let status: "sent" | "failed" | "simulated" = "simulated";

  if (token && phoneNumberId && digits) {
    try {
      const res = await fetch(
        `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`,
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
