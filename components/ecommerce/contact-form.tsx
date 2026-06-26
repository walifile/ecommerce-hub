"use client";

import { useActionState, useEffect, useRef } from "react";
import { ArrowUpRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  sendContactMessage,
  type ContactState,
} from "@/app/actions/contact";

const initialState: ContactState = { status: "idle", message: "" };

export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    sendContactMessage,
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
    <form ref={formRef} action={formAction} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="name"
          required
          disabled={pending}
          placeholder="Your name"
          aria-label="Your name"
          className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
        />
        <Input
          type="email"
          name="email"
          required
          disabled={pending}
          placeholder="Email address"
          aria-label="Email address"
          className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
        />
      </div>

      <Input
        name="subject"
        required
        disabled={pending}
        placeholder="Subject"
        aria-label="Subject"
        className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
      />

      <Input
        name="orderNumber"
        disabled={pending}
        placeholder="Order number (optional)"
        aria-label="Order number"
        className="h-12 rounded-full border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
      />

      <Textarea
        name="message"
        required
        disabled={pending}
        placeholder="Message"
        aria-label="Message"
        className="min-h-44 rounded-[24px] border-white/10 bg-black/30 text-white placeholder:text-white/25 focus-visible:ring-[#f97316]/40"
      />

      <Button
        type="submit"
        disabled={pending}
        className="h-12 rounded-full bg-linear-to-r from-[#f97316] to-[#ea580c] text-white shadow-[0_0_22px_rgba(249,115,22,0.24)] disabled:opacity-70"
      >
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Sending...
          </>
        ) : success ? (
          <>
            <CheckCircle2 className="size-4" />
            Message sent
          </>
        ) : (
          <>
            Send message
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
              ? "text-[#86efac]"
              : "text-white/35"
        }`}
      >
        {state.message || "We’ll reply as soon as possible."}
      </p>
    </form>
  );
}
