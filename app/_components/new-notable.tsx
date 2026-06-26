"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";

type Product = {
  name: string;
  description: string;
  meta: string[];
  price: string;
  image: string;
  tag?: string;
  accent: string;
};

const products: Product[] = [
  {
    name: "Rocket Builder Trio",
    description: "A set of three STEM kits for curious young builders.",
    meta: ["Ages 6+", "3 kits"],
    price: "$139.00",
    image: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=1000&q=80",
    tag: "Online exclusive",
    accent: "var(--brand)",
  },
  {
    name: "Dream Canvas Kit",
    description: "Coarse-grain art set to spark open-ended creativity.",
    meta: ["One size only", "6.2 oz"],
    price: "$50.00",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1000&q=80",
    accent: "var(--brand-2)",
  },
  {
    name: "Mini Drift Racer",
    description: "Maple Frame, Rubber Tread, Cedar Heart finish.",
    meta: ["One size only", "1.6 fl oz"],
    price: "$200.00",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=1000&q=80",
    tag: "New addition",
    accent: "var(--brand-3)",
  },
  {
    name: "Adventure Bounce Set",
    description: "Bright, active outdoor toys built for movement.",
    meta: ["Ages 4+", "Outdoor"],
    price: "$44.00",
    image: "https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=1000&q=80",
    tag: "Online exclusive",
    accent: "var(--brand)",
  },
  {
    name: "Skyline Block Tower",
    description: "Colorful building set with room for big ideas.",
    meta: ["Ages 5+", "240 pcs"],
    price: "$72.00",
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=1000&q=80",
    accent: "var(--brand-2)",
  },
  {
    name: "Pixel Pet Companion",
    description: "Interactive learning buddy for everyday play.",
    meta: ["Ages 6+", "1 unit"],
    price: "$89.00",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1000&q=80",
    tag: "New addition",
    accent: "var(--brand-3)",
  },
];

const PAGES = Math.ceil(products.length / 3);

export function NewNotable() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(PAGES - 1, next));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
            Best Sellers
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            New and notable
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-white/45 sm:text-base">
            A collection of longstanding favorites and recent additions to the
            range — each likely to make for a memorable gift.
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative mt-14">
          {/* Track */}
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {products.map((product) => (
              <div
                key={product.name}
                className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/3 transition-all duration-300 hover:border-white/12 hover:-translate-y-1">
                  {/* Image */}
                  <div className="relative aspect-3/2 overflow-hidden">
                    <div className="absolute inset-0 z-10 bg-linear-to-t from-surface/60 via-transparent to-transparent" />
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 46vw, 30vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.tag && (
                      <span
                        className="absolute left-4 top-4 z-20 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                        style={{
                          color: product.accent,
                          borderColor: `color-mix(in srgb, ${product.accent} 19%, transparent)`,
                          background: `color-mix(in srgb, ${product.accent} 8%, transparent)`,
                        }}
                      >
                        {product.tag}
                      </span>
                    )}
                    <button
                      type="button"
                      aria-label="Save"
                      className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-all hover:text-white"
                    >
                      <Bookmark className="size-4" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col items-center px-4 py-4 text-center">
                    <h3 className="text-sm font-black text-white">{product.name}</h3>
                    <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-white/45">
                      {product.description}
                    </p>

                    <div className="mt-2 space-y-0">
                      {product.meta.map((line, i) => (
                        <p
                          key={line}
                          className={i === 0 ? "text-[11px] text-white/35" : "text-xs font-semibold text-white/70"}
                        >
                          {line}
                        </p>
                      ))}
                    </div>

                    <p className="mt-2 text-base font-black text-white">{product.price}</p>

                    <Link
                      href="/cart"
                      className="mt-3 w-full rounded-full bg-linear-to-r from-brand to-brand-strong py-2.5 text-xs font-bold text-white shadow-[0_0_25px_color-mix(in_srgb,var(--brand)_25%,transparent)] transition-shadow hover:shadow-[0_0_40px_color-mix(in_srgb,var(--brand)_45%,transparent)]"
                    >
                      Add to cart
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-2.5">
            {Array.from({ length: PAGES }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to page ${i + 1}`}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-300"
                style={{
                  width: page === i ? "28px" : "14px",
                  background: page === i ? "var(--brand)" : "rgba(255,255,255,0.18)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
