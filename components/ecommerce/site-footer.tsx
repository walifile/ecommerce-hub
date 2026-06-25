import Link from "next/link";
import {
  ArrowUpRight,
  Globe,
  Mail,
  MessageCircle,
  Phone,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/shop" },
      { label: "Best Sellers", href: "/shop" },
      { label: "New Arrivals", href: "/shop" },
      { label: "Gift Ideas", href: "/shop" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Order", href: "/track-order" },
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/contact" },
      { label: "Returns", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About ToyVerse", href: "/contact" },
      { label: "Careers", href: "/contact" },
      { label: "Privacy Policy", href: "/contact" },
      { label: "Terms", href: "/contact" },
    ],
  },
];

const trustSignals = [
  { icon: ShieldCheck, label: "Lab-safe products" },
  { icon: Truck, label: "48-hour dispatch" },
  { icon: Star, label: "4.9/5 customer rating" },
  { icon: Undo2, label: "30-day returns" },
];

const contactLinks = [
  { label: "Community", href: "/contact", icon: MessageCircle },
  { label: "Website", href: "/", icon: Globe },
  { label: "Email", href: "mailto:hello@toyverse.shop", icon: Mail },
  { label: "Phone", href: "tel:+15551234567", icon: Phone },
];

export function SiteFooter() {
  return (
    <footer id="footer" className="relative border-t border-white/[0.08] bg-[#06060d]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f97316]/80 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f97316]/80">
                ToyVerse
              </p>
              <h2 className="max-w-lg text-3xl font-black tracking-tight text-white sm:text-4xl">
                Toys that feel premium, move fast, and make gifting easier.
              </h2>
              <p className="max-w-xl text-sm leading-7 text-white/50 sm:text-base">
                Built for modern parents and curious kids, with cleaner product
                discovery, faster checkout, and a shopping experience that feels
                calm instead of cluttered.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {contactLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="group flex h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm text-white/55 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <Icon className="size-4 transition-transform group-hover:-translate-y-0.5" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {trustSignals.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] px-4 py-3"
                >
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#f97316]/10 text-[#f97316]">
                    <Icon className="size-4" />
                  </div>
                  <span className="text-sm font-medium text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl sm:p-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
              Stay in the loop
            </p>
            <h3 className="mt-3 text-2xl font-black tracking-tight text-white">
              Get restocks, drops, and gift picks first.
            </h3>
            <p className="mt-3 text-sm leading-7 text-white/50">
              One short email for new arrivals, limited bundles, and better
              buying decisions.
            </p>

            <form className="mt-6 space-y-3">
              <Input
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                className="h-12 rounded-full border-white/10 bg-black/30 px-5 text-white placeholder:text-white/30 focus-visible:ring-[#f97316]/40"
              />
              <Button
                type="submit"
                className="h-12 w-full rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] text-sm font-bold text-white shadow-[0_0_24px_rgba(249,115,22,0.24)] transition-transform hover:translate-y-[-1px] hover:shadow-[0_0_34px_rgba(249,115,22,0.34)]"
              >
                Join the list
                <ArrowUpRight className="size-4" />
              </Button>
            </form>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-2xl font-black text-white">15k+</p>
                <p className="mt-1 text-sm text-white/45">families shopping monthly</p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <p className="text-2xl font-black text-white">48h</p>
                <p className="mt-1 text-sm text-white/45">average dispatch window</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-10 border-t border-white/[0.08] pt-10 md:grid-cols-3">
          {footerColumns.map((column) => (
            <div key={column.title} className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/55">
                {column.title}
              </p>
              <div className="grid gap-3">
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-white/50 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-sm text-white/35 md:flex-row md:items-center md:justify-between">
          <p>© 2026 ToyVerse. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/contact" className="transition-colors hover:text-white">
              Support
            </Link>
            <Link href="/track-order" className="transition-colors hover:text-white">
              Track Order
            </Link>
            <Link href="/cart" className="transition-colors hover:text-white">
              Cart
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
