"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getAppUrl, getStripe } from "@/lib/stripe";
import { notifyOrder } from "@/lib/whatsapp";
import { createCompatibleOrder, updateCompatibleOrderStatus } from "@/lib/order-operations";
import { customerSchema } from "@/lib/validations/admin";

export type CheckoutState = {
  status: "idle" | "success" | "error";
  message: string;
  orderNumber?: string;
  trackingToken?: string;
  trackingPhone?: string;
  checkoutUrl?: string;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
type SubmittedItem = { id: string; quantity: number };

function parseItems(value: FormDataEntryValue | null): SubmittedItem[] {
  try {
    const raw = JSON.parse(String(value ?? "[]")) as unknown;
    if (!Array.isArray(raw)) return [];
    const quantities = new Map<string, number>();
    for (const entry of raw) {
      if (!entry || typeof entry !== "object") continue;
      const id = String((entry as { id?: unknown }).id ?? "").trim();
      const quantity = Math.floor(Number((entry as { quantity?: unknown }).quantity));
      if (!UUID_RE.test(id) || !Number.isFinite(quantity) || quantity < 1) continue;
      quantities.set(id, Math.min(100, (quantities.get(id) ?? 0) + quantity));
    }
    return [...quantities].map(([id, quantity]) => ({ id, quantity }));
  } catch {
    return [];
  }
}

export async function createOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const phoneInput = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const payment = String(formData.get("payment") ?? "cod").toLowerCase() === "stripe" ? "stripe" : "cod";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const couponCode = String(formData.get("couponCode") ?? "").trim().toUpperCase();
  const items = parseItems(formData.get("items"));

  const phoneDigits = phoneInput.replace(/\D/g, "");
  const customer = customerSchema.safeParse({ name, phone: phoneDigits, email, address, city });
  if (!customer.success) {
    return { status: "error", message: customer.error.issues[0]?.message ?? "Check your details." };
  }
  const phone = phoneDigits;
  if (!address || !city) return { status: "error", message: "Enter your delivery address and city." };
  if (!items.length) return { status: "error", message: "Your cart is empty." };
  if (couponCode && !/^[A-Z0-9_-]{1,40}$/.test(couponCode)) {
    return { status: "error", message: "The coupon code format is invalid." };
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Checkout is not configured." };
  if (payment === "stripe" && !getStripe()) {
    return { status: "error", message: "Stripe is not configured. Choose cash on delivery." };
  }

  const created = await createCompatibleOrder({
    name,
    phone,
    email,
    address,
    city,
    paymentMethod: payment,
    notes,
    couponCode,
    items,
    adCost: 0,
    requirePublishedProducts: true,
  });
  if (!created.ok) {
    console.error("[checkout] order creation failed:", created.error);
    return { status: "error", message: created.error };
  }
  const result = created.data;

  if (payment === "stripe") {
    const stripe = getStripe()!;
    try {
      const { data: products } = await supabase.from("products")
        .select("id, name, selling_price").in("id", items.map((item) => item.id));
      const productRows = (products ?? []) as unknown as Array<{ id: string; name: string; selling_price: number }>;
      const productMap = new Map(productRows.map((product) => [product.id, product]));
      const currency = process.env.STRIPE_CURRENCY || "usd";
      const stripeDiscount = Number(result.discount) > 0
        ? await stripe.coupons.create({
            amount_off: Math.round(result.discount * 100), currency,
            duration: "once", name: couponCode ? `ToyVerse ${couponCode}` : "ToyVerse discount",
          })
        : null;
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email || undefined,
        client_reference_id: result.orderId,
        metadata: { orderId: result.orderId, orderNumber: result.orderNumber },
        line_items: [
          ...items.map((item) => {
            const product = productMap.get(item.id);
            if (!product) throw new Error("A checkout product is no longer available.");
            return {
              quantity: item.quantity,
              price_data: {
                currency, product_data: { name: product.name },
                unit_amount: Math.round(Number(product.selling_price) * 100),
              },
            };
          }),
          ...(result.shipping > 0 ? [{
            quantity: 1,
            price_data: {
              currency, product_data: { name: "Shipping" },
              unit_amount: Math.round(result.shipping * 100),
            },
          }] : []),
        ],
        discounts: stripeDiscount ? [{ coupon: stripeDiscount.id }] : undefined,
        success_url: result.trackingToken
          ? `${getAppUrl()}/track-order?trackingToken=${result.trackingToken}&payment=success`
          : `${getAppUrl()}/track-order?orderNumber=${encodeURIComponent(result.orderNumber)}&phone=${encodeURIComponent(phone)}&payment=success`,
        cancel_url: `${getAppUrl()}/checkout?payment=cancelled`,
      });
      if (!session.url) throw new Error("Stripe did not return a checkout URL.");
      const { error: sessionError } = await supabase.from("orders")
        .update({ stripe_session_id: session.id } as never).eq("id", result.orderId);
      if (sessionError) throw sessionError;
      revalidatePath("/admin/orders");
      return {
        status: "success", message: "Redirecting to Stripe checkout...",
        orderNumber: result.orderNumber, trackingToken: result.trackingToken,
        trackingPhone: phone,
        checkoutUrl: session.url,
      };
    } catch (stripeError) {
      console.error("[checkout] Stripe session creation failed:", stripeError);
      if (result.trackingToken) {
        await supabase.rpc("discard_unpaid_store_order" as never, { p_order_id: result.orderId } as never);
      } else {
        await updateCompatibleOrderStatus({
          orderId: result.orderId,
          status: "cancelled",
          reason: "payment_setup_failed",
          note: "Card checkout could not be started",
        });
      }
      return { status: "error", message: "Could not start card payment. Your order was not charged or placed." };
    }
  }

  revalidatePath("/admin", "layout");
  revalidatePath("/shop");
  await notifyOrder({
    orderId: result.orderId, orderNumber: result.orderNumber, customerName: name,
    phone, total: result.total, templateKey: "order_created",
  });
  return {
    status: "success", message: `Order ${result.orderNumber} placed!`,
    orderNumber: result.orderNumber, trackingToken: result.trackingToken,
    trackingPhone: phone,
  };
}
