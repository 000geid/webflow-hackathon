"use client";

import { AnimatePresence } from "framer-motion";
import type { Choice } from "@/lib/game/types";
import { ROUND_DURATION_MS, ROUNDS_PER_GAME } from "@/lib/game/rules";
import { GameHeader } from "./GameHeader";
import { GameImage } from "./GameImage";
import { GuessButton } from "./GuessButton";
import { OptionsGrid } from "./OptionsGrid";

/**
 * Los nombres siguen a `GameView` (src/lib/game/types.ts) para que conectar
 * la respuesta del servidor sea directo:
 *   imageUrl  ← view.round.imageUrl
 *   category  ← view.round.category
 *   choices   ← view.round.choices   (vacío hasta pausar)
 *   score     ← view.score
 *   roundIndex / totalRounds ← view.roundIndex / view.totalRounds
 *   timeLeft  ← (view.round.deadline - ahora) / 1000
 *   isPaused  ← view.status === "paused"
 *   selectedChoiceId / correctChoiceId ← view.round.result
 */
export interface GameStageProps {
  imageUrl: string | null;
  category?: string;
  /** Segundos restantes. Puede tener decimales para que el zoom sea suave. */
  timeLeft: number;
  /** Duración total de la ronda en segundos. */
  duration?: number;
  score: number;
  /** Ronda actual (desde 0) y total, para la barra de progreso. */
  roundIndex?: number;
  totalRounds?: number;
  /** Resultado de las rondas ya jugadas (true = acierto). */
  results?: boolean[];
  /** true = tiempo frenado, se ven las opciones y el botón dice REANUDAR. */
  isPaused?: boolean;
  /** true = ronda cerrada (respondida o sin tiempo): nada se puede tocar. */
  isLocked?: boolean;
  choices?: Choice[];
  selectedChoiceId?: string | null;
  correctChoiceId?: string | null;
  onGuess?: () => void;
  onResume?: () => void;
  onSelectChoice?: (choiceId: string) => void;
}

/** Pantalla principal del juego. Solo pinta lo que recibe por props. */
export function GameStage({
  imageUrl,
  category,
  timeLeft,
  duration = ROUND_DURATION_MS / 1000,
  score,
  roundIndex = 0,
  totalRounds = ROUNDS_PER_GAME,
  results = [],
  isPaused = false,
  isLocked = false,
  choices = [],
  selectedChoiceId = null,
  correctChoiceId = null,
  onGuess,
  onResume,
  onSelectChoice,
}: GameStageProps) {
  const isRevealed = correctChoiceId !== null;
  const showOptions = isPaused || isRevealed;

  return (
    <main className="flex min-h-screen items-start justify-center px-4 py-8 sm:items-center sm:py-12">
      <section className="w-full max-w-2xl">
        <GameHeader
          timeLeft={timeLeft}
          score={score}
          roundIndex={roundIndex}
          totalRounds={totalRounds}
          results={results}
        />

        <GameImage
          src={imageUrl}
          alt={category ? `Imagen a adivinar: ${category}` : "Imagen a adivinar"}
          timeLeft={timeLeft}
          duration={duration}
          revealed={isRevealed}
        />

        <GuessButton
          isPaused={isPaused}
          disabled={isLocked}
          onGuess={onGuess}
          onResume={onResume}
        />

        <AnimatePresence>
          {showOptions && choices.length > 0 && (
            <OptionsGrid
              key="options"
              choices={choices}
              selectedChoiceId={selectedChoiceId}
              correctChoiceId={correctChoiceId}
              locked={isLocked}
              onSelect={onSelectChoice}
            />
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
