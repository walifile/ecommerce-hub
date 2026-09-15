"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";

export function OrderActionForm({ children, className }: { children: React.ReactNode; className?: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      ref={formRef}
      className={className}
      aria-busy={pending}
      onSubmit={(event) => {
        event.preventDefault();
        const form = formRef.current;
        if (!form || pending) return;
        const data = new FormData(form);
        startTransition(async () => {
          const result = await updateOrderStatusAction(data);
          if (result.status === "success") {
            toast.success(result.message);
            router.refresh();
          } else toast.error(result.message);
        });
      }}
    >
      <fieldset disabled={pending} className="contents">{children}</fieldset>
    </form>
  );
}
