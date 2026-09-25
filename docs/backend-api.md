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
