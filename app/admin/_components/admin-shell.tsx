import Link from "next/link";
import {
  Bot,
  ChartColumn,
  LayoutGrid,
  Package2,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/products", label: "Products", icon: Package2 },
  { href: "/admin/orders", label: "Orders", icon: Receipt },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/profit", label: "Profit", icon: ChartColumn },
  { href: "/admin/expenses", label: "Expenses", icon: Wallet },
  { href: "/admin/ai", label: "AI", icon: Bot },
];

export function AdminShell({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-lg border border-border/70 bg-background p-5">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Admin Dashboard
            </p>
            <div>
              <h1 className="text-3xl font-semibold text-foreground">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-2">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center gap-2 rounded-md border border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Icon className="size-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
        {children}
      </div>
    </div>
  );
}
