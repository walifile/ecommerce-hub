"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Bookmark } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart";
import { formatCurrency } from "@/lib/format";
import type { Product as CatalogProduct } from "@/lib/ecommerce-data";

function getTag(product: CatalogProduct) {
  if (product.bestSeller) return { label: "Best seller", accent: "var(--brand)" };
  if (product.isNew) return { label: "New addition", accent: "var(--brand-3)" };
  if (product.featured) return { label: "Featured", accent: "var(--brand-2)" };
  return null;
}

export function NewNotable({ products }: { products: CatalogProduct[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const featuredProducts = products
    .filter((product) => product.status === "published")
    .sort(
      (a, b) =>
        Number(b.bestSeller ?? false) - Number(a.bestSeller ?? false) ||
        Number(b.featured ?? false) - Number(a.featured ?? false) ||
        Number(b.isNew ?? false) - Number(a.isNew ?? false)
    )
    .slice(0, 6);
  const pages = Math.max(1, Math.ceil(featuredProducts.length / 3));

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(pages - 1, next));
    track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
    setPage(clamped);
  };

  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setPage(Math.round(track.scrollLeft / track.clientWidth));
  };

  if (featuredProducts.length === 0) {
    return null;
  }

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
            {featuredProducts.map((product) => {
              const tag = getTag(product);
              const isOutOfStock = product.stockQuantity <= 0;

              return (
                <div
                  key={product.id}
                  className="w-[85%] shrink-0 snap-start sm:w-[46%] lg:w-[calc((100%-3rem)/3)]"
                >
                  <div className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.07] bg-white/3 transition-all duration-300 hover:border-white/12 hover:-translate-y-1">
                    {/* Image */}
                    <Link
                      href={`/products/${product.slug}`}
                      className="relative block aspect-3/2 overflow-hidden"
                    >
                      <div className="absolute inset-0 z-10 bg-linear-to-t from-surface/60 via-transparent to-transparent" />
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 85vw, (max-width: 1024px) 46vw, 30vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {tag && (
                        <span
                          className="absolute left-4 top-4 z-20 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                          style={{
                            color: tag.accent,
                            borderColor: `color-mix(in srgb, ${tag.accent} 19%, transparent)`,
                            background: `color-mix(in srgb, ${tag.accent} 8%, transparent)`,
                          }}
                        >
                          {tag.label}
                        </span>
                      )}
                      <span
                        aria-hidden
                        className="absolute right-4 top-4 z-20 flex size-9 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white/60 backdrop-blur-sm transition-all group-hover:text-white"
                      >
                        <Bookmark className="size-4" />
                      </span>
                    </Link>

                    {/* Body */}
                    <div className="flex flex-1 flex-col items-center px-4 py-4 text-center">
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-sm font-black text-white transition-colors hover:text-brand"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 line-clamp-2 max-w-xs text-xs leading-5 text-white/45">
                        {product.shortDescription || product.description}
                      </p>

                      <div className="mt-2 space-y-0">
                        <p className="text-[11px] text-white/35">{product.category}</p>
                        <p className="text-xs font-semibold text-white/70">
                          {isOutOfStock
                            ? "Out of stock"
                            : `${product.stockQuantity} in stock`}
                        </p>
                      </div>

                      <p className="mt-2 text-base font-black text-white">
                        {formatCurrency(product.price)}
                      </p>

                      <AddToCartButton
                        disabled={isOutOfStock}
                        item={{
                          id: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          costPrice: product.costPrice,
                          image: product.image,
                          category: product.category,
                        }}
                        className={`mt-3 w-full rounded-full py-2.5 text-xs font-bold text-white shadow-[0_0_25px_color-mix(in_srgb,var(--brand)_25%,transparent)] transition-shadow ${
                          isOutOfStock
                            ? "cursor-not-allowed bg-white/10 text-white/35 shadow-none"
                            : "bg-linear-to-r from-brand to-brand-strong hover:shadow-[0_0_40px_color-mix(in_srgb,var(--brand)_45%,transparent)]"
                        }`}
                      >
                        {isOutOfStock ? "Out of stock" : "Add to cart"}
                      </AddToCartButton>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dots */}
          <div className="mt-10 flex items-center justify-center gap-2.5">
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
