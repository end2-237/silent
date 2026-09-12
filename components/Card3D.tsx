"use client";

import { useId, useRef, useState } from "react";

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

/** Inclinaison maximale sous le doigt ou la souris, en degrés. */
const TILT = 9;

/**
 * Carte à retournement 3D. Recto : l'illustration du geste. Verso : l'action
 * associée. La carte s'incline sous le doigt comme un vrai carton, garde une
 * tranche visible pendant la rotation, et se retourne d'un seul geste fluide.
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
  const tilt = useRef<HTMLSpanElement>(null);

  const toggle = () => {
    const next = !isFlipped;
    if (!controlled) setInternal(next);
    onFlip?.(next);
  };

  /** Incline la carte vers le point touché, comme un carton tenu en main. */
  const follow = (event: React.PointerEvent<HTMLButtonElement>) => {
    const node = tilt.current;
    if (!node) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    node.style.setProperty("--ry", `${x * TILT * 2}deg`);
    node.style.setProperty("--rx", `${-y * TILT * 2}deg`);
    node.style.setProperty("--glare", "1");
  };

  const release = () => {
    const node = tilt.current;
    if (!node) return;
    node.style.setProperty("--ry", "0deg");
    node.style.setProperty("--rx", "0deg");
    node.style.setProperty("--glare", "0");
  };

  return (
    <button
      type="button"
      className={`card3d card3d--${size}${isFlipped ? " is-flipped" : ""}${className ? ` ${className}` : ""}`}
      onClick={toggle}
      onPointerMove={follow}
      onPointerLeave={release}
      onPointerCancel={release}
      aria-pressed={isFlipped}
      aria-label={isFlipped ? `${label} — voir le geste` : `${label} — voir l'action`}
      aria-describedby={id}
    >
      <span className="card3d__tilt" ref={tilt}>
        <span className="card3d__inner">
          {/* Tranche du carton : donne l'épaisseur pendant la rotation. */}
          <span className="card3d__edge" aria-hidden="true" />
          <span className="card3d__face card3d__face--front" aria-hidden={isFlipped}>
            {front}
            <span className="card3d__glare" aria-hidden="true" />
          </span>
          <span className="card3d__face card3d__face--back" aria-hidden={!isFlipped}>
            {back}
            <span className="card3d__glare" aria-hidden="true" />
          </span>
        </span>
      </span>
      <span id={id} className="sr-only">
        Carte {label}. Activer pour retourner.
      </span>
    </button>
  );
}
