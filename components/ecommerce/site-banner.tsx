import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import type { StoreBanner } from "@/lib/ecommerce-data";

export function SiteBanner({ banner }: { banner: StoreBanner }) {
  const message = banner.announcementMessage.trim();
  const linkText = banner.announcementLinkText.trim();
  const linkHref = banner.announcementLinkHref.trim();
  const showLink = linkText && linkHref;

  if (!banner.announcementEnabled || !message) {
    return null;
  }

  return (
    <div className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,color-mix(in_srgb,var(--brand)_45%,transparent),transparent_30%),linear-gradient(90deg,#050505,#111014,#050505)]">
      <div className="absolute inset-y-0 left-1/4 w-48 bg-brand/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-11 w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-2 text-center sm:min-h-12 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center justify-center gap-2 text-sm font-semibold text-white">
          <Sparkles className="size-4 shrink-0 text-brand" />
          <span className="max-w-4xl text-balance">{message}</span>
        </div>

        {showLink ? (
          <Link
            href={linkHref}
            className="group inline-flex shrink-0 items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-black text-black transition-colors hover:bg-white/90"
          >
            {linkText}
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : null}
      </div>
    </div>
  );
}
