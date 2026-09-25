import type { PlayerStatus, RoomPlayerView } from "@/lib/game/room";
import { cn } from "@/lib/ui/cn";

const STATUS: Record<PlayerStatus, { label: string; chip: string }> = {
  waiting: { label: "Listo", chip: "bg-cream text-slate-500" },
  revealing: { label: "Mirando", chip: "bg-cream text-slate-600" },
  guessing: { label: "Pensando…", chip: "bg-butter text-slate-950 ring-1 ring-slate-900" },
  correct: { label: "¡Adivinó!", chip: "bg-mint text-slate-950 ring-1 ring-slate-900" },
  wrong: { label: "Falló", chip: "bg-coral text-slate-950 ring-1 ring-slate-900" },
  timeout: { label: "Sin tiempo", chip: "bg-cream text-slate-400" },
};

function Avatar({ player, size }: { player: RoomPlayerView; size: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full border-2 border-slate-900 bg-cream",
        size === "md" ? "h-10 w-10 text-xl" : "h-7 w-7 text-base",
        player.status === "guessing" && "ring-2 ring-butter ring-offset-2 ring-offset-slate-900",
      )}
      aria-hidden="true"
    >
      {player.avatar}
      <span
        className={cn(
          "absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-white",
          player.online ? "bg-emerald-500" : "bg-slate-300",
        )}
      />
    </span>
  );
}

function StatusChip({ player }: { player: RoomPlayerView }) {
  const status = player.online ? STATUS[player.status] : { label: "Desconectado", chip: "bg-cream text-slate-400" };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 font-mono text-[10px] leading-4 font-semibold tracking-wide uppercase", status.chip)}>
      {status.label}
    </span>
  );
}

/**
 * Tabla de la sala: puesto, avatar, estado en vivo, puntaje y racha.
 * Desktop: columna izquierda. Mobile: fila de cápsulas con scroll horizontal.
 */
export function PlayersPanel({ players, maxPlayers }: { players: RoomPlayerView[]; maxPlayers: number }) {
  return (
    <>
      {/* Mobile */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden" aria-label="Jugadores">
        {players.map((player) => (
          <li
            key={player.id}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-full border-2 border-slate-900 py-1 pr-3 pl-1",
              player.isYou ? "bg-peach" : "bg-paper",
            )}
          >
            <Avatar player={player} size="sm" />
            <span className="max-w-20 truncate text-xs font-bold">{player.isYou ? "Vos" : player.name}</span>
            <span className="font-mono text-xs font-semibold tabular-nums">{player.score.toLocaleString("es-AR")}</span>
            <StatusChip player={player} />
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <section className="hidden overflow-hidden rounded-3xl border-2 border-slate-900 bg-paper shadow-[4px_4px_0px_0px_#0F172A] lg:block">
        <div className="flex items-center justify-between border-b-2 border-slate-900 bg-cream px-4 py-3">
          <h2 className="font-mono text-[11px] font-bold tracking-wider text-slate-900 uppercase">
            Tabla · {players.length}/{maxPlayers}
          </h2>
          <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-wider text-[#C2410C] uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-coral" aria-hidden="true" />
            En vivo
          </span>
        </div>
        <ol className="divide-y-2 divide-line">
          {players.map((player, index) => (
            <li key={player.id} className={cn("flex items-center gap-3 px-4 py-3", player.isYou && "bg-peach/50")}>
              <span className="w-3 font-mono text-[11px] font-black text-slate-900 tabular-nums">{index + 1}</span>
              <Avatar player={player} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight font-bold text-slate-950">
                  {player.name}
                  {player.isYou && <span className="ml-1 font-mono text-[10px] font-medium text-slate-400">VOS</span>}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  <StatusChip player={player} />
                  {player.streak >= 2 && <span className="font-mono text-[10px] font-bold tracking-wide text-orange-600 uppercase">Racha {player.streak}</span>}
                </div>
              </div>
              <span className="font-mono text-sm font-bold text-slate-950 tabular-nums">{player.score.toLocaleString("es-AR")}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
