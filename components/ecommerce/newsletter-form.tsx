"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  subscribeToNewsletter,
  type NewsletterState,
} from "@/app/actions/newsletter";

const initialState: NewsletterState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(
    subscribeToNewsletter,
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

  const success = state.status === "success";

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <Input
        type="email"
        name="email"
        required
        disabled={pending}
        placeholder="Email address"
        aria-label="Email address"
        aria-invalid={state.status === "error"}
        className="h-12 rounded-full border-white/10 bg-black/30 px-5 text-white placeholder:text-white/30 focus-visible:ring-brand/40"
      />
      <Button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-full bg-linear-to-r from-brand to-brand-strong text-sm font-bold text-white shadow-[0_0_24px_color-mix(in_srgb,var(--brand)_24%,transparent)] transition-transform hover:-translate-y-px hover:shadow-[0_0_34px_color-mix(in_srgb,var(--brand)_34%,transparent)] disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Signing you up…
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="size-4" />
            You&apos;re subscribed
          </>
        ) : (
          <>
            Claim my 10% off
            <ArrowUpRight className="size-4" />
          </>
        )}
      </Button>

      <p
        aria-live="polite"
        className={`text-center text-xs ${
          state.status === "error"
            ? "text-red-400"
            : state.status === "success"
              ? "text-brand-3"
              : "text-white/35"
        }`}
      >
        {state.message || "No spam — just the good stuff. Unsubscribe anytime."}
      </p>
    </form>
  );
}
