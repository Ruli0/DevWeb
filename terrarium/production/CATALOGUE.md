# Catalogue du studio

_Généré par `node studio/catalogue.js` : ne pas modifier à la main. Avec `GUIDE-EXECUTION.md`, c'est tout ce qu'il faut lire pour écrire un épisode._

## Écrire un épisode

Un fichier `videos/episodes/<id>.json`, puis `npm run video -- <id>` (planche d'aperçu) et `npm run video -- <id> --rendu` (MP4, 60 images par seconde). Modèle : `videos/episodes/demo.json`.

```json
{ "id": "mon-episode", "titre": "…", "decor": "branche", "musique": "drift",
  "roles": { "ia": "cameleon", "tache": "mouche" },
  "temps": [ { "fort": "accroche", "texte": "…" }, …, { "fort": "boucler", "texte": "…" } ] }
```

- Tout se compte en **mesures** de la musique (Drift : 145 BPM, une mesure = 1,655 s). La durée de la vidéo est la somme des mesures.
- **Texte** : une chaîne, ou une liste de morceaux affichés l'un après l'autre. Au plus 34 caractères par morceau ; il faut 0.3 s par mot et 0.5 s par morceau pour lire. `*mot*` met un mot en valeur (rose).
- **La vidéo doit boucler** : la caméra, la tâche, la couleur de l'IA et l'humeur de Mousse reviennent à leur état du début. Le temps fort `boucler`, placé en dernier, s'en charge.
- Le compilateur refuse un épisode qui ne respecte pas ces règles, avec un message qui dit quoi changer.

## Temps forts

| Temps fort | Mesures | Ce qu'il fait | Paramètres |
|---|---|---|---|
| `accroche` | 1 | Ouvre sur l'action : gros plan sur l'œil (et sur la tâche si elle est là), l'œil bouge avant 0,5 s. Sans tâche, l'IA réfléchit. | texte ; mesures |
| `presenter` | 1 | Gros plan sur un rôle, avec son étiquette ; Mousse le désigne avec sa lanterne. | qui (ia, tache ou outil) ; etiquette ; texte |
| `rater` | 2 | L'IA agit et rate : à l'aveugle (la tâche esquive) ou trop court (la langue s'arrête avant, la tâche rit). La musique se tait un temps, Mousse se cache l'œil. | facon (aveugle ou court) ; texte |
| `narguer` | 2 | La tâche se moque : elle fait le yoyo sur son fil, l'œil de l'IA la suit. | texte |
| `reussir` | 2 | La tâche revient, l'IA vise et l'attrape sur le premier temps de la 2e mesure (la basse revient), elle change de couleur, Mousse saute. | couleur (turquoise) ; texte |
| `etapes` | 3 | La boucle d'outils, une mesure par étape : observer (l'œil suit la tâche qui revient), agir (la langue l'attrape sur le premier temps, la basse revient), vérifier (il avale, change de couleur, Mousse saute). | couleur (turquoise) ; texte : un morceau par mesure |
| `reveler` | 3 | Plan large, la phrase qui révèle le concept, une mesure par morceau ; Mousse désigne la scène, puis rit. | texte : un morceau par mesure |
| `outils` | 1 | Plan large : les outils de l'IA descendent sur leurs fils (loupe, page, et la tâche), le schéma de la boucle apparaît. | texte |
| `tour` | 2 | Un tour de boucle d'agent : il pense, il appelle un outil (la langue l'attrape sur le 1er temps de la 2e mesure), il lit le résultat ; le schéma suit et le compteur avance (tour, temps, tokens). Avec rate : la tâche (le bug) esquive, silence d'un temps. | outil (loupe, page ou tache) ; rate ; etiquette (nom de l'outil) ; parties ; texte |
| `reponse` | 1 | L'agent a fini : une bulle de réponse sort, il change de couleur, Mousse saute ; tout le schéma s'allume. | couleur (turquoise) ; texte |
| `formule` | 2 | La définition : plan large, étiquettes sur l'IA et sur ses outils, puis le schéma passe au centre et la comète fait un tour complet. | texte : un morceau par mesure |
| `cout` | 2 | Le prix de la boucle : le schéma reste au centre, tout allumé, avec le temps et les tokens dépensés ; Mousse rit jaune. | texte |
| `hesiter` | 2 | Ouvre sur l'hésitation : gros plan sur l'œil et la tâche, le caméléon veut tirer mais il tremble. | texte |
| `imaginer` | 3 | Ce qu'il imagine : un projecteur se braque sur lui, la scène s'assombrit, la grenouille et les lucioles le fixent avec de grands yeux. La musique se creuse. | texte (voisins : true) |
| `cacher` | 2 | Il se camoufle (presque invisible) pour échapper aux regards ; la tâche en profite et remonte sur son fil. Mousse est dépité. | texte (voisins : true) |
| `penser` | 3 | Ce qui occupe vraiment les autres : une mesure par personnage (la grenouille, les lucioles, Mousse), avec sa bulle de pensée. Personne ne pense au caméléon. | texte : un morceau par mesure (voisins : true) |
| `nommer` | 2 | Plan large : le projecteur réapparaît sur le caméléon, étiqueté « dans sa tête », puis s'éteint : il n'existait que dans son imagination. | texte (voisins : true) |
| `oser` | 2 | La tâche revient, il réapparaît, tire et l'attrape (la basse revient). Les voisins ne réagissent pas : la grenouille cligne des yeux, les lucioles regardent ailleurs. | texte (voisins : true) |
| `conseil` | 2 | Le conseil : il devient turquoise, Mousse saute de joie, la grenouille coasse et les lucioles dansent. | couleur (turquoise) ; texte (voisins : true) |
| `boucler` | 2 | Plan large, la scène revient à son état de départ (la tâche, les outils, le schéma), et la caméra revient au cadrage du début : la vidéo boucle. | texte |

