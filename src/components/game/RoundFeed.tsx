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
  ready: "bg-mint ring-1 ring-slate-900",
  started: "bg-slate-900",
  guessing: "bg-butter ring-1 ring-slate-900",
  hint: "bg-butter ring-1 ring-slate-900",
  correct: "bg-mint ring-1 ring-slate-900",
  wrong: "bg-coral ring-1 ring-slate-900",
  rematch: "bg-peach ring-1 ring-slate-900",
};

/** Actividad de la sala, lo más nuevo arriba. Es el historial de los avisos flotantes. */
export function RoundFeed({ events, youId }: { events: RoomEvent[]; youId: string }) {
  const recent = events.slice(-FEED_SIZE).reverse();
  return (
    <section className="rounded-3xl border-2 border-slate-900 bg-paper p-4 shadow-[4px_4px_0px_0px_#0F172A]">
      <h2 className="font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase">Actividad</h2>
      {recent.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">Todavía no pasó nada.</p>
      ) : (
        <ol className="mt-2 divide-y-2 divide-line" aria-live="off">
          {recent.map((event) => (
            <li key={event.seq} className="flex items-center gap-2.5 py-2 text-sm">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", DOT[event.kind])} aria-hidden="true" />
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
