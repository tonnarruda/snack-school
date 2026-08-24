import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Sem backend: o app é exportado como site estático (PRD §4 e §22).
  output: "export",
  // Sem servidor não há otimização sob demanda: as imagens vão como estão.
  images: { unoptimized: true },
};

export default nextConfig;
