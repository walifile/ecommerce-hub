import Link from "next/link";
import { ArrowRight, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { CartClient } from "@/app/cart/_components/cart-client";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { listProducts } from "@/lib/ecommerce-data";

const trustItems = [
  { label: "Secure checkout", icon: ShieldCheck },
  { label: "Fast delivery", icon: Truck },
  { label: "Easy returns", icon: Undo2 },
];

export default async function CartPage() {
  const products = await listProducts();

  return (
    <StoreShell cartCount={3}>
      <main className="bg-[#07070f]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                Cart
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                  Review before checkout
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Your cart, cleaned up and ready to close.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  Quantities, shipping, and order total are surfaced in one place so
                  the checkout decision stays fast and simple.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
                >
                  Continue shopping
                  <ArrowRight className="size-4" />
                </Link>
                <div className="flex flex-wrap gap-2">
                  {trustItems.map(({ label, icon: Icon }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/60"
                    >
                      <Icon className="size-4 text-[#f97316]" />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8 sm:py-10">
          <CartClient initialItems={products.slice(0, 3)} />
        </section>
      </main>
    </StoreShell>
  );
}
