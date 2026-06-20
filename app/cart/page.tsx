import { CartClient } from "@/app/cart/_components/cart-client";
import { SectionHeading } from "@/components/ecommerce/section-heading";
import { StoreShell } from "@/components/ecommerce/store-shell";
import { listProducts } from "@/lib/ecommerce-data";

export default async function CartPage() {
  const products = await listProducts();

  return (
    <StoreShell cartCount={3}>
      <main className="section-shell py-12">
        <SectionHeading
          eyebrow="Cart"
          title="Review quantities, coupon state, and shipping before checkout."
          description="This client-side cart is wired as the first operational surface. The next step is persisting it into Supabase and customer sessions."
        />
        <div className="mt-8">
          <CartClient initialItems={products.slice(0, 3)} />
        </div>
      </main>
    </StoreShell>
  );
}
