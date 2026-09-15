import Link from "next/link";
import {
  AlertTriangle,
  DollarSign,
  PackageSearch,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { DashboardTrendChart } from "@/app/admin/_components/dashboard-trend-chart";
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
  getCatalogData,
  type DashboardSeriesPoint,
  type Order,
} from "@/lib/ecommerce-data";
import { getOrderProfitBreakdown, type OrderProfitBreakdown } from "@/lib/profit-report";
import { formatCurrency, formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Range = "1d" | "7d" | "30d" | "90d" | "all";
const RANGES: { key: Range; label: string }[] = [
  { key: "1d",  label: "Today"    },
  { key: "7d",  label: "7 days"   },
  { key: "30d", label: "30 days"  },
  { key: "90d", label: "90 days"  },
  { key: "all", label: "All time" },
];

function getCutoff(range: Range): Date | null {
  if (range === "all") return null;
  const days = range === "1d" ? 1 : range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - (days - 1));
  return d;
}

function filterOrders(orders: Order[], range: Range): Order[] {
  const cutoff = getCutoff(range);
  if (!cutoff) return orders;
  return orders.filter((o) => new Date(o.createdAt) >= cutoff);
}

function computeTrend(rows: OrderProfitBreakdown[], range: Range): DashboardSeriesPoint[] {
  const now = new Date();

  if (range === "1d" || range === "7d" || range === "30d") {
    const days = range === "1d" ? 1 : range === "7d" ? 7 : 30;
    return Array.from({ length: days }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (days - 1 - i));
      const key = d.toISOString().slice(0, 10);
      const dayOrders = rows.filter((row) => row.reportDate === key);
      return {
        label:
          range === "1d"
            ? "Today"
            : range === "7d"
            ? d.toLocaleDateString("en-US", { weekday: "short" })
            : d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: dayOrders.reduce((sum, row) => sum + row.revenue, 0),
        profit: dayOrders.reduce((sum, row) => sum + row.profit, 0),
        orders:  dayOrders.length,
      };
    });
  }

  if (range === "90d") {
    return Array.from({ length: 13 }, (_, w) => {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - (12 - w) * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);
      const weekOrders = rows.filter((row) => {
        const d = new Date(row.reportDate);
        return d >= weekStart && d <= weekEnd;
      });
      return {
        label: weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        revenue: weekOrders.reduce((sum, row) => sum + row.revenue, 0),
        profit: weekOrders.reduce((sum, row) => sum + row.profit, 0),
        orders:  weekOrders.length,
      };
    });
  }

  // all — group by month
  const monthMap = new Map<string, { revenue: number; profit: number; orders: number; ts: number }>();
  rows.forEach((row) => {
    const d = new Date(row.reportDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = monthMap.get(key) ?? { revenue: 0, profit: 0, orders: 0, ts: d.getTime() };
    entry.revenue += row.revenue;
    entry.profit += row.profit;
    entry.orders  += 1;
    monthMap.set(key, entry);
  });

  return [...monthMap.entries()]
    .sort((a, b) => a[1].ts - b[1].ts)
    .map(([, { revenue, profit, orders, ts }]) => ({
      label: new Date(ts).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
      revenue,
      profit,
      orders,
    }));
}

function topProductsByRevenue(orders: Order[], limit = 5) {
  const map = new Map<string, number>();
  orders.forEach((order) => {
    order.items.forEach((item) => {
      map.set(item.productName, (map.get(item.productName) ?? 0) + item.unitPrice * item.quantity);
    });
  });
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, revenue]) => ({ name, revenue }));
}

