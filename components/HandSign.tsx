const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export interface HandSignProps {
  /** Identifiant du signe : le fichier public/hands/<id>.png. */
  id: number;
  /** Texte alternatif ; vide pour une illustration purement décorative. */
  label?: string;
  className?: string;
}

/**
 * L'illustration d'un signe, découpée de la planche du jeu
 * (tools/slice_hands.py). Fond détouré, filets des phalanges laissés en
 * transparence : la main se pose sur le carton sans halo.
 */
export default function HandSign({ id, label = "", className }: HandSignProps) {
  return (
    // Image déjà détourée et dimensionnée : next/image n'apporterait rien.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={className}
      src={`${BASE}/hands/${id}.png`}
      alt={label}
      width={220}
      height={440}
      loading="eager"
      decoding="async"
      aria-hidden={label ? undefined : true}
    />
  );
}
