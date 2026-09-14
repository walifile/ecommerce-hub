import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_THEME, resolveTheme, type ThemeId } from "@/lib/themes";
import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";
import { listAllProductReviews } from "@/lib/review-store";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  productCount: number;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  comparePrice?: number;
  costPrice: number;
  stockQuantity: number;
  lowStockLimit: number;
  rating: number;
  reviewsCount: number;
  description: string;
  shortDescription: string;
  metaTitle: string;
  metaDescription: string;
  specifications: string[];
  image: string;
  gallery: string[];
  status: "draft" | "published";
  featured?: boolean;
  isNew?: boolean;
  bestSeller?: boolean;
};

export type Testimonial = {
  name: string;
  company: string;
  quote: string;
};

export type ProductReview = {
  id: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  createdAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  totalOrders: number;
  totalRevenue: number;
  lifetimeValue: number;
};

export type OrderItem = {
  productName: string;
  quantity: number;
  unitPrice: number;
  productCost: number;
};

export type OrderEvent = {
  id: string;
  previousStatus: string | null;
  newStatus: string;
  reason: string;
  refundAmount: number | null;
  note: string;
  actorRole: string;
  createdAt: string;
};

export type Order = {
  id: string;
  customerId?: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
  customerCity: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned";
  paymentMethod: "cod" | "stripe";
  paymentStatus?: string;
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paidAt?: string;
  shippingCost: number;
  adCost: number;
  discount: number;
  couponCode?: string;
  reversalReason?: string;
  refundAmount?: number;
  reversalNote?: string;
  reversedAt?: string;
  events?: OrderEvent[];
  revenue: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
};

export type Expense = {
  id: string;
  title: string;
  expenseType: "advertising" | "shipping" | "salary" | "miscellaneous";
  amount: number;
  date: string;
};

export type Coupon = {
  id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  active: boolean;
  startsAt?: string;
  expiresAt?: string;
  usageLimit?: number;
  usedCount: number;
};

export type AiFaq = { question: string; answer: string };

export type AiGeneration = {
  id: string;
  productName: string;
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
  faq: AiFaq[];
  createdAt: string;
};

export type WhatsAppLog = {
  id: string;
  templateName: string;
  phone: string;
  status: string;
  sentAt: string;
};

export type DashboardSeriesPoint = {
  label: string;
  revenue: number;
  profit: number;
  orders: number;
};

export type StoreSettings = {
  storeName: string;
  supportEmail: string;
  supportPhone: string;
  heroTitle: string;
  heroSubtitle: string;
  theme: ThemeId;
  announcementEnabled: boolean;
  announcementMessage: string;
  announcementLinkText: string;
  announcementLinkHref: string;
  whatsappTemplateOrderCreated: string;
  whatsappTemplateOrderConfirmed: string;
  whatsappTemplateOrderShipped: string;
  whatsappTemplateOrderDelivered: string;
  shippingFlatRate: number;
  freeShippingThreshold: number;
};

export type StoreBanner = Pick<
  StoreSettings,
  | "announcementEnabled"
  | "announcementMessage"
  | "announcementLinkText"
  | "announcementLinkHref"
>;

export type StoreDetails = Pick<
  StoreSettings,
  "storeName" | "supportEmail" | "supportPhone" | "heroTitle" | "heroSubtitle"
>;

export type CatalogData = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
  coupons: Coupon[];
  aiGenerations: AiGeneration[];
  whatsappLogs: WhatsAppLog[];
  testimonials: Testimonial[];
  trend: DashboardSeriesPoint[];
  settings: StoreSettings;
};

const mockTestimonials: Testimonial[] = [
  {
    name: "Rimsha Siddiqui",
    company: "Solo skincare brand",
    quote: "The dashboard shape is exactly what a single-store operator needs: product, cashflow, and order clarity in one view.",
  },
  {
    name: "Bilal Ahmed",
    company: "DTC supplements",
    quote: "The Phase 1 structure covers the real daily jobs: tracking ads, reviewing margins, and fixing low stock before it hurts sales.",
  },
  {
    name: "Maham Tariq",
    company: "Home goods store",
    quote: "The public store and admin surface feel aligned. It already reads like a business tool, not a template dump.",
  },
];

