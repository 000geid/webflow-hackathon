import type { ReactNode } from "react";

export function Logo() {
  return (
    <p className="flex items-center gap-2 text-xl leading-none font-black tracking-tight text-slate-950 sm:text-2xl">
      {/* Marca: un "píxel" azul con esquina recortada */}
      <span aria-hidden="true" className="grid h-6 w-6 grid-cols-2 gap-0.5 rounded-md bg-slate-950 p-1">
        <span className="rounded-[2px] bg-blue-500" />
        <span className="rounded-[2px] bg-white/25" />
        <span className="rounded-[2px] bg-white/25" />
        <span className="rounded-[2px] bg-blue-500" />
      </span>
      <span>
        Pixel <span className="text-blue-600">Rush</span>
      </span>
    </p>
  );
}

/** Barra superior en cápsula: borde grueso y sombra dura, logo a la izquierda y acciones a la derecha. */
export function TopCapsule({ children }: { children?: ReactNode }) {
  return (
    <header className="flex items-center justify-between gap-3 rounded-full border-2 border-slate-950 bg-white py-1.5 pr-1.5 pl-4 shadow-[3px_3px_0px_0px_#020617]">
      <Logo />
      <div className="flex items-center gap-1.5">{children}</div>
    </header>
  );
}
