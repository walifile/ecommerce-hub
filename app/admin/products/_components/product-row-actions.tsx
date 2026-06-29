"use client";

import Link from "next/link";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { deleteProductAction } from "@/app/admin/products/actions";
import { cn } from "@/lib/utils";

export function ProductRowActions({
  id,
  name,
  slug,
}: {
  id: string;
  name: string;
  slug?: string;
}) {
  return (
    <TooltipProvider delay={150}>
      <div className="flex items-center justify-end gap-1.5">
        {slug ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href={`/products/${slug}`}
                  target="_blank"
                  aria-label={`View ${name}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "icon-sm" }),
                    "rounded-md text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Eye className="size-4" />
                </Link>
              }
            />
            <TooltipContent>View</TooltipContent>
          </Tooltip>
        ) : null}

        <Tooltip>
          <TooltipTrigger
            render={
              <Link
                href={`/admin/products/${id}/edit`}
                aria-label={`Edit ${name}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "icon-sm" }),
                  "rounded-md text-muted-foreground hover:text-foreground"
                )}
              >
                <Pencil className="size-4" />
              </Link>
            }
          />
          <TooltipContent>Edit</TooltipContent>
        </Tooltip>

        <form
          action={deleteProductAction}
          onSubmit={(e) => {
            if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) {
              e.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={id} />
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  type="submit"
                  variant="outline"
                  size="icon-sm"
                  aria-label={`Delete ${name}`}
                  className="rounded-md text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" />
                </Button>
              }
            />
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        </form>
      </div>
    </TooltipProvider>
  );
}
