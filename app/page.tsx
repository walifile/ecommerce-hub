import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Blocks,
  Brain,
  Car,
  Check,
  Palette,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Undo2,
} from "lucide-react";
import { FloatingToys } from "@/app/_components/floating-toys";
import { MotionFade } from "@/app/_components/motion-fade";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Toys That Spark Imagination",
  description:
    "Shop ToyVerse for premium toys, playful design, bright visuals, and conversion-focused shopping built for modern parents.",
};

const categoryCards = [
  {
    name: "Educational Toys",
    description: "Skill-building picks for curious minds.",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=900&q=80",
    icon: Brain,
    tone: "from-[#eef4ff] to-white",
  },
  {
    name: "Building Sets",
    description: "Colorful builds with room for big ideas.",
    image:
      "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=900&q=80",
    icon: Blocks,
    tone: "from-[#f1e9ff] to-white",
  },
  {
    name: "RC Toys",
    description: "Fast-moving fun for indoor and outdoor play.",
    image:
      "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=900&q=80",
    icon: Car,
    tone: "from-[#fff7cf] to-white",
  },
  {
    name: "Creative Play",
    description: "Art, pretend play, and open-ended discovery.",
    image:
      "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
    icon: Palette,
    tone: "from-[#ffe8f5] to-white",
  },
  {
    name: "Outdoor Fun",
    description: "Bright, active toys built for movement.",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=900&q=80",
    icon: Sparkles,
    tone: "from-[#e8fbff] to-white",
  },
];

const bestSellers = [
  {
    name: "Rocket Builder Lab",
    price: "$49",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80",
    badge: "STEM Favorite",
  },
  {
    name: "Mini Drift Racer",
    price: "$59",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    badge: "Fast Seller",
  },
  {
    name: "Dream Canvas Kit",
    price: "$34",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",
    badge: "Creative Pick",
  },
  {
    name: "Adventure Bounce Set",
    price: "$44",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80",
    badge: "Outdoor Hit",
  },
];

const trustCards = [
  { title: "Safe Materials", icon: ShieldCheck, tone: "bg-[#eef4ff] text-[#4b74ff]" },
  { title: "Fast Shipping", icon: Truck, tone: "bg-[#fff7cf] text-[#d89a00]" },
  { title: "Quality Tested", icon: Check, tone: "bg-[#e9fbff] text-[#1596b5]" },
  { title: "Easy Returns", icon: Undo2, tone: "bg-[#f1e9ff] text-[#7c51e6]" },
];

const reviews = [
  {
    quote:
      "The quality feels premium the second the box arrives. My son opened one set and forgot screen time existed.",
    name: "Maha R.",
    role: "Karachi parent",
  },
  {
    quote:
      "ToyVerse feels clean and easy to trust. I found a birthday gift in minutes and checkout was painless on mobile.",
    name: "Areeba S.",
    role: "Lahore parent",
  },
  {
    quote:
      "Bright design, solid prices, fast delivery. It looks fun without feeling chaotic, which is rare in toy stores.",
    name: "Usman K.",
    role: "Islamabad parent",
  },
];

