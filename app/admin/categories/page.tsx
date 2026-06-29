import { getSupabaseServerClient } from "@/lib/supabase/server";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { CategoriesView } from "@/app/admin/categories/_components/categories-view";

type SortKey = "name-asc" | "name-desc" | "most" | "least";
type ImageFilter = "all" | "with" | "without";
type ProductFilter = "all" | "with" | "without";

const VALID_PAGE_SIZES = [8, 16, 24, 48];

async function fetchCategories({
  search,
  sort,
  filterImage,
  filterProducts,
  page,
  pageSize,
}: {
  search: string;
  sort: SortKey;
  filterImage: ImageFilter;
  filterProducts: ProductFilter;
  page: number;
  pageSize: number;
}) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return { categories: [], total: 0, totalProducts: 0 };

  // Build query — embed product count per category
  let query = supabase.from("categories").select("*, products:products(count)");

  if (search.trim()) {
    const q = search.trim();
    query = query.or(`name.ilike.%${q}%,slug.ilike.%${q}%`);
  }
  if (filterImage === "with") query = query.not("image_url", "is", null);
  if (filterImage === "without") query = query.is("image_url", null);

  const { data, error } = await query;
  if (error || !data) {
    console.error("[admin] fetchCategories failed:", error?.message);
    return { categories: [], total: 0, totalProducts: 0 };
  }

  // Map rows — extract embedded product count
  type RawRow = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
    products: { count: number }[];
  };

  let list = (data as RawRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    image: row.image_url ?? "",
    productCount: row.products?.[0]?.count ?? 0,
  }));

  // Filter by product presence (can't do in SQL easily with embedded count)
  if (filterProducts === "with") list = list.filter((c) => c.productCount > 0);
  if (filterProducts === "without") list = list.filter((c) => c.productCount === 0);

  // Sort
  list.sort((a, b) => {
    if (sort === "name-asc") return a.name.localeCompare(b.name);
    if (sort === "name-desc") return b.name.localeCompare(a.name);
    if (sort === "most") return b.productCount - a.productCount;
    if (sort === "least") return a.productCount - b.productCount;
    return 0;
  });

  const total = list.length;
  const totalProducts = list.reduce((s, c) => s + c.productCount, 0);
  const from = (page - 1) * pageSize;
  const paginated = list.slice(from, from + pageSize);

  return { categories: paginated, total, totalProducts };
}

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  const search = params.search ?? "";
  const sort = (["name-asc", "name-desc", "most", "least"].includes(params.sort)
    ? params.sort
    : "name-asc") as SortKey;
  const filterImage = (["all", "with", "without"].includes(params.filterImage)
    ? params.filterImage
    : "all") as ImageFilter;
  const filterProducts = (["all", "with", "without"].includes(params.filterProducts)
    ? params.filterProducts
    : "all") as ProductFilter;
  const pageSize = VALID_PAGE_SIZES.includes(Number(params.pageSize))
    ? Number(params.pageSize)
    : 16;
  const page = Math.max(1, Number(params.page ?? "1"));

  const { categories, total, totalProducts } = await fetchCategories({
    search,
    sort,
    filterImage,
    filterProducts,
    page,
    pageSize,
  });

  return (
    <AdminShell
      title="Categories"
      description="Create and manage the catalog categories shoppers browse and filter by."
    >
      <CategoriesView
        categories={categories}
        total={total}
        totalProducts={totalProducts}
        page={page}
        pageSize={pageSize}
      />
    </AdminShell>
  );
}
