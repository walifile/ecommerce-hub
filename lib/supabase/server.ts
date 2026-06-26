import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/supabase/database.types";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Stateless server-side client for data reads/writes (no user session).
 *
 * Prefers the SERVICE-ROLE key (server-only — never NEXT_PUBLIC), which
 * bypasses RLS so privileged operations (admin dashboard, theme save,
 * catalog writes, settings reads) work once RLS is enabled. Falls back to
 * the anon key when the service-role key isn't set, in which case only
 * RLS-permitted rows (e.g. published products) are visible.
 *
 * SECURITY: this module must only be imported from server code.
 * Returns null when Supabase isn't configured so callers can fall back to mocks.
 */
export function getSupabaseServerClient() {
  const key = SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !key) {
    return null;
  }

  return createClient<Database>(SUPABASE_URL, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Auth-aware server client backed by request cookies. Use this in Server
 * Components, Server Actions, and Route Handlers that need the logged-in user.
 * Returns null when Supabase isn't configured.
 */
export async function createSupabaseServerClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Called from a Server Component — cookies are read-only here.
          // Session refresh is handled by middleware, so this is safe to ignore.
        }
      },
    },
  });
}
