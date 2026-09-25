import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/silkscreen/400.css";
import "@fontsource/silkscreen/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Rush AI — Mirá. Frená. Adiviná.",
  description: "Cinco imágenes. Quince segundos. ¿Cuánto necesitás ver para adivinar?",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
