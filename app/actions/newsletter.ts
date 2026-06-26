"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type NewsletterState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function subscribeToNewsletter(
  _prevState: NewsletterState,
  formData: FormData
): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!email || !EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  const supabase = getSupabaseServerClient();

  // No backend configured (e.g. local dev) — accept gracefully so the UI works.
  if (!supabase) {
    return {
      status: "success",
      message: "You're on the list! Your 10% code is on its way.",
    };
  }

  // The project's database.types.ts only declares `Row` per table, so the
  // typed client can't infer the Insert payload — cast to satisfy it.
  const { error } = await supabase
    .from("newsletter_subscribers")
    .insert({ email, source: "footer" } as never);

  if (error) {
    // Unique violation → already subscribed, treat as success.
    if (error.code === "23505") {
      return {
        status: "success",
        message: "You're already subscribed — thanks for sticking with us!",
      };
    }
    console.error("[newsletter] insert failed:", {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
    });
    return {
      status: "error",
      message: "Something went wrong. Please try again in a moment.",
    };
  }

  return {
    status: "success",
    message: "You're in! Check your inbox for 10% off your first order.",
  };
}
