"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { pointsAt } from "@/lib/game/rules";
import { appPath } from "@/lib/paths";
import { cn } from "@/lib/ui/cn";

/* Ilustraciones propias de /public/demo: no dependen del CMS ni de un CDN externo. */
const DEMO = [
  { src: "/demo/sandia.svg", answer: "Sandía" },
  { src: "/demo/faro.svg", answer: "Faro" },
  { src: "/demo/hongo.svg", answer: "Hongo" },
  { src: "/demo/sol.svg", answer: "Sol" },
  { src: "/demo/arcoiris.svg", answer: "Arcoíris" },
];

const PHASE_MS = 3_000;
const TICK_MS = 100;
/* Durante los 3 s borrosos el "reloj del juego" corre 1,5×: el contador baja de 1.000 a 730. */
const GAME_SPEED = 1.5;

/**
 * Demo en loop: 3 s borrosa con el contador bajando, 3 s nítida con los puntos "frenados".
 * Usa pointsAt(), la misma fórmula del juego, así la demo enseña la mecánica real.
 */
export function LiveDemoCard() {
  const reduceMotion = useReducedMotion();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const timer = window.setInterval(() => setElapsed((ms) => ms + TICK_MS), TICK_MS);
    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  const cycle = Math.floor(elapsed / (PHASE_MS * 2));
  const inCycle = elapsed % (PHASE_MS * 2);
  const blurred = !reduceMotion && inCycle < PHASE_MS;
  const item = DEMO[cycle % DEMO.length];
  const points = pointsAt(Math.min(inCycle, PHASE_MS) * GAME_SPEED);

  return (
    <div className="relative overflow-hidden rounded-3xl border-3 border-slate-950 bg-slate-950 shadow-[6px_6px_0px_0px_#020617]" aria-label="Demo del juego">
      <div className="relative aspect-video overflow-hidden">
        {DEMO.map((entry) => (
          // Se precargan todas para que el cambio de imagen no parpadee.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={entry.src}
            src={appPath(entry.src)}
            alt=""
            draggable={false}
            className={cn(
              "absolute inset-0 h-full w-full object-cover transition-[filter,transform,opacity] duration-700 ease-out select-none",
              entry === item ? "opacity-100" : "opacity-0",
              blurred ? "scale-110 blur-xl" : "scale-100 blur-0",
            )}
          />
        ))}

        {/* Etiqueta brillante */}
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border-2 border-slate-950 bg-amber-300 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-slate-950 uppercase shadow-[0_0_24px_rgb(252_211_77/0.65)]">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-slate-950 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-950" />
          </span>
          ⚡ Demo en vivo
        </span>

        {/* Contador de puntos */}
        <span
          className={cn(
            "absolute top-3 right-3 rounded-full border-2 border-slate-950 px-3 py-1 font-mono text-sm font-black tabular-nums transition-colors",
            blurred ? "bg-white text-slate-950" : "bg-emerald-400 text-slate-950",
          )}
        >
          {!blurred && "+"}
          {points.toLocaleString("es-AR")} PTS
        </span>

        {/* Respuesta al frenar */}
        <div
          className={cn(
            "absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-full border-2 border-slate-950 bg-white py-1.5 pr-1.5 pl-4 transition-[opacity,translate] duration-300",
            blurred ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100",
          )}
          aria-hidden={blurred}
        >
          <span className="truncate text-sm font-bold text-slate-950">Era: {item.answer}</span>
          <span className="rounded-full bg-slate-950 px-3 py-1 font-mono text-[11px] font-bold tracking-wider text-white uppercase">¡Frenaste!</span>
        </div>
      </div>
    </div>
  );
}
