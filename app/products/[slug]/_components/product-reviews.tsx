"use client";

import { useActionState, useEffect, useRef } from "react";
import { ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction, type ReviewState } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/lib/ecommerce-data";

const initial: ReviewState = { status: "idle", message: "" };

export function ProductReviews({ productId, productSlug, reviews }: {
  productId: string; productSlug: string; reviews: ProductReview[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(submitReviewAction, initial);
  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    }
    if (state.status === "error") toast.error(state.message);
  }, [state]);
  return (
    <section className="section-shell py-12" id="reviews">
      <div className="mb-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand">Customer feedback</p>
        <h2 className="mt-2 text-3xl font-black text-white">Product reviews</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          {reviews.length ? reviews.map((review) => (
            <article key={review.id} className="rounded-3xl border border-white/8 bg-white/3 p-5">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className={index < review.rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-white/15"} />
                ))}
              </div>
              {review.title ? <h3 className="mt-3 font-bold text-white">{review.title}</h3> : null}
              <p className="mt-2 text-sm leading-7 text-white/60">{review.body}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/35">
                <span>{review.reviewerName} · {new Date(review.createdAt).toLocaleDateString()}</span>
                {review.verifiedPurchase ? (
                  <span className="inline-flex items-center gap-1 text-emerald-300"><ShieldCheck className="size-3.5" />Verified purchase</span>
                ) : null}
              </div>
            </article>
          )) : <p className="rounded-3xl border border-white/8 bg-white/3 p-6 text-sm text-white/50">No approved reviews yet. Be the first to submit one.</p>}
        </div>
        <form ref={formRef} action={action} className="space-y-4 rounded-3xl border border-white/8 bg-white/3 p-6">
          <input type="hidden" name="productId" value={productId} />
          <input type="hidden" name="productSlug" value={productSlug} />
          <h3 className="text-xl font-bold text-white">Write a review</h3>
          <p className="text-sm leading-6 text-white/50">Reviews are available after delivery. Enter the order number and phone used at checkout; these details remain private.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="orderNumber" required minLength={3} maxLength={40} autoComplete="off" placeholder="Order number (TV-...)" className="border-white/10 bg-black/30 text-white" />
            <Input name="phone" required minLength={7} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="Checkout phone" className="border-white/10 bg-black/30 text-white" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input name="reviewerName" required maxLength={80} placeholder="Your name" className="border-white/10 bg-black/30 text-white" />
            <Input name="reviewerEmail" type="email" placeholder="Email (private)" className="border-white/10 bg-black/30 text-white" />
          </div>
          <select name="rating" required defaultValue="5" className="h-10 w-full rounded-md border border-white/10 bg-black/30 px-3 text-sm text-white">
            {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}
          </select>
          <Input name="title" maxLength={120} placeholder="Review title" className="border-white/10 bg-black/30 text-white" />
          <Textarea name="body" required minLength={10} maxLength={1500} placeholder="Share your experience" className="min-h-28 border-white/10 bg-black/30 text-white" />
          <Button disabled={pending} className="w-full">{pending ? "Verifying purchase..." : "Submit verified review"}</Button>
        </form>
      </div>
    </section>
  );
}
