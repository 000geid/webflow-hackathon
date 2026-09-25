import { GameStage } from "@/components/game";
import { mockRound } from "@/mocks/game";

// Por ahora la página muestra una ronda de prueba.
// Cuando esté la lógica del servidor, estos datos vendrán de ahí.
export default function HomePage() {
  return (
    <GameStage
      round={mockRound}
      timeLeft={15}
      score={0}
      zoomLevel={4}
      blurLevel={5}
      showOptions={false}
    />
  );
}
