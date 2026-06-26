import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type Profile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: string;
};

/** The logged-in Supabase auth user, or null. */
export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** The logged-in user's profile (with role), or null when signed out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", user.id)
    .maybeSingle<Database["public"]["Tables"]["profiles"]["Row"]>();

  if (!data) {
    // Trigger may not have created a row yet — fall back to auth basics.
    return {
      id: user.id,
      email: user.email ?? null,
      fullName: (user.user_metadata?.full_name as string | undefined) ?? null,
      role: "customer",
    };
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    role: data.role,
  };
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}
