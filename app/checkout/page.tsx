import type { Metadata } from "next";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { CheckoutClient } from "@/app/checkout/_components/checkout-client";
import { getCatalogData } from "@/lib/ecommerce-data";

export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const { settings } = await getCatalogData();
  const stripeAvailable = Boolean(process.env.STRIPE_SECRET_KEY);
  return (
    <StoreShell>
      <main className="bg-surface py-12 sm:py-16">
        <div className="section-shell">
          <SectionHeading
            eyebrow="Checkout"
            title="Almost yours — just a few details."
            description={stripeAvailable
              ? "Choose Cash on Delivery or pay securely by card."
              : "Cash on Delivery is available for every order."}
          />
          <CheckoutClient
            shippingFlatRate={settings.shippingFlatRate}
            freeShippingThreshold={settings.freeShippingThreshold}
            stripeAvailable={stripeAvailable}
          />
        </div>
      </main>
    </StoreShell>
  );
}
