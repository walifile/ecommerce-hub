import { Power, Trash2 } from "lucide-react";
import {
  deleteCouponAction,
  toggleCouponAction,
} from "@/app/admin/actions";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { CouponForm } from "@/app/admin/coupons/_components/coupon-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCatalogData, type Coupon } from "@/lib/ecommerce-data";
import { formatCurrency } from "@/lib/format";

function formatDiscount(coupon: Coupon) {
  if (coupon.discountType === "percentage") {
    const cap = coupon.maxDiscountAmount
      ? ` up to ${formatCurrency(coupon.maxDiscountAmount)}`
      : "";
    return `${coupon.discountValue}%${cap}`;
  }

  return formatCurrency(coupon.discountValue);
}

function formatDate(value?: string) {
  if (!value) return "No limit";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AdminCouponsPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Coupons"
      description="Create campaign codes, control discount rules, and manage active promotions."
    >
      <div className="grid gap-6">
        <Card className="rounded-lg border-border/70 py-0">
          <CardContent className="p-6">
            <CouponForm />
          </CardContent>
        </Card>

        <Card className="rounded-lg border-border/70 py-0">
          <CardHeader>
            <CardTitle>Coupon campaigns</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Minimum</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {catalog.coupons.map((coupon) => (
                  <TableRow key={coupon.id}>
                    <TableCell className="pl-6 font-semibold">
                      {coupon.code}
                    </TableCell>
                    <TableCell>{formatDiscount(coupon)}</TableCell>
                    <TableCell>{formatCurrency(coupon.minOrderAmount)}</TableCell>
                    <TableCell>
                      {coupon.usedCount}
                      {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                    </TableCell>
                    <TableCell className="max-w-64 text-muted-foreground">
                      <span className="block">From {formatDate(coupon.startsAt)}</span>
                      <span className="block">Until {formatDate(coupon.expiresAt)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={coupon.active ? "default" : "outline"}
                        className="rounded-full"
                      >
                        {coupon.active ? "Active" : "Paused"}
                      </Badge>
                    </TableCell>
                    <TableCell className="pr-6">
                      <div className="flex justify-end gap-2">
                        <form action={toggleCouponAction}>
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <input
                            type="hidden"
                            name="active"
                            value={coupon.active ? "false" : "true"}
                          />
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full"
                            aria-label={coupon.active ? "Pause coupon" : "Activate coupon"}
                          >
                            <Power className="size-4" />
                          </Button>
                        </form>
                        <form action={deleteCouponAction}>
                          <input type="hidden" name="couponId" value={coupon.id} />
                          <Button
                            type="submit"
                            variant="outline"
                            size="icon-sm"
                            className="rounded-full text-destructive hover:text-destructive"
                            aria-label="Delete coupon"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
