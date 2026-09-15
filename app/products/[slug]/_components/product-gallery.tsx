"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Images,
  PackageOpen,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  name: string;
  discount?: number;
  label?: string;
};

export function ProductGallery({ images, name, discount = 0, label }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const main = images[active] ?? images[0];
  const hasMultipleImages = images.length > 1;

  const goTo = useCallback(
    (index: number) => {
      if (!images.length) return;
      setActive((index + images.length) % images.length);
    },
    [images.length]
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setLightboxOpen(false);
      if (event.key === "ArrowRight") goTo(active + 1);
      if (event.key === "ArrowLeft") goTo(active - 1);
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen, active, goTo]);

  return (
    <div className="min-w-0 lg:sticky lg:top-24">
      <div className="grid min-w-0 gap-3 sm:grid-cols-[76px_minmax(0,1fr)] sm:gap-4">
        {hasMultipleImages ? (
          <div className="order-2 flex gap-2 overflow-x-auto pb-1 sm:order-1 sm:max-h-[680px] sm:flex-col sm:overflow-y-auto sm:pb-0">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`View image ${index + 1} of ${images.length}`}
                aria-pressed={active === index}
                className={cn(
                  "group relative size-[68px] shrink-0 overflow-hidden rounded-2xl border bg-white/[0.03] p-1 transition duration-200 sm:size-[76px]",
                  active === index
                    ? "border-brand/80 shadow-[0_0_0_3px_color-mix(in_srgb,var(--brand)_16%,transparent)]"
                    : "border-white/8 opacity-65 hover:border-white/25 hover:opacity-100"
                )}
              >
                <span className="relative block h-full w-full overflow-hidden rounded-xl bg-surface-2">
                  <Image
                    src={image}
                    alt={`${name}, view ${index + 1}`}
                    fill
                    sizes="76px"
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="order-1 min-w-0 sm:order-2">
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.015))] p-2 shadow-[0_35px_100px_rgba(0,0,0,0.36)] sm:p-3">
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,color-mix(in_srgb,var(--brand)_19%,transparent),transparent_38%),radial-gradient(circle_at_85%_85%,color-mix(in_srgb,var(--brand-2)_13%,transparent),transparent_34%)]"
            />

            <div className="relative aspect-square overflow-hidden rounded-[25px] bg-surface-2 sm:aspect-[1.02/1]">
              {main ? (
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  aria-label={`Open full-screen image of ${name}`}
                  className="group absolute inset-0 cursor-zoom-in"
                >
                  <Image
                    key={main}
                    src={main}
                    alt={name}
                    fill
                    priority
                    sizes="(min-width: 1280px) 52vw, (min-width: 1024px) 55vw, 100vw"
                    className="object-cover transition duration-700 ease-out animate-in fade-in group-hover:scale-[1.035]"
                  />
                  <span className="absolute inset-0 bg-linear-to-t from-black/18 via-transparent to-white/[0.03]" />
                  <span className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/45 px-3.5 py-2 text-xs font-semibold text-white/85 opacity-100 backdrop-blur-xl transition sm:opacity-0 sm:group-hover:opacity-100">
                    <Expand className="size-3.5" />
                    View larger
                  </span>
                </button>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                  <span className="flex size-20 items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.04] text-white/25">
                    <PackageOpen className="size-9" />
                  </span>
                  <p className="mt-5 text-sm font-semibold text-white/55">Product image coming soon</p>
                  <p className="mt-1.5 text-xs leading-5 text-white/30">The product details and checkout are still available.</p>
                </div>
              )}

              <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                {label ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-xl">
                    <Sparkles className="size-3 text-brand" />
                    {label}
                  </span>
                ) : null}
                {discount > 0 ? (
                  <span className="rounded-full bg-brand px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em] text-white shadow-[0_8px_24px_color-mix(in_srgb,var(--brand)_35%,transparent)]">
                    {discount}% off
                  </span>
                ) : null}
              </div>

              {images.length ? (
                <span className="pointer-events-none absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[11px] font-semibold text-white/75 backdrop-blur-xl sm:right-5 sm:top-5">
                  <Images className="size-3.5" />
                  {active + 1}/{images.length}
                </span>
              ) : null}

              {hasMultipleImages ? (
                <div className="absolute inset-x-4 bottom-4 flex items-center justify-between sm:inset-x-5 sm:bottom-5">
                  <button
                    type="button"
                    onClick={() => goTo(active - 1)}
                    aria-label="Previous image"
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-black/70"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => goTo(active + 1)}
                    aria-label="Next image"
                    className="flex size-10 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white backdrop-blur-xl transition hover:scale-105 hover:bg-black/70"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {lightboxOpen && main ? (
        <div
          className="fixed inset-0 z-100 flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} full-screen gallery`}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white/80">{name}</p>
              <p className="mt-0.5 text-xs text-white/35">Image {active + 1} of {images.length}</p>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close gallery"
              className="flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.12]"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-4 sm:px-20">
            {hasMultipleImages ? (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); goTo(active - 1); }}
                aria-label="Previous image"
                className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-white/12 sm:left-6"
              >
                <ChevronLeft className="size-5" />
              </button>
            ) : null}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={main}
              src={main}
              alt={name}
              onClick={(event) => event.stopPropagation()}
              className="max-h-full max-w-full cursor-default rounded-2xl object-contain animate-in zoom-in-95"
            />

            {hasMultipleImages ? (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); goTo(active + 1); }}
                aria-label="Next image"
                className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/45 text-white transition hover:bg-white/12 sm:right-6"
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>

          {hasMultipleImages ? (
            <div className="flex items-center justify-center gap-2 overflow-x-auto p-4 sm:p-6" onClick={(event) => event.stopPropagation()}>
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={active === index}
                  className={cn(
                    "size-14 shrink-0 overflow-hidden rounded-xl border-2 transition",
                    active === index ? "border-brand" : "border-white/15 opacity-55 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`${name}, view ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
