# Consignes pour Claude (dossier terrarium)

Le but du projet est de converger vers un **outil de production de vidéos TikTok de qualité et virales**. Le carnet de bord est dans `production/`.

## Au début de chaque session

Lire `production/ETAT.md` et `production/FEUILLE-DE-ROUTE.md` avant de proposer ou de modifier quoi que ce soit.

## À la fin de chaque session (ou après un changement notable)

- `production/ETAT.md` : mettre à jour ce qui marche, les limites connues et la date.
- `production/FEUILLE-DE-ROUTE.md` : changer les statuts, ajouter les étapes découvertes, garder les priorités à jour.
- `production/DECISIONS.md` : ajouter une entrée pour toute décision qui engage la suite (raison et alternatives écartées).
- `production/APPRENTISSAGES.md` : après chaque relevé de `videos/resultats.csv`, écrire ce qu'on en conclut et l'état des hypothèses.

## Règles de travail

- Le scénario JSON (`videos/scenarios/`) est la source : ne jamais retoucher une composition générée à la main.
- Avant de livrer une vidéo : `npm test`, `node scripts/build-video.js`, `node scripts/verifier-videos.js`, `npx hyperframes lint`, puis le rendu.
- Le moteur (`public/js/film/film.js`) ne doit contenir ni minuterie, ni hasard non reproductible, ni répétition infinie (un test le vérifie).
- Tout le texte destiné à l'utilisateur est en français.
