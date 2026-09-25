import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type BadgeTone = "neutral" | "ink" | "danger";

/* Sin bordes gruesos: los datos van en superficies planas; el borde se reserva para acciones. */
const TONES: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-950",
  ink: "bg-slate-950 text-white",
  danger: "bg-rose-50 text-rose-600 ring-1 ring-rose-200",
};

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: BadgeTone;
  label?: string;
}

/** Pastilla de datos: número en mono dentro de una cápsula. */
export function Badge({ icon, children, tone = "neutral", label }: BadgeProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full px-3 font-mono text-sm leading-none font-semibold tabular-nums transition-colors duration-200",
        TONES[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
