import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "brand" | "success" | "danger";

const TONES: Record<BadgeTone, string> = {
  brand: "bg-blue-50 text-brand ring-blue-200",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  danger: "bg-red-50 text-red-600 ring-red-200 animate-pulse",
};

interface BadgeProps {
  icon?: ReactNode;
  children: ReactNode;
  tone?: BadgeTone;
}

export function Badge({ icon, children, tone = "brand" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold tabular-nums ring-1",
        TONES[tone],
      )}
    >
      {icon && <span aria-hidden="true">{icon}</span>}
      {children}
    </span>
  );
}
