import { getSupabaseServerClient } from "@/lib/supabase/server";

const BUCKET = "app-data";

async function ensureBucket() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: false,
    fileSizeLimit: 2 * 1024 * 1024,
  });
  if (error && !/exist|already/i.test(error.message)) {
    console.error("[compat-storage] bucket setup failed:", error.message);
    return null;
  }
  return supabase;
}

/** Private, durable fallback for data whose migration has not reached an older project yet. */
export async function readCompatJson<T>(path: string, fallback: T): Promise<T> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return fallback;
  const { data, error } = await supabase.storage.from(BUCKET).download(path);
  if (error || !data) return fallback;
  try {
    return JSON.parse(await data.text()) as T;
  } catch {
    return fallback;
  }
}

export async function writeCompatJson<T>(path: string, value: T) {
  const supabase = await ensureBucket();
  if (!supabase) return { ok: false, error: "Private app storage is not configured." };
  const payload = Buffer.from(JSON.stringify(value, null, 2), "utf8");
  const { error } = await supabase.storage.from(BUCKET).upload(path, payload, {
    upsert: true,
    contentType: "application/json; charset=utf-8",
  });
  if (error) {
    console.error("[compat-storage] write failed:", error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
