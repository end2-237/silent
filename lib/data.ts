/** Contenu éditorial de SILENT — source unique de vérité du rituel. */

export type SignId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface Sign {
  /** Sert aussi de nom de fichier : public/hands/<id>.png. */
  id: SignId;
  label: string;
  gesture: string;
  meaning: string;
  purpose: string;
  /** Carte de sécurité : hors du décompte, utilisable sans limite. */
  safety?: boolean;
}

export const SIGNS: Sign[] = [
  {
    id: 0,
    safety: true,
    label: "Poing fermé",
    gesture: "Poing levé, bras tendu",
    meaning: "J'arrête le jeu / parlons",
    purpose: "Frein d'urgence. Gratuit, illimité, sans justification à donner.",
  },
  {
    id: 1,
    label: "Un doigt",
    gesture: "Index levé",
    meaning: "Pause / Laisse-moi réfléchir",
    purpose: "Coupe l'impulsion et la réaction immédiate.",
  },
  {
    id: 2,
    label: "Deux doigts",
    gesture: "Index + majeur en V",
    meaning: "Je ne te comprends pas / Précise",
    purpose: "Désamorce l'incompréhension sans agressivité.",
  },
  {
    id: 3,
    label: "Trois doigts",
    gesture: "Index, majeur, annulaire",
    meaning: "Partage ce moment avec moi",
    purpose: "Ancre l'attention sur l'instant présent.",
  },
  {
    id: 4,
    label: "Quatre doigts",
    gesture: "Main levée, pouce replié",
    meaning: "J'ai mal ajusté mon geste / Désolé",
    purpose: "Corrige un écart de conduite instantanément.",
  },
  {
    id: 5,
    label: "Cinq doigts",
    gesture: "Main grande ouverte",
    meaning: "I love you",
    purpose: "Affirmation et validation affective absolue.",
  },
  {
    id: 6,
    label: "Pouce levé",
    gesture: "Poing, pouce vers le haut",
    meaning: "Oui",
    purpose: "Répond aux questions fermées, qu'aucun autre signe ne couvre.",
  },
  {
    id: 7,
    label: "Pouce baissé",
    gesture: "Poing, pouce vers le bas",
    meaning: "Non",
    purpose: "L'autre moitié de la réponse : sans elle, on invente des gestes.",
  },
];

export interface SpecialRule {
  id: "joker" | "carnet" | "tactile" | "telephone";
  label: string;
  rule: string;
  detail: string;
}

export const SPECIAL_RULES: SpecialRule[] = [
  {
    id: "joker",
    label: "Le Joker Parle",
    rule: "Main posée sur le cœur pendant 3 secondes.",
    detail: "Donne droit à une seule phrase orale de 10 mots maximum.",
  },
  {
    id: "carnet",
    label: "Le Carnet de Poche",
    rule: "Autorisé pour les pensées plus complexes.",
    detail: "Règle stricte : 3 mots maximum par note.",
  },
  {
    id: "tactile",
    label: "Le Code Tactile",
    rule: "1 pression sur le poignet = « Je suis là ».",
    detail: "2 pressions = « Regarde-moi ».",
  },
  {
    id: "telephone",
    label: "Un seul téléphone",
    rule: "Une seule personne le porte, en mode avion.",
    detail: "L'autre n'y touche pas de la journée.",
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
    minutes: 45,
    summary: "Bowling ou arcade. Scores, célébrations et encouragements aux 5 signes.",
    details: [
      "45 minutes suffisent : au-delà, le bruit du lieu couvre votre silence.",
      "Les scores se gèrent au tableau, jamais à la voix.",
      "Célébrer uniquement avec les mains : 3 doigts pour partager, 5 pour valider.",
      "Une activité calme et coopérative fait aussi bien : marché, cuisine, puzzle.",
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
      "Plan B pluie : repérer d'avance un lieu couvert et calme, galerie ou salon de thé.",
    ],
  },
  {
    id: 5,
    title: "Clôture & Question du Cœur",
    minutes: 45,
    summary: "Fin du silence, dernier Joker, question finale.",
    details: [
      "Poser les deux mains sur le canvas, ensemble, trois secondes.",
      "Apprendre la question courte par cœur : on ne la lit pas sur un écran.",
      "Le silence ne se rompt qu'après la question.",
      "Écouter la réponse sans rien ajouter : c'est le dernier geste du rituel.",
    ],
  },
];

/** Celle qu'on prononce : courte, tenable après cinq heures de silence. */
export const FINAL_QUESTION = "Quand as-tu senti mon cœur le plus fort, aujourd'hui ?";

/** La version d'origine, gardée pour l'écrit. */
export const FINAL_QUESTION_LONG =
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
  { post: "Étape 3 : Bowling / Arcade", description: "Partie ludique à deux, 45 min", min: 4000, max: 9000 },
  { post: "Étape 4 : Rafraîchissements", description: "Eaux / jus en pause calme", min: 2000, max: 4000 },
  { post: "Transports & Marge", description: "Déplacements courts + marge de sécurité", min: 4000, max: 8000 },
];

export const BUDGET_TOTAL = BUDGET.reduce(
  (acc, line) => ({ min: acc.min + line.min, max: acc.max + line.max }),
  { min: 0, max: 0 },
);

/** Somme des cinq étapes : 3 h 45. */
export const TOTAL_MINUTES = STEPS.reduce((acc, step) => acc + step.minutes, 0);

/** Durée globale annoncée, marge de déplacement comprise : ~4 h 15. */
export const RITUAL_MINUTES = 255;

export function formatFcfa(value: number): string {
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} h` : `${h} h ${String(m).padStart(2, "0")}`;
}
