# Spécification du studio vidéo

_Écrit le 13 novembre 2026. C'est l'architecture cible du plan (`PLAN-REFONTE.md`, étapes 2 à 5). Elle est à construire par étapes : ne rien créer d'avance qui ne serve pas à l'épisode en cours._

## Principe

On ne réécrit pas le moteur. On ajoute **une couche au-dessus** :

```
épisode (haut niveau, ~40 lignes)        videos/episodes/<id>.json
        │  compilateur                   studio/compiler.js
        ▼
scénario (bas niveau, format actuel)     videos/scenarios/<id>.json   ← généré, plus jamais écrit à la main
        │  build-video.js (inchangé dans son rôle)
        ▼
composition HyperFrames → contrôles → aperçu → rendu
```

Le scénario bas niveau reste le contrat avec le moteur (`public/js/film/film.js`) et avec les contrôles (`shared/scenarios.js`). Le compilateur est donc testable sans navigateur : épisode en entrée, JSON en sortie.

## Arborescence cible

```
terrarium/
  studio/
    compiler.js            épisode → scénario bas niveau
    temps-forts/           un fichier par temps fort (accroche, presenter, rater…)
    rigs/                  un fichier par personnage (mousse, cameleon, mouche…)
    decors/                un fichier par coin du terrarium, en calques
    cadrages.js            cadrages nommés (gros-plan, plan-moyen, large) et transitions
    animation.js           aides : anticipation, dépassement, squash and stretch
    catalogue.js           génère production/CATALOGUE.md à partir des briques
  scripts/
    apercu.js              planche d'images clés, sans rendu vidéo
    video.js               la commande unique : compiler, composer, contrôler, aperçu, rendre
  videos/episodes/         la source des vidéos (écrite à la main ou par un modèle)
  videos/scenarios/        généré par le compilateur
```

Le site (`public/`, `server.js`) est **gelé** : il garde sa copie du moteur. À l'étape 2, copier `public/js/film/film.js` vers `studio/moteur.js` et faire pointer `build-video.js` dessus, pour que le studio évolue sans casser le site.

## 1. Le format d'épisode

Tout est exprimé en **mesures** de la musique et en **rôles**, jamais en secondes ni en coordonnées.

```json
{
  "id": "nuit-1",
  "titre": "Nuit 1 : la langue",
  "concept": "La boucle d'outils",
  "serie": { "nom": "Les nuits du terrarium", "episode": 1 },
  "decor": "branche",
  "ambiance": "nuit-lanterne",
  "musique": "drift",
  "roles": { "ia": "cameleon", "tache": "mouche", "outil": "cameleon.langue" },
  "temps": [
    { "fort": "accroche", "gag": "rater", "texte": "mon IA *rate* tout." },
    { "fort": "presenter", "qui": "ia", "etiquette": "l'IA", "texte": "voici mon *IA*." },
    { "fort": "presenter", "qui": "tache", "etiquette": "la tâche", "texte": "et sa *tâche*." },
    { "fort": "rater", "texte": ["tir à l'*aveugle*…", "*raté*."], "reaction": "depit" },
    { "fort": "narguer", "qui": "tache", "texte": "la mouche se *moque*." },
    { "fort": "etapes", "liste": ["observer", "agir", "vérifier"] },
    { "fort": "reussir", "texte": "*attrapée* !", "reaction": "sauter" },
    { "fort": "reveler", "texte": ["observer, agir, vérifier.", "= *boucle d'outils*"] },
    { "fort": "boucler", "texte": "et ça *recommence*…" }
  ],
  "accroches": { "b": "mon *IA* chasse.", "c": "ton IA *rate* ?" },
  "publication": { "texte": "…", "hashtags": ["#ia"], "commentaire": "> ton IA rate souvent aussi ?" }
}
```

