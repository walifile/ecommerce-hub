import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-3xl space-y-3", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-brand">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
