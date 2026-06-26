"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import {
  saveBannerAction,
  type BannerActionState,
} from "@/app/actions/banner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { StoreBanner } from "@/lib/ecommerce-data";

const initialState: BannerActionState = { status: "idle", message: "" };

export function BannerForm({ banner }: { banner: StoreBanner }) {
  const [state, formAction, pending] = useActionState(
    saveBannerAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-2xl border border-border/70 bg-muted/40 p-4">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Megaphone className="size-5" />
          </div>
          <div>
            <Label
              htmlFor="announcementEnabled"
              className="text-base font-semibold text-foreground"
            >
              Show top website banner
            </Label>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Publish a compact announcement above the storefront navigation.
            </p>
          </div>
        </div>
        <input
          id="announcementEnabled"
          name="announcementEnabled"
          type="checkbox"
          defaultChecked={banner.announcementEnabled}
          className="mt-1 size-5 rounded border-border accent-primary"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-2">
          <Label htmlFor="announcementMessage">Banner message</Label>
          <Textarea
            id="announcementMessage"
            name="announcementMessage"
            defaultValue={banner.announcementMessage}
            placeholder="Limited drops are live. Free delivery on orders over Rs. 5,000."
            className="min-h-28 resize-none"
          />
        </div>

        <div className="grid gap-5">
          <div className="space-y-2">
            <Label htmlFor="announcementLinkText">CTA text</Label>
            <Input
              id="announcementLinkText"
              name="announcementLinkText"
              defaultValue={banner.announcementLinkText}
              placeholder="Shop now"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="announcementLinkHref">CTA link</Label>
            <Input
              id="announcementLinkHref"
              name="announcementLinkHref"
              defaultValue={banner.announcementLinkHref}
              placeholder="/shop"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save banner"
        )}
      </Button>
    </form>
  );
}
