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

### Sur mobile et sur ordinateur

Mobile et tablette : barre flottante translucide à 3 boutons, opaque au toucher puis à 30 % après
3 s d'inactivité, capture photo/vidéo par l'appareil, vibration, multi-touch.

Ordinateur : navigation haute avec raccourcis clavier `1` à `4`, mise en page deux colonnes,
glisser-déposer des souvenirs, et un seul contact suffit pour l'empreinte (maintenir le clic).

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
| `npm run icons` | Régénère les icônes PNG (`tools/make_icons.py`, sans dépendance) |

Le service worker n'est enregistré qu'en production : pour tester le hors-ligne et l'installation,
utilisez `npm run build` puis servez `out/` en HTTP(S).

```bash
npm run build && npx serve out
```

## Déploiement

L'application est exportée en statique (`output: "export"`), donc hébergeable partout.

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
