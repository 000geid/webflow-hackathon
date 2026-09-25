import { StarIcon } from "@/components/ui/icons";

/* Patrón pixelado (damero) para el dorso de la carta. */
const PIXEL_PATTERN = {
  backgroundImage:
    "conic-gradient(rgb(255 255 255 / 0.14) 25%, transparent 0 50%, rgb(255 255 255 / 0.14) 0 75%, transparent 0)",
  backgroundSize: "28px 28px",
};

/** Dorso de carta con el logo de Pixel Rush. */
export function CardBack() {
  return (
    <div className="h-full w-full rounded-[32px] border-4 border-yellow-200 bg-brand p-3 shadow-xl shadow-slate-300/60 sm:p-4">
      <div
        className="flex h-full w-full items-center justify-center rounded-2xl border-2 border-white/30"
        style={PIXEL_PATTERN}
      >
        <div className="flex items-center gap-2 rounded-2xl border-2 border-b-4 border-amber-100 border-b-amber-200 bg-white px-4 py-2 shadow-lg">
          <StarIcon className="h-6 w-6 text-amber-400" />
          <span className="text-lg font-black tracking-tight text-slate-900">
            Pixel <span className="text-brand">Rush</span>
          </span>
        </div>
      </div>
    </div>
  );
}
