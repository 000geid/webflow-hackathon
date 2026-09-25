"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { StarRating as Stars } from "@/lib/ui/results";

/** Tres estrellas que "saltan" en secuencia. Pensadas para ir sobre fondo oscuro. */
export function StarRating({ stars, size = "lg", align = "center" }: { stars: Stars; size?: "sm" | "lg"; align?: "start" | "center" }) {
  return (
    <div className={cn("flex items-end", align === "center" ? "justify-center" : "justify-start", size === "lg" ? "gap-3" : "gap-1.5")} role="img" aria-label={`${stars} de 3 estrellas`}>
      {[1, 2, 3].map((n) => {
        const filled = n <= stars;
        const isCenter = n === 2;
        return (
          <motion.svg
            key={n}
            viewBox="0 0 24 24"
            aria-hidden="true"
            strokeWidth={1.5}
            strokeLinejoin="round"
            className={cn(
              size === "sm"
                ? isCenter ? "h-9 w-9" : "mb-0.5 h-7 w-7"
                : isCenter ? "h-14 w-14 sm:h-16 sm:w-16" : "mb-1 h-11 w-11 sm:h-12 sm:w-12",
              filled
                ? "fill-amber-300 stroke-amber-200 drop-shadow-[0_0_14px_rgb(252_211_77/0.55)]"
                : "fill-white/10 stroke-white/25",
            )}
            initial={{ scale: 0, rotate: -40, opacity: 0 }}
            animate={filled ? { scale: [0, 1.25, 1], rotate: 0, opacity: 1 } : { scale: 1, rotate: 0, opacity: 1 }}
            transition={{ delay: 0.15 + n * 0.14, duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
          </motion.svg>
        );
      })}
    </div>
  );
}
