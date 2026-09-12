# Sources graphiques

- `couple.jpg` — silhouette d'un couple enlacé, fournie par le propriétaire du projet et utilisée
  comme base de la marque SILENT (icônes PWA, logo de l'en-tête). Le fichier vient d'un pack de
  ressources vectorielles du commerce (fichiers `.ai` / `.eps` d'origine non versionnés).

  **À vérifier avant toute diffusion publique** : la licence d'origine du pack. Les licences
  gratuites de ce type de banque d'images exigent souvent une attribution visible, et interdisent
  l'enregistrement de l'image comme marque déposée. En cas de doute, acheter la licence étendue ou
  refaire le tracé.

- `signes.jfif` — planche des huit signes de la main, fournie par le propriétaire du projet
  (image générée par Gemini). Elle est découpée en huit illustrations détourées par
  `python3 tools/slice_hands.py`, qui écrit `public/hands/0.png` à `7.png` : fond supprimé, filets
  des phalanges laissés en transparence, 440 px de haut, niveaux de gris + alpha.

Les icônes de l'application sont régénérées par `python3 tools/make_icons.py` (Pillow).
