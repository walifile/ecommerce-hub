"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  deleteReviewAction,
  moderateReviewAction,
  type ReviewAdminState,
} from "@/app/admin/reviews/actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const initialState: ReviewAdminState = { status: "idle", message: "" };

export function ReviewActions({
  reviewId,
  status,
  reviewerName,
  moderationNote,
}: {
  reviewId: string;
  status: "pending" | "approved" | "rejected";
  reviewerName: string;
  moderationNote: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [note, setNote] = useState(moderationNote);

  function moderate(nextStatus: "approved" | "rejected") {
    const formData = new FormData();
    formData.set("reviewId", reviewId);
    formData.set("status", nextStatus);
    formData.set("moderationNote", nextStatus === "rejected" ? note : "");
    startTransition(async () => {
      const result = await moderateReviewAction(initialState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setRejectOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("reviewId", reviewId);
    startTransition(async () => {
      const result = await deleteReviewAction(initialState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  return (
    <>
      <div className="flex flex-wrap justify-end gap-2">
        {status !== "approved" ? (
          <Button type="button" size="sm" disabled={pending} onClick={() => moderate("approved")}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve
          </Button>
        ) : null}
        {status !== "rejected" ? (
          <Button type="button" size="sm" variant="outline" disabled={pending} onClick={() => setRejectOpen(true)}>
            <X className="size-4" />
            Reject
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="destructive" disabled={pending} onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
          Delete
        </Button>
      </div>

      <AlertDialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject this review?</AlertDialogTitle>
            <AlertDialogDescription>
              It will be removed from the storefront. Add an internal note so other admins know why.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            maxLength={500}
            placeholder="Moderation note (optional)"
            aria-label="Moderation note"
          />
          <p className="text-right text-xs text-muted-foreground">{note.length}/500</p>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={() => moderate("rejected")}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Reject review
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {reviewerName}&apos;s review?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the review and recalculates the product rating. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={remove}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete permanently
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
