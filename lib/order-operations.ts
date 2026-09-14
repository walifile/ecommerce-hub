import { getSupabaseServerClient } from "@/lib/supabase/server";
import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";

export type OrderRequestItem = { id: string; quantity: number };

export type CreateOrderRequest = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  paymentMethod: "cod" | "stripe";
  notes: string | null;
  couponCode: string;
  items: OrderRequestItem[];
  adCost?: number;
  requirePublishedProducts?: boolean;
};

export type CreatedOrder = {
  orderId: string;
  orderNumber: string;
  trackingToken?: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
};

type OperationResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function missingDatabaseFeature(error: { code?: string; message?: string } | null) {
  const message = error?.message ?? "";
  return (
    error?.code === "PGRST202" ||
    error?.code === "42883" ||
    /could not find the function|schema cache/i.test(message)
  );
}

function makeOrderNumber() {
  const time = Date.now().toString(36).toUpperCase();
  const suffix = crypto.randomUUID().slice(0, 4).toUpperCase();
  return `ECO-${time}-${suffix}`;
}

async function appendCompatOrderEvent(input: {
  orderId: string;
  previousStatus: string | null;
  newStatus: string;
  reason?: string | null;
  refundAmount?: number | null;
  note?: string | null;
  actorRole: "admin" | "system";
}) {
  const path = "orders/events.json";
  const events = await readCompatJson<Array<Record<string, unknown>>>(path, []);
  events.push({
    id: crypto.randomUUID(),
    order_id: input.orderId,
    previous_status: input.previousStatus,
    new_status: input.newStatus,
    reason: input.reason ?? null,
    refund_amount: input.refundAmount ?? null,
    note: input.note ?? null,
    actor_role: input.actorRole,
    created_at: new Date().toISOString(),
  });
  await writeCompatJson(path, events);
}

function calculateCouponDiscount(
  coupon: Record<string, unknown> | null,
  subtotal: number
) {
  if (!coupon || coupon.active === false) return 0;

  const now = Date.now();
  const startsAt = typeof coupon.starts_at === "string" ? coupon.starts_at : "";
  const expiresAt = typeof coupon.expires_at === "string" ? coupon.expires_at : "";
  if (startsAt && new Date(startsAt).getTime() > now) return 0;
  if (expiresAt && new Date(expiresAt).getTime() < now) return 0;

  const usageLimit = Number(coupon.usage_limit);
  const usedCount = Number(coupon.used_count ?? 0);
  if (Number.isFinite(usageLimit) && usageLimit > 0 && usedCount >= usageLimit) {
    return 0;
  }

  const minimum = Number(coupon.min_order_amount ?? 0);
  if (subtotal < minimum) return 0;

  const value = Number(coupon.discount_value ?? 0);
  const raw = coupon.discount_type === "percentage" ? subtotal * (value / 100) : value;
  const cap = Number(coupon.max_discount_amount);
  const capped = Number.isFinite(cap) && cap > 0 ? Math.min(raw, cap) : raw;
  return Math.max(0, Math.min(subtotal, Number(capped.toFixed(2))));
}

/**
 * Creates an order through the transactional Phase 1 RPC when available. Older
 * Supabase projects are kept usable through a carefully validated legacy path.
 */
