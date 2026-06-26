"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Menu, ShoppingCart, Store, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { signOutAction } from "@/app/actions/auth";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/track-order", label: "Track Order" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="hidden items-center gap-7 md:flex">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative text-sm font-medium transition-colors ${
              active ? "text-white" : "text-white/55 hover:text-white"
            }`}
          >
            {item.label}
            {active && (
              <span className="absolute -bottom-1.5 left-0 h-0.5 w-full rounded-full bg-linear-to-r from-brand to-brand-2" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function MobileNav({
  cartCount = 0,
  signedIn = false,
  accountName = "Account",
  isAdmin = false,
}: {
  cartCount?: number;
  signedIn?: boolean;
  accountName?: string;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open menu"
            className="text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          />
        }
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent
        side="right"
        showCloseButton
        className="w-80 border-white/10 bg-surface text-white"
      >
        <div className="flex items-center gap-3 border-b border-white/8 p-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-linear-to-br from-brand to-brand-strong">
            <Store className="size-4 text-white" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand/70">
              Play · Learn · Repeat
            </p>
            <p className="text-base font-black leading-tight text-white">ToyVerse</p>
          </div>
        </div>

        <nav className="flex flex-col gap-1 px-3 py-4">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <SheetClose
                key={item.href}
                render={
                  <Link
                    href={item.href}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                      active
                        ? "bg-white/8 text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    }`}
                  />
                }
              >
                {item.label}
              </SheetClose>
            );
          })}
        </nav>

        {/* Account */}
        <div className="border-t border-white/8 px-3 py-4">
          {signedIn ? (
            <div className="space-y-1">
              <SheetClose
                render={
                  <Link
                    href="/account"
                    className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                  />
                }
              >
                <User className="size-4" />
                {accountName}
              </SheetClose>
              {isAdmin && (
                <SheetClose
                  render={
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-brand transition-colors hover:bg-brand/10"
                    />
                  }
                >
                  <LayoutDashboard className="size-4" />
                  Admin Panel
                </SheetClose>
              )}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <SheetClose
              render={
                <Link
                  href="/login"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white/55 transition-colors hover:bg-white/5 hover:text-white"
                />
              }
            >
              <User className="size-4" />
              Sign in
            </SheetClose>
          )}
        </div>

        <div className="mt-auto border-t border-white/8 p-5">
          <SheetClose
            render={
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong px-5 py-3 text-sm font-bold text-white shadow-[0_0_20px_color-mix(in_srgb,var(--brand)_30%,transparent)]"
              />
            }
          >
            <ShoppingCart className="size-4" />
            View Cart ({cartCount})
          </SheetClose>
        </div>
      </SheetContent>
    </Sheet>
  );
}
