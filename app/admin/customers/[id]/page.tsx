import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Mail,
  MapPin,
  Package2,
  Phone,
  ReceiptText,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { CustomerActions } from "@/app/admin/customers/_components/customer-actions";
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
import {
  formatCurrency,
  formatDate,
  getCustomerById,
  getOrderProfit,
} from "@/lib/ecommerce-data";

export default async function AdminCustomerDetailPage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const data = await getCustomerById(id);

  if (!data) {
    notFound();
  }

  const { customer, orders } = data;
  const activeOrders = orders.filter(
    (order) => !["cancelled", "returned"].includes(order.status)
  );
  const computedRevenue = activeOrders.reduce((sum, order) => sum + order.revenue, 0);
  const computedProfit = activeOrders.reduce((sum, order) => sum + getOrderProfit(order), 0);
  const totalItems = activeOrders.reduce(
    (sum, order) => sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const purchasedItems = activeOrders.flatMap((order) =>
    order.items.map((item) => ({
      ...item,
      orderId: order.id,
      orderNumber: order.orderNumber,
      createdAt: order.createdAt,
    }))
  );
  const activity = orders
    .flatMap((order) =>
      (order.events ?? []).map((event) => ({
        ...event,
        orderId: order.id,
        orderNumber: order.orderNumber,
      }))
    )
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <AdminShell
      title={customer.name}
      description="Customer profile with saved contact details, addresses, orders, purchases, and operational activity."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/admin/customers"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to customers
          </Link>
          <CustomerActions
            customer={{
              id: customer.id,
              name: customer.name,
              phone: customer.phone,
              email: customer.email,
              address: customer.address,
              city: customer.city,
            }}
            orderCount={orders.length}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Card className="overflow-hidden rounded-xl border-border/70 py-0">
              <CardHeader className="border-b border-border/70 bg-muted/20">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <CardTitle className="flex items-center gap-2">
                      <UserRound className="size-5 text-primary" />
                      Customer profile
                    </CardTitle>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Saved customer record from checkout or manual order entry.
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                    {orders.length} orders
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Name
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    {customer.name}
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <a href={`tel:${customer.phone}`} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary">
                      <Phone className="size-4 text-muted-foreground" />
                      {customer.phone || "No phone saved"}
                    </a>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <a href={customer.email ? `mailto:${customer.email}` : undefined} className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary">
                      <Mail className="size-4 text-muted-foreground" />
                      {customer.email || "No email saved"}
                    </a>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <MapPin className="size-4 text-muted-foreground" />
                      Shipping address
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {[customer.address, customer.city].filter(Boolean).join(", ") ||
                        "No address saved"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/70 py-0">
              <CardHeader>
                <CardTitle>Stored totals</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Stored orders
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {customer.totalOrders}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Stored revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(customer.totalRevenue)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/70 bg-muted/30 p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Stored lifetime value
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(customer.lifetimeValue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <div className="grid gap-3 md:grid-cols-3">
              <Card className="rounded-xl border-border/70 py-0">
                <CardContent className="p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <ReceiptText className="size-4 text-primary" />
                    Order revenue
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(computedRevenue)}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border/70 py-0">
                <CardContent className="p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <CreditCard className="size-4 text-primary" />
                    Order profit
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {formatCurrency(computedProfit)}
                  </p>
                </CardContent>
              </Card>
              <Card className="rounded-xl border-border/70 py-0">
                <CardContent className="p-4">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    <ShoppingBag className="size-4 text-primary" />
                    Items bought
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {totalItems}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-xl border-border/70 py-0">
              <CardHeader>
                <CardTitle>Order history</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                          No saved orders for this customer yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                    {orders.map((order) => (
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
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <Card className="rounded-xl border-border/70 py-0">
            <CardHeader>
              <CardTitle>Purchased items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Order</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchasedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                        No purchased products yet.
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {purchasedItems.map((item, index) => (
                    <TableRow key={`${item.orderId}-${item.productName}-${index}`}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>
                        <Link
                          href={`/admin/orders/${item.orderId}`}
                          className="transition-colors hover:text-primary"
                        >
                          {item.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice * item.quantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/70 py-0">
            <CardHeader>
              <CardTitle>Order activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.length === 0 ? (
                <div className="rounded-2xl border border-border/70 bg-muted/20 p-5 text-sm text-muted-foreground">
                  No status activity has been stored for this customer yet.
                </div>
              ) : null}
              {activity.map((event) => (
                <div
                  key={`${event.orderId}-${event.id}`}
                  className="rounded-2xl border border-border/70 bg-muted/20 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">
                      {event.previousStatus ?? "created"} - {event.newStatus}
                    </p>
                    <Link
                      href={`/admin/orders/${event.orderId}`}
                      className="text-xs font-medium text-primary"
                    >
                      {event.orderNumber}
                    </Link>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(event.createdAt)} by {event.actorRole}
                  </p>
                  {event.reason ? (
                    <p className="mt-2 text-sm text-muted-foreground">{event.reason}</p>
                  ) : null}
                  {event.refundAmount !== null ? (
                    <p className="mt-1 text-sm text-foreground">
                      Refund: {formatCurrency(event.refundAmount)}
                    </p>
                  ) : null}
                  {event.note ? (
                    <p className="mt-1 text-sm text-muted-foreground">{event.note}</p>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package2 className="size-5 text-primary" />
              Raw saved context
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Customer ID
              </p>
              <p className="mt-2 break-all text-sm text-foreground">{customer.id}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Phone
              </p>
              <p className="mt-2 text-sm text-foreground">{customer.phone || "-"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Email
              </p>
              <p className="mt-2 break-all text-sm text-foreground">{customer.email || "-"}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Address
              </p>
              <p className="mt-2 text-sm text-foreground">
                {[customer.address, customer.city].filter(Boolean).join(", ") || "-"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
