import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { CustomerActions } from "@/app/admin/customers/_components/customer-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, getCatalogData } from "@/lib/ecommerce-data";

const PAGE_SIZE = 20;

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const catalog = await getCatalogData();
  const query = (params.search ?? "").trim().toLocaleLowerCase().slice(0, 100);
  const orderFilter = ["all", "with", "without"].includes(params.orders)
    ? params.orders
    : "all";
  const sort = ["newest", "oldest", "name", "orders", "value"].includes(params.sort)
    ? params.sort
    : "newest";
  let customers = catalog.customers.filter((customer) => {
    if (query && ![
      customer.name,
      customer.phone,
      customer.email,
      customer.city,
    ].some((value) => value.toLocaleLowerCase().includes(query))) return false;
    if (orderFilter === "with" && customer.totalOrders === 0) return false;
    if (orderFilter === "without" && customer.totalOrders > 0) return false;
    return true;
  });
  customers.sort((a, b) => {
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "orders") return b.totalOrders - a.totalOrders;
    if (sort === "value") return b.lifetimeValue - a.lifetimeValue;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const resultCount = customers.length;
  const requestedPage = Number(params.page ?? "1");
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const page = Math.min(
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    totalPages
  );
  customers = customers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalOrders = catalog.customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );
  const totalRevenue = catalog.customers.reduce(
    (sum, customer) => sum + customer.totalRevenue,
    0
  );
  const orderHistoryCount = new Map<string, number>();
  for (const order of catalog.orders) {
    if (!order.customerId) continue;
    orderHistoryCount.set(order.customerId, (orderHistoryCount.get(order.customerId) ?? 0) + 1);
  }

  return (
    <AdminShell
      title="Customer Module"
      description="Customer profiles consolidate contact details, lifetime value, total orders, total revenue, and previous order history."
    >
      <div className="space-y-5">
      <form className="flex flex-wrap items-end gap-2" action="/admin/customers">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="search" defaultValue={params.search ?? ""} placeholder="Search name, phone, email, or city" className="pl-9" />
        </div>
        <select name="orders" defaultValue={orderFilter} aria-label="Order filter" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="all">All customers</option>
          <option value="with">With orders</option>
          <option value="without">Without orders</option>
        </select>
        <select name="sort" defaultValue={sort} aria-label="Sort customers" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="name">Name A–Z</option>
          <option value="orders">Most orders</option>
          <option value="value">Highest value</option>
        </select>
        <Button type="submit">Apply</Button>
        {(query || orderFilter !== "all" || sort !== "newest") ? (
          <Button variant="outline" render={<Link href="/admin/customers" />}>Clear</Button>
        ) : null}
      </form>

      <Card className="overflow-hidden rounded-xl border-border/70 py-0">
        <CardHeader className="border-b border-border/70 bg-muted/20">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5 text-primary" />
                  Customers
                </CardTitle>
                <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                  {resultCount === catalog.customers.length
                    ? `${catalog.customers.length} total`
                    : `${resultCount} of ${catalog.customers.length}`}
                </Badge>
              </div>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Review saved customer records, contact details, lifetime value, and order history.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
                <ReceiptText className="size-3.5" />
                {totalOrders} orders
              </Badge>
              <Badge variant="outline" className="h-7 rounded-full px-3 text-[11px]">
                {formatCurrency(totalRevenue)} revenue
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {customers.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30 text-muted-foreground">
                <Users className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">
                {catalog.customers.length === 0 ? "No customers yet" : "No matching customers"}
              </h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {catalog.customers.length === 0
                  ? "Customer records will appear here after checkout or manual order entry."
                  : "No customers match the current search and filters."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Customer</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Orders</TableHead>
                    <TableHead>Total Revenue</TableHead>
                    <TableHead>Lifetime Value</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id} className="group">
                      <TableCell className="min-w-56">
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex items-center gap-3 transition-colors hover:text-primary"
                        >
                          <span className="flex size-9 items-center justify-center rounded-full border border-border/70 bg-muted/30 text-muted-foreground">
                            <UserRound className="size-4" />
                          </span>
                          <span>
                            <span className="block font-medium text-foreground group-hover:text-primary">
                              {customer.name}
                            </span>
                            <span className="block max-w-52 truncate text-xs text-muted-foreground">
                              ID {customer.id}
                            </span>
                          </span>
                        </Link>
                      </TableCell>
                      <TableCell className="min-w-56">
                        <div className="space-y-1.5 text-sm">
                          <p className="flex items-center gap-2 text-foreground">
                            <Phone className="size-4 text-muted-foreground" />
                            {customer.phone || "-"}
                          </p>
                          <p className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="size-4" />
                            <span className="max-w-48 truncate">{customer.email || "-"}</span>
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="min-w-56">
                        <p className="flex items-start gap-2 text-sm text-muted-foreground">
                          <MapPin className="mt-0.5 size-4 shrink-0" />
                          <span className="line-clamp-2">
                            {[customer.address, customer.city].filter(Boolean).join(", ") || "-"}
                          </span>
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="rounded-full px-2.5">
                          {customer.totalOrders}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(customer.totalRevenue)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(customer.lifetimeValue)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/customers/${customer.id}`}
                            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted hover:text-primary"
                          >
                            View
                            <ArrowUpRight className="size-3.5" />
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
                            orderCount={orderHistoryCount.get(customer.id) ?? 0}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {resultCount > PAGE_SIZE ? (
        <div className="flex items-center justify-between gap-3 text-sm">
          <p className="text-muted-foreground">
            Page {page} of {totalPages} · {resultCount} customers
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={page === 1} render={page > 1 ? <Link href={{ pathname: "/admin/customers", query: { ...params, page: String(page - 1) } }} /> : undefined}>Previous</Button>
            <Button variant="outline" disabled={page === totalPages} render={page < totalPages ? <Link href={{ pathname: "/admin/customers", query: { ...params, page: String(page + 1) } }} /> : undefined}>Next</Button>
          </div>
        </div>
      ) : null}
      </div>
    </AdminShell>
  );
}
