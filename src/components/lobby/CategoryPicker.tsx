"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, MIX, type CategoryAvailability, type CategoryChoice } from "@/lib/game/categories";
import { cn } from "@/lib/ui/cn";

const OPTIONS = [MIX, ...CATEGORIES];

interface CategoryPickerProps {
  value: CategoryChoice;
  onChange: (category: CategoryChoice) => void;
}

/**
 * Elegir categoría para crear sala o jugar solo. Pregunta al servidor cuáles tienen
 * al menos cinco imágenes; las demás se muestran como "Pronto" y no se pueden elegir.
 */
export function CategoryPicker({ value, onChange }: CategoryPickerProps) {
  const [availability, setAvailability] = useState<Map<CategoryChoice, CategoryAvailability> | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories", { cache: "no-store" })
      .then((response) => (response.ok ? (response.json() as Promise<CategoryAvailability[]>) : null))
      .then((list) => {
        if (cancelled || !list) return;
        const byId = new Map(list.map((entry) => [entry.id, entry]));
        setAvailability(byId);
        // Si la categoría guardada ya no alcanza, se vuelve a la mezcla.
        if (!byId.get(value)?.available) onChange("mix");
      })
      .catch(() => { /* sin datos: todo habilitado, el servidor igual valida al crear */ });
    return () => { cancelled = true; };
    // Solo al montar: la disponibilidad no cambia mientras se está en el lobby.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <fieldset className="mt-4">
      <legend className="px-1 pb-2 font-pixel text-[10px] tracking-wider text-slate-500 uppercase">Categoría</legend>
      <div className="grid grid-cols-2 gap-1.5" role="radiogroup" aria-label="Categoría">
        {OPTIONS.map((option) => {
          const info = availability?.get(option.id);
          const disabled = info ? !info.available : false;
          const selected = option.id === value;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              title={option.label}
              disabled={disabled}
              onClick={() => onChange(option.id)}
              className={cn(
                "flex min-w-0 cursor-pointer items-center gap-2 border-2 px-2.5 py-2 text-left text-[13px] font-bold",
                "transition-[translate,box-shadow,background-color,border-color] duration-100 enabled:active:translate-x-0.5 enabled:active:translate-y-0.5",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright",
                disabled
                  ? "cursor-not-allowed border-edge bg-panel-deep text-slate-600"
                  : selected
                    ? "border-black bg-neon text-crt shadow-[3px_3px_0px_0px_#000,0_0_14px_rgb(16_185_129/0.35)]"
                    : "border-edge-soft bg-crt text-slate-200 hover:border-neon",
              )}
            >
              <span className="text-base leading-none" aria-hidden="true">{option.emoji}</span>
              <span className="min-w-0 flex-1 truncate">{option.label}</span>
              {disabled && <span className="border border-edge px-1 py-0.5 font-pixel text-[8px] tracking-wider text-slate-500 uppercase">Pronto</span>}
            </button>
          );
        })}
      </div>
      <p className="mt-2 px-1 text-xs text-slate-400" aria-live="polite">
        {OPTIONS.find((option) => option.id === value)?.description}
      </p>
    </fieldset>
  );
}
