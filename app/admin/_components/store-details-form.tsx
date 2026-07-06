"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store } from "lucide-react";
import { toast } from "sonner";
import { saveStoreDetailsAction } from "@/app/actions/settings";
import { FormRow } from "@/app/admin/_components/form-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  storeDetailsSchema,
  type StoreDetailsFormInput,
} from "@/lib/validations/admin";
import type { StoreSettings } from "@/lib/ecommerce-data";

export function StoreDetailsForm({ settings }: { settings: StoreSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreDetailsFormInput>({
    resolver: zodResolver(storeDetailsSchema),
    defaultValues: {
      storeName: settings.storeName,
      supportEmail: settings.supportEmail,
      supportPhone: settings.supportPhone,
      heroTitle: settings.heroTitle,
      heroSubtitle: settings.heroSubtitle,
    },
  });

  function onSubmit(values: StoreDetailsFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("storeName", values.storeName);
      fd.set("supportEmail", values.supportEmail);
      fd.set("supportPhone", values.supportPhone);
      fd.set("heroTitle", values.heroTitle);
      fd.set("heroSubtitle", values.heroSubtitle);

      const result = await saveStoreDetailsAction(
        { status: "idle", message: "" },
        fd
      );
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
      <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Store className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Store identity</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Update public brand details, support contact, and storefront hero copy.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <FormRow
          label="Store name"
          htmlFor="storeName"
          error={errors.storeName?.message}
        >
          <Input
            id="storeName"
            placeholder="ToyVerse"
            aria-invalid={Boolean(errors.storeName)}
            {...register("storeName")}
          />
        </FormRow>

        <FormRow
          label="Support email"
          htmlFor="supportEmail"
          error={errors.supportEmail?.message}
        >
          <Input
            id="supportEmail"
            type="email"
            placeholder="support@example.com"
            aria-invalid={Boolean(errors.supportEmail)}
            {...register("supportEmail")}
          />
        </FormRow>

        <FormRow label="Support phone" htmlFor="supportPhone">
          <Input
            id="supportPhone"
            placeholder="+92 300 1234567"
            {...register("supportPhone")}
          />
        </FormRow>

        <FormRow
          label="Hero title"
          htmlFor="heroTitle"
          error={errors.heroTitle?.message}
        >
          <Input
            id="heroTitle"
            placeholder="Toys that spark imagination"
            aria-invalid={Boolean(errors.heroTitle)}
            {...register("heroTitle")}
          />
        </FormRow>

        <FormRow
          label="Hero subtitle"
          htmlFor="heroSubtitle"
          error={errors.heroSubtitle?.message}
          className="lg:col-span-2"
        >
          <Textarea
            id="heroSubtitle"
            placeholder="Short storefront value proposition..."
            className="min-h-28 resize-none"
            aria-invalid={Boolean(errors.heroSubtitle)}
            {...register("heroSubtitle")}
          />
        </FormRow>
      </div>

      <Button type="submit" disabled={pending} className="rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save store settings"
        )}
      </Button>
    </form>
  );
}
