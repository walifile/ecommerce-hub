"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "@/lib/themes";
import { saveThemeAction } from "@/app/actions/theme";
import { themeSchema, type ThemeFormInput } from "@/lib/validations/admin";

export function ThemePicker({ current }: { current: ThemeId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { control, setValue, handleSubmit } = useForm<ThemeFormInput>({
    resolver: zodResolver(themeSchema),
    defaultValues: { theme: current },
  });
  const selected = useWatch({ control, name: "theme" });

  function onSubmit(values: ThemeFormInput) {
    startTransition(async () => {
      const fd = new FormData();
      fd.set("theme", values.theme);
      const result = await saveThemeAction({ status: "idle", message: "" }, fd);
      if (result.status === "success") {
        toast.success(result.message);
        router.refresh();
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => {
          const active = selected === theme.id;
          return (
            <button
              type="button"
              key={theme.id}
              onClick={() =>
                setValue("theme", theme.id, { shouldValidate: true, shouldDirty: true })
              }
              aria-pressed={active}
              className={`relative rounded-xl border p-4 text-left transition-all ${
                active
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/70 hover:border-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{theme.name}</span>
                {active && <Check className="size-4 shrink-0 text-primary" />}
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {theme.description}
              </p>

              {/* Preview swatches */}
              <div className="mt-3 flex items-center gap-1.5">
                {theme.swatches.map((color, i) => (
                  <span
                    key={i}
                    className="size-7 rounded-md border border-black/10"
                    style={{ background: color }}
                  />
                ))}
              </div>

              {theme.id === current && (
                <span className="mt-3 inline-flex rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                  Currently live
                </span>
              )}
            </button>
          );
        })}
      </div>

      <Button type="submit" disabled={pending || selected === current} className="rounded-md">
        {pending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Applying…
          </>
        ) : (
          "Apply theme"
        )}
      </Button>
    </form>
  );
}
