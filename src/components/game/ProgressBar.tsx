import { cn } from "@/lib/ui/cn";
import { getProgressSegments, type SegmentState } from "@/lib/ui/progress";

const SEGMENT: Record<SegmentState, string> = {
  correct: "bg-emerald-500",
  wrong: "bg-rose-500",
  current: "bg-brand",
  upcoming: "bg-slate-200",
};

interface ProgressBarProps {
  totalRounds: number;
  roundIndex: number;
  results: boolean[];
  tense?: boolean;
}

/** Barra segmentada: un bloque fino por ronda. */
export function ProgressBar({ totalRounds, roundIndex, results, tense = false }: ProgressBarProps) {
  const segments = getProgressSegments(totalRounds, roundIndex, results);

  return (
    <div
      role="progressbar"
      aria-label="Progreso de la partida"
      aria-valuemin={1}
      aria-valuemax={totalRounds}
      aria-valuenow={roundIndex + 1}
      aria-valuetext={`Ronda ${roundIndex + 1} de ${totalRounds}`}
      className="flex gap-1.5"
    >
      {segments.map((state, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors duration-300",
            tense && state === "current" ? "animate-pulse bg-red-500" : SEGMENT[state],
          )}
        />
      ))}
    </div>
  );
}
