import type { RoundHistory } from "./hints";

export type Choice = { id: string; label: string };
export type RoundContent = {
  id: string;
  category: string;
  imageUrl: string;
  choices: Choice[];
  correctChoiceId: string;
};
export type RoundState = {
  content: RoundContent;
  startedAt: number | null;
  pausedAt: number | null;
  result: { choiceId: string | null; points: number } | null;
};
export type GameState = {
  mode: "fixture" | "webflow";
  index: number;
  rounds: RoundState[];
  /** Ronda en la que se usó la pista (una por partida). Opcional: partidas viejas no lo tienen. */
  hintRound?: number | null;
};
export type GameAction =
  | { type: "start"; roundIndex: number }
  | { type: "pause"; roundIndex: number }
  | { type: "expire"; roundIndex: number }
  | { type: "answer"; roundIndex: number; choiceId: string }
  | { type: "hint"; roundIndex: number };

export type GameView = {
  gameId: string;
  mode: GameState["mode"];
  status: "ready" | "revealing" | "paused" | "answered" | "finished";
  roundIndex: number;
  totalRounds: number;
  score: number;
  /** Resultado de cada ronda completada; las futuras todavía son null. */
  roundResults: (boolean | null)[];
  /** Rondas ya terminadas: categoría, tiempo hasta frenar y acierto. */
  history: RoundHistory[];
  hintsLeft: number;
  serverNow: number;
  round: {
    imageUrl: string;
    category: string;
    startedAt: number | null;
    deadline: number | null;
    elapsedMs: number;
    choices: Choice[];
    result: { choiceId: string | null; correctChoiceId: string; points: number } | null;
    /** Pista de esta ronda, si la pediste en esta ronda. */
    hint: string | null;
  };
};
