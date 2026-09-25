interface AchievementsButtonProps {
  unlocked: number;
  total: number;
  onClick: () => void;
}

export function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 6H4.5a.5.5 0 0 0-.5.5V8a3 3 0 0 0 3 3M17 6h2.5a.5.5 0 0 1 .5.5V8a3 3 0 0 1-3 3" />
    </svg>
  );
}

/** Acceso a logros: ícono de trofeo, progreso y contador amarillo. */
export function AchievementsButton({ unlocked, total, onClick }: AchievementsButtonProps) {
  const percent = total > 0 ? (unlocked / total) * 100 : 0;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Logros: ${unlocked} de ${total} desbloqueados`}
      className="group flex h-10 cursor-pointer items-center gap-2.5 border-2 border-edge-soft bg-crt py-1 pr-1 pl-2.5 shadow-pixel-sm transition-[translate,box-shadow,border-color] duration-100 hover:border-arcade focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <TrophyIcon className="h-4 w-4 text-arcade" />
      <span className="hidden flex-col items-start gap-1 sm:flex">
        <span className="font-pixel text-[10px] leading-none tracking-wider text-slate-200 uppercase">Logros</span>
        <span className="h-1.5 w-14 overflow-hidden bg-edge">
          <span className="block h-full bg-neon transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="bg-arcade px-1.5 py-1 font-pixel text-[10px] leading-none text-black tabular-nums">
        {unlocked}/{total}
      </span>
    </button>
  );
}
