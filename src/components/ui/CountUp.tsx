"use client";

import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  /** Segundos. */
  duration?: number;
  delay?: number;
  suffix?: string;
}

/** Número que "cuenta" hasta su valor. Con movimiento reducido, muestra el valor final directo. */
export function CountUp({ value, duration = 1.1, delay = 0.35, suffix = "" }: CountUpProps) {
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [value, duration, delay, reduceMotion]);

  return (
    <>
      {(reduceMotion ? value : display).toLocaleString("es-AR")}
      {suffix}
    </>
  );
}
