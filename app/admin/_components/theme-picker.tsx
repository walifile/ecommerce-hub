"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { THEMES, type ThemeId } from "@/lib/themes";
import { saveThemeAction, type ThemeActionState } from "@/app/actions/theme";

const initialState: ThemeActionState = { status: "idle", message: "" };

export function ThemePicker({ current }: { current: ThemeId }) {
  const [selected, setSelected] = useState<ThemeId>(current);
  const [state, formAction, pending] = useActionState(
    saveThemeAction,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      toast.success(state.message);
      router.refresh();
    } else if (state.status === "error") {
      toast.error(state.message);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="theme" value={selected} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {THEMES.map((theme) => {
          const active = selected === theme.id;
          return (
            <button
              type="button"
              key={theme.id}
              onClick={() => setSelected(theme.id)}
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

      <Button type="submit" disabled={pending || selected === current}>
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
