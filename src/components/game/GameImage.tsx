import { cn } from "@/lib/ui/cn";
import { BLUR_CLASSES, SCALE_CLASSES, toEffectLevel } from "@/lib/ui/effect-levels";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface GameImageProps {
  src: string | null;
  alt: string;
  zoomLevel: number;
  blurLevel: number;
}

export function GameImage({ src, alt, zoomLevel, blurLevel }: GameImageProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
      {src ? (
        // Las imágenes vienen del CDN de Webflow CMS. Se usa <img> para no
        // tener que tocar next.config (remotePatterns / optimización en Cloud).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          draggable={false}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out select-none",
            SCALE_CLASSES[toEffectLevel(zoomLevel)],
            BLUR_CLASSES[toEffectLevel(blurLevel)],
          )}
        />
      ) : (
        <ImagePlaceholder />
      )}
    </div>
  );
}
