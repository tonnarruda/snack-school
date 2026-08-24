/**
 * Service worker do School Snack Planner.
 *
 * O app é um site estático sem backend, então tudo que ele precisa para rodar
 * cabe no cache: uma vez visitado, abre offline (na correria da manhã, com
 * internet ruim, o planner ainda funciona).
 *
 * Suba VERSION ao mudar este arquivo: caches de versões antigas são apagados
 * na ativação.
 */
const VERSION = "v2";
const SHELL_CACHE = `snack-school-shell-${VERSION}`;
const ASSET_CACHE = `snack-school-assets-${VERSION}`;

/** Mínimo para a primeira renderização offline. */
const SHELL_URLS = [
  "/",
  "/manifest.webmanifest",
  // A logomarca aparece no topo da tela e no cabeçalho do PDF.
  "/lancho-mark.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then((cache) =>
      // Individualmente: um 404 em ícone não deve abortar a instalação inteira.
      Promise.all(
        SHELL_URLS.map((url) =>
          cache.add(new Request(url, { cache: "reload" })).catch(() => undefined),
        ),
      ),
    ),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key)),
      );
      // Assume as abas já abertas para que a primeira visita também fique offline-ready.
      await self.clients.claim();
    })(),
  );
});

/** Assets versionados por hash no nome: nunca mudam de conteúdo. */
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

/** Ícones, favicon e afins: mudam raramente, revalidam em segundo plano. */
function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/lancho-") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/manifest.webmanifest"
  );
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => undefined);

  return cached ?? (await network) ?? Response.error();
}

/** Navegação: rede primeiro (pega deploys novos), cache como rede reserva. */
async function networkFirstNavigation(request) {
  const cache = await caches.open(SHELL_CACHE);

  try {
    const response = await fetch(request);
    if (response.ok) cache.put("/", response.clone());
    return response;
  } catch {
    const cached = (await cache.match(request)) ?? (await cache.match("/"));
    if (cached) return cached;
    return new Response(
      "<!doctype html><meta charset=\"utf-8\"><title>Offline</title>" +
        "<p style=\"font-family:system-ui;padding:2rem\">Sem conexão e sem versão salva ainda. " +
        "Abra o app uma vez com internet para poder usá-lo offline.</p>",
      { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isImmutableAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
  }
});
