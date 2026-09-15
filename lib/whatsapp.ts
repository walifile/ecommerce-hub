import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  fillWhatsAppPreview,
  isValidWhatsAppPhone,
  normalizeWhatsAppPhone,
  whatsappRequestKey,
  type OrderTemplateKey,
} from "@/lib/whatsapp-core";

export { templateForStatus } from "@/lib/whatsapp-core";
export type { OrderTemplateKey } from "@/lib/whatsapp-core";

export type OrderNotifyInput = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  phone: string | null;
  total: number;
  templateKey: OrderTemplateKey;
};

export type NotifyResult = {
  status: "accepted" | "failed" | "simulated" | "skipped" | "configuration_error" | "duplicate";
  message: string;
};

const FALLBACK_TEMPLATES: Record<OrderTemplateKey, string> = {
  order_created: "Hi {customerName}! We received order {orderNumber} ({total}). We'll confirm it shortly.",
  order_confirmed: "Good news {customerName}! Order {orderNumber} ({total}) is confirmed.",
  order_processing: "Hi {customerName}, order {orderNumber} ({total}) is being processed.",
  order_shipped: "Hi {customerName}, order {orderNumber} ({total}) has shipped.",
  order_delivered: "Hi {customerName}, order {orderNumber} ({total}) has been delivered. Thank you!",
  order_cancelled: "Hi {customerName}, order {orderNumber} ({total}) has been cancelled.",
  order_returned: "Hi {customerName}, order {orderNumber} ({total}) has been returned.",
};

const CUSTOM_TEMPLATE_COLUMNS: Partial<Record<OrderTemplateKey, string>> = {
  order_created: "whatsapp_template_order_created",
  order_confirmed: "whatsapp_template_order_confirmed",
  order_shipped: "whatsapp_template_order_shipped",
  order_delivered: "whatsapp_template_order_delivered",
};

const ENV_TEMPLATE_NAMES: Record<OrderTemplateKey, string> = {
  order_created: "WHATSAPP_TEMPLATE_ORDER_CREATED",
  order_confirmed: "WHATSAPP_TEMPLATE_ORDER_CONFIRMED",
  order_processing: "WHATSAPP_TEMPLATE_ORDER_PROCESSING",
  order_shipped: "WHATSAPP_TEMPLATE_ORDER_SHIPPED",
  order_delivered: "WHATSAPP_TEMPLATE_ORDER_DELIVERED",
  order_cancelled: "WHATSAPP_TEMPLATE_ORDER_CANCELLED",
  order_returned: "WHATSAPP_TEMPLATE_ORDER_RETURNED",
};

async function updateLog(logId: string, values: Record<string, unknown>) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;
  const { error } = await supabase.from("whatsapp_logs").update({
    ...values,
    updated_at: new Date().toISOString(),
  } as never).eq("id", logId);
  if (error) console.error("[whatsapp] log update failed:", error.message);
}

async function getPreview(input: OrderNotifyInput) {
  const supabase = getSupabaseServerClient();
  let template = FALLBACK_TEMPLATES[input.templateKey];
  const customColumn = CUSTOM_TEMPLATE_COLUMNS[input.templateKey];
  if (supabase && customColumn) {
    const { data } = await supabase.from("settings").select("*").limit(1).maybeSingle();
    const custom = data ? (data as unknown as Record<string, unknown>)[customColumn] : null;
    if (typeof custom === "string" && custom.trim()) template = custom.trim();
  }
  return fillWhatsAppPreview(template, input, process.env.STORE_CURRENCY || "USD");
}

/**
 * Claims one idempotent notification per order lifecycle event, submits an
 * approved Meta template, and records the provider message id. Delivery/read
 * state is reconciled later by the signed webhook.
 */
