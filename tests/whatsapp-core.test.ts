import assert from "node:assert/strict";
import test from "node:test";
import {
  fillWhatsAppPreview,
  isValidWhatsAppPhone,
  maskWhatsAppPhone,
  normalizeWhatsAppPhone,
  templateForStatus,
  whatsappRequestKey,
} from "../lib/whatsapp-core.ts";

test("normalizes international and local WhatsApp numbers", () => {
  assert.equal(normalizeWhatsAppPhone("+92 300-1234567", "92"), "923001234567");
  assert.equal(normalizeWhatsAppPhone("0092 300 1234567", "92"), "923001234567");
  assert.equal(normalizeWhatsAppPhone("0300-1234567", "92"), "923001234567");
  assert.equal(normalizeWhatsAppPhone("", "92"), "");
});

test("validates E.164-compatible digit lengths", () => {
  assert.equal(isValidWhatsAppPhone("923001234567"), true);
  assert.equal(isValidWhatsAppPhone("123456"), false);
  assert.equal(isValidWhatsAppPhone("1234567890123456"), false);
  assert.equal(isValidWhatsAppPhone("+923001234567"), false);
});

test("maps every notification lifecycle status", () => {
  assert.equal(templateForStatus("confirmed"), "order_confirmed");
  assert.equal(templateForStatus("processing"), "order_processing");
  assert.equal(templateForStatus("shipped"), "order_shipped");
  assert.equal(templateForStatus("delivered"), "order_delivered");
  assert.equal(templateForStatus("cancelled"), "order_cancelled");
  assert.equal(templateForStatus("returned"), "order_returned");
  assert.equal(templateForStatus("pending"), null);
  assert.equal(templateForStatus("unknown"), null);
});

test("fills all editable preview placeholders", () => {
  const result = fillWhatsAppPreview(
    "Hi {customerName}, {orderNumber} totals {total}",
    { customerName: "Wali", orderNumber: "TV-123", total: 12.5 },
    "USD"
  );
  assert.equal(result, "Hi Wali, TV-123 totals $12.50");
});

test("masks recipient phone and creates stable idempotency keys", () => {
  assert.equal(maskWhatsAppPhone("923001234567"), "••••••••4567");
  assert.equal(maskWhatsAppPhone(""), "—");
  assert.equal(whatsappRequestKey("order-id", "order_shipped"), "order-id:order_shipped");
});
