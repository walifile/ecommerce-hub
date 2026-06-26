import Link from "next/link";
import { Search, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  formatCurrency,
  formatDate,
  getOrderByNumber,
  getOrderProfit,
} from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

const trackingStates = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "returned",
  "cancelled",
];

const supportItems = [
  { label: "Secure checkout", icon: ShieldCheck },
  { label: "Fast dispatch", icon: Truck },
  { label: "Easy returns", icon: Undo2 },
];

export default async function TrackOrderPage(props: PageProps<"/track-order">) {
  const search = await props.searchParams;
  const orderNumber =
    typeof search.orderNumber === "string" ? search.orderNumber : "";
  const order = await getOrderByNumber(orderNumber);

  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-2)_10%,transparent),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                Order tracking
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand/80">
                  Live order status
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Track an order without leaving the store flow.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  Look up the order number, inspect its current stage, and keep the
                  support experience tied to the same operating system.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {supportItems.map(({ label, icon: Icon }) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
                  >
                    <Icon className="size-4 text-brand" />
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Search order
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Enter the order number
                  </h2>
                </div>

                <form action="/track-order" className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/70">
                      Order number
                    </label>
                    <div className="flex flex-col gap-3 sm:flex-row">
                      <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-white/30" />
                        <Input
                          name="orderNumber"
                          defaultValue={orderNumber}
                          placeholder="ECO-1001"
                          className="h-12 rounded-full border-white/10 bg-black/30 pl-11 text-white placeholder:text-white/25 focus-visible:ring-brand/40"
                        />
                      </div>
                      <Button className="h-12 rounded-full bg-linear-to-r from-brand to-brand-strong px-6 text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]">
                        Track order
                      </Button>
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                    <p className="text-sm leading-7 text-white/55">
                      Example order:{" "}
                      <Link
                        href="/track-order?orderNumber=ECO-1001"
                        className="font-semibold text-white hover:text-brand"
                      >
                        ECO-1001
                      </Link>
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <CardContent className="p-5 sm:p-6">
                {order ? (
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                            Order {order.orderNumber}
                          </Badge>
                          <StatusBadge status={order.status} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black tracking-tight text-white">
                            {order.customerName}
                          </h2>
                          <p className="mt-1 text-sm text-white/45">
                            {order.customerEmail}
                          </p>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-white/[0.08] bg-black/20 px-4 py-3 text-left sm:text-right">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/35">
                          Order total
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-white">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                          Created
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                          Profit
                        </p>
                        <p className="mt-2 text-sm font-semibold text-white">
                          {formatCurrency(getOrderProfit(order))}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-white/35">
                          Payment
                        </p>
                        <p className="mt-2 text-sm font-semibold capitalize text-white">
                          {order.paymentMethod}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">Progress</h3>
                        <p className="text-sm text-white/45">
                          {order.status.replaceAll("_", " ")}
                        </p>
                      </div>
                      {(order.status === "cancelled" || order.status === "returned") && (
                        <div className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4">
                          <p className="text-sm font-semibold text-white">
                            {order.status === "cancelled"
                              ? "This order was cancelled and inventory was restored."
                              : "This order was returned and inventory was restored."}
                          </p>
                          <p className="mt-1 text-sm leading-6 text-white/55">
                            Status updates are kept in sync with stock so the support team sees the right availability.
                          </p>
                          {(order.reversalReason || order.refundAmount || order.reversalNote) && (
                            <div className="mt-3 space-y-1 border-t border-white/[0.08] pt-3 text-sm text-white/60">
                              {order.reversalReason ? (
                                <p>
                                  <span className="font-semibold text-white">Reason:</span>{" "}
                                  {order.reversalReason}
                                </p>
                              ) : null}
                              {typeof order.refundAmount === "number" ? (
                                <p>
                                  <span className="font-semibold text-white">Refund:</span>{" "}
                                  {formatCurrency(order.refundAmount)}
                                </p>
                              ) : null}
                              {order.reversalNote ? (
                                <p>{order.reversalNote}</p>
                              ) : null}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="grid gap-3">
                        {trackingStates.map((state, index) => {
                          let active =
                            trackingStates.indexOf(order.status) >= index ||
                            order.status === state;
                          if (order.status === "cancelled") {
                            active = state === "cancelled";
                          } else if (order.status === "returned") {
                            active = state === "returned" || state === "delivered";
                          }

                          return (
                            <div
                              key={state}
                              className={cn(
                                "flex items-center gap-3 rounded-2xl border px-4 py-3 transition-colors",
                                active
                                  ? "border-brand/30 bg-brand/10 text-white"
                                  : "border-white/[0.08] bg-black/20 text-white/50"
                              )}
                            >
                              <div
                                className={cn(
                                  "flex size-8 items-center justify-center rounded-full text-sm font-semibold",
                                  active ? "bg-brand text-white" : "bg-white/[0.06]"
                                )}
                              >
                                {index + 1}
                              </div>
                              <div>
                                <p className="font-medium capitalize">{state}</p>
                                <p className="text-xs text-white/35">
                                  {active ? "Completed or current stage" : "Pending next stage"}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-[320px] flex-col items-start justify-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Search className="size-7" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black tracking-tight text-white">
                        No order loaded yet
                      </h2>
                      <p className="max-w-xl text-sm leading-7 text-white/50">
                        Enter an order number like{" "}
                        <span className="font-semibold text-white">ECO-1001</span>{" "}
                        to see the live status flow and order details.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
