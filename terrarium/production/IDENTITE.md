# Identité du compte

_En construction, pas à pas : chaque élément est proposé, puis validé par toi. Dernière mise à jour : 13 novembre 2026._

## Ce qui est décidé

- **Direction artistique (refonte)** : piste A, « ombres lumineuses », avec le texte sans cadre de B et la mouche au fil de C (choisi le 13 nov., mélange A2 en validation).

- **Texte** : **le terminal de Mousse** (T6, validé le 13 nov.). C'est l'écran du robot qui raconte : texte vert en Space Mono, tapé lettre par lettre, avec un curseur et l'invite `mousse@terrarium:~$`.
- **Musique** : **Drift**, phonk à 145 BPM, cloche rapide et saturée, 808 lourde (validée le 13 nov.).
- **Style** : **nuit bioluminescente à la lanterne, dosage B** (validé le 13 nov.). Palette du style 1 (vert acide, cyan, langue rose, fond bleu nuit), obscurité forte (0,75) autour de la zone éclairée, faisceau chaud de la lanterne, et ce qui est bioluminescent brille dans le noir.
- **Âme du compte** : **le gardien du terrarium**, un personnage récurrent qui garde des IA dans son terrarium et commente avec humour.
- **Ton** : divertissant avant tout. Chaque épisode a un gag, et l'apprentissage vient en bonus.

## En cours de choix

| Élément | Statut | Pistes |
|---|---|---|
| Style de nuit | **validé** (tour 2, dosage B) | — |
| Le gardien | intégré au pilote | « Mousse » (nom provisoire) : petit robot rond, tête moussue, un œil cyan, lanterne au bout d'une perche |
| Musique | **validée** : Drift (145 BPM) | — |
| Texte à l'écran | **validé** : T6, le terminal de Mousse | — |
| Scénarios | **validés** (« Go ») | 6 pitchs (nuits 0 à 5), un gag par épisode, le caméléon comme personnage récurrent |
| Pilote Nuit 1 | **tour 2 envoyé, en attente de ton avis** | `videos/scenarios/cameleon.json`, 29,8 s, 60 images par seconde |
| Nom du compte et bio | plus tard | `@les.nuits.du.terrarium`, `@mousse.terrarium` |

## Itérations

### Style, tour 1 (13 nov.)

- **Montré** : la même image (deuxième coup de langue du caméléon, plan large) en 4 styles de nuit, avec un premier croquis de Mousse en bas à droite tenant sa lanterne vers la scène, une légende d'exemple en haut et le repère « Nuit n° 1 ».
  1. **Bioluminescente** : bleu nuit, caméléon vert acide lumineux, langue rose, accents verts.
  2. **Lanterne** : presque noir, seule la lumière chaude de la lanterne éclaire le caméléon.
  3. **Néon phonk** : violet profond, caméléon rose néon, langue cyan.
  4. **Douce** : bleu clair de lune, couleurs adoucies, proche du style actuel.
- **Méthode** : recoloration de l'image actuelle par un script d'essai (hors du dépôt), pas encore intégrée au moteur.
- **Corrigé avant l'envoi** : plan trop serré, papillon devant le sujet, langue devenue bleue, lanterne peu lisible, carrés autour des lucioles.
- **Ton retour** : « Couleur du 1 avec l'effet nuit du 2. »

### Style, tour 2 (13 nov.)

- **Montré** : le mélange demandé, en 3 dosages d'obscurité sur la même image. La palette est celle du 1 : caméléon vert acide, langue rose, mousse et lucioles qui luisent. La nuit est celle du 2 : obscurité autour d'une zone éclairée, et un faisceau chaud qui part de la lanterne vers le caméléon.
  - A : obscurité 0,6 ;
  - B : 0,75 ;
  - C : 0,85.
- **Nouveau** : les éléments bioluminescents gardent leur propre lueur par-dessus l'obscurité. On les voit dans le noir, sans que la lanterne les éclaire.
- **Corrigé avant l'envoi** : lueurs trop grosses, dosages trop proches, faisceau invisible.
- **Ton retour** : « B ». Style validé.

### Musique, tour 1 (13 nov.)

- **Montré** : 3 extraits phonk originaux de 10 s, sur l'image du style B, au même volume (normalisés à -14 LUFS, pour ne pas favoriser le plus fort).
  1. **Drift** : 145 BPM, cloche rapide et saturée, charleston en doubles croches, 808 lourde qui glisse.
  2. **Sombre** : 96 BPM en demi-temps, cloche grave noyée de réverbération, nappe menaçante, 808 longue.
  3. **Joueuse** : 124 BPM avec du swing, cloche qui saute d'octave, 808 courte et rebondissante, claquements de doigts.
- **Méthode** : script d'essai hors du dépôt, avec les outils de synthèse de `scripts/build-sons.js`.
- **Ton retour** : « Drift est parfait ». Musique validée.
- **Envoi** : l'envoi de fichiers a d'abord échoué (erreur 503), puis a fonctionné. Les extraits sont aussi sur la page d'écoute « Atelier des nuits » (artifact privé), avec les sons intégrés.

### Texte à l'écran, tour 1 (13 nov.)

- **Demandé par toi** : valider aussi comment le texte s'affiche sur la vidéo.
- **Montré** : sur l'image du style B, le morceau « Jamais du premier coup. » dans 4 styles. Tous sont dans la zone sûre, sur 2 lignes au plus.
  - **T1, gros titre** : blanc détouré de noir, mot clé en vert, en haut.
  - **T2, néon** : le texte brille en vert et cyan, comme une enseigne.
  - **T3, bulle de Mousse** : c'est le gardien qui parle, dans une bulle bordée de cyan dont la queue pointe vers lui.
  - **T4, mot à mot** : trois ou quatre mots à la fois, le mot en cours surligné (deux instants montrés).
