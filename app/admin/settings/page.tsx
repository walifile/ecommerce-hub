import { AdminShell } from "@/app/admin/_components/admin-shell";
import { BannerForm } from "@/app/admin/_components/banner-form";
import { ThemePicker } from "@/app/admin/_components/theme-picker";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCatalogData } from "@/lib/ecommerce-data";

export default async function AdminSettingsPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Settings"
      description="Control the storefront appearance and global website announcements from one place."
    >
      <div className="grid gap-6">
        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle>Website banner</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <BannerForm banner={catalog.settings} />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 py-0">
          <CardHeader>
            <CardTitle>Storefront theme</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ThemePicker current={catalog.settings.theme} />
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
