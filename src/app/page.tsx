import { GameDemo } from "@/components/game";

// Por ahora la página muestra una partida de prueba (GameDemo).
// Cuando estén los endpoints, se reemplaza por un contenedor que lea GameView.
export default function Home() {
  return <GameDemo />;
}
