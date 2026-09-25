"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ROUND_DURATION_MS, scoreForAnswer } from "@/lib/game/rules";
import { mockRounds } from "@/mocks/game";
import { VictoryModal } from "./VictoryModal";
import { GameStage } from "./GameStage";

const TICK_MS = 100;
const NEXT_ROUND_DELAY_MS = 1800;

type RoundResult = { correct: boolean; points: number };

/**
 * Partida jugable con datos de prueba, solo en el navegador.
 * Sirve para ver y ajustar la UI hasta que estén los endpoints de Diego.
 * Usa las mismas reglas de puntaje que el servidor (src/lib/game/rules.ts).
 */
export function GameDemo() {
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeftMs, setTimeLeftMs] = useState(ROUND_DURATION_MS);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | null>(null);
  const [correctChoiceId, setCorrectChoiceId] = useState<string | null>(null);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [isFinished, setIsFinished] = useState(false);
  const nextRoundTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const round = mockRounds[roundIndex];
  const isLocked = correctChoiceId !== null;
  const isRunning = !isPaused && !isLocked && !isFinished;
  const score = results.reduce((sum, r) => sum + r.points, 0);

  const closeRound = useCallback(
    (result: RoundResult) => {
      setCorrectChoiceId(round.correctChoiceId);
      setResults((prev) => [...prev, result]);
      nextRoundTimer.current = setTimeout(() => {
        if (roundIndex === mockRounds.length - 1) {
          setIsFinished(true);
          return;
        }
        setRoundIndex(roundIndex + 1);
        setTimeLeftMs(ROUND_DURATION_MS);
        setIsPaused(false);
        setSelectedChoiceId(null);
        setCorrectChoiceId(null);
      }, NEXT_ROUND_DELAY_MS);
    },
    [round.correctChoiceId, roundIndex],
  );

  // Timer: corre solo si la ronda está activa y no pausada.
  useEffect(() => {
    if (!isRunning) return;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      const delta = now - last;
      last = now;
      setTimeLeftMs((prev) => Math.max(0, prev - delta));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [isRunning]);

  // Se acabó el tiempo sin responder: 0 puntos y se muestra la correcta.
  useEffect(() => {
    if (timeLeftMs > 0 || isLocked) return;
    const id = setTimeout(() => closeRound({ correct: false, points: 0 }), 0);
    return () => clearTimeout(id);
  }, [timeLeftMs, isLocked, closeRound]);

  useEffect(() => () => {
    if (nextRoundTimer.current) clearTimeout(nextRoundTimer.current);
  }, []);

  function handleSelect(choiceId: string) {
    if (isLocked) return;
    const correct = choiceId === round.correctChoiceId;
    setSelectedChoiceId(choiceId);
    closeRound({ correct, points: scoreForAnswer(ROUND_DURATION_MS - timeLeftMs, correct) });
  }

  function handlePlayAgain() {
    if (nextRoundTimer.current) clearTimeout(nextRoundTimer.current);
    setRoundIndex(0);
    setTimeLeftMs(ROUND_DURATION_MS);
    setIsPaused(false);
    setSelectedChoiceId(null);
    setCorrectChoiceId(null);
    setResults([]);
    setIsFinished(false);
  }

  return (
    <>
      <GameStage
        imageUrl={round.imageUrl}
        category={round.category}
        timeLeft={timeLeftMs / 1000}
        score={score}
        roundIndex={roundIndex}
        totalRounds={mockRounds.length}
        isPaused={isPaused}
        isLocked={isLocked || isFinished}
        choices={round.choices}
        selectedChoiceId={selectedChoiceId}
        correctChoiceId={correctChoiceId}
        onGuess={() => setIsPaused(true)}
        onResume={() => setIsPaused(false)}
        onSelectChoice={handleSelect}
      />

      <VictoryModal
        open={isFinished}
        player={{ name: "Demo", avatar: "🦊" }}
        score={score}
        totalRounds={mockRounds.length}
        history={results.map((r, i) => ({ category: mockRounds[i].category, elapsedMs: null, correct: r.correct }))}
        edition="Demo"
        onPlayAgain={handlePlayAgain}
      />
    </>
  );
}
