import type { GameRound } from "@/types/game";
import { GameHeader } from "./GameHeader";
import { GameImage } from "./GameImage";
import { GuessButton } from "./GuessButton";
import { OptionsGrid } from "./OptionsGrid";

export interface GameStageProps {
  round: GameRound;
  timeLeft: number;
  score: number;
  /** 0–7: de scale-100 a scale-300 */
  zoomLevel?: number;
  /** 0–7: de blur-none a blur-3xl */
  blurLevel?: number;
  /** true = muestra la grilla 2x2 y oculta el botón ADIVINAR */
  showOptions?: boolean;
  selectedIndex?: number | null;
  correctIndex?: number | null;
  onGuess?: () => void;
  onSelectOption?: (index: number) => void;
}

/**
 * Pantalla principal del juego. Solo pinta lo que recibe por props:
 * el timer, el puntaje y las respuestas los maneja quien la use.
 */
export function GameStage({
  round,
  timeLeft,
  score,
  zoomLevel = 0,
  blurLevel = 0,
  showOptions = false,
  selectedIndex = null,
  correctIndex = null,
  onGuess,
  onSelectOption,
}: GameStageProps) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-2xl">
        <GameHeader timeLeft={timeLeft} score={score} />

        <GameImage
          src={round.imageSrc}
          alt={round.imageAlt}
          zoomLevel={zoomLevel}
          blurLevel={blurLevel}
        />

        {showOptions ? (
          <OptionsGrid
            options={round.options}
            selectedIndex={selectedIndex}
            correctIndex={correctIndex}
            onSelect={onSelectOption}
          />
        ) : (
          <GuessButton onClick={onGuess} />
        )}
      </section>
    </main>
  );
}
