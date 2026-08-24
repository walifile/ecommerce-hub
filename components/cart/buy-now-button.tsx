"use client";

import { useRouter } from "next/navigation";
import { useCart, type CartInput } from "@/components/cart/cart-provider";

export function BuyNowButton({
  item, quantity, disabled, className,
}: {
  item: CartInput;
  quantity: number;
  disabled?: boolean;
  className?: string;
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
      Buy now
    </button>
  );
}