export async function createCompatibleOrder(
  input: CreateOrderRequest
): Promise<OperationResult<CreatedOrder>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database write is not configured." };

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "create_store_order" as never,
    {
      p_name: input.name,
      p_phone: input.phone,
      p_email: input.email,
      p_address: input.address,
      p_city: input.city,
      p_payment_method: input.paymentMethod,
      p_notes: input.notes,
      p_coupon_code: input.couponCode,
      p_items: input.items,
      p_ad_cost: input.adCost ?? 0,
    } as never
  );

  if (!rpcError) {
    const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as
      | {
          order_id: string;
          order_number: string;
          tracking_token: string;
          subtotal: number;
          shipping: number;
          discount: number;
          total: number;
        }
      | null;
    if (!row) return { ok: false, error: "The database did not return the new order." };
    return {
      ok: true,
      data: {
        orderId: row.order_id,
        orderNumber: row.order_number,
        trackingToken: row.tracking_token,
        subtotal: Number(row.subtotal),
        shipping: Number(row.shipping),
        discount: Number(row.discount),
        total: Number(row.total),
      },
    };
  }

  if (!missingDatabaseFeature(rpcError)) {
    return { ok: false, error: rpcError.message || "Could not create the order." };
  }

  // Coupon consumption must remain transactional. Never fall back to the
  // legacy multi-query path because it cannot prevent concurrent reuse.
  if (input.couponCode) {
    return {
      ok: false,
      error: "Secure coupon checkout is unavailable. Apply the latest database migrations.",
    };
  }

  const ids = input.items.map((item) => item.id);
  const { data: productsData, error: productsError } = await supabase
    .from("products")
    .select("id, name, cost_price, selling_price, stock_quantity, status")
    .in("id", ids);
  if (productsError) return { ok: false, error: productsError.message };

  const products = (productsData ?? []) as unknown as Array<{
    id: string;
    name: string;
    cost_price: number;
    selling_price: number;
    stock_quantity: number;
    status: string;
  }>;
  const productMap = new Map(products.map((product) => [product.id, product]));
  if (products.length !== ids.length) {
    return { ok: false, error: "One or more products are no longer available." };
  }

  let subtotal = 0;
  for (const item of input.items) {
    const product = productMap.get(item.id)!;
    if (input.requirePublishedProducts && product.status !== "published") {
      return { ok: false, error: `${product.name} is not available for sale.` };
    }
    if (Number(product.stock_quantity) < item.quantity) {
      return { ok: false, error: `Only ${product.stock_quantity} of ${product.name} are available.` };
    }
    subtotal += Number(product.selling_price) * item.quantity;
  }
  subtotal = Number(subtotal.toFixed(2));

  let coupon: Record<string, unknown> | null = null;
  if (input.couponCode) {
    const { data } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", input.couponCode)
      .maybeSingle();
    coupon = data as Record<string, unknown> | null;
    if (!coupon) return { ok: false, error: "The coupon is no longer valid." };
    const rules = await readCompatJson<Record<string, Record<string, unknown>>>("coupons/rules.json", {});
    const rule = rules[input.couponCode];
    if (rule) {
      coupon = {
        ...coupon,
        min_order_amount: rule.minOrderAmount,
        max_discount_amount: rule.maxDiscountAmount,
        starts_at: rule.startsAt,
        usage_limit: rule.usageLimit,
        used_count: rule.usedCount,
      };
    }
  }
  const discount = calculateCouponDiscount(coupon, subtotal);

  const { data: settingsData } = await supabase
    .from("settings")
    .select("*")
    .limit(1)
    .maybeSingle();
  const settings = (settingsData ?? {}) as Record<string, unknown>;
  const flatRate = Number(settings.shipping_flat_rate ?? 10);
  const freeThreshold = Number(settings.free_shipping_threshold ?? 50);
  const shipping = subtotal >= freeThreshold ? 0 : Math.max(0, flatRate);
  const total = Number(Math.max(0, subtotal + shipping - discount).toFixed(2));

  let customerId = "";
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id, total_orders, total_revenue, lifetime_value")
    .eq("phone", input.phone)
    .limit(1)
    .maybeSingle();

  if (existingCustomer) {
    customerId = (existingCustomer as { id: string }).id;
    const { error } = await supabase
      .from("customers")
      .update({
        name: input.name,
        email: input.email || null,
        address: input.address || null,
        city: input.city || null,
      } as never)
      .eq("id", customerId);
    if (error) return { ok: false, error: error.message };
  } else {
    const { data, error } = await supabase
      .from("customers")
      .insert({
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        address: input.address || null,
        city: input.city || null,
      } as never)
      .select("id")
      .single();
    if (error || !data) return { ok: false, error: error?.message || "Could not save customer details." };
    customerId = (data as { id: string }).id;
  }

  const orderNumber = makeOrderNumber();
  const { data: orderData, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      status: "pending",
      payment_method: input.paymentMethod,
      shipping_cost: shipping,
      ad_cost: Math.max(0, input.adCost ?? 0),
      discount_amount: discount,
      revenue: total,
      total,
      notes: input.notes,
    } as never)
    .select("id")
    .single();
  if (orderError || !orderData) {
    return { ok: false, error: orderError?.message || "Could not save the order." };
  }
  const orderId = (orderData as { id: string }).id;

  const rollback = async (updated: Array<{ id: string; quantity: number }>) => {
    for (const item of updated) {
      const product = productMap.get(item.id)!;
      await supabase
        .from("products")
        .update({ stock_quantity: Number(product.stock_quantity) } as never)
        .eq("id", item.id);
    }
    await supabase.from("orders").delete().eq("id", orderId);
  };

  const { error: itemsError } = await supabase.from("order_items").insert(
    input.items.map((item) => {
      const product = productMap.get(item.id)!;
      return {
        order_id: orderId,
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: Number(product.selling_price),
        product_cost: Number(product.cost_price),
      };
    }) as never
  );
  if (itemsError) {
    await rollback([]);
    return { ok: false, error: itemsError.message };
  }

  const updatedStock: Array<{ id: string; quantity: number }> = [];
  for (const item of input.items) {
    const product = productMap.get(item.id)!;
    const { error } = await supabase
      .from("products")
      .update({ stock_quantity: Number(product.stock_quantity) - item.quantity } as never)
      .eq("id", item.id)
      .gte("stock_quantity", item.quantity);
    if (error) {
      await rollback(updatedStock);
      return { ok: false, error: `Could not reserve stock for ${product.name}.` };
    }
    updatedStock.push(item);
  }

  const customer = existingCustomer as
    | { total_orders?: number; total_revenue?: number; lifetime_value?: number }
    | null;
  await supabase
    .from("customers")
    .update({
      total_orders: Number(customer?.total_orders ?? 0) + 1,
      total_revenue: Number(customer?.total_revenue ?? 0) + total,
      lifetime_value: Number(customer?.lifetime_value ?? 0) + total,
    } as never)
    .eq("id", customerId);

  if (input.couponCode && discount > 0) {
    const rulesPath = "coupons/rules.json";
    const rules = await readCompatJson<Record<string, Record<string, unknown>>>(rulesPath, {});
    const rule = rules[input.couponCode] ?? {};
    rules[input.couponCode] = {
      ...rule,
      usedCount: Number(rule.usedCount ?? 0) + 1,
    };
    await writeCompatJson(rulesPath, rules);
    const orderCoupons = await readCompatJson<Record<string, string>>("orders/coupons.json", {});
    orderCoupons[orderId] = input.couponCode;
    await writeCompatJson("orders/coupons.json", orderCoupons);
  }

  await appendCompatOrderEvent({
    orderId,
    previousStatus: null,
    newStatus: "pending",
    note: "Order created",
    actorRole: "system",
  });

  return {
    ok: true,
    data: { orderId, orderNumber, subtotal, shipping, discount, total },
  };
}

