"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Backdrop from "./Backdrop";
import BottomBar from "./BottomBar";
import { HOME, NAV } from "./Nav";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ROUTES = [HOME, ...NAV];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [install, setInstall] = useState<InstallPromptEvent | null>(null);

  // Service worker : mise en cache de la coquille pour un usage hors-ligne.
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    const register = () => navigator.serviceWorker.register(`${BASE}/sw.js`, { scope: `${BASE}/` }).catch(() => {});
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  // Invitation à installer la PWA (Android / Chrome desktop).
  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setInstall(event as InstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setInstall(null));
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  // Raccourcis clavier sur grand écran : 1 à 4 pour changer de module.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (target?.isContentEditable) return;
      const index = Number(event.key) - 1;
      if (Number.isInteger(index) && index >= 0 && index < ROUTES.length) {
        router.push(ROUTES[index].href);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [router]);

  const isActive = (href: string) => (href === HOME.href ? pathname === HOME.href : pathname.startsWith(href));

  return (
    <div className="shell">
      <Backdrop />
      <a className="skip" href="#contenu">
        Aller au contenu
      </a>

      <header className="topbar">
        <Link href={HOME.href} className="wordmark" aria-label="SILENT — accueil du rituel">
          <span className="wordmark__dot" aria-hidden="true" />
          <span className="wordmark__text">SILENT</span>
        </Link>

        <nav className="topnav" aria-label="Navigation">
          {ROUTES.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`topnav__link${isActive(item.href) ? " is-active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              <span aria-hidden="true" className="topnav__icon">
                {item.icon}
              </span>
              {item.label}
              <kbd className="topnav__kbd" aria-hidden="true">
                {index + 1}
              </kbd>
            </Link>
          ))}
        </nav>

        {install ? (
          <button
            type="button"
            className="btn btn--ghost topbar__install"
            onClick={async () => {
              await install.prompt();
              await install.userChoice;
              setInstall(null);
            }}
          >
            Installer
          </button>
        ) : (
          <span className="topbar__tagline">S&apos;aimer au-delà du bruit</span>
        )}
      </header>

      <main id="contenu" className="main">
        {children}
      </main>

      <BottomBar />
    </div>
  );
}