export default function HomePage() {
  return (
    <StoreShell cartCount={2}>
      <main className="overflow-hidden">
        <section className="relative border-b border-border/60 bg-[radial-gradient(circle_at_top_left,#eef4ff,transparent_35%),radial-gradient(circle_at_top_right,#f3ebff,transparent_30%),linear-gradient(to_bottom,#ffffff,#fcfdff)]">
          <div className="section-shell relative py-10 sm:py-12 lg:py-16">
            <FloatingToys />
            <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
              <MotionFade className="space-y-6" delay={0.05}>
                <Badge className="rounded-full bg-[#fff3b3] px-4 py-1.5 text-[#5b4b00] shadow-sm">
                  New season drops
                </Badge>
                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-semibold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                    Toys That Spark Imagination
                  </h1>
                  <p className="max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                    Premium toys for curious kids, picked for learning, movement,
                    and joyful everyday play. Fast shipping, clean checkout, and
                    parent-friendly quality.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href="/shop"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-2xl bg-slate-950 px-6 text-white hover:bg-slate-800"
                    )}
                  >
                    Shop Now
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="#best-sellers"
                    className={cn(
                      buttonVariants({ size: "lg", variant: "outline" }),
                      "rounded-2xl border-slate-200 bg-white/80 px-6 text-slate-900 hover:bg-white"
                    )}
                  >
                    Best Sellers
                  </Link>
                </div>
                <div className="grid max-w-lg grid-cols-3 gap-3">
                  {[
                    ["15k+", "Happy families"],
                    ["48h", "Dispatch window"],
                    ["4.9/5", "Average rating"],
                  ].map(([value, label]) => (
                    <div
                      key={label}
                      className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] backdrop-blur"
                    >
                      <p className="text-xl font-semibold text-slate-950">{value}</p>
                      <p className="mt-1 text-sm text-slate-600">{label}</p>
                    </div>
                  ))}
                </div>
              </MotionFade>

              <MotionFade delay={0.12}>
                <div className="relative">
                  <div className="absolute inset-4 rounded-[32px] bg-[linear-gradient(135deg,#eef4ff,#fff7cf,#f1e9ff)] blur-3xl" />
                  <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/85 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.12)]">
                    <div className="overflow-hidden rounded-[24px]">
                      <Image
                        src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1600&q=80"
                        alt="Children playing with colorful toys"
                        width={1400}
                        height={1100}
                        priority
                        className="h-[360px] w-full object-cover sm:h-[460px]"
                      />
                    </div>
                    <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between gap-4">
                      <div className="max-w-xs rounded-3xl border border-white/70 bg-white/78 p-4 shadow-lg backdrop-blur">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          Parent Pick
                        </p>
                        <p className="mt-2 text-base font-semibold text-slate-950">
                          Bright toys, soft edges, and cleaner materials for
                          everyday play.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </MotionFade>
            </div>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="section-shell">
            <MotionFade className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-[#4b74ff]">Featured Categories</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                    Shop by what kids want to do next.
                  </h2>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {categoryCards.map((category, index) => {
                  const Icon = category.icon;

                  return (
                    <MotionFade key={category.name} delay={0.05 * index}>
                      <Link
                        href="/shop"
                        className={`group block overflow-hidden rounded-[24px] border border-slate-200 bg-gradient-to-b ${category.tone} p-3 shadow-[0_18px_55px_rgba(15,23,42,0.05)] transition-transform duration-300 hover:-translate-y-1`}
                      >
                        <div className="relative mb-4 aspect-[4/3] overflow-hidden rounded-[20px]">
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 20vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="flex items-start justify-between gap-3 p-2">
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">
                              {category.name}
                            </h3>
                            <p className="mt-1 text-sm leading-6 text-slate-600">
                              {category.description}
                            </p>
                          </div>
                          <div className="rounded-2xl bg-white/80 p-2 shadow-sm">
                            <Icon className="size-5 text-slate-900" />
                          </div>
                        </div>
                      </Link>
                    </MotionFade>
                  );
                })}
              </div>
            </MotionFade>
          </div>
        </section>

        <section id="best-sellers" className="py-10 sm:py-12">
          <div className="section-shell">
            <MotionFade className="space-y-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="eyebrow text-[#7c51e6]">Best Sellers</p>
                  <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                    Four favorites parents buy fast.
                  </h2>
                </div>
                <Link
                  href="/shop"
                  className="hidden text-sm font-semibold text-slate-900 md:inline-flex"
                >
                  View all
                </Link>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {bestSellers.map((product, index) => (
                  <MotionFade key={product.name} delay={0.04 * index}>
                    <Card className="overflow-hidden rounded-[24px] border-slate-200 py-0 shadow-[0_18px_55px_rgba(15,23,42,0.06)] transition-transform duration-300 hover:-translate-y-1">
                      <div className="relative aspect-[4/3] overflow-hidden bg-[#f8fbff]">
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                      <CardContent className="space-y-4 p-5">
                        <Badge className="rounded-full bg-[#eef4ff] px-3 py-1 text-[#4b74ff]">
                          {product.badge}
                        </Badge>
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-lg font-semibold text-slate-950">
                              {product.name}
                            </h3>
                            <div className="flex items-center gap-1 rounded-full bg-[#fff7cf] px-2.5 py-1 text-sm font-medium text-slate-900">
                              <Star className="size-3.5 fill-current" />
                              {product.rating}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-semibold text-slate-950">
                              {product.price}
                            </p>
                            <Link
                              href="/cart"
                              className={cn(
                                buttonVariants({ variant: "outline", size: "sm" }),
                                "rounded-2xl border-slate-200 bg-white"
                              )}
                            >
                              Quick add
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </MotionFade>
                ))}
              </div>
            </MotionFade>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="section-shell">
            <MotionFade className="space-y-6">
              <div>
                <p className="eyebrow text-[#d89a00]">Why Parents Love Us</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  Built to feel playful for kids and effortless for parents.
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {trustCards.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <MotionFade key={item.title} delay={0.04 * index}>
                      <Card className="rounded-[24px] border-slate-200 py-0 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
                        <CardContent className="space-y-4 p-6">
                          <div
                            className={`flex size-12 items-center justify-center rounded-2xl ${item.tone}`}
                          >
                            <Icon className="size-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-950">
                              {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              From material standards to shipping speed, each
                              touchpoint is tuned to reduce friction and build trust.
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </MotionFade>
                  );
                })}
              </div>
            </MotionFade>
          </div>
        </section>

        <section className="py-10 sm:py-12">
          <div className="section-shell">
            <MotionFade className="space-y-6">
              <div>
                <p className="eyebrow text-[#1596b5]">Customer Reviews</p>
                <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                  What parents say after the box arrives.
                </h2>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {reviews.map((review, index) => (
                  <MotionFade key={review.name} delay={0.05 * index}>
                    <div className="rounded-[24px] border border-white/70 bg-white/70 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-md">
                      <div className="mb-4 flex items-center gap-1 text-[#d89a00]">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star key={starIndex} className="size-4 fill-current" />
                        ))}
                      </div>
                      <p className="text-sm leading-7 text-slate-700">
                        “{review.quote}”
                      </p>
                      <div className="mt-5">
                        <p className="font-semibold text-slate-950">{review.name}</p>
                        <p className="text-sm text-slate-500">{review.role}</p>
                      </div>
                    </div>
                  </MotionFade>
                ))}
              </div>
            </MotionFade>
          </div>
        </section>

        <section className="pb-12 pt-6 sm:pb-16">
          <div className="section-shell">
            <MotionFade>
              <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-[linear-gradient(135deg,#eef4ff,#fff7cf_52%,#f1e9ff)] p-7 shadow-[0_25px_80px_rgba(15,23,42,0.08)] sm:p-10">
                <div className="absolute -right-8 -top-8 size-32 rounded-full bg-white/45 blur-2xl" />
                <div className="absolute bottom-0 left-0 size-28 rounded-full bg-white/35 blur-2xl" />
                <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="eyebrow text-slate-700">Final CTA</p>
                    <h2 className="mt-2 text-3xl font-semibold text-slate-950 sm:text-4xl">
                      Make Playtime More Magical
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-slate-700 sm:text-base">
                      Bright toys, premium quality, and a cleaner path to checkout.
                    </p>
                  </div>
                  <Link
                    href="/shop"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "rounded-2xl bg-slate-950 px-6 text-white hover:bg-slate-800"
                    )}
                  >
                    Start Shopping
                  </Link>
                </div>
              </div>
            </MotionFade>
          </div>
        </section>
      </main>
    </StoreShell>
  );
}
