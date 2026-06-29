"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteCategoryAction } from "@/app/admin/categories/actions";
import { cn } from "@/lib/utils";

export function CategoryDeleteButton({
  id,
  name,
  productCount,
  tone = "default",
}: {
  id: string;
  name: string;
  productCount: number;
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
                aria-label={`Delete ${name}`}
                onClick={() => setOpen(true)}
                className={cn(
                  "rounded-md",
                  tone === "overlay"
                    ? "rounded-full border-white/10 bg-black/40 text-white backdrop-blur hover:border-destructive/40 hover:bg-destructive/20 hover:text-white"
                    : "text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                )}
              >
                <Trash2 className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {productCount > 0 ? (
                <>
                  Is category mein{" "}
                  <span className="font-medium text-foreground">
                    {productCount} product{productCount === 1 ? "" : "s"}
                  </span>{" "}
                  hain jo uncategorized ho jayenge. Yeh action undo nahi ho sakta.
                </>
              ) : (
                "Yeh action undo nahi ho sakta."
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <form
              action={deleteCategoryAction}
              onSubmit={() => setOpen(false)}
            >
              <input type="hidden" name="categoryId" value={id} />
              <Button type="submit" variant="destructive" className="w-full">
                Delete
              </Button>
            </form>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
