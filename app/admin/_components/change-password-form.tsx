"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { changePasswordAction } from "@/app/actions/auth";
import { FormRow } from "@/app/admin/_components/form-row";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  changePasswordSchema,
  type ChangePasswordFormInput,
} from "@/lib/validations/admin";

export function ChangePasswordForm() {
  const [pending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordFormInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: ChangePasswordFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("currentPassword", values.currentPassword);
      fd.set("newPassword", values.newPassword);
      fd.set("confirmPassword", values.confirmPassword);

      const result = await changePasswordAction({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        reset();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="flex gap-3 rounded-xl border border-border/70 bg-muted/40 p-4">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <KeyRound className="size-5" />
        </div>
        <div>
          <p className="font-semibold text-foreground">Admin account security</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Use a strong password with uppercase, lowercase, and numbers.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <FormRow
          label="Current password"
          htmlFor="currentPassword"
          error={errors.currentPassword?.message}
        >
          <Input
            id="currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(errors.currentPassword)}
            {...register("currentPassword")}
          />
        </FormRow>

        <FormRow
          label="New password"
          htmlFor="newPassword"
          error={errors.newPassword?.message}
        >
          <Input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.newPassword)}
            {...register("newPassword")}
          />
        </FormRow>

        <FormRow
          label="Confirm password"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={Boolean(errors.confirmPassword)}
            {...register("confirmPassword")}
          />
        </FormRow>
      </div>

      <Button type="submit" disabled={pending} className="rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Change password"
        )}
      </Button>
    </form>
  );
}
