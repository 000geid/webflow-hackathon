import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

type Variant = "primary" | "secondary" | "ghost" | "accent";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  /* Verde neón de CRT, con halo. */
  primary: "border-black bg-neon text-crt shadow-[4px_4px_0px_0px_#000,0_0_22px_rgb(16_185_129/0.35)] enabled:hover:bg-neon-bright",
  secondary: "border-black bg-panel text-slate-100 shadow-pixel enabled:hover:bg-edge",
  ghost: "border-edge-soft bg-crt text-slate-200 shadow-pixel enabled:hover:bg-panel",
  /* Contorno violeta neón: acción secundaria con energía (compartir). */
  accent: "border-purple-500 bg-crt text-purple-200 shadow-[4px_4px_0px_0px_#000,0_0_20px_rgb(168_85_247/0.45)] enabled:hover:bg-purple-500/10 enabled:hover:text-purple-100",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-[11px]",
  md: "h-11 px-5 text-xs",
  lg: "h-14 px-6 text-sm sm:text-base",
};

interface PillButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

/**
 * Botón de arcade: esquinas duras, borde de 2px, sombra de píxel y tipografía pixel.
 * Al pasar el mouse se "levanta"; al apretar baja y pierde la sombra.
 */
export function PillButton({ variant = "primary", size = "md", className, type = "button", ...props }: PillButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 border-2 font-pixel tracking-wide whitespace-nowrap uppercase",
        "transition-[translate,box-shadow,background-color] duration-100",
        "enabled:hover:-translate-x-0.5 enabled:hover:-translate-y-0.5",
        "enabled:active:translate-x-0.5 enabled:active:translate-y-0.5 enabled:active:shadow-none",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-neon-bright",
        "disabled:cursor-not-allowed disabled:border-edge disabled:bg-panel-deep disabled:text-slate-600 disabled:shadow-none",
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...props}
    />
  );
}
