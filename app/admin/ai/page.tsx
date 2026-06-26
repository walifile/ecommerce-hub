import { AdminShell } from "@/app/admin/_components/admin-shell";
import { AiGenerator } from "@/app/admin/ai/_components/ai-generator";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminAiPage() {
  const catalog = await getCatalogData();
  const latestGeneration = catalog.aiGenerations[0];

  return (
    <AdminShell
      title="AI Product Generator"
      description="Generate product title, descriptions, specifications, SEO metadata, and buyer FAQs with the Claude API. Output is logged below."
    >
      <AiGenerator initial={latestGeneration} />

      <Card className="mt-6 rounded-xl border-border/70 py-0">
        <CardHeader>
          <CardTitle>WhatsApp logs</CardTitle>
        </CardHeader>
        <CardContent>
          {catalog.whatsappLogs.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              No notifications yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.whatsappLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium capitalize">
                      {log.templateName.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>{log.phone || "—"}</TableCell>
                    <TableCell>
                      <StatusBadge status={log.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">{log.sentAt}</TableCell>
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
