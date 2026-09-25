import type { RoomEvent } from "@/lib/game/room";
import { cn } from "@/lib/ui/cn";

const FEED_SIZE = 8;

const TEXT: Record<RoomEvent["kind"], (e: RoomEvent) => string> = {
  joined: (e) => `${e.name} se unió`,
  left: (e) => `${e.name} salió`,
  ready: (e) => `${e.name} está listo/a`,
  started: () => "Arrancó la partida",
  guessing: (e) => `${e.name} frenó el tiempo`,
  hint: (e) => `${e.name} usó su pista`,
  correct: (e) => `${e.name} acertó · +${e.points ?? 0}`,
  wrong: (e) => `${e.name} falló`,
  rematch: (e) => `${e.name} pidió revancha`,
};

const DOT: Record<RoomEvent["kind"], string> = {
  joined: "bg-slate-300",
  left: "bg-slate-300",
  ready: "bg-emerald-500",
  started: "bg-blue-600",
  guessing: "bg-blue-600",
  hint: "bg-indigo-500",
  correct: "bg-emerald-500",
  wrong: "bg-rose-500",
  rematch: "bg-amber-400",
};

/** Actividad de la sala, lo más nuevo arriba. Es el historial de los avisos flotantes. */
export function RoundFeed({ events, youId }: { events: RoomEvent[]; youId: string }) {
  const recent = events.slice(-FEED_SIZE).reverse();
  return (
    <section className="rounded-3xl bg-white/70 p-4 ring-1 ring-slate-200 backdrop-blur-md">
      <h2 className="font-mono text-[11px] tracking-wider text-slate-500 uppercase">Actividad</h2>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">Todavía no pasó nada.</p>
      ) : (
        <ol className="mt-2 divide-y divide-slate-200/80" aria-live="off">
          {recent.map((event) => (
            <li key={event.seq} className="flex items-center gap-2.5 py-2 text-sm">
              <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT[event.kind])} aria-hidden="true" />
              <span className="shrink-0 text-base leading-none" aria-hidden="true">{event.avatar}</span>
              <span className={cn("min-w-0 truncate", event.playerId === youId ? "text-slate-400" : "text-slate-700")}>
                {TEXT[event.kind](event)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
