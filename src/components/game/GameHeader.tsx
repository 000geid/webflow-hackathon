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
    <header className="mb-6 space-y-4">
      <ProgressBar totalRounds={totalRounds} roundIndex={roundIndex} results={results} />

      <div className="flex items-center justify-between gap-3">
        <p className="text-xl leading-none font-black tracking-tight sm:text-2xl">
          Pixel <span className="text-brand">Rush</span>
        </p>

        <div className="flex items-center gap-2" aria-live="polite">
          <Badge
            tone={isLowTime ? "danger" : "brand"}
            label={`${seconds} segundos restantes`}
            icon={<ClockIcon className="h-5 w-5" />}
          >
            {seconds}s
          </Badge>
          <Badge tone="gold" label={`${score} puntos`} icon={<StarIcon className="h-5 w-5 text-amber-400" />}>
            {score.toLocaleString("es-AR")}
          </Badge>
        </div>
      </div>
    </header>
  );
}
