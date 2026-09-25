"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PlayerAvatar } from "@/components/ui/PlayerAvatar";
import { AVATARS } from "@/lib/game/avatars";
import { cn } from "@/lib/ui/cn";

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

const avatarNumber = (avatar: string) => avatar.replace("avatar", "");

/** Botón con tu personaje; al tocarlo abre la grilla de los 18 avatares pixel-art. */
export function AvatarPicker({ value, onChange }: AvatarPickerProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Avatar ${avatarNumber(value)}. Cambiar`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="block cursor-pointer border-2 border-amber-400 shadow-[2px_2px_0px_#000] transition-[translate,border-color] hover:border-neon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright active:translate-y-0.5"
      >
        <PlayerAvatar avatar={value} className="h-9 w-9 text-xl" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Elegí tu avatar"
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 z-30 mt-2 w-[17.5rem] border-2 border-edge bg-panel p-2.5 shadow-pixel-lg"
          >
            <p className="px-0.5 pb-2 font-pixel text-[10px] tracking-wider text-cream/70 uppercase">Elegí tu personaje</p>
            <div className="grid grid-cols-6 gap-1.5">
              {AVATARS.map((avatar) => {
                const selected = avatar === value;
                return (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => {
                      onChange(avatar);
                      setOpen(false);
                    }}
                    aria-label={`Avatar ${avatarNumber(avatar)}`}
                    aria-pressed={selected}
                    className={cn(
                      "block aspect-square cursor-pointer border-2 transition-[border-color,translate,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-neon-bright",
                      selected
                        ? "border-neon shadow-[0_0_12px_rgb(16_185_129/0.6)]"
                        : "border-edge hover:-translate-y-0.5 hover:border-amber-400",
                    )}
                  >
                    <PlayerAvatar avatar={avatar} className="h-full w-full" />
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
