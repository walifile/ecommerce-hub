import Link from "next/link";
import { Store } from "lucide-react";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12">
      <div className="pointer-events-none absolute right-0 top-0 -z-0 size-[40vw] rounded-full bg-brand/5 blur-[140px]" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-strong shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_40%,transparent)]">
            <Store className="size-5 text-white" />
          </div>
          <span className="text-lg font-black text-white">ToyVerse</span>
        </Link>

        <div className="rounded-3xl border border-white/8 bg-white/4 p-7 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
          <h1 className="text-2xl font-black tracking-tight text-white">{title}</h1>
          <p className="mt-1.5 text-sm text-white/50">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <p className="mt-6 text-center text-sm text-white/45">{footer}</p>
        )}
      </div>
    </div>
  );
}
