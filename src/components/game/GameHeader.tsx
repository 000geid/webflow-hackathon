import { Badge } from "@/components/ui/Badge";

const LOW_TIME_THRESHOLD = 5;

interface GameHeaderProps {
  timeLeft: number;
  score: number;
}

export function GameHeader({ timeLeft, score }: GameHeaderProps) {
  const isLowTime = timeLeft <= LOW_TIME_THRESHOLD;

  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Pixel <span className="text-brand">Rush</span>
      </h1>

      <div className="flex items-center gap-2" aria-live="polite">
        <Badge icon="⏱" tone={isLowTime ? "danger" : "brand"}>
          {timeLeft}s
        </Badge>
        <Badge icon="★" tone="success">
          {score}
        </Badge>
      </div>
    </header>
  );
}