const mockTrend: DashboardSeriesPoint[] = [
  { label: "Mon", revenue: 420, profit: 182, orders: 8 },
  { label: "Tue", revenue: 510, profit: 224, orders: 10 },
  { label: "Wed", revenue: 460, profit: 201, orders: 9 },
  { label: "Thu", revenue: 580, profit: 254, orders: 12 },
  { label: "Fri", revenue: 610, profit: 271, orders: 13 },
  { label: "Sat", revenue: 690, profit: 304, orders: 14 },
  { label: "Sun", revenue: 640, profit: 286, orders: 11 },
];

const mockSettings: StoreSettings = {
  storeName: "Ecommerce Hub",
  supportEmail: "support@ecommercehub.local",
  supportPhone: "+92 300 1234567",
  heroTitle: "Operate one store with the control surface it actually needs.",
  heroSubtitle:
    "Phase 1 combines the storefront, product engine, order workflow, customer history, and profit tracking in a single Next.js plus Supabase stack.",
  theme: DEFAULT_THEME,
  announcementEnabled: true,
  announcementMessage: "Limited drops are live. Free delivery on orders over Rs. 5,000.",
  announcementLinkText: "Shop now",
  announcementLinkHref: "/shop",
  whatsappTemplateOrderCreated: "Hi {customerName}! We received order {orderNumber} ({total}). We'll confirm it shortly.",
  whatsappTemplateOrderConfirmed: "Good news {customerName}! Order {orderNumber} is confirmed and being prepared.",
  whatsappTemplateOrderShipped: "Order {orderNumber} has shipped and is on its way.",
  whatsappTemplateOrderDelivered: "Order {orderNumber} has been delivered. Thank you for shopping with us!",
  shippingFlatRate: 10,
  freeShippingThreshold: 50,
};

const SETTINGS_OVERRIDE_PATH = "settings/phase1.json";

async function readSettingsOverrides() {
  return readCompatJson<Partial<StoreSettings>>(SETTINGS_OVERRIDE_PATH, {});
}

async function writeSettingsOverrides(input: Partial<StoreSettings>) {
  const current = await readSettingsOverrides();
  return writeCompatJson(SETTINGS_OVERRIDE_PATH, { ...current, ...input });
}

/** Lightweight read of just the active storefront theme (used by the layout). */
export async function getActiveTheme(): Promise<ThemeId> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return DEFAULT_THEME;

  const { data, error } = await supabase
    .from("settings")
    .select("theme")
    .limit(1)
    .maybeSingle();

  if (error || !data) return DEFAULT_THEME;
  return resolveTheme((data as { theme?: unknown }).theme);
}

