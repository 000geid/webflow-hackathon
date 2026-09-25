import { Badge } from "@/components/ui/Badge";
import { ClockIcon, StarIcon } from "@/components/ui/icons";
import { TopCapsule } from "@/components/ui/TopCapsule";
import { ProgressBar } from "./ProgressBar";

const LOW_TIME_THRESHOLD = 5;

interface GameHeaderProps {
  /** Segundos restantes; puede tener decimales, se muestra redondeado hacia arriba. */
  timeLeft: number;
  score: number;
  roundIndex: number;
  totalRounds: number;
  /** Resultado de las rondas ya jugadas (true = acierto). */
  results: boolean[];
  onExit?: () => void;
  /** Últimos segundos: el segmento actual parpadea en rojo. */
  tense?: boolean;
}

export function GameHeader({ timeLeft, score, roundIndex, totalRounds, results, onExit, tense = false }: GameHeaderProps) {
  const seconds = Math.max(0, Math.ceil(timeLeft));
  const isLowTime = seconds <= LOW_TIME_THRESHOLD && seconds > 0;

  return (
    <div className="mb-6 space-y-4">
      <TopCapsule>
        <div className="flex items-center gap-1.5" aria-live="polite">
          <Badge
            tone={isLowTime ? "danger" : "neutral"}
            label={`${seconds} segundos restantes`}
            icon={<ClockIcon className="h-3.5 w-3.5" />}
          >
            {String(seconds).padStart(2, "0")}s
          </Badge>
          <Badge tone="ink" label={`${score} puntos`} icon={<StarIcon className="h-3.5 w-3.5 text-blue-400" />}>
            {score.toLocaleString("es-AR")}
          </Badge>
        </div>
        {onExit && (
          <button
            type="button"
            onClick={onExit}
            aria-label="Salir al lobby"
            className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-slate-100 text-slate-950 transition-colors hover:bg-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true" className="h-3.5 w-3.5">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </TopCapsule>

      <ProgressBar totalRounds={totalRounds} roundIndex={roundIndex} results={results} tense={tense} />
    </div>
  );
}
