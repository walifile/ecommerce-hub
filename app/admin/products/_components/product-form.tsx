"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import {
  createProductAction,
  generateProductContentAction,
  updateProductAction,
  type AdminActionState,
} from "@/app/admin/actions";

const initialState: AdminActionState = { status: "idle", message: "" };

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
  shortDescription: string;
  description: string;
  specifications: string[];
  status: "draft" | "published";
};

export function ProductForm({
  categories,
  product,
}: {
  categories: string[];
  product?: ProductFormValues;
}) {
  const isEdit = Boolean(product);
  const [state, formAction, pending] = useActionState(
    isEdit ? updateProductAction : createProductAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [generating, startGenerating] = useTransition();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      if (!isEdit) formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, isEdit]);

  function setField(name: string, value: string) {
    const el = formRef.current?.elements.namedItem(name) as
      | HTMLInputElement
      | HTMLTextAreaElement
      | null;
    if (el) el.value = value;
  }

  function handleGenerate() {
    const form = formRef.current;
    if (!form) return;
    const productName =
      (form.elements.namedItem("name") as HTMLInputElement | null)?.value.trim() ??
      "";
    const category =
      (form.elements.namedItem("category") as HTMLInputElement | null)?.value.trim() ??
      "";

    if (!productName) {
      toast.error("Enter a product name first.");
      return;
    }

    startGenerating(async () => {
      const result = await generateProductContentAction(productName, category);
      if (result.status === "error") {
        toast.error(result.message);
        return;
      }
      const c = result.content;
      setField("shortDescription", c.shortDescription);
      setField("description", c.longDescription);
      setField("specifications", c.specifications.join("\n"));
      setField("metaTitle", c.metaTitle);
      setField("metaDescription", c.metaDescription);
      toast.success("AI content generated. Review and save.");
    });
  }

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      {isEdit && <input type="hidden" name="id" value={product!.id} />}

      <Input name="name" placeholder="Product name" required defaultValue={product?.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="slug" placeholder="Slug (auto if blank)" defaultValue={product?.slug} />
        <Input name="sku" placeholder="SKU (auto if blank)" defaultValue={product?.sku} />
      </div>
      <Input
        name="category"
        placeholder="Category"
        list="admin-categories"
        defaultValue={product?.category}
      />
      <datalist id="admin-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="costPrice" type="number" step="0.01" min="0" placeholder="Cost price" defaultValue={product?.costPrice} />
        <Input name="sellingPrice" type="number" step="0.01" min="0" placeholder="Selling price" required defaultValue={product?.price} />
        <Input name="comparePrice" type="number" step="0.01" min="0" placeholder="Compare price" defaultValue={product?.comparePrice} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="stockQuantity" type="number" min="0" placeholder="Stock quantity" defaultValue={product?.stockQuantity} />
        <Input name="lowStockLimit" type="number" min="0" placeholder="Low stock limit" defaultValue={product?.lowStockLimit} />
      </div>
      <Input name="imageUrl" placeholder="Image URL" defaultValue={product?.image} />
      <Input name="shortDescription" placeholder="Short description" defaultValue={product?.shortDescription} />
      <Textarea name="description" placeholder="Description" className="min-h-28" defaultValue={product?.description} />
      <Textarea
        name="specifications"
        placeholder="Specifications, one per line"
        className="min-h-24"
        defaultValue={product?.specifications.join("\n")}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="metaTitle" placeholder="Meta title" />
        <NativeSelect
          name="status"
          defaultValue={product?.status ?? "published"}
          className="w-full"
        >
          <NativeSelectOption value="published">Published</NativeSelectOption>
          <NativeSelectOption value="draft">Draft</NativeSelectOption>
        </NativeSelect>
      </div>
      <Textarea name="metaDescription" placeholder="Meta description" className="min-h-20" />
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
