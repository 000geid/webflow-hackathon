import { GameStage } from "@/components/game";
import { mockRound } from "@/mocks/game";

// La UI todavía muestra una ronda de prueba. Cuando estén los endpoints de
// partida, estos datos salen de GameView (ver GameStage.tsx).
export default function Home() {
  return (
    <GameStage
      imageUrl={mockRound.imageUrl}
      category={mockRound.category}
      choices={mockRound.choices}
      timeLeft={15}
      score={0}
      zoomLevel={4}
      blurLevel={5}
    />
  );
}
