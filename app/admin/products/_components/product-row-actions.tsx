"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Copy, Eye, EyeOff, Loader2, Pencil, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deleteProductAction,
  duplicateProductAction,
  toggleProductStatusAction,
} from "@/app/admin/products/actions";
import { ProductInventoryDialog } from "@/app/admin/products/_components/product-inventory-dialog";
import { cn } from "@/lib/utils";

export function ProductRowActions({
  id,
  name,
  slug,
  status,
  stockQuantity,
}: {
  id: string;
  name: string;
  slug?: string;
  status: "published" | "draft";
  stockQuantity: number;
}) {
  const [pending, startTransition] = useTransition();

  function runAction(
    action: typeof deleteProductAction | typeof duplicateProductAction | typeof toggleProductStatusAction,
    values?: Record<string, string>
  ) {
    const formData = new FormData();
    formData.set("id", id);
    for (const [key, value] of Object.entries(values ?? {})) formData.set(key, value);
    startTransition(async () => {
      const result = await action({ status: "idle", message: "" }, formData);
      if (result.status === "success") toast.success(result.message);
      else toast.error(result.message);
    });
  }

  return (
    <TooltipProvider delay={150}>
      <div className="flex items-center justify-end gap-1.5">
        {slug && status === "published" ? (
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

        <ProductInventoryDialog
          id={id}
          name={name}
          stockQuantity={stockQuantity}
        />

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending}
                aria-label={status === "published" ? `Move ${name} to draft` : `Publish ${name}`}
                className="rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => runAction(toggleProductStatusAction, {
                  status: status === "published" ? "draft" : "published",
                })}
              >
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : status === "published" ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            }
          />
          <TooltipContent>{status === "published" ? "Move to draft" : "Publish"}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending}
                aria-label={`Duplicate ${name}`}
                className="rounded-md text-muted-foreground hover:text-foreground"
                onClick={() => runAction(duplicateProductAction)}
              >
                <Copy className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Duplicate as draft</TooltipContent>
        </Tooltip>

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

        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                disabled={pending}
                aria-label={`Delete ${name}`}
                className="rounded-md text-destructive hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (window.confirm(`Delete “${name}”? This cannot be undone.`)) {
                    runAction(deleteProductAction);
                  }
                }}
              >
                <Trash2 className="size-4" />
              </Button>
            }
          />
          <TooltipContent>Delete</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