Règles :
- Chaque temps fort a une **durée par défaut en mesures** (par exemple : accroche 1, presenter 1, rater 2, etapes 1 par élément, reveler 2, boucler 2). On peut la forcer avec `"mesures": n`.
- La durée totale est la somme des mesures. Le compilateur refuse un épisode de moins de 12 ou de plus de 18 mesures (20 à 30 s à 145 BPM).
- Le texte suit les règles de lecture existantes (`LECTURE` dans `shared/scenarios.js`) : le compilateur signale un texte trop long **avant** toute compilation.
- `reaction` est un geste de Mousse (`pencher`, `depit`, `rire`, `sauter`, `pointer`). Sans elle, le temps fort applique sa réaction par défaut.

## 2. Les temps forts

Un temps fort est une fonction pure : `(contexte, paramètres) → { plans, arrangement }`.
- `contexte` donne les rôles, le décor, le tempo, et l'état courant (où est chaque personnage, quelle est l'humeur de Mousse).
- Elle renvoie des plans au format bas niveau (caméra, légende, actions avec des décalages en temps de la musique) et la partie musicale de chaque mesure.

| Temps fort | Ce qu'il fait | Musique par défaut |
|---|---|---|
| `accroche` | Ouvre sur le gag ou son résultat, en gros plan. La lanterne s'allume en moins de 0,4 s. | intro |
| `presenter` | Gros plan sur un rôle, étiquette, Mousse pointe sa lanterne | plein |
| `rater` | L'outil manque la tâche. Mousse est dépité. | creux, avec une coupure d'un temps sur le raté |
| `narguer` | La tâche se moque, la caméra la cadre | creux |
| `etapes` | Une mesure par étape : un cadrage et un mot numéroté à chaque fois | plein, puis montée sur la dernière |
| `reussir` | L'outil atteint la tâche, changement de couleur, Mousse saute | plein (le retour de la basse) |
| `reveler` | Plan large, le concept en une phrase | plein |
| `boucler` | Retour au cadrage de l'accroche, la lanterne s'éteint sur le dernier temps | plein |

Chaque temps fort est d'abord une **extraction du pilote actuel** : les plans de `videos/scenarios/cameleon.json` sont déjà découpés ainsi, mesure par mesure. Commencer par ces huit-là. En ajouter un seulement quand un épisode en a besoin.

**Rôles génériques** : un temps fort ne connaît pas « le caméléon ». Il appelle les capacités du rig qui tient le rôle (voir ci-dessous). C'est ce qui permet de rejouer `rater` avec la dionée ou la grenouille.

## 3. Les rigs (personnages)

Un rig est un fichier qui exporte toujours la même interface :

```js
module.exports = {
  id: 'mouche',
  dessin(theme),            // la chaîne SVG du personnage, pour un thème donné (plus de recoloration par regex)
  ancres: { centre: [0, 0], oeil: [0, -1], bouche: [0, 2.4] },   // points nommés, dans le repère du rig
  taille: 14,               // largeur utile, pour que le cadrage sache zoomer
  expressions: ['neutre', 'content', 'surpris', 'blase'],
  capacites: {              // ce que le rig sait faire, traduit en actions du moteur
    arriver:  (p) => [...actions],
    esquiver: (p) => [...actions],
    narguer:  (p) => [...actions],
  },
  ambiance: (tempo) => [...boucles],   // respiration, clignement, battement sur le temps
};
```

Règles apprises pendant le pilote (elles évitent des heures de tâtonnement) :
- **Une propriété animée par groupe.** Deux animations qui touchent la même propriété du même élément se battent. Mousse est donc fait de groupes emboîtés : `#mousse-saut` (saut), `#mousse-geste` (penché), `#mousse-battement` (rythme), `#mousse-corps` (respiration). Faire pareil pour chaque rig.
- **`svgOrigin` se lit dans le repère local du rig**, pas en pixels d'écran.
- **Les positions des personnages s'expriment en fractions de l'écran**, par rapport au sujet cadré. Le compilateur les convertit. Plus jamais de `dx: 46` en unités du décor : à zoom 2,6, une unité vaut environ 8 pixels.
- Chaque geste **revient à la pose de repos**, et deux gestes du même rig ne se chevauchent pas : le compilateur le vérifie.
- Les principes d'animation passent par `studio/animation.js` : anticipation avant un mouvement, dépassement à l'arrivée, étirement dans la vitesse. Aucune animation linéaire pour un être vivant.

