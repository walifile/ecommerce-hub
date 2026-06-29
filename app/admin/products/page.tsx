import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductFormSheet } from "@/app/admin/products/_components/product-form-sheet";
import { ProductRowActions } from "@/app/admin/products/_components/product-row-actions";
import { TableEmpty } from "@/app/admin/_components/table-empty";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminProductsPage() {
  const catalog = await getCatalogData();
  const categoryNames = catalog.categories.map((c) => c.name);

  return (
    <AdminShell
      title="Product Management"
      description="Product records follow the spec: basic info, pricing, inventory, media, SEO, draft/published state, and an AI content path."
    >
      <Card className="rounded-xl border-border/70 py-0">
        <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/70">
          <div>
            <CardTitle>Current products</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {catalog.products.length} product
              {catalog.products.length === 1 ? "" : "s"} in the catalog.
            </p>
          </div>
          <ProductFormSheet categories={categoryNames} />
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="pr-6 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.products.length === 0 ? (
                <TableEmpty colSpan={7} message="No products yet. Click “New product” to add one." />
              ) : null}
              {catalog.products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-10 shrink-0 rounded-lg border border-border/70 bg-muted bg-cover bg-center"
                        style={
                          product.image
                            ? { backgroundImage: `url(${product.image})` }
                            : undefined
                        }
                        aria-hidden
                      />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        <p className="truncate text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(product.price)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.stockQuantity} / limit {product.lowStockLimit}
                  </TableCell>
                  <TableCell>
                    {product.stockQuantity <= 0 ? (
                      <Badge variant="destructive" className="rounded-full">
                        Out of stock
                      </Badge>
                    ) : product.stockQuantity <= product.lowStockLimit ? (
                      <Badge
                        variant="outline"
                        className="rounded-full border-amber-500/30 text-amber-600 dark:text-amber-400"
                      >
                        Low stock
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-full">
                        Healthy
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={product.status} />
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex justify-end">
                      <ProductRowActions
                        id={product.id}
                        name={product.name}
                        slug={product.slug}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminShell>
  );
}
