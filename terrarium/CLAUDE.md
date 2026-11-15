# Consignes pour Claude (dossier terrarium)

Le but du projet est de converger vers un **outil de production de vidéos TikTok de qualité et virales**. Le carnet de bord est dans `production/`.

## Au début de chaque session

**Le cap actuel est la V3** (14 nov. 2026) : des vidéos de 30 à 60 s pour adultes, sur le cerveau et la santé, études à l'appui. Lire dans cet ordre :

1. `production/BRIEF-V3.md` : la mission, ce qu'on garde, ce qu'on abandonne ;
2. `production/DA-V3.md` : la direction artistique « éditorial scientifique » ;
3. `production/PLAN-V3.md` : les étapes, une à la fois, avec une seule question à l'utilisateur par étape ;
4. `production/SOURCES.md` : aucun chiffre à l'écran sans fiche de source vérifiée ;
5. `production/GUIDE-EXECUTION.md` : commandes, rendu déterministe, pièges connus.

Des skills de projet existent dans `.claude/skills/` (à la racine du dépôt) : `episode`, `sources`, `apercu`, `rendu`, `scene`, `style`. Les utiliser, et les tenir à jour quand la chaîne change.

L'univers du terrarium (animaux, Mousse, épisodes `demo`, `nuit-1`, `jugement`) est archivé : ne pas le faire évoluer. `PLAN-REFONTE.md` et `SPEC-STUDIO.md` sont des documents d'histoire.

## À la fin de chaque session (ou après un changement notable)

- `production/ETAT.md` : mettre à jour ce qui marche, les limites connues et la date.
- `production/FEUILLE-DE-ROUTE.md` : changer les statuts, ajouter les étapes découvertes, garder les priorités à jour.
- `production/DECISIONS.md` : ajouter une entrée pour toute décision qui engage la suite (raison et alternatives écartées).
- `production/APPRENTISSAGES.md` : après chaque relevé de `videos/resultats.csv`, écrire ce qu'on en conclut et l'état des hypothèses.

## Règles de travail

- L'épisode JSON (`videos/episodes/`) est la source : ne jamais retoucher une composition générée à la main.
- Avant de livrer une vidéo : `npm test`, `npm run video -- <id>` (planche regardée), `npx hyperframes lint`, puis le rendu (skill `rendu`).
- Le moteur (`public/js/film/film.js`) ne doit contenir ni minuterie, ni hasard non reproductible, ni répétition infinie (un test le vérifie).
- Tout le texte destiné à l'utilisateur est en français.
