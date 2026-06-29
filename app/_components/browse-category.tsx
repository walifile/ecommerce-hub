"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";

type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

const ACCENTS = ["var(--brand)", "var(--brand-2)", "var(--brand-3)"];

export function BrowseCategory({ categories }: { categories: StoreCategory[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  // Only categories that have a cover image render in this visual section.
  const items = categories.filter((category) => category.image);
  if (items.length === 0) return null;

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setProgress(max <= 0 ? 0 : track.scrollLeft / max);
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
          className="flex items-end justify-between gap-4"
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand-2">
              Explore the Range
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Browse by category
            </h2>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-white/50 transition-colors hover:text-white md:inline-flex"
          >
            View all
          </Link>
        </motion.div>

        {/* Track */}
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="mt-10 flex gap-5 overflow-x-auto scroll-smooth pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {items.map((category, index) => {
            const accent = ACCENTS[index % ACCENTS.length];
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="w-[60%] shrink-0 sm:w-[38%] lg:w-[calc((100%-5rem)/5)]"
              >
                <Link
                  href={`/shop?category=${encodeURIComponent(category.name)}`}
                  className="group block"
                >
                  <div className="relative aspect-3/4 overflow-hidden rounded-2xl border border-white/[0.07]">
                    <div className="absolute inset-0 z-10 bg-linear-to-t from-surface/70 via-transparent to-transparent" />
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      sizes="(max-width: 640px) 60vw, (max-width: 1024px) 38vw, 20vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span
                      className="absolute left-3 top-3 z-20 size-2 rounded-full"
                      style={{ background: accent, boxShadow: `0 0 10px ${accent}` }}
                    />
                  </div>
                  <p className="mt-3 text-sm font-bold text-white/80 transition-colors group-hover:text-white">
                    {category.name}
                  </p>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mt-6 h-0.5 w-full overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: "28%",
              transform: `translateX(${progress * 257}%)`,
              background: "linear-gradient(90deg, var(--brand), var(--brand-2))",
            }}
          />
        </div>
      </div>
    </section>
  );
}
