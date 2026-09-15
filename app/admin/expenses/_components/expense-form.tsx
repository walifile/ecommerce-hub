"use client";

import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormRow } from "@/app/admin/_components/form-row";
import { createExpenseAction } from "@/app/admin/expenses/actions";
import { expenseSchema, type ExpenseFormInput } from "@/lib/validations/admin";

export function ExpenseForm() {
  const [pending, startTransition] = useTransition();
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ExpenseFormInput>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      expenseType: "advertising",
      amount: "",
      date: "",
    },
  });

  function onSubmit(values: ExpenseFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("title", values.title);
      fd.set("expenseType", values.expenseType);
      fd.set("amount", values.amount);
      fd.set("date", values.date);
      fd.set("idempotencyKey", idempotencyKey);

      const result = await createExpenseAction({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        reset();
        setIdempotencyKey(crypto.randomUUID());
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormRow label="Title" htmlFor="title" error={errors.title?.message}>
        <Input id="title" maxLength={120} placeholder="Facebook ads" {...register("title")} />
      </FormRow>
      <FormRow label="Type" htmlFor="expenseType">
        <Controller
          control={control}
          name="expenseType"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="expenseType" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="advertising">Advertising</SelectItem>
                <SelectItem value="shipping">Shipping</SelectItem>
                <SelectItem value="salary">Salary</SelectItem>
                <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FormRow>
      <FormRow label="Amount" htmlFor="amount" error={errors.amount?.message}>
        <Input
          id="amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          {...register("amount")}
        />
      </FormRow>
      <FormRow label="Date" htmlFor="date" hint="Defaults to today if left empty." error={errors.date?.message}>
        <Input id="date" type="date" max={new Date().toISOString().slice(0, 10)} {...register("date")} />
      </FormRow>
      <Button type="submit" disabled={pending} className="rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save expense"
        )}
      </Button>
    </form>
  );
}
