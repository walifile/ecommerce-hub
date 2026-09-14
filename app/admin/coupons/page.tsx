import { AdminShell } from "@/app/admin/_components/admin-shell";
import { TableEmpty } from "@/app/admin/_components/table-empty";
import { CouponForm } from "@/app/admin/coupons/_components/coupon-form";
import { CouponRowActions } from "@/app/admin/coupons/_components/coupon-row-actions";
import { Badge } from "@/components/ui/badge";
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

function couponStatus(coupon: Coupon) {
  const now = Date.now();
  if (!coupon.active) return { label: "Paused", variant: "outline" as const };
  if (coupon.startsAt && new Date(coupon.startsAt).getTime() > now) {
    return { label: "Scheduled", variant: "secondary" as const };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt).getTime() <= now) {
    return { label: "Expired", variant: "destructive" as const };
  }
  if (coupon.usageLimit !== undefined && coupon.usedCount >= coupon.usageLimit) {
    return { label: "Exhausted", variant: "destructive" as const };
  }
  return { label: "Active", variant: "default" as const };
}

export default async function AdminCouponsPage() {
  const catalog = await getCatalogData();

  return (
    <AdminShell
      title="Coupons"
      description="Create campaign codes, control discount rules, and manage active promotions."
    >
      <div className="grid gap-6">
        <Card className="rounded-xl border-border/70 py-0">
          <CardContent className="p-6">
            <CouponForm />
          </CardContent>
        </Card>

        <Card className="rounded-xl border-border/70 py-0">
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
                {catalog.coupons.length === 0 ? (
                  <TableEmpty colSpan={7} message="No coupons yet. Create one above." />
                ) : null}
                {catalog.coupons.map((coupon) => {
                  const status = couponStatus(coupon);
                  const hasHistory = catalog.orders.some((order) => order.couponCode === coupon.code);
                  return (
                    <TableRow key={coupon.id}>
                      <TableCell className="pl-6 font-semibold">{coupon.code}</TableCell>
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
                        <Badge variant={status.variant} className="rounded-full">
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="pr-6">
                        <CouponRowActions
                          coupon={{
                            id: coupon.id,
                            code: coupon.code,
                            discountType: coupon.discountType,
                            discountValue: coupon.discountValue,
                            minOrderAmount: coupon.minOrderAmount,
                            maxDiscountAmount: coupon.maxDiscountAmount,
                            usageLimit: coupon.usageLimit,
                            startsAt: coupon.startsAt,
                            expiresAt: coupon.expiresAt,
                            active: coupon.active,
                          }}
                          hasHistory={hasHistory}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
