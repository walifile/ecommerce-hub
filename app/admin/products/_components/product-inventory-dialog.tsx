"use client";

import { useState, useTransition } from "react";
import { Boxes, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { setProductStockAction } from "@/app/admin/products/actions";

export function ProductInventoryDialog({
  id,
  name,
  stockQuantity,
}: {
  id: string;
  name: string;
  stockQuantity: number;
}) {
  const [open, setOpen] = useState(false);
  const [stock, setStock] = useState(String(stockQuantity));
  const [pending, startTransition] = useTransition();

  function save() {
    const formData = new FormData();
    formData.set("id", id);
    formData.set("stockQuantity", stock);
    startTransition(async () => {
      const result = await setProductStockAction(
        { status: "idle", message: "" },
        formData
      );
      if (result.status === "success") {
        toast.success(result.message);
        setOpen(false);
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (nextOpen) setStock(String(stockQuantity));
      }}
    >
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className="rounded-md text-muted-foreground hover:text-foreground"
            aria-label={`Adjust stock for ${name}`}
          />
        }
      >
        <Boxes className="size-4" />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adjust inventory</DialogTitle>
          <DialogDescription>
            Set the available stock quantity for {name}.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor={`stock-${id}`}>Available quantity</Label>
          <Input
            id={`stock-${id}`}
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) => setStock(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                save();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending ? <Loader2 className="size-4 animate-spin" /> : null}
            Save stock
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
