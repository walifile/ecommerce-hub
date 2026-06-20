import { Printer } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getCatalogData, getOrderProfit } from "@/lib/ecommerce-data";

export default async function AdminOrdersPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Orders Module"
      description="Orders expose the lifecycle in the spec: pending, confirmed, processing, shipped, delivered, and cancelled, with profit and invoice actions."
    >
      <Card className="rounded-lg border-border/70 py-0">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {order.customerPhone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</TableCell>
                  <TableCell>
                    <StatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>{formatCurrency(getOrderProfit(order))}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="rounded-md">
                        Update Status
                      </Button>
                      <Button variant="ghost" size="sm" className="rounded-md">
                        <Printer className="size-4" />
                        Invoice
                      </Button>
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
