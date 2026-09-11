"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "./Nav";

const IDLE_MS = 3000;

/** Le Cœur occupe le centre, en bouton d'action flottant. */
const FAB = "/coeur/";
const BAR = [
  NAV.find((item) => item.href === "/cartes/")!,
  NAV.find((item) => item.href === FAB)!,
  NAV.find((item) => item.href === "/souvenirs/")!,
];

/**
 * Barre flottante translucide : opacité pleine au toucher, puis retombée à 30 %
 * après 3 s d'inactivité, pour ne jamais voler la scène au moment vécu.
 */
export default function BottomBar() {
  const pathname = usePathname();
  const [awake, setAwake] = useState(true);
  const [pinned, setPinned] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const wake = () => {
      setAwake(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setAwake(false), IDLE_MS);
    };
    wake();
    const events: (keyof WindowEventMap)[] = ["pointerdown", "pointermove", "keydown", "scroll", "touchstart"];
    events.forEach((event) => window.addEventListener(event, wake, { passive: true }));
    return () => {
      events.forEach((event) => window.removeEventListener(event, wake));
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <nav
      className={`bottombar${awake || pinned ? "" : " is-dim"}`}
      aria-label="Modules de SILENT"
      onPointerEnter={() => setPinned(true)}
      onPointerLeave={() => setPinned(false)}
      onFocusCapture={() => setPinned(true)}
      onBlurCapture={() => setPinned(false)}
    >
      {BAR.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`bottombar__btn${item.href === FAB ? " bottombar__btn--fab" : ""}${
            isActive(item.href) ? " is-active" : ""
          }`}
          aria-current={isActive(item.href) ? "page" : undefined}
        >
          <span className="bottombar__icon" aria-hidden="true">
            {item.icon}
          </span>
          <span className="bottombar__label">{item.short}</span>
        </Link>
      ))}
    </nav>
  );
}
