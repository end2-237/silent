import type { NextConfig } from "next";

/**
 * Export statique : la PWA doit pouvoir vivre sur n'importe quel hébergeur
 * (Vercel, GitHub Pages, un simple dossier servi en HTTPS) et fonctionner
 * hors-ligne une fois installée sur l'écran d'accueil.
 *
 * NEXT_PUBLIC_BASE_PATH permet un déploiement dans un sous-dossier
 * (ex. GitHub Pages : NEXT_PUBLIC_BASE_PATH=/silent npm run build).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
