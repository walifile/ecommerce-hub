"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ProfitExportRow = {
  orderNumber: string;
  customer: string;
  status: string;
  category: string;
  date: string;
  revenue: number;
  refund: number;
  productCost: number;
  shippingCost: number;
  adCost: number;
  profit: number;
};

function csvCell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^\s*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export function ProfitExportButton({ rows }: { rows: ProfitExportRow[] }) {
  function download() {
    const headings = [
      "Order",
      "Customer",
      "Status",
      "Accounting category",
      "Report date",
      "Recognized revenue",
      "Refund",
      "Product cost",
      "Shipping cost",
      "Ad cost",
      "Order profit",
    ];
    const lines = [
      headings.map(csvCell).join(","),
      ...rows.map((row) => [
        row.orderNumber,
        row.customer,
        row.status,
        row.category,
        row.date,
        row.revenue.toFixed(2),
        row.refund.toFixed(2),
        row.productCost.toFixed(2),
        row.shippingCost.toFixed(2),
        row.adCost.toFixed(2),
        row.profit.toFixed(2),
      ].map(csvCell).join(",")),
    ];
    const blob = new Blob([`\uFEFF${lines.join("\r\n")}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `profit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  return (
    <Button type="button" variant="outline" disabled={!rows.length} onClick={download}>
      <Download className="size-4" />
      Export CSV
    </Button>
  );
}
