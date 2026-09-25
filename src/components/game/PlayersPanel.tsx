import type { PlayerStatus, RoomPlayerView } from "@/lib/game/room";
import { cn } from "@/lib/ui/cn";

const STATUS: Record<PlayerStatus, { label: string; chip: string }> = {
  waiting: { label: "Listo", chip: "bg-slate-100 text-slate-500" },
  revealing: { label: "Mirando", chip: "bg-slate-100 text-slate-500" },
  guessing: { label: "Pensando…", chip: "bg-blue-600 text-white" },
  correct: { label: "¡Adivinó!", chip: "bg-emerald-100 text-emerald-700" },
  wrong: { label: "Falló", chip: "bg-rose-100 text-rose-700" },
  timeout: { label: "Sin tiempo", chip: "bg-slate-100 text-slate-400" },
};

function Avatar({ player, size }: { player: RoomPlayerView; size: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full bg-slate-100",
        size === "md" ? "h-10 w-10 text-xl" : "h-7 w-7 text-base",
        player.status === "guessing" && "ring-2 ring-blue-600 ring-offset-2 ring-offset-white",
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
  const status = player.online ? STATUS[player.status] : { label: "Desconectado", chip: "bg-slate-100 text-slate-400" };
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
              "flex shrink-0 items-center gap-2 rounded-full py-1 pr-3 pl-1 ring-1",
              player.isYou ? "bg-blue-50 ring-blue-200" : "bg-white ring-slate-200",
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
      <section className="hidden overflow-hidden rounded-3xl bg-white/70 ring-1 ring-slate-200 backdrop-blur-md lg:block">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-mono text-[11px] tracking-wider text-slate-500 uppercase">
            Tabla · {players.length}/{maxPlayers}
          </h2>
          <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-blue-600 uppercase">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" aria-hidden="true" />
            En vivo
          </span>
        </div>
        <ol className="divide-y divide-slate-200/80">
          {players.map((player, index) => (
            <li key={player.id} className={cn("flex items-center gap-3 px-4 py-3", player.isYou && "bg-blue-50/70")}>
              <span className="w-3 font-mono text-[11px] font-semibold text-slate-400 tabular-nums">{index + 1}</span>
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
