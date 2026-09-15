export const ORDER_TEMPLATE_KEYS = [
  "order_created",
  "order_confirmed",
  "order_processing",
  "order_shipped",
  "order_delivered",
  "order_cancelled",
  "order_returned",
] as const;

export type OrderTemplateKey = (typeof ORDER_TEMPLATE_KEYS)[number];

export function normalizeWhatsAppPhone(value: string | null, defaultCountryCode = "") {
  const raw = (value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/[^\d]/g, "");
  if (raw.startsWith("+")) return digits;
  if (digits.startsWith("00")) return digits.slice(2);
  const country = defaultCountryCode.replace(/[^\d]/g, "");
  if (country && !digits.startsWith(country)) return `${country}${digits.replace(/^0+/, "")}`;
  return digits;
}

export function isValidWhatsAppPhone(value: string) {
  return /^\d{7,15}$/.test(value);
}

export function templateForStatus(status: string): OrderTemplateKey | null {
  const key = `order_${status}`;
  return ORDER_TEMPLATE_KEYS.includes(key as OrderTemplateKey) && key !== "order_created"
    ? key as OrderTemplateKey
    : null;
}

export function fillWhatsAppPreview(
  template: string,
  input: { customerName: string; orderNumber: string; total: number },
  currency = "USD"
) {
  const total = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(input.total);
  return template
    .replaceAll("{customerName}", input.customerName)
    .replaceAll("{orderNumber}", input.orderNumber)
    .replaceAll("{total}", total);
}

export function maskWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 4) return digits ? "••••" : "—";
  return `${"•".repeat(Math.min(8, digits.length - 4))}${digits.slice(-4)}`;
}

export function whatsappRequestKey(orderId: string, template: OrderTemplateKey) {
  return `${orderId}:${template}`;
}
