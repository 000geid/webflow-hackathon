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
  joined: "bg-slate-500",
  left: "bg-slate-600",
  ready: "bg-neon",
  started: "bg-cyan-400",
  guessing: "bg-arcade",
  hint: "bg-arcade",
  correct: "bg-neon",
  wrong: "bg-hot",
  rematch: "bg-cyan-400",
};

/** Actividad de la sala, lo más nuevo arriba. Es el historial de los avisos flotantes. */
export function RoundFeed({ events, youId }: { events: RoomEvent[]; youId: string }) {
  const recent = events.slice(-FEED_SIZE).reverse();
  return (
    <section className="border-2 border-edge bg-panel shadow-pixel">
      <h2 className="border-b-2 border-edge bg-panel-deep px-3 py-2.5 font-pixel text-[11px] tracking-wider text-cream uppercase">Actividad</h2>
      {recent.length === 0 ? (
        <p className="px-3 py-3 text-sm text-slate-500">Todavía no pasó nada.</p>
      ) : (
        <ol className="divide-y divide-edge px-3" aria-live="off">
          {recent.map((event) => (
            <li key={event.seq} className="flex items-center gap-2.5 py-2 text-sm">
              <span className={cn("h-2 w-2 shrink-0", DOT[event.kind])} aria-hidden="true" />
              <span className="shrink-0 text-base leading-none" aria-hidden="true">{event.avatar}</span>
              <span className={cn("min-w-0 truncate", event.playerId === youId ? "text-slate-500" : "text-slate-200")}>
                {TEXT[event.kind](event)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
