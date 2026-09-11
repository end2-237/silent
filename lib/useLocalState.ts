"use client";

import { useCallback, useEffect, useState } from "react";

const PREFIX = "silent:";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * État persisté dans localStorage, hydraté après le premier rendu pour rester
 * compatible avec le pré-rendu statique (pas de mismatch serveur/client).
 * `ready` passe à true une fois la valeur réelle relue du stockage.
 */
export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Hydratation après montage : le rendu statique ne connaît pas le
    // stockage de l'appareil, la valeur réelle n'arrive donc qu'ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValue(read(key, initial));
    setReady(true);
    // `initial` est une valeur de départ, on ne re-synchronise que sur la clé.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
    } catch {
      /* quota plein ou mode privé : on continue sans persistance */
    }
  }, [key, value, ready]);

  const reset = useCallback(() => setValue(initial), [initial]);

  return { value, setValue, ready, reset } as const;
}
