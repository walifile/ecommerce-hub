"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { changePasswordSchema } from "@/lib/validations/admin";

export type AuthState = {
  status: "idle" | "error" | "success";
  message: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Only allow internal redirect targets; null when none was explicitly requested. */
function safeRedirect(value: FormDataEntryValue | null): string | null {
  const path = String(value ?? "").trim();
  if (!path) return null;
  return path.startsWith("/") && !path.startsWith("//") ? path : null;
}

export async function signInAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_RE.test(email) || !password) {
    return { status: "error", message: "Enter a valid email and password." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Authentication is not configured." };
  }

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/", "layout");

  // Resolve the role before honoring redirects so an admin can never be sent
  // to the customer account page. Specific admin deep-links stay intact.
  const explicitRedirect = safeRedirect(formData.get("redirect"));
  let admin = false;
  if (signInData.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .maybeSingle<{ role: string }>();
    admin = profile?.role === "admin";
  }
  if (admin) {
    const adminRedirect =
      explicitRedirect === "/admin" || explicitRedirect?.startsWith("/admin/")
        ? explicitRedirect
        : "/admin";
    redirect(adminRedirect);
  }
  redirect(explicitRedirect === "/account" ? "/" : explicitRedirect ?? "/");
}

export async function signUpAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!fullName) {
    return { status: "error", message: "Please enter your name." };
  }
  if (!EMAIL_RE.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }
  if (password.length < 6) {
    return { status: "error", message: "Password must be at least 6 characters." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Authentication is not configured." };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  // No session = email confirmation is required.
  if (!data.session) {
    return {
      status: "success",
      message: "Account created! Check your email to confirm, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export async function changePasswordAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const parsed = changePasswordSchema.safeParse({
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Check your password details.",
    };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { status: "error", message: "Authentication is not configured." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user?.email) {
    return { status: "error", message: "Sign in again before changing password." };
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.currentPassword,
  });

  if (verifyError) {
    return { status: "error", message: "Current password is incorrect." };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.newPassword,
  });

  if (error) {
    return { status: "error", message: error.message };
  }

  revalidatePath("/admin/settings");
  return { status: "success", message: "Password updated successfully." };
}
