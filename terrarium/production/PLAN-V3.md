# Plan d'exécution V3

_Écrit le 14 novembre 2026. À lire après `BRIEF-V3.md` et `DA-V3.md`. Une étape à la fois : à la fin de chacune, on montre quelque chose à l'utilisateur et on pose une seule question._

## Vue d'ensemble

| # | Étape | Modèle conseillé | Ce que l'utilisateur valide | Critère de fin |
|---|---|---|---|---|
| 1 | Maquettes de style | Opus 5.5 | Une variante, ou un mélange | Le style est écrit dans `studio/style.js` et dans `IDENTITE.md` |
| 2 | Musique | Opus 5.5 | Une ambiance | La musique est dans `scripts/build-sons.js`, arrangeable par mesure |
| 3 | Moteur de scènes | Opus 5.5 | Une planche des 9 scènes | Les 9 scènes sont dans le catalogue, tests verts |
| 4 | Pilote « La procrastination » | Opus 5.5 | La planche, puis la vidéo | Vidéo validée, fiche de sources au statut `verifie` |
| 5 | Preuve de réutilisation | Sonnet 5.5 | La vidéo, et son coût | Épisode écrit avec le catalogue seul, sans toucher au moteur |
| 6 | Série et mesures | Sonnet 5.5 | Ce qu'on garde ou change | 5 épisodes, 3 publications mesurées |

Les étapes 1 à 4 demandent du jugement visuel et de la conception : elles vont au modèle le plus capable. Les étapes 5 et 6 sont cadrées par le catalogue, les skills et les contrôles : elles vont à Sonnet. L'étape 5 est le vrai test de l'outil : si Sonnet n'y arrive pas avec le catalogue seul, c'est l'outil qu'il faut corriger, pas l'épisode.

## Étape 1 : les maquettes de style

**But** : faire choisir la palette et la typographie sur des images, avant d'écrire le moteur.

