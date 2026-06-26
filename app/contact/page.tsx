import Link from "next/link";
import { Mail, MessageSquare, Phone, ShieldCheck, Truck, Undo2 } from "lucide-react";
import { ContactForm } from "@/components/ecommerce/contact-form";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getCatalogData } from "@/lib/ecommerce-data";

const servicePromises = [
  { label: "Secure checkout", icon: ShieldCheck },
  { label: "Fast dispatch", icon: Truck },
  { label: "Easy returns", icon: Undo2 },
];

export default async function ContactPage() {
  const catalog = await getCatalogData();

  const supportCards = [
    { label: "Email", value: catalog.settings.supportEmail, icon: Mail },
    { label: "Phone", value: catalog.settings.supportPhone, icon: Phone },
    { label: "Response", value: "Within one business day", icon: MessageSquare },
  ];

  return (
    <StoreShell cartCount={3}>
      <main className="bg-[#07070f]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_28%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.1),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_70%)]" />
          <div className="section-shell relative py-12 sm:py-14 lg:py-16">
            <div className="max-w-3xl space-y-5">
              <Badge className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-white/70">
                Contact
              </Badge>
              <div className="space-y-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                  Support and sales
                </p>
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
                  One clean inbox for support, sales, and order issues.
                </h1>
                <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
                  The contact surface stays inside the same store system, so
                  customers can reach you without leaving the premium experience.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {servicePromises.map(({ label, icon: Icon }) => (
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
        </section>

        <section className="section-shell py-8 sm:py-10">
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
              <CardContent className="space-y-5 p-5 sm:p-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    Send a message
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-white">
                    Tell us what you need
                  </h2>
                </div>

                <ContactForm />
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {supportCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Card
                    key={item.label}
                    className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
                  >
                    <CardContent className="flex items-start gap-4 p-5">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-[#f97316]/10 text-[#f97316]">
                        <Icon className="size-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                          {item.label}
                        </p>
                        <p className="mt-2 break-words text-base font-semibold text-white">
                          {item.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Card className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] py-0 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
                        Quick routes
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-white">
                        Faster support paths
                      </h3>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Link
                      href="/track-order"
                      className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4 transition-colors hover:border-white/16 hover:bg-white/[0.05]"
                    >
                      <p className="text-sm font-semibold text-white">Track an order</p>
                      <p className="mt-1 text-sm leading-6 text-white/45">
                        Check live order status before reaching out.
                      </p>
                    </Link>
                    <Link
                      href="/shop"
                      className="rounded-[22px] border border-white/[0.08] bg-black/20 p-4 transition-colors hover:border-white/16 hover:bg-white/[0.05]"
                    >
                      <p className="text-sm font-semibold text-white">Browse products</p>
                      <p className="mt-1 text-sm leading-6 text-white/45">
                        Find a product before asking for help.
                      </p>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
