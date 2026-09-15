"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartInput } from "@/components/cart/cart-provider";

export function BuyNowButton({
  item, quantity, disabled, className, children,
}: {
  item: CartInput;
  quantity: number;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  return (
    <button
      type="button"
      disabled={disabled}
      className={className}
      onClick={() => {
        addItem(item, quantity);
        router.push("/checkout");
      }}
    >
      {children ?? "Buy now"}
    </button>
  );
}
