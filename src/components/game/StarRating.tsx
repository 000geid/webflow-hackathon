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
              "h-10 w-10 sm:h-11 sm:w-11",
              filled ? "fill-blue-600 stroke-slate-900" : "fill-slate-100 stroke-slate-300",
            )}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + n * 0.1, type: "spring", stiffness: 420, damping: 28 }}
          >
            <path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" />
          </motion.svg>
        );
      })}
    </div>
  );
}
