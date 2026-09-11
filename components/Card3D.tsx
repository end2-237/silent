"use client";

import { useId, useState } from "react";

export interface Card3DProps {
  front: React.ReactNode;
  back: React.ReactNode;
  label: string;
  /** Pilotage externe du retournement (sinon la carte gère son propre état). */
  flipped?: boolean;
  onFlip?: (flipped: boolean) => void;
  size?: "hero" | "mini";
  className?: string;
}

/**
 * Carte à retournement 3D. Recto : l'illustration du geste. Verso : l'action
 * associée. Clic, Entrée ou Espace retournent la carte ; le contenu caché est
 * masqué aux lecteurs d'écran pour ne pas lire les deux faces à la fois.
 */
export default function Card3D({
  front,
  back,
  label,
  flipped,
  onFlip,
  size = "hero",
  className = "",
}: Card3DProps) {
  const controlled = flipped !== undefined;
  const [internal, setInternal] = useState(false);
  const isFlipped = controlled ? flipped : internal;
  const id = useId();

  const toggle = () => {
    const next = !isFlipped;
    if (!controlled) setInternal(next);
    onFlip?.(next);
  };

  return (
    <button
      type="button"
      className={`card3d card3d--${size}${isFlipped ? " is-flipped" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggle}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `${label} — voir le geste` : `${label} — voir l'action`}
      aria-describedby={id}
    >
      <span className="card3d__inner">
        <span className="card3d__face card3d__face--front" aria-hidden={isFlipped}>
          {front}
        </span>
        <span className="card3d__face card3d__face--back" aria-hidden={!isFlipped}>
          {back}
        </span>
      </span>
      <span id={id} className="sr-only">
        Carte {label}. Activer pour retourner.
      </span>
    </button>
  );
}
