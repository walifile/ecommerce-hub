import { WandSparkles } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
          <CardContent className="grid gap-4 p-6">
            <Input placeholder="Product name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Slug" />
              <Input placeholder="SKU" />
            </div>
            <Input placeholder="Category" />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input placeholder="Cost price" />
              <Input placeholder="Selling price" />
              <Input placeholder="Compare price" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input placeholder="Stock quantity" />
              <Input placeholder="Low stock limit" />
            </div>
            <Input placeholder="Image URL" />
            <Textarea placeholder="Description" className="min-h-28" />
            <Textarea placeholder="Specifications, one per line" className="min-h-24" />
            <Input placeholder="Meta title" />
            <Textarea placeholder="Meta description" className="min-h-20" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Button className="rounded-md">Save product</Button>
              <Button variant="outline" className="rounded-md">
                <WandSparkles className="size-4" />
                Generate with AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
