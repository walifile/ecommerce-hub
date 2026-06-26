import Link from "next/link";
import { BadgeCheck, ClipboardList, CreditCard, ShieldCheck } from "lucide-react";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const terms = [
  {
    title: "Orders",
    description:
      "Orders are confirmed once the checkout flow is completed and the store accepts the submission.",
  },
  {
    title: "Pricing",
    description:
      "Prices, promotions, and availability can change. Final totals are shown during checkout.",
  },
  {
    title: "Payments",
    description:
      "Cash on delivery and card-based methods are supported where available, subject to the checkout flow.",
  },
  {
    title: "Returns",
    description:
      "Return eligibility depends on product condition, order age, and the policies shown on the store.",
  },
];

export default function TermsAndConditionsPage() {
  return (
    <StoreShell cartCount={3}>
      <main className="bg-surface">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,color-mix(in_srgb,var(--brand)_16%,transparent),transparent_28%),radial-gradient(circle_at_top_right,color-mix(in_srgb,var(--brand-2)_10%,transparent),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                Terms and conditions
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand/80">
                  Store rules
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Clear terms for a straightforward shopping experience.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  These terms describe how orders, pricing, payments, and returns
                  work on ToyVerse.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8 sm:py-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Order flow", icon: ClipboardList },
              { title: "Pricing", icon: CreditCard },
              { title: "Return rules", icon: BadgeCheck },
              { title: "Store safety", icon: ShieldCheck },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-brand/10 text-brand">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                    <p className="text-sm leading-7 text-white/50">
                      Straightforward rules that support a clean checkout and support flow.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="section-shell pb-14">
          <div className="grid gap-5 lg:grid-cols-2">
            {terms.map((term) => (
              <Card
                key={term.title}
                className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <CardContent className="space-y-3 p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Policy section
                  </p>
                  <h2 className="text-xl font-semibold text-white">{term.title}</h2>
                  <p className="text-sm leading-7 text-white/50">{term.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Need help with an order or return?
                </h2>
                <p className="text-sm leading-7 text-white/50">
                  Contact support if any part of the terms is unclear.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-brand to-brand-strong px-5 text-sm font-semibold text-white shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_24%,transparent)]"
              >
                Contact support
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </StoreShell>
  );
}
