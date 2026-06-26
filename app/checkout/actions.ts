"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notifyOrder } from "@/lib/whatsapp";

export type CheckoutState = {
  status: "idle" | "success" | "error";
  message: string;
  orderNumber?: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmittedItem = { id: string; quantity: number };

export async function createOrderAction(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const paymentRaw = String(formData.get("payment") ?? "cod").toLowerCase();
  const payment = paymentRaw.includes("stripe") ? "stripe" : "cod";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const couponCode = String(formData.get("couponCode") ?? "")
    .trim()
    .toUpperCase();

  let items: SubmittedItem[] = [];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]")) as SubmittedItem[];
  } catch {
    items = [];
  }

  if (!name) return { status: "error", message: "Please enter your name." };
  if (!phone) return { status: "error", message: "Please enter a phone number." };
  if (email && !EMAIL_RE.test(email))
    return { status: "error", message: "Enter a valid email address." };
  if (!items.length)
    return { status: "error", message: "Your cart is empty." };

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return {
      status: "error",
      message:
        "Checkout is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.",
    };
  }

  // Verify prices server-side from the DB (never trust client prices).
  const ids = items.map((i) => i.id);
  const { data: productsRaw } = await supabase
    .from("products")
    .select("id, name, slug, selling_price, cost_price, stock_quantity")
    .in("id", ids);

  const products = (productsRaw ?? []) as {
    id: string;
    name: string;
    slug: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
  }[];

  const priceMap = new Map(
    products.map((p) => [
      p.id,
      {
        name: p.name,
        slug: p.slug,
        price: Number(p.selling_price),
        cost: Number(p.cost_price),
        stock: Number(p.stock_quantity),
      },
    ])
  );

  const orderItems = items
    .map((item) => {
      const match = priceMap.get(item.id);
      if (!match) return null;
      const quantity = Math.max(1, Math.floor(item.quantity));
      return {
        product_id: item.id,
        product_name: match.name,
        quantity,
        unit_price: match.price,
        product_cost: match.cost,
        stock_quantity: match.stock,
        slug: match.slug,
      };
    })
    .filter(Boolean) as {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    product_cost: number;
    stock_quantity: number;
    slug: string;
  }[];

  if (!orderItems.length)
    return { status: "error", message: "None of the cart items are available." };

  const stockIssue = orderItems.find((item) => item.quantity > item.stock_quantity);
  if (stockIssue) {
    if (stockIssue.stock_quantity <= 0) {
      return {
        status: "error",
        message: `${stockIssue.product_name} is out of stock.`,
      };
    }
    return {
      status: "error",
      message: `Only ${stockIssue.stock_quantity} units of ${stockIssue.product_name} are available.`,
    };
  }

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const shipping = subtotal >= 50 ? 0 : 10;
  let discount = 0;
  let appliedCouponId: string | null = null;
  let appliedCouponCode: string | null = null;
  let appliedCouponNextUsedCount: number | null = null;

  if (couponCode) {
    const { data: couponRaw, error: couponError } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", couponCode)
      .maybeSingle();

    if (couponError) {
      console.error("[checkout] coupon lookup failed:", couponError.message);
      return { status: "error", message: "Could not validate the coupon." };
    }

    if (!couponRaw) {
      return { status: "error", message: "Coupon code was not found." };
    }

    const coupon = couponRaw as {
      id: string;
      code: string;
      discount_type: string;
      discount_value: number;
      min_order_amount: number | null;
      max_discount_amount: number | null;
      active: boolean;
      starts_at: string | null;
      expires_at: string | null;
      usage_limit: number | null;
      used_count: number | null;
    };
    const now = Date.now();

    if (!coupon.active) {
      return { status: "error", message: "This coupon is not active." };
    }
    if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
      return { status: "error", message: "This coupon is not live yet." };
    }
    if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
      return { status: "error", message: "This coupon has expired." };
    }
    if (
      coupon.usage_limit !== null &&
      coupon.usage_limit !== undefined &&
      (coupon.used_count ?? 0) >= coupon.usage_limit
    ) {
      return { status: "error", message: "This coupon has reached its usage limit." };
    }

    const minOrderAmount = Number(coupon.min_order_amount ?? 0);
    if (subtotal < minOrderAmount) {
      return {
        status: "error",
        message: "Cart total is below the coupon minimum order amount.",
      };
    }

    const rawDiscount =
      coupon.discount_type === "percentage"
        ? subtotal * (Number(coupon.discount_value) / 100)
        : Number(coupon.discount_value);
    const cappedDiscount =
      coupon.max_discount_amount && Number(coupon.max_discount_amount) > 0
        ? Math.min(rawDiscount, Number(coupon.max_discount_amount))
        : rawDiscount;

    discount = Math.max(0, Math.min(subtotal, Number(cappedDiscount.toFixed(2))));
    appliedCouponId = coupon.id;
    appliedCouponCode = coupon.code;
    appliedCouponNextUsedCount = (coupon.used_count ?? 0) + 1;
  }

  const total = Math.max(0, subtotal + shipping - discount);

  // Find or create the customer (matched by phone).
  let customerId: string | null = null;
  const { data: existing } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existing?.id) {
    customerId = existing.id;
  } else {
    const { data: created } = await supabase
      .from("customers")
      .insert({ name, phone, email: email || null, address, city } as never)
      .select("id")
      .maybeSingle<{ id: string }>();
    customerId = created?.id ?? null;
  }

  const orderNumber = `TV-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      status: "pending",
      payment_method: payment,
      shipping_cost: shipping,
      ad_cost: 0,
      discount_amount: discount,
      coupon_code: appliedCouponCode,
      revenue: Math.max(0, subtotal - discount),
      total,
      notes,
    } as never)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (orderError || !order) {
    console.error("[checkout] order insert failed:", orderError?.message);
    return { status: "error", message: "Could not place the order. Please try again." };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(
      orderItems.map(({ stock_quantity: _stock, slug: _slug, ...item }) => ({
        ...item,
        order_id: order.id,
      })) as never
    );

  if (itemsError) {
    console.error("[checkout] order_items insert failed:", itemsError.message);
  }

  for (const item of orderItems) {
    const nextStock = Math.max(0, item.stock_quantity - item.quantity);
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_quantity: nextStock } as never)
      .eq("id", item.product_id)
      .eq("stock_quantity", item.stock_quantity);

    if (stockError) {
      console.error("[checkout] stock update failed:", stockError.message, item.product_id);
    }
  }

  if (appliedCouponId) {
    const { error: couponUpdateError } = await supabase
      .from("coupons")
      .update({ used_count: appliedCouponNextUsedCount ?? 1 } as never)
      .eq("id", appliedCouponId);

    if (couponUpdateError) {
      console.error("[checkout] coupon usage update failed:", couponUpdateError.message);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  for (const item of orderItems) {
    revalidatePath(`/products/${item.slug}`);
  }

  // Best-effort order confirmation notification (WhatsApp Cloud API or simulated).
  await notifyOrder({
    orderId: order.id,
    orderNumber,
    customerName: name,
    phone,
    total,
    templateKey: "order_created",
  });

  return {
    status: "success",
    message: `Order ${orderNumber} placed!`,
    orderNumber,
  };
}
