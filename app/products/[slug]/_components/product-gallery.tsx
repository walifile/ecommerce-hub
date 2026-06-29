"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const main = images[active] ?? images[0];

  return (
    <div className="space-y-4 lg:sticky lg:top-24">
      <div className="overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.03] p-3 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-xl">
        <div className="aspect-[4/3] overflow-hidden rounded-[22px] bg-surface-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={main}
            src={main}
            alt={name}
            className="h-full w-full object-cover duration-300 animate-in fade-in"
          />
        </div>
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
              <div className="aspect-square overflow-hidden rounded-xl bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="h-full w-full object-cover" />
              </div>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
