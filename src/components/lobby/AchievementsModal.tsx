"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ACHIEVEMENTS, type UnlockedMap } from "@/lib/ui/achievements";
import { cn } from "@/lib/ui/cn";

interface AchievementsModalProps {
  open: boolean;
  unlocked: UnlockedMap;
  onClose: () => void;
}

export function AchievementsModal({ open, unlocked, onClose }: AchievementsModalProps) {
  const count = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-crt/70 px-4 py-6 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="achievements-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-md border-2 border-edge bg-panel p-5 shadow-[8px_8px_0px_0px_#000] sm:p-6"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-pixel text-[10px] tracking-wider text-slate-500 uppercase">Vitrina · {count}/{ACHIEVEMENTS.length}</p>
                <h2 id="achievements-title" className="mt-2 font-pixel text-2xl text-arcade uppercase [text-shadow:0_0_14px_rgb(245_158_11/0.5)]">Logros</h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                autoFocus
                aria-label="Cerrar"
                className="grid h-9 w-9 cursor-pointer place-items-center border-2 border-edge-soft bg-crt text-slate-300 hover:text-hot focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="h-3.5 w-3.5">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>

            <div className="mt-4 h-2 overflow-hidden border border-black bg-edge">
              <div className="h-full bg-arcade transition-[width] duration-500" style={{ width: `${(count / ACHIEVEMENTS.length) * 100}%` }} />
            </div>

            <ul className="mt-3 divide-y-2 divide-edge">
              {ACHIEVEMENTS.map((achievement) => {
                const at = unlocked[achievement.id];
                return (
                  <li
                    key={achievement.id}
                    className={cn(
                      "flex items-center gap-3 py-3",
                      !at && "opacity-70",
                    )}
                  >
                    <span
                      className={cn(
                        "grid h-11 w-11 shrink-0 place-items-center border-2 text-xl",
                        at ? "border-arcade bg-arcade/15" : "border-edge bg-crt grayscale",
                      )}
                      aria-hidden="true"
                    >
                      {achievement.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm font-bold", at ? "text-slate-50" : "text-slate-400")}>{achievement.title}</p>
                      <p className="truncate text-xs text-slate-500">{achievement.description}</p>
                    </div>
                    <span className={cn("font-pixel text-[9px] tracking-wider uppercase", at ? "text-neon-bright" : "text-slate-600")}>
                      {at ? new Date(at).toLocaleDateString("es-AR", { day: "2-digit", month: "short" }) : "Bloqueado"}
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
