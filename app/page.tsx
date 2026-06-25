import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  ShieldCheck,
  Star,
  Truck,
  Undo2,
  Zap,
} from "lucide-react";
import { FloatingToys } from "@/app/_components/floating-toys";
import { MotionFade } from "@/app/_components/motion-fade";
import { CategoryCard } from "@/app/_components/category-card";
import { NewNotable } from "@/app/_components/new-notable";
import { StoreShell } from "@/components/ecommerce/store-shell";

export const metadata: Metadata = {
  title: "ToyVerse — Toys That Spark Imagination",
  description:
    "Shop ToyVerse for premium toys, playful design, bright visuals, and conversion-focused shopping built for modern parents.",
};

const categoryCards = [
  {
    name: "Educational Toys",
    description: "Skill-building picks for curious minds.",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    iconName: "Brain" as const,
    accent: "#f97316",
  },
  {
    name: "Building Sets",
    description: "Colorful builds with room for big ideas.",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80",
    iconName: "Blocks" as const,
    accent: "#8b5cf6",
  },
  {
    name: "RC Toys",
    description: "Fast-moving fun for indoor and outdoor play.",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80",
    iconName: "Car" as const,
    accent: "#06b6d4",
  },
  {
    name: "Creative Play",
    description: "Art, pretend play, and open-ended discovery.",
    image: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    iconName: "Palette" as const,
    accent: "#f97316",
  },
  {
    name: "Outdoor Fun",
    description: "Bright, active toys built for movement.",
    image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
    iconName: "Sparkles" as const,
    accent: "#8b5cf6",
  },
];

const bestSellers = [
  {
    name: "Rocket Builder Lab",
    price: "$49",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80",
    badge: "STEM Favorite",
    accent: "#f97316",
  },
  {
    name: "Mini Drift Racer",
    price: "$59",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    badge: "Fast Seller",
    accent: "#8b5cf6",
  },
  {
    name: "Dream Canvas Kit",
    price: "$34",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",
    badge: "Creative Pick",
    accent: "#06b6d4",
  },
  {
    name: "Adventure Bounce Set",
    price: "$44",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80",
    badge: "Outdoor Hit",
    accent: "#f97316",
  },
];

const trustCards = [
  { title: "Safe Materials", desc: "Tested to the highest child-safety standards — zero shortcuts.", icon: ShieldCheck, accent: "#06b6d4" },
  { title: "Fast Shipping",  desc: "Every order dispatched within 48 hours, tracked end-to-end.",  icon: Truck,       accent: "#f97316" },
  { title: "Quality Tested", desc: "Each product passes strict durability and finish checks.",      icon: Check,       accent: "#8b5cf6" },
  { title: "Easy Returns",   desc: "30-day hassle-free returns. No questions, no friction.",        icon: Undo2,       accent: "#f97316" },
];

