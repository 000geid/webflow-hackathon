import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type BadgeTone = "highlight" | "brand" | "danger";

const TONES: Record<BadgeTone, string> = {
  highlight: "bg-highlight text-ink",
  brand: "bg-brand text-white",
  danger: "bg-rose-500 text-white animate-pulse",
};

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: BadgeTone;
  label?: string;
}

/** Pastilla brutalista: borde negro de 2px + sombra dura. */
export function Badge({ icon, children, tone = "highlight", label }: BadgeProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border-2 border-ink px-2.5 py-1 text-base leading-none font-extrabold tabular-nums shadow-hard-xs transition-colors duration-200",
        TONES[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
