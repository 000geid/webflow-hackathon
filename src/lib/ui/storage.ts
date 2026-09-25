import { AVATARS, isAvatar, NAME_MAX_LENGTH } from "@/lib/game/avatars";
import { categoryChoiceSchema, type CategoryChoice } from "@/lib/game/categories";

/*
 * Todo lo que se guarda en el navegador. Cada acceso va en try/catch:
 * en modo privado o con storage bloqueado, el juego sigue funcionando sin memoria.
 */

const PROFILE_KEY = "pixel-rush-profile";
const ROOM_KEY = "pixel-rush-room-v1";
const CATEGORY_KEY = "pixel-rush-category";

export type Profile = { name: string; avatar: string };
export type RoomSession = { code: string; token: string };

function read<T>(storage: () => Storage, key: string): T | null {
  try {
    const value = storage().getItem(key);
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: unknown | null) {
  try {
    if (value === null) storage().removeItem(key);
    else storage().setItem(key, JSON.stringify(value));
  } catch {
    /* sin storage: no pasa nada */
  }
}

const local = () => window.localStorage;
/* La sala va en sessionStorage: cada pestaña es un jugador distinto (útil para probar solo). */
const session = () => window.sessionStorage;

export function loadProfile(): Profile {
  const saved = read<Partial<Profile>>(local, PROFILE_KEY);
  return {
    name: typeof saved?.name === "string" ? saved.name.slice(0, NAME_MAX_LENGTH) : "",
    avatar: isAvatar(saved?.avatar) ? saved.avatar : AVATARS[0],
  };
}
export const saveProfile = (profile: Profile) => write(local, PROFILE_KEY, profile);

export function loadCategory(): CategoryChoice {
  const parsed = categoryChoiceSchema.safeParse(read<unknown>(local, CATEGORY_KEY));
  return parsed.success ? parsed.data : "mix";
}
export const saveCategory = (category: CategoryChoice) => write(local, CATEGORY_KEY, category);

export function loadRoomSession(): RoomSession | null {
  const saved = read<Partial<RoomSession>>(session, ROOM_KEY);
  return typeof saved?.code === "string" && typeof saved.token === "string" ? { code: saved.code, token: saved.token } : null;
}
export const saveRoomSession = (value: RoomSession | null) => write(session, ROOM_KEY, value);

export function readLocal<T>(key: string): T | null {
  return read<T>(local, key);
}
export function writeLocal(key: string, value: unknown) {
  write(local, key, value);
}
