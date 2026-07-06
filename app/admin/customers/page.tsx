import Link from "next/link";
import {
  ArrowUpRight,
  Mail,
  MapPin,
  Phone,
  ReceiptText,
  UserRound,
  Users,
} from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
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
import { formatCurrency, getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminCustomersPage() {
  const catalog = await getCatalogData();
  const totalOrders = catalog.customers.reduce(
    (sum, customer) => sum + customer.totalOrders,
    0
  );
  const totalRevenue = catalog.customers.reduce(
    (sum, customer) => sum + customer.totalRevenue,
    0
  );

  return (
    <AdminShell
      title="Customer Module"
      description="Customer profiles consolidate contact details, lifetime value, total orders, total revenue, and previous order history."
    >
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
                  {catalog.customers.length} total
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
          {catalog.customers.length === 0 ? (
            <div className="flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl border border-border/70 bg-muted/30 text-muted-foreground">
                <Users className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-foreground">No customers yet</h3>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                Customer records will appear here after checkout or manual order entry.
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
                  {catalog.customers.map((customer) => (
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
                        <Link
                          href={`/admin/customers/${customer.id}`}
                          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-full border border-border/70 bg-background px-3 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-muted hover:text-primary"
                        >
                          View
                          <ArrowUpRight className="size-3.5" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
