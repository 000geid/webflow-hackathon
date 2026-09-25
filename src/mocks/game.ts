import type { RoundContent } from "@/lib/game/types";
import { appPath } from "@/lib/paths";

/**
 * Rondas de prueba para la demo de la UI.
 * OJO: acá la respuesta correcta está en el navegador solo porque es una demo.
 * Con el servidor real, `correctChoiceId` llega recién después de responder.
 */
export const mockRounds: RoundContent[] = [
  {
    id: "demo-sandia",
    category: "Frutas",
    imageUrl: appPath("/demo/sandia.svg"),
    choices: [
      { id: "a", label: "Pizza" },
      { id: "b", label: "Sandía" },
      { id: "c", label: "Kiwi" },
      { id: "d", label: "Frutilla" },
    ],
    correctChoiceId: "b",
  },
  {
    id: "demo-sol",
    category: "Naturaleza",
    imageUrl: appPath("/demo/sol.svg"),
    choices: [
      { id: "a", label: "Girasol" },
      { id: "b", label: "Naranja" },
      { id: "c", label: "Sol" },
      { id: "d", label: "Limón" },
    ],
    correctChoiceId: "c",
  },
  {
    id: "demo-arcoiris",
    category: "Clima",
    imageUrl: appPath("/demo/arcoiris.svg"),
    choices: [
      { id: "a", label: "Arcoíris" },
      { id: "b", label: "Puente" },
      { id: "c", label: "Herradura" },
      { id: "d", label: "Medialuna" },
    ],
    correctChoiceId: "a",
  },
  {
    id: "demo-hongo",
    category: "Naturaleza",
    imageUrl: appPath("/demo/hongo.svg"),
    choices: [
      { id: "a", label: "Paraguas" },
      { id: "b", label: "Lámpara" },
      { id: "c", label: "Medusa" },
      { id: "d", label: "Hongo" },
    ],
    correctChoiceId: "d",
  },
  {
    id: "demo-faro",
    category: "Lugares",
    imageUrl: appPath("/demo/faro.svg"),
    choices: [
      { id: "a", label: "Cohete" },
      { id: "b", label: "Faro" },
      { id: "c", label: "Vela" },
      { id: "d", label: "Chimenea" },
    ],
    correctChoiceId: "b",
  },
];
