"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ExportExpense = { title: string; type: string; date: string; amount: number };

function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function ExpenseExportButton({ expenses }: { expenses: ExportExpense[] }) {
  function download() {
    const rows = [
      ["Title", "Type", "Date", "Amount"],
      ...expenses.map((expense) => [expense.title, expense.type, expense.date, expense.amount.toFixed(2)]),
    ];
    const blob = new Blob(
      [`\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`],
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
