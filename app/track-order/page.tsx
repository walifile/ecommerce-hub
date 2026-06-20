import { Search } from "lucide-react";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StatusBadge } from "@/components/ecommerce/status-badge";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate, getOrderByNumber, getOrderProfit } from "@/lib/ecommerce-data";

const trackingStates = ["pending", "confirmed", "processing", "shipped", "delivered"];

export default async function TrackOrderPage(props: PageProps<"/track-order">) {
  const search = await props.searchParams;
  const orderNumber =
    typeof search.orderNumber === "string" ? search.orderNumber : "";
  const order = await getOrderByNumber(orderNumber);

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <SectionHeading
          eyebrow="Order Tracking"
          title="Search a live order number and surface the current status."
          description="The same order record feeds customer tracking, admin order management, WhatsApp messaging, and profit calculations."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <Card className="rounded-lg border-border/70 py-0">
            <CardContent className="space-y-4 p-6">
              <form action="/track-order" className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Order number
                  </label>
                  <div className="flex gap-2">
                    <Input
                      name="orderNumber"
                      defaultValue={orderNumber}
                      placeholder="ECO-1001"
                    />
                    <Button className="rounded-md">
                      <Search className="size-4" />
                      Track
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <Card className="rounded-lg border-border/70 py-0">
            <CardContent className="p-6">
              {order ? (
                <div className="space-y-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Order {order.orderNumber}
                      </p>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {order.customerName}
                      </h2>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-md bg-muted p-4 text-sm">
                      <p className="text-muted-foreground">Created</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-4 text-sm">
                      <p className="text-muted-foreground">Order total</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                    <div className="rounded-md bg-muted p-4 text-sm">
                      <p className="text-muted-foreground">Profit</p>
                      <p className="mt-1 font-semibold text-foreground">
                        {formatCurrency(getOrderProfit(order))}
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3">
                    {trackingStates.map((state, index) => {
                      const active =
                        trackingStates.indexOf(order.status) >= index ||
                        order.status === state;

                      return (
                        <div
                          key={state}
                          className={`flex items-center gap-3 rounded-md border px-4 py-3 ${active ? "border-foreground bg-foreground text-background" : "border-border/70 bg-background text-muted-foreground"}`}
                        >
                          <div className="flex size-8 items-center justify-center rounded-full bg-background/20 text-sm font-semibold">
                            {index + 1}
                          </div>
                          <span className="font-medium capitalize">{state}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  Enter an order number like <span className="font-medium text-foreground">ECO-1001</span> to view its status.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </StoreShell>
  );
}
