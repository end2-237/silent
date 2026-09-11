export interface NavItem {
  href: string;
  icon: string;
  label: string;
  short: string;
}

/** Les 3 boutons essentiels de la barre flottante + l'accueil du rituel. */
export const NAV: NavItem[] = [
  { href: "/cartes/", icon: "🎴", label: "Cartes", short: "Cartes" },
  { href: "/souvenirs/", icon: "📸", label: "Souvenirs", short: "Souvenirs" },
  { href: "/coeur/", icon: "❤️", label: "Cœur / Canvas", short: "Cœur" },
];

export const HOME: NavItem = { href: "/", icon: "◎", label: "Rituel", short: "Rituel" };
