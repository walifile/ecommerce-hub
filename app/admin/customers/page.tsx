import { AdminShell } from "@/app/admin/_components/admin-shell";
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
import { formatCurrency, getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminCustomersPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Customer Module"
      description="Customer profiles consolidate contact details, lifetime value, total orders, total revenue, and previous order history."
    >
      <div className="grid gap-6">
        <div className="grid gap-4 lg:grid-cols-3">
          {catalog.customers.map((customer) => (
            <Card key={customer.id} className="rounded-xl border-border/70 py-0">
              <CardContent className="space-y-3 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {customer.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {customer.city} • {customer.email}
                  </p>
                </div>
                <div className="grid gap-2 text-sm text-muted-foreground">
                  <p>Total orders: <span className="font-medium text-foreground">{customer.totalOrders}</span></p>
                  <p>Total revenue: <span className="font-medium text-foreground">{formatCurrency(customer.totalRevenue)}</span></p>
                  <p>Lifetime value: <span className="font-medium text-foreground">{formatCurrency(customer.lifetimeValue)}</span></p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle>Customer history</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Lifetime Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.customers.length === 0 ? (
                  <TableEmpty colSpan={5} message="No customers yet." />
                ) : null}
                {catalog.customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell>{formatCurrency(customer.lifetimeValue)}</TableCell>
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