Rigs à faire à l'étape 3 : `mousse` (à partir de `public/js/art/gardien.js`), `cameleon` et `mouche` (à extraire de `public/js/art/terrarium.js`, fonctions `cameleon()` et groupe `#mouche`).

## 4. Les décors

Un décor est un « coin » du terrarium, fait de **calques de profondeur** : fond, plan lointain, plan du jeu, premier plan. La caméra déplace chaque calque à une vitesse différente (parallaxe).

- Interface : `{ id, calques(theme), chemins: { perchoir, vol }, places: { ia: [x, y], tache: [x, y] } }`.
- Les fonctions de plantes de `public/js/art/terrarium.js` (`fougere`, `monstera`, `liane`, `herbes`, `champignon`) sont à réutiliser telles quelles pour remplir les calques.
- Premier décor : `branche` (celui du pilote). Les suivants viendront avec leurs épisodes : `mare` (la grenouille), `serre` (la dionée), `fourmiliere`.

## 5. Cadrage et synchronisation automatiques

- **Cadrages nommés** (`studio/cadrages.js`) : `gros-plan`, `plan-moyen`, `large`. Chacun donne un zoom calculé à partir de la `taille` du rig, pour que le sujet occupe toujours la même part de l'écran. Le calcul existant est `vueDe` dans `film.js` (le sujet aux 2/5 de la hauteur).
- **Tout part des mesures.** `mesure(n) = n × 240 / tempo` secondes, arrondi au millième. Les actions fortes tombent sur un temps. Le validateur le vérifie déjà (`surLeTemps` dans `shared/scenarios.js`).
- **L'arrangement de la musique est déduit** des temps forts (colonne « Musique » du tableau), puis passé à `ecrireMusique` (`scripts/build-sons.js`).
- **Les bruitages** restent déduits des actions (`videos/sons/table.js`).

## 6. Contrôles et aperçu

| Contrôle | Où | État |
|---|---|---|
| Temps de lecture, longueur des textes, plans sur le temps | `shared/scenarios.js` | Fait |
| Sujet et légendes dans la zone sûre | `scripts/verifier-videos.js` | Fait |
| **Chaque personnage visible à l'écran à chaque temps fort** | à ajouter au vérificateur | À faire (étape 2) |
| **Étiquettes dans la zone sûre, hors du terminal** | à ajouter au vérificateur | À faire (étape 2) |
| **Gestes d'un même rig qui se chevauchent** | compilateur | À faire (étape 3) |
| **Accroche : un mouvement visible avant 0,5 s** | compilateur (le temps fort `accroche` le garantit) | À faire (étape 4) |

**L'aperçu** (`scripts/apercu.js`) : il ouvre la composition dans Chromium, avance la timeline à l'instant de chaque temps fort, et assemble une planche d'images. Il existe déjà et fonctionne (voir `GUIDE-EXECUTION.md`) ; à l'étape 2, il passera des plans aux temps forts. C'est l'outil principal d'itération : on ne lance un rendu que quand la planche est bonne.

**La commande unique** (`scripts/video.js`, appelée par `npm run video -- <id>`) : compiler, composer, tester, vérifier, lint, aperçu. Avec `--rendu` : le MP4 final en 60 images par seconde. Avec `--brouillon` : 30 images par seconde, qualité `draft`.

## 7. Le catalogue

`studio/catalogue.js` lit les briques et écrit `production/CATALOGUE.md` : la liste des temps forts (paramètres et durée), des rigs (expressions et capacités), des décors, des gestes de Mousse, des musiques et des parties d'arrangement.

C'est **le seul fichier** qu'un modèle doit lire, avec le guide, pour écrire un épisode. Il est régénéré à chaque ajout de brique, et un test vérifie qu'il est à jour.
