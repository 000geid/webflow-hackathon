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
      className="group flex h-10 cursor-pointer items-center gap-2.5 rounded-full border-2 border-slate-950 bg-white py-1 pr-1 pl-3 shadow-[2px_2px_0_0_#020617] transition-[translate,box-shadow] duration-100 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 active:translate-y-0.5 active:shadow-none"
    >
      <TrophyIcon className="h-4 w-4 text-slate-950" />
      <span className="hidden flex-col items-start gap-1 sm:flex">
        <span className="text-[11px] leading-none font-extrabold tracking-wider text-slate-950 uppercase">Logros</span>
        <span className="h-1 w-14 overflow-hidden rounded-full bg-slate-200">
          <span className="block h-full rounded-full bg-blue-600 transition-[width] duration-500" style={{ width: `${percent}%` }} />
        </span>
      </span>
      <span className="rounded-full bg-amber-300 px-2 py-1 font-mono text-[11px] leading-none font-bold text-slate-950 tabular-nums">
        {unlocked}/{total}
      </span>
    </button>
  );
}
