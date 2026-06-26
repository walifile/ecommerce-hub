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

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentMethod: "cod" | "stripe";
  shippingCost: number;
  adCost: number;
  discount: number;
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

export type AiGeneration = {
  id: string;
  productName: string;
  productTitle: string;
  shortDescription: string;
  longDescription: string;
  metaTitle: string;
  metaDescription: string;
  faq: string[];
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
};

export type CatalogData = {
  categories: Category[];
  products: Product[];
  customers: Customer[];
  orders: Order[];
  expenses: Expense[];
  aiGenerations: AiGeneration[];
  whatsappLogs: WhatsAppLog[];
  testimonials: Testimonial[];
  trend: DashboardSeriesPoint[];
  settings: StoreSettings;
};

const mockCategories: Category[] = [
  {
    id: "cat-1",
    name: "Performance Skincare",
    slug: "performance-skincare",
    description: "Serums, cleansers, and recovery kits for high-repeat buyers.",
    image:
      "https://images.unsplash.com/photo-1526758097130-bab247274f58?auto=format&fit=crop&w=1200&q=80",
    productCount: 2,
  },
  {
    id: "cat-2",
    name: "Wellness Bundles",
    slug: "wellness-bundles",
    description: "Subscription-friendly bundles designed for average order value growth.",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    productCount: 2,
  },
  {
    id: "cat-3",
    name: "Home Essentials",
    slug: "home-essentials",
    description: "Utility-driven products for steady margin and consistent restock cycles.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    productCount: 2,
  },
];

const mockProducts: Product[] = [
  {
    id: "prod-1",
    name: "Barrier Repair Night Serum",
    slug: "barrier-repair-night-serum",
    sku: "BNS-001",
    category: "Performance Skincare",
    price: 48,
    comparePrice: 59,
    costPrice: 18,
    stockQuantity: 44,
    lowStockLimit: 12,
    rating: 4.8,
    reviewsCount: 128,
    shortDescription: "Recovery serum tuned for dry, stressed skin.",
    description:
      "A fast-absorbing serum with ceramides, niacinamide, and squalane to reduce irritation and restore barrier strength overnight.",
    specifications: ["Ceramides", "Niacinamide", "Squalane", "30ml bottle"],
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-dd3e4f63317f?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    featured: true,
    isNew: true,
    bestSeller: true,
  },
  {
    id: "prod-2",
    name: "Morning Reset Cleanser",
    slug: "morning-reset-cleanser",
    sku: "MRC-102",
    category: "Performance Skincare",
    price: 26,
    comparePrice: 32,
    costPrice: 9,
    stockQuantity: 61,
    lowStockLimit: 10,
    rating: 4.7,
    reviewsCount: 94,
    shortDescription: "Low-foam cleanser for daily use.",
    description:
      "A balanced gel cleanser that removes oil and residue without stripping skin, tuned for repeat purchase routines.",
    specifications: ["Amino-acid surfactants", "pH balanced", "150ml tube"],
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1556228578-dd3e4f63317f?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    featured: true,
  },
  {
    id: "prod-3",
    name: "Calm Focus Supplement Stack",
    slug: "calm-focus-supplement-stack",
    sku: "CFS-220",
    category: "Wellness Bundles",
    price: 72,
    comparePrice: 89,
    costPrice: 31,
    stockQuantity: 27,
    lowStockLimit: 8,
    rating: 4.9,
    reviewsCount: 77,
    shortDescription: "Two-part bundle for steady daytime energy.",
    description:
      "Combines magnesium support with a nootropic daytime capsule to improve repeatability for busy operators and professionals.",
    specifications: ["2 SKUs bundled", "30-day supply", "Subscription-ready"],
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    featured: true,
    bestSeller: true,
  },
  {
    id: "prod-4",
    name: "Sleep Recovery Bundle",
    slug: "sleep-recovery-bundle",
    sku: "SRB-208",
    category: "Wellness Bundles",
    price: 64,
    comparePrice: 78,
    costPrice: 28,
    stockQuantity: 9,
    lowStockLimit: 10,
    rating: 4.6,
    reviewsCount: 58,
    shortDescription: "Evening routine kit with sleep tea and supplement support.",
    description:
      "A margin-efficient bundle built for upsells and post-purchase retention, combining calming tea, magnesium, and a reusable scoop set.",
    specifications: ["Tea blend", "Magnesium capsules", "Reusable scoop"],
    image:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    isNew: true,
  },
  {
    id: "prod-5",
    name: "Precision Pour Kettle",
    slug: "precision-pour-kettle",
    sku: "PPK-310",
    category: "Home Essentials",
    price: 89,
    comparePrice: 104,
    costPrice: 43,
    stockQuantity: 14,
    lowStockLimit: 6,
    rating: 4.7,
    reviewsCount: 43,
    shortDescription: "Countertop kettle for ritual-driven coffee routines.",
    description:
      "A matte stainless kettle with precise temperature control and a balanced handle, designed for premium positioning.",
    specifications: ["1L capacity", "Temperature hold", "Stainless steel"],
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    bestSeller: true,
  },
  {
    id: "prod-6",
    name: "Modular Pantry Set",
    slug: "modular-pantry-set",
    sku: "MPS-411",
    category: "Home Essentials",
    price: 54,
    comparePrice: 68,
    costPrice: 20,
    stockQuantity: 33,
    lowStockLimit: 9,
    rating: 4.5,
    reviewsCount: 39,
    shortDescription: "Storage set tuned for bundle-driven AOV lifts.",
    description:
      "Stackable containers and labeled lids for operational home organization, built for bundle offers and gifting campaigns.",
    specifications: ["8 containers", "Label pack", "BPA-free"],
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    status: "published",
    featured: true,
  },
];

