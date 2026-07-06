import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type Stripe from "stripe";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";
import { notifyOrder } from "@/lib/whatsapp";

export async function POST(request: Request) {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured." },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    const payload = await request.text();
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook payload.";
    return NextResponse.json({ error: message }, { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.metadata?.orderId || session.client_reference_id;
  if (!orderId) {
    return NextResponse.json({ received: true, skipped: "missing order id" });
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const paymentIntent =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  const { data: existingOrder, error: readError } = await supabase
    .from("orders")
    .select("id, order_number, total, payment_status, coupon_code, customer_id, order_items(product_id, quantity), customers(name, phone)")
    .eq("id", orderId)
    .maybeSingle();

  if (readError) {
    console.error("[stripe] webhook order read failed:", readError.message);
    return NextResponse.json({ error: "Could not read order." }, { status: 500 });
  }

  const row = existingOrder as
    | {
        id: string;
        order_number: string;
        total: number;
        payment_status?: string | null;
        coupon_code?: string | null;
        order_items?: { product_id: string | null; quantity: number }[];
        customers?: { name?: string | null; phone?: string | null } | null;
      }
    | null;

  if (!row) {
    return NextResponse.json({ received: true, skipped: "order not found" });
  }

  if (row.payment_status === "paid") {
    return NextResponse.json({ received: true, skipped: "already paid" });
  }

  const { error } = await supabase
    .from("orders")
    .update({
      status: "confirmed",
      payment_status: session.payment_status ?? "paid",
      stripe_session_id: session.id,
      stripe_payment_intent_id: paymentIntent ?? null,
      paid_at: new Date().toISOString(),
    } as never)
    .eq("id", row.id);

  if (error) {
    console.error("[stripe] webhook order update failed:", error.message);
    return NextResponse.json({ error: "Could not update order." }, { status: 500 });
  }

  for (const item of row.order_items ?? []) {
    if (!item.product_id) continue;
    const { data: product } = await supabase
      .from("products")
      .select("stock_quantity")
      .eq("id", item.product_id)
      .maybeSingle<{ stock_quantity: number }>();

    if (!product) continue;

    await supabase
      .from("products")
      .update({
        stock_quantity: Math.max(0, Number(product.stock_quantity) - item.quantity),
      } as never)
      .eq("id", item.product_id);
  }

  if (row.coupon_code) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, used_count")
      .eq("code", row.coupon_code)
      .maybeSingle<{ id: string; used_count: number | null }>();

    if (coupon) {
      await supabase
        .from("coupons")
        .update({ used_count: (coupon.used_count ?? 0) + 1 } as never)
        .eq("id", coupon.id);
    }
  }

  if (row) {
    await notifyOrder({
      orderId: row.id,
      orderNumber: row.order_number,
      customerName: row.customers?.name || "there",
      phone: row.customers?.phone || null,
      total: Number(row.total),
      templateKey: "order_confirmed",
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/products");
  revalidatePath("/shop");

  return NextResponse.json({ received: true });
}
