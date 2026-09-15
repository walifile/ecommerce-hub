"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteExpenseAction, updateExpenseAction } from "@/app/admin/expenses/actions";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { expenseSchema, type ExpenseFormInput } from "@/lib/validations/admin";

const initialState = { status: "idle" as const, message: "" };

export function ExpenseRowActions({ expense }: {
  expense: {
    id: string;
    title: string;
    expenseType: "advertising" | "shipping" | "salary" | "miscellaneous";
    amount: number;
    date: string;
  };
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const { register, control, handleSubmit, formState: { errors } } = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseSchema),
    values: {
      title: expense.title,
      expenseType: expense.expenseType,
      amount: String(expense.amount),
      date: expense.date,
    },
  });

  function save(values: ExpenseFormInput) {
    const formData = new FormData();
    formData.set("expenseId", expense.id);
    formData.set("title", values.title);
    formData.set("expenseType", values.expenseType);
    formData.set("amount", values.amount);
    formData.set("date", values.date);
    startTransition(async () => {
      const result = await updateExpenseAction(initialState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setEditOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  function remove() {
    const formData = new FormData();
    formData.set("expenseId", expense.id);
    startTransition(async () => {
      const result = await deleteExpenseAction(initialState, formData);
      if (result.status === "success") {
        toast.success(result.message);
        setDeleteOpen(false);
        router.refresh();
      } else toast.error(result.message);
    });
  }

  return (
    <>
      <div className="flex justify-end gap-1.5">
        <Button type="button" variant="outline" size="icon-sm" aria-label={`Edit ${expense.title}`} onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" className="text-destructive hover:text-destructive" aria-label={`Delete ${expense.title}`} onClick={() => setDeleteOpen(true)}>
          <Trash2 className="size-4" />
        </Button>
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="overflow-y-auto data-[side=right]:w-full data-[side=right]:sm:max-w-lg">
          <SheetHeader className="border-b border-border/70">
            <SheetTitle>Edit expense</SheetTitle>
            <SheetDescription>Changes immediately update profit and dashboard reports.</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit(save)} className="grid gap-4 px-4 pb-8" noValidate>
            <FormRow label="Title" htmlFor={`expense-title-${expense.id}`} error={errors.title?.message}>
              <Input id={`expense-title-${expense.id}`} maxLength={120} {...register("title")} />
            </FormRow>
            <FormRow label="Type" htmlFor={`expense-type-${expense.id}`} error={errors.expenseType?.message}>
              <Controller control={control} name="expenseType" render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id={`expense-type-${expense.id}`} className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advertising">Advertising</SelectItem>
                    <SelectItem value="shipping">Shipping</SelectItem>
                    <SelectItem value="salary">Salary</SelectItem>
                    <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                  </SelectContent>
                </Select>
              )} />
            </FormRow>
            <FormRow label="Amount" htmlFor={`expense-amount-${expense.id}`} error={errors.amount?.message}>
              <Input id={`expense-amount-${expense.id}`} type="number" min="0.01" step="0.01" {...register("amount")} />
            </FormRow>
            <FormRow label="Date" htmlFor={`expense-date-${expense.id}`} error={errors.date?.message}>
              <Input id={`expense-date-${expense.id}`} type="date" max={new Date().toISOString().slice(0, 10)} {...register("date")} />
            </FormRow>
            <Button type="submit" disabled={pending} className="w-fit">
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Save expense
            </Button>
          </form>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {expense.title}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes {expense.amount.toLocaleString("en-US", { style: "currency", currency: "USD" })} from the expense log and recalculates profit reports.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <Button type="button" variant="destructive" disabled={pending} onClick={remove}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              Delete expense
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
