import Link from "next/link";
import { ShoppingCart, Store, User } from "lucide-react";
import { NavLinks, MobileNav } from "@/components/ecommerce/nav-links";
import { SiteFooter } from "@/components/ecommerce/site-footer";
import { getCurrentProfile } from "@/lib/auth";

export async function StoreShell({
  children,
  cartCount = 3,
}: {
  children: React.ReactNode;
  cartCount?: number;
}) {
  const profile = await getCurrentProfile();
  const firstName = profile?.fullName?.trim().split(" ")[0] || "Account";

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-50 border-b border-white/6 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-strong shadow-[0_0_18px_color-mix(in_srgb,var(--brand)_40%,transparent)]">
              <Store className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand/70">
                Play · Learn · Repeat
              </p>
              <p className="text-base font-black leading-tight text-white">ToyVerse</p>
            </div>
          </Link>

          <NavLinks />

          <div className="flex items-center gap-2">
            {profile ? (
              <Link
                href="/account"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white sm:inline-flex"
              >
                <User className="size-4" />
                {firstName}
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white sm:inline-flex"
              >
                <User className="size-4" />
                Sign in
              </Link>
            )}
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_color-mix(in_srgb,var(--brand)_30%,transparent)] transition-shadow hover:shadow-[0_0_30px_color-mix(in_srgb,var(--brand)_45%,transparent)] sm:px-5"
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Cart </span>({cartCount})
            </Link>
            <MobileNav cartCount={cartCount} signedIn={Boolean(profile)} accountName={firstName} />
          </div>
        </div>
      </header>

      {children}

      <SiteFooter />
    </div>
  );
}
