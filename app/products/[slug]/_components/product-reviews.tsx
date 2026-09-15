"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2, MessageSquareQuote, PenLine, ShieldCheck, Star } from "lucide-react";
import { toast } from "sonner";
import { submitReviewAction, type ReviewState } from "@/app/actions/reviews";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ProductReview } from "@/lib/ecommerce-data";
import { cn } from "@/lib/utils";

const initial: ReviewState = { status: "idle", message: "" };

type ProductReviewsProps = {
  productId: string;
  productSlug: string;
  reviews: ProductReview[];
};

export function ProductReviews({ productId, productSlug, reviews }: ProductReviewsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [state, action, pending] = useActionState(submitReviewAction, initial);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    }
    if (state.status === "error") toast.error(state.message);
  }, [state]);

  const reviewCount = reviews.length;
  const average = reviewCount
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviewCount
    : 0;
  const ratingCounts = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: reviews.filter((review) => review.rating === value).length,
  }));

  return (
    <section className="relative border-y border-white/7 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),rgba(255,255,255,0.035))]" id="reviews">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_25%,color-mix(in_srgb,var(--brand)_8%,transparent),transparent_30%)]" />
      <div className="section-shell relative py-16 lg:py-24">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-brand">Real customer feedback</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">Loved it? Let others know.</h2>
          </div>
          <a href="#write-review" className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/70 transition hover:border-brand/30 hover:text-white">
            <PenLine className="size-4 text-brand" />
            Write a review
          </a>
        </div>

        <div className="mt-9 grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)] xl:gap-8">
          <div className="min-w-0 space-y-6">
            <div className="grid gap-4 rounded-[30px] border border-white/9 bg-black/20 p-5 sm:grid-cols-[180px_1fr] sm:p-7">
              <div className="flex flex-col justify-center rounded-2xl border border-white/7 bg-white/[0.025] p-5 text-center">
                <div className="text-5xl font-black tracking-[-0.06em] text-white">{reviewCount ? average.toFixed(1) : "—"}</div>
                <div className="mt-3 flex justify-center gap-1" aria-label={reviewCount ? `${average.toFixed(1)} out of 5 stars` : "No ratings yet"}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={index < Math.round(average) ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-white/12"} />
                  ))}
                </div>
                <p className="mt-2 text-xs text-white/38">{reviewCount === 1 ? "1 approved review" : `${reviewCount} approved reviews`}</p>
              </div>

              <div className="flex flex-col justify-center gap-2.5">
                {ratingCounts.map(({ value, count }) => {
                  const percentage = reviewCount ? (count / reviewCount) * 100 : 0;
                  return (
                    <div key={value} className="grid grid-cols-[42px_1fr_24px] items-center gap-3 text-xs">
                      <span className="flex items-center gap-1 font-semibold text-white/55">{value}<Star className="size-3 fill-amber-400 text-amber-400" /></span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                        <div className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400 transition-all" style={{ width: `${percentage}%` }} />
                      </div>
                      <span className="text-right tabular-nums text-white/30">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {reviewCount ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((review) => (
                  <article key={review.id} className="group flex h-full flex-col rounded-[26px] border border-white/8 bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.04] sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-brand/20 bg-brand/10 text-sm font-black uppercase text-brand">
                          {review.reviewerName.trim().charAt(0) || "C"}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-white">{review.reviewerName}</p>
                          <p className="mt-0.5 text-[11px] text-white/32">
                            {new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(review.createdAt))}
                          </p>
                        </div>
                      </div>
                      <MessageSquareQuote className="size-5 shrink-0 text-white/12 transition group-hover:text-brand/50" />
                    </div>

                    <div className="mt-5 flex items-center gap-1" aria-label={`${review.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={index < review.rating ? "size-3.5 fill-amber-400 text-amber-400" : "size-3.5 text-white/12"} />
                      ))}
                    </div>
                    {review.title ? <h3 className="mt-3 text-base font-bold text-white">{review.title}</h3> : null}
                    <p className="mt-2 flex-1 text-sm leading-7 text-white/52">{review.body}</p>
                    {review.verifiedPurchase ? (
                      <span className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-400/8 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-emerald-300">
                        <ShieldCheck className="size-3.5" />Verified purchase
                      </span>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <div className="flex min-h-48 flex-col items-center justify-center rounded-[28px] border border-dashed border-white/12 bg-white/[0.02] p-8 text-center">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand/10 text-brand"><MessageSquareQuote className="size-5" /></span>
                <h3 className="mt-4 font-bold text-white">No approved reviews yet</h3>
                <p className="mt-2 max-w-sm text-sm leading-6 text-white/42">Bought this product? Be the first customer to share a verified experience.</p>
              </div>
            )}
          </div>

          <form ref={formRef} action={action} id="write-review" className="h-fit scroll-mt-28 rounded-[30px] border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.07),rgba(255,255,255,0.025))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.25)] sm:p-7 lg:sticky lg:top-24">
            <input type="hidden" name="productId" value={productId} />
            <input type="hidden" name="productSlug" value={productSlug} />
            <input type="hidden" name="rating" value={rating} />

            <span className="flex size-11 items-center justify-center rounded-2xl border border-brand/20 bg-brand/10 text-brand"><PenLine className="size-5" /></span>
            <h3 className="mt-5 text-2xl font-black text-white">Share your experience</h3>
            <p className="mt-2 text-sm leading-6 text-white/45">For authentic feedback, we verify your delivered order privately before publishing.</p>

            <fieldset className="mt-6">
              <legend className="text-xs font-semibold text-white/55">Your rating</legend>
              <div className="mt-2 flex w-fit gap-1" onMouseLeave={() => setHoveredRating(0)}>
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoveredRating(value)}
                    aria-label={`Rate ${value} star${value === 1 ? "" : "s"}`}
                    aria-pressed={rating === value}
                    className="rounded-lg p-1 text-white/15 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    <Star className={cn("size-7", value <= (hoveredRating || rating) && "fill-amber-400 text-amber-400")} />
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Order number">
                <Input name="orderNumber" required minLength={3} maxLength={40} autoComplete="off" placeholder="TV-..." className={inputClass} />
              </Field>
              <Field label="Checkout phone">
                <Input name="phone" required minLength={7} maxLength={30} inputMode="tel" autoComplete="tel" placeholder="03xx..." className={inputClass} />
              </Field>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <Field label="Your name">
                <Input name="reviewerName" required maxLength={80} autoComplete="name" placeholder="Name" className={inputClass} />
              </Field>
              <Field label="Email (optional)">
                <Input name="reviewerEmail" type="email" autoComplete="email" maxLength={254} placeholder="Private" className={inputClass} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Review title (optional)">
                <Input name="title" maxLength={120} placeholder="Sum up your experience" className={inputClass} />
              </Field>
            </div>
            <div className="mt-3">
              <Field label="Your review">
                <Textarea name="body" required minLength={10} maxLength={1500} placeholder="What did you like? How are you using it?" className={`${inputClass} min-h-30 resize-y py-3`} />
              </Field>
            </div>

            <Button disabled={pending} className="mt-5 h-12 w-full rounded-2xl bg-linear-to-r from-brand to-brand-strong font-bold text-white shadow-[0_12px_30px_color-mix(in_srgb,var(--brand)_22%,transparent)] hover:brightness-110">
              {pending ? "Verifying purchase..." : "Submit verified review"}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[10px] leading-4 text-white/28">
              <CheckCircle2 className="size-3.5 text-emerald-400/70" />Order and phone details are never displayed publicly.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}

const inputClass = "h-11 rounded-xl border-white/10 bg-black/25 text-white placeholder:text-white/25 focus-visible:border-brand/50 focus-visible:ring-brand/20";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold text-white/48">{label}</span>
      {children}
    </label>
  );
}
