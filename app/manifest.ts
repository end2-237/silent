import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Export statique : le manifeste est écrit une fois au build.
export const dynamic = "force-static";

/** Manifeste PWA : SILENT s'installe comme un launcher natif, en mode sombre. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SILENT — S'aimer au-delà du bruit",
    short_name: "SILENT",
    description:
      "Compagnon du rituel SILENT : une journée d'immersion à deux en communication non-verbale restreinte.",
    lang: "fr",
    dir: "ltr",
    start_url: `${BASE}/`,
    scope: `${BASE}/`,
    display: "standalone",
    orientation: "any",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["lifestyle", "social"],
    icons: [
      { src: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      { src: `${BASE}/icons/icon-maskable-512.png`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Cartes", short_name: "Cartes", url: `${BASE}/cartes/` },
      { name: "Souvenirs", short_name: "Souvenirs", url: `${BASE}/souvenirs/` },
      { name: "Cœur", short_name: "Cœur", url: `${BASE}/coeur/` },
    ],
  };
}
