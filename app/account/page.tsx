import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, LogOut, Mail, Package, User } from "lucide-react";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth";
import { signOutAction } from "@/app/actions/auth";

export const metadata: Metadata = { title: "My Account" };

export default async function AccountPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/account");

  const displayName = profile.fullName?.trim() || profile.email || "there";

  return (
    <StoreShell>
      <main className="min-h-[60vh] bg-surface py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
            My Account
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
            Hi, {displayName}.
          </h1>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="text-xs text-white/40">Name</p>
                  <p className="text-sm font-bold text-white">
                    {profile.fullName?.trim() || "—"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-2/10 text-brand-2">
                  <Mail className="size-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-white/40">Email</p>
                  <p className="truncate text-sm font-bold text-white">
                    {profile.email || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/track-order"
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/70 transition-all hover:border-white/20 hover:text-white"
            >
              <Package className="size-4" />
              Track an order
            </Link>

            {profile.role === "admin" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-5 py-2.5 text-sm font-semibold text-brand transition-all hover:bg-brand/15"
              >
                <LayoutDashboard className="size-4" />
                Admin dashboard
              </Link>
            )}

            <form action={signOutAction}>
              <Button
                type="submit"
                variant="ghost"
                className="h-auto gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white/60 hover:bg-white/5 hover:text-white"
              >
                <LogOut className="size-4" />
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </main>
    </StoreShell>
  );
}
