"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/ui/cn";

export type ToastTone = "live" | "success" | "danger" | "info";
export type Toast = { id: string; icon: string; text: string; tone: ToastTone };

const TOAST_MS = 2600;
/** Si llegan muchos eventos juntos, se descartan los más viejos. */
const MAX_QUEUED = 4;

/* El color de la sombra dura indica el tipo de aviso. */
const TONE_SHADOW: Record<ToastTone, string> = {
  live: "shadow-[3px_3px_0_0_#2563eb]",
  success: "shadow-[3px_3px_0_0_#10b981]",
  danger: "shadow-[3px_3px_0_0_#f43f5e]",
  info: "shadow-[3px_3px_0_0_#94a3b8]",
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

/** Cápsula flotante centrada arriba, estilo "Dynamic Island". */
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
              "flex max-w-full items-center gap-2.5 rounded-full border-2 border-slate-950 bg-slate-950 py-1.5 pr-4 pl-1.5 text-sm font-semibold text-white",
              TONE_SHADOW[toast.tone],
            )}
          >
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/10 text-base" aria-hidden="true">
              {toast.icon}
            </span>
            <span className="truncate">{toast.text}</span>
            {toast.tone === "live" && (
              <span className="relative ml-0.5 flex h-2 w-2 shrink-0" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
