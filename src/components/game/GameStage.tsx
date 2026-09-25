import type { Choice } from "@/lib/game/types";
import { GameHeader } from "./GameHeader";
import { GameImage } from "./GameImage";
import { GuessButton } from "./GuessButton";
import { OptionsGrid } from "./OptionsGrid";

/**
 * Los nombres siguen a `GameView` (src/lib/game/types.ts) para que conectar
 * la respuesta del servidor sea directo:
 *   imageUrl    ← view.round.imageUrl
 *   category    ← view.round.category
 *   choices     ← view.round.choices   (vacío hasta pausar)
 *   score       ← view.score
 *   showOptions ← view.status === "paused" || view.status === "answered" || view.status === "finished"
 *   selectedChoiceId / correctChoiceId ← view.round.result
 */
export interface GameStageProps {
  imageUrl: string | null;
  category?: string;
  /** Segundos que quedan, ya redondeados. */
  timeLeft: number;
  score: number;
  /** 0–7: de scale-100 a scale-300 */
  zoomLevel?: number;
  /** 0–7: de blur-none a blur-3xl */
  blurLevel?: number;
  /** true = muestra la grilla 2x2 y oculta el botón ADIVINAR */
  showOptions?: boolean;
  choices?: Choice[];
  selectedChoiceId?: string | null;
  correctChoiceId?: string | null;
  /** ADIVINAR = acción "pause" del motor */
  onGuess?: () => void;
  /** Elegir opción = acción "answer" del motor */
  onSelectChoice?: (choiceId: string) => void;
}

/** Pantalla principal del juego. Solo pinta lo que recibe por props. */
export function GameStage({
  imageUrl,
  category,
  timeLeft,
  score,
  zoomLevel = 0,
  blurLevel = 0,
  showOptions = false,
  choices = [],
  selectedChoiceId = null,
  correctChoiceId = null,
  onGuess,
  onSelectChoice,
}: GameStageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl">
        <GameHeader timeLeft={timeLeft} score={score} />

        <GameImage
          src={imageUrl}
          alt={category ? `Imagen a adivinar: ${category}` : "Imagen a adivinar"}
          zoomLevel={zoomLevel}
          blurLevel={blurLevel}
        />

        {showOptions ? (
          <OptionsGrid
            choices={choices}
            selectedChoiceId={selectedChoiceId}
            correctChoiceId={correctChoiceId}
            onSelect={onSelectChoice}
          />
        ) : (
          <GuessButton onClick={onGuess} />
        )}
      </section>
    </main>
  );
}
