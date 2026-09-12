# SILENT

**PWA compagnon du rituel SILENT — « S'aimer au-delà du bruit ».**

Une journée d'immersion à deux en communication non-verbale restreinte : cinq signes de la main,
un joker, un carnet de trois mots, et une question finale. L'application accompagne le rituel sans
jamais le remplacer — elle reste sombre, silencieuse, et s'efface quand on ne la touche pas.

Le manuel complet de l'expérience (vision, règles, déroulement, budget) est dans
[`docs/MANUEL.md`](docs/MANUEL.md).

## Ce que fait l'application

- **Rituel** (accueil) — chronomètre du silence, les 5 étapes dépliables (titre et durée seulement
  tant qu'on ne les ouvre pas), les 3 jokers avec leur phrase de 10 mots, le carnet de poche limité
  à 3 mots par note, la grille budgétaire repliée.
- **🎴 Cartes** — les 8 signes en cartes à jouer : dos ornementé dessiné en SVG, retournement 3D
  avec tranche et reflet, inclinaison qui suit le doigt. Recto = le geste, verso = l'action.
  Plus les règles spéciales (Joker, Carnet, Code Tactile, Un seul téléphone).
- **📸 Souvenirs** — une photo ou vidéo courte par étape, stockée en local (IndexedDB), puis
  assemblée en planche récapitulative 1080 × 1920 à enregistrer ou partager.
- **❤️ Cœur / Canvas** — deux mains posées ensemble trois secondes : vibration, empreinte gardée
  dans les souvenirs, et révélation de la question du cœur.
- **Les échos** (sur l'écran Cœur) — chacun note les cinq activités de son côté ; les notes de
  l'autre restent scellées tant qu'on ne les a pas demandées, et la demande ne se fait pas avec
  « montre-moi » mais avec une phrase : « J'ai été ébloui par le moment » ou « J'ai entendu ton
  cœur battre ». L'autre ouvre alors ses notes.

### Sur mobile et sur ordinateur

Mobile et tablette : barre flottante translucide à 3 boutons, opaque au toucher puis à 30 % après
3 s d'inactivité, capture photo/vidéo par l'appareil, vibration, multi-touch.

Ordinateur : navigation haute avec raccourcis clavier `1` à `4`, mise en page deux colonnes,
glisser-déposer des souvenirs, et un seul contact suffit pour l'empreinte (maintenir le clic).

## Identité visuelle

Crème et corail : une journée d'amour, pas une veillée. Fond chaud clair, bandeaux en dégradé
ambre → corail, cartes blanches largement arrondies, sous-titres en capitales espacées, champs
clairs. La barre flottante place le Cœur au centre, en bouton d'action surélevé.

| Rôle | Valeur |
| --- | --- |
| Fond | `#fdf6f0` → `#f8e7db` |
| Accent | `#ff5a2e` (corail) |
| Accent secondaire | `#ffa65c` (ambre) |
| Dégradé | `#ffc79a` → `#ff7a45` → `#e8411b` |
| Texte | `#2b1a13`, secondaire `#8a6c5e` |

La marque est la silhouette d'un couple enlacé, détourée et centrée sur un carré arrondi en
dégradé — voir `tools/assets/CREDITS.md` pour la source et la licence, et
`python3 tools/make_icons.py` pour régénérer icônes, favicon et logo d'en-tête.

Les éléments d'arrière-plan (halos flous animés, trame fine, grain) sont purement décoratifs,
inertes au clic, et immobiles si le système demande moins d'animations.

## Vie privée

Rien ne quitte l'appareil : les photos et vidéos vivent dans IndexedDB, les notes et le chronomètre
dans `localStorage`. Aucun serveur, aucun compte, aucune télémétrie.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

| Script | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Export statique dans `out/` |
| `npm run lint` | ESLint (config Next 16) |
| `npm run typecheck` | TypeScript sans émission |
| `npm run icons` | Régénère la marque et les icônes PNG (`tools/make_icons.py`, Pillow requis) |
| `npm run hands` | Redécoupe les huit signes depuis la planche (`tools/slice_hands.py`) |

Le service worker n'est enregistré qu'en production : pour tester le hors-ligne et l'installation,
utilisez `npm run build` puis servez `out/` en HTTP(S).

```bash
npm run build && npx serve out
```

## Déploiement

`npm run build` produit `out/` : **1,2 Mo, 51 fichiers statiques**. Il n'y a rien à exécuter,
aucun serveur Node à faire tourner — juste des fichiers à servir.

### Branche `gh-pages` : le site déjà prêt

`.github/workflows/pages.yml` compile à chaque poussée sur `main` et pousse le résultat dans la
branche **`gh-pages`**, accompagné d'un `Dockerfile` de trois lignes et de la configuration nginx
(`deploy/`). Cette branche ne contient que des fichiers finis : **il n'y a plus rien à construire
nulle part**.

Sur Coolify (ou tout hébergeur qui lit un dépôt) :

| Champ | Valeur |
| --- | --- |
| Branche | `gh-pages` |
| Build Pack | **Dockerfile** |
| Ports Exposes | `80` |

L'hébergeur télécharge `nginx:1.27-alpine-slim` (5 Mo), y copie 1,2 Mo de fichiers, et c'est fini.
Ni Node, ni npm, ni nix — à comparer aux 146 Mo de dépendances et 120 Mo d'environnement nix
qu'exige une construction sur place.

La branche se télécharge aussi en ZIP depuis GitHub : les mêmes fichiers se déposent tels quels
dans n'importe quel dossier servi par un serveur web.

Pour publier plutôt sur GitHub Pages, compiler avec le chemin de base du dépôt
(`NEXT_PUBLIC_BASE_PATH=/silent`) — sinon les liens pointent à la racine du domaine.

### Vercel

Importer le dépôt, ne rien configurer, déployer. Next.js y est natif.

### Nixpacks (Coolify, Railway…)

`nixpacks.toml` décrit la construction : Node 22 seul, `npm ci`, `npm run build`, puis
`node server.mjs`. Attention, `next start` ne sait pas servir un export statique&nbsp;; c'est
`server.mjs` — une cinquantaine de lignes de Node, sans aucune dépendance — qui sert `out/`,
avec les bons types MIME, la page 404, `sw.js` jamais mis en cache et `_next/static` en cache
long. Le port vient de la variable `PORT` (3000 par défaut).

Sur Coolify : build pack **Nixpacks**, port `3000`. La première construction reste lourde —
l'environnement nix pèse environ 120 Mo à télécharger — donc prévoir un délai de build
généreux&nbsp;; les suivantes réutilisent la couche déjà construite. Sur une liaison lente, mieux
vaut publier par GitHub Pages ou envoyer `out/` par `rsync`.

Le même serveur marche en local :

```bash
npm run build && npm start     # http://localhost:3000
```

### Sur son propre serveur

Copier le dossier et pointer le serveur web dessus :

```bash
npm run build
rsync -av --delete out/ utilisateur@serveur:/var/www/silent/
```

N'importe quel nginx, Caddy ou Apache suffit. Deux réglages utiles côté serveur : ne pas mettre
`sw.js` en cache (sinon une ancienne version reste collée sur les appareils installés), et servir
les routes en dossiers (`/cartes/index.html`).

Pour un sous-dossier, indiquer le chemin de base au build :

```bash
NEXT_PUBLIC_BASE_PATH=/silent npm run build
```

Le manifeste, les icônes et le service worker suivent automatiquement ce préfixe.

## Structure

```
app/          routes App Router (rituel, cartes, souvenirs, cœur) + manifeste PWA
components/   coquille, barre flottante, cartes 3D, signes SVG, canvas du cœur
lib/          contenu du rituel, stockage local, IndexedDB, montage canvas
public/       service worker et icônes générées
tools/        générateur d'icônes PNG en Python pur
docs/         manuel opérationnel de l'expérience
```

## Pile technique

Next.js 16 (App Router, export statique), React 19, TypeScript strict, CSS natif — aucune
dépendance d'exécution en plus, pour que l'ensemble démarre vite et fonctionne hors-ligne.
