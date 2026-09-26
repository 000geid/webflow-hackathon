import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource/silkscreen/400.css";
import "@fontsource/silkscreen/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Rush | ¿Qué ***** es esta imagen?",
  description: "Frená el reloj antes que tus amigos y demostrá quién manda.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
