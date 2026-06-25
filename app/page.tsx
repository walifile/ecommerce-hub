import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Lock,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
  Users,
  Zap,
} from "lucide-react";
import { FloatingToys } from "@/app/_components/floating-toys";
import { MotionFade } from "@/app/_components/motion-fade";
import { NewNotable } from "@/app/_components/new-notable";
import { BrowseCategory } from "@/app/_components/browse-category";
import { ReviewsCarousel } from "@/app/_components/reviews-carousel";
import { StoreShell } from "@/components/ecommerce/store-shell";

export const metadata: Metadata = {
  title: "ToyVerse — Toys That Spark Imagination",
  description:
    "Shop ToyVerse for premium toys, playful design, bright visuals, and conversion-focused shopping built for modern parents.",
};

const trustCards = [
  {
    title: "Lab-Safe Materials",
    desc: "Non-toxic, BPA-free materials on every single product — independently lab-tested.",
    proof: "ASTM & CE Certified",
    icon: ShieldCheck,
    accent: "#06b6d4",
  },
  {
    title: "48-Hour Dispatch",
    desc: "Orders ship within 48 hours and are tracked door-to-door, every time.",
    proof: "Free over $50",
    icon: Truck,
    accent: "#f97316",
  },
  {
    title: "12-Point Quality Check",
    desc: "Drop, finish and safety tested before anything leaves our warehouse.",
    proof: "Under 0.4% defect rate",
    icon: BadgeCheck,
    accent: "#8b5cf6",
  },
  {
    title: "30-Day Easy Returns",
    desc: "Changed your mind? Send it back — no questions, no restocking fees.",
    proof: "Hassle-free window",
    icon: Undo2,
    accent: "#f97316",
  },
];

const trustBadges = [
  { label: "15,000+ families", icon: Users },
  { label: "4.9★ avg rating", icon: Star },
  { label: "Secure checkout", icon: Lock },
  { label: "Certified safe", icon: Award },
];

