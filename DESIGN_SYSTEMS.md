# Pixel Rush - Design System & Brand Guidelines

## Brand Mood
Retro-Brutalist Tech / High-Contrast Gamified UI (inspired by Swiss graphic design & pixel art).

## Color Palette
- **Primary Accent (Electric Blue):** `#2563EB` / `bg-blue-600`
- **Secondary Highlight (Electric Yellow):** `#FDE047` / `bg-amber-300`
- **Borders & Shadows (Solid Dark):** `#020617` / `border-slate-950`
- **Background:** `#F8FAFC` / `bg-slate-50` with subtle dot grid.

## UI Style Rules (Neo-Brutalism)
- **Borders:** Always use hard, solid dark borders (`border-2 border-slate-950` or `border-3`).
- **Shadows:** Hard offset drop shadows with ZERO blur (`shadow-[4px_4px_0px_0px_#020617]`).
- **Buttons (Tactile):** Hover translates slightly up (`hover:-translate-y-0.5`), Active pushes down and removes shadow (`active:translate-x-[2px] active:translate-y-[2px] active:shadow-none`).
- **Typography:** Heavy sans-serif weights (`font-black`, `tracking-tight`, uppercase labels).

## Component Styling Checklist
1. **Cards:** White background, `rounded-2xl`, hard offset shadow (`shadow-[6px_6px_0px_0px_#020617]`).
2. **Options Grid (2x2):** Tactile cards with yellow keycap badges (A, B, C, D) in `font-black`.
3. **Badges/Pills:** High-contrast yellow/blue fills with solid dark borders.