/** Persist the active storefront theme (used by the admin settings action). */
export async function updateStoreTheme(
  theme: ThemeId
): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const existingId = (existing as { id?: string } | null)?.id;

  const { error } = existingId
    ? await supabase
        .from("settings")
        .update({ theme } as never)
        .eq("id", existingId)
    : await supabase.from("settings").insert({ theme } as never);

  if (error) {
    console.error("[settings] theme update failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

export async function getStoreBanner(): Promise<StoreBanner> {
  const supabase = getSupabaseServerClient();
  const overrides = await readSettingsOverrides();
  if (!supabase) return { ...mockSettings, ...overrides };

  const { data, error } = await supabase
    .from("settings")
    .select(
      "announcement_enabled, announcement_message, announcement_link_text, announcement_link_href"
    )
    .limit(1)
    .maybeSingle();

  if (error || !data) return { ...mockSettings, ...overrides };

  const row = data as Partial<
    Pick<
      Database["public"]["Tables"]["settings"]["Row"],
      | "announcement_enabled"
      | "announcement_message"
      | "announcement_link_text"
      | "announcement_link_href"
    >
  >;

  return {
    announcementEnabled: overrides.announcementEnabled ??
      row.announcement_enabled ?? mockSettings.announcementEnabled,
    announcementMessage: overrides.announcementMessage ??
      row.announcement_message ?? mockSettings.announcementMessage,
    announcementLinkText: overrides.announcementLinkText ??
      row.announcement_link_text ?? mockSettings.announcementLinkText,
    announcementLinkHref: overrides.announcementLinkHref ??
      row.announcement_link_href ?? mockSettings.announcementLinkHref,
  };
}

export async function updateStoreBanner(input: StoreBanner): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const payload = {
    announcement_enabled: input.announcementEnabled,
    announcement_message: input.announcementMessage,
    announcement_link_text: input.announcementLinkText,
    announcement_link_href: input.announcementLinkHref,
  };

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const existingId = (existing as { id?: string } | null)?.id;

  const { error } = existingId
    ? await supabase
        .from("settings")
        .update(payload as never)
        .eq("id", existingId)
    : await supabase.from("settings").insert(payload as never);

  if (error) {
    console.error("[settings] banner update failed:", error.message);
    return writeSettingsOverrides(input);
  }
  await writeSettingsOverrides(input);
  return { ok: true };
}

export async function updateStoreDetails(input: StoreDetails): Promise<{
  ok: boolean;
  error?: string;
}> {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return { ok: false, error: "Supabase is not configured." };
  }

  const payload = {
    store_name: input.storeName,
    support_email: input.supportEmail || null,
    support_phone: input.supportPhone || null,
    hero_title: input.heroTitle,
    hero_subtitle: input.heroSubtitle,
  };

  const { data: existing } = await supabase
    .from("settings")
    .select("id")
    .limit(1)
    .maybeSingle();

  const existingId = (existing as { id?: string } | null)?.id;

  const { error } = existingId
    ? await supabase
        .from("settings")
        .update(payload as never)
        .eq("id", existingId)
    : await supabase.from("settings").insert(payload as never);

  if (error) {
    console.error("[settings] store details update failed:", error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true };
}

export async function getStorefrontDetails(): Promise<StoreDetails> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return mockSettings;
  const { data, error } = await supabase
    .from("settings")
    .select("store_name, support_email, support_phone, hero_title, hero_subtitle")
    .limit(1)
    .maybeSingle();
  if (error || !data) return mockSettings;
  const row = data as {
    store_name?: string | null;
    support_email?: string | null;
    support_phone?: string | null;
    hero_title?: string | null;
    hero_subtitle?: string | null;
  };
  return {
    storeName: row.store_name || mockSettings.storeName,
    supportEmail: row.support_email || mockSettings.supportEmail,
    supportPhone: row.support_phone || mockSettings.supportPhone,
    heroTitle: row.hero_title || mockSettings.heroTitle,
    heroSubtitle: row.hero_subtitle || mockSettings.heroSubtitle,
  };
}

export type OperationsSettings = Pick<StoreSettings,
  | "whatsappTemplateOrderCreated" | "whatsappTemplateOrderConfirmed"
  | "whatsappTemplateOrderShipped" | "whatsappTemplateOrderDelivered"
  | "shippingFlatRate" | "freeShippingThreshold"
>;

export async function updateOperationsSettings(input: OperationsSettings): Promise<{ ok: boolean; error?: string }> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { ok: false, error: "Supabase is not configured." };
  const payload = {
    whatsapp_template_order_created: input.whatsappTemplateOrderCreated,
    whatsapp_template_order_confirmed: input.whatsappTemplateOrderConfirmed,
    whatsapp_template_order_shipped: input.whatsappTemplateOrderShipped,
    whatsapp_template_order_delivered: input.whatsappTemplateOrderDelivered,
    shipping_flat_rate: input.shippingFlatRate,
    free_shipping_threshold: input.freeShippingThreshold,
  };
  const { data: existing } = await supabase.from("settings").select("id").limit(1).maybeSingle();
  const id = (existing as { id?: string } | null)?.id;
  const { error } = id
    ? await supabase.from("settings").update(payload as never).eq("id", id)
    : await supabase.from("settings").insert(payload as never);
  if (error) {
    // Legacy settings tables already contain the WhatsApp columns but not the
    // shipping fields. Persist the supported portion there and keep the full
    // configuration in private compatibility storage.
    const legacyPayload = {
      whatsapp_template_order_created: input.whatsappTemplateOrderCreated,
      whatsapp_template_order_confirmed: input.whatsappTemplateOrderConfirmed,
      whatsapp_template_order_shipped: input.whatsappTemplateOrderShipped,
      whatsapp_template_order_delivered: input.whatsappTemplateOrderDelivered,
    };
    const legacyResult = id
      ? await supabase.from("settings").update(legacyPayload as never).eq("id", id)
      : await supabase.from("settings").insert(legacyPayload as never);
    if (legacyResult.error) return { ok: false, error: legacyResult.error.message };
  }
  return writeSettingsOverrides(input);
}

