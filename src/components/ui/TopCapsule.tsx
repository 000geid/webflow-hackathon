import type { ReactNode } from "react";

/** Marca: un "píxel" 2×2 con los cuatro neones del sistema. */
export function LogoMark({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`grid shrink-0 grid-cols-2 gap-0.5 border-2 border-black bg-black p-0.5 ${className}`}>
      <span className="bg-neon" />
      <span className="bg-arcade" />
      <span className="bg-cyan-400" />
      <span className="bg-hot" />
    </span>
  );
}

export function Logo() {
  return (
    <p className="flex items-center gap-2.5 font-pixel text-base leading-none tracking-wide text-cream uppercase sm:text-lg">
      <LogoMark />
      <span>
        Pixel <span className="text-neon-bright">Rush</span>
      </span>
    </p>
  );
}

/** Barra superior: panel navy de esquinas duras con logo a la izquierda y acciones a la derecha. */
export function TopCapsule({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 border-2 border-edge bg-panel py-1.5 pr-1.5 pl-3 shadow-pixel">
      <Logo />
      <div className="flex items-center gap-1.5">{children}</div>
    </header>
  );
}