const reviews = [
  {
    quote: "The quality feels premium the second the box arrives. My son opened one set and forgot screen time existed.",
    name: "Maha R.", role: "Karachi parent", rating: 5,
  },
  {
    quote: "ToyVerse feels clean and easy to trust. I found a birthday gift in minutes and checkout was painless on mobile.",
    name: "Areeba S.", role: "Lahore parent", rating: 5,
  },
  {
    quote: "Bright design, solid prices, fast delivery. It looks fun without feeling chaotic, which is rare in toy stores.",
    name: "Usman K.", role: "Islamabad parent", rating: 5,
  },
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
        <section className="bg-[#07070f] py-20">
          <div
            className="mb-16 h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, #f9731622, #8b5cf622, transparent)" }}
          />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade className="space-y-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f97316]">
                  Featured Categories
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  Shop by what kids{" "}
                  <span className="bg-linear-to-r from-[#f97316] to-[#8b5cf6] bg-clip-text text-transparent">
                    want to do next.
                  </span>
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {categoryCards.map((category, index) => (
                  <CategoryCard
                    key={category.name}
                    name={category.name}
                    description={category.description}
                    image={category.image}
                    iconName={category.iconName}
                    accent={category.accent}
                    index={index}
                  />
                ))}
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            BEST SELLERS
        ══════════════════════════════════════ */}
        <section id="best-sellers" className="bg-[#07070f] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade className="space-y-10">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#8b5cf6]">
                    Best Sellers
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Four favorites{" "}
                    <span className="bg-linear-to-r from-[#8b5cf6] to-[#06b6d4] bg-clip-text text-transparent">
                      parents buy fast.
                    </span>
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden items-center gap-1.5 text-sm font-semibold text-white/50 transition-colors hover:text-white md:inline-flex"
                >
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </div>

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {bestSellers.map((product, index) => (
                  <MotionFade key={product.name} delay={0.05 * index}>
                    <div className="group overflow-hidden rounded-2xl border border-white/[0.07] bg-white/3 transition-all duration-300 hover:border-white/12 hover:-translate-y-1">
                      <div className="relative aspect-4/3 overflow-hidden">
                        <div className="absolute inset-0 z-10 bg-linear-to-t from-[#07070f]/70 via-transparent to-transparent" />
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div
                          className="absolute left-3 top-3 z-20 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                          style={{ color: product.accent, borderColor: `${product.accent}30`, background: `${product.accent}15` }}
                        >
                          {product.badge}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-black text-white">{product.name}</h3>
                          <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#f97316]/20 bg-[#f97316]/10 px-2 py-0.5 text-xs font-bold text-[#f97316]">
                            <Star className="size-3 fill-current" />
                            {product.rating}
                          </div>
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-lg font-black text-white">{product.price}</p>
                          <Link
                            href="/cart"
                            className="rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-xs font-semibold text-white/60 transition-all hover:border-white/20 hover:text-white"
                          >
                            Quick add
                          </Link>
                        </div>
                      </div>
                    </div>
                  </MotionFade>
                ))}
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            TRUST
        ══════════════════════════════════════ */}
        <section className="bg-[#07070f] py-20">
          <div
            className="mb-16 h-px w-full"
            style={{ background: "linear-gradient(90deg, transparent, #8b5cf622, #06b6d422, transparent)" }}
          />
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
                      <div className="group rounded-2xl border border-white/[0.07] bg-white/3 p-6 transition-all duration-300 hover:border-white/12">
                        <div
                          className="mb-5 flex size-12 items-center justify-center rounded-xl"
                          style={{ background: `${item.accent}16`, boxShadow: `0 0 16px ${item.accent}18` }}
                        >
                          <Icon className="size-5" style={{ color: item.accent }} />
                        </div>
                        <h3 className="text-base font-black text-white">{item.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-white/38">{item.desc}</p>
                      </div>
                    </MotionFade>
                  );
                })}
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            REVIEWS
        ══════════════════════════════════════ */}
        <section className="bg-[#07070f] py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade className="space-y-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f97316]">
                  Customer Reviews
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                  What parents say{" "}
                  <span className="bg-linear-to-r from-[#f97316] to-[#8b5cf6] bg-clip-text text-transparent">
                    after the box arrives.
                  </span>
                </h2>
              </div>
              <div className="grid gap-5 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <MotionFade key={review.name} delay={0.06 * index}>
                    <div className="rounded-2xl border border-white/[0.07] bg-white/3 p-6 backdrop-blur-sm transition-all duration-300 hover:border-white/12">
                      <div className="mb-4 flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="size-3.5 fill-[#f97316] text-[#f97316]" />
                        ))}
                      </div>
                      <p className="text-sm leading-7 text-white/55">"{review.quote}"</p>
                      <div className="mt-5 flex items-center gap-3">
                        <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-[#f97316] to-[#8b5cf6] text-sm font-black text-white">
                          {review.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white">{review.name}</p>
                          <p className="text-xs text-white/30">{review.role}</p>
                        </div>
                      </div>
                    </div>
                  </MotionFade>
                ))}
              </div>
            </MotionFade>
          </div>
        </section>

        {/* ══════════════════════════════════════
            CTA
        ══════════════════════════════════════ */}
        <section className="bg-[#07070f] pb-16 pt-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <MotionFade>
              <div className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-linear-to-br from-[#f97316]/8 via-[#07070f] to-[#8b5cf6]/8 p-8 sm:p-12">
                <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-[#f97316]/10 blur-[80px]" />
                <div className="pointer-events-none absolute -bottom-16 -left-16 size-64 rounded-full bg-[#8b5cf6]/10 blur-[80px]" />
                <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-[#f97316] via-[#8b5cf6] to-[#06b6d4]" />

                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#f97316]">
                      Limited Time Offer
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
                      Make Playtime{" "}
                      <span className="bg-linear-to-r from-[#f97316] to-[#8b5cf6] bg-clip-text text-transparent">
                        More Magical
                      </span>
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-white/40 sm:text-base">
                      Premium quality, fast dispatch, and a cleaner path to checkout.
                      Your kids deserve the best.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href="/shop"
                      className="flex items-center gap-2 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] px-8 py-3.5 text-sm font-bold text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-shadow hover:shadow-[0_0_45px_rgba(249,115,22,0.5)]"
                    >
                      Start Shopping
                      <ArrowRight className="size-4" />
                    </Link>
                    <Link
                      href="/contact"
                      className="flex items-center gap-2 rounded-full border border-white/12 bg-white/5 px-8 py-3.5 text-sm font-medium text-white/70 transition-all hover:border-white/22 hover:text-white"
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
