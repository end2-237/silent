# SILENT — Manuel opérationnel & guide de l'expérience

> « S'aimer au-delà du bruit »

## 1. Vision & objectifs

La parole mal maîtrisée et les répliques impulsives créent du bruit qui altère la clarté des
sentiments. SILENT est un rituel d'immersion d'une journée fondé sur la communication non-verbale
restreinte.

L'objectif est d'obliger le cerveau à désactiver ses réponses automatiques pour réapprendre à
observer, ressentir et évaluer l'impact de chaque geste avant de poser un acte.

## 2. Le guide des signes & règles du jeu

| Signal visuel | Action / signification | Objectif pédagogique |
| --- | --- | --- |
| 1 doigt (index) | « Pause / Laisse-moi réfléchir » | Coupe l'impulsion et la réaction immédiate. |
| 2 doigts (V) | « Je ne te comprends pas / Précise » | Désamorce l'incompréhension sans agressivité. |
| 3 doigts | « Partage ce moment avec moi » | Ancre l'attention sur l'instant présent. |
| 4 doigts (main levée) | « J'ai mal ajusté mon geste / Désolé » | Corrige un écart de conduite instantanément. |
| 5 doigts (main ouverte) | « I love you » | Affirmation et validation affective absolue. |

**Le Joker Parle** : main posée sur le cœur pendant 3 secondes. Donne droit à une seule phrase orale
de 10 mots maximum.

**Le Carnet de Poche** : autorisé pour communiquer les pensées plus complexes. Règle stricte —
3 mots maximum par note.

**Le Code Tactile** : 1 pression sur le poignet = « Je suis là » · 2 pressions = « Regarde-moi ».

## 3. Déroulement étape par étape (durée globale : ~5 h 00)

| Étape | Durée | Contenu |
| --- | --- | --- |
| 1. Goûter & Lancement | 45 min | Installation dans un café calme. Explication du jeu et règlement du goûter. Le silence commence dès la dernière bouchée terminée. |
| 2. Trajet Audio Synchronisé | 30 min | Déplacement côte à côte avec un seul fil d'écouteurs partagé (un côté chacun) relié à une playlist commune. |
| 3. Activité Ludique & Complicité | 1 h 30 | Partie de bowling ou d'arcade. Scores, célébrations et encouragements uniquement par les 5 signes de la main. |
| 4. Observation & Ancrage | 1 h 00 | Pause calme dans un espace vert ou un point de vue. Carnet (3 mots max) pour partager ce qu'on ressent. |
| 5. Clôture & Question du Cœur | 45 min | Fin du silence. Dernier Joker pour poser la question finale. |

Les cinq étapes totalisent 4 h 30 ; la marge de déplacement porte l'expérience à environ 5 h.

**Question finale :**

> À quel endroit précis de la journée, sans que je ne dise un seul mot, as-tu ressenti avec le plus
> de force que mon cœur était entièrement tourné vers le tien ?

## 4. Grille budgétaire prévisionnelle (FCFA)

| Poste de dépense | Description | Budget estimé |
| --- | --- | --- |
| Logistique & Matériel | 2 carnets, stylos, adaptateur audio | 2 000 – 4 000 |
| Étape 1 : Goûter | Boissons + viennoiseries | 3 000 – 6 000 |
| Étape 3 : Bowling / Arcade | Partie ludique à deux | 6 000 – 12 000 |
| Étape 4 : Rafraîchissements | Eaux / jus en pause calme | 2 000 – 4 000 |
| Transports & Marge | Déplacements courts + marge de sécurité | 4 000 – 8 000 |
| **Total** | **Expérience complète** | **17 000 – 34 000 FCFA** |

## 5. Cahier des charges d'interface (PWA « SILENT »)

- **Format PWA** : installable sur l'écran d'accueil comme un launcher natif (mode sombre
  minimaliste).
- **Barre flottante translucide (bottom bar)** : opacité dynamique (100 % lors du toucher, 30 %
  après 3 s d'inactivité), 3 boutons essentiels — [🎴 Cartes] [📸 Souvenirs] [❤️ Cœur / Canvas].
- **Module 1 — Cartes 3D** : 5 cartes miniatures alignées ; la sélection d'une carte déclenche un
  retournement 3D (flip) montrant l'illustration du geste au recto et l'action associée au verso.
- **Module 2 — Galerie Souvenirs** : prise d'une photo / vidéo courte par étape, exportation
  automatique du montage récapitulatif.
- **Module 3 — Canvas & Question du Cœur** : zone tactile pour empreinte haptique simultanée +
  affichage de la question finale.

### Écarts assumés dans l'implémentation

| Point du cahier des charges | Implémentation | Raison |
| --- | --- | --- |
| Barre flottante à 3 boutons | Conservée telle quelle sur mobile et tablette ; sur écran ≥ 1040 px elle laisse place à la barre de navigation haute | Sur ordinateur, deux menus identiques se dupliqueraient ; la barre reste le geste du pouce, le menu haut le geste de la souris. |
| « Montage récapitulatif » | Planche JPEG 1080 × 1920 assemblée dans un canvas (6 vignettes + question finale) | Un montage vidéo exigerait un encodage lourd et fragile en navigateur ; la planche s'enregistre et se partage partout. |
| Empreinte haptique simultanée | 2 contacts sur écran tactile, 1 seul à la souris | Un ordinateur n'a qu'un pointeur : le rituel reste testable sur PC. |
| Ajout hors cahier des charges : **Les échos** | Chacun note les 5 activités de son côté ; pour lire celles de l'autre, on le demande avec « J'ai été ébloui par le moment » ou « J'ai entendu ton cœur battre », et l'autre ouvre ses notes | Prolonge la règle du silence après la journée : on ne réclame pas, on dit ce qu'on a ressenti. |
| « 3 boutons essentiels » | Cartes et Souvenirs encadrent le Cœur, placé au centre en bouton flottant surélevé | Reprend la barre des maquettes de référence, où l'action principale occupe le centre. |
