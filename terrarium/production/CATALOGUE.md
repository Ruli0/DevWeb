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
| `accroche` | 1 | Ouvre sur l'action : gros plan sur l'œil et sur la tâche, l'œil bouge avant 0,5 s. | texte |
| `presenter` | 1 | Gros plan sur un rôle, avec son étiquette ; Mousse le désigne avec sa lanterne. | qui (ia, tache ou outil) ; etiquette ; texte |
| `rater` | 2 | L'IA agit et rate : à l'aveugle (la tâche esquive) ou trop court (la langue s'arrête avant, la tâche rit). La musique se tait un temps, Mousse se cache l'œil. | facon (aveugle ou court) ; texte |
| `narguer` | 2 | La tâche se moque : elle fait le yoyo sur son fil, l'œil de l'IA la suit. | texte |
| `reussir` | 2 | La tâche revient, l'IA vise et l'attrape sur le premier temps de la 2e mesure (la basse revient), elle change de couleur, Mousse saute. | couleur (turquoise) ; texte |
| `etapes` | 3 | La boucle d'outils, une mesure par étape : observer (l'œil suit la tâche qui revient), agir (la langue l'attrape sur le premier temps, la basse revient), vérifier (il avale, change de couleur, Mousse saute). | couleur (turquoise) ; texte : un morceau par mesure |
| `reveler` | 3 | Plan large, la phrase qui révèle le concept, une mesure par morceau ; Mousse désigne la scène, puis rit. | texte : un morceau par mesure |
| `boucler` | 2 | Plan large, une nouvelle tâche descend, et la caméra revient au cadrage du début : la vidéo boucle. | texte |

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
| `teinte` | Le contour et les taches changent de couleur. | de, vers : vert, turquoise, orange, rose ; duree |

### mouche (la mouche)

| Geste | Ce qu'il fait | Paramètres |
|---|---|---|
| `descendre` | Elle descend au bout de son fil (elle apparaît). | vers : point d'arrivée ; duree |
| `esquiver` | Tirée d'un coup par son fil, elle se balance. | de, vers |
| `yoyo` | Elle fait le yoyo sur son fil, un rebond par temps : elle se moque. | de ; fois (3) ; amplitude en pixels (70) |
| `revenir` | Elle revient en arc de cercle. | de, vers ; duree |
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

## Décors

| Décor | Places |
|---|---|
| `branche` (la branche) | ia : [380,920] ; tache : [820,640] |

## Cadrages

`large` (zoom 1), `plan-moyen` (zoom 1,55), `gros-plan` (zoom 2,3). Le sujet est cadré un peu sous le tiers haut (le texte occupe le haut) ; avec plusieurs sujets, le zoom diminue pour les garder tous à l'écran. Entre deux mouvements, la caméra avance doucement.

## Musique

Une partie par mesure, choisie par les temps forts : `intro`, `creux`, `montee`, `plein`. Une « coupure » fait taire la musique pendant un temps (sur le raté).
