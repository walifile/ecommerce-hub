"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { saveBannerAction } from "@/app/actions/banner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/app/admin/_components/form-row";
import { bannerSchema, type BannerFormInput } from "@/lib/validations/admin";
import type { StoreBanner } from "@/lib/ecommerce-data";

export function BannerForm({ banner }: { banner: StoreBanner }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<BannerFormInput>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      announcementEnabled: banner.announcementEnabled,
      announcementMessage: banner.announcementMessage,
      announcementLinkText: banner.announcementLinkText,
      announcementLinkHref: banner.announcementLinkHref,
    },
  });

  function onSubmit(values: BannerFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      if (values.announcementEnabled) fd.set("announcementEnabled", "on");
      fd.set("announcementMessage", values.announcementMessage);
      fd.set("announcementLinkText", values.announcementLinkText);
      fd.set("announcementLinkHref", values.announcementLinkHref);

      const result = await saveBannerAction({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="flex items-start justify-between gap-4 rounded-xl border border-border/70 bg-muted/40 p-4">
        <div className="flex gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
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
        <Controller
          control={control}
          name="announcementEnabled"
          render={({ field }) => (
            <Checkbox
              id="announcementEnabled"
              className="mt-1 size-5"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
        <FormRow
          label="Banner message"
          htmlFor="announcementMessage"
          error={errors.announcementMessage?.message}
        >
          <Textarea
            id="announcementMessage"
            placeholder="Limited drops are live. Free delivery on orders over Rs. 5,000."
            className="min-h-28 resize-none"
            {...register("announcementMessage")}
          />
        </FormRow>

        <div className="grid gap-5">
          <FormRow label="CTA text" htmlFor="announcementLinkText">
            <Input
              id="announcementLinkText"
              placeholder="Shop now"
              {...register("announcementLinkText")}
            />
          </FormRow>
          <FormRow label="CTA link" htmlFor="announcementLinkHref">
            <Input
              id="announcementLinkHref"
              placeholder="/shop"
              {...register("announcementLinkHref")}
            />
          </FormRow>
        </div>
      </div>

      <Button type="submit" disabled={pending} className="rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save banner"
        )}
      </Button>
    </form>
  );
}
