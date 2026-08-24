import { AdminShell } from "@/app/admin/_components/admin-shell";
import { deleteReviewAction, moderateReviewAction } from "@/app/admin/reviews/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listAllProductReviews } from "@/lib/review-store";

export default async function AdminReviewsPage() {
  const reviews = await listAllProductReviews();
  return (
    <AdminShell title="Reviews" description="Approve customer feedback before it appears on product pages.">
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="py-0"><CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{review.status}</Badge>
                  <span className="text-sm font-semibold">{review.rating}/5 · {review.productName}</span>
                </div>
                <h2 className="mt-3 font-semibold">{review.title || "Customer review"}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">{review.reviewerName} · {review.reviewerEmail || "No email"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action={moderateReviewAction}><input type="hidden" name="reviewId" value={review.id} /><input type="hidden" name="status" value="approved" /><Button size="sm">Approve</Button></form>
                <form action={moderateReviewAction}><input type="hidden" name="reviewId" value={review.id} /><input type="hidden" name="status" value="rejected" /><Button size="sm" variant="outline">Reject</Button></form>
                <form action={deleteReviewAction}><input type="hidden" name="reviewId" value={review.id} /><Button size="sm" variant="destructive">Delete</Button></form>
              </div>
            </div>
          </CardContent></Card>
        ))}
        {!reviews.length ? <p className="text-sm text-muted-foreground">No reviews submitted yet.</p> : null}
      </div>
    </AdminShell>
  );
}
