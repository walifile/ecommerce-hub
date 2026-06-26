"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";

export function CartButton() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="flex items-center gap-2 rounded-full bg-linear-to-r from-brand to-brand-strong px-4 py-2 text-sm font-bold text-white shadow-[0_0_20px_color-mix(in_srgb,var(--brand)_30%,transparent)] transition-shadow hover:shadow-[0_0_30px_color-mix(in_srgb,var(--brand)_45%,transparent)] sm:px-5"
    >
      <ShoppingCart className="size-4" />
      <span className="hidden sm:inline">Cart </span>({count})
    </Link>
  );
}
