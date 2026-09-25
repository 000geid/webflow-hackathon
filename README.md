# Pixel Rush AI

Base de una app Next.js para desplegar en Webflow Cloud. La interfaz de Gabi ya está en el repo, pero todavía muestra una ronda de prueba y no está conectada a los endpoints.

## Estado

- Sitio Webflow `Pixel Rush` y colección CMS `Challenges` creados. Esquema e IDs en [docs/webflow-cms.md](docs/webflow-cms.md).
- Endpoint `GET /api/health` disponible.
- Reglas de puntaje y motor de rondas preparados en `src/lib/game/`.
- Cliente de lectura de Webflow Data API preparado en `src/lib/server/webflow.ts`; requiere un Site Token. Aún no está conectado a una ruta de juego.
- Binding de SQLite y migración inicial preparados para Webflow Cloud. La persistencia de partidas todavía no está conectada a los endpoints.

## Interfaz

- Tailwind CSS v4. Los colores de marca están como tokens en `src/app/globals.css` (`bg-canvas`, `bg-brand`, `bg-success`).
- `src/components/game/`: `GameStage` y sus piezas (`GameHeader`, `GameImage`, `GuessButton`, `OptionsGrid`, `OptionButton`). Solo pintan lo que reciben por props.
- `src/components/ui/`: piezas genéricas (`Badge`).
- `src/lib/ui/`: helpers de la interfaz (niveles de blur/zoom, estado visual de cada opción).
- `src/mocks/`: ronda de prueba mientras no hay endpoints.
- Las props de `GameStage` siguen los nombres de `GameView`. El mapeo está comentado en `GameStage.tsx`.

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
