# Pixel Rush AI

Base de una app Next.js para desplegar en Webflow Cloud. La interfaz final está a cargo de Gabi y todavía no está integrada.

## Estado

- Sitio Webflow `Pixel Rush` y colección CMS `Challenges` creados. Esquema e IDs en [docs/webflow-cms.md](docs/webflow-cms.md).
- Endpoint `GET /api/health` disponible.
- Reglas de puntaje y motor de rondas preparados en `src/lib/game/`.
- Cliente de lectura de Webflow Data API preparado en `src/lib/server/webflow.ts`; requiere un Site Token. Aún no está conectado a una ruta de juego.
- Binding de SQLite y migración inicial preparados para Webflow Cloud. La persistencia de partidas todavía no está conectada a los endpoints.

## Desarrollo

Requiere Node.js 22 o posterior y npm.

```bash
npm ci
npm run dev
```

Para las verificaciones locales:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Las variables esperadas figuran en `.env.example`. Guardar valores reales en `.env.local` o en los secretos del entorno de Webflow Cloud. No guardar el token en Git.

## Próximos pasos

1. Cargar cinco desafíos completos y activos en la colección `Challenges`.
2. Crear un Site Token con permiso `cms:read` y configurarlo como `WEBFLOW_SITE_TOKEN` en Cloud.
3. Conectar el lector de CMS y SQLite a los endpoints de partida.
4. Integrar la interfaz de Gabi con esos endpoints y desplegar la app en Webflow Cloud.
