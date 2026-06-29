"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ProductForm } from "@/app/admin/products/_components/product-form";

export function ProductFormSheet({ categories }: { categories: string[] }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm" className="rounded-md">
            <Plus className="size-4" />
            New product
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="overflow-y-auto border-border/70 bg-background data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Create product</SheetTitle>
          <SheetDescription>
            Add a new product, or generate copy and SEO with AI.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8">
          <ProductForm categories={categories} onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
