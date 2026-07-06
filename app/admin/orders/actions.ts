"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { notifyOrder, templateForStatus } from "@/lib/whatsapp";

export type OrderFormState = {
  status: "idle" | "success" | "error";
  message: string;
};

export async function updateOrderStatusAction(formData: FormData) {
  const id = String(formData.get("orderId") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !status) return;

  const reason = String(formData.get("reason") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;
  const refundAmountRaw = String(formData.get("refundAmount") ?? "").trim();
  const refundAmount = refundAmountRaw ? Number(refundAmountRaw) : null;

  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const { data, error } = await supabase.rpc(
    "update_order_status_with_inventory",
    {
      p_order_id: id,
      p_status: status,
      p_reason: reason,
      p_refund_amount: Number.isFinite(refundAmount as number) ? refundAmount : null,
      p_note: note,
    } as never
  );

  if (error) {
    console.error("[admin] updateOrderStatus failed:", error.message);
    revalidatePath("/admin/orders");
    return;
  }

  const order = (Array.isArray(data) ? data[0] : data) as
    | {
        order_id: string;
        order_number: string;
        customer_name: string | null;
        customer_phone: string | null;
        total: number;
        previous_status: string;
        new_status: string;
      }
    | null;

  if (!order) {
    revalidatePath("/admin/orders");
    return;
  }

  const templateKey = templateForStatus(status);
  if (templateKey) {
    await notifyOrder({
      orderId: order.order_id,
      orderNumber: order.order_number,
      customerName: order.customer_name ?? "there",
      phone: order.customer_phone ?? null,
      total: Number(order.total),
      templateKey,
    });
  }

  revalidatePath("/admin/orders");
}

type ManualOrderItem = {
  productId: string;
  quantity: number;
};

function parseManualOrderItems(value: FormDataEntryValue | null): ManualOrderItem[] {
  try {
    const parsed = JSON.parse(String(value ?? "[]")) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const productId = String((item as { productId?: unknown }).productId ?? "").trim();
        const quantityRaw = Number((item as { quantity?: unknown }).quantity ?? 0);
        const quantity = Math.max(1, Math.floor(quantityRaw));
        if (!productId || !Number.isFinite(quantity)) return null;
        return { productId, quantity };
      })
      .filter(Boolean) as ManualOrderItem[];
  } catch {
    return [];
  }
}

export async function createManualOrderAction(
  _prev: OrderFormState,
  formData: FormData
): Promise<OrderFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const address = String(formData.get("address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const paymentRaw = String(formData.get("payment") ?? "cod").toLowerCase();
  const payment = paymentRaw.includes("stripe") ? "stripe" : "cod";
  const statusRaw = String(formData.get("status") ?? "confirmed").toLowerCase();
  const status = ["pending", "confirmed", "processing", "shipped", "delivered"].includes(statusRaw)
    ? statusRaw
    : "confirmed";
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const items = parseManualOrderItems(formData.get("itemsJson"));

  if (!name) return { status: "error", message: "Customer name is required." };
  if (!phone) return { status: "error", message: "Customer phone is required." };
  if (!items.length) return { status: "error", message: "Add at least one item." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: "Database write is not configured." };

  const ids = items.map((item) => item.productId);
  const { data: productsRaw, error: productsError } = await supabase
    .from("products")
    .select("id, name, slug, selling_price, cost_price, stock_quantity")
    .in("id", ids);

  if (productsError) {
    console.error("[admin] manual order products lookup failed:", productsError.message);
    return { status: "error", message: "Could not validate products." };
  }

  const products = (productsRaw ?? []) as {
    id: string;
    name: string;
    slug: string;
    selling_price: number;
    cost_price: number;
    stock_quantity: number;
  }[];

  const productMap = new Map(
    products.map((product) => [
      product.id,
      {
        name: product.name,
        slug: product.slug,
        price: Number(product.selling_price),
        cost: Number(product.cost_price),
        stock: Number(product.stock_quantity),
      },
    ])
  );

  const orderItems = items
    .map((item) => {
      const product = productMap.get(item.productId);
      if (!product) return null;
      return {
        product_id: item.productId,
        product_name: product.name,
        quantity: item.quantity,
        unit_price: product.price,
        product_cost: product.cost,
        stock_quantity: product.stock,
        slug: product.slug,
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

  if (!orderItems.length) {
    return { status: "error", message: "None of the selected products are available." };
  }

  const stockIssue = orderItems.find((item) => item.quantity > item.stock_quantity);
  if (stockIssue) {
    return {
      status: "error",
      message: `Only ${stockIssue.stock_quantity} units of ${stockIssue.product_name} are available.`,
    };
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  const shipping = subtotal >= 50 ? 0 : 10;
  const total = subtotal + shipping;

  let customerId: string | null = null;
  const { data: existingCustomer } = await supabase
    .from("customers")
    .select("id")
    .eq("phone", phone)
    .limit(1)
    .maybeSingle<{ id: string }>();

  if (existingCustomer?.id) {
    customerId = existingCustomer.id;
  } else {
    const { data: createdCustomer, error: customerError } = await supabase
      .from("customers")
      .insert({
        name,
        phone,
        email: email || null,
        address: address || null,
        city: city || null,
      } as never)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (customerError || !createdCustomer?.id) {
      console.error("[admin] create customer failed:", customerError?.message);
      return { status: "error", message: "Could not create the customer." };
    }

    customerId = createdCustomer.id;
  }

  const orderNumber = `TV-${Date.now().toString(36).toUpperCase()}`;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_id: customerId,
      order_number: orderNumber,
      status,
      payment_method: payment,
      shipping_cost: shipping,
      ad_cost: 0,
      discount_amount: 0,
      revenue: subtotal,
      total,
      notes,
    } as never)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (orderError || !order) {
    console.error("[admin] manual order insert failed:", orderError?.message);
    return { status: "error", message: "Could not create the order." };
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
    console.error("[admin] manual order items insert failed:", itemsError.message);
    return { status: "error", message: "Could not save order items." };
  }

  for (const item of orderItems) {
    const nextStock = Math.max(0, item.stock_quantity - item.quantity);
    const { error: stockError } = await supabase
      .from("products")
      .update({ stock_quantity: nextStock } as never)
      .eq("id", item.product_id)
      .eq("stock_quantity", item.stock_quantity);

    if (stockError) {
      console.error("[admin] manual order stock update failed:", stockError.message);
    }
  }

  revalidatePath("/admin/orders");
  revalidatePath("/admin");

  const templateKey = templateForStatus(status) ?? "order_created";
  await notifyOrder({
    orderId: order.id,
    orderNumber,
    customerName: name,
    phone,
    total,
    templateKey,
  });

  return { status: "success", message: `Manual order ${orderNumber} created.` };
}