- **Ton retour** : « Texte pas convaincu encore. »

### Texte à l'écran, tour 2 (13 nov.)

- **Hypothèse** : les 4 premiers styles se ressemblaient trop (du texte blanc gras, sous différentes formes). Ce tour propose des directions franches, chacune avec une personnalité.
  - **T5, edit phonk** : League Gothic en capitales, penché, décalage rouge et bleu, qui claque sur le temps.
  - **T6, terminal de Mousse** : Space Mono vert sur l'écran du robot, tapé lettre par lettre, avec un curseur.
  - **T7, annotations** : Permanent Marker et flèches dessinées sur la scène (« ton IA », « un outil ! »).
  - **T8, cinéma** : EB Garamond en italique, avec des filets, en fondu lent.
- **Contraintes** : tous dans la zone sûre. T7 utilise une police non fournie par HyperFrames : il faudra l'embarquer dans `assets/fonts/`.
- **Ton retour** : « T6 ». Texte validé.

### Pilote « Nuit 1 : la langue » (13 nov.)

- **Montré** : la vidéo complète (25,2 s). Elle s'ouvre dans le noir, avec seulement l'œil cyan de Mousse ; la lanterne s'allume. Le caméléon tire la langue et rate : la mouche esquive puis le nargue, et Mousse est blasé. Au deuxième essai, il l'attrape, devient turquoise et en veut encore. Le terminal tape « réfléchir. agir. recommencer. = boucle d'outils », puis annonce la nuit suivante, et la lanterne s'éteint : la fin reboucle sur le début.
- **Corrigé avant l'envoi** : l'esquive envoyait la mouche hors de l'écran. Au zoom 2,6, une unité du décor vaut environ 8 pixels, donc les déplacements de la mouche doivent rester petits.
- **Ton retour** : le texte se décale à la fin de la frappe ; pas assez d'animation, le robot ne bouge pas assez ; la mouche est mal dessinée ; la métaphore n'est pas claire, il faut des zooms qui présentent les personnages ; la vidéo doit suivre la musique (la musique est bonne) ; 30 s ; pas d'annonce « demain » ; tout doit être fluide.

### Pilote « Nuit 1 », tour 2 (13 nov.)

- **Montré** : 29,8 s (18 mesures de Drift), en 60 images par seconde.
- **Métaphore posée par des étiquettes** : caméléon = « l'IA », mouche = « la tâche », langue = « l'outil ». Chaque personnage a son gros plan.
- **Boucle nommée pas à pas** : après le tir à l'aveugle raté, « 1. observer », « 2. agir », « 3. vérifier », puis « = boucle d'outils » et « et ça recommence… ». Plus d'annonce de la nuit suivante.
- **Calé sur la musique** : chaque plan commence sur le premier temps d'une mesure. La piste est arrangée pour la vidéo : intro douce, basse à l'arrivée de la mouche, creux pendant le raté avec un temps de silence, roulement sur « vérifier », retour à fond sur « attrapée ! ».
- **Animation** : nouvelle mouche (yeux, ailes, abdomen lumineux, vols courbes, pirouette d'esquive, dandinement moqueur). Mousse hoche la tête sur le temps, pointe sa lanterne, se penche, se cache l'œil, saute de joie et rit. La caméra avance lentement pendant chaque plan.
- **Texte** : les lettres ont leur place dès le début, donc plus rien ne se décale. La lettre suivante sert de curseur.
- **Ton retour** : en attente.

### Direction artistique, refonte, tour 1 (13 nov.)

- **Contexte** : après le pilote, refonte décidée (`PLAN-REFONTE.md`, étape 1).
- **Montré** : la même scène de 4 mesures (environ 6,6 s, en boucle, avec Drift) dans trois pistes. Le caméléon tire la langue et rate, la mouche esquive et se moque, Mousse se cache l'œil. Le terminal tape « mon IA *rate* tout. ».
  - **A. Ombres lumineuses** : silhouettes sombres sur trois plans de profondeur, contours et taches lumineux, mouche-luciole avec traînée, parallaxe.
  - **B. L'écran de Mousse** : pixel art vert phosphore, mouvements case par case, balayage cathodique, bug d'écran magenta au moment du raté.
  - **C. Papier découpé** : calques de papier aux bords irréguliers, ombres portées, attaches dorées aux articulations, mouche suspendue à un fil qui fait le yoyo devant la lune.
- **Fabrication** : `essais/direction-artistique/` (reproductible, hors du moteur).
- **Ton retour** : « A avec le texte de B et la mouche filée de C. »

### Direction artistique, refonte, tour 2 (13 nov.)

- **Montré** : le mélange A2 (`essais/direction-artistique/a2.cjs`). Il garde les ombres lumineuses de A. Le texte du terminal s'affiche directement sur l'image, sans cadre, comme en B. La mouche-luciole pend à un fil de soie lumineux et fait le yoyo, comme en C.
- **Ton retour** : « Oui ! » (validé).

### Studio, démo (13 nov.)

- **Montré** : `videos/episodes/demo.json` (22 lignes) et sa vidéo de 16,6 s (10 mesures), en 60 images par seconde. L'épisode enchaîne accroche, présentation de la tâche (étiquette « la tâche »), raté avec silence d'un temps, moquerie, réussite avec retour de la basse et saut de Mousse, puis la boucle.
- **Ton retour** : en attente.
