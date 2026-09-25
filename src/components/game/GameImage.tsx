import Image from "next/image";
import { cn } from "@/lib/cn";
import { BLUR_CLASSES, SCALE_CLASSES, toEffectLevel } from "@/lib/game/visual-levels";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface GameImageProps {
  src?: string;
  alt: string;
  zoomLevel: number;
  blurLevel: number;
}

export function GameImage({ src, alt, zoomLevel, blurLevel }: GameImageProps) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-slate-100 shadow-sm ring-1 ring-slate-200">
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 672px"
          className={cn(
            "object-cover transition-all duration-700 ease-out",
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
