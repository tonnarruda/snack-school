"use client";

import { useEffect } from "react";

/**
 * Registra o service worker (`public/sw.js`) que deixa o app usável offline.
 *
 * Só em produção: em `next dev` o service worker serviria assets em cache por
 * cima do HMR. Não renderiza nada.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/", updateViaCache: "none" })
        .catch(() => {
          // Sem service worker o app continua funcionando — só perde o offline.
        });
    };

    // Espera o load para não disputar banda com o primeiro render.
    if (document.readyState === "complete") {
      register();
      return;
    }

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}
