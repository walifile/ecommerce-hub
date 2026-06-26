import Link from "next/link";
import { ShieldCheck, Lock, DatabaseZap, Mail } from "lucide-react";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const sections = [
  {
    title: "Information we collect",
    description:
      "We collect the information needed to process orders, deliver support, and improve the store experience.",
  },
  {
    title: "How we use it",
    description:
      "Your details are used to fulfill orders, communicate updates, and keep the checkout flow running smoothly.",
  },
  {
    title: "How we protect it",
    description:
      "We use secure systems and limit access to operational data so only the right people can use it.",
  },
  {
    title: "Cookies and analytics",
    description:
      "We may use basic cookies and analytics tools to understand usage and improve the store experience.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <StoreShell cartCount={3}>
      <main className="bg-[#07070f]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                Privacy policy
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                  Data handling
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  Privacy that reads like a real product policy.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  This page explains how ToyVerse handles customer data, checkout
                  details, and support messages in a simple operational format.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell py-8 sm:py-10">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              { title: "Security first", icon: ShieldCheck },
              { title: "Access control", icon: Lock },
              { title: "Operational data", icon: DatabaseZap },
              { title: "Contact us", icon: Mail },
            ].map((item) => {
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
                    <p className="text-sm leading-7 text-white/50">
                      Focused on customer trust, secure handling, and practical store operations.
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="section-shell pb-14">
          <div className="grid gap-5 lg:grid-cols-2">
            {sections.map((section) => (
              <Card
                key={section.title}
                className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
              >
                <CardContent className="space-y-3 p-5 sm:p-6">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Policy section
                  </p>
                  <h2 className="text-xl font-semibold text-white">{section.title}</h2>
                  <p className="text-sm leading-7 text-white/50">{section.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
            <CardContent className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Questions about this policy?
                </h2>
                <p className="text-sm leading-7 text-white/50">
                  Reach out if you need a clearer explanation of any part of the
                  store’s data handling.
                </p>
              </div>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-5 text-sm font-semibold text-white shadow-[0_0_22px_rgba(249,115,22,0.24)]"
              >
                Contact us
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    </StoreShell>
  );
}
