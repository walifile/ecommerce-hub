"use client";

import { toast } from "sonner";
import { useCart, type CartInput } from "@/components/cart/cart-provider";

export function AddToCartButton({
  item,
  quantity = 1,
  className,
  children,
  disabled = false,
  "aria-label": ariaLabel,
}: {
  item: CartInput;
  quantity?: number;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  "aria-label"?: string;
}) {
  const { addItem } = useCart();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      className={className}
      onClick={() => {
        if (disabled) return;
        addItem(item, quantity);
        toast.success(`${item.name} added to cart`);
      }}
    >
      {children}
    </button>
  );
}
