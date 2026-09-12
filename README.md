# SILENT

**PWA compagnon du rituel SILENT — « S'aimer au-delà du bruit ».**

Une journée d'immersion à deux en communication non-verbale restreinte : cinq signes de la main,
un joker, un carnet de trois mots, et une question finale. L'application accompagne le rituel sans
jamais le remplacer — elle reste sombre, silencieuse, et s'efface quand on ne la touche pas.

Le manuel complet de l'expérience (vision, règles, déroulement, budget) est dans
[`docs/MANUEL.md`](docs/MANUEL.md).

## Ce que fait l'application

- **Rituel** (accueil) — chronomètre du silence, les 5 étapes dépliables, les 3 jokers avec leur
  phrase de 10 mots, le carnet de poche limité à 3 mots par note, la grille budgétaire.
- **🎴 Cartes** — les 5 signes en cartes à jouer : dos ornementé dessiné en SVG, retournement 3D,
  recto = le geste, verso = l'action et son objectif pédagogique. Plus les règles spéciales
  (Joker, Carnet, Code Tactile).
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

Le service worker n'est enregistré qu'en production : pour tester le hors-ligne et l'installation,
utilisez `npm run build` puis servez `out/` en HTTP(S).

```bash
npm run build && npx serve out
```

## Déploiement

L'application est exportée en statique (`output: "export"`), donc hébergeable partout.

### Docker (Coolify, Dokku, Portainer, VPS…)

Le dépôt contient un `Dockerfile` en deux étapes : Node 22 compile l'export, puis nginx 1.27 sert
`out/`. L'image finale ne contient ni Node ni `node_modules`.

```bash
docker build -t silent .
docker run --rm -p 8080:80 silent   # http://localhost:8080
```

**Sur Coolify**, choisir le build pack **Dockerfile** (et non Nixpacks) dans
*Configuration → General*, et exposer le port **80**. Nixpacks échoue sur les petites machines :
l'installation de l'environnement nix dépasse largement le délai de build, avant même d'avoir
installé les dépendances npm.

#### Combien de temps, et pourquoi

Ce qui est servi est minuscule : **1,2 Mo au total, 51 fichiers**, environ 650 Ko au premier
chargement. Le temps de déploiement ne vient pas de l'application mais de l'outillage qui la
fabrique : `node_modules` pèse **567 Mo pour 3 dépendances d'exécution**, l'essentiel étant les
binaires natifs de Next (`next` + `@next` = 386 Mo).

| Étape | Coût |
| --- | --- |
| `npm ci` | ~15 s ici, quelques minutes sur une petite machine |
| `next build` | ~5 s |
| Images de base (`node:22-alpine`, `nginx:1.27-alpine`) | ~70 Mo, téléchargées une seule fois |
| Image finale poussée | quelques Mo : ni Node, ni `node_modules` |

La couche `npm ci` est réutilisée telle quelle tant que `package-lock.json` ne change pas : un
déploiement qui ne touche que du code ne réinstalle rien. Sur Coolify, vérifier que l'option
*Force rebuild without cache* est **désactivée**, sinon chaque déploiement repart de zéro.

La configuration nginx (`docker/nginx.conf`) sert les routes exportées en dossiers
(`/cartes/index.html`), interdit la mise en cache de `sw.js` — sinon une ancienne version reste
collée sur les appareils installés — et met les fichiers hachés de `_next/static` en cache long.

### Autres hébergeurs

- **Vercel / Netlify / tout hébergeur statique** : servir le dossier `out/`.
- **Sous-dossier** (GitHub Pages par exemple) : renseigner le chemin de base au build.

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
