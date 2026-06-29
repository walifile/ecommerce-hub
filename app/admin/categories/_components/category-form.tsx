"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/app/admin/_components/form-row";
import { ImageInput } from "@/app/admin/_components/image-input";
import { uploadImageAction } from "@/app/admin/actions";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/actions";
import { categorySchema, type CategoryFormInput } from "@/lib/validations/admin";

export type CategoryFormValues = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
};

export function CategoryForm({
  category,
  onSuccess,
}: {
  category?: CategoryFormValues;
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(category);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      imageUrl: category?.image ?? "",
    },
  });

  function onSubmit(values: CategoryFormInput) {
    startTransition(async () => {
      let imageUrl = values.imageUrl;

      // Upload the pending local file first (if any)
      if (pendingFile) {
        const fd = new FormData();
        fd.set("file", pendingFile);
        fd.set("folder", "categories");
        const uploadResult = await uploadImageAction(fd);
        if (uploadResult.status !== "success") {
          toast.error(uploadResult.message);
          return;
        }
        imageUrl = uploadResult.url;
        setPendingFile(null);
      }

      const fd = new FormData();
      if (category) fd.set("id", category.id);
      fd.set("name", values.name);
      fd.set("slug", values.slug);
      fd.set("description", values.description);
      fd.set("imageUrl", imageUrl);

      const action = isEdit ? updateCategoryAction : createCategoryAction;
      const result = await action({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        if (!isEdit) {
          reset();
          setPendingFile(null);
        }
        router.refresh();
        onSuccess?.();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormRow label="Name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Die-cast Cars" {...register("name")} />
        </FormRow>
        <FormRow label="Slug" htmlFor="slug" hint="Auto-generated if left blank.">
          <Input id="slug" placeholder="die-cast-cars" {...register("slug")} />
        </FormRow>
      </div>

      <FormRow label="Cover image" htmlFor="imageUrl" hint="Optional. Upload a file or paste a URL.">
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <ImageInput
              value={field.value}
              onChange={field.onChange}
              onFileSelect={setPendingFile}
            />
          )}
        />
      </FormRow>

      <FormRow label="Description" htmlFor="description">
        <Textarea
          id="description"
          placeholder="Short description of this category"
          className="min-h-20"
          {...register("description")}
        />
      </FormRow>

      <Button type="submit" disabled={pending} className="w-fit rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : isEdit ? (
          "Update category"
        ) : (
          "Create category"
        )}
      </Button>
    </form>
  );
}
