import type { PlayerStatus, RoomPlayerView } from "@/lib/game/room";
import { cn } from "@/lib/ui/cn";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";

const STATUS: Record<PlayerStatus, { label: string; chip: string }> = {
  waiting: { label: "Listo", chip: "border-edge text-slate-400" },
  revealing: { label: "Mirando", chip: "border-edge text-slate-300" },
  guessing: { label: "Pensando", chip: "border-black bg-arcade text-black" },
  correct: { label: "¡Adivinó!", chip: "border-black bg-neon text-black" },
  wrong: { label: "Falló", chip: "border-black bg-hot text-black" },
  timeout: { label: "Sin tiempo", chip: "border-edge text-slate-500" },
};

function Avatar({ player, size }: { player: RoomPlayerView; size: "sm" | "md" }) {
  return (
    <span
      className={cn(
        "relative block shrink-0 border-2",
        player.status === "guessing" ? "border-arcade shadow-[0_0_12px_rgb(245_158_11/0.55)]" : "border-amber-400/70",
      )}
      aria-hidden="true"
    >
      <PlayerAvatar avatar={player.avatar} className={size === "md" ? "h-10 w-10 text-xl" : "h-7 w-7 text-base"} />
      <span className={cn("absolute -right-1 -bottom-1 h-2.5 w-2.5 border-2 border-crt", player.online ? "bg-neon" : "bg-slate-600")} />
    </span>
  );
}

function StatusChip({ player }: { player: RoomPlayerView }) {
  const status = player.online ? STATUS[player.status] : { label: "Offline", chip: "border-edge text-slate-600" };
  return (
    <span className={cn("inline-flex items-center border px-1.5 py-0.5 font-pixel text-[9px] leading-none tracking-wide uppercase", status.chip)}>
      {status.label}
    </span>
  );
}

/**
 * Tabla de la sala: puesto, avatar, estado en vivo, puntaje y racha.
 * Desktop: columna izquierda. Mobile: fila de fichas con scroll horizontal.
 */
export function PlayersPanel({ players, maxPlayers }: { players: RoomPlayerView[]; maxPlayers: number }) {
  return (
    <>
      {/* Mobile */}
      <ul className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 lg:hidden" aria-label="Jugadores">
        {players.map((player) => (
          <li
            key={player.id}
            className={cn("flex shrink-0 items-center gap-2 border-2 bg-panel py-1 pr-2.5 pl-1 shadow-pixel-sm", player.isYou ? "border-neon" : "border-edge")}
          >
            <Avatar player={player} size="sm" />
            <span className="max-w-20 truncate text-xs font-bold text-slate-100">{player.isYou ? "Vos" : player.name}</span>
            <span className="font-pixel text-xs text-emerald-400 tabular-nums">{player.score}</span>
            <StatusChip player={player} />
          </li>
        ))}
      </ul>

      {/* Desktop */}
      <section className="hidden border-2 border-edge bg-panel shadow-pixel lg:block">
        <div className="flex items-center justify-between border-b-2 border-edge bg-panel-deep px-3 py-2.5">
          <h2 className="font-pixel text-[11px] tracking-wider text-cream uppercase">
            Tabla {players.length}/{maxPlayers}
          </h2>
          <span className="flex items-center gap-1.5 font-pixel text-[10px] tracking-wider text-hot uppercase">
            <span className="h-1.5 w-1.5 animate-pulse bg-hot" aria-hidden="true" />
            Live
          </span>
        </div>
        <ol className="divide-y-2 divide-edge">
          {players.map((player, index) => (
            <li key={player.id} className={cn("flex items-center gap-3 px-3 py-3", player.isYou && "bg-neon/[0.07]")}>
              <span className={cn("w-4 font-pixel text-xs", index === 0 ? "text-arcade" : "text-slate-500")}>{index + 1}</span>
              <Avatar player={player} size="md" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm leading-tight font-bold text-slate-100">
                  {player.name}
                  {player.isYou && <span className="ml-1 font-pixel text-[9px] text-neon">VOS</span>}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <StatusChip player={player} />
                  {player.streak >= 2 && <span className="font-pixel text-[9px] tracking-wide text-arcade uppercase">Racha {player.streak}</span>}
                </div>
              </div>
              <span className="font-pixel text-sm text-emerald-400 tabular-nums [text-shadow:0_0_8px_currentColor]">{player.score}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
