import Link from "next/link";
import { Store, User } from "lucide-react";
import { NavLinks, MobileNav } from "@/components/ecommerce/nav-links";
import { ProfileMenu } from "@/components/ecommerce/profile-menu";
import { CartButton } from "@/components/cart/cart-button";
import { SiteBanner } from "@/components/ecommerce/site-banner";
import { SiteFooter } from "@/components/ecommerce/site-footer";
import { getCurrentProfile } from "@/lib/auth";
import { getStoreBanner } from "@/lib/ecommerce-data";

export async function StoreShell({
  children,
}: {
  children: React.ReactNode;
  /** Deprecated: cart count is now read live from the cart context. */
  cartCount?: number;
}) {
  const [profile, banner] = await Promise.all([
    getCurrentProfile(),
    getStoreBanner(),
  ]);
  const firstName = profile?.fullName?.trim().split(" ")[0] || "Account";

  return (
    <div className="min-h-screen bg-surface">
      <SiteBanner banner={banner} />
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
              <ProfileMenu
                name={firstName}
                email={profile.email}
                isAdmin={profile.role === "admin"}
              />
            ) : (
              <Link
                href="/login"
                className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white sm:inline-flex"
              >
                <User className="size-4" />
                Sign in
              </Link>
            )}
            <CartButton />
            <MobileNav
              signedIn={Boolean(profile)}
              accountName={firstName}
              isAdmin={profile?.role === "admin"}
            />
          </div>
        </div>
      </header>

      {children}

      <SiteFooter />
    </div>
  );
}