function calculateOrderProfit(order: Order) {
  const productCost = order.items.reduce(
    (sum, item) => sum + item.productCost * item.quantity,
    0
  );

  return order.revenue - productCost - order.shippingCost - order.adCost;
}

function mapSpecifications(value: Database["public"]["Tables"]["products"]["Row"]["specifications"]) {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }

  return [];
}

async function readSupabaseCatalog(): Promise<CatalogData | null> {
  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return null;
  }

  const [categoriesResult, productsResult, productImagesResult, customersResult, ordersResult, orderEventsResult, expensesResult, couponsResult, aiResult, whatsappResult, settingsResult, settingsOverrides, couponRules, compatOrderEvents] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("product_images").select("*").order("sort_order"),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("order_events" as never).select("*").order("created_at", { ascending: true }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      // Some existing Phase 1 databases predate coupons.created_at. Sorting in
      // memory keeps those installations usable until migrations are applied.
      supabase.from("coupons").select("*"),
      supabase.from("ai_generations").select("*").order("created_at", { ascending: false }),
      supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").limit(1).maybeSingle(),
      readSettingsOverrides(),
      readCompatJson<Record<string, {
        minOrderAmount?: number;
        maxDiscountAmount?: number | null;
        startsAt?: string | null;
        usageLimit?: number | null;
        usedCount?: number;
      }>>("coupons/rules.json", {}),
      readCompatJson<Database["public"]["Tables"]["order_events"]["Row"][]>("orders/events.json", []),
    ]);

  // Log any per-table errors but keep whatever loaded — a single failing table
  // must not blank the whole catalog or fall back to static/mock data.
  if (categoriesResult.error)
    console.error("[catalog] categories read failed:", categoriesResult.error.message);
  if (productsResult.error)
    console.error("[catalog] products read failed:", productsResult.error.message);
  if (productImagesResult.error)
    console.error("[catalog] product_images read failed:", productImagesResult.error.message);
  if (customersResult.error)
    console.error("[catalog] customers read failed:", customersResult.error.message);
  if (ordersResult.error)
    console.error("[catalog] orders read failed:", ordersResult.error.message);
  if (orderEventsResult.error && orderEventsResult.error.code !== "PGRST205")
    console.error("[catalog] order_events read failed:", orderEventsResult.error.message);
  if (expensesResult.error)
    console.error("[catalog] expenses read failed:", expensesResult.error.message);
  if (couponsResult.error)
    console.error("[catalog] coupons read failed:", couponsResult.error.message);
  if (aiResult.error)
    console.error("[catalog] ai_generations read failed:", aiResult.error.message);
  if (whatsappResult.error)
    console.error("[catalog] whatsapp_logs read failed:", whatsappResult.error.message);
  if (settingsResult.error)
    console.error("[catalog] settings read failed:", settingsResult.error.message);

  const categoriesRows =
    (categoriesResult.data ?? []) as Database["public"]["Tables"]["categories"]["Row"][];
  const productsRows =
    (productsResult.data ?? []) as Database["public"]["Tables"]["products"]["Row"][];
  const productImagesRows =
    (productImagesResult.data ?? []) as Database["public"]["Tables"]["product_images"]["Row"][];
  const customersRows =
    (customersResult.data ?? []) as Database["public"]["Tables"]["customers"]["Row"][];
  const ordersRows = (ordersResult.data ?? []) as (Database["public"]["Tables"]["orders"]["Row"] & {
    order_items?: Database["public"]["Tables"]["order_items"]["Row"][];
  })[];
  const orderEventRows = [
    ...((orderEventsResult.data ?? []) as unknown as Database["public"]["Tables"]["order_events"]["Row"][]),
    ...compatOrderEvents,
  ];
  const expensesRows =
    (expensesResult.data ?? []) as Database["public"]["Tables"]["expenses"]["Row"][];
  const couponRows =
    (couponsResult.data ?? []) as Database["public"]["Tables"]["coupons"]["Row"][];
  const aiRows =
    (aiResult.data ?? []) as Database["public"]["Tables"]["ai_generations"]["Row"][];
  const whatsappRows =
    (whatsappResult.data ?? []) as Database["public"]["Tables"]["whatsapp_logs"]["Row"][];
  const settingsRow =
    (settingsResult.data as Database["public"]["Tables"]["settings"]["Row"] | null) ??
    null;

  const categories = categoriesRows.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    image: category.image_url ?? "",
    productCount: productsRows.filter(
      (product) => product.category_id === category.id && product.status === "published"
    ).length,
  }));

  const products = productsRows.map((product) => {
    const category = categories.find((item) => item.id === product.category_id);
    const gallery = productImagesRows
      .filter((image) => image.product_id === product.id)
      .map((image) => image.image_url);

    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      category: category?.name ?? "Uncategorized",
      price: Number(product.selling_price),
      comparePrice: product.compare_price ? Number(product.compare_price) : undefined,
      costPrice: Number(product.cost_price),
      stockQuantity: product.stock_quantity,
      lowStockLimit: product.low_stock_limit,
      rating: Number(product.rating ?? 0),
      reviewsCount: product.reviews_count,
      shortDescription: product.short_description ?? "",
      description: product.description ?? "",
      metaTitle: product.meta_title ?? "",
      metaDescription: product.meta_description ?? "",
      specifications: mapSpecifications(product.specifications),
      image: product.image_url ?? "",
      gallery: gallery.length
        ? gallery
        : product.image_url
          ? [product.image_url]
          : [],
      status: product.status === "published" ? "published" : "draft",
      featured: product.featured,
      isNew: product.is_new,
      bestSeller: product.best_seller,
    } satisfies Product;
  });

  const customers = customersRows.map((customer) => ({
    id: customer.id,
    name: customer.name,
    phone: customer.phone ?? "",
    email: customer.email ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    totalOrders: customer.total_orders,
    totalRevenue: Number(customer.total_revenue),
    lifetimeValue: Number(customer.lifetime_value),
  }));

  const orders = ordersRows.map((order) => {
    const customer = customers.find((item) => item.id === order.customer_id);
    const orderItems = order.order_items ?? [];
    const stripeFields = order as typeof order & {
      payment_status?: string | null;
      stripe_session_id?: string | null;
      stripe_payment_intent_id?: string | null;
      paid_at?: string | null;
    };

    return {
      id: order.id,
      customerId: order.customer_id ?? undefined,
      orderNumber: order.order_number,
      customerName: customer?.name ?? "Guest customer",
      customerPhone: customer?.phone ?? "",
      customerEmail: customer?.email ?? "",
      customerAddress: customer?.address ?? "",
      customerCity: customer?.city ?? "",
      status: (order.status as Order["status"]) ?? "pending",
      paymentMethod: order.payment_method === "stripe" ? "stripe" : "cod",
      paymentStatus: stripeFields.payment_status ?? undefined,
      stripeSessionId: stripeFields.stripe_session_id ?? undefined,
      stripePaymentIntentId: stripeFields.stripe_payment_intent_id ?? undefined,
      paidAt: stripeFields.paid_at ?? undefined,
      shippingCost: Number(order.shipping_cost),
      adCost: Number(order.ad_cost),
      discount: Number(order.discount_amount),
      couponCode: order.coupon_code ?? undefined,
      reversalReason: order.reversal_reason ?? undefined,
      refundAmount:
        order.refund_amount === null || order.refund_amount === undefined
          ? undefined
          : Number(order.refund_amount),
      reversalNote: order.reversal_note ?? undefined,
      reversedAt: order.reversed_at ?? undefined,
      events: orderEventRows
        .filter((event) => event.order_id === order.id)
        .slice()
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((event) => ({
        id: event.id,
        previousStatus: event.previous_status,
        newStatus: event.new_status,
        reason: event.reason ?? "",
        refundAmount:
          event.refund_amount === null || event.refund_amount === undefined
            ? null
            : Number(event.refund_amount),
        note: event.note ?? "",
        actorRole: event.actor_role,
        createdAt: event.created_at,
      })),
      revenue: Number(order.revenue),
      total: Number(order.total),
      createdAt: order.created_at.slice(0, 10),
      items: orderItems.map((item) => ({
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        productCost: Number(item.product_cost),
      })),
    } satisfies Order;
  });

  const expenses = expensesRows.map((expense) => ({
    id: expense.id,
    title: expense.title,
    expenseType: expense.expense_type as Expense["expenseType"],
    amount: Number(expense.amount),
    date: expense.expense_date,
  }));

  const coupons = couponRows.map((coupon) => {
    const rule = couponRules[coupon.code];
    return ({
    id: coupon.id,
    code: coupon.code,
    discountType:
      coupon.discount_type === "percentage" ? "percentage" : "fixed",
    discountValue: Number(coupon.discount_value),
    minOrderAmount: Number(rule?.minOrderAmount ?? coupon.min_order_amount ?? 0),
    maxDiscountAmount:
      (rule?.maxDiscountAmount ?? coupon.max_discount_amount) === null ||
      (rule?.maxDiscountAmount ?? coupon.max_discount_amount) === undefined
        ? undefined
        : Number(rule?.maxDiscountAmount ?? coupon.max_discount_amount),
    active: coupon.active,
    startsAt: rule?.startsAt ?? coupon.starts_at ?? undefined,
    expiresAt: coupon.expires_at ?? undefined,
    usageLimit:
      (rule?.usageLimit ?? coupon.usage_limit) === null || (rule?.usageLimit ?? coupon.usage_limit) === undefined
        ? undefined
        : Number(rule?.usageLimit ?? coupon.usage_limit),
    usedCount: Number(rule?.usedCount ?? coupon.used_count ?? 0),
  } satisfies Coupon);
  });

  const aiGenerations = aiRows.map((row) => ({
    id: row.id,
    productName: row.product_name,
    productTitle: row.product_title ?? "",
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    faq: Array.isArray(row.faq)
      ? row.faq.map((item): AiFaq =>
          item && typeof item === "object"
            ? {
                question: String((item as Record<string, unknown>).question ?? ""),
                answer: String((item as Record<string, unknown>).answer ?? ""),
              }
            : { question: String(item), answer: "" }
        )
      : [],
    createdAt: row.created_at.slice(0, 10),
  }));

  const whatsappLogs = whatsappRows.map((row) => ({
    id: row.id,
    templateName: row.template_name,
    phone: row.phone ?? "",
    status: row.status,
    sentAt: row.sent_at ?? "Pending",
  }));

  const trend = mockTrend;

  return {
    categories,
    products,
    customers,
    orders,
    expenses,
    coupons,
    aiGenerations,
    whatsappLogs,
    testimonials: mockTestimonials,
    trend,
    settings: {
      storeName: settingsRow?.store_name ?? mockSettings.storeName,
      supportEmail: settingsRow?.support_email ?? mockSettings.supportEmail,
      supportPhone: settingsRow?.support_phone ?? mockSettings.supportPhone,
      heroTitle: settingsRow?.hero_title ?? mockSettings.heroTitle,
      heroSubtitle: settingsRow?.hero_subtitle ?? mockSettings.heroSubtitle,
      theme: resolveTheme(settingsRow?.theme),
      announcementEnabled: settingsOverrides.announcementEnabled ??
        settingsRow?.announcement_enabled ?? mockSettings.announcementEnabled,
      announcementMessage: settingsOverrides.announcementMessage ??
        settingsRow?.announcement_message ?? mockSettings.announcementMessage,
      announcementLinkText: settingsOverrides.announcementLinkText ??
        settingsRow?.announcement_link_text ?? mockSettings.announcementLinkText,
      announcementLinkHref: settingsOverrides.announcementLinkHref ??
        settingsRow?.announcement_link_href ?? mockSettings.announcementLinkHref,
      whatsappTemplateOrderCreated: settingsOverrides.whatsappTemplateOrderCreated ??
        settingsRow?.whatsapp_template_order_created ?? mockSettings.whatsappTemplateOrderCreated,
      whatsappTemplateOrderConfirmed: settingsOverrides.whatsappTemplateOrderConfirmed ??
        settingsRow?.whatsapp_template_order_confirmed ?? mockSettings.whatsappTemplateOrderConfirmed,
      whatsappTemplateOrderShipped: settingsOverrides.whatsappTemplateOrderShipped ??
        settingsRow?.whatsapp_template_order_shipped ?? mockSettings.whatsappTemplateOrderShipped,
      whatsappTemplateOrderDelivered: settingsOverrides.whatsappTemplateOrderDelivered ??
        settingsRow?.whatsapp_template_order_delivered ?? mockSettings.whatsappTemplateOrderDelivered,
      shippingFlatRate: Number(settingsOverrides.shippingFlatRate ?? settingsRow?.shipping_flat_rate ?? mockSettings.shippingFlatRate),
      freeShippingThreshold: Number(settingsOverrides.freeShippingThreshold ?? settingsRow?.free_shipping_threshold ?? mockSettings.freeShippingThreshold),
    },
  };
}

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

