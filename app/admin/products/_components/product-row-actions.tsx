"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteProductAction } from "@/app/admin/actions";

export function ProductRowActions({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${id}/edit`}
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border/70 px-2.5 text-[0.8rem] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Pencil className="size-3.5" />
        Edit
      </Link>
      <form
        action={deleteProductAction}
        onSubmit={(e) => {
          if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={id} />
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="rounded-md text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </form>
    </div>
  );
}
