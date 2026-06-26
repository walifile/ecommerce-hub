"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  costPrice: number;
  image: string;
  category: string;
  quantity: number;
};

export type CartInput = Omit<CartItem, "quantity">;

export type AppliedCoupon = {
  id: string;
  code: string;
  discountType: "fixed" | "percentage";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  coupon: AppliedCoupon | null;
  ready: boolean;
  addItem: (item: CartInput, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  applyCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "toyverse.cart.v1";
const COUPON_STORAGE_KEY = "toyverse.coupon.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate once from localStorage after mount (client-only persistence).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
      const couponRaw = localStorage.getItem(COUPON_STORAGE_KEY);
      if (couponRaw) setCoupon(JSON.parse(couponRaw) as AppliedCoupon);
    } catch {
      // ignore malformed storage
    }
    setReady(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on change (after the initial load).
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota errors
    }
  }, [items, ready]);

  useEffect(() => {
    if (!ready) return;
    try {
      if (coupon) {
        localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch {
      // ignore quota errors
    }
  }, [coupon, ready]);

  const addItem = useCallback((item: CartInput, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + quantity }
            : entry
        );
      }
      return [...current, { ...item, quantity }];
    });
  }, []);

  const setQuantity = useCallback((id: string, quantity: number) => {
    setItems((current) =>
      current
        .map((entry) =>
          entry.id === id ? { ...entry, quantity: Math.max(0, quantity) } : entry
        )
        .filter((entry) => entry.quantity > 0)
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const applyCoupon = useCallback((nextCoupon: AppliedCoupon) => {
    setCoupon(nextCoupon);
  }, []);

  const clearCoupon = useCallback(() => {
    setCoupon(null);
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    return {
      items,
      count,
      subtotal,
      coupon,
      ready,
      addItem,
      setQuantity,
      removeItem,
      applyCoupon,
      clearCoupon,
      clear,
    };
  }, [
    items,
    coupon,
    ready,
    addItem,
    setQuantity,
    removeItem,
    applyCoupon,
    clearCoupon,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}
