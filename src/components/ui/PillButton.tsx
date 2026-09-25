import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "dark" | "light";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-blue-600 text-white enabled:hover:bg-blue-700",
  dark: "bg-slate-950 text-white enabled:hover:bg-slate-800",
  light: "bg-white text-slate-950 enabled:hover:bg-slate-50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-5 text-sm",
  lg: "h-14 px-8 text-base sm:text-lg",
};

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/** Cápsula táctil: borde oscuro de 2px, sombra dura y "hundido" al apretar. */
export function PillButton({ variant = "primary", size = "md", className, type = "button", ...props }: PillButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-slate-950 font-extrabold tracking-wider whitespace-nowrap uppercase",
        "shadow-[3px_3px_0_0_#020617] transition-[translate,box-shadow,background-color] duration-100",
        "enabled:active:translate-y-0.5 enabled:active:shadow-[1px_1px_0_0_#020617]",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600",
        "disabled:cursor-not-allowed disabled:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
