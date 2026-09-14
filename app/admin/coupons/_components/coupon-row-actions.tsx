"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Power, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  deleteCouponAction,
  toggleCouponAction,
} from "@/app/admin/coupons/actions";
import {
  CouponForm,
  type CouponFormValues,
} from "@/app/admin/coupons/_components/coupon-form";

export function CouponRowActions({
  coupon,
  hasHistory,
}: {
  coupon: CouponFormValues;
  hasHistory: boolean;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function runAction(
    action: typeof toggleCouponAction | typeof deleteCouponAction,
    values: Record<string, string>,
    closeDelete = false
  ) {
    const formData = new FormData();
    formData.set("couponId", coupon.id);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    startTransition(async () => {
      const result = await action({ status: "idle", message: "" }, formData);
      if (result.status === "success") {
        toast.success(result.message);
        if (closeDelete) setDeleteOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          disabled={pending}
          className="rounded-full"
          aria-label={coupon.active ? "Pause coupon" : "Activate coupon"}
          onClick={() => runAction(toggleCouponAction, { active: String(!coupon.active) })}
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Power className="size-4" />}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-full"
          aria-label={`Edit ${coupon.code}`}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          className="rounded-full text-destructive hover:text-destructive"
          aria-label={`Delete ${coupon.code}`}
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-xl">
          <SheetHeader className="border-b border-border/70">
            <SheetTitle>Edit {coupon.code}</SheetTitle>
            <SheetDescription>Update discount, schedule, limit, and availability.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <CouponForm coupon={coupon} onSuccess={() => setEditOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {coupon.code}?</AlertDialogTitle>
            <AlertDialogDescription>
              {hasHistory
                ? "This coupon has usage history and must be paused instead of deleted."
                : "Only unused coupons can be deleted. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={pending || hasHistory}
              onClick={() => runAction(deleteCouponAction, {}, true)}
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
