"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { readCompatJson, writeCompatJson } from "@/lib/compat-storage";

export type ContactState = {
  status: "idle" | "success" | "error";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactMessage(
  _prevState: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const orderNumber = String(formData.get("orderNumber") ?? "").trim();

  if (!name) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Please enter a valid email address." };
  }
  if (!subject) {
    return { status: "error", message: "Please add a subject." };
  }
  if (message.length < 10) {
    return { status: "error", message: "Please add a more detailed message." };
  }
  if (name.length > 100 || subject.length > 200 || message.length > 5000 || orderNumber.length > 80) {
    return { status: "error", message: "One or more fields are too long." };
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return {
      status: "error",
      message: "Contact support is temporarily unavailable. Please try again later.",
    };
  }

  const { error } = await supabase
    .from("contact_messages" as never)
    .insert(
      {
        name,
        email,
        subject,
        message,
        order_number: orderNumber || null,
        source: "contact-page",
      } as never
    );

  if (error) {
    if (error.code === "PGRST205" || /contact_messages.*schema cache/i.test(error.message)) {
      const path = "support/contact-messages.json";
      const messages = await readCompatJson<Array<Record<string, unknown>>>(path, []);
      const saved = await writeCompatJson(path, [
        ...messages,
        {
          id: crypto.randomUUID(),
          name,
          email,
          subject,
          message,
          orderNumber: orderNumber || null,
          status: "new",
          createdAt: new Date().toISOString(),
        },
      ]);
      if (saved.ok) {
        return {
          status: "success",
          message: "Message sent. We’ll get back to you as soon as possible.",
        };
      }
    }
    console.error("[contact] insert failed:", {
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
    message: "Message sent. We’ll get back to you as soon as possible.",
  };
}
