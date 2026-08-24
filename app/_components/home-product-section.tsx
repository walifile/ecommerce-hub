import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ecommerce/product-card";
import type { Product } from "@/lib/ecommerce-data";

export function HomeProductSection({
  eyebrow,
  title,
  products,
}: {
  eyebrow: string;
  title: string;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <section className="bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">{eyebrow}</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">{title}</h2>
          </div>
          <Link href="/shop" className="flex items-center gap-2 text-sm font-semibold text-brand hover:text-white">
            View all <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </div>
    </section>
  );
}
