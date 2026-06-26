import Link from "next/link";
import { Coffee, Mail, Sparkles } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StoreBanner } from "@/lib/ecommerce-data";

export function SiteBanner({ banner }: { banner: StoreBanner }) {
  const message = banner.announcementMessage.trim();

  if (!banner.announcementEnabled || !message) {
    return null;
  }

  return (
    <div className="site-banner-bg group relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_10%_0%,color-mix(in_srgb,var(--brand)_45%,transparent),transparent_30%),linear-gradient(90deg,#050505,#111014,#050505)]">
      <div className="site-banner-glow absolute inset-y-0 left-1/4 w-48 bg-brand/20 blur-3xl" />
      <div className="site-banner-flow absolute inset-0" />

      <div className="relative mx-auto flex min-h-11 w-full max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:min-h-12 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-2 text-left text-sm font-semibold text-white">
          <Sparkles className="site-banner-sparkle size-4 shrink-0 text-brand" />
          <span className="truncate sm:max-w-4xl sm:text-balance">{message}</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/contact"
                  aria-label="Contact ToyVerse"
                  className="site-banner-cta inline-flex size-8 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_22%,transparent)] transition-colors hover:bg-white hover:text-black"
                >
                  <Mail className="size-4" />
                </Link>
              }
            />
            <TooltipContent>Contact us</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="https://buymeacoffee.com/waliahmad9"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Support on Buy Me a Coffee"
                  className="site-banner-cta inline-flex size-8 items-center justify-center rounded-full bg-white text-black shadow-[0_0_22px_color-mix(in_srgb,var(--brand)_35%,transparent)] transition-colors hover:bg-white/90"
                >
                  <Coffee className="size-4" />
                </Link>
              }
            />
            <TooltipContent>Buy me a coffee</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}
