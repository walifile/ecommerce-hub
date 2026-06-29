import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductForm } from "@/app/admin/products/_components/product-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function EditProductPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const catalog = await getCatalogData();
  const product = catalog.products.find((p) => p.id === id);

  if (!product) notFound();

  const categoryNames = catalog.categories.map((c) => c.name);

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
          <CardTitle>Edit “{product.name}”</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ProductForm
            categories={categoryNames}
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              category: product.category,
              costPrice: product.costPrice,
              price: product.price,
              comparePrice: product.comparePrice,
              stockQuantity: product.stockQuantity,
              lowStockLimit: product.lowStockLimit,
              image: product.image,
              gallery: product.gallery,
              shortDescription: product.shortDescription,
              description: product.description,
              specifications: product.specifications,
              status: product.status,
            }}
          />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
