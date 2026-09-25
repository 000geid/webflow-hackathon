import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pixel Rush",
  description: "Adivina la imagen antes de que se acabe el tiempo.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={`${GeistSans.variable} font-sans`}>{children}</body>
    </html>
  );
}
