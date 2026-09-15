"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const main = images[active] ?? images[0];

  const goTo = useCallback(
    (index: number) => setActive((index + images.length) % images.length),
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
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          aria-label="Open full-screen image"
          className="group relative block aspect-[4/3] w-full cursor-zoom-in overflow-hidden rounded-[22px] bg-surface-2"
        >
          <Image
            key={main}
            src={main}
            alt={name}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover duration-300 animate-in fade-in group-hover:scale-105 transition-transform"
          />
          <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-semibold text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
            <Expand className="size-3.5" />
            Zoom
          </span>
        </button>
      </div>

      {images.length > 1 ? (
        <div className="grid grid-cols-4 gap-3">
          {images.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1}`}
              aria-pressed={active === index}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white/[0.03] p-1.5 transition",
                active === index
                  ? "border-brand ring-2 ring-brand/30"
                  : "border-white/[0.08] hover:border-white/20"
              )}
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
                <Image
                  src={image}
                  alt={`${name} — photo ${index + 1}`}
                  fill
                  sizes="120px"
                  className="object-cover"
                />
              </div>
            </button>
          ))}
        </div>
      ) : null}

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-100 flex flex-col bg-black/95 backdrop-blur-2xl animate-in fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} — full-screen gallery`}
          onClick={() => setLightboxOpen(false)}
        >
          <div className="flex items-center justify-between gap-4 p-4 sm:p-6">
            <span className="truncate text-sm font-medium text-white/60">{name}</span>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Close"
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition hover:bg-white/[0.12]"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4 pb-4 sm:px-10">
            {images.length > 1 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(active - 1);
                }}
                aria-label="Previous image"
                className="absolute left-2 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-white/[0.12] sm:left-6"
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

            {images.length > 1 ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  goTo(active + 1);
                }}
                aria-label="Next image"
                className="absolute right-2 z-10 flex size-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white transition hover:bg-white/[0.12] sm:right-6"
              >
                <ChevronRight className="size-5" />
              </button>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div
              className="flex items-center justify-center gap-2 overflow-x-auto p-4 sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              {images.map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-pressed={active === index}
                  className={cn(
                    "size-14 shrink-0 overflow-hidden rounded-xl border-2 transition",
                    active === index
                      ? "border-brand"
                      : "border-white/15 opacity-60 hover:opacity-100"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt={`${name} — photo ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
