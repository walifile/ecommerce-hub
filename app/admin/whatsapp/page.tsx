import { AdminShell } from "@/app/admin/_components/admin-shell";
import { OperationsSettingsForm } from "@/app/admin/_components/operations-settings-form";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminWhatsAppPage() {
  const catalog = await getCatalogData();
  const logs = catalog.whatsappLogs;
  const sent = logs.filter((log) => log.status === "sent").length;
  const failed = logs.filter((log) => log.status === "failed").length;
  const simulated = logs.filter((log) => log.status === "simulated").length;

  return (
    <AdminShell
      title="WhatsApp Module"
      description="Manage automated order messages and audit delivery attempts from one place."
    >
      <div className="grid gap-4 sm:grid-cols-4">
        {[["Total", logs.length], ["Sent", sent], ["Failed", failed], ["Simulated", simulated]].map(([label, value]) => (
          <Card key={String(label)} className="rounded-xl border-border/70 py-0">
            <CardContent className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>Automated templates</CardTitle>
          <p className="text-sm text-muted-foreground">Created, confirmed, shipped, and delivered messages are editable. Processing, cancellation, and return messages use safe defaults.</p>
        </CardHeader>
        <CardContent className="p-6"><OperationsSettingsForm settings={catalog.settings} /></CardContent>
      </Card>

      <Card className="mt-6 overflow-hidden rounded-xl border-border/70 py-0">
        <CardHeader><CardTitle>Notification history</CardTitle></CardHeader>
        <CardContent className="p-0">
          {logs.length === 0 ? (
            <p className="px-6 py-10 text-sm text-muted-foreground">No notifications yet. Messages are triggered by order placement and status changes.</p>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Template</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Sent at</TableHead></TableRow></TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">{log.templateName.replaceAll("_", " ")}</TableCell>
                    <TableCell>{log.phone || "—"}</TableCell>
                    <TableCell><StatusBadge status={log.status} /></TableCell>
                    <TableCell className="text-muted-foreground">{log.sentAt === "Pending" ? "—" : new Date(log.sentAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminShell>
  );
}