`"mesures": n` dans un temps fort allonge sa durée (la mise en scène reste calée sur ses premières mesures).

## Personnages et gestes

Les temps forts appellent ces gestes. Un épisode ne les appelle pas directement.

### cameleon (le caméléon)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `regarder` | L'œil se tourne vers un point. | de, vers : angles (calculés par le compilateur) ; duree |
| `langue` | Recul, élan, la langue part en 0,1 s et revient. | cible : point visé ; rate : vrai si la cible a bougé ; tenir : secondes langue sortie |
| `cligner` | Clignement d'incrédulité. | fois (2) |
| `avaler` | Le corps gonfle trois fois : il avale. | — |
| `reflechir` | Il réfléchit : l'œil fait un tour, trois points lumineux s'allument au-dessus de sa tête. | duree |
| `absorber` | Le résultat de l'outil : une goutte lumineuse remonte de la bouche à la tête, les taches flashent. | — |
| `repondre` | Une bulle de réponse lumineuse sort de sa bouche. | duree |
| `camoufler` | Il se camoufle : il devient presque invisible, ou réapparaît. | vers : vrai (presque invisible) ou faux |
| `trembler` | Il tremble de peur (petites secousses rapides). | duree |
| `teinte` | Le contour et les taches changent de couleur. | de, vers : vert, turquoise, orange, rose ; duree |

### mouche (la mouche)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `descendre` | Elle descend au bout de son fil (elle apparaît). | vers : point d'arrivée ; duree |
| `esquiver` | Tirée d'un coup par son fil, elle se balance. | de, vers |
| `yoyo` | Elle fait le yoyo sur son fil, un rebond par temps : elle se moque. | de ; fois (3) ; amplitude en pixels (70) |
| `revenir` | Elle revient en arc de cercle. | de, vers ; duree |
| `remonter` | Elle remonte sur son fil et disparaît. | de ; duree |
| `disparaitre` | Attrapée : elle disparaît. | — |

### mousse (Mousse, le gardien)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `expression` | Son œil change d'expression, sa pousse frétille. | de, vers : neutre, content, surpris, blase |
| `depit` | Il s'affaisse et se cache l'œil. | duree |
| `pointer` | Il tend sa lanterne vers la scène. | duree |
| `pencher` | Il se penche, curieux. | duree |
| `rire` | Il est secoué de rire, deux secousses par temps. | duree |
| `sauter` | Il saute de joie. | fois (2) ; duree |

### outils (les outils (loupe, page))

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `descendre` | L'outil descend au bout de son fil (il apparaît). | id ; vers ; duree |
| `remonter` | L'outil remonte et disparaît. | id ; de ; duree |
| `attrape` | Attrapé par la langue : il est avalé (l'appel d'outil est fait). | id |

### schema (le schéma de la boucle)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `apparaitre` | Le schéma de la boucle apparaît (en bas à gauche). | — |
| `disparaitre` | Le schéma disparaît. | — |
| `etape` | L'étape en cours s'allume, la comète y court. | de, vers : pense, outil, resultat, tout ou aucune ; angle ; erreur |
| `compteur` | Le tour, le chrono et les tokens avancent (ou reviennent à zéro). | de, vers : { tour, s, k } ; duree |
| `centrer` | Le schéma passe au centre de l'écran pour l'explication, ou revient. | vers : vrai (au centre, en grand) ou faux |

### grenouille (la grenouille)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `regarder` | Ses pupilles suivent un point. | de, vers : décalages des pupilles (calculés par le compilateur) ; duree |
| `fixer` | Elle fixe : ses yeux grossissent et rosissent, les pupilles rétrécissent. | — |
| `relacher` | Elle relâche son regard : ses yeux reviennent à la normale. | — |
| `cligner` | Elle cligne des yeux, indifférente. | fois (1) |
| `coasser` | Sa gorge gonfle : elle coasse. | fois (2) |

### lucioles (les lucioles)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `regarder` | Les pupilles de la luciole i suivent un point. | i ; de, vers : décalages des pupilles ; duree |
| `fixer` | La luciole i fixe : ses yeux grossissent. | i |
| `relacher` | La luciole i relâche son regard. | i |
| `danser` | La luciole i fait une petite pirouette de joie. | i ; duree |

### pensees (les bulles de pensée)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `penser` | Une bulle de pensée apparaît au-dessus du personnage, avec ce qui l'occupe, puis disparaît. | sur : grenouille, lucioles ou mousse ; duree |

### ambiance (l'ambiance (projecteur))

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `projecteur` | Le projecteur s'allume (la scène s'assombrit autour du caméléon) ou s'éteint. | etat : allumer ou eteindre |

## Décors

| Décor | Places |
|---|---|
| `branche` (la branche) | ia : [380,920] ; tache : [820,640] ; outils : [null,null] ; grenouille : [150,1262] ; lucioles : [[120,610],[230,545],[335,625]] |

## Cadrages

`large` (zoom 1), `plan-moyen` (zoom 1,55), `gros-plan` (zoom 2,3). Le sujet est cadré un peu sous le tiers haut (le texte occupe le haut) ; avec plusieurs sujets, le zoom diminue pour les garder tous à l'écran. Entre deux mouvements, la caméra avance doucement.

## Musique

Une partie par mesure, choisie par les temps forts : `intro`, `creux`, `montee`, `plein`. Une « coupure » fait taire la musique pendant un temps (sur le raté).
