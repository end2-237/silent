/**
 * Éléments d'arrière-plan : halos colorés flous et grain léger, posés
 * derrière toute l'application. Purement décoratif, jamais cliquable.
 */
export default function Backdrop() {
  return (
    <div className="backdrop" aria-hidden="true">
      <span className="backdrop__orb backdrop__orb--magenta" />
      <span className="backdrop__orb backdrop__orb--violet" />
      <span className="backdrop__orb backdrop__orb--indigo" />
      <span className="backdrop__grid" />
      <span className="backdrop__grain" />
    </div>
  );
}
