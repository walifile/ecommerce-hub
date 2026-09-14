"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormRow } from "@/app/admin/_components/form-row";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  deleteCustomerAction,
  updateCustomerAction,
} from "@/app/admin/customers/actions";
import { customerSchema, type CustomerFormInput } from "@/lib/validations/admin";

export type CustomerFormValues = CustomerFormInput & { id: string };

export function CustomerActions({
  customer,
  orderCount,
}: {
  customer: CustomerFormValues;
  orderCount: number;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormInput>({
    resolver: zodResolver(customerSchema),
    values: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
    },
  });

  function save(values: CustomerFormInput) {
    const formData = new FormData();
    formData.set("customerId", customer.id);
    for (const [key, value] of Object.entries(values)) formData.set(key, value);
    startTransition(async () => {
      const result = await updateCustomerAction({ status: "idle", message: "" }, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setEditOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("customerId", customer.id);
    startTransition(async () => {
      const result = await deleteCustomerAction({ status: "idle", message: "" }, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        router.push("/admin/customers");
      } else toast.error(result.message);
    });
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button type="button" variant="outline" size="icon-sm" aria-label={`Edit ${customer.name}`} onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" className="text-destructive hover:text-destructive" aria-label={`Delete ${customer.name}`} onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b border-border/70">
            <SheetTitle>Edit customer</SheetTitle>
            <SheetDescription>Update contact and shipping details used by future orders.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit(save)} className="grid gap-4 px-4 pb-8" noValidate>
            <FormRow label="Name" htmlFor={`name-${customer.id}`} error={errors.name?.message}>
              <Input id={`name-${customer.id}`} {...register("name")} />
            </FormRow>
            <FormRow label="Phone" htmlFor={`phone-${customer.id}`} error={errors.phone?.message}>
              <Input id={`phone-${customer.id}`} inputMode="tel" {...register("phone")} />
            </FormRow>
            <FormRow label="Email" htmlFor={`email-${customer.id}`} error={errors.email?.message}>
              <Input id={`email-${customer.id}`} type="email" {...register("email")} />
            </FormRow>
            <FormRow label="Address" htmlFor={`address-${customer.id}`} error={errors.address?.message}>
              <Textarea id={`address-${customer.id}`} className="min-h-24" {...register("address")} />
            </FormRow>
            <FormRow label="City" htmlFor={`city-${customer.id}`} error={errors.city?.message}>
              <Input id={`city-${customer.id}`} {...register("city")} />
            </FormRow>
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save customer
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {customer.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              {orderCount > 0
                ? "This customer has order history and cannot be deleted. Customer data must remain attached to invoices and audit records."
                : "This customer has no orders. Deletion cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending || orderCount > 0} onClick={remove}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
