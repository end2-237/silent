/** Contenu éditorial de SILENT — source unique de vérité du rituel. */

export type SignId = 1 | 2 | 3 | 4 | 5;

export interface Sign {
  id: SignId;
  /** Nombre de doigts levés dessinés au recto de la carte. */
  fingers: SignId;
  /** Doigts écartés en V (signe n°2). */
  spread?: boolean;
  label: string;
  gesture: string;
  meaning: string;
  purpose: string;
}

export const SIGNS: Sign[] = [
  {
    id: 1,
    fingers: 1,
    label: "Un doigt",
    gesture: "Index levé",
    meaning: "Pause / Laisse-moi réfléchir",
    purpose: "Coupe l'impulsion et la réaction immédiate.",
  },
  {
    id: 2,
    fingers: 2,
    spread: true,
    label: "Deux doigts",
    gesture: "Index + majeur en V",
    meaning: "Je ne te comprends pas / Précise",
    purpose: "Désamorce l'incompréhension sans agressivité.",
  },
  {
    id: 3,
    fingers: 3,
    label: "Trois doigts",
    gesture: "Index, majeur, annulaire",
    meaning: "Partage ce moment avec moi",
    purpose: "Ancre l'attention sur l'instant présent.",
  },
  {
    id: 4,
    fingers: 4,
    label: "Quatre doigts",
    gesture: "Main levée, pouce replié",
    meaning: "J'ai mal ajusté mon geste / Désolé",
    purpose: "Corrige un écart de conduite instantanément.",
  },
  {
    id: 5,
    fingers: 5,
    label: "Cinq doigts",
    gesture: "Main grande ouverte",
    meaning: "I love you",
    purpose: "Affirmation et validation affective absolue.",
  },
];

export interface SpecialRule {
  id: "joker" | "carnet" | "tactile";
  icon: string;
  label: string;
  rule: string;
  detail: string;
}

export const SPECIAL_RULES: SpecialRule[] = [
  {
    id: "joker",
    icon: "🤍",
    label: "Le Joker Parle",
    rule: "Main posée sur le cœur pendant 3 secondes.",
    detail: "Donne droit à une seule phrase orale de 10 mots maximum.",
  },
  {
    id: "carnet",
    icon: "✎",
    label: "Le Carnet de Poche",
    rule: "Autorisé pour les pensées plus complexes.",
    detail: "Règle stricte : 3 mots maximum par note.",
  },
  {
    id: "tactile",
    icon: "✋",
    label: "Le Code Tactile",
    rule: "1 pression sur le poignet = « Je suis là ».",
    detail: "2 pressions = « Regarde-moi ».",
  },
];

export interface Step {
  id: number;
  title: string;
  minutes: number;
  summary: string;
  details: string[];
}

/** Déroulement complet : ~5 h 00. */
export const STEPS: Step[] = [
  {
    id: 1,
    title: "Goûter & Lancement",
    minutes: 45,
    summary: "Installation dans un café calme, explication du jeu, règlement du goûter.",
    details: [
      "Choisir une table à l'écart du passage et du bruit.",
      "Relire les 5 signes ensemble, à voix haute, une dernière fois.",
      "Régler l'addition avant de commencer : plus aucune négociation orale après.",
      "Le silence commence dès la dernière bouchée terminée.",
    ],
  },
  {
    id: 2,
    title: "Trajet Audio Synchronisé",
    minutes: 30,
    summary: "Déplacement côte à côte, un seul fil d'écouteurs partagé.",
    details: [
      "Un écouteur chacun, playlist commune préparée à l'avance.",
      "Marcher au même rythme : le pas devient la première conversation.",
      "Code tactile autorisé : 1 pression = « Je suis là », 2 = « Regarde-moi ».",
    ],
  },
  {
    id: 3,
    title: "Activité Ludique & Complicité",
    minutes: 90,
    summary: "Bowling ou arcade. Scores, célébrations et encouragements aux 5 signes.",
    details: [
      "Les scores se gèrent au tableau, jamais à la voix.",
      "Célébrer uniquement avec les mains : 3 doigts pour partager, 5 pour valider.",
      "Le signe 4 (désolé) sert aussi après une charrie qui tombe mal.",
    ],
  },
  {
    id: 4,
    title: "Observation & Ancrage",
    minutes: 60,
    summary: "Pause calme dans un espace vert ou sur un point de vue.",
    details: [
      "S'asseoir face au même paysage, pas face à face.",
      "Carnet de poche : 3 mots maximum par note, jamais plus.",
      "Observer l'autre avant d'écrire : que ressent-il, là, maintenant ?",
    ],
  },
  {
    id: 5,
    title: "Clôture & Question du Cœur",
    minutes: 45,
    summary: "Fin du silence, dernier Joker, question finale.",
    details: [
      "Poser les deux mains sur le canvas, ensemble, trois secondes.",
      "Le silence ne se rompt qu'après la question.",
      "Écouter la réponse sans rien ajouter : c'est le dernier geste du rituel.",
    ],
  },
];

export const FINAL_QUESTION =
  "À quel endroit précis de la journée, sans que je ne dise un seul mot, as-tu ressenti avec le plus de force que mon cœur était entièrement tourné vers le tien ?";

export interface BudgetLine {
  post: string;
  description: string;
  min: number;
  max: number;
}

/** Grille budgétaire prévisionnelle, en FCFA. */
export const BUDGET: BudgetLine[] = [
  { post: "Logistique & Matériel", description: "2 carnets, stylos, adaptateur audio", min: 2000, max: 4000 },
  { post: "Étape 1 : Goûter", description: "Boissons + viennoiseries", min: 3000, max: 6000 },
  { post: "Étape 3 : Bowling / Arcade", description: "Partie ludique à deux", min: 6000, max: 12000 },
  { post: "Étape 4 : Rafraîchissements", description: "Eaux / jus en pause calme", min: 2000, max: 4000 },
  { post: "Transports & Marge", description: "Déplacements courts + marge de sécurité", min: 4000, max: 8000 },
];

export const BUDGET_TOTAL = BUDGET.reduce(
  (acc, line) => ({ min: acc.min + line.min, max: acc.max + line.max }),
  { min: 0, max: 0 },
);

/** Somme des cinq étapes : 4 h 30. */
export const TOTAL_MINUTES = STEPS.reduce((acc, step) => acc + step.minutes, 0);

/** Durée globale annoncée, marge de déplacement comprise : ~5 h. */
export const RITUAL_MINUTES = 300;

export function formatFcfa(value: number): string {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