export async function notifyOrder(
  input: OrderNotifyInput,
  options: { forceRetry?: boolean } = {}
): Promise<NotifyResult> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "configuration_error", message: "Database is not configured." };

  const phone = normalizeWhatsAppPhone(input.phone, process.env.WHATSAPP_DEFAULT_COUNTRY_CODE);
  const requestKey = whatsappRequestKey(input.orderId, input.templateKey);
  const { data: claimData, error: claimError } = await supabase.rpc(
    "claim_whatsapp_notification" as never,
    {
      p_request_key: requestKey,
      p_order_id: input.orderId,
      p_template_name: input.templateKey,
      p_phone: phone || null,
      p_force: Boolean(options.forceRetry),
    } as never
  );
  if (claimError) {
    console.error("[whatsapp] notification claim failed:", claimError.message);
    return { status: "failed", message: "Could not queue the WhatsApp notification." };
  }
  const claim = (Array.isArray(claimData) ? claimData[0] : claimData) as
    | { log_id?: string; should_send?: boolean }
    | null;
  if (!claim?.log_id) return { status: "failed", message: "Notification queue returned no log id." };
  if (!claim.should_send) return { status: "duplicate", message: "This lifecycle notification was already queued." };

  if (!isValidWhatsAppPhone(phone)) {
    await updateLog(claim.log_id, { status: "skipped", error_code: "invalid_phone", error_message: "Recipient phone must contain 7 to 15 digits." });
    return { status: "skipped", message: "Customer phone is not valid for WhatsApp." };
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN?.trim();
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim();
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim();
  const templateName = process.env[ENV_TEMPLATE_NAMES[input.templateKey]]?.trim();
  const language = process.env.WHATSAPP_TEMPLATE_LANGUAGE?.trim() || "en_US";

  if (!token && !phoneNumberId && !apiVersion && !templateName) {
    await getPreview(input);
    await updateLog(claim.log_id, { status: "simulated", sent_at: new Date().toISOString() });
    return { status: "simulated", message: "WhatsApp is not configured; notification was simulated." };
  }
  if (!token || !phoneNumberId || !apiVersion || !templateName) {
    await updateLog(claim.log_id, { status: "configuration_error", error_code: "incomplete_configuration", error_message: `Missing configuration for ${input.templateKey}.` });
    return { status: "configuration_error", message: "WhatsApp configuration is incomplete." };
  }
  if (!/^[a-z0-9_]{1,512}$/.test(templateName) || !/^[a-z]{2,3}(?:_[A-Z]{2})?$/.test(language)) {
    await updateLog(claim.log_id, { status: "configuration_error", error_code: "invalid_template_configuration", error_message: "Template name or language format is invalid." });
    return { status: "configuration_error", message: "WhatsApp template configuration is invalid." };
  }

  try {
    const response = await fetch(`https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: language },
          components: [{
            type: "body",
            parameters: [
              { type: "text", text: input.customerName.slice(0, 100) || "Customer" },
              { type: "text", text: input.orderNumber.slice(0, 100) },
              { type: "text", text: Number(input.total).toFixed(2) },
            ],
          }],
        },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    const raw = (await response.text()).slice(0, 10_000);
    let payload: { messages?: Array<{ id?: string }>; error?: { code?: number; message?: string } } = {};
    try { payload = JSON.parse(raw) as typeof payload; } catch { /* provider returned non-JSON */ }
    const messageId = payload.messages?.[0]?.id;
    if (!response.ok || !messageId) {
      const code = String(payload.error?.code ?? response.status);
      const message = String(payload.error?.message ?? "Meta rejected the message.").slice(0, 500);
      await updateLog(claim.log_id, { status: "failed", error_code: code, error_message: message });
      console.error("[whatsapp] Meta rejected message:", code, message);
      return { status: "failed", message: "Meta rejected the WhatsApp notification." };
    }

    await updateLog(claim.log_id, { status: "accepted", meta_message_id: messageId, sent_at: new Date().toISOString(), error_code: null, error_message: null });
    return { status: "accepted", message: "WhatsApp notification accepted by Meta." };
  } catch (error) {
    const message = error instanceof Error && error.name === "TimeoutError" ? "Meta request timed out." : "Could not reach Meta.";
    await updateLog(claim.log_id, { status: "failed", error_code: "network_error", error_message: message });
    console.error("[whatsapp] send error:", error);
    return { status: "failed", message };
  }
}
