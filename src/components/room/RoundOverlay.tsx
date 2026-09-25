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
          className="absolute inset-0 z-10 grid place-items-center bg-crt/85 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="text-center">
            <p className="font-pixel text-xs tracking-widest text-slate-300 uppercase">Ronda en</p>
            <motion.p
              key={props.seconds}
              initial={{ scale: 1.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="mt-3 font-pixel text-7xl text-arcade tabular-nums [text-shadow:0_0_24px_currentColor] sm:text-8xl"
            >
              {props.seconds}
            </motion.p>
          </div>
        </motion.div>
      )}
      {props.kind === "chip" && (
        <motion.p
          key="chip"
          className="absolute bottom-3 left-3 z-10 flex items-center gap-2 border-2 border-black bg-arcade py-1.5 pr-3 pl-2.5 font-pixel text-[11px] tracking-wide text-black uppercase shadow-pixel-sm"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
        >
          <span className="h-1.5 w-1.5 animate-pulse bg-black" aria-hidden="true" />
          {props.text}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
