"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AVATARS } from "@/lib/game/avatars";
import { cn } from "@/lib/ui/cn";

interface AvatarPickerProps {
  value: string;
  onChange: (avatar: string) => void;
}

/** Botón circular con tu avatar; al tocarlo abre una grilla de emojis. */
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
        aria-label={`Avatar: ${value}. Cambiar`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="grid h-10 w-10 cursor-pointer place-items-center border-2 border-edge bg-panel text-2xl transition-colors hover:border-neon focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-bright active:translate-y-0.5"
      >
        {value}
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
            className="absolute top-full left-0 z-30 mt-2 grid w-64 grid-cols-4 gap-1.5 border-2 border-edge bg-panel p-2 shadow-pixel-lg"
          >
            {AVATARS.map((avatar) => (
              <button
                key={avatar}
                type="button"
                onClick={() => {
                  onChange(avatar);
                  setOpen(false);
                }}
                aria-label={avatar}
                aria-pressed={avatar === value}
                className={cn(
                  "grid aspect-square cursor-pointer place-items-center border-2 text-2xl transition-colors focus-visible:outline-2 focus-visible:outline-neon-bright",
                  avatar === value ? "border-neon bg-neon/15" : "border-transparent hover:border-edge-soft hover:bg-crt",
                )}
              >
                {avatar}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
