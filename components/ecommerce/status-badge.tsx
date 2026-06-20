import { Badge } from "@/components/ui/badge";

type StatusBadgeProps = {
  status: string;
};

const toneMap: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  published: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sky-100 text-sky-700",
  processing: "bg-indigo-100 text-indigo-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-rose-100 text-rose-700",
  sent: "bg-emerald-100 text-emerald-700",
  queued: "bg-amber-100 text-amber-800",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge
      className={`rounded-full border-0 px-2.5 py-1 text-[11px] font-semibold capitalize ${toneMap[status] ?? "bg-muted text-foreground"}`}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}
