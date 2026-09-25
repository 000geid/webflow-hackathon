import { cn } from "@/lib/ui/cn";
import { getProgressSegments, type SegmentState } from "@/lib/ui/progress";

const SEGMENT: Record<SegmentState, string> = {
  correct: "bg-emerald-400",
  wrong: "bg-rose-500",
  current: "bg-brand",
  upcoming: "bg-white",
};

interface ProgressBarProps {
  totalRounds: number;
  roundIndex: number;
  results: boolean[];
}

/** Barra segmentada: un bloque por ronda, con borde negro como en pixel art. */
export function ProgressBar({ totalRounds, roundIndex, results }: ProgressBarProps) {
  const segments = getProgressSegments(totalRounds, roundIndex, results);

  return (
    <div
      role="progressbar"
      aria-label="Progreso de la partida"
      aria-valuemin={1}
      aria-valuemax={totalRounds}
      aria-valuenow={roundIndex + 1}
      aria-valuetext={`Ronda ${roundIndex + 1} de ${totalRounds}`}
      className="flex gap-2"
    >
      {segments.map((state, i) => (
        <span
          key={i}
          className={cn(
            "h-4 flex-1 rounded-sm border-2 border-ink transition-colors duration-300",
            SEGMENT[state],
            state === "current" && "shadow-hard-xs",
          )}
        />
      ))}
    </div>
  );
}
