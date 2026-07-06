import Link from "next/link";
import { BellRing, PackageSearch, ReceiptText, Sparkles } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ManualOrderDialog } from "@/app/admin/orders/_components/manual-order-dialog";
import { OrderActions } from "@/app/admin/orders/_components/order-actions";
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
import { formatCurrency, getCatalogData, getOrderProfit } from "@/lib/ecommerce-data";

export default async function AdminOrdersPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Orders Module"
      description="Orders expose the lifecycle in the spec: pending, confirmed, processing, shipped, delivered, cancelled, and returned, with profit and invoice actions."
    >
      <Card className="overflow-hidden rounded-xl border-border/70 py-0">
        <CardHeader className="border-b border-border/70 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>Orders</CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                  {catalog.orders.length} total
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Manage website orders, manual orders, returns, and fulfillment in one place.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <ManualOrderDialog
                products={catalog.products.map((product) => ({
                  id: product.id,
                  name: product.name,
                  sku: product.sku,
                  price: product.price,
                  stockQuantity: product.stockQuantity,
                }))}
              />
            </div>
          </div>

          <div className="grid gap-3 pt-2 sm:grid-cols-3">
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <ReceiptText className="size-4 text-primary" />
                Revenue potential
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">
                {catalog.orders.length ? formatCurrency(catalog.orders.reduce((sum, order) => sum + order.total, 0)) : "—"}
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <PackageSearch className="size-4 text-primary" />
                Products in play
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">{catalog.products.length}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <Sparkles className="size-4 text-primary" />
                Manual entries
              </div>
              <p className="mt-2 text-lg font-semibold text-foreground">Enabled</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {catalog.orders.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30 text-muted-foreground">
                <ReceiptText className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No orders yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Website orders and manual orders will appear here once customers start checking out or your team creates an offline order.
              </p>
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden rounded-xl border-border/70 py-0">
        <CardHeader className="border-b border-border/70 bg-muted/20">
          <div className="flex items-center gap-2">
            <BellRing className="size-4 text-primary" />
            <CardTitle>Order notifications</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">
            WhatsApp messages sent on placement and status changes.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {catalog.whatsappLogs.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground">
              No notifications yet. They are sent automatically on order placement and status changes.
            </div>
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
