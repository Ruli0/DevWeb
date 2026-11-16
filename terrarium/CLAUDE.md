# Consignes pour Claude (dossier terrarium)

Le but du projet est de converger vers un **outil de production de vidéos TikTok de qualité et virales**. Le carnet de bord est dans `production/`.

## Au début de chaque session

**Le cap est la chaîne « avis »** (depuis le 15 nov. 2026, branche `claude/busy-feynman-m0q7yp`) : l'auteur parle librement, l'outil habille sa voix (sous-titres, décors, 3D). Dans cet ordre :

1. `bash scripts/installer.sh` : prépare la session (dépendances, CLI de rendu, tests) ;
2. `production/PASSATION-AVIS.md` : la section 0 suffit pour fabriquer une vidéo ; le reste se lit au besoin ;
3. le skill `avis` (dans `.claude/skills/`, à la racine du dépôt) pour monter une vidéo ;
4. selon le besoin : `production/ACCROCHES.md`, `IDEES-VIDEOS.md`, `DA-AVIS.md`.

### Archives (ne pas faire évoluer sans demande)

- **V3 « cerveau et santé »** (14 nov. 2026), mise en attente : `production/BRIEF-V3.md`, `DA-V3.md`, `PLAN-V3.md`, `SOURCES.md`, `GUIDE-EXECUTION.md` ; skills `episode`, `sources`, `apercu`, `rendu`, `scene`, `style`.
- **L'univers du terrarium** (animaux, Mousse, épisodes `demo`, `nuit-1`, `jugement`) ; `PLAN-REFONTE.md` et `SPEC-STUDIO.md` sont des documents d'histoire.

## À la fin de chaque session (ou après un changement notable)

- `production/ETAT.md` : mettre à jour ce qui marche, les limites connues et la date.
- `production/FEUILLE-DE-ROUTE.md` : changer les statuts, ajouter les étapes découvertes, garder les priorités à jour.
- `production/DECISIONS.md` : ajouter une entrée pour toute décision qui engage la suite (raison et alternatives écartées).
- `production/APPRENTISSAGES.md` : après chaque relevé de `videos/resultats.csv`, écrire ce qu'on en conclut et l'état des hypothèses.

## Règles de travail

- L'épisode JSON (`videos/episodes/`) est la source : ne jamais retoucher une composition générée à la main.
- Avant de livrer une vidéo : `npm test`, `npm run video -- <id>` (planche regardée, conseils d'accroche lus), le contrôle `hyperframes lint`, puis le rendu.
- Le moteur (`public/js/film/film.js`) ne doit contenir ni minuterie, ni hasard non reproductible, ni répétition infinie (un test le vérifie).
- Tout le texte destiné à l'utilisateur est en français.
