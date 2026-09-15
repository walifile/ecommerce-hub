import Link from "next/link";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { OperationsSettingsForm } from "@/app/admin/_components/operations-settings-form";
import { RetryWhatsAppButton } from "@/app/admin/whatsapp/_components/retry-button";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCatalogData } from "@/lib/ecommerce-data";
import { maskWhatsAppPhone } from "@/lib/whatsapp-core";

const FILTERS = ["all", "queued", "accepted", "sent", "delivered", "read", "failed", "simulated", "skipped", "configuration_error"];
const RETRYABLE = new Set(["failed", "simulated", "skipped", "configuration_error"]);

export default async function AdminWhatsAppPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const catalog = await getCatalogData();
  const filter = FILTERS.includes(params.status) ? params.status : "all";
  const search = (params.search ?? "").trim().toLowerCase().slice(0, 100);
  const logs = catalog.whatsappLogs.filter((log) => {
    if (filter !== "all" && log.status !== filter) return false;
    if (search && !`${log.templateName} ${log.phone} ${log.errorCode ?? ""}`.toLowerCase().includes(search)) return false;
    return true;
  });
  const accepted = catalog.whatsappLogs.filter((log) => ["accepted", "sent", "delivered", "read"].includes(log.status)).length;
  const delivered = catalog.whatsappLogs.filter((log) => ["delivered", "read"].includes(log.status)).length;
  const failed = catalog.whatsappLogs.filter((log) => ["failed", "configuration_error"].includes(log.status)).length;
  const simulated = catalog.whatsappLogs.filter((log) => log.status === "simulated").length;

  return (
    <AdminShell title="WhatsApp Module" description="Manage approved order templates, audit real delivery state, and safely retry unsuccessful notifications.">
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Accepted", accepted], ["Delivered", delivered], ["Failed/config", failed], ["Simulated", simulated]].map(([label, value]) => (
          <Card key={String(label)} className="rounded-xl border-border/70 py-0"><CardContent className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
          </CardContent></Card>
        ))}
      </div>

      <Card className="mt-6 rounded-xl border-border/70 py-0">
        <CardHeader><CardTitle>Message previews &amp; shipping</CardTitle>
          <p className="text-sm text-muted-foreground">These editable messages are used for previews/simulation. Production automation uses approved Meta template names configured in environment variables.</p>
        </CardHeader>
        <CardContent className="p-6"><OperationsSettingsForm settings={catalog.settings} /></CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden rounded-xl border-border/70 py-0">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><CardTitle>Notification history</CardTitle><p className="mt-1 text-sm text-muted-foreground">Newest 200 attempts · {logs.length} matching</p></div>
            <form className="flex flex-wrap gap-2">
              <Input name="search" defaultValue={params.search ?? ""} placeholder="Phone, template, error code" className="w-56 bg-background" />
              <select name="status" defaultValue={filter} className="h-9 rounded-md border border-input bg-background px-3 text-sm" aria-label="Delivery status">
                {FILTERS.map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}
              </select>
              <Button type="submit">Filter</Button>
              {(search || filter !== "all") ? <Button variant="outline" render={<Link href="/admin/whatsapp" />}>Clear</Button> : null}
            </form>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? <p className="px-6 py-10 text-sm text-muted-foreground">No notifications match the current filter.</p> : (
            <div className="overflow-x-auto"><Table>
              <TableHeader><TableRow><TableHead>Template</TableHead><TableHead>Recipient</TableHead><TableHead>Status</TableHead><TableHead>Attempts</TableHead><TableHead>Latest event</TableHead><TableHead>Error</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
              <TableBody>{logs.map((log) => {
                const eventAt = log.readAt || log.deliveredAt || log.sentAt || log.createdAt;
                return <TableRow key={log.id}>
                  <TableCell className="font-medium capitalize">{log.templateName.replaceAll("_", " ")}</TableCell>
                  <TableCell>{maskWhatsAppPhone(log.phone)}</TableCell>
                  <TableCell><StatusBadge status={log.status} /></TableCell>
                  <TableCell>{log.attemptCount}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">{new Date(eventAt).toLocaleString()}</TableCell>
                  <TableCell className="max-w-64"><p className="truncate text-sm text-destructive" title={log.errorMessage}>{log.errorCode ? `${log.errorCode}: ` : ""}{log.errorMessage || "—"}</p></TableCell>
                  <TableCell className="text-right">{RETRYABLE.has(log.status) ? <RetryWhatsAppButton logId={log.id} /> : "—"}</TableCell>
                </TableRow>;
              })}</TableBody>
            </Table></div>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
