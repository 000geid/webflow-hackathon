"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { GameClient } from "@/components/game/GameClient";
import { LiveToast, useToastQueue } from "@/components/game/LiveToast";
import { Lobby } from "@/components/lobby/Lobby";
import { RoomClient } from "@/components/room/RoomClient";
import { roomRequest } from "@/components/room/room-api";
import type { RoomView } from "@/lib/game/room";
import { recordGame, type GameSummary } from "@/lib/ui/achievements";
import type { CategoryChoice } from "@/lib/game/categories";
import { loadCategory, loadProfile, loadRoomSession, saveCategory, saveProfile, saveRoomSession, type Profile } from "@/lib/ui/storage";

type Screen = { kind: "lobby" } | { kind: "room"; code: string; token: string } | { kind: "solo" };

/* true solo en el navegador. Evita renderizar en el server algo que depende de storage. */
const noop = () => () => {};
const useIsClient = () => useSyncExternalStore(noop, () => true, () => false);

/** Refleja la sala en la URL (?room=CODE) para poder compartir el link. */
function setRoomInUrl(code: string | null) {
  const url = new URL(window.location.href);
  if (code) url.searchParams.set("room", code);
  else url.searchParams.delete("room");
  window.history.replaceState(null, "", url);
}

export function PixelRushApp() {
  const isClient = useIsClient();
  if (!isClient) return <main className="min-h-screen" />;
  return <AppShell />;
}

function AppShell() {
  const [screen, setScreen] = useState<Screen>(() => {
    const session = loadRoomSession();
    const invite = new URLSearchParams(window.location.search).get("room");
    return session && (!invite || invite.toUpperCase() === session.code)
      ? { kind: "room", ...session }
      : { kind: "lobby" };
  });
  const [profile, setProfile] = useState(loadProfile);
  const [category, setCategory] = useState<CategoryChoice>(loadCategory);
  const [linkCode] = useState(() => new URLSearchParams(window.location.search).get("room") ?? "");
  const [busy, setBusy] = useState<"create" | "join" | null>(null);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const { toast, notify } = useToastQueue();

  const updateProfile = useCallback((next: Profile) => {
    setProfile(next);
    saveProfile(next);
  }, []);

  const updateCategory = useCallback((next: CategoryChoice) => {
    setCategory(next);
    saveCategory(next);
  }, []);

  const enterRoom = useCallback((code: string, token: string) => {
    saveRoomSession({ code, token });
    setRoomInUrl(code);
    setLobbyError(null);
    setScreen({ kind: "room", code, token });
  }, []);

  const exitToLobby = useCallback((message?: string) => {
    saveRoomSession(null);
    setRoomInUrl(null);
    setLobbyError(message ?? null);
    setScreen({ kind: "lobby" });
  }, []);

  const handleFinished = useCallback((summary: GameSummary) => {
    for (const achievement of recordGame(summary)) {
      notify({ icon: achievement.emoji, text: `Logro desbloqueado: ${achievement.title}`, tone: "success" });
    }
  }, [notify]);

  async function openRoom(kind: "create" | "join", code?: string) {
    setBusy(kind);
    setLobbyError(null);
    try {
      const player = { name: profile.name.trim(), avatar: profile.avatar };
      // La categoría solo cuenta al crear; quien se une juega la de la sala.
      const body = kind === "create" ? { ...player, category } : player;
      const room = await roomRequest<RoomView & { token: string }>(kind === "create" ? "/api/rooms" : `/api/rooms/${code}/join`, { body });
      enterRoom(room.code, room.token);
    } catch (cause) {
      setLobbyError(cause instanceof Error ? cause.message : "No se pudo entrar a la sala.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <LiveToast toast={toast} />
      {screen.kind === "lobby" && (
        <Lobby
          profile={profile}
          onProfileChange={updateProfile}
          category={category}
          onCategoryChange={updateCategory}
          defaultCode={linkCode}
          busy={busy}
          error={lobbyError}
          onCreate={() => void openRoom("create")}
          onJoin={(code) => void openRoom("join", code)}
          onSolo={() => setScreen({ kind: "solo" })}
        />
      )}
      {screen.kind === "room" && (
        <RoomClient
          key={screen.code}
          code={screen.code}
          token={screen.token}
          onExit={exitToLobby}
          notify={notify}
          onFinished={handleFinished}
        />
      )}
      {screen.kind === "solo" && <GameClient onExit={() => exitToLobby()} onFinished={handleFinished} notify={notify} player={profile} category={category} />}
    </>
  );
}
