import type { MetadataRoute } from "next";

// O manifest é uma rota; com `output: "export"` ela precisa ser estática.
export const dynamic = "force-static";

/**
 * Web app manifest (PWA): permite instalar o planner na tela inicial e abrir
 * em janela própria, sem barra de navegador.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "School Snack Planner",
    short_name: "Lanche",
    description:
      "Monte o planejamento de lanches escolares de segunda a sexta com os alimentos que você já tem em casa. Funciona 100% no navegador.",
    lang: "pt-BR",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fffdf7",
    theme_color: "#fffdf7",
    categories: ["food", "education", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        // Recortável pelo Android em círculo, quadrado etc. (área segura: 80% central).
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
