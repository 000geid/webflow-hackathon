import { isAvatar } from "@/lib/game/avatars";
import { avatarSrc } from "@/lib/ui/avatar-images";
import { cn } from "@/lib/ui/cn";

interface PlayerAvatarProps {
  avatar: string;
  /** Tamaño, borde y sombra los define quien lo usa. */
  className?: string;
}

/**
 * Avatar pixel-art de un jugador. Si el valor no es un id conocido (por ejemplo, un emoji
 * de una sala creada antes del cambio), lo muestra como texto en vez de una imagen rota.
 */
export function PlayerAvatar({ avatar, className }: PlayerAvatarProps) {
  if (!isAvatar(avatar)) {
    return (
      <span aria-hidden="true" className={cn("grid shrink-0 place-items-center overflow-hidden bg-panel leading-none", className)}>
        {avatar}
      </span>
    );
  }
  return (
    // Imágenes locales chicas de /public: no hace falta la optimización de next/image.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={avatarSrc(avatar)} alt="" draggable={false} className={cn("shrink-0 rounded-none object-cover select-none", className)} />
  );
}
