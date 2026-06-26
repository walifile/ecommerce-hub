import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Building2, Mail, MapPin, Phone } from "lucide-react";
import { PrintOrderButton } from "@/app/admin/orders/_components/print-order-button";
import { buttonVariants } from "@/components/ui/button";
import {
  formatCurrency,
  formatDate,
  getOrderById,
  getOrderProfit,
} from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

export default async function AdminOrderInvoicePage(
  props: { params: Promise<{ id: string }> }
) {
  const { id } = await props.params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main className="min-h-screen bg-muted/30 px-4 py-6 text-foreground print:bg-white print:px-0 print:py-0">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 print:hidden">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/admin/orders/${order.id}`}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-md"
            )}
          >
            <ArrowLeft className="size-4" />
            Back to order
          </Link>
          <div className="flex items-center gap-2">
            <PrintOrderButton />
            <Link
              href="/admin/orders"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "rounded-md"
              )}
            >
              All orders
            </Link>
          </div>
        </div>
      </div>

      <section className="mx-auto mt-4 w-full max-w-5xl overflow-hidden rounded-[28px] border border-border/70 bg-white text-black shadow-[0_24px_80px_rgba(0,0,0,0.12)] print:mt-0 print:max-w-none print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-start justify-between gap-6 border-b border-black/10 px-8 py-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
              Invoice
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-black">ToyVerse</h1>
              <p className="mt-1 text-sm text-black/55">
                Premium toy commerce system
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/45">
              Invoice number
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-black">
              {order.orderNumber}
            </p>
            <p className="mt-2 text-sm text-black/55">Issued {formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid gap-6 px-8 py-6 md:grid-cols-[1fr_0.9fr]">
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Bill to
                </p>
                <div className="mt-3 space-y-2 text-sm text-black/75">
                  <p className="font-semibold text-black">{order.customerName}</p>
                  {order.customerEmail ? (
                    <p className="flex items-center gap-2">
                      <Mail className="size-4 text-black/45" />
                      {order.customerEmail}
                    </p>
                  ) : null}
                  {order.customerPhone ? (
                    <p className="flex items-center gap-2">
                      <Phone className="size-4 text-black/45" />
                      {order.customerPhone}
                    </p>
                  ) : null}
                  {(order.customerAddress || order.customerCity) && (
                    <p className="flex items-start gap-2">
                      <MapPin className="mt-0.5 size-4 text-black/45" />
                      <span>{[order.customerAddress, order.customerCity].filter(Boolean).join(", ")}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                  Order info
                </p>
                <div className="mt-3 space-y-2 text-sm text-black/75">
                  <p><span className="font-semibold text-black">Status:</span> {order.status}</p>
                  <p><span className="font-semibold text-black">Payment:</span> {order.paymentMethod}</p>
                  <p><span className="font-semibold text-black">Items:</span> {itemsCount}</p>
                  <p><span className="font-semibold text-black">Profit:</span> {formatCurrency(getOrderProfit(order))}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Shipment summary
              </p>
              <p className="mt-3 text-sm leading-7 text-black/75">
                Shipping is handled for the order using the final checkout totals.
                Coupon and shipping adjustments are already baked into the invoice total.
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Company
              </p>
              <div className="mt-3 space-y-2 text-sm text-black/75">
                <p className="font-semibold text-black">ToyVerse</p>
                <p className="flex items-center gap-2">
                  <Building2 className="size-4 text-black/45" />
                  Ecommerce OS
                </p>
                <p>support@toyverse.shop</p>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-black/45">
                Totals
              </p>
              <div className="mt-3 space-y-2 text-sm text-black/75">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-black">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-black">{formatCurrency(order.shippingCost)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Discount</span>
                  <span className="font-medium text-emerald-700">
                    -{formatCurrency(order.discount)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-black/10 pt-3 text-base font-black text-black">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8">
          <div className="overflow-hidden rounded-2xl border border-black/10">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-black/[0.03]">
                <tr className="text-xs uppercase tracking-[0.14em] text-black/45">
                  <th className="px-4 py-3 font-semibold">Product</th>
                  <th className="px-4 py-3 font-semibold">Qty</th>
                  <th className="px-4 py-3 font-semibold">Unit</th>
                  <th className="px-4 py-3 font-semibold">Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={`${order.id}-${item.productName}`} className="border-t border-black/10">
                    <td className="px-4 py-3 font-medium text-black">{item.productName}</td>
                    <td className="px-4 py-3 text-black/70">{item.quantity}</td>
                    <td className="px-4 py-3 text-black/70">{formatCurrency(item.unitPrice)}</td>
                    <td className="px-4 py-3 font-medium text-black">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}
