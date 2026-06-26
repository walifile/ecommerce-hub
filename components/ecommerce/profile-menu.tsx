"use client";

import Link from "next/link";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Package,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions/auth";

export function ProfileMenu({
  name,
  email,
  isAdmin = false,
}: {
  name: string;
  email?: string | null;
  isAdmin?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition-all hover:border-white/20 hover:text-white sm:inline-flex"
          />
        }
      >
        <User className="size-4" />
        {name}
        <ChevronDown className="size-3.5 opacity-60" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-56 border border-white/10 bg-surface text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
      >
        <div className="flex flex-col px-2 py-1.5">
          <span className="text-sm font-bold text-white">{name}</span>
          {email && (
            <span className="truncate text-xs font-normal text-white/40">
              {email}
            </span>
          )}
        </div>

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          className="text-white/70 focus:bg-white/10 focus:text-white"
          render={<Link href="/account" />}
        >
          <User className="size-4" />
          My Account
        </DropdownMenuItem>

        <DropdownMenuItem
          className="text-white/70 focus:bg-white/10 focus:text-white"
          render={<Link href="/track-order" />}
        >
          <Package className="size-4" />
          Track Orders
        </DropdownMenuItem>

        {isAdmin && (
          <DropdownMenuItem
            className="font-semibold text-brand focus:bg-brand/10 focus:text-brand"
            render={<Link href="/admin" />}
          >
            <LayoutDashboard className="size-4" />
            Admin Panel
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="bg-white/10" />

        <DropdownMenuItem
          variant="destructive"
          onClick={() => {
            void signOutAction();
          }}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