export default function HomePage() {
  return (
    <StoreShell cartCount={2}>
      <main className="overflow-hidden bg-[#07070f]">

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="relative overflow-hidden bg-[#07070f]">

          {/* Orange circle — large enough to bleed off top + right, curved left edge visible */}
          <div
            className="pointer-events-none absolute right-0 top-0"
            style={{
              width: "60vw",
              height: "60vw",
              borderRadius: "50%",
              transform: "translate(25%, -36%)",
              background: "radial-gradient(circle at 45% 50%, #fb923c 0%, #ea580c 52%, #c2410c 100%)",
              boxShadow: "inset -50px -50px 100px rgba(0,0,0,0.28)",
              zIndex: 0,
            }}
          />

          {/* Subtle left glow */}
          <div className="pointer-events-none absolute -left-40 top-1/2 h-125 w-125 -translate-y-1/2 rounded-full bg-[#8b5cf6]/5 blur-[120px]" />

          {/* Grid */}
          <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-16 sm:px-6 sm:pb-12 sm:pt-20 lg:grid-cols-2 lg:gap-8 lg:px-8">

            {/* Left */}
            <MotionFade className="space-y-7" delay={0.05}>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f97316]/25 bg-[#f97316]/8 px-4 py-1.5">
                <Zap className="size-3.5 text-[#f97316]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#f97316]">
                  New Season Drops
                </span>
              </div>

              <div className="space-y-3">
                <h1 className="text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                  Toys That
                  <br />
                  <span className="bg-linear-to-r from-[#f97316] via-[#fb923c] to-[#8b5cf6] bg-clip-text text-transparent">
                    Spark Joy.
                  </span>
                </h1>
                <p className="max-w-lg text-base leading-8 text-white/45 sm:text-lg">
                  Premium toys for curious kids — picked for learning, movement,
                  and joyful everyday play. Fast shipping, clean checkout, and
                  parent-friendly quality.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_35px_rgba(249,115,22,0.35)] transition-shadow hover:shadow-[0_0_50px_rgba(249,115,22,0.5)]"
                >
                  Shop Now
                  <ArrowRight className="size-4" />
                </Link>
                <Link
                  href="#best-sellers"
                  className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-7 py-3.5 text-sm font-medium text-white/70 backdrop-blur-sm transition-all hover:border-white/22 hover:text-white"
                >
                  Best Sellers
                </Link>
              </div>

              <div className="grid max-w-md grid-cols-3 gap-3">
                {[
                  ["15k+", "Happy families"],
                  ["48h",  "Dispatch window"],
                  ["4.9★", "Avg rating"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-white/[0.07] bg-white/4 p-4 backdrop-blur-sm"
                  >
                    <p className="text-xl font-black text-white">{value}</p>
                    <p className="mt-1 text-xs text-white/35">{label}</p>
                  </div>
                ))}
              </div>
            </MotionFade>

            {/* Right — image over section-level circle */}
            <MotionFade delay={0.12} className="relative">
              <Image
                src="/images/banner-img.png"
                alt="Premium Toys Collection"
                width={900}
                height={700}
                priority
                className="relative z-10 h-80 w-full object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.7)] sm:h-100"
              />
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            NEW & NOTABLE
        ══════════════════════════════════════ */}
        <NewNotable />

        {/* ══════════════════════════════════════
            CATEGORIES
        ══════════════════════════════════════ */}
        <BrowseCategory />

        {/* ══════════════════════════════════════
            TRUST
        ══════════════════════════════════════ */}
        <section className="bg-[#07070f] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade className="space-y-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#06b6d4]">
                  Why Parents Love Us
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Built for kids.{" "}
                  <span className="bg-linear-to-r from-[#06b6d4] to-[#8b5cf6] bg-clip-text text-transparent">
                    Designed for parents.
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {trustCards.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <MotionFade key={item.title} delay={0.06 * index}>
                      <div className="group flex h-full flex-col rounded-2xl border border-white/[0.07] bg-white/3 p-6 transition-all duration-300 hover:border-white/12">
                        <div
                          className="mb-5 flex size-12 items-center justify-center rounded-xl"
                          style={{ background: `${item.accent}16`, boxShadow: `0 0 16px ${item.accent}18` }}
                        >
                          <Icon className="size-5" style={{ color: item.accent }} />
                        </div>
                        <h3 className="text-base font-black text-white">{item.title}</h3>
                        <p className="mt-2 flex-1 text-sm leading-6 text-white/38">{item.desc}</p>
                        <div
                          className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold"
                          style={{ background: `${item.accent}14`, color: item.accent }}
                        >
                          <BadgeCheck className="size-3.5" />
                          {item.proof}
                        </div>
                      </div>
                    </MotionFade>
                  );
                })}
              </div>

              {/* Trust badge strip */}
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 rounded-2xl border border-white/[0.07] bg-white/3 px-6 py-5">
                {trustBadges.map((badge, index) => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.label} className="flex items-center">
                      {index > 0 && (
                        <span className="mr-8 hidden h-5 w-px bg-white/10 sm:block" />
                      )}
                      <div className="flex items-center gap-2 text-sm font-semibold text-white/55">
                        <Icon className="size-4 text-white/70" />
                        {badge.label}
                      </div>
                    </div>
                  );
                })}
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════ */}
        <ReviewsCarousel />

        {/* ══════════════════════════════════════
            CTA
        ══════════════════════════════════════ */}
        <section className="bg-[#07070f] py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade>
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-linear-to-br from-[#f97316]/8 via-[#07070f] to-[#8b5cf6]/8 p-8 sm:p-12">
                <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#f97316]/10 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[#8b5cf6]/10 blur-[80px]" />
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#f97316] via-[#8b5cf6] to-[#06b6d4]" />

                <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f97316]/25 bg-[#f97316]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
                      <Zap className="size-3" />
                      Free shipping over $50
                    </span>
                    <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      Make Playtime{" "}
                      <span className="bg-linear-to-r from-[#f97316] to-[#8b5cf6] bg-clip-text text-transparent">
                        More Magical
                      </span>
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/45 sm:text-base">
                      Lab-safe toys, dispatched in 48 hours, with a checkout that
                      takes seconds. Start your cart today and ship it free over $50.
                    </p>

                    {/* Reassurance strip */}
                    <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                      {[
                        { icon: Truck, label: "Free shipping over $50" },
                        { icon: Undo2, label: "30-day easy returns" },
                        { icon: ShieldCheck, label: "Lab-safe certified" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex items-center gap-2 text-xs font-semibold text-white/55">
                          <Icon className="size-4 text-[#f97316]" />
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-stretch gap-3 sm:flex-row lg:flex-col xl:flex-row">
                    <Link
                      href="/shop"
                      className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow hover:shadow-[0_0_45px_rgba(249,115,22,0.5)]"
                    >
                      Start Shopping
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/5 px-8 py-3.5 text-sm font-medium text-white/70 transition-all hover:border-white/22 hover:text-white"
                    >
                      Contact Us
                    </Link>
                  </div>
                </div>
              </div>
            </MotionFade>
          </div>
        </section>

      </main>
    </StoreShell>
  );
}
