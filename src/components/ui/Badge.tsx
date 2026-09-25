import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type BadgeTone = "brand" | "gold" | "danger";

/* Pastilla "táctil": borde grueso abajo + brillo de color alrededor. */
const TONES: Record<BadgeTone, string> = {
  brand: "border-blue-200 border-b-blue-300 bg-white text-brand shadow-[0_0_18px_rgba(37,99,235,0.28)]",
  gold: "border-amber-200 border-b-amber-300 bg-white text-slate-900 shadow-[0_0_18px_rgba(245,158,11,0.25)]",
  danger: "border-rose-300 border-b-rose-400 bg-rose-50 text-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.45)] animate-pulse",
};

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: BadgeTone;
  label?: string;
}

export function Badge({ icon, children, tone = "brand", label }: BadgeProps) {
  return (
    <span
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl border-2 border-b-4 px-3 py-1.5 text-base leading-none font-black tabular-nums transition-colors duration-300",
        TONES[tone],
      )}
    >
      {icon}
      {children}
    </span>
  );
}
