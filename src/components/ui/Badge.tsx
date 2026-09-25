import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type BadgeTone = "neutral" | "ink" | "danger";

const TONES: Record<BadgeTone, string> = {
  neutral: "border-slate-900 bg-white text-slate-900",
  ink: "border-slate-900 bg-slate-950 text-white",
  danger: "border-rose-600 bg-rose-50 text-rose-600",
};

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: BadgeTone;
  label?: string;
}

/** Pastilla de datos: número en mono, borde fino y sombra dura mínima. */
export function Badge({ icon, children, tone = "neutral", label }: BadgeProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border-[1.5px] px-2.5 py-1.5 font-mono text-sm leading-none font-semibold tabular-nums shadow-hard-xs transition-colors duration-200",
        TONES[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
