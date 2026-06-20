import { AdminShell } from "@/app/admin/_components/admin-shell";
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

export default async function AdminProfitPage() {
  const dashboard = await getDashboardData();

  return (
    <AdminShell
      title="Profit Tracking"
      description="Each order stores product cost, shipping cost, ad cost, and revenue. Profit is calculated as revenue minus those costs."
    >
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            { label: "Daily Profit", value: dashboard.metrics.dailyProfit },
            { label: "Weekly Profit", value: dashboard.metrics.weeklyProfit },
            { label: "Monthly Profit", value: dashboard.metrics.monthlyProfit },
          ].map((item) => (
            <Card key={item.label} className="rounded-lg border-border/70 py-0">
              <CardContent className="p-5">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {formatCurrency(item.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Per-order profit calculation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Product Cost</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Ad Cost</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.orders.map((order) => {
                  const productCost = order.items.reduce(
                    (sum, item) => sum + item.productCost * item.quantity,
                    0
                  );

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell>{formatCurrency(order.revenue)}</TableCell>
                      <TableCell>{formatCurrency(productCost)}</TableCell>
                      <TableCell>{formatCurrency(order.shippingCost)}</TableCell>
                      <TableCell>{formatCurrency(order.adCost)}</TableCell>
                      <TableCell>{formatCurrency(getOrderProfit(order))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
