import type { Metadata } from "next";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { CheckoutClient } from "@/app/checkout/_components/checkout-client";

export const metadata: Metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <StoreShell>
      <main className="bg-surface py-12 sm:py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Checkout"
            title="Almost yours — just a few details."
            description="Cash on Delivery is ready now, with Stripe available as an optional payment method."
          />
          <CheckoutClient />
        </div>
      </main>
    </StoreShell>
  );
}
