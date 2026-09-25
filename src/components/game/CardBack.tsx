import { StarIcon } from "@/components/ui/icons";

/* Patrón pixelado (damero) para el dorso de la carta. */
const PIXEL_PATTERN = {
  backgroundImage:
    "conic-gradient(rgb(255 255 255 / 0.16) 25%, transparent 0 50%, rgb(255 255 255 / 0.16) 0 75%, transparent 0)",
  backgroundSize: "24px 24px",
};

/** Dorso de carta con el logo de Pixel Rush. */
export function CardBack() {
  return (
    <div className="h-full w-full rounded-2xl border-3 border-ink bg-brand p-3 shadow-hard-lg sm:p-4">
      <div
        className="flex h-full w-full items-center justify-center rounded-lg border-2 border-ink"
        style={PIXEL_PATTERN}
      >
        <div className="flex items-center gap-2 rounded-lg border-2 border-ink bg-highlight px-4 py-2 shadow-hard-sm">
          <StarIcon className="h-6 w-6 text-ink" />
          <span className="text-lg font-black tracking-tight text-ink">Pixel Rush</span>
        </div>
      </div>
    </div>
  );
}
