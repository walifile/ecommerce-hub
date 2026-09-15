"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { retryWhatsAppAction } from "@/app/admin/whatsapp/actions";
import { Button } from "@/components/ui/button";

export function RetryWhatsAppButton({ logId }: { logId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  return (
    <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => {
      const result = await retryWhatsAppAction(logId);
      if (result.status === "success") toast.success(result.message);
      else toast.error(result.message);
      router.refresh();
    })}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
      Retry
    </Button>
  );
}