const mockCustomers: Customer[] = [
  {
    id: "cust-1",
    name: "Ayesha Khan",
    phone: "+92 300 1112233",
    email: "ayesha@example.com",
    address: "12 Main Boulevard",
    city: "Lahore",
    totalOrders: 6,
    totalRevenue: 412,
    lifetimeValue: 412,
  },
  {
    id: "cust-2",
    name: "Usman Ali",
    phone: "+92 333 4455667",
    email: "usman@example.com",
    address: "44 Shahrah-e-Faisal",
    city: "Karachi",
    totalOrders: 4,
    totalRevenue: 268,
    lifetimeValue: 268,
  },
  {
    id: "cust-3",
    name: "Sana Noor",
    phone: "+92 321 8899001",
    email: "sana@example.com",
    address: "9 Blue Area",
    city: "Islamabad",
    totalOrders: 3,
    totalRevenue: 198,
    lifetimeValue: 198,
  },
];

const mockOrders: Order[] = [
  {
    id: "ord-1",
    orderNumber: "ECO-1001",
    customerName: "Ayesha Khan",
    customerPhone: "+92 300 1112233",
    customerEmail: "ayesha@example.com",
    status: "processing",
    paymentMethod: "cod",
    shippingCost: 6,
    adCost: 12,
    discount: 8,
    revenue: 136,
    total: 134,
    createdAt: "2026-06-18",
    items: [
      { productName: "Barrier Repair Night Serum", quantity: 2, unitPrice: 48, productCost: 18 },
      { productName: "Morning Reset Cleanser", quantity: 2, unitPrice: 26, productCost: 9 },
    ],
  },
  {
    id: "ord-2",
    orderNumber: "ECO-1002",
    customerName: "Usman Ali",
    customerPhone: "+92 333 4455667",
    customerEmail: "usman@example.com",
    status: "shipped",
    paymentMethod: "stripe",
    shippingCost: 8,
    adCost: 16,
    discount: 0,
    revenue: 161,
    total: 161,
    createdAt: "2026-06-19",
    items: [
      { productName: "Precision Pour Kettle", quantity: 1, unitPrice: 89, productCost: 43 },
      { productName: "Sleep Recovery Bundle", quantity: 1, unitPrice: 64, productCost: 28 },
    ],
  },
  {
    id: "ord-3",
    orderNumber: "ECO-1003",
    customerName: "Sana Noor",
    customerPhone: "+92 321 8899001",
    customerEmail: "sana@example.com",
    status: "delivered",
    paymentMethod: "cod",
    shippingCost: 5,
    adCost: 10,
    discount: 4,
    revenue: 120,
    total: 115,
    createdAt: "2026-06-20",
    items: [
      { productName: "Calm Focus Supplement Stack", quantity: 1, unitPrice: 72, productCost: 31 },
      { productName: "Morning Reset Cleanser", quantity: 2, unitPrice: 26, productCost: 9 },
    ],
  },
];

const mockExpenses: Expense[] = [
  { id: "exp-1", title: "Meta ads retargeting", expenseType: "advertising", amount: 280, date: "2026-06-18" },
  { id: "exp-2", title: "Courier settlements", expenseType: "shipping", amount: 112, date: "2026-06-19" },
  { id: "exp-3", title: "Operations assistant", expenseType: "salary", amount: 340, date: "2026-06-20" },
  { id: "exp-4", title: "Packaging restock", expenseType: "miscellaneous", amount: 76, date: "2026-06-20" },
];

