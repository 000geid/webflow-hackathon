"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { LiveDemoCard } from "./LiveDemoCard";
import { PillButton } from "@/components/ui/PillButton";
import { TopCapsule } from "@/components/ui/TopCapsule";
import { NAME_MAX_LENGTH } from "@/lib/game/avatars";
import { ACHIEVEMENTS, loadUnlocked } from "@/lib/ui/achievements";
import type { Profile } from "@/lib/ui/storage";
import { AchievementsButton } from "./AchievementsButton";
import { AchievementsModal } from "./AchievementsModal";
import { AvatarPicker } from "./AvatarPicker";
import { CategoryPicker } from "./CategoryPicker";
import type { CategoryChoice } from "@/lib/game/categories";

const CODE_LENGTH = 5;
/** Mismo alfabeto que el server: sin I, L, O, 0 ni 1. */
const sanitizeCode = (value: string) => value.toUpperCase().replace(/[^A-HJKMNP-Z2-9]/g, "").slice(0, CODE_LENGTH);

function MicroBadge({ children, live = false }: { children: ReactNode; live?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-950 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-slate-950 uppercase">
      {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-600" aria-hidden="true" />}
      {children}
    </span>
  );
}

interface LobbyProps {
  profile: Profile;
  onProfileChange: (profile: Profile) => void;
  category: CategoryChoice;
  onCategoryChange: (category: CategoryChoice) => void;
  defaultCode?: string;
  busy: "create" | "join" | null;
  error: string | null;
  onCreate: () => void;
  onJoin: (code: string) => void;
  onSolo: () => void;
}

/** Pantalla inicial. Desktop: hero a la izquierda, tarjeta para entrar a la derecha. */
export function Lobby({ profile, onProfileChange, category, onCategoryChange, defaultCode = "", busy, error, onCreate, onJoin, onSolo }: LobbyProps) {
  const [code, setCode] = useState(() => sanitizeCode(defaultCode));
  const [localError, setLocalError] = useState<string | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [unlocked] = useState(loadUnlocked);
  const unlockedCount = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
  const message = localError ?? error;

  function requireName(): boolean {
    if (profile.name.trim()) return true;
    setLocalError("Poné un apodo para jugar.");
    return false;
  }

  function create(event?: FormEvent) {
    event?.preventDefault();
    if (requireName()) onCreate();
  }

  function join() {
    if (!requireName()) return;
    if (code.length !== CODE_LENGTH) return setLocalError(`El código tiene ${CODE_LENGTH} caracteres.`);
    onJoin(code);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-5 sm:px-6 sm:py-8">
      <TopCapsule>
        <AchievementsButton unlocked={unlockedCount} total={ACHIEVEMENTS.length} onClick={() => setShowAchievements(true)} />
      </TopCapsule>

      <section className="grid flex-1 grid-cols-[minmax(0,1fr)] content-center items-center gap-10 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,27rem)] lg:gap-16 lg:py-16">
        {/* Columna izquierda: la propuesta */}
        <div>
          <div className="flex flex-wrap gap-2">
            <MicroBadge live>En vivo</MicroBadge>
            <MicroBadge>2–5 jugadores</MicroBadge>
            <MicroBadge>5 rondas · 15 s</MicroBadge>
          </div>

          <h1 className="mt-6 text-5xl leading-[0.95] font-black tracking-tight text-slate-950 uppercase xl:text-6xl">
            ¿Qué carajo es esta imagen?
          </h1>

          <p className="mt-5 max-w-md text-lg font-medium text-slate-700">
            Frená el reloj antes que tus amigos y demostrá quién manda.
          </p>

          <div className="mt-8 max-w-xl">
            <LiveDemoCard />
          </div>
        </div>

        {/* Columna derecha: entrar a jugar */}
        <form
          onSubmit={create}
          noValidate
          className="w-full rounded-[2rem] border-3 border-slate-950 bg-white p-4 shadow-[8px_8px_0px_0px_#020617] sm:p-5"
        >
          <div className="px-1">
            <h2 className="text-xl font-black tracking-tight text-slate-950 uppercase">Entrá a jugar</h2>
            <p className="text-sm text-slate-500">Creá una sala y compartí el código, o sumate a una.</p>
          </div>

          <label htmlFor="nickname" className="mt-4 block px-1 pb-2 font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
            Tu jugador
          </label>
          <div className="flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white p-1.5 transition-shadow focus-within:shadow-[0_0_0_3px_#93c5fd]">
            <AvatarPicker value={profile.avatar} onChange={(avatar) => onProfileChange({ ...profile, avatar })} />
            <input
              id="nickname"
              value={profile.name}
              onChange={(event) => {
                setLocalError(null);
                onProfileChange({ ...profile, name: event.target.value.slice(0, NAME_MAX_LENGTH) });
              }}
              placeholder="Tu apodo"
              autoComplete="nickname"
              maxLength={NAME_MAX_LENGTH}
              className="min-w-0 flex-1 bg-transparent px-1 text-base font-bold text-slate-950 outline-none placeholder:font-medium placeholder:text-slate-500"
            />
            <span className="pr-3 font-mono text-[11px] text-slate-400 tabular-nums" aria-hidden="true">
              {profile.name.length}/{NAME_MAX_LENGTH}
            </span>
          </div>

          <CategoryPicker value={category} onChange={onCategoryChange} />

          <PillButton type="submit" size="lg" className="mt-4 w-full" disabled={busy !== null}>
            {busy === "create" ? "Creando sala…" : "Crear sala"}
            {busy !== "create" && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            )}
          </PillButton>

          <div className="my-5 flex items-center gap-3 px-2" aria-hidden="true">
            <span className="h-0.5 flex-1 bg-slate-950" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-slate-500 uppercase">o unite con un código</span>
            <span className="h-0.5 flex-1 bg-slate-950" />
          </div>

          <div className="flex items-center gap-2 rounded-full border-2 border-slate-950 bg-white p-1.5 transition-shadow focus-within:shadow-[0_0_0_3px_#93c5fd]">
            <label htmlFor="room-code" className="sr-only">Código de sala</label>
            <input
              id="room-code"
              value={code}
              onChange={(event) => {
                setLocalError(null);
                setCode(sanitizeCode(event.target.value));
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  join();
                }
              }}
              placeholder="ABC23"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent pl-4 font-mono text-lg font-bold tracking-[0.3em] text-slate-950 uppercase outline-none placeholder:text-slate-400"
            />
            <PillButton variant="dark" size="md" onClick={join} disabled={busy !== null} className="font-bold">
              {busy === "join" ? "Uniendo…" : "Unirse"}
            </PillButton>
          </div>

          <p className="min-h-5 px-2 pt-3 text-center text-sm font-semibold text-rose-600" role="alert">
            {message}
          </p>

          <div className="mt-1 flex items-center justify-between border-t-2 border-slate-950 px-1 pt-4">
            <span className="text-sm text-slate-500">¿Sin amigos a mano?</span>
            <button
              type="button"
              onClick={onSolo}
              className="cursor-pointer font-mono text-xs font-semibold tracking-wider text-blue-600 uppercase underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Jugar solo →
            </button>
          </div>
        </form>
      </section>

      <AchievementsModal open={showAchievements} unlocked={unlocked} onClose={() => setShowAchievements(false)} />
    </main>
  );
}
