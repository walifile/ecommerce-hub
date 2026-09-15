import Link from "next/link";
import { Calculator, CircleDollarSign, Package, ReceiptText, Search, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { DashboardTrendChart } from "@/app/admin/_components/dashboard-trend-chart";
import { ProfitExportButton } from "@/app/admin/profit/_components/profit-export-button";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCatalogData, type DashboardSeriesPoint } from "@/lib/ecommerce-data";
import {
  formatProfitCurrency,
  getOrderProfitBreakdown,
  summarizeProfit,
  type OrderProfitBreakdown,
  type ProfitCategory,
} from "@/lib/profit-report";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type View = "actual" | ProfitCategory | "all";

function matchesView(row: OrderProfitBreakdown, view: View) {
  if (view === "all") return true;
  if (view === "actual") return row.category === "realized" || row.category === "returned";
  return row.category === view;
}

function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildTrend(rows: OrderProfitBreakdown[]): DashboardSeriesPoint[] {
  const keys = rows.map((row) => row.reportDate).sort();
  const useMonths = keys.length > 0 && keys[0].slice(0, 7) !== keys[keys.length - 1].slice(0, 7) && keys.length > 31;
  const buckets = new Map<string, { revenue: number; profit: number; orders: number }>();
  for (const row of rows) {
    if (row.category === "cancelled") continue;
    const key = useMonths ? row.reportDate.slice(0, 7) : row.reportDate;
    const bucket = buckets.get(key) ?? { revenue: 0, profit: 0, orders: 0 };
    bucket.revenue += row.revenue;
    bucket.profit += row.profit;
    bucket.orders += 1;
    buckets.set(key, bucket);
  }
  return [...buckets.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => ({
    label: useMonths
      ? new Date(`${key}-01T00:00:00Z`).toLocaleDateString("en-US", { month: "short", year: "2-digit", timeZone: "UTC" })
      : new Date(`${key}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }),
    revenue: Number(value.revenue.toFixed(2)),
    profit: Number(value.profit.toFixed(2)),
    orders: value.orders,
  }));
}

export default async function AdminProfitPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const catalog = await getCatalogData();
  const query = (params.search ?? "").trim().toLocaleLowerCase().slice(0, 100);
  const view = (["actual", "realized", "projected", "returned", "cancelled", "all"].includes(params.view)
    ? params.view
    : "actual") as View;
  const sort = (["newest", "oldest", "profit-high", "profit-low", "revenue"].includes(params.sort)
    ? params.sort
    : "newest");
  const from = DATE_PATTERN.test(params.from ?? "") ? params.from : "";
  const to = DATE_PATTERN.test(params.to ?? "") ? params.to : "";
  const invalidRange = Boolean(from && to && from > to);

  const allRows = catalog.orders.map(getOrderProfitBreakdown);
  const reportRows = allRows.filter((row) => {
    if (!matchesView(row, view)) return false;
    if (from && row.reportDate < from) return false;
    if (to && row.reportDate > to) return false;
    if (query && ![
      row.order.orderNumber,
      row.order.customerName,
      row.order.customerPhone,
      row.order.customerEmail,
    ].some((value) => value.toLocaleLowerCase().includes(query))) return false;
    return true;
  });
  reportRows.sort((a, b) => {
    if (sort === "oldest") return a.reportDate.localeCompare(b.reportDate);
    if (sort === "profit-high") return b.profit - a.profit;
    if (sort === "profit-low") return a.profit - b.profit;
    if (sort === "revenue") return b.revenue - a.revenue;
    return b.reportDate.localeCompare(a.reportDate);
  });

  const periodExpenses = catalog.expenses.filter((expense) =>
    (!from || expense.date >= from) && (!to || expense.date <= to)
  );
  const summary = summarizeProfit(reportRows, periodExpenses);
  const actualRows = allRows.filter((row) => row.category === "realized" || row.category === "returned");
  const today = dateKey(new Date());
  const startOfWeekDate = new Date();
  startOfWeekDate.setUTCHours(0, 0, 0, 0);
  startOfWeekDate.setUTCDate(startOfWeekDate.getUTCDate() - ((startOfWeekDate.getUTCDay() + 6) % 7));
  const starts = {
    today,
    week: dateKey(startOfWeekDate),
    month: today.slice(0, 8) + "01",
  };
  const netSince = (start: string) => summarizeProfit(
    actualRows.filter((row) => row.reportDate >= start && row.reportDate <= today),
    catalog.expenses.filter((expense) => expense.date >= start && expense.date <= today)
  ).netProfit;
  const periodCards = [
    { label: "Daily net profit", value: netSince(starts.today) },
    { label: "Weekly net profit", value: netSince(starts.week) },
    { label: "Monthly net profit", value: netSince(starts.month) },
  ];

  const trend = buildTrend(reportRows);
  const productPerformance = new Map<string, { units: number; profit: number }>();
  for (const row of reportRows.filter((item) => item.category === "realized")) {
    const itemRevenue = row.order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    for (const item of row.order.items) {
      const current = productPerformance.get(item.productName) ?? { units: 0, profit: 0 };
      const share = itemRevenue > 0 ? (item.unitPrice * item.quantity) / itemRevenue : 1 / row.order.items.length;
      current.units += item.quantity;
      current.profit += row.profit * share;
      productPerformance.set(item.productName, current);
    }
  }
  const productRows = [...productPerformance.entries()].map(([name, value]) => ({ name, ...value }));
  const mostSold = productRows.slice().sort((a, b) => b.units - a.units).slice(0, 5);
  const highestProfit = productRows.slice().sort((a, b) => b.profit - a.profit).slice(0, 5);

  const resultCount = reportRows.length;
  const requestedPage = Number(params.page ?? "1");
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const page = Math.min(Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, totalPages);
  const visibleRows = reportRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = {
    realized: allRows.filter((row) => row.category === "realized").length,
    projected: allRows.filter((row) => row.category === "projected").length,
    returned: allRows.filter((row) => row.category === "returned").length,
    cancelled: allRows.filter((row) => row.category === "cancelled").length,
  };
  const hasFilters = query || view !== "actual" || from || to || sort !== "newest";

  const metricCards = [
    { label: "Recognized revenue", value: summary.revenue, icon: CircleDollarSign },
    { label: "Product cost", value: summary.productCost, icon: Package },
    { label: "Shipping + ad", value: summary.shippingCost + summary.adCost, icon: ReceiptText },
    { label: "Order profit", value: summary.orderProfit, icon: Calculator },
    { label: "Expense log", value: summary.operatingExpenses, icon: Wallet },
    { label: "Net profit", value: summary.netProfit, icon: summary.netProfit >= 0 ? TrendingUp : TrendingDown },
  ];

  return (
    <AdminShell
      title="Profit Tracking"
      description="Realized sales, projected orders, refunds, direct costs, and operating expenses kept separate for defensible reporting."
    >
      <div className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {periodCards.map((item) => (
            <Card key={item.label} className="py-0"><CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className={cn("mt-2 text-2xl font-bold", item.value < 0 && "text-destructive")}>{formatProfitCurrency(item.value)}</p>
            </CardContent></Card>
          ))}
        </div>

        <form action="/admin/profit" className="flex flex-wrap items-end gap-2 rounded-xl border bg-muted/20 p-3">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={params.search ?? ""} placeholder="Search order or customer" className="bg-background pl-9" />
          </div>
          <select name="view" defaultValue={view} aria-label="Accounting view" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="actual">Actual: delivered + returns</option>
            <option value="realized">Delivered only</option>
            <option value="projected">Projected open orders</option>
            <option value="returned">Returns only</option>
            <option value="cancelled">Cancelled only</option>
            <option value="all">All orders</option>
          </select>
          <Input type="date" name="from" defaultValue={from} aria-label="From date" className="w-auto bg-background" />
          <Input type="date" name="to" defaultValue={to} aria-label="To date" className="w-auto bg-background" />
          <select name="sort" defaultValue={sort} aria-label="Sort report" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="profit-high">Highest profit</option>
            <option value="profit-low">Lowest profit</option>
            <option value="revenue">Highest revenue</option>
          </select>
          <Button type="submit">Apply</Button>
          {hasFilters ? <Button variant="outline" render={<Link href="/admin/profit" />}>Clear</Button> : null}
          <ProfitExportButton rows={reportRows.map((row) => ({
            orderNumber: row.order.orderNumber,
            customer: row.order.customerName,
            status: row.order.status,
            category: row.category,
            date: row.reportDate,
            revenue: row.revenue,
            refund: row.refund,
            productCost: row.productCost,
            shippingCost: row.shippingCost,
            adCost: row.adCost,
            profit: row.profit,
          }))} />
        </form>
        {invalidRange ? (
          <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">The from date must be before or equal to the to date.</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{counts.realized} delivered</Badge>
          <Badge variant="outline">{counts.projected} projected</Badge>
          <Badge variant="outline">{counts.returned} returned</Badge>
          <Badge variant="outline">{counts.cancelled} cancelled</Badge>
          {summary.refunds > 0 ? <Badge variant="destructive">{formatProfitCurrency(summary.refunds)} refunded</Badge> : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metricCards.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="py-0"><CardContent className="flex items-center justify-between p-5">
                <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p><p className={cn("mt-2 text-2xl font-bold", item.label === "Net profit" && item.value < 0 && "text-destructive")}>{formatProfitCurrency(item.value)}</p></div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              </CardContent></Card>
            );
          })}
        </div>

        <div className="rounded-xl border border-amber-500/25 bg-amber-500/5 p-4 text-sm text-muted-foreground">
          <p><span className="font-semibold text-foreground">Net margin: {summary.margin.toFixed(2)}%.</span> Order profit = recognized revenue − product cost − shipping cost − ad cost. Net profit also subtracts the Expense Log.</p>
          <p className="mt-1">Do not log a shipping or ad cost again as a separate expense when it is already stored on an order.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card className="py-0"><CardHeader><CardTitle>Revenue and order-profit trend</CardTitle></CardHeader><CardContent>
            {trend.length ? <DashboardTrendChart data={trend} /> : <div className="flex min-h-72 items-center justify-center text-sm text-muted-foreground">No accounting activity matches these filters.</div>}
          </CardContent></Card>
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
            {[
              { title: "Most sold products", rows: mostSold, render: (row: (typeof mostSold)[number]) => `${row.units} units` },
              { title: "Highest-profit products", rows: highestProfit, render: (row: (typeof highestProfit)[number]) => formatProfitCurrency(row.profit) },
            ].map((group) => (
              <Card key={group.title} className="py-0"><CardHeader><CardTitle>{group.title}</CardTitle></CardHeader><CardContent className="space-y-2">
                {group.rows.length ? group.rows.map((row, index) => (
                  <div key={row.name} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"><span className="truncate">{index + 1}. {row.name}</span><span className="shrink-0 font-semibold">{group.render(row)}</span></div>
                )) : <p className="text-sm text-muted-foreground">No delivered products in this report.</p>}
              </CardContent></Card>
            ))}
          </div>
        </div>

        <Card className="overflow-hidden py-0">
          <CardHeader className="border-b bg-muted/20"><div className="flex items-center justify-between gap-3"><div><CardTitle>Per-order profit calculation</CardTitle><p className="mt-1 text-sm text-muted-foreground">{resultCount} matching orders</p></div><Badge variant="outline">Accounting date reflects delivery or return date</Badge></div></CardHeader>
          <CardContent className="p-0"><div className="overflow-x-auto"><Table>
            <TableHeader><TableRow>
              <TableHead>Order</TableHead><TableHead>Status</TableHead><TableHead>Date</TableHead><TableHead>Revenue</TableHead><TableHead>Refund</TableHead><TableHead>Product Cost</TableHead><TableHead>Shipping</TableHead><TableHead>Ad Cost</TableHead><TableHead className="text-right">Profit</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {visibleRows.map((row) => (
                <TableRow key={row.order.id}>
                  <TableCell><Link href={`/admin/orders/${row.order.id}`} className="font-medium text-primary hover:underline">{row.order.orderNumber}</Link><p className="max-w-40 truncate text-xs text-muted-foreground">{row.order.customerName}</p></TableCell>
                  <TableCell><StatusBadge status={row.order.status} /><p className="mt-1 text-[11px] capitalize text-muted-foreground">{row.category}</p></TableCell>
                  <TableCell className="whitespace-nowrap">{new Date(`${row.reportDate}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}</TableCell>
                  <TableCell>{formatProfitCurrency(row.revenue)}</TableCell>
                  <TableCell className={row.refund > 0 ? "text-destructive" : undefined}>{formatProfitCurrency(row.refund)}</TableCell>
                  <TableCell>{formatProfitCurrency(row.productCost)}</TableCell>
                  <TableCell>{formatProfitCurrency(row.shippingCost)}</TableCell>
                  <TableCell>{formatProfitCurrency(row.adCost)}</TableCell>
                  <TableCell className={cn("text-right font-semibold", row.profit < 0 ? "text-destructive" : "text-emerald-600 dark:text-emerald-400")}>{formatProfitCurrency(row.profit)}</TableCell>
                </TableRow>
              ))}
              {!visibleRows.length ? <TableRow><TableCell colSpan={9} className="h-32 text-center text-muted-foreground">No orders match the current accounting filters.</TableCell></TableRow> : null}
            </TableBody>
          </Table></div></CardContent>
        </Card>

        {resultCount > PAGE_SIZE ? (
          <div className="flex items-center justify-between gap-3 text-sm"><p className="text-muted-foreground">Page {page} of {totalPages} · {resultCount} orders</p><div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} render={page > 1 ? <Link href={{ pathname: "/admin/profit", query: { ...params, page: String(page - 1) } }} /> : undefined}>Previous</Button>
            <Button variant="outline" disabled={page === totalPages} render={page < totalPages ? <Link href={{ pathname: "/admin/profit", query: { ...params, page: String(page + 1) } }} /> : undefined}>Next</Button>
          </div></div>
        ) : null}
      </div>
    </AdminShell>
  );
}
