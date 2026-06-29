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
import { CategoryForm } from "@/app/admin/categories/_components/category-form";

export function CategoryFormSheet() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button size="sm" className="rounded-md">
            <Plus className="size-4" />
            New category
          </Button>
        }
      />
      <SheetContent
        side="right"
        className="overflow-y-auto border-border/70 bg-background data-[side=right]:w-full data-[side=right]:sm:max-w-md"
      >
        <SheetHeader className="border-b border-border/70">
          <SheetTitle>Add category</SheetTitle>
          <SheetDescription>
            Group products so shoppers can browse and filter the catalog.
          </SheetDescription>
        </SheetHeader>
        <div className="px-4 pb-8">
          <CategoryForm onSuccess={() => setOpen(false)} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
