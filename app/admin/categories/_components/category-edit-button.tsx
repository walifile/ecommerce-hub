"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CategoryForm,
  type CategoryFormValues,
} from "@/app/admin/categories/_components/category-form";
import { cn } from "@/lib/utils";

export function CategoryEditButton({
  category,
  tone = "default",
}: {
  category: CategoryFormValues;
  tone?: "default" | "overlay";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TooltipProvider delay={150}>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label={`Edit ${category.name}`}
                onClick={() => setOpen(true)}
                className={cn(
                  "rounded-md",
                  tone === "overlay"
                    ? "rounded-full border-white/10 bg-black/40 text-white backdrop-blur hover:bg-black/60 hover:text-white"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Pencil className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="overflow-y-auto border-border/70 bg-background data-[side=right]:w-full data-[side=right]:sm:max-w-md"
        >
          <SheetHeader className="border-b border-border/70">
            <SheetTitle>Edit category</SheetTitle>
            <SheetDescription>Update this category’s details.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-8">
            <CategoryForm category={category} onSuccess={() => setOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
