"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import type { StarRating as Stars } from "@/lib/ui/results";

export function StarRating({ stars }: { stars: Stars }) {
  return (
    <div className="flex items-center justify-center gap-2" role="img" aria-label={`${stars} de 3 estrellas`}>
      {[1, 2, 3].map((n) => {
        const filled = n <= stars;
        return (
          <motion.svg
            key={n}
            viewBox="0 0 24 24"
            aria-hidden="true"
            strokeWidth={1.75}
            strokeLinejoin="round"
            className={cn(
              "h-12 w-12 stroke-ink sm:h-14 sm:w-14",
              filled ? "fill-highlight drop-shadow-[3px_3px_0_#020617]" : "fill-white",
            )}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.25 + n * 0.15, type: "spring", stiffness: 300, damping: 15 }}
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
          </motion.svg>
        );
      })}
    </div>
  );
}
