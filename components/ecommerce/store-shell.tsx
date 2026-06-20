import Link from "next/link";
import { ShoppingBag, ShoppingCart, Store, Truck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/70">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-md bg-foreground text-background">
              <Store className="size-5" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Ecommerce OS
              </p>
              <p className="text-base font-semibold text-foreground">
                Ecommerce Hub
              </p>
            </div>
          </Link>
          <nav className="hidden items-center gap-5 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/track-order"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "hidden rounded-md md:inline-flex"
              )}
            >
              <Truck className="size-4" />
              Track
            </Link>
            <Link href="/cart" className={cn(buttonVariants(), "rounded-md")}>
              <ShoppingCart className="size-4" />
              Cart ({cartCount})
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-border/70">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-muted-foreground sm:px-6 lg:grid-cols-[1.3fr_1fr_1fr] lg:px-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-foreground">
              <ShoppingBag className="size-4" />
              <span className="font-semibold">Ecommerce Hub</span>
            </div>
            <p className="max-w-md leading-6">
              Built as a single-store operating system: storefront, orders,
              customers, profit, and AI content workflows in one surface.
            </p>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Store</p>
            <div className="grid gap-2">
              <Link href="/shop">Shop</Link>
              <Link href="/checkout">Checkout</Link>
              <Link href="/track-order">Order Tracking</Link>
            </div>
          </div>
          <div className="space-y-3">
            <p className="font-semibold text-foreground">Operations</p>
            <div className="grid gap-2">
              <Link href="/admin">Dashboard</Link>
              <Link href="/admin/orders">Orders</Link>
              <Link href="/admin/profit">Profit</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
