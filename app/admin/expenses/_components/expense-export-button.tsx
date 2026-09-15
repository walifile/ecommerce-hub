"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildExpenseCsv } from "@/lib/expense-management";

type ExportExpense = { title: string; type: string; date: string; amount: number };

export function ExpenseExportButton({ expenses }: { expenses: ExportExpense[] }) {
  function download() {
    const blob = new Blob(
      [buildExpenseCsv(expenses)],
      { type: "text/csv;charset=utf-8" }
    );
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <Button type="button" variant="outline" disabled={!expenses.length} onClick={download}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
