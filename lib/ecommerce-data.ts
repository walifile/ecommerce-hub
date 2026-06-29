import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { DEFAULT_THEME, resolveTheme, type ThemeId } from "@/lib/themes";

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
};

export type StoreBanner = Pick<
  StoreSettings,
  | "announcementEnabled"
  | "announcementMessage"
  | "announcementLinkText"
  | "announcementLinkHref"
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
};

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
  if (!supabase) return mockSettings;

  const { data, error } = await supabase
    .from("settings")
    .select(
      "announcement_enabled, announcement_message, announcement_link_text, announcement_link_href"
    )
    .limit(1)
    .maybeSingle();

  if (error || !data) return mockSettings;

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
    announcementEnabled:
      row.announcement_enabled ?? mockSettings.announcementEnabled,
    announcementMessage:
      row.announcement_message ?? mockSettings.announcementMessage,
    announcementLinkText:
      row.announcement_link_text ?? mockSettings.announcementLinkText,
    announcementLinkHref:
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
    return { ok: false, error: error.message };
  }

  return { ok: true };
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

  const [categoriesResult, productsResult, productImagesResult, customersResult, ordersResult, expensesResult, couponsResult, aiResult, whatsappResult, settingsResult] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("product_images").select("*").order("sort_order"),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*), order_events(*)").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      supabase.from("coupons").select("*").order("created_at", { ascending: false }),
      supabase.from("ai_generations").select("*").order("created_at", { ascending: false }),
      supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").limit(1).maybeSingle(),
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
    order_events?: Database["public"]["Tables"]["order_events"]["Row"][];
  })[];
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
    productCount: productsRows.filter((product) => product.category_id === category.id).length,
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

    return {
      id: order.id,
      orderNumber: order.order_number,
      customerName: customer?.name ?? "Guest customer",
      customerPhone: customer?.phone ?? "",
      customerEmail: customer?.email ?? "",
      customerAddress: customer?.address ?? "",
      customerCity: customer?.city ?? "",
      status: (order.status as Order["status"]) ?? "pending",
      paymentMethod: order.payment_method === "stripe" ? "stripe" : "cod",
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
      events: (order.order_events ?? [])
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

  const coupons = couponRows.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    discountType:
      coupon.discount_type === "percentage" ? "percentage" : "fixed",
    discountValue: Number(coupon.discount_value),
    minOrderAmount: Number(coupon.min_order_amount ?? 0),
    maxDiscountAmount:
      coupon.max_discount_amount === null ||
      coupon.max_discount_amount === undefined
        ? undefined
        : Number(coupon.max_discount_amount),
    active: coupon.active,
    startsAt: coupon.starts_at ?? undefined,
    expiresAt: coupon.expires_at ?? undefined,
    usageLimit:
      coupon.usage_limit === null || coupon.usage_limit === undefined
        ? undefined
        : coupon.usage_limit,
    usedCount: coupon.used_count ?? 0,
  } satisfies Coupon));

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
      announcementEnabled:
        settingsRow?.announcement_enabled ?? mockSettings.announcementEnabled,
      announcementMessage:
        settingsRow?.announcement_message ?? mockSettings.announcementMessage,
      announcementLinkText:
        settingsRow?.announcement_link_text ?? mockSettings.announcementLinkText,
      announcementLinkHref:
        settingsRow?.announcement_link_href ?? mockSettings.announcementLinkHref,
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
  return products.find((product) => product.slug === slug);
}

export async function getRelatedProducts(slug: string) {
  const product = await getProductBySlug(slug);

  if (!product) {
    return [];
  }

  const { products } = await getCatalogData();

  return products
    .filter((item) => item.slug !== slug && item.category === product.category)
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

export async function getOrderById(id?: string) {
  if (!id) {
    return null;
  }

  const { orders } = await getCatalogData();
  return orders.find((order) => order.id === id) ?? null;
}

export async function getDashboardData() {
  const data = await getCatalogData();
  const totalRevenue = data.orders.reduce((sum, order) => sum + order.revenue, 0);
  const totalProfit = data.orders.reduce((sum, order) => sum + calculateOrderProfit(order), 0);
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
      totalOrders: data.orders.length,
      totalCustomers: data.customers.length,
      totalProfit,
      dailyProfit: Math.round(totalProfit * 0.14),
      weeklyProfit: Math.round(totalProfit * 0.52),
      monthlyProfit: totalProfit,
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
