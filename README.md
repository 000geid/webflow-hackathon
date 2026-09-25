# Pixel Rush AI

App Next.js para Webflow Cloud. La interfaz de Gabi ya está en el repositorio. Por ahora la página corre una partida de prueba en el navegador (`GameDemo`) y no está conectada a los endpoints de partidas.

## Backend disponible

- `GET /api/health`.
- `POST /api/games`: crear una partida de cinco rondas.
- `GET /api/games/{gameId}`: recuperar estado y expirar rondas vencidas.
- `POST /api/games/{gameId}/actions`: iniciar, pausar, responder y expirar.
- Persistencia SQLite mediante binding `DB`, token por partida y control de concurrencia.
- Modo `fixture` local y modo `webflow` con validación de desafíos publicados del CMS.

Contrato, ejemplos y errores: [docs/backend-api.md](docs/backend-api.md).
Esquema del CMS: [docs/webflow-cms.md](docs/webflow-cms.md).

## Interfaz

- Tailwind CSS v4. Los colores de marca y la animación `animate-shake` están como tokens en `src/app/globals.css`.
- Framer Motion para la entrada de las opciones, el rebote de acierto y el modal. `canvas-confetti` para el festejo final.
- `src/components/game/`: `GameStage` y sus piezas (`GameHeader`, `ProgressBar`, `CardDeck`, `CardBack`, `GameImage`, `GuessButton`, `OptionsGrid`, `OptionButton`) y `GameResultsModal`. Solo pintan lo que reciben por props. `GameDemo` es la partida de prueba que maneja el estado.
- `src/components/ui/`: piezas genéricas (`Badge`).
- `src/lib/ui/`: helpers de la interfaz: zoom/blur según el tiempo (`reveal.ts`), estado visual de cada opción, estrellas y precisión del resultado.
- `src/mocks/`: cinco rondas de prueba con imágenes en `public/demo/`.
- Las props de `GameStage` siguen los nombres de `GameView`. El mapeo está comentado en `GameStage.tsx`.

## Desarrollo

Node.js 22 o posterior y npm:

```bash
npm ci
npm run db:migrate:local
npm run dev
```

Verificaciones:

```bash
npm run typecheck
npm run lint
npm test
npm run test:api # requiere npm run dev; crea partidas de prueba
npm run build
```

Variables en `.env.example`. Guardar valores reales en `.env.local` o secretos de Webflow Cloud. No guardar el token en Git. La conexión MCP no reemplaza el Site Token que necesita la app.

## Pendiente

Los [cinco desafíos de memes y cultura dev](content/challenges-memes-dev.csv) están publicados en Webflow. Se comprobó una partida local de cinco rondas en modo `webflow` con 5000 puntos.

Pendiente: integrar la interfaz con la API, configurar secretos y migraciones en Cloud, y agregar generación de distractores por IA y límites de uso antes de abrir al público.