const mockAiGenerations: AiGeneration[] = [
  {
    id: "ai-1",
    productName: "Barrier Repair Night Serum",
    productTitle: "Barrier Repair Night Serum for Dry and Sensitive Skin",
    shortDescription: "Restores hydration overnight without leaving residue.",
    longDescription:
      "An overnight serum that combines ceramides, niacinamide, and squalane to reduce visible irritation while improving moisture retention and texture.",
    metaTitle: "Barrier Repair Night Serum | Ecommerce Hub",
    metaDescription: "Restore stressed skin overnight with a ceramide and niacinamide powered serum.",
    faq: ["Is it fragrance free?", "Can it be used daily?", "Is it safe for sensitive skin?"],
    createdAt: "2026-06-20",
  },
];

const mockWhatsAppLogs: WhatsAppLog[] = [
  { id: "wa-1", templateName: "order_created", phone: "+92 300 1112233", status: "sent", sentAt: "2026-06-18 10:20" },
  { id: "wa-2", templateName: "order_shipped", phone: "+92 333 4455667", status: "sent", sentAt: "2026-06-19 15:05" },
  { id: "wa-3", templateName: "order_delivered", phone: "+92 321 8899001", status: "queued", sentAt: "Pending" },
];

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

  const [categoriesResult, productsResult, productImagesResult, customersResult, ordersResult, expensesResult, aiResult, whatsappResult, settingsResult] =
    await Promise.all([
      supabase.from("categories").select("*").order("name"),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("product_images").select("*").order("sort_order"),
      supabase.from("customers").select("*").order("created_at", { ascending: false }),
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
      supabase.from("ai_generations").select("*").order("created_at", { ascending: false }),
      supabase.from("whatsapp_logs").select("*").order("created_at", { ascending: false }),
      supabase.from("settings").select("*").limit(1).maybeSingle(),
    ]);

  if (
    categoriesResult.error ||
    productsResult.error ||
    productImagesResult.error ||
    customersResult.error ||
    ordersResult.error ||
    expensesResult.error ||
    aiResult.error ||
    whatsappResult.error ||
    settingsResult.error
  ) {
    return null;
  }

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
  const expensesRows =
    (expensesResult.data ?? []) as Database["public"]["Tables"]["expenses"]["Row"][];
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
    image: category.image_url ?? mockCategories[0].image,
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
      image: product.image_url ?? mockProducts[0].image,
      gallery: gallery.length ? gallery : [product.image_url ?? mockProducts[0].image],
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
      status: (order.status as Order["status"]) ?? "pending",
      paymentMethod: order.payment_method === "stripe" ? "stripe" : "cod",
      shippingCost: Number(order.shipping_cost),
      adCost: Number(order.ad_cost),
      discount: Number(order.discount_amount),
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

  const aiGenerations = aiRows.map((row) => ({
    id: row.id,
    productName: row.product_name,
    productTitle: row.product_title ?? "",
    shortDescription: row.short_description ?? "",
    longDescription: row.long_description ?? "",
    metaTitle: row.meta_title ?? "",
    metaDescription: row.meta_description ?? "",
    faq: Array.isArray(row.faq) ? row.faq.map((item) => String(item)) : [],
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
    categories: categories.length ? categories : mockCategories,
    products: products.length ? products : mockProducts,
    customers: customers.length ? customers : mockCustomers,
    orders: orders.length ? orders : mockOrders,
    expenses: expenses.length ? expenses : mockExpenses,
    aiGenerations: aiGenerations.length ? aiGenerations : mockAiGenerations,
    whatsappLogs: whatsappLogs.length ? whatsappLogs : mockWhatsAppLogs,
    testimonials: mockTestimonials,
    trend,
    settings: {
      storeName: settingsRow?.store_name ?? mockSettings.storeName,
      supportEmail: settingsRow?.support_email ?? mockSettings.supportEmail,
      supportPhone: settingsRow?.support_phone ?? mockSettings.supportPhone,
      heroTitle: settingsRow?.hero_title ?? mockSettings.heroTitle,
      heroSubtitle: settingsRow?.hero_subtitle ?? mockSettings.heroSubtitle,
      theme: resolveTheme(settingsRow?.theme),
    },
  };
}

export async function getCatalogData(): Promise<CatalogData> {
  const supabaseData = await readSupabaseCatalog();

  if (supabaseData) {
    return supabaseData;
  }

  return {
    categories: mockCategories,
    products: mockProducts,
    customers: mockCustomers,
    orders: mockOrders,
    expenses: mockExpenses,
    aiGenerations: mockAiGenerations,
    whatsappLogs: mockWhatsAppLogs,
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
