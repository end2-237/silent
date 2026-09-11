import type { Metadata, Viewport } from "next";
import AppShell from "@/components/AppShell";
import "./globals.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: {
    default: "SILENT — S'aimer au-delà du bruit",
    template: "%s · SILENT",
  },
  description:
    "Compagnon du rituel SILENT : une journée d'immersion à deux en communication non-verbale restreinte. Cartes des signes, souvenirs et question du cœur.",
  applicationName: "SILENT",
  manifest: `${BASE}/manifest.webmanifest`,
  appleWebApp: { capable: true, title: "SILENT", statusBarStyle: "default" },
  icons: {
    icon: [
      { url: `${BASE}/icons/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${BASE}/icons/icon-192.png`, sizes: "192x192", type: "image/png" },
      { url: `${BASE}/icons/icon-512.png`, sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: `${BASE}/icons/apple-touch-icon.png`, sizes: "180x180" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fdf6f0",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
