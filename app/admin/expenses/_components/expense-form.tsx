"use client";

import { useActionState, useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { createExpenseAction, type AdminActionState } from "@/app/admin/actions";

const initialState: AdminActionState = { status: "idle", message: "" };

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(
    createExpenseAction,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      formRef.current?.reset();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4">
      <Input name="title" placeholder="Title" required />
      <NativeSelect name="expenseType" defaultValue="advertising" className="w-full">
        <NativeSelectOption value="advertising">Advertising</NativeSelectOption>
        <NativeSelectOption value="shipping">Shipping</NativeSelectOption>
        <NativeSelectOption value="salary">Salary</NativeSelectOption>
        <NativeSelectOption value="miscellaneous">Miscellaneous</NativeSelectOption>
      </NativeSelect>
      <Input name="amount" type="number" step="0.01" min="0" placeholder="Amount" required />
      <Input name="date" type="date" />
      <Button type="submit" disabled={pending}>
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
