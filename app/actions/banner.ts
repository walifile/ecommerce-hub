"use server";

import { revalidatePath } from "next/cache";
import { updateStoreBanner } from "@/lib/ecommerce-data";

export type BannerActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

function cleanText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function saveBannerAction(
  _prevState: BannerActionState,
  formData: FormData
): Promise<BannerActionState> {
  const announcementEnabled = formData.get("announcementEnabled") === "on";
  const announcementMessage = cleanText(formData.get("announcementMessage"));
  const announcementLinkText = cleanText(formData.get("announcementLinkText"));
  const announcementLinkHref = cleanText(formData.get("announcementLinkHref"));

  if (announcementEnabled && !announcementMessage) {
    return {
      status: "error",
      message: "Add banner text before publishing it.",
    };
  }

  if (announcementLinkText && !announcementLinkHref) {
    return {
      status: "error",
      message: "Add a CTA link or leave the CTA text empty.",
    };
  }

  const result = await updateStoreBanner({
    announcementEnabled,
    announcementMessage,
    announcementLinkText,
    announcementLinkHref,
  });

  if (!result.ok) {
    return {
      status: "error",
      message: result.error ?? "Could not save the banner. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  return { status: "success", message: "Website banner updated." };
}
