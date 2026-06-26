import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductForm } from "@/app/admin/products/_components/product-form";
import { ProductRowActions } from "@/app/admin/products/_components/product-row-actions";
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
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Current products</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Inventory</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">{product.category}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.sku}</TableCell>
                    <TableCell>{formatCurrency(product.price)}</TableCell>
                    <TableCell>
                      {product.stockQuantity} / limit {product.lowStockLimit}
                    </TableCell>
                    <TableCell>
                      {product.stockQuantity <= 0 ? (
                        <Badge variant="destructive" className="rounded-full">
                          Out of stock
                        </Badge>
                      ) : product.stockQuantity <= product.lowStockLimit ? (
                        <Badge variant="outline" className="rounded-full border-amber-500/30 text-amber-600 dark:text-amber-400">
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
                    <TableCell>
                      <div className="flex justify-end">
                        <ProductRowActions id={product.id} name={product.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Create / edit product</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ProductForm categories={categoryNames} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
