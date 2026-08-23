import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "latin-ext"],
});

/** Fonte arredondada para títulos e nomes dos dias. */
const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "School Snack Planner — Monte o lanche da semana",
  description:
    "Monte o planejamento de lanches escolares de segunda a sexta com os alimentos que você já tem em casa. Funciona 100% no navegador.",
};

export const viewport: Viewport = {
  themeColor: "#fffdf7",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${nunito.variable} ${baloo.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