function topProductsByUnits(orders: Order[], limit = 5) {
  const map = new Map<string, number>();
  orders.forEach((order) => order.items.forEach((item) =>
    map.set(item.productName, (map.get(item.productName) ?? 0) + item.quantity)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

function topProductsByProfit(orders: Order[], limit = 5) {
  const map = new Map<string, number>();
  orders.forEach((order) => {
    const profit = getOrderProfitBreakdown(order).profit;
    const itemRevenue = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    order.items.forEach((item) => {
      const share = itemRevenue > 0
        ? (item.unitPrice * item.quantity) / itemRevenue
        : 1 / order.items.length;
      map.set(item.productName, (map.get(item.productName) ?? 0) + profit * share);
    });
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([name, value]) => ({ name, value }));
}

export default async function AdminOverviewPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params  = await searchParams;
  const range   = (["1d", "7d", "30d", "90d", "all"].includes(params.range) ? params.range : "30d") as Range;

  const data           = await getCatalogData();
  const cutoff         = getCutoff(range);
  const filtered       = filterOrders(data.orders, range);
  const accountingRows = data.orders
    .map(getOrderProfitBreakdown)
    .filter((row) =>
      (row.category === "realized" || row.category === "returned") &&
      (!cutoff || new Date(row.reportDate) >= cutoff)
    );
  const deliveredOrders = accountingRows
    .filter((row) => row.category === "realized")
    .map((row) => row.order);
  const trend          = computeTrend(accountingRows, range);
  const topProducts    = topProductsByRevenue(deliveredOrders);
  const mostSold       = topProductsByUnits(deliveredOrders);
  const highestProfit  = topProductsByProfit(deliveredOrders);
  const lowStock       = data.products.filter((p) => p.stockQuantity <= p.lowStockLimit);

  const totalRevenue   = accountingRows.reduce((sum, row) => sum + row.revenue, 0);
  const orderProfit    = accountingRows.reduce((sum, row) => sum + row.profit, 0);
  const totalOrders    = filtered.length;
  const avgOrderValue  = deliveredOrders.length > 0 ? totalRevenue / deliveredOrders.length : 0;

  const filteredExpenses = data.expenses.filter(
    (e) => !cutoff || new Date(e.date) >= cutoff
  );
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const totalProfit = orderProfit - totalExpenses;

  const metricCards = [
    {
      label: "Revenue",
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bar: "from-emerald-400 to-emerald-600",
      chip: "bg-emerald-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
    },
    {
      label: "Net Profit",
      value: formatCurrency(totalProfit),
      icon: TrendingUp,
      bar: "from-sky-400 to-sky-600",
      chip: "bg-sky-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-400",
    },
    {
      label: "Orders",
      value: String(totalOrders),
      icon: ShoppingCart,
      bar: "from-violet-400 to-violet-600",
      chip: "bg-violet-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
    },
    {
      label: "Avg Order Value",
      value: formatCurrency(avgOrderValue),
      icon: Wallet,
      bar: "from-pink-400 to-pink-600",
      chip: "bg-pink-500/10 text-pink-600 ring-pink-500/20 dark:text-pink-400",
    },
    {
      label: "Expenses",
      value: formatCurrency(totalExpenses),
      icon: PackageSearch,
      bar: "from-orange-400 to-orange-600",
      chip: "bg-orange-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-400",
    },
    {
      label: "Customers",
      value: String(data.customers.length),
      icon: Users,
      bar: "from-teal-400 to-teal-600",
      chip: "bg-teal-500/10 text-teal-600 ring-teal-500/20 dark:text-teal-400",
    },
  ];

  return (
    <AdminShell
      title="Overview"
      description="Revenue, profit, orders, and inventory at a glance."
    >
      <div className="space-y-6">
        {/* ── Range picker ── */}
        <div className="flex items-center gap-1 rounded-xl border border-border/70 bg-muted/40 p-1 w-fit">
          {RANGES.map(({ key, label }) => (
            <Link
              key={key}
              href={`?range=${key}`}
              className={cn(
                "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
                range === key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ── Metric cards ── */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.label}
                className="group relative overflow-hidden rounded-xl border-border/70 py-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
              >
                <div className={cn("absolute inset-x-0 top-0 h-1 bg-linear-to-r", item.bar)} />
                <CardContent className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                      {item.value}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl ring-1 transition-transform duration-200 group-hover:scale-110",
                      item.chip
                    )}
                  >
                    <Icon className="size-5" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* ── Chart + Top products ── */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <Card className="rounded-xl border-border/70 py-0">
            <CardHeader>
              <CardTitle>Revenue &amp; profit trend</CardTitle>
            </CardHeader>
            <CardContent>
              {trend.length > 0 ? (
                <DashboardTrendChart data={trend} />
              ) : (
                <div className="flex min-h-[280px] items-center justify-center text-sm text-muted-foreground">
                  No orders in this period.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/70 py-0">
            <CardHeader>
              <CardTitle>Top products by revenue</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topProducts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No sales in this period.</p>
              ) : (
                topProducts.map((p, i) => (
                  <div
                    key={p.name}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-sm font-semibold text-muted-foreground w-4 shrink-0">
                        {i + 1}
                      </span>
                      <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    </div>
                    <p className="shrink-0 text-sm font-semibold text-foreground">
                      {formatCurrency(p.revenue)}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Low stock + Recent orders ── */}
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            { title: "Most sold products", rows: mostSold, format: (value: number) => `${value} units` },
            { title: "Highest-profit products", rows: highestProfit, format: (value: number) => formatCurrency(value) },
          ].map((group) => (
            <Card key={group.title} className="rounded-xl border-border/70 py-0">
              <CardHeader><CardTitle>{group.title}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {group.rows.length ? group.rows.map((row, index) => (
                  <div key={row.name} className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 text-sm">
                    <span className="truncate font-medium">{index + 1}. {row.name}</span>
                    <span className="font-semibold">{group.format(row.value)}</span>
                  </div>
                )) : <p className="text-sm text-muted-foreground">No sales in this period.</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-xl border-border/70 py-0">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Low stock alerts</CardTitle>
              {lowStock.length > 0 && (
                <Badge variant="destructive" className="rounded-full">
                  {lowStock.length}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.length === 0 ? (
                <p className="text-sm text-muted-foreground">All products are well stocked.</p>
              ) : (
                lowStock.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="size-4 shrink-0 text-amber-500" />
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.stockQuantity} left · limit {product.lowStockLimit}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={product.status} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-xl border-border/70 py-0">
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
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 8).map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.orderNumber}</TableCell>
                      <TableCell className="max-w-28 truncate">{order.customerName}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                    </TableRow>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-sm text-muted-foreground">
                        No orders in this period.
                      </td>
                    </tr>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* ── Profit detail table ── */}
        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle>Order profit breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Shipping</TableHead>
                  <TableHead>Ad Cost</TableHead>
                  <TableHead>Profit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accountingRows.slice(0, 15).map((row) => (
                  <TableRow key={row.order.id}>
                    <TableCell className="font-medium">{row.order.orderNumber}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(row.reportDate)}</TableCell>
                    <TableCell>{formatCurrency(row.revenue)}</TableCell>
                    <TableCell>{formatCurrency(row.shippingCost)}</TableCell>
                    <TableCell>{formatCurrency(row.adCost)}</TableCell>
                    <TableCell
                      className={cn(
                        "font-medium",
                        row.profit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"
                      )}
                    >
                      {formatCurrency(row.profit)}
                    </TableCell>
                  </TableRow>
                ))}
                {accountingRows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No orders in this period.
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
