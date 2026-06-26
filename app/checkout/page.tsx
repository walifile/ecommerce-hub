import { Lock, ShieldCheck, Truck } from "lucide-react";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { listProducts, formatCurrency } from "@/lib/ecommerce-data";

const inputClass =
  "h-11 border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30";

export default async function CheckoutPage() {
  const products = await listProducts();
  const lineItems = products.slice(0, 2);
  const subtotal = lineItems.reduce((sum, item) => sum + item.price, 0);
  const shipping = subtotal >= 50 ? 0 : 10;
  const total = subtotal + shipping;

  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface py-12 sm:py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Checkout"
            title="Almost yours — just a few details."
            description="Cash on Delivery is ready now, with Stripe available as an optional payment method."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            {/* Customer info */}
            <div className="rounded-3xl border border-white/8 bg-white/3 p-6 backdrop-blur-xl sm:p-7">
              <h2 className="text-lg font-black text-white">Shipping details</h2>
              <p className="mt-1 text-sm text-white/45">
                Where should we send your order?
              </p>

              <form className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-white/70">Full name</Label>
                  <Input id="name" placeholder="Jane Doe" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white/70">Phone number</Label>
                  <Input id="phone" placeholder="+1 555 123 4567" className={inputClass} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="email" className="text-white/70">Email address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className={inputClass} />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="address" className="text-white/70">Address</Label>
                  <Input id="address" placeholder="House, street, area" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-white/70">City</Label>
                  <Input id="city" placeholder="City" className={inputClass} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="payment" className="text-white/70">Payment method</Label>
                  <NativeSelect
                    id="payment"
                    className="w-full border-white/10 bg-black/30 text-white"
                  >
                    <NativeSelectOption>Cash on Delivery</NativeSelectOption>
                    <NativeSelectOption>Stripe (Optional)</NativeSelectOption>
                  </NativeSelect>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="notes" className="text-white/70">Order notes (optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Anything we should know?"
                    className="min-h-24 border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30"
                  />
                </div>
                <Button className="h-12 rounded-full bg-linear-to-r from-brand to-brand-strong text-sm font-bold text-white shadow-[0_0_24px_color-mix(in_srgb,var(--brand)_28%,transparent)] hover:shadow-[0_0_34px_color-mix(in_srgb,var(--brand)_40%,transparent)] sm:col-span-2">
                  <Lock className="size-4" />
                  Place order · {formatCurrency(total)}
                </Button>
              </form>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-3xl border border-white/8 bg-white/3 p-6 backdrop-blur-xl">
                <h2 className="text-lg font-black text-white">Order summary</h2>

                <div className="mt-5 space-y-4">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="size-14 shrink-0 overflow-hidden rounded-xl border border-white/8 bg-surface-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-white">{item.name}</p>
                        <p className="text-xs text-white/40">{item.category}</p>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 space-y-3 border-t border-white/8 pt-5 text-sm">
                  <div className="flex items-center justify-between text-white/55">
                    <span>Subtotal</span>
                    <span className="text-white/80">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-white/55">
                    <span>Shipping</span>
                    <span className={shipping === 0 ? "font-semibold text-brand-3" : "text-white/80"}>
                      {shipping === 0 ? "FREE" : formatCurrency(shipping)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-white/8 pt-3 text-base font-black text-white">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Reassurance */}
              <div className="mt-4 grid gap-2 rounded-2xl border border-white/8 bg-white/3 p-4 text-xs text-white/55">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-4 text-brand-3" />
                  Secure, SSL-encrypted checkout
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="size-4 text-brand" />
                  Free shipping over $50 · 48-hour dispatch
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </StoreShell>
  );
}
