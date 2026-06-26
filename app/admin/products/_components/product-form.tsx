"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createProductAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = { status: "idle", message: "" };

export function ProductForm({ categories }: { categories: string[] }) {
  const [state, formAction, pending] = useActionState(
    createProductAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <Input name="name" placeholder="Product name" required />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="slug" placeholder="Slug (auto if blank)" />
        <Input name="sku" placeholder="SKU (auto if blank)" />
      </div>
      <Input name="category" placeholder="Category" list="admin-categories" />
      <datalist id="admin-categories">
        {categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input name="costPrice" type="number" step="0.01" min="0" placeholder="Cost price" />
        <Input name="sellingPrice" type="number" step="0.01" min="0" placeholder="Selling price" required />
        <Input name="comparePrice" type="number" step="0.01" min="0" placeholder="Compare price" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="stockQuantity" type="number" min="0" placeholder="Stock quantity" />
        <Input name="lowStockLimit" type="number" min="0" placeholder="Low stock limit" />
      </div>
      <Input name="imageUrl" placeholder="Image URL" />
      <Input name="shortDescription" placeholder="Short description" />
      <Textarea name="description" placeholder="Description" className="min-h-28" />
      <Textarea
        name="specifications"
        placeholder="Specifications, one per line"
        className="min-h-24"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input name="metaTitle" placeholder="Meta title" />
        <NativeSelect name="status" defaultValue="published" className="w-full">
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
          ) : (
            "Save product"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-md"
          disabled
          title="AI generation coming soon"
        >
          <WandSparkles className="size-4" />
          Generate with AI
        </Button>
      </div>
    </form>
  );
}
