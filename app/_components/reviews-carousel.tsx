"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

type Review = {
  quote: string;
  name: string;
  role: string;
  rating: number;
  accent: string;
};

const reviews: Review[] = [
  {
    quote:
      "The quality feels premium the second the box arrives. My son opened one set and forgot screen time existed for the whole weekend.",
    name: "Maha R.",
    role: "Karachi parent",
    rating: 5,
    accent: "var(--brand)",
  },
  {
    quote:
      "ToyVerse feels clean and easy to trust. I found a birthday gift in minutes and checkout was completely painless on mobile.",
    name: "Areeba S.",
    role: "Lahore parent",
    rating: 5,
    accent: "var(--brand-2)",
  },
  {
    quote:
      "Bright design, solid prices, fast delivery. It looks fun without feeling chaotic — which is genuinely rare in toy stores.",
    name: "Usman K.",
    role: "Islamabad parent",
    rating: 5,
    accent: "var(--brand-3)",
  },
  {
    quote:
      "Shipped in two days and the packaging was gorgeous. My daughter now asks for ToyVerse by name. That never happens.",
    name: "Sana M.",
    role: "Rawalpindi parent",
    rating: 5,
    accent: "var(--brand)",
  },
  {
    quote:
      "Customer support replied within the hour and sorted a sizing question instantly. The toys are sturdy and beautifully made.",
    name: "Bilal A.",
    role: "Multan parent",
    rating: 5,
    accent: "var(--brand-2)",
  },
  {
    quote:
      "Finally a toy store that looks as good as the products. Browsing felt effortless and the recommendations were spot on.",
    name: "Hira N.",
    role: "Faisalabad parent",
    rating: 5,
    accent: "var(--brand-3)",
  },
];

const AUTOPLAY_MS = 6000;

export function ReviewsCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [paused, setPaused] = useState(false);

  // Recalculate page count on resize (per-view changes with breakpoints)
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const count = Math.max(1, Math.round(track.scrollWidth / track.clientWidth));
      setPages(count);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = ((next % pages) + pages) % pages;
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  };

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => goTo(page + 1), AUTOPLAY_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, page, pages]);

  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center text-center"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
            Customer Reviews
          </p>
          <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            Loved by parents{" "}
            <span className="bg-linear-to-r from-brand to-brand-2 bg-clip-text text-transparent">
              everywhere.
            </span>
          </h2>
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-brand text-brand" />
              ))}
            </div>
            <span className="text-sm font-semibold text-white/55">
              4.9 / 5 from 2,400+ verified reviews
            </span>
          </div>
        </motion.div>

        {/* Slider */}
        <div
          className="mt-14"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            onScroll={onScroll}
            className="flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review) => (
              <motion.div
                key={review.name}
                className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"
              >
                <div className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/8 bg-white/4 p-7 backdrop-blur-xl transition-all duration-300 hover:border-white/15">
                  {/* Accent top line */}
                  <div
                    className="absolute inset-x-0 top-0 h-px"
                    style={{ background: `linear-gradient(90deg, transparent, ${review.accent}, transparent)` }}
                  />
                  <Quote
                    className="absolute right-6 top-6 size-12 opacity-10"
                    style={{ color: review.accent }}
                    fill="currentColor"
                  />

                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-brand text-brand" />
                    ))}
                  </div>

                  <p className="relative mt-5 flex-1 text-sm leading-7 text-white/75">
                    "{review.quote}"
                  </p>

                  <div className="mt-6 flex items-center gap-3">
                    <div
                      className="flex size-10 items-center justify-center rounded-full text-sm font-black text-white"
                      style={{ background: `linear-gradient(135deg, ${review.accent}, var(--brand-2))` }}
                    >
                      {review.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">{review.name}</p>
                      <p className="text-xs text-white/40">{review.role}</p>
                    </div>
                    <span
                      className="ml-auto hidden items-center rounded-full px-2.5 py-1 text-[10px] font-bold lg:inline-flex"
                      style={{ background: `color-mix(in srgb, ${review.accent} 9%, transparent)`, color: review.accent }}
                    >
                      Verified
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Dots */}
          <div className="mt-8 flex items-center justify-center gap-2.5">
            {Array.from({ length: pages }).map((_, i) => (
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
