import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode") ?? "";
  const token = url.searchParams.get("hub.verify_token") ?? "";
  const challenge = url.searchParams.get("hub.challenge") ?? "";
  const expected = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ?? "";
  if (mode === "subscribe" && expected && safeEqual(token, expected)) {
    return new NextResponse(challenge, { status: 200, headers: { "Content-Type": "text/plain" } });
  }
  return NextResponse.json({ error: "Webhook verification failed." }, { status: 403 });
}

type WebhookStatus = {
  id?: string;
  status?: string;
  timestamp?: string;
  errors?: Array<{ code?: number; title?: string; message?: string; error_data?: { details?: string } }>;
};

export async function POST(request: Request) {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  if (!appSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 });
  const length = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(length) && length > 1_000_000) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-hub-signature-256") ?? "";
  const expected = `sha256=${createHmac("sha256", appSecret).update(body).digest("hex")}`;
  if (!signature || !safeEqual(signature, expected)) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(body); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }

  const root = payload as { object?: string; entry?: Array<{ changes?: Array<{ value?: { statuses?: WebhookStatus[] } }> }> };
  if (root.object !== "whatsapp_business_account") return NextResponse.json({ received: true });
  const statuses = (root.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => change.value?.statuses ?? [])
  ).slice(0, 100);
  const supabase = getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  for (const event of statuses) {
    if (!event.id || !["sent", "delivered", "read", "failed"].includes(event.status ?? "")) continue;
    const seconds = Number(event.timestamp);
    const occurredAt = Number.isFinite(seconds) ? new Date(seconds * 1000).toISOString() : new Date().toISOString();
    const providerError = event.errors?.[0];
    const { error } = await supabase.rpc("apply_whatsapp_delivery_status" as never, {
      p_message_id: event.id,
      p_status: event.status,
      p_occurred_at: occurredAt,
      p_error_code: providerError?.code ? String(providerError.code) : null,
      p_error_message: providerError?.error_data?.details || providerError?.message || providerError?.title || null,
    } as never);
    if (error) {
      console.error("[whatsapp] webhook status update failed:", error.message);
      return NextResponse.json({ error: "Could not persist delivery status." }, { status: 500 });
    }
  }
  return NextResponse.json({ received: true });
}
