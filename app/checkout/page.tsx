import { StoreShell } from "@/components/ecommerce/store-shell";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { listProducts, formatCurrency } from "@/lib/ecommerce-data";

export default async function CheckoutPage() {
  const products = await listProducts();
  const lineItems = products.slice(0, 2);
  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <SectionHeading
          eyebrow="Checkout"
          title="Capture customer information and complete the order."
          description="Phase 1 supports cash on delivery immediately, with Stripe reserved as an optional payment method."
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Customer information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 sm:grid-cols-2">
              <Input placeholder="Full name" />
              <Input placeholder="Phone number" />
              <Input placeholder="Email address" className="sm:col-span-2" />
              <Input placeholder="Address" className="sm:col-span-2" />
              <Input placeholder="City" />
              <select className="flex h-10 rounded-md border border-input bg-background px-3 text-sm">
                <option>Cash on Delivery</option>
                <option>Stripe (Optional)</option>
              </select>
              <Textarea
                placeholder="Order notes"
                className="min-h-28 sm:col-span-2"
              />
              <Button className="sm:col-span-2">Place order</Button>
            </CardContent>
          </Card>
          <Card className="h-fit rounded-lg border-border/70 py-0">
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {lineItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                  <div>
                    <p className="font-medium text-foreground">{item.name}</p>
                    <p className="text-muted-foreground">{item.category}</p>
                  </div>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
              <div className="space-y-3 border-t border-border/70 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Products</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(shipping)}</span>
                </div>
                <div className="flex items-center justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </StoreShell>
  );
}
