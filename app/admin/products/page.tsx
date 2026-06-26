import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ProductForm } from "@/app/admin/products/_components/product-form";
import { StatusBadge } from "@/components/ecommerce/status-badge";
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
                  <TableHead>Status</TableHead>
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
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      <StatusBadge status={product.status} />
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
