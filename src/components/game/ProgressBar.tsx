import { cn } from "@/lib/ui/cn";
import { getProgressSegments, type SegmentState } from "@/lib/ui/progress";

const SEGMENT: Record<SegmentState, string> = {
  correct: "bg-success",
  wrong: "bg-rose-500",
  current: "bg-brand",
  upcoming: "bg-slate-200",
};

interface ProgressBarProps {
  totalRounds: number;
  roundIndex: number;
  results: boolean[];
}

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
      className="flex gap-1.5"
    >
      {segments.map((state, i) => (
        <span key={i} className="h-3.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <span
            className={cn(
              "block h-full rounded-full transition-all duration-500 ease-out",
              SEGMENT[state],
              // Brillo arriba, como en los juegos.
              state !== "upcoming" && "shadow-[inset_0_-3px_0_rgba(0,0,0,0.15),inset_0_3px_0_rgba(255,255,255,0.35)]",
              state === "upcoming" ? "w-0" : "w-full",
            )}
          />
        </span>
      ))}
    </div>
  );
}
