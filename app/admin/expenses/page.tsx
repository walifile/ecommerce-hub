import Link from "next/link";
import { CalendarDays, CircleDollarSign, ReceiptText, Search, Tags } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ExpenseExportButton } from "@/app/admin/expenses/_components/expense-export-button";
import { ExpenseForm } from "@/app/admin/expenses/_components/expense-form";
import { ExpenseRowActions } from "@/app/admin/expenses/_components/expense-row-actions";
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
import { getCatalogData } from "@/lib/ecommerce-data";
import { formatProfitCurrency } from "@/lib/profit-report";
import { filterExpenses, isValidExpenseDate, sortExpenses, type ExpenseSort } from "@/lib/expense-management";

const PAGE_SIZE = 20;
const TYPES = ["all", "advertising", "shipping", "salary", "miscellaneous"];

export default async function AdminExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const catalog = await getCatalogData();
  const query = (params.search ?? "").trim().toLocaleLowerCase().slice(0, 100);
  const type = TYPES.includes(params.type) ? params.type : "all";
  const sort = ["newest", "oldest", "highest", "lowest", "title"].includes(params.sort)
    ? params.sort
    : "newest";
  const from = isValidExpenseDate(params.from ?? "") ? params.from : "";
  const to = isValidExpenseDate(params.to ?? "") ? params.to : "";
  const invalidRange = Boolean(from && to && from > to);

  const filteredExpenses = sortExpenses(
    filterExpenses(catalog.expenses, {
      query,
      type: type as "all" | (typeof catalog.expenses)[number]["expenseType"],
      from,
      to,
    }),
    sort as ExpenseSort
  );

  const resultCount = filteredExpenses.length;
  const requestedPage = Number(params.page ?? "1");
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const page = Math.min(Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1, totalPages);
  const visibleExpenses = filteredExpenses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const allTimeTotal = catalog.expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthTotal = catalog.expenses
    .filter((expense) => expense.date.startsWith(currentMonth))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const filteredTotal = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageExpense = resultCount ? filteredTotal / resultCount : 0;
  const typeTotals = ["advertising", "shipping", "salary", "miscellaneous"].map((expenseType) => ({
    type: expenseType,
    total: catalog.expenses
      .filter((expense) => expense.expenseType === expenseType)
      .reduce((sum, expense) => sum + expense.amount, 0),
  }));
  const hasFilters = query || type !== "all" || from || to || sort !== "newest";

  return (
    <AdminShell
      title="Expenses Module"
      description="Record and maintain operating expenses that feed directly into net-profit reporting."
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "All-time expenses", value: allTimeTotal, icon: CircleDollarSign },
            { label: "This month", value: monthTotal, icon: CalendarDays },
            { label: "Filtered total", value: filteredTotal, icon: ReceiptText },
            { label: "Average expense", value: averageExpense, icon: Tags },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="py-0"><CardContent className="flex items-center justify-between p-5">
                <div><p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-bold">{formatProfitCurrency(item.value)}</p></div>
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              </CardContent></Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
          <div className="space-y-6">
            <Card className="py-0 xl:sticky xl:top-6">
              <CardHeader><CardTitle>Add expense</CardTitle></CardHeader>
              <CardContent className="p-6 pt-0"><ExpenseForm /></CardContent>
            </Card>
            <Card className="py-0">
              <CardHeader><CardTitle>Totals by type</CardTitle></CardHeader>
              <CardContent className="space-y-2 pb-6">
                {typeTotals.map((item) => (
                  <div key={item.type} className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span className="capitalize text-muted-foreground">{item.type}</span><span className="font-semibold">{formatProfitCurrency(item.total)}</span></div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <form action="/admin/expenses" className="flex flex-wrap items-end gap-2 rounded-xl border bg-muted/20 p-3">
              <div className="relative min-w-56 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input name="search" defaultValue={params.search ?? ""} placeholder="Search expense title" className="bg-background pl-9" />
              </div>
              <select name="type" defaultValue={type} aria-label="Expense type" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="all">All types</option>
                <option value="advertising">Advertising</option>
                <option value="shipping">Shipping</option>
                <option value="salary">Salary</option>
                <option value="miscellaneous">Miscellaneous</option>
              </select>
              <Input name="from" type="date" defaultValue={from} aria-label="From date" className="w-auto bg-background" />
              <Input name="to" type="date" defaultValue={to} aria-label="To date" className="w-auto bg-background" />
              <select name="sort" defaultValue={sort} aria-label="Sort expenses" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="highest">Highest amount</option>
                <option value="lowest">Lowest amount</option>
                <option value="title">Title A–Z</option>
              </select>
              <Button type="submit">Apply</Button>
              {hasFilters ? <Button variant="outline" render={<Link href="/admin/expenses" />}>Clear</Button> : null}
              <ExpenseExportButton expenses={filteredExpenses.map((expense) => ({ title: expense.title, type: expense.expenseType, date: expense.date, amount: expense.amount }))} />
            </form>
            {invalidRange ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">The from date must be before or equal to the to date.</p> : null}
            <p className="rounded-lg border border-amber-500/25 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
              Do not add shipping or advertising here if the same cost is already stored against an order; that would reduce profit twice.
            </p>

            <Card className="overflow-hidden py-0">
              <CardHeader className="border-b bg-muted/20"><div className="flex items-center justify-between gap-3"><div><CardTitle>Expense log</CardTitle><p className="mt-1 text-sm text-muted-foreground">{resultCount} of {catalog.expenses.length} expenses</p></div><Badge variant="outline">{formatProfitCurrency(filteredTotal)}</Badge></div></CardHeader>
              <CardContent className="p-0"><div className="overflow-x-auto"><Table>
                <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Type</TableHead><TableHead>Date</TableHead><TableHead>Amount</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                <TableBody>
                  {visibleExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell className="min-w-52"><p className="font-medium">{expense.title}</p>{expense.updatedAt !== expense.createdAt ? <p className="text-xs text-muted-foreground">Edited</p> : null}</TableCell>
                      <TableCell><Badge variant="secondary" className="capitalize">{expense.expenseType}</Badge></TableCell>
                      <TableCell className="whitespace-nowrap">{new Date(`${expense.date}T00:00:00Z`).toLocaleDateString("en-US", { dateStyle: "medium", timeZone: "UTC" })}</TableCell>
                      <TableCell className="font-semibold">{formatProfitCurrency(expense.amount)}</TableCell>
                      <TableCell className="text-right"><ExpenseRowActions expense={{ id: expense.id, title: expense.title, expenseType: expense.expenseType, amount: expense.amount, date: expense.date, updatedAt: expense.updatedAt }} /></TableCell>
                    </TableRow>
                  ))}
                  {!visibleExpenses.length ? <TableRow><TableCell colSpan={5} className="h-36 text-center text-muted-foreground">{catalog.expenses.length ? "No expenses match the current filters." : "No expenses logged yet."}</TableCell></TableRow> : null}
                </TableBody>
              </Table></div></CardContent>
            </Card>

            {resultCount > PAGE_SIZE ? (
              <div className="flex items-center justify-between gap-3 text-sm"><p className="text-muted-foreground">Page {page} of {totalPages} · {resultCount} expenses</p><div className="flex gap-2">
                <Button variant="outline" disabled={page === 1} render={page > 1 ? <Link href={{ pathname: "/admin/expenses", query: { ...params, page: String(page - 1) } }} /> : undefined}>Previous</Button>
                <Button variant="outline" disabled={page === totalPages} render={page < totalPages ? <Link href={{ pathname: "/admin/expenses", query: { ...params, page: String(page + 1) } }} /> : undefined}>Next</Button>
              </div></div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
