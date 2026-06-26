"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Bot,
  ChartColumn,
  LayoutGrid,
  Menu,
  MoonStar,
  Package2,
  Palette,
  Receipt,
  SunMedium,
  Users,
  Wallet,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetClose,
  SheetContent,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/profit", label: "Profit", icon: ChartColumn },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/ai", label: "AI", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Palette },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function ThemeButton() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const mounted = resolvedTheme !== undefined;
  const isDark = (mounted ? resolvedTheme : theme) === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon-sm"
      className="rounded-full border-white/10 bg-background/80 text-foreground shadow-sm hover:bg-muted"
      aria-label="Toggle admin theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunMedium className="size-4" /> : <MoonStar className="size-4" />}
    </Button>
  );
}

function AdminNav({
  pathname,
  onNavigate,
  mobile = false,
}: {
  pathname: string;
  onNavigate?: () => void;
  mobile?: boolean;
}) {
  return (
    <nav className="grid gap-1.5">
      {adminLinks.map((link) => {
        const active = isActive(pathname, link.href);
        const Icon = link.icon;
        const itemClass = cn(
          "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
          active
            ? "bg-foreground text-background shadow-sm dark:bg-white dark:text-black"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        );

        if (mobile) {
          return (
            <SheetClose
              key={link.href}
              render={
                <Link href={link.href} onClick={onNavigate} className={itemClass} />
              }
            >
              <Icon className="size-4" />
              <span>{link.label}</span>
            </SheetClose>
          );
        }

        return (
          <Link key={link.href} href={link.href} className={itemClass}>
            <Icon className="size-4" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const activeLabel = useMemo(
    () =>
      adminLinks.find((link) => isActive(pathname, link.href))?.label ?? "Overview",
    [pathname]
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="sticky top-0 hidden h-screen w-[290px] shrink-0 border-r border-border/70 bg-card/80 px-4 py-5 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-3xl border border-border/70 bg-background/80 px-4 py-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#f97316] to-[#ea580c] text-white shadow-[0_0_18px_rgba(249,115,22,0.18)]">
                  <LayoutGrid className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    ToyVerse admin
                  </p>
                  <p className="text-sm font-semibold text-foreground">Control panel</p>
                </div>
              </div>
              <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                Live
              </Badge>
            </div>

            <div className="rounded-3xl border border-border/70 bg-background/80 p-3 shadow-sm">
              <p className="px-3 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Navigation
              </p>
              <AdminNav pathname={pathname} />
            </div>
          </div>

          <div className="mt-auto space-y-4">
            <div className="rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Avatar className="size-10">
                  <AvatarFallback className="bg-muted text-foreground">
                    TV
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">
                    Admin workspace
                  </p>
                  <p className="text-xs text-muted-foreground">Theme: light / dark</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-3xl border border-border/70 bg-background/80 px-4 py-3 shadow-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Appearance
                </p>
                <p className="text-sm font-medium text-foreground">Toggle theme</p>
              </div>
              <ThemeButton />
            </div>
          </div>
        </aside>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            showCloseButton
            className="w-[320px] border-border/70 bg-background text-foreground"
          >
            <div className="space-y-4 p-4 pt-8">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-linear-to-br from-[#f97316] to-[#ea580c] text-white">
                  <LayoutGrid className="size-5" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    ToyVerse admin
                  </p>
                  <p className="text-sm font-semibold text-foreground">Control panel</p>
                </div>
              </div>

              <Separator />

              <AdminNav pathname={pathname} onNavigate={() => setOpen(false)} mobile />

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Appearance
                  </p>
                  <p className="text-sm font-medium text-foreground">Theme toggle</p>
                </div>
                <ThemeButton />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full border-border/70 bg-background lg:hidden"
                  onClick={() => setOpen(true)}
                >
                  <Menu className="size-4" />
                </Button>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[11px]">
                      {activeLabel}
                    </Badge>
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      Admin Dashboard
                    </span>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground lg:hidden">
                    {title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="hidden items-center gap-3 rounded-full border border-border/70 bg-background px-3 py-2 text-xs text-muted-foreground sm:flex">
                  <span className="size-2 rounded-full bg-emerald-500" />
                  Store live
                </div>
                <ThemeButton />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <div className="mb-6 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Admin Dashboard
              </p>
              <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                {description}
              </p>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
