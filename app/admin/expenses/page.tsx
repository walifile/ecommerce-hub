import { AdminShell } from "@/app/admin/_components/admin-shell";
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
import { formatCurrency, getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminExpensesPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Expenses Module"
      description="Advertising, shipping, salary, and miscellaneous expenses are modeled separately so profit reporting can stay defensible."
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            <Input placeholder="Title" />
            <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option>Advertising</option>
              <option>Shipping</option>
              <option>Salary</option>
              <option>Miscellaneous</option>
            </select>
            <Input placeholder="Amount" />
            <Input type="date" />
            <Button>Save expense</Button>
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Expense log</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="capitalize">{expense.expenseType}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
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