/** Storefront categories from the DB (used by the homepage "Browse by category"). */
export async function getCategories(): Promise<StoreCategory[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, image_url")
    .order("name");

  if (error || !data) return [];

  return (
    data as {
      id: string;
      name: string;
      slug: string;
      image_url: string | null;
    }[]
  ).map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image_url ?? "",
  }));
}

export async function getCatalogData(): Promise<CatalogData> {
  const supabaseData = await readSupabaseCatalog();

  if (supabaseData) {
    return supabaseData;
  }

  // Supabase is not configured — return an empty catalog (never static/mock
  // entities). testimonials/trend have no DB table and stay as presentational
  // defaults; settings falls back to its default banner/theme.
  return {
    categories: [],
    products: [],
    customers: [],
    orders: [],
    expenses: [],
    coupons: [],
    aiGenerations: [],
    whatsappLogs: [],
    testimonials: mockTestimonials,
    trend: mockTrend,
    settings: mockSettings,
  };
}

export async function listProducts(filters?: {
  query?: string;
  category?: string;
  sort?: string;
  maxPrice?: number;
}) {
  const { products } = await getCatalogData();
  let items = [...products].filter((product) => product.status === "published");

  if (filters?.query) {
    const query = filters.query.toLowerCase();
    items = items.filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query)
    );
  }

  if (filters?.category && filters.category !== "all") {
    items = items.filter((product) => product.category === filters.category);
  }

  if (typeof filters?.maxPrice === "number" && !Number.isNaN(filters.maxPrice)) {
    const maxPrice = filters.maxPrice;
    items = items.filter((product) => product.price <= maxPrice);
  }

  switch (filters?.sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "rating":
      items.sort((a, b) => b.rating - a.rating);
      break;
    default:
      items.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false));
      break;
  }

  return items;
}

