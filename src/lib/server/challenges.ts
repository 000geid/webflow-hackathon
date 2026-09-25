import "server-only";
import { appPath } from "../paths";
import { parseChallenges } from "../game/challenges";
import { ROUNDS_PER_GAME } from "../game/rules";
import type { GameState, RoundContent } from "../game/types";
import { ApiError } from "./api";
import { getWebflowCollectionItems } from "./webflow";

const labels = ["Círculo", "Triángulo", "Cuadrado", "Estrella", "Corazón"];
function configuredMode(): GameState["mode"] {
  const mode = process.env.GAME_CONTENT_MODE ?? (process.env.NODE_ENV === "production" ? "webflow" : "fixture");
  if (mode !== "fixture" && mode !== "webflow") {
    throw new ApiError(503, "INVALID_CONTENT_MODE", "GAME_CONTENT_MODE debe ser fixture o webflow.");
  }
  if (process.env.NODE_ENV === "production" && mode !== "webflow") {
    throw new ApiError(503, "FIXTURES_DISABLED", "Producción debe usar contenido de Webflow.");
  }
  return mode;
}

function fixtures(): RoundContent[] {
  return labels.map((label, index) => ({
    id: `fixture-${index}`, category: "Demo · Formas",
    imageUrl: appPath(`/fixtures/${index}.svg`),
    choices: [label, ...labels.filter((other) => other !== label).slice(0, 3)]
      .map((label, i) => ({ id: String.fromCharCode(65 + i), label })),
    correctChoiceId: "A",
  }));
}

export async function createGameState(): Promise<GameState> {
  const mode = configuredMode();
  let content: RoundContent[];
  if (mode === "fixture") {
    content = fixtures();
  } else {
    if (!process.env.WEBFLOW_SITE_TOKEN || !process.env.WEBFLOW_COLLECTION_ID) {
      throw new ApiError(503, "CMS_NOT_CONFIGURED", "Configurar WEBFLOW_SITE_TOKEN y WEBFLOW_COLLECTION_ID en el servidor.");
    }
    try { content = parseChallenges(await getWebflowCollectionItems(process.env.WEBFLOW_COLLECTION_ID)); }
    catch { throw new ApiError(503, "CMS_UNAVAILABLE", "No se pudo leer la colección de Webflow."); }
    if (content.length < ROUNDS_PER_GAME) throw new ApiError(503, "INSUFFICIENT_CHALLENGES", "Se necesitan cinco desafíos publicados, activos y válidos en Webflow.");
  }
  // Fisher–Yates; no repeated challenges in a game.
  for (let i = content.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [content[i], content[j]] = [content[j], content[i]];
  }
  return { mode, index: 0, rounds: content.slice(0, ROUNDS_PER_GAME).map((content) => ({ content, startedAt: null, pausedAt: null, result: null })) };
}
