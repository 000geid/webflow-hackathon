import { revealStyle } from "@/lib/ui/reveal";
import { ImagePlaceholder } from "./ImagePlaceholder";

interface GameImageProps {
  src: string | null;
  alt: string;
  timeLeft: number;
  duration: number;
  /** true = muestra la imagen completa (después de responder). */
  revealed?: boolean;
}

export function GameImage({ src, alt, timeLeft, duration, revealed = false }: GameImageProps) {
  return (
    // overflow-hidden + rounded-lg: el zoom nunca se sale del marco de la carta.
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {src ? (
        // Las imágenes vienen del CDN de Webflow CMS. Se usa <img> para no
        // tener que tocar next.config (remotePatterns / optimización en Cloud).
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          draggable={false}
          style={revealStyle(timeLeft, duration, revealed)}
          className="absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-linear select-none will-change-transform"
        />
      ) : (
        <ImagePlaceholder />
      )}
    </div>
  );
}
