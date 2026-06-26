import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ExpenseForm } from "@/app/admin/expenses/_components/expense-form";
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
          <CardContent className="p-6">
            <ExpenseForm />
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
