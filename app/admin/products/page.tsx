import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductsView } from "@/app/admin/products/_components/products-view";

type SortKey =
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "stock-asc"
  | "stock-desc";
type StatusFilter = "all" | "published" | "draft";
type StockFilter = "all" | "in-stock" | "low-stock" | "out-of-stock";

const VALID_SORTS: SortKey[] = [
  "newest", "oldest", "name-asc", "name-desc",
  "price-asc", "price-desc", "stock-asc", "stock-desc",
];
const VALID_PAGE_SIZES = [10, 20, 50, 100];

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  price: number;
  stockQuantity: number;
  lowStockLimit: number;
  status: "published" | "draft";
  image: string;
};

async function fetchProducts({
  search,
  category,
  status,
  stock,
  sort,
  page,
  pageSize,
}: {
  search: string;
  category: string;
  status: StatusFilter;
  stock: StockFilter;
  sort: SortKey;
  page: number;
  pageSize: number;
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { products: [], total: 0, categories: [] };

  const { data: categoriesData } = await supabase
    .from("categories")
    .select("id, name")
    .order("name");
  const categories = (categoriesData ?? []) as { id: string; name: string }[];

  let query = supabase.from("products").select(
    "id, name, slug, sku, category_id, selling_price, stock_quantity, low_stock_limit, status, image_url, created_at"
  );

  if (search.trim()) {
    const q = search.trim();
    query = query.or(`name.ilike.%${q}%,sku.ilike.%${q}%`);
  }

  if (status !== "all") query = query.eq("status", status);

  if (category) {
    const cat = categories.find((c) => c.name === category);
    if (cat) query = query.eq("category_id", cat.id);
  }

  const sortMap: Record<SortKey, { col: string; asc: boolean }> = {
    newest:      { col: "created_at",    asc: false },
    oldest:      { col: "created_at",    asc: true  },
    "name-asc":  { col: "name",          asc: true  },
    "name-desc": { col: "name",          asc: false },
    "price-asc": { col: "selling_price", asc: true  },
    "price-desc":{ col: "selling_price", asc: false },
    "stock-asc": { col: "stock_quantity",asc: true  },
    "stock-desc":{ col: "stock_quantity",asc: false },
  };
  const s = sortMap[sort];
  query = query.order(s.col, { ascending: s.asc });

  const { data, error } = await query;
  if (error || !data) {
    console.error("[admin] fetchProducts failed:", error?.message);
    return { products: [], total: 0, categories };
  }

  type RawRow = {
    id: string;
    name: string;
    slug: string;
    sku: string;
    category_id: string | null;
    selling_price: number;
    stock_quantity: number;
    low_stock_limit: number;
    status: string;
    image_url: string | null;
    created_at: string;
  };

  let list = (data as RawRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    category: categories.find((c) => c.id === row.category_id)?.name ?? "Uncategorized",
    price: Number(row.selling_price),
    stockQuantity: row.stock_quantity,
    lowStockLimit: row.low_stock_limit,
    status: (row.status === "published" ? "published" : "draft") as "published" | "draft",
    image: row.image_url ?? "",
  }));

  // Stock filter is JS-side (requires comparing two columns)
  if (stock === "out-of-stock") list = list.filter((p) => p.stockQuantity <= 0);
  else if (stock === "low-stock") list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockLimit);
  else if (stock === "in-stock") list = list.filter((p) => p.stockQuantity > p.lowStockLimit);

  const total = list.length;
  const from = (page - 1) * pageSize;
  const paginated = list.slice(from, from + pageSize);

  return { products: paginated, total, categories };
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const search   = params.search ?? "";
  const category = params.category ?? "";
  const status   = (["all", "published", "draft"].includes(params.status) ? params.status : "all") as StatusFilter;
  const stock    = (["all", "in-stock", "low-stock", "out-of-stock"].includes(params.stock) ? params.stock : "all") as StockFilter;
  const sort     = (VALID_SORTS.includes(params.sort as SortKey) ? params.sort : "newest") as SortKey;
  const pageSize = VALID_PAGE_SIZES.includes(Number(params.pageSize)) ? Number(params.pageSize) : 20;
  const page     = Math.max(1, Number(params.page ?? "1"));

  const { products, total, categories } = await fetchProducts({
    search, category, status, stock, sort, page, pageSize,
  });

  return (
    <AdminShell
      title="Product Management"
      description="Product records follow the spec: basic info, pricing, inventory, media, SEO, draft/published state, and an AI content path."
    >
      <ProductsView
        products={products}
        total={total}
        categories={categories}
        page={page}
        pageSize={pageSize}
      />
    </AdminShell>
  );
}
