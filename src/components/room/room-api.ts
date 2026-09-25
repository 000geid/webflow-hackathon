import type { RoomEvent, RoomView } from "@/lib/game/room";
import type { Toast } from "@/components/game/LiveToast";

export class RequestError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

/** fetch JSON contra la API de salas. Nunca pone el token en la URL. */
export async function roomRequest<T = RoomView>(path: string, options: { token?: string; body?: unknown } = {}): Promise<T> {
  const { token, body } = options;
  let response: Response;
  try {
    response = await fetch(path, {
      method: body === undefined ? "GET" : "POST",
      headers: {
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      cache: "no-store",
    });
  } catch {
    throw new RequestError("Sin conexión. Reintentando…", 0);
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = result?.error?.message;
    throw new RequestError(typeof message === "string" ? message : "No se pudo conectar con la sala.", response.status);
  }
  return result as T;
}

/** Traduce un evento de la sala al aviso flotante. */
export function eventToast(event: RoomEvent): Omit<Toast, "id"> {
  switch (event.kind) {
    case "joined": return { icon: event.avatar, text: `${event.name} se unió a la sala`, tone: "info" };
    case "left": return { icon: event.avatar, text: `${event.name} salió de la sala`, tone: "info" };
    case "ready": return { icon: "✓", text: `${event.name} está listo/a`, tone: "success" };
    case "started": return { icon: "▸", text: "¡Arranca la partida!", tone: "live" };
    case "guessing": return { icon: event.avatar, text: `${event.name} está adivinando…`, tone: "live" };
    case "hint": return { icon: "?", text: `${event.name} usó su pista`, tone: "info" };
    case "correct": return { icon: "✓", text: `¡${event.name} adivinó correctamente! +${event.points ?? 0}`, tone: "success" };
    case "wrong": return { icon: event.avatar, text: `${event.name} falló`, tone: "danger" };
    case "rematch": return { icon: "↻", text: `${event.name} armó la revancha`, tone: "info" };
  }
}
