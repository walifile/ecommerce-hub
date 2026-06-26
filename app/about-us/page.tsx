import Link from "next/link";
import { Award, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const values = [
  {
    title: "Quality first",
    description: "Products and pages are built to feel premium, clear, and trustworthy.",
    icon: ShieldCheck,
  },
  {
    title: "Fast delivery",
    description: "The experience is designed to make purchase decisions quick and easy.",
    icon: Truck,
  },
  {
    title: "Playful, not childish",
    description: "Bright, visual, and modern without losing polish or clarity.",
    icon: Sparkles,
  },
  {
    title: "Built to convert",
    description: "Every page is structured to reduce friction and guide action.",
    icon: Award,
  },
];

export default function AboutPage() {
  return (
    <StoreShell cartCount={3}>
      <main className="bg-[#07070f]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                About us
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                  ToyVerse story
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  ToyVerse is a cleaner way to shop for toys.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  We build the store experience around clarity, trust, and
                  conversion so parents can move quickly and still feel good about
                  what they’re buying.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
                >
                  Shop now
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8 sm:py-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {values.map((item) => {
              const Icon = item.icon;
              return (
                <Card
                  key={item.title}
                  className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
                      <Icon className="size-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                    <p className="text-sm leading-7 text-white/50">{item.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="section-shell pb-14">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  What we care about
                </p>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Clean product discovery, better trust, faster checkout.
                </h2>
                <p className="text-sm leading-7 text-white/50">
                  The site is structured to reduce noise, surface key product
                  information, and make it easy to move from interest to order.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Fast", "Low-friction shopping"],
                    ["Clear", "No cluttered layouts"],
                    ["Premium", "Playful but polished"],
                  ].map(([title, desc]) => (
                    <div
                      key={title}
                      className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4"
                    >
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-1 text-sm leading-6 text-white/45">{desc}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <CardContent className="space-y-4 p-5 sm:p-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                  Visit the store
                </p>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Built for shopping, not browsing forever.
                </h2>
                <p className="text-sm leading-7 text-white/50">
                  Explore the catalog, use the cart, or reach support from any page
                  without losing the visual system.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
                  >
                    Browse products
                  </Link>
                  <Link
                    href="/track-order"
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] px-5 text-sm font-medium text-white/70 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                  >
                    Track order
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
