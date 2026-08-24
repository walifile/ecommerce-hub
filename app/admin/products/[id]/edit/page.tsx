import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductForm } from "@/app/admin/products/_components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function EditProductPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const supabase = getSupabaseServerClient();
  if (!supabase) notFound();

  const [productResult, imagesResult, categoriesResult] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("product_images").select("image_url").eq("product_id", id).order("sort_order"),
    supabase.from("categories").select("id, name").order("name"),
  ]);

  type ProductRow = Database["public"]["Tables"]["products"]["Row"];
  const row = productResult.data as ProductRow | null;
  if (!row) notFound();

  type ImageRow = Database["public"]["Tables"]["product_images"]["Row"];
  const gallery = ((imagesResult.data ?? []) as ImageRow[]).map((r) => r.image_url);
  const categories = (categoriesResult.data ?? []) as { id: string; name: string }[];

  // Resolve category name from category_id
  const categoryName =
    categories.find((c) => c.id === row.category_id)?.name ?? "Uncategorized";

  const specifications: string[] = Array.isArray(row.specifications)
    ? (row.specifications as unknown[]).map(String)
    : [];

  return (
    <AdminShell
      title="Edit Product"
      description="Update pricing, inventory, media, and content for this product."
    >
      <Link
        href="/admin/products"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <Card className="rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>Edit &ldquo;{row.name}&rdquo;</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm
            categories={categories.map((c) => c.name)}
            product={{
              id: row.id,
              name: row.name,
              slug: row.slug,
              sku: row.sku,
              category: categoryName,
              costPrice: Number(row.cost_price),
              price: Number(row.selling_price),
              comparePrice: row.compare_price ? Number(row.compare_price) : undefined,
              stockQuantity: row.stock_quantity,
              lowStockLimit: row.low_stock_limit,
              image: row.image_url ?? "",
              gallery,
              shortDescription: row.short_description ?? "",
              description: row.description ?? "",
              metaTitle: row.meta_title ?? "",
              metaDescription: row.meta_description ?? "",
              specifications,
              status: row.status === "published" ? "published" : "draft",
              featured: row.featured,
              isNew: row.is_new,
              bestSeller: row.best_seller,
            }}
          />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
