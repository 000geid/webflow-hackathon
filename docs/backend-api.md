# API de partidas

Todas las respuestas son JSON con `Cache-Control: no-store`. La UI consume la API en el mismo origen. El servidor determina tiempos, respuestas correctas y puntaje; el cliente nunca envía esos valores.

## Crear

`POST /api/games`, `Content-Type: application/json`:

```json
{}
```

Respuesta `201`: `GameView` más `token`. Guardar `gameId` y `token` en `sessionStorage` para recuperar la partida al recargar. No incluir el token en URLs ni logs. Se devuelve únicamente al crear la partida y solo su hash se guarda en SQLite. La partida vence a las 24 horas.

- El servidor selecciona la fuente con `GAME_CONTENT_MODE`. Por defecto usa `fixture` fuera de producción y `webflow` en producción. Producción rechaza `fixture` aunque la variable esté configurada así.
- `fixture`: cinco imágenes locales de formas, solo para desarrollo. La respuesta correcta de la demo es A; no sirve para competir.
- `webflow`: requiere `WEBFLOW_SITE_TOKEN` con `cms:read` y `WEBFLOW_COLLECTION_ID`. Lee ítems publicados de la Data API, descarta inactivos, borradores, archivados y datos incompletos. Requiere cinco desafíos válidos distintos. No reemplaza errores del CMS por datos demo.
- El cliente no puede elegir la fuente. Para desarrollo local, usar `GAME_CONTENT_MODE=fixture` en `.env.local`; para probar el CMS localmente, configurar `webflow` con credenciales de una colección de staging.

## Consultar

`GET /api/games/{gameId}` con `Authorization: Bearer {token}`.

Devuelve `GameView` (tipo en `src/lib/game/types.ts`), incluidos los aciertos/errores de rondas ya completadas en `roundResults` (las rondas futuras son `null`). Consultar una ronda vencida actualiza y persiste su resultado de cero puntos. `serverNow` y `deadline` permiten sincronizar la animación. La UI debe detener el temporizador en estado `paused`, aunque conserve el deadline original.

## Acciones

`POST /api/games/{gameId}/actions`, con el mismo Bearer token y `Content-Type: application/json`:

```json
{ "type": "start", "roundIndex": 0 }
```

```json
{ "type": "pause", "roundIndex": 0 }
```

```json
{ "type": "answer", "roundIndex": 0, "choiceId": "A" }
```

```json
{ "type": "expire", "roundIndex": 0 }
```

Cada acción exitosa devuelve `200` con el estado actualizado. Los índices van de 0 a 4. Después de responder o expirar, iniciar la siguiente ronda con `start` e índice anterior + 1. La última respuesta o expiración produce `finished`.

Las opciones se entregan al pausar o terminar; `correctChoiceId` aparece únicamente en el resultado. La pausa congela el tiempo de puntaje y permite elegir sin límite adicional (hasta vencer la partida). La imagen original es accesible al navegador para la animación: este MVP no previene que se inspeccione manualmente.

Reintentar la misma respuesta no duplica puntos. Cambiar una respuesta ya registrada produce conflicto. Una respuesta llegada después de expirar devuelve el resultado de expiración. La base usa una versión para impedir que solicitudes simultáneas sobrescriban resultados.

## Errores

Formato: `{ "error": { "code": "...", "message": "..." } }`.

- `400`: JSON o campos inválidos. Se rechazan campos extra y timestamps del cliente.
- `401`: falta un Bearer token con formato válido.
- `404`: partida inexistente, vencida o token que no corresponde.
- `409`: acción fuera de secuencia, respuesta diferente ya registrada o contención. Consultar estado antes de decidir el siguiente paso.
- `413`: cuerpo mayor a 4 KB.
- `415`: falta `application/json`.
- `503`: CMS no configurado, no disponible o con menos de cinco desafíos válidos; binding de base ausente.

## Desarrollo y verificación

```bash
npm run db:migrate:local
npm run dev
# En otra terminal:
npm test
npm run typecheck
npm run lint
npm run test:api
```

`test:api` usa `http://localhost:3000` por defecto (configurable con `API_BASE_URL`). Crea tres partidas demo y tarda unos 15 segundos para comprobar expiración real. Verifica el flujo de cinco rondas, autenticación, validación, persistencia entre requests, reintentos y concurrencia.

La conexión Webflow MCP pertenece a la sesión de desarrollo; no suministra automáticamente credenciales al proceso Next.js. El 25/09/2026 se verificó por MCP que `Challenges` tiene el esquema esperado. Se importaron cinco desafíos desde `content/challenges-memes-dev.csv`. La importación dejó vacíos categoría, opciones y respuesta correcta; esos campos se corrigieron después mediante MCP. Las correcciones se publicaron usando la Data API porque la acción de publicar del conector fue rechazada por validación de esquema. Se verificaron cinco ítems completos en `/items/live` y una partida HTTP de cinco rondas con 5000 puntos. En producción, configurar `GAME_CONTENT_MODE=webflow`, `WEBFLOW_SITE_TOKEN` y `WEBFLOW_COLLECTION_ID` como variables/secretos de Webflow Cloud. No copiar credenciales de producción a `.env.local`.

