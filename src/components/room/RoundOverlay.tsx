"use client";

import { AnimatePresence, motion } from "framer-motion";

type RoundOverlayProps =
  | { kind: "countdown"; seconds: number }
  | { kind: "chip"; text: string }
  | { kind: "none" };

/** Capa sobre la imagen: cuenta regresiva a pantalla completa o una cápsula de estado. */
export function RoundOverlay(props: RoundOverlayProps) {
  return (
    <AnimatePresence>
      {props.kind === "countdown" && (
        <motion.div
          key="countdown"
          className="absolute inset-0 grid place-items-center rounded-2xl bg-slate-950/75 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center text-white">
            <p className="font-mono text-xs tracking-[0.25em] text-slate-300 uppercase">La ronda arranca en</p>
            <motion.p
              key={props.seconds}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="mt-2 font-mono text-7xl font-bold tabular-nums sm:text-8xl"
            >
              {props.seconds}
            </motion.p>
          </div>
        </motion.div>
      )}
      {props.kind === "chip" && (
        <motion.p
          key="chip"
          className="absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-slate-950/85 py-1.5 pr-3.5 pl-2.5 font-mono text-xs font-semibold text-white backdrop-blur-sm"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" aria-hidden="true" />
          {props.text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
