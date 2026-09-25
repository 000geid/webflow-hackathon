# Pixel Rush AI

App Next.js para Webflow Cloud. La interfaz final está a cargo de Gabi y todavía no está integrada.

## Backend disponible

- `GET /api/health`.
- `POST /api/games`: crear una partida de cinco rondas.
- `GET /api/games/{gameId}`: recuperar estado y expirar rondas vencidas.
- `POST /api/games/{gameId}/actions`: iniciar, pausar, responder y expirar.
- Persistencia SQLite mediante binding `DB`, token por partida y control de concurrencia.
- Modo `fixture` local y modo `webflow` con validación de desafíos publicados del CMS.

Contrato, ejemplos y errores: [docs/backend-api.md](docs/backend-api.md).
Esquema del CMS: [docs/webflow-cms.md](docs/webflow-cms.md).

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

1. Importar y publicar [cinco desafíos de memes y cultura dev](content/challenges-memes-dev.csv) en `Challenges`. Los cinco ítems están publicados y completos en Webflow. El 25/09/2026 se corrigieron mediante MCP los campos que habían quedado vacíos al importar y se publicaron usando la Data API. Se comprobó una partida completa de cinco rondas en modo `webflow` con 5000 puntos.
2. Configurar `WEBFLOW_SITE_TOKEN` con permiso `cms:read` y `WEBFLOW_COLLECTION_ID` para jugar con CMS real.
3. Integrar la interfaz de Gabi, configurar la base real y desplegar en Webflow Cloud.
4. Agregar generación de distractores por IA y límites de uso antes de abrir al público.
