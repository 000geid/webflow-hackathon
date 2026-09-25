import { AVATARS } from "@/lib/game/avatars";
import { appPath } from "@/lib/paths";

/** Ruta pública de la imagen de un avatar ("avatar7" → "/avatars/avatar7.jpg"). */
export function avatarSrc(avatar: string): string {
  return appPath(`/avatars/${avatar}.jpg`);
}

/** Todas las imágenes, en el orden en que se muestran en el selector. */
export const AVATAR_IMAGES: readonly string[] = AVATARS.map(avatarSrc);
