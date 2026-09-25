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
    // Marco grueso + sombra sólida abajo. overflow-hidden: el zoom nunca se sale.
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl border-4 border-ink bg-slate-100 shadow-[0_8px_0_0_#0f172a]">
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
