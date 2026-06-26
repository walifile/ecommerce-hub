import { AlertTriangle, DollarSign, ShoppingCart, Users } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { DashboardTrendChart } from "@/app/admin/_components/dashboard-trend-chart";
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
import { formatCurrency, getDashboardData, getOrderProfit } from "@/lib/ecommerce-data";

export default async function AdminOverviewPage() {
  const dashboard = await getDashboardData();

  const metricCards = [
    { label: "Total Revenue", value: formatCurrency(dashboard.metrics.totalRevenue), icon: DollarSign },
    { label: "Total Orders", value: String(dashboard.metrics.totalOrders), icon: ShoppingCart },
    { label: "Total Customers", value: String(dashboard.metrics.totalCustomers), icon: Users },
    { label: "Low Stock Alerts", value: String(dashboard.lowStockProducts.length), icon: AlertTriangle },
  ];

  return (
    <AdminShell
      title="Overview"
      description="Operational dashboard for a single-store owner: revenue, orders, customers, profit, trend, low stock, and recent activity."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="rounded-lg border-border/70 py-0">
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">
                      {item.value}
                    </p>
                  </div>
                  <div className="flex size-11 items-center justify-center rounded-md bg-muted">
                    <Icon className="size-5 text-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Sales and profit trend</CardTitle>
            </CardHeader>
            <CardContent>
              <DashboardTrendChart data={dashboard.trend} />
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Low stock products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-md border border-border/70 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="size-4 text-amber-500" />
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {product.stockQuantity} left / low stock at {product.lowStockLimit}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={product.status} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboard.orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell>{formatCurrency(order.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Most sold / highest signal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.mostSoldProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-md border border-border/70 px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-foreground">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.reviewsCount} reviews • {product.category}
                    </p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-medium text-foreground">
                      {formatCurrency(product.price)}
                    </p>
                    <p className="text-muted-foreground">
                      Margin {formatCurrency(product.price - product.costPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Order profit detail</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Ad Cost</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.orderNumber}</TableCell>
                    <TableCell>{formatCurrency(order.revenue)}</TableCell>
                    <TableCell>{formatCurrency(order.shippingCost)}</TableCell>
                    <TableCell>{formatCurrency(order.adCost)}</TableCell>
                    <TableCell>{formatCurrency(getOrderProfit(order))}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
