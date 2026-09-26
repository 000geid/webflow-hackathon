"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

export type ToastTone = "live" | "success" | "danger" | "info";
/** `avatar`: si el aviso es de un jugador, se muestra su personaje en lugar del ícono. */
export type Toast = { id: string; icon: string; avatar?: string; text: string; tone: ToastTone };

const TOAST_MS = 2600;
/** Si llegan muchos eventos juntos, se descartan los más viejos. */
const MAX_QUEUED = 4;

/* El color del borde neón indica el tipo de aviso. */
const TONE_SHADOW: Record<ToastTone, string> = {
  live: "border-arcade shadow-[4px_4px_0_0_#000,0_0_18px_rgb(245_158_11/0.35)]",
  success: "border-neon shadow-[4px_4px_0_0_#000,0_0_18px_rgb(16_185_129/0.35)]",
  danger: "border-hot shadow-[4px_4px_0_0_#000,0_0_18px_rgb(251_113_133/0.35)]",
  info: "border-edge shadow-pixel",
};

/** Cola de avisos: muestra uno por vez, cada uno ~2.6 s. */
export function useToastQueue() {
  const [queue, setQueue] = useState<Toast[]>([]);
  const current = queue[0] ?? null;

  const notify = useCallback((toast: Omit<Toast, "id">) => {
    setQueue((prev) => {
      const next = [...prev, { ...toast, id: crypto.randomUUID() }];
      // Se conserva el que está en pantalla y los más recientes.
      return next.length > MAX_QUEUED ? [next[0], ...next.slice(-(MAX_QUEUED - 1))] : next;
    });
  }, []);

  useEffect(() => {
    if (!current) return;
    const timer = window.setTimeout(() => setQueue((prev) => prev.slice(1)), TOAST_MS);
    return () => window.clearTimeout(timer);
  }, [current]);

  return { toast: current, notify };
}

/** Aviso flotante centrado arriba, como un cartel de arcade. */
export function LiveToast({ toast }: { toast: Toast | null }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-[5rem] z-[60] sm:top-[6.25rem] flex justify-center px-4" aria-live="polite" role="status">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ y: -28, opacity: 0, scale: 0.94 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -16, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 520, damping: 34 }}
            className={cn(
              "flex max-w-full items-center gap-2.5 border-2 bg-panel py-1.5 pr-4 pl-1.5 text-sm font-semibold text-slate-100",
              TONE_SHADOW[toast.tone],
            )}
          >
            {toast.avatar ? (
              <PlayerAvatar avatar={toast.avatar} className="h-7 w-7 border border-amber-400 text-base" />
            ) : (
              <span className="grid h-7 w-7 shrink-0 place-items-center bg-crt font-pixel text-sm text-slate-100" aria-hidden="true">
                {toast.icon}
              </span>
            )}
            <span className="truncate">{toast.text}</span>
            {toast.tone === "live" && (
              <span className="relative ml-0.5 flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping bg-arcade opacity-75" />
                <span className="relative inline-flex h-2 w-2 bg-arcade" />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
