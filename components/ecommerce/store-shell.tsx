import Link from "next/link";
import { Mail, MessageCircle, ShoppingCart, Store, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
  { href: "/admin", label: "Admin" },
];

export function StoreShell({
  children,
  cartCount = 3,
}: {
  children: React.ReactNode;
  cartCount?: number;
}) {
  return (
    <div className="min-h-screen bg-[#07070f]">
      {/* ── Dark Header ── */}
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#07070f]/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c] shadow-[0_0_18px_rgba(249,115,22,0.4)]">
              <Store className="size-5 text-white" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/30">
                Play. Learn. Repeat.
              </p>
              <p className="text-base font-black text-white">ToyVerse</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-white/45 transition-colors hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/track-order"
              className={cn(
                "hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-medium text-white/60 transition-all hover:border-white/20 hover:text-white md:inline-flex"
              )}
            >
              <Truck className="size-4" />
              Track
            </Link>
            <Link
              href="/cart"
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-[#f97316] to-[#ea580c] px-5 py-2 text-sm font-bold text-white shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-shadow hover:shadow-[0_0_30px_rgba(249,115,22,0.45)]"
            >
              <ShoppingCart className="size-4" />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </header>

      {children}

      {/* ── Dark Footer ── */}
      <footer className="border-t border-white/[0.06] bg-[#07070f]">
        {/* Accent line */}
        <div
          className="h-[2px] w-full"
          style={{ background: "linear-gradient(90deg, #f97316, #8b5cf6, #06b6d4)" }}
        />
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 text-sm text-white/35 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#f97316] to-[#ea580c]">
                <Store className="size-4 text-white" />
              </div>
              <span className="text-base font-black text-white">ToyVerse</span>
            </div>
            <p className="max-w-xs leading-6">
              Bright, premium toys for curious kids and parents who want quality,
              speed, and a cleaner shopping experience.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="#"
                aria-label="Community chat"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all hover:border-white/20 hover:text-white"
              >
                <MessageCircle className="size-4" />
              </Link>
              <Link
                href="mailto:hello@toyverse.shop"
                aria-label="Email"
                className="flex size-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/40 transition-all hover:border-white/20 hover:text-white"
              >
                <Mail className="size-4" />
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Contact
            </p>
            <div className="grid gap-2">
              <Link href="/contact" className="transition-colors hover:text-white">Help Center</Link>
              <Link href="/track-order" className="transition-colors hover:text-white">Track Order</Link>
              <Link href="mailto:hello@toyverse.shop" className="transition-colors hover:text-white">
                hello@toyverse.shop
              </Link>
            </div>
          </div>

          {/* Policies */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">
              Policies
            </p>
            <div className="grid gap-2">
              <Link href="#" className="transition-colors hover:text-white">Shipping Policy</Link>
              <Link href="#" className="transition-colors hover:text-white">Returns Policy</Link>
              <Link href="#" className="transition-colors hover:text-white">Privacy Policy</Link>
            </div>
          </div>
        </div>

        <div className="border-t border-white/[0.05] px-4 py-4 text-center text-xs text-white/20 sm:px-6 lg:px-8">
          © 2026 ToyVerse. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
