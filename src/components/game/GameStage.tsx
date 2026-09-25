"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, MotionConfig } from "framer-motion";
import type { Choice } from "@/lib/game/types";
import { ROUND_DURATION_MS, ROUNDS_PER_GAME } from "@/lib/game/rules";
import { cn } from "@/lib/ui/cn";
import { CardDeck } from "./CardDeck";
import { GameHeader } from "./GameHeader";
import { GameImage } from "./GameImage";
import { HintBox, HintButton } from "./HintPowerUp";
import { GuessButton } from "./GuessButton";
import { OptionsGrid } from "./OptionsGrid";
import { PointsMeter } from "./PointsMeter";

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
  /** La API de partidas no permite reanudar después de pausar. */
  canResume?: boolean;
  choices?: Choice[];
  selectedChoiceId?: string | null;
  correctChoiceId?: string | null;
  onGuess?: () => void;
  onResume?: () => void;
  onSelectChoice?: (choiceId: string) => void;
  onExit?: () => void;
  /** Puntos que sumó esta ronda, según el servidor (null si todavía no terminó para vos). */
  earnedPoints?: number | null;
  /** Pista de la ronda actual (si la pediste) y cuántas te quedan en la partida. */
  hint?: string | null;
  hintsLeft?: number;
  /**
   * Pide la pista al backend. Hoy devuelve una pista por regla; es el punto donde
   * enganchar un agente de IA (p. ej. vía Webflow MCP) sin tocar la UI.
   */
  onFetchAIHint?: () => Promise<void> | void;
  /** Columna izquierda (multijugador): tabla de jugadores. En mobile va arriba de la carta. */
  players?: ReactNode;
  /** Columna derecha (multijugador, xl+): actividad de la sala. */
  feed?: ReactNode;
  /** Capa sobre la imagen: cuenta regresiva, "esperando al resto", etc. */
  overlay?: ReactNode;
}

const TENSION_SECONDS = 3;

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
  canResume = true,
  choices = [],
  selectedChoiceId = null,
  correctChoiceId = null,
  onGuess,
  onResume,
  onSelectChoice,
  onExit,
  earnedPoints = null,
  hint = null,
  hintsLeft = 0,
  onFetchAIHint,
  players,
  feed,
  overlay,
}: GameStageProps) {
  const isRevealed = correctChoiceId !== null;
  const showOptions = isPaused || isRevealed;
  const hasPlayers = Boolean(players);
  const hasFeed = hasPlayers && Boolean(feed);
  const [hintPending, setHintPending] = useState(false);

  async function requestHint() {
    if (!onFetchAIHint) return;
    setHintPending(true);
    try { await onFetchAIHint(); }
    finally { setHintPending(false); }
  }
  // Tensión: últimos 3 s con el reloj corriendo (no frenado ni resuelto).
  const isTense = !isPaused && !isRevealed && timeLeft > 0 && timeLeft <= TENSION_SECONDS;

  return (
    // reducedMotion="user": si la persona pidió menos movimiento, se respeta.
    <MotionConfig reducedMotion="user">
      {/*
        Solo:  escenario centrado.
        Multi: jugadores | escenario (lg), + actividad (xl).
      */}
      <main className="min-h-screen overflow-x-clip px-4 py-5 sm:px-6 sm:py-8">
        <div className={cn("mx-auto w-full", hasPlayers ? "max-w-7xl" : "max-w-2xl")}>
          <GameHeader
            timeLeft={timeLeft}
            score={score}
            roundIndex={roundIndex}
            totalRounds={totalRounds}
            results={results}
            onExit={onExit}
            tense={isTense}
          />

          <div
            className={cn(
              "grid items-start gap-5",
              hasPlayers && "lg:grid-cols-[15rem_minmax(0,1fr)]",
              hasFeed && "xl:grid-cols-[15rem_minmax(0,1fr)_16rem]",
            )}
          >
            {hasPlayers && <div className="lg:sticky lg:top-6">{players}</div>}

            <section className="min-w-0">
              <PointsMeter
                timeLeft={timeLeft}
                duration={duration}
                isPaused={isPaused}
                isRevealed={isRevealed}
                earnedPoints={earnedPoints}
                tense={isTense}
              />

              {/* El temblor va en un wrapper: la carta ya usa transform para entrar y salir. */}
              <div className={cn(isTense && "motion-safe:animate-micro-shake")}>
              <CardDeck cardKey={roundIndex} roundIndex={roundIndex} totalRounds={totalRounds} label={category} tense={isTense}>
                <div className="relative">
                  <GameImage
                    src={imageUrl}
                    alt={category ? `Imagen a adivinar: ${category}` : "Imagen a adivinar"}
                    timeLeft={timeLeft}
                    duration={duration}
                    revealed={isRevealed}
                  />
                  {overlay}
                </div>
              </CardDeck>
              </div>

              {onFetchAIHint && (
                <HintButton hintsLeft={hintsLeft} disabled={hintPending || isLocked || isRevealed} onClick={() => void requestHint()} />
              )}
              <AnimatePresence>{hint && <HintBox key={hint} text={hint} />}</AnimatePresence>

              <GuessButton
                isPaused={isPaused}
                disabled={isLocked}
                canResume={canResume}
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

            {hasFeed && <aside className="hidden space-y-4 xl:sticky xl:top-6 xl:block">{feed}</aside>}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
