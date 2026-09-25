# Pixel Rush AI

App Next.js para Webflow Cloud. La pantalla principal permite jugar solo o crear una sala para 2 a 5 personas. En salas, la primera persona que pausa la imagen gana el turno para responder; si falla, el reloj continúa para los demás.

## Backend disponible

- `GET /api/health`.
- `POST /api/rooms`, `POST /api/rooms/{code}/join`, `GET /api/rooms/{code}` y `POST /api/rooms/{code}/actions` para salas con código, turnos de respuesta, puntajes y revancha.
- `POST /api/games`: crear una partida de cinco rondas.
- `GET /api/games/{gameId}`: recuperar estado y expirar rondas vencidas.
- `POST /api/games/{gameId}/actions`: iniciar, pausar, responder y expirar.
- Persistencia SQLite mediante binding `DB`, token por partida y control de concurrencia.
- Modo `fixture` local y modo `webflow` con validación de desafíos publicados del CMS. Producción exige `webflow`.

Contrato, ejemplos y errores: [docs/backend-api.md](docs/backend-api.md).
Esquema del CMS: [docs/webflow-cms.md](docs/webflow-cms.md).

## Interfaz

- Tailwind CSS v4. Los colores de marca y la animación `animate-shake` están como tokens en `src/app/globals.css`.
- Framer Motion para la entrada de las opciones, el rebote de acierto y el modal. `canvas-confetti` para el festejo final.
- `src/components/app/PixelRushApp.tsx` coordina el lobby, la sala y el modo individual. `src/components/room/RoomClient.tsx` consulta la sala y conecta las acciones al servidor. `src/components/game/` contiene el escenario y sus piezas visuales.
- `src/components/ui/`: piezas genéricas (`Badge`).
- `src/lib/ui/`: helpers de la interfaz: zoom/blur según el tiempo (`reveal.ts`), estado visual de cada opción, estrellas y precisión del resultado.
- `src/mocks/` y `public/demo/`: contenido de prueba usado por `GameDemo`; la página principal usa el contenido del servidor.

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

Variables en `.env.example`. En local, `GAME_CONTENT_MODE=fixture`; para probar CMS localmente, configurar `webflow` y credenciales de staging. En Webflow Cloud, configurar `GAME_CONTENT_MODE=webflow`, `WEBFLOW_SITE_TOKEN` y `WEBFLOW_COLLECTION_ID`. Guardar tokens solo como secretos, nunca en Git. La conexión MCP no reemplaza el Site Token que necesita la app.

## Pendiente

Los [cinco desafíos de memes y cultura dev](content/challenges-memes-dev.csv) están publicados en Webflow. Se comprobó una partida local de cinco rondas en modo `webflow` con 5000 puntos.

Pendiente: configurar secretos de CMS en Cloud, y agregar generación de distractores por IA y límites de uso antes de abrir al público.
