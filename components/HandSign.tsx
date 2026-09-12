import type { HandVariant } from "@/lib/data";

interface Finger {
  x: number;
  w: number;
  tip: number;
}

/** Index, majeur, annulaire, auriculaire — de gauche à droite. */
const FINGERS: Finger[] = [
  { x: 33, w: 13, tip: 30 },
  { x: 48.5, w: 13, tip: 21 },
  { x: 64, w: 13, tip: 28 },
  { x: 79, w: 12, tip: 44 },
];

const BASE_Y = 102;
const FOLDED_Y = 86;
const FOLDED_H = 20;

export interface HandSignProps {
  /** Nombre de doigts levés (variante « count »). */
  fingers: number;
  variant?: HandVariant;
  /** Écarte index et majeur (signe « V »). */
  spread?: boolean;
  className?: string;
  title?: string;
}

/** Poing fermé, avec les phalanges marquées pour rester lisible en petit. */
function Fist() {
  return (
    <>
      <rect x="30" y="76" width="62" height="62" rx="24" fill="currentColor" fillOpacity="0.9" />
      {[88, 104, 120].map((y) => (
        <rect key={y} x="42" y={y} width="40" height="9" rx="4.5" fill="#000" fillOpacity="0.16" />
      ))}
      <rect x="24" y="96" width="14" height="34" rx="7" fill="currentColor" fillOpacity="0.55" />
      <rect x="46" y="132" width="32" height="24" rx="12" fill="currentColor" fillOpacity="0.55" />
    </>
  );
}

/** Pouce levé (ou baissé par rotation d'un demi-tour). */
function Thumb({ down }: { down?: boolean }) {
  return (
    <g transform={down ? "rotate(180 60 92)" : undefined}>
      <rect
        x="30"
        y="30"
        width="16"
        height="52"
        rx="8"
        fill="currentColor"
        fillOpacity="0.95"
        transform="rotate(-7 38 82)"
      />
      <rect x="32" y="72" width="60" height="62" rx="22" fill="currentColor" fillOpacity="0.9" />
      {[86, 102, 118].map((y) => (
        <rect key={y} x="44" y={y} width="38" height="9" rx="4.5" fill="#000" fillOpacity="0.16" />
      ))}
      <rect x="46" y="128" width="32" height="24" rx="12" fill="currentColor" fillOpacity="0.55" />
    </g>
  );
}

/**
 * Illustration vectorielle d'un signe de la main : les doigts levés sont
 * pleins, les doigts repliés restent visibles en creux pour que le geste soit
 * lisible d'un coup d'œil, même en miniature.
 */
export default function HandSign({
  fingers,
  variant = "count",
  spread = false,
  className,
  title,
}: HandSignProps) {
  const raised = Math.min(4, Math.max(0, fingers === 5 ? 4 : fingers));
  const thumbOut = fingers >= 5;

  return (
    <svg
      className={className}
      viewBox="0 0 120 170"
      role="img"
      aria-label={title ?? `Signe à ${fingers} doigt${fingers > 1 ? "s" : ""}`}
      fill="none"
    >
      {title ? <title>{title}</title> : null}

      {variant === "fist" ? <Fist /> : null}
      {variant === "thumb-up" || variant === "thumb-down" ? (
        <Thumb down={variant === "thumb-down"} />
      ) : null}

      {variant === "count" ? (
        <>
          {/* Pouce */}
          {thumbOut ? (
            <rect
              x="8"
              y="96"
              width="13"
              height="40"
              rx="6.5"
              fill="currentColor"
              fillOpacity="0.92"
              transform="rotate(-28 14.5 136)"
            />
          ) : (
            <rect x="26" y="116" width="38" height="14" rx="7" fill="currentColor" fillOpacity="0.38" />
          )}

          {/* Doigts */}
          {FINGERS.map((finger, index) => {
            const isRaised = index < raised;
            const cx = finger.x + finger.w / 2;
            const tilt = spread && isRaised && index < 2 ? (index === 0 ? -11 : 11) : 0;
            return (
              <rect
                key={index}
                x={finger.x}
                y={isRaised ? finger.tip : FOLDED_Y}
                width={finger.w}
                height={isRaised ? BASE_Y - finger.tip : FOLDED_H}
                rx={finger.w / 2}
                fill="currentColor"
                fillOpacity={isRaised ? 0.95 : 0.28}
                transform={tilt ? `rotate(${tilt} ${cx} ${BASE_Y})` : undefined}
              />
            );
          })}

          {/* Paume et poignet */}
          <rect x="29" y="84" width="64" height="62" rx="23" fill="currentColor" fillOpacity="0.88" />
          <rect x="44" y="138" width="34" height="24" rx="12" fill="currentColor" fillOpacity="0.55" />
        </>
      ) : null}
    </svg>
  );
}
