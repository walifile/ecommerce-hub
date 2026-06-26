import Link from "next/link";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { OrderActions } from "@/app/admin/orders/_components/order-actions";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { TableEmpty } from "@/app/admin/_components/table-empty";
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
      description="Orders expose the lifecycle in the spec: pending, confirmed, processing, shipped, delivered, cancelled, and returned, with profit and invoice actions."
    >
      <Card className="rounded-xl border-border/70 py-0">
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
                <TableHead>Discount</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Profit</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {catalog.orders.length === 0 ? (
                <TableEmpty colSpan={8} message="No orders yet." />
              ) : null}
              {catalog.orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="transition-colors hover:text-primary"
                    >
                      {order.orderNumber}
                    </Link>
                  </TableCell>
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
                  <TableCell>
                    {order.discount > 0 ? (
                      <div>
                        <p className="font-medium text-emerald-600 dark:text-emerald-400">
                          -{formatCurrency(order.discount)}
                        </p>
                        {order.couponCode ? (
                          <p className="text-xs text-muted-foreground">
                            {order.couponCode}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(order.total)}</TableCell>
                  <TableCell>{formatCurrency(getOrderProfit(order))}</TableCell>
                  <TableCell>
                    <OrderActions orderId={order.id} status={order.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* WhatsApp notifications log */}
      <Card className="mt-6 rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>Order notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {catalog.whatsappLogs.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No notifications yet. They are sent automatically on order
              placement and status changes.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.whatsappLogs.slice(0, 12).map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">
                      {log.templateName.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>{log.phone || "—"}</TableCell>
                    <TableCell className="capitalize">{log.status}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