1. Créer `essais/style-v3/maquettes.cjs`, sur le modèle de `essais/psycho-styles/maquettes.cjs` (une page HTML par maquette, capturée avec Playwright, assemblée en planche avec ffmpeg).
2. Dessiner le **cerveau de profil au trait** (voir `DA-V3.md`, section 6). C'est l'élément le plus difficile : y passer le temps qu'il faut, vérifier la position des zones, le regarder en grand.
3. Faire les 3 variantes de `DA-V3.md`, section 9, chacune sur 2 scènes : `chiffre` et `cerveau`. Soit 6 images, en une planche.
4. Regarder la planche soi-même et corriger avant d'envoyer : lisibilité sur téléphone, alignements, test « livre pour enfants ».
5. Envoyer la planche. **Question** : quelle variante, ou quel mélange ?
6. Sur la variante retenue, faire un **test de mouvement de 5 s** (le chiffre qui compte, puis se transforme en zone du cerveau qui s'allume), avec SplitText, DrawSVG et MorphSVG. L'envoyer en MP4. **Question** : le mouvement convient-il ?
7. Écrire le style retenu dans `studio/style.js` (couleurs, polices, tailles, durées, courbes) et le noter dans `IDENTITE.md` et `DECISIONS.md`.

Plusieurs tours sont attendus. Ne refaire que ce qui est commenté.

## Étape 2 : la musique

1. Dans `scripts/build-sons.js`, ajouter 2 ou 3 musiques sobres (voir `DA-V3.md`, section 7), sur le modèle de `drift(arrangement)` : une fonction par musique, des parties par mesure (`intro`, `creux`, `montee`, `plein`), des coupures possibles.
2. Faire écouter : un MP4 de 10 s par musique, sur l'image du test de mouvement. Si l'envoi de fichier échoue, publier une page avec les sons intégrés.
3. **Question** : laquelle ?
4. Ajouter les bruitages de la V3 (souffle d'entrée, impact feutré, tic d'étape, montée).

## Étape 3 : le moteur de scènes

**But** : remplacer les personnages par la bibliothèque de scènes, en gardant la chaîne.

1. **Charger GSAP complet** : copier dans `assets/` et charger dans la page SplitText, DrawSVGPlugin, MorphSVGPlugin et CustomEase (ils sont dans `node_modules/gsap/dist/`). Les enregistrer avec `gsap.registerPlugin`. Vérifier que SplitText est appelé après le chargement des polices (`document.fonts.ready`) : sinon le découpage en lignes est faux au rendu.
2. **Créer `studio/scenes/`** : un fichier par scène, au format des rigs actuels (`studio/rigs/*.js`) :
   - `dessin(params, style)` renvoie le HTML ou le SVG de la scène ;
   - `GESTES` ou `duree(params)` décrit ce qu'elle occupe ;
   - `jouer(c, t, params)` pose ses animations sur la timeline.
3. **Adapter le compilateur** (`studio/compiler.js`) : un épisode devient une liste de scènes. Garder la fonction pure, le calcul des durées par temps de lecture, l'arrondi au temps de la musique, les contrôles (texte trop long, chevauchements, boucle).
4. **Rendre la fiche de sources obligatoire** (`SOURCES.md`) : le compilateur refuse une scène `chiffre`, `graphique`, `comparaison` ou `citation` sans `source`, et un épisode dont la fiche manque. Le rendu final refuse le statut `a-verifier`.
5. **Transitions** : prévoir dans le lecteur le passage d'un élément d'une scène à la suivante (MorphSVG ou Flip), décrit dans l'épisode par `"transition": "forme"`.
6. **Archiver le terrarium** : déplacer les rigs d'animaux, le décor et les épisodes `demo`, `nuit-1` et `jugement` dans `archive/terrarium/`, avec leurs tests. Ne rien supprimer.
7. **Catalogue** : adapter `studio/catalogue.js` pour lister les scènes et leurs paramètres. Tests à jour.
8. **Mettre à jour les skills** (`.claude/skills/`) pour qu'ils décrivent la chaîne réelle.
9. Montrer une **planche des 9 scènes** sur un sujet factice. **Question** : la bibliothèque convient-elle, que manque-t-il ?

## Étape 4 : le pilote « La procrastination »

1. **Les sources d'abord** (skill `/sources`). Pistes à vérifier par une recherche, sans rien tenir pour acquis :
   - la méta-analyse de Steel (2007, Psychological Bulletin) sur la procrastination ;
   - les travaux de Sirois et Pychyl (2013) sur la procrastination comme régulation de l'humeur à court terme ;
   - l'étude de Schlüter et collègues (2018, Psychological Science) sur l'amygdale et le contrôle de l'action.
   Remplir `videos/episodes/procrastination.sources.json`. Ne garder que ce qui est confirmé.
2. **Écrire l'épisode** (45 s environ), sur la structure : accroche, mécanisme, étude, geste, boucle. Angle conseillé : « ce n'est pas de la paresse, c'est une émotion qu'on évite ».
3. **Planche d'aperçu** (skill `/apercu`). La regarder, corriger, l'envoyer. **Question** : l'histoire et le message passent-ils ?
4. **Rendu** (skill `/rendu`), contrôle du son et des images, envoi. **Question** : publiable ? sinon, quoi changer en une ligne ?
5. Kit de publication : texte du post avec les références complètes, hashtags, commentaire à épingler.

## Étape 5 : la preuve de réutilisation

1. Sonnet écrit un deuxième épisode (par exemple « La peur du jugement », avec l'étude de Gilovich lue dans l'article) **en ne lisant que** le skill `/episode`, `CATALOGUE.md` et l'épisode pilote.
2. Noter le coût réel : lignes écrites, nombre d'aperçus, nombre de rendus, fichiers lus.
3. Si une scène manque, l'ajouter avec le skill `/scene` et le noter : c'est une information sur l'outil.
4. **Option** : une interface d'aperçu en React (liste des épisodes, lecture de la timeline, planche, état des sources). À ne faire que si l'utilisateur la demande.

Objectif : moins de 60 lignes pour l'épisode, 2 aperçus au plus, 1 rendu, 0 ligne de moteur.

## Étape 6 : la série et les mesures

1. Cinq épisodes, un accent de couleur par thème.
2. Publication par l'utilisateur. Relevé des chiffres dans `videos/resultats.csv` après 48 h : part de spectateurs à 3 s, temps moyen, visionnage complet, partages.
3. Conclusions dans `APPRENTISSAGES.md`. On ne change une règle qu'après 3 publications comparables.

## Règles communes à toutes les étapes

- **Avant de montrer** : regarder soi-même l'image ou la planche, et corriger ce qui se voit.
- **Avant de rendre** : `npm test`, la planche, `npx hyperframes lint` sans erreur.
- **Avant de rendre la main** : carnet à jour (`IDENTITE.md`, `ETAT.md`, `FEUILLE-DE-ROUTE.md`, `DECISIONS.md`), commit et push.
- **En cas de doute sur une source** : statut `a-verifier`, et on le dit à l'utilisateur.