Antes de desplegar: configurar el binding real de SQLite y aplicar la migración en Cloud, cargar/publicar cinco desafíos y guardar el Site Token como secreto. El ID de base en `wrangler.json` es un placeholder local. No se implementó limpieza periódica de partidas vencidas, rate limiting ni IA todavía.

## Categorías

`GET /api/categories` devuelve cada categoría (`mix`, `pop-arg`, `cine-series`, `memes`, `deportes`, `tech`) con `count` de desafíos y `available` (hacen falta cinco). `POST /api/games` y `POST /api/rooms` aceptan `category` opcional (por defecto `mix`); si la categoría no tiene cinco desafíos responde `409 INSUFFICIENT_CHALLENGES`. La lista y los alias viven en `src/lib/game/categories.ts`. En modo `fixture` no se filtra: todas figuran disponibles con las formas de prueba.

## Puntaje

Una respuesta correcta vale `pointsAt(elapsedMs)` (`src/lib/game/rules.ts`): baja en línea recta de 1.000 puntos al segundo 0 a 100 al segundo 15 (por ejemplo, frenar a los 2 s vale 880). `elapsedMs` es el tiempo hasta que el jugador frenó, no hasta que respondió. Incorrecta o sin tiempo: 0. La UI muestra ese mismo valor en vivo con la misma función, así el medidor nunca promete algo distinto a lo que se cobra.

## Pista (power-up)

`{ "type": "hint", "roundIndex": 0 }` en `/actions` (partidas y salas): una pista por partida por jugador, solo con la ronda en curso y sin responder. Repetirla en la misma ronda es idempotente; pedirla en otra ronda responde `409`. La vista trae `hintsLeft` y `round.hint` (solo para quien la pidió, solo en esa ronda). En salas se emite el evento `hint` para avisar al resto, sin revelar el texto.

La pista actual no usa IA: `maskedHint()` (`src/lib/game/hints.ts`) enmascara la respuesta correcta (`"3 palabras · D____ H______ B___"`). Para conectar un agente (Webflow MCP u otro proveedor), generar el texto en el servidor al procesar la acción `hint`, guardarlo en el estado de la ronda y devolverlo en `round.hint`; la UI no cambia (entra por `onFetchAIHint` en `GameStage`).

Las vistas también traen `history`: por cada ronda terminada, categoría, `elapsedMs` hasta frenar (null si no frenó) y acierto. Lo usa la tarjeta final.

# API de salas (multijugador)

De 2 a 5 jugadores juegan las mismas cinco rondas al mismo tiempo. El puntaje por ronda es el mismo que en partidas solo (`scoreForAnswer`). La lógica está en `src/lib/game/room.ts` (pura, con tests en `tests/room.test.ts`) y la persistencia en `src/lib/server/rooms.ts`, tabla `rooms` (`migrations/0002_rooms.sql`). La sala vence a las 6 horas.

Línea de tiempo de cada ronda: `startsAt` → 15 s de revelación → hasta 8 s más para responder si frenaste → `endedAt` → 4 s de resultados → siguiente ronda. La ronda cierra antes si todos respondieron. La primera arranca 3 s después de `start` (cuenta regresiva). Igual que en partidas solo, el tiempo avanza al consultar: cada request pone la sala al día.

- `POST /api/rooms` con `{ "name": "Ana", "avatar": "🦊", "category": "memes" }` (`category` opcional) → `201`: `RoomView` + `token`. El avatar debe ser uno de `AVATARS` (`src/lib/game/avatars.ts`); el nombre, de 1 a 16 caracteres. Los códigos tienen 5 caracteres sin I, L, O, 0 ni 1.
- `POST /api/rooms/{code}/join` con el mismo cuerpo → `201`: `RoomView` + `token`. Solo en lobby y con lugar. Un nombre repetido recibe sufijo (`Ana 2`).
- `GET /api/rooms/{code}` con `Authorization: Bearer {token}` → `RoomView`. La UI lo consulta cada ~1 s; también marca presencia (se persiste como mucho cada 4 s; sin consultas por 10 s, el jugador figura desconectado).
- `POST /api/rooms/{code}/actions` con el Bearer token:
  - `{ "type": "ready", "ready": true }` — solo en el lobby. Cuando hay 2+ jugadores y todos están listos, la partida arranca sola (evento `ready`, luego `started`). Si se va el único que faltaba, también arranca.
  - `{ "type": "start" }` — solo anfitrión, con 2+ jugadores: fuerza el inicio aunque falte confirmar.
  - `{ "type": "pause", "roundIndex": 0 }` y `{ "type": "answer", "roundIndex": 0, "choiceId": "A" }` — igual que en partidas solo.
  - `{ "type": "rematch" }` — solo anfitrión, con la partida terminada: vuelve al lobby con rondas nuevas.
  - `{ "type": "leave" }` — en el lobby quita al jugador (el anfitrión pasa al siguiente); durante la partida queda como desconectado. Responde `{ "left": true }`.

`RoomView.events` trae los últimos 20 eventos (`joined`, `left`, `started`, `guessing`, `correct`, `wrong`, `rematch`) con `seq` creciente para los avisos en vivo. Las opciones y la respuesta correcta de una ronda solo se envían a quien ya frenó o cuando la ronda terminó; el estado `correct`/`wrong` de los demás sí es visible en vivo.

En Webflow Cloud hay que aplicar la migración `0002_rooms.sql` a la base D1 antes de usar salas.