export async function getProductBySlug(slug: string) {
  const { products } = await getCatalogData();
  return products.find(
    (product) => product.slug === slug && product.status === "published"
  );
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const rows = await listAllProductReviews();
  return rows.filter((row) => row.productId === productId && row.status === "approved").map((row) => ({
    id: row.id,
    reviewerName: row.reviewerName,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt,
  }));
}

export async function getHomepageReviews(): Promise<Array<ProductReview & { productName: string }>> {
  const rows = await listAllProductReviews();
  return rows.filter((row) => row.status === "approved").slice(0, 6).map((row) => ({
    id: row.id, reviewerName: row.reviewerName, rating: row.rating,
    title: row.title, body: row.body, createdAt: row.createdAt,
    productName: row.productName || "Verified purchase",
  }));
}

export async function getRelatedProducts(slug: string) {
  const product = await getProductBySlug(slug);

  if (!product) {
    return [];
  }

  const { products } = await getCatalogData();

  return products
    .filter(
      (item) =>
        item.status === "published" &&
        item.slug !== slug &&
        item.category === product.category
    )
    .slice(0, 3);
}

export async function getOrderByNumber(orderNumber?: string) {
  if (!orderNumber) {
    return null;
  }

  const { orders } = await getCatalogData();
  return orders.find(
    (order) => order.orderNumber.toLowerCase() === orderNumber.toLowerCase()
  );
}

