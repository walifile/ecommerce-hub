import { AdminShell } from "@/app/admin/_components/admin-shell";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
      description="Phase 1 AI output includes product title, long description, short description, SEO metadata, FAQ, and editable WhatsApp templates/logs."
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Generate with AI</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 p-6">
            <Input placeholder="Product name" defaultValue="Barrier Repair Night Serum" />
            <Button>Generate with AI</Button>
            <Input placeholder="Product title" defaultValue={latestGeneration?.productTitle ?? ""} />
            <Textarea
              placeholder="Short description"
              className="min-h-24"
              defaultValue={latestGeneration?.shortDescription ?? ""}
            />
            <Textarea
              placeholder="Long description"
              className="min-h-40"
              defaultValue={latestGeneration?.longDescription ?? ""}
            />
            <Input placeholder="Meta title" defaultValue={latestGeneration?.metaTitle ?? ""} />
            <Textarea
              placeholder="Meta description"
              className="min-h-24"
              defaultValue={latestGeneration?.metaDescription ?? ""}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Generated FAQ</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 p-6">
              {latestGeneration?.faq.map((item) => (
                <div key={item} className="rounded-md border border-border/70 px-4 py-3 text-sm">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>WhatsApp logs</CardTitle>
            </CardHeader>
            <CardContent>
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
                      <TableCell className="font-medium">{log.templateName}</TableCell>
                      <TableCell>{log.phone}</TableCell>
                      <TableCell>
                        <StatusBadge status={log.status} />
                      </TableCell>
                      <TableCell>{log.sentAt}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminShell>
  );
}
