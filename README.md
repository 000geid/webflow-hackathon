# Pixel Rush AI

App Next.js para Webflow Cloud. La interfaz de Gabi está en el repositorio, pero todavía muestra una ronda de prueba y no está conectada a los endpoints de partidas.

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

- Tailwind CSS v4. Los colores de marca están como tokens en `src/app/globals.css` (`bg-canvas`, `bg-brand`, `bg-success`).
- `src/components/game/`: `GameStage` y sus piezas (`GameHeader`, `GameImage`, `GuessButton`, `OptionsGrid`, `OptionButton`). Solo pintan lo que reciben por props.
- `src/components/ui/`: piezas genéricas (`Badge`).
- `src/lib/ui/`: helpers de la interfaz (niveles de blur/zoom, estado visual de cada opción).
- `src/mocks/`: ronda de prueba mientras la interfaz no esté conectada a los endpoints.
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
