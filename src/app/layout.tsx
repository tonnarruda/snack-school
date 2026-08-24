import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";
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
  applicationName: "School Snack Planner",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: { url: "/icons/apple-touch-icon.png", sizes: "180x180" },
  },
  appleWebApp: {
    // iOS não lê o manifest: abrir em tela cheia depende destas meta tags.
    capable: true,
    title: "Lanche",
    statusBarStyle: "default",
  },
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
      <body className="min-h-full font-sans">
        {children}
        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
