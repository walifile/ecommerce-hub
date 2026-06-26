import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ThemePicker } from "@/app/admin/_components/theme-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminSettingsPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Settings"
      description="Control the storefront appearance. Pick a theme and it is applied across the entire website instantly."
    >
      <Card className="rounded-lg border-border/70 py-0">
        <CardHeader>
          <CardTitle>Storefront theme</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ThemePicker current={catalog.settings.theme} />
        </CardContent>
      </Card>
    </AdminShell>
  );
}
