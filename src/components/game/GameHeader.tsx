import { Badge } from "@/components/ui/Badge";

const LOW_TIME_THRESHOLD = 5;

interface GameHeaderProps {
  /** Segundos restantes; puede tener decimales, se muestra redondeado hacia arriba. */
  timeLeft: number;
  score: number;
}

export function GameHeader({ timeLeft, score }: GameHeaderProps) {
  const seconds = Math.max(0, Math.ceil(timeLeft));
  const isLowTime = seconds <= LOW_TIME_THRESHOLD && seconds > 0;

  return (
    <header className="mb-5 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        Pixel <span className="text-brand">Rush</span>
      </h1>

      <div className="flex items-center gap-2" aria-live="polite">
        <Badge icon="⏱" tone={isLowTime ? "danger" : "brand"}>
          {seconds}s
        </Badge>
        <Badge icon="★" tone="success">
          {score.toLocaleString("es-AR")}
        </Badge>
      </div>
    </header>
  );
}
