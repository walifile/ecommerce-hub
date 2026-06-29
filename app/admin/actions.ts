"use server";

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type UploadState =
  | { status: "success"; url: string }
  | { status: "error"; message: string };

const NOT_CONFIGURED =
  "Database write is not configured. Set SUPABASE_SERVICE_ROLE_KEY in the server environment.";

const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export async function uploadImageAction(formData: FormData): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { status: "error", message: "No file selected." };
  if (!file.type.startsWith("image/"))
    return { status: "error", message: "Please choose an image file." };
  if (file.size > MAX_IMAGE_BYTES)
    return { status: "error", message: "Image must be under 8 MB." };

  const supabase = getSupabaseServerClient();
  if (!supabase) return { status: "error", message: NOT_CONFIGURED };

  const { error: bucketError } = await supabase.storage.createBucket(IMAGE_BUCKET, { public: true });
  if (
    bucketError &&
    !/exist/i.test(bucketError.message) &&
    !("statusCode" in bucketError && bucketError.statusCode === "409")
  ) {
    console.error("[admin] createBucket failed:", bucketError.message);
  }

  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const folder = String(formData.get("folder") ?? "misc").replace(/[^a-z0-9-]/g, "") || "misc";
  const path = `${folder}/${crypto.randomUUID()}.${ext || "jpg"}`;

  const { error } = await supabase.storage
    .from(IMAGE_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("[admin] uploadImage failed:", error.message);
    return { status: "error", message: "Upload failed. Please try again." };
  }

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path);
  return { status: "success", url: data.publicUrl };
}
