/**
 * Dos de carte à jouer, dessiné en SVG : rosace centrale, arabesques
 * répétées et double filet, dans l'esprit d'un jeu classique — sans aucune
 * image externe, donc net à toutes les tailles et disponible hors-ligne.
 */
export default function CardBack({ className }: { className?: string }) {
  const spokes = Array.from({ length: 20 }, (_, index) => index * 18);

  return (
    <svg className={className} viewBox="0 0 300 420" role="presentation" aria-hidden="true">
      <defs>
        {/* Arabesque élémentaire, répétée sur tout le champ de la carte. */}
        <pattern id="silent-scroll" width="50" height="50" patternUnits="userSpaceOnUse" patternTransform="scale(0.7)">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M6 44c0-16 12-26 22-20s6 22-4 22-12-12-4-16" />
            <path d="M44 6c0 16-12 26-22 20S16 4 26 4s12 12 4 16" />
            <path d="M2 14c8-2 14 2 16 8" />
            <path d="M48 36c-8 2-14-2-16-8" />
          </g>
        </pattern>

        <clipPath id="silent-field">
          <rect x="16" y="16" width="268" height="388" rx="14" />
        </clipPath>
      </defs>

      {/* Carton et marge blanche */}
      <rect x="0" y="0" width="300" height="420" rx="24" fill="#f4f1ea" />
      <rect x="16" y="16" width="268" height="388" rx="14" fill="#fdfbf7" />

      {/* Champ d'arabesques */}
      <g clipPath="url(#silent-field)" color="currentColor" opacity="0.75">
        <rect x="16" y="16" width="268" height="388" fill="url(#silent-scroll)" />
      </g>

      {/* Double filet */}
      <rect
        x="16"
        y="16"
        width="268"
        height="388"
        rx="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
      />
      <rect
        x="24"
        y="24"
        width="252"
        height="372"
        rx="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.7"
      />

      {/* Rosace centrale */}
      <g transform="translate(150 210)" color="currentColor">
        <circle r="74" fill="#fdfbf7" stroke="currentColor" strokeWidth="2.5" />
        <circle r="66" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.8" />
        {spokes.map((angle) => (
          <ellipse
            key={angle}
            cx="0"
            cy="-44"
            rx="4.6"
            ry="16"
            fill="currentColor"
            opacity="0.85"
            transform={`rotate(${angle})`}
          />
        ))}
        <circle r="22" fill="currentColor" />
        <circle r="13" fill="#fdfbf7" />
        <circle r="6" fill="currentColor" />
      </g>
    </svg>
  );
}
