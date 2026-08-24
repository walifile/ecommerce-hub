import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ExpenseForm } from "@/app/admin/expenses/_components/expense-form";
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
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteExpenseAction } from "@/app/admin/expenses/actions";

export default async function AdminExpensesPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Expenses Module"
      description="Advertising, shipping, salary, and miscellaneous expenses are modeled separately so profit reporting can stay defensible."
    >
      <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle>Add expense</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ExpenseForm />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 py-0">
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.expenses.length === 0 ? (
                  <TableEmpty colSpan={5} message="No expenses logged yet." />
                ) : null}
                {catalog.expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="font-medium">{expense.title}</TableCell>
                    <TableCell className="capitalize">{expense.expenseType}</TableCell>
                    <TableCell>{expense.date}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell className="text-right">
                      <form action={deleteExpenseAction}>
                        <input type="hidden" name="expenseId" value={expense.id} />
                        <Button type="submit" variant="ghost" size="icon-sm" aria-label={`Delete ${expense.title}`}>
                          <Trash2 className="size-4" />
                        </Button>
                      </form>
                    </TableCell>
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