export async function updateCompatibleOrderStatus(input: {
  orderId: string;
  status: string;
  reason?: string | null;
  refundAmount?: number | null;
  note?: string | null;
}): Promise<OperationResult<{
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string | null;
  total: number;
}>> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Database write is not configured." };
  const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
  if (!allowed.includes(input.status)) return { ok: false, error: "Unsupported order status." };

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "update_order_status_with_inventory" as never,
    {
      p_order_id: input.orderId,
      p_status: input.status,
      p_reason: input.reason ?? null,
      p_refund_amount: input.refundAmount ?? null,
      p_note: input.note ?? null,
    } as never
  );
  if (!rpcError) {
    const row = (Array.isArray(rpcData) ? rpcData[0] : rpcData) as {
      order_id: string;
      order_number: string;
      customer_name: string | null;
      customer_phone: string | null;
      total: number;
    } | null;
    if (!row) return { ok: false, error: "The order was not found." };
    return { ok: true, data: {
      orderId: row.order_id,
      orderNumber: row.order_number,
      customerName: row.customer_name ?? "there",
      customerPhone: row.customer_phone,
      total: Number(row.total),
    } };
  }
  if (!missingDatabaseFeature(rpcError)) return { ok: false, error: rpcError.message };

  const { data, error } = await supabase
    .from("orders")
    .select("id, customer_id, order_number, status, total, customers(name, phone), order_items(product_id, quantity)")
    .eq("id", input.orderId)
    .maybeSingle();
  if (error || !data) return { ok: false, error: error?.message || "Order not found." };
  const order = data as unknown as {
    id: string;
    customer_id: string | null;
    order_number: string;
    status: string;
    total: number;
    customers?: { name?: string; phone?: string | null } | null;
    order_items?: Array<{ product_id: string | null; quantity: number }>;
  };

  if (order.status !== input.status) {
    const inventoryChanges: Array<{ productId: string; stock: number; quantity: number }> = [];
    const wasReversed = ["cancelled", "returned"].includes(order.status);
    const willReverse = ["cancelled", "returned"].includes(input.status);
    if (wasReversed !== willReverse) {
      const inventory: Array<{ productId: string; stock: number; quantity: number }> = [];
      for (const item of order.order_items ?? []) {
        if (!item.product_id) continue;
        const { data: product } = await supabase
          .from("products")
          .select("stock_quantity")
          .eq("id", item.product_id)
          .maybeSingle();
        if (!product) continue;
        const stock = Number((product as { stock_quantity: number }).stock_quantity);
        if (wasReversed && stock < item.quantity) {
          return { ok: false, error: "There is not enough stock to reopen this order." };
        }
        inventory.push({ productId: item.product_id, stock, quantity: item.quantity });
      }
      for (const item of inventory) {
        const { error: stockError } = await supabase
          .from("products")
          .update({ stock_quantity: willReverse ? item.stock + item.quantity : item.stock - item.quantity } as never)
          .eq("id", item.productId);
        if (stockError) {
          for (const previous of inventoryChanges) {
            await supabase.from("products")
              .update({ stock_quantity: previous.stock } as never)
              .eq("id", previous.productId);
          }
          return { ok: false, error: "Inventory could not be updated for this status change." };
        }
        inventoryChanges.push(item);
      }
    }
    const { error: updateError } = await supabase
      .from("orders")
      .update({ status: input.status } as never)
      .eq("id", order.id);
    if (updateError) {
      for (const previous of inventoryChanges) {
        await supabase.from("products")
          .update({ stock_quantity: previous.stock } as never)
          .eq("id", previous.productId);
      }
      return { ok: false, error: updateError.message };
    }

    if (order.customer_id) {
      const { data: activeOrders } = await supabase
        .from("orders")
        .select("revenue, total")
        .eq("customer_id", order.customer_id)
        .not("status", "in", "(cancelled,returned)");
      const active = (activeOrders ?? []) as Array<{ revenue: number; total: number }>;
      await supabase.from("customers").update({
        total_orders: active.length,
        total_revenue: active.reduce((sum, row) => sum + Number(row.revenue), 0),
        lifetime_value: active.reduce((sum, row) => sum + Number(row.total), 0),
      } as never).eq("id", order.customer_id);
    }

    if (wasReversed !== willReverse) {
      const orderCoupons = await readCompatJson<Record<string, string>>("orders/coupons.json", {});
      const couponCode = orderCoupons[order.id];
      if (couponCode) {
        const rulesPath = "coupons/rules.json";
        const rules = await readCompatJson<Record<string, Record<string, unknown>>>(rulesPath, {});
        const rule = rules[couponCode] ?? {};
        rules[couponCode] = {
          ...rule,
          usedCount: Math.max(0, Number(rule.usedCount ?? 0) + (willReverse ? -1 : 1)),
        };
        await writeCompatJson(rulesPath, rules);
      }
    }


    await appendCompatOrderEvent({
      orderId: order.id,
      previousStatus: order.status,
      newStatus: input.status,
      reason: input.reason,
      refundAmount: input.refundAmount,
      note: input.note,
      actorRole: "admin",
    });
  }

  return { ok: true, data: {
    orderId: order.id,
    orderNumber: order.order_number,
    customerName: order.customers?.name ?? "there",
    customerPhone: order.customers?.phone ?? null,
    total: Number(order.total),
  } };
}
