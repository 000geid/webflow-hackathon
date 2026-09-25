import { Badge } from "@/components/ui/Badge";
import { ClockIcon, StarIcon } from "@/components/ui/icons";
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
}

export function GameHeader({ timeLeft, score, roundIndex, totalRounds, results }: GameHeaderProps) {
  const seconds = Math.max(0, Math.ceil(timeLeft));
  const isLowTime = seconds <= LOW_TIME_THRESHOLD && seconds > 0;

  return (
    <header className="mb-6 space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-2xl leading-none font-black tracking-tight text-slate-950">
          Pixel <span className="text-blue-600">Rush</span>
        </p>

        <div className="flex items-center gap-2" aria-live="polite">
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
      </div>

      <ProgressBar totalRounds={totalRounds} roundIndex={roundIndex} results={results} />
    </header>
  );
}
