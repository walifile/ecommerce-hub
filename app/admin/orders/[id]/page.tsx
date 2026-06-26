import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package2,
  Phone,
  User,
} from "lucide-react";
import { updateOrderStatusAction } from "@/app/admin/actions";
import { PrintOrderButton } from "@/app/admin/orders/_components/print-order-button";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  formatDate,
  getOrderById,
  getOrderProfit,
} from "@/lib/ecommerce-data";

const STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export default async function AdminOrderDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  return (
    <AdminShell
      title={`Order ${order.orderNumber}`}
      description="Inspect customer context, line items, pricing, and fulfillment state in one operator view."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to orders
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/orders/${order.id}/invoice`}
              className="inline-flex h-8 items-center justify-center rounded-md border border-border/70 bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Invoice
            </Link>
            <form action={updateOrderStatusAction} className="flex items-center gap-2">
              <input type="hidden" name="orderId" value={order.id} />
              <NativeSelect
                name="status"
                defaultValue={order.status}
                size="sm"
                className="w-40 capitalize"
              >
                {STATUSES.map((status) => (
                  <NativeSelectOption key={status} value={status} className="capitalize">
                    {status}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <Button type="submit" variant="outline" size="sm" className="rounded-md">
                Update status
              </Button>
            </form>
            <PrintOrderButton />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <Card className="rounded-lg border-border/70 py-0">
              <CardHeader>
                <CardTitle>Line items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Qty</TableHead>
                      <TableHead>Unit price</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Line total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={`${order.id}-${item.productName}`}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell>{formatCurrency(item.productCost)}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-border/70 py-0">
              <CardHeader>
                <CardTitle>Pricing summary</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Subtotal
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(itemsSubtotal)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Shipping
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(order.shippingCost)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Discount
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600 dark:text-emerald-400">
                    -{formatCurrency(order.discount)}
                  </p>
                  {order.couponCode ? (
                    <p className="mt-1 text-sm text-muted-foreground">{order.couponCode}</p>
                  ) : null}
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Profit
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(getOrderProfit(order))}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-lg border-border/70 py-0">
              <CardHeader>
                <CardTitle>Order overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Order number
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Payment
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm font-medium capitalize text-foreground">
                      <CreditCard className="size-4 text-muted-foreground" />
                      {order.paymentMethod}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Created
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Revenue
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatCurrency(order.revenue)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                      Final total
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-lg border-border/70 py-0">
              <CardHeader>
                <CardTitle>Customer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <User className="size-4 text-muted-foreground" />
                    {order.customerName}
                  </p>
                  {order.customerEmail ? (
                    <p className="mt-2 text-sm text-muted-foreground">{order.customerEmail}</p>
                  ) : null}
                  {order.customerPhone ? (
                    <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="size-4" />
                      {order.customerPhone}
                    </p>
                  ) : null}
                </div>

                {(order.customerAddress || order.customerCity) && (
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      Shipping address
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[order.customerAddress, order.customerCity].filter(Boolean).join(", ")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-lg border-border/70 py-0">
              <CardHeader>
                <CardTitle>Fulfillment snapshot</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {STATUSES.map((status, index) => {
                  const activeIndex = STATUSES.indexOf(order.status as (typeof STATUSES)[number]);
                  const active =
                    order.status === "cancelled"
                      ? status === "cancelled"
                      : activeIndex >= index;

                  return (
                    <div
                      key={status}
                      className={`flex items-center gap-3 rounded-2xl border px-4 py-3 ${
                        active
                          ? "border-primary/20 bg-primary/8"
                          : "border-border/70 bg-muted/20"
                      }`}
                    >
                      <div className="flex size-8 items-center justify-center rounded-full bg-background text-sm font-semibold text-foreground">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium capitalize text-foreground">{status}</p>
                        <p className="text-xs text-muted-foreground">
                          {active ? "Completed or current stage" : "Pending"}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Package2 className="size-4 text-muted-foreground" />
                    {order.items.reduce((sum, item) => sum + item.quantity, 0)} items in shipment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
