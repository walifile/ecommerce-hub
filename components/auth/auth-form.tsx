"use client";

import { useActionState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";

const initialState: AuthState = { status: "idle", message: "" };

const inputClass =
  "h-11 border-white/10 bg-black/30 text-white placeholder:text-white/30 focus-visible:border-brand/50 focus-visible:ring-brand/30";

export function AuthForm({
  mode,
  redirectTo,
}: {
  mode: "login" | "signup";
  redirectTo?: string;
}) {
  const [state, formAction, pending] = useActionState(
    mode === "login" ? signInAction : signUpAction,
    initialState
  );

  useEffect(() => {
    if (state.status === "error") toast.error(state.message);
    if (state.status === "success") toast.success(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      {mode === "login" && (
        <input type="hidden" name="redirect" value={redirectTo ?? "/account"} />
      )}

      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-white/70">
            Full name
          </Label>
          <Input
            id="fullName"
            name="fullName"
            placeholder="Jane Doe"
            autoComplete="name"
            required
            disabled={pending}
            className={inputClass}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/70">
          Email
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          disabled={pending}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white/70">
          Password
        </Label>
        <Input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={mode === "signup" ? 6 : undefined}
          required
          disabled={pending}
          className={inputClass}
        />
      </div>

      {state.status === "success" && (
        <p className="rounded-lg border border-brand-3/30 bg-brand-3/10 px-3 py-2 text-sm text-brand-3">
          {state.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={pending}
        className="h-11 w-full rounded-full bg-linear-to-r from-brand to-brand-strong text-sm font-bold text-white shadow-[0_0_24px_color-mix(in_srgb,var(--brand)_28%,transparent)] hover:shadow-[0_0_34px_color-mix(in_srgb,var(--brand)_40%,transparent)] disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Please wait…
          </>
        ) : mode === "login" ? (
          "Sign in"
        ) : (
          "Create account"
        )}
      </Button>
    </form>
  );
}