/** Public tracking lookup. A high-entropy token, or order number plus phone,
 * is required before any order details are returned. */
export async function getTrackedOrder(input: {
  trackingToken?: string;
  orderNumber?: string;
  phone?: string;
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;

  let id: string | null = null;
  if (input.trackingToken) {
    const { data } = await supabase.from("orders").select("id")
      .eq("tracking_token" as never, input.trackingToken).maybeSingle<{ id: string }>();
    id = data?.id ?? null;
  } else if (input.orderNumber && input.phone) {
    const { data } = await supabase.from("orders")
      .select("id, customers(phone)")
      .eq("order_number", input.orderNumber.trim().toUpperCase())
      .maybeSingle();
    const row = data as { id?: string; customers?: { phone?: string | null } | null } | null;
    const normalize = (value: string) => value.replace(/\D/g, "");
    if (row?.id && normalize(row.customers?.phone ?? "") === normalize(input.phone)) {
      id = row.id;
    }
  }
  if (!id) return null;
  return getOrderById(id);
}

export async function getOrderById(id?: string) {
  if (!id) {
    return null;
  }

  const { orders } = await getCatalogData();
  return orders.find((order) => order.id === id) ?? null;
}

export async function getCustomerById(id?: string) {
  if (!id) {
    return null;
  }

  const { customers, orders } = await getCatalogData();
  const customer = customers.find((item) => item.id === id);

  if (!customer) {
    return null;
  }

  const customerOrders = orders.filter(
    (order) =>
      order.customerId === customer.id ||
      (!order.customerId &&
        (order.customerPhone === customer.phone ||
          order.customerEmail === customer.email))
  );

  return {
    customer,
    orders: customerOrders,
  };
}

export async function getDashboardData() {
  const data = await getCatalogData();
  const activeOrders = data.orders.filter((order) => !["cancelled", "returned"].includes(order.status));
  const totalRevenue = activeOrders.reduce((sum, order) => sum + order.revenue, 0);
  const totalProfit = activeOrders.reduce((sum, order) => sum + calculateOrderProfit(order), 0);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const profitSince = (start: Date) => activeOrders
    .filter((order) => new Date(order.createdAt) >= start)
    .reduce((sum, order) => sum + calculateOrderProfit(order), 0);
  const lowStockProducts = data.products.filter(
    (product) => product.stockQuantity <= product.lowStockLimit
  );
  const mostSoldProducts = [...data.products]
    .sort((a, b) => b.reviewsCount - a.reviewsCount)
    .slice(0, 5);

  return {
    ...data,
    metrics: {
      totalRevenue,
      totalOrders: activeOrders.length,
      totalCustomers: data.customers.length,
      totalProfit,
      dailyProfit: profitSince(startOfDay),
      weeklyProfit: profitSince(startOfWeek),
      monthlyProfit: profitSince(startOfMonth),
    },
    lowStockProducts,
    mostSoldProducts,
  };
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function getOrderProfit(order: Order) {
  return calculateOrderProfit(order);
}
