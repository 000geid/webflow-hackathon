# Pixel Rush

Minijuego en Next.js 15 + TypeScript + Tailwind v4, pensado para desplegar en Webflow Cloud.

## Correr en local

```bash
npm install
npm run dev
```

Abre http://localhost:3000

## Estructura

```
src/
├── app/                  # Rutas de Next (layout, página, estilos globales)
├── components/
│   ├── game/             # Piezas del juego: GameStage, GameHeader, GameImage,
│   │                     # GuessButton, OptionsGrid, OptionButton
│   └── ui/               # Piezas genéricas reutilizables (Badge)
├── lib/
│   ├── cn.ts             # Helper para unir clases
│   └── game/             # Lógica pura de la UI: niveles de blur/zoom, estado de opciones
├── mocks/                # Datos de prueba mientras no hay servidor
└── types/                # Tipos compartidos (GameRound, EffectLevel…)
```

## Notas para Webflow Cloud

- No definir `basePath` ni `assetPrefix` en `next.config.ts`: Webflow Cloud los pone al hacer el build.
- Las rutas de API deben llevar `export const runtime = 'edge';` y usar `fetch` (nada de axios).
- Los `fetch` del lado del cliente tienen que incluir el base path.
