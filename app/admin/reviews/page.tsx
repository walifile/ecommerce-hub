import Link from "next/link";
import { MessageSquareText, Search, ShieldCheck, Star } from "lucide-react";
import { AdminShell } from "@/app/admin/_components/admin-shell";
import { ReviewActions } from "@/app/admin/reviews/_components/review-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { listAllProductReviews } from "@/lib/review-store";

const PAGE_SIZE = 15;

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const allReviews = await listAllProductReviews();
  const query = (params.search ?? "").trim().toLocaleLowerCase().slice(0, 100);
  const status = ["all", "pending", "approved", "rejected"].includes(params.status)
    ? params.status
    : "all";
  const rating = ["all", "1", "2", "3", "4", "5"].includes(params.rating)
    ? params.rating
    : "all";
  const verification = ["all", "verified", "legacy"].includes(params.verification)
    ? params.verification
    : "all";
  const sort = ["newest", "oldest", "highest", "lowest"].includes(params.sort)
    ? params.sort
    : "newest";

  let reviews = allReviews.filter((review) => {
    if (query && ![
      review.reviewerName,
      review.reviewerEmail,
      review.productName,
      review.title,
      review.body,
    ].some((value) => value.toLocaleLowerCase().includes(query))) return false;
    if (status !== "all" && review.status !== status) return false;
    if (rating !== "all" && review.rating !== Number(rating)) return false;
    if (verification === "verified" && !review.verifiedPurchase) return false;
    if (verification === "legacy" && review.verifiedPurchase) return false;
    return true;
  });
  reviews.sort((a, b) => {
    if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt);
    if (sort === "highest") return b.rating - a.rating || b.createdAt.localeCompare(a.createdAt);
    if (sort === "lowest") return a.rating - b.rating || b.createdAt.localeCompare(a.createdAt);
    return b.createdAt.localeCompare(a.createdAt);
  });

  const resultCount = reviews.length;
  const requestedPage = Number(params.page ?? "1");
  const totalPages = Math.max(1, Math.ceil(resultCount / PAGE_SIZE));
  const page = Math.min(
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1,
    totalPages
  );
  reviews = reviews.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const counts = {
    pending: allReviews.filter((review) => review.status === "pending").length,
    approved: allReviews.filter((review) => review.status === "approved").length,
    rejected: allReviews.filter((review) => review.status === "rejected").length,
    verified: allReviews.filter((review) => review.verifiedPurchase).length,
  };
  const hasFilters = query || status !== "all" || rating !== "all" || verification !== "all" || sort !== "newest";

  return (
    <AdminShell
      title="Reviews"
      description="Verify purchases, moderate customer feedback, and control what appears on product pages."
    >
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Pending", counts.pending, "Needs moderation"],
            ["Approved", counts.approved, "Published reviews"],
            ["Rejected", counts.rejected, "Hidden reviews"],
            ["Verified", counts.verified, "Matched purchases"],
          ].map(([label, value, detail]) => (
            <Card key={label} className="py-0">
              <CardContent className="p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <form className="flex flex-wrap items-end gap-2" action="/admin/reviews">
          <div className="relative min-w-60 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input name="search" defaultValue={params.search ?? ""} placeholder="Search reviewer, product, or review" className="pl-9" />
          </div>
          <select name="status" defaultValue={status} aria-label="Review status" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select name="rating" defaultValue={rating} aria-label="Rating" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All ratings</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
          <select name="verification" defaultValue={verification} aria-label="Purchase verification" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="all">All verification</option>
            <option value="verified">Verified purchase</option>
            <option value="legacy">Legacy / unverified</option>
          </select>
          <select name="sort" defaultValue={sort} aria-label="Sort reviews" className="h-9 rounded-md border border-input bg-background px-3 text-sm">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest rating</option>
            <option value="lowest">Lowest rating</option>
          </select>
          <Button type="submit">Apply</Button>
          {hasFilters ? <Button variant="outline" render={<Link href="/admin/reviews" />}>Clear</Button> : null}
        </form>

        <Card className="overflow-hidden py-0">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2"><MessageSquareText className="size-5 text-primary" />Customer feedback</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{resultCount} of {allReviews.length} reviews</p>
              </div>
              <Badge variant="outline">{counts.pending} awaiting review</Badge>
            </div>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {reviews.map((review) => (
              <article key={review.id} className="grid gap-5 p-5 lg:grid-cols-[1fr_auto]">
                <div className="min-w-0 max-w-4xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={review.status === "approved" ? "default" : review.status === "rejected" ? "destructive" : "secondary"}>
                      {review.status}
                    </Badge>
                    {review.verifiedPurchase ? (
                      <Badge variant="outline" className="text-emerald-700 dark:text-emerald-400"><ShieldCheck className="size-3" />Verified purchase</Badge>
                    ) : <Badge variant="outline">Legacy / unverified</Badge>}
                    <span className="flex items-center gap-1 text-sm font-semibold"><Star className="size-4 fill-amber-400 text-amber-400" />{review.rating}/5</span>
                    {review.productSlug ? (
                      <Link href={`/products/${review.productSlug}`} className="text-sm font-medium text-primary hover:underline" target="_blank">
                        {review.productName}
                      </Link>
                    ) : <span className="text-sm font-medium">{review.productName}</span>}
                  </div>
                  <h2 className="mt-3 font-semibold">{review.title || "Customer review"}</h2>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{review.body}</p>
                  <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>{review.reviewerName}</span>
                    <span>{review.reviewerEmail || "No email"}</span>
                    <span>{new Date(review.createdAt).toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}</span>
                    {review.orderId ? <Link href={`/admin/orders/${review.orderId}`} className="text-primary hover:underline">View order</Link> : null}
                  </div>
                  {review.moderationNote ? (
                    <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground"><span className="font-semibold text-foreground">Internal note:</span> {review.moderationNote}</p>
                  ) : null}
                </div>
                <ReviewActions
                  reviewId={review.id}
                  status={review.status}
                  reviewerName={review.reviewerName}
                  moderationNote={review.moderationNote}
                />
              </article>
            ))}
            {!reviews.length ? (
              <div className="flex min-h-48 flex-col items-center justify-center p-8 text-center">
                <MessageSquareText className="size-8 text-muted-foreground" />
                <h3 className="mt-3 font-semibold">{allReviews.length ? "No matching reviews" : "No reviews submitted yet"}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{allReviews.length ? "Try changing the search or filters." : "Verified customer submissions will appear here."}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {resultCount > PAGE_SIZE ? (
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-muted-foreground">Page {page} of {totalPages} · {resultCount} reviews</p>
            <div className="flex gap-2">
              <Button variant="outline" disabled={page === 1} render={page > 1 ? <Link href={{ pathname: "/admin/reviews", query: { ...params, page: String(page - 1) } }} /> : undefined}>Previous</Button>
              <Button variant="outline" disabled={page === totalPages} render={page < totalPages ? <Link href={{ pathname: "/admin/reviews", query: { ...params, page: String(page + 1) } }} /> : undefined}>Next</Button>
            </div>
          </div>
        ) : null}
      </div>
    </AdminShell>
  );
}
