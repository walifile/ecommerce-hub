"use client";

import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow, FormSection } from "@/app/admin/_components/form-row";
import { ImageInput } from "@/app/admin/_components/image-input";
import { UploadButton } from "@/app/admin/_components/upload-button";
import { generateProductContentAction } from "@/app/admin/ai/actions";
import {
  createProductAction,
  updateProductAction,
} from "@/app/admin/products/actions";
import { productSchema, type ProductFormInput } from "@/lib/validations/admin";

export type ProductFormValues = {
  id: string;
  name: string;
  slug: string;
  sku: string;
  category: string;
  costPrice: number;
  price: number;
  comparePrice?: number;
  stockQuantity: number;
  lowStockLimit: number;
  image: string;
  gallery: string[];
  shortDescription: string;
  description: string;
  specifications: string[];
  status: "draft" | "published";
};

const numOrEmpty = (value: number | null | undefined) =>
  value === null || value === undefined ? "" : String(value);

export function ProductForm({
  categories,
  product,
  onSuccess,
}: {
  categories: string[];
  product?: ProductFormValues;
  onSuccess?: () => void;
}) {
  const isEdit = Boolean(product);
  const [pending, startTransition] = useTransition();
  const [generating, startGenerating] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    control,
    formState: { errors },
  } = useForm<ProductFormInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      sku: product?.sku ?? "",
      category: product?.category ?? "",
      costPrice: numOrEmpty(product?.costPrice),
      sellingPrice: numOrEmpty(product?.price),
      comparePrice: numOrEmpty(product?.comparePrice),
      stockQuantity: numOrEmpty(product?.stockQuantity),
      lowStockLimit: numOrEmpty(product?.lowStockLimit),
      imageUrl: product?.image ?? "",
      gallery:
        product?.gallery.filter((url) => url && url !== product.image).join("\n") ??
        "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      specifications: product?.specifications.join("\n") ?? "",
      metaTitle: "",
      metaDescription: "",
      status: product?.status ?? "published",
    },
  });

  function onSubmit(values: ProductFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      if (product) fd.set("id", product.id);
      fd.set("name", values.name);
      fd.set("slug", values.slug);
      fd.set("sku", values.sku);
      fd.set("category", values.category);
      fd.set("costPrice", values.costPrice);
      fd.set("sellingPrice", values.sellingPrice);
      fd.set("comparePrice", values.comparePrice);
      fd.set("stockQuantity", values.stockQuantity);
      fd.set("lowStockLimit", values.lowStockLimit);
      fd.set("imageUrl", values.imageUrl);
      fd.set("gallery", values.gallery);
      fd.set("shortDescription", values.shortDescription);
      fd.set("description", values.description);
      fd.set("specifications", values.specifications);
      fd.set("metaTitle", values.metaTitle);
      fd.set("metaDescription", values.metaDescription);
      fd.set("status", values.status);

      const action = isEdit ? updateProductAction : createProductAction;
      const result = await action({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        if (!isEdit) reset();
        onSuccess?.();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function handleGenerate() {
    const productName = getValues("name").trim();
    if (!productName) {
      toast.error("Enter a product name first.");
      return;
    }
    startGenerating(async () => {
      const result = await generateProductContentAction(
        productName,
        getValues("category").trim()
      );
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      const c = result.content;
      setValue("shortDescription", c.shortDescription, { shouldDirty: true });
      setValue("description", c.longDescription, { shouldDirty: true });
      setValue("specifications", c.specifications.join("\n"), { shouldDirty: true });
      setValue("metaTitle", c.metaTitle, { shouldDirty: true });
      setValue("metaDescription", c.metaDescription, { shouldDirty: true });
      toast.success("AI content generated. Review and save.");
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-7" noValidate>
      <FormSection title="Basics" description="Name, identifiers, and category.">
        <FormRow label="Product name" htmlFor="name" error={errors.name?.message}>
          <Input id="name" placeholder="Wooden Building Blocks Set" {...register("name")} />
        </FormRow>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Slug" htmlFor="slug" hint="Auto-generated if left blank.">
            <Input id="slug" placeholder="wooden-building-blocks" {...register("slug")} />
          </FormRow>
          <FormRow label="SKU" htmlFor="sku" hint="Auto-generated if left blank.">
            <Input id="sku" placeholder="SKU-XXXX" {...register("sku")} />
          </FormRow>
        </div>
        <FormRow label="Category" htmlFor="category">
          <Input id="category" placeholder="Building toys" list="admin-categories" {...register("category")} />
          <datalist id="admin-categories">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormRow>
      </FormSection>

      <FormSection title="Pricing" description="All amounts in store currency.">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormRow label="Cost price" htmlFor="costPrice">
            <Input id="costPrice" type="number" step="0.01" min="0" placeholder="0.00" {...register("costPrice")} />
          </FormRow>
          <FormRow label="Selling price" htmlFor="sellingPrice" error={errors.sellingPrice?.message}>
            <Input id="sellingPrice" type="number" step="0.01" min="0" placeholder="0.00" {...register("sellingPrice")} />
          </FormRow>
          <FormRow label="Compare price" htmlFor="comparePrice" hint="Shown struck-through.">
            <Input id="comparePrice" type="number" step="0.01" min="0" placeholder="0.00" {...register("comparePrice")} />
          </FormRow>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Stock quantity" htmlFor="stockQuantity">
            <Input id="stockQuantity" type="number" min="0" placeholder="0" {...register("stockQuantity")} />
          </FormRow>
          <FormRow label="Low stock limit" htmlFor="lowStockLimit" hint="Alerts when stock drops below this.">
            <Input id="lowStockLimit" type="number" min="0" placeholder="5" {...register("lowStockLimit")} />
          </FormRow>
        </div>
      </FormSection>

      <FormSection title="Content & media" description="What shoppers see on the product page.">
        <FormRow label="Main image" htmlFor="imageUrl" hint="Used as the thumbnail. Upload a file or paste a URL.">
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ImageInput value={field.value} onChange={field.onChange} folder="products" />
            )}
          />
        </FormRow>
        <FormRow
          label="Gallery images"
          htmlFor="gallery"
          hint="Extra photos (different angles), one URL per line — or upload to add."
        >
          <div className="space-y-2">
            <Textarea
              id="gallery"
              placeholder={"https://…/front.jpg\nhttps://…/side.jpg"}
              className="min-h-20"
              {...register("gallery")}
            />
            <UploadButton
              label="Upload &amp; add image"
              onUploaded={(url) => {
                const current = getValues("gallery").trim();
                setValue("gallery", current ? `${current}\n${url}` : url, {
                  shouldDirty: true,
                });
              }}
            />
          </div>
        </FormRow>
        <FormRow label="Short description" htmlFor="shortDescription">
          <Input id="shortDescription" placeholder="One-line tagline" {...register("shortDescription")} />
        </FormRow>
        <FormRow label="Description" htmlFor="description">
          <Textarea id="description" placeholder="Full product description" className="min-h-28" {...register("description")} />
        </FormRow>
        <FormRow label="Specifications" htmlFor="specifications" hint="One per line.">
          <Textarea id="specifications" placeholder={"Material: Beechwood\nAge: 3+"} className="min-h-24" {...register("specifications")} />
        </FormRow>
      </FormSection>

      <FormSection title="SEO & visibility" description="Search metadata and publish state.">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormRow label="Meta title" htmlFor="metaTitle">
            <Input id="metaTitle" placeholder="SEO title" {...register("metaTitle")} />
          </FormRow>
          <FormRow label="Status" htmlFor="status">
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </FormRow>
        </div>
        <FormRow label="Meta description" htmlFor="metaDescription">
          <Textarea id="metaDescription" placeholder="SEO description" className="min-h-20" {...register("metaDescription")} />
        </FormRow>
      </FormSection>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button type="submit" disabled={pending} className="rounded-md">
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving…
            </>
          ) : isEdit ? (
            "Update product"
          ) : (
            "Save product"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          onClick={handleGenerate}
          disabled={generating || pending}
          title="Generate copy and SEO from the product name"
        >
          {generating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <WandSparkles className="size-4" />
              Generate with AI
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
