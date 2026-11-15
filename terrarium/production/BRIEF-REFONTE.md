# Brief : refonte de la direction artistique et de la méthode de production

_Écrit le 13 novembre 2026, à la fin du tour 2 du pilote « Nuit 1 ». Il est destiné au modèle qui fera le plan de la refonte. Lis-le en entier avant d'ouvrir le code._

## Ta mission

Proposer un **plan de refonte**, à faire valider par l'utilisateur, puis à exécuter par étapes. Le plan doit répondre à quatre exigences, par ordre d'importance :

1. **Une direction artistique plus forte**, qui donne envie de regarder, de liker et de s'abonner : divertissante d'abord, pédagogique ensuite.
2. **Tout est gardé et reproductible** : chaque élément produit (personnage, décor, mouvement, son, style de texte) devient une brique réutilisable, versionnée dans le dépôt, qui donne toujours le même résultat.
3. **Très peu de tokens par vidéo** : une nouvelle vidéo doit s'écrire en quelques dizaines de lignes de haut niveau, sans toucher au moteur ni au dessin, et sans tâtonner sur des coordonnées.
4. **Une grande palette** : pouvoir faire des vidéos variées (autres personnages, décors, ambiances, rythmes, formats de gag) en combinant les briques, pas en recodant.

Ne code rien avant que l'utilisateur ait validé le plan.

## Le projet en bref

- **Le but** : un outil de production de vidéos TikTok de qualité, virales, qui expliquent des concepts d'IA agentique (boucle d'outils, hooks, middleware, ingénierie du contexte, multi-agents, etc.) par des métaphores.
- **L'univers actuel** : un terrarium. Le compte s'appelle provisoirement « Les nuits du terrarium ». Son gardien, **Mousse**, est un petit robot jardinier à lanterne. Il « garde des IA » dans son terrarium et commente avec humour.
- **Le dépôt** : `terrarium/` (Node, Express, GSAP 3). Le carnet de bord est dans `terrarium/production/`. Lis d'abord `ETAT.md`, `IDENTITE.md`, `DECISIONS.md` et `FEUILLE-DE-ROUTE.md`.
- **La chaîne actuelle** :
  1. scénario JSON (`videos/scenarios/<id>.json`) ;
  2. composition HyperFrames, générée par `scripts/build-video.js` : une seule timeline GSAP en pause, déterministe ;
  3. contrôles : `npm test`, `node scripts/verifier-videos.js` (avec `NODE_PATH=$(npm root -g)`), `npx hyperframes lint` ;
  4. rendu MP4 avec `npx hyperframes render` (voir `terrarium/CLAUDE.md` et `ETAT.md` pour le chemin du navigateur).
- **Les fichiers clés** :

| Fichier | Rôle | Taille |
|---|---|---|
| `public/js/film/film.js` | Moteur : environ 40 actions codées une par une, caméra, légendes, ambiance | 730 lignes |
| `public/js/art/terrarium.js` | Tout le décor et tous les animaux, dans **une seule chaîne SVG** | 560 lignes |
| `public/js/art/nuit.js` | Thème de nuit, par recoloration de cette chaîne avec des regex | 107 lignes |
| `public/js/art/gardien.js` | Mousse et sa lanterne : calque d'écran | 110 lignes |
| `shared/scenarios.js` | Format et validation des scénarios | 165 lignes |
| `scripts/build-sons.js` | Bruitages et musiques synthétisés en Node (WAV déterministes) | 370 lignes |
| `scripts/build-video.js` | Génération des compositions et du kit de publication | 257 lignes |
| `videos/scenarios/cameleon.json` | Le pilote « Nuit 1 » | 462 lignes |

- **Le site** (`public/`) rejoue les mêmes scénarios en temps réel, avec cinq chapitres interactifs. Il partage le moteur avec les vidéos.

## Ce que l'utilisateur a validé (à garder, sauf raison forte)

- **Pas de voix off.** Le texte porte toute la narration.
- **La musique phonk « Drift »** (145 BPM), originale et synthétisée. Elle a été jugée « parfaite ». Elle est arrangeable par mesure (intro, creux, montée, plein, coupures).
- **Le texte « terminal de Mousse » (T6)** : Space Mono vert, tapé lettre par lettre, avec un curseur.
- **Mousse comme âme du compte**, le gardien qui réagit comme un personnage, pas comme un professeur.
- **Une ambiance nocturne et bioluminescente**, éclairée par la lanterne (style « B »). Ce choix a été fait sur des images fixes : la refonte peut le faire évoluer.
- **Le format** : 1080 × 1920, de 25 à 30 s, une accroche dans les 3 premières secondes, une fin qui boucle sur le début, la zone sûre TikTok (x 60–940, y 150–1440), des variantes d'accroche, et un kit de publication par vidéo.
- **La méthode de travail** : pas à pas. On montre des options, l'utilisateur choisit en une ligne, et on suppose plusieurs tours par étape. Chaque tour est noté dans `production/IDENTITE.md`. L'utilisateur regarde sur iPhone : envoyer des MP4, ou des pages d'artifact quand il faut écouter ou comparer.

## Ce que l'utilisateur a dit du pilote (tour 2)

« C'est mieux, beaucoup mieux, mais ce sont des problèmes de fond. » Ses remarques sur les deux tours :

- il n'y a pas assez d'animation, et il faut que tout soit fluide, avec de belles animations ;
- les personnages doivent être mieux imaginés et mieux illustrés, et la mouche était mal faite ;
- la métaphore n'est pas assez claire, et il faut des zooms qui présentent les personnages ;
- la vidéo doit aller avec la musique ;
- il faut que ce soit divertissant.

## Diagnostic : les problèmes de fond

C'est mon analyse après avoir fait le pilote. Vérifie-la dans le code.

1. **Chaque vidéo coûte du code.** Un nouveau gag ou un nouveau geste oblige à ajouter une action dans `film.js`, et souvent un élément dans le dessin. Le pilote a demandé 9 actions nouvelles. C'est le premier poste de tokens.
2. **Le scénario est de trop bas niveau.** Il est écrit en secondes, en déplacements `dx` / `dy` en unités du décor, en durées de tween. Il faut des essais et des mesures pour que la mouche reste à l'écran : à certains zooms, une unité vaut 8 pixels. Le pilote fait 462 lignes de JSON.
3. **Le dessin est monolithique.** Tout le décor est une seule chaîne SVG avec des identifiants en dur, et la nuit est une recoloration par regex. Les personnages ne sont pas des « rigs » (pantins articulés, avec des poses, des expressions et des cycles) réutilisables et combinables.
4. **Le style est du vectoriel à plat, assez « clip-art ».** Il y a peu de profondeur, de matière, de lumière et de parallaxe. L'animation se résume surtout à des translations et des rotations, sans principes d'animation systématiques (anticipation, amorti, chevauchement, squash and stretch).
5. **La narration n'a pas de grammaire.** Il n'existe pas de « temps forts » réutilisables : présenter un personnage, gag de l'échec, révélation, boucle finale. Chaque histoire est réécrite à la main.
6. **La boucle d'itération est lente.** Un rendu de 30 s en 60 images par seconde prend environ 5 min 40, et la composition HTML fait 1 600 lignes. Il n'existe pas d'aperçu standard : planche d'images clés, timeline lisible, mesures automatiques des positions à l'écran.
7. **Le moteur sert deux maîtres**, le site interactif et les vidéos, ce qui limite les choix.
8. **Une seule métaphore par décor.** L'univers du terrarium limite la palette : tous les concepts ne se racontent pas avec un caméléon et une mouche.

## Ce que j'attends de ton plan

1. **Un audit court** (une page au plus) : ce qui est à garder tel quel, à transformer, ou à abandonner. Pour chaque point, la raison.
2. **La direction artistique** :
   - 2 ou 3 directions possibles, chacune décrite en quelques lignes : références de style, traitement de la lumière, des personnages, du texte et du mouvement ;
   - pour chacune, ce qu'elle permet en variété, et ce qu'elle coûte à produire et à rendre ;
   - **un test bon marché** pour que l'utilisateur choisisse : images fixes ou court extrait de 3 à 5 s, pas une vidéo complète.
3. **L'architecture de production**, pensée pour le minimum de tokens par vidéo. Pistes à évaluer, pas obligatoires :
   - une **bibliothèque de briques** versionnée : personnages articulés (poses, expressions, cycles de marche ou de vol), décors en calques (parallaxe), accessoires, mouvements de caméra nommés, transitions, styles de texte, ambiances lumineuses, sons ;
   - un **langage de scénario de haut niveau**, en temps forts et en mesures plutôt qu'en secondes. Par exemple `presenter(mouche, "la tâche")`, `gag(rater)`, `revelation("boucle d'outils")`. Le cadrage, les positions à l'écran, les étiquettes et la synchronisation avec la musique en sont déduits automatiquement ;
   - des **modèles d'épisode** (structures narratives prêtes à remplir) ;
   - des **contrôles automatiques** : tout reste à l'écran et dans la zone sûre, le texte est lisible, la synchronisation est respectée, plus une planche d'aperçu avant chaque rendu ;
   - une **mesure du coût** : le nombre de lignes à écrire et de tokens à dépenser pour une nouvelle vidéo, avec un objectif chiffré.
4. **L'univers et la palette** : comment garder une identité forte (Mousse, la nuit, le terminal) tout en pouvant raconter des concepts très différents. Par exemple : plusieurs décors dans le même monde, de nouveaux habitants, des formats récurrents (la « nuit », l'« expérience ratée », le « duel »).
5. **Un plan par étapes**, chacune petite, avec :
   - ce qui est montré à l'utilisateur et ce qu'il doit choisir ;
   - le critère de fin ;
   - une estimation de l'effort ;
   - l'ordre : d'abord ce qui débloque le plus, avec une vidéo pilote refaite avec la nouvelle méthode le plus tôt possible.
6. **Les risques** et ce qui est réversible.

## Contraintes techniques à respecter

- **Rendu déterministe**, image par image, avec HyperFrames :
  - une timeline GSAP en pause, enregistrée dans `window.__timelines[id]`, dans le même `<script>` que sa construction ;
  - pas de minuterie, pas de hasard non reproductible, pas de `repeat: -1` ;
  - chaque élément minuté a `.clip`, `data-start` et `data-duration` ;
  - les sons qui se chevauchent sont sur des pistes différentes.
  - Si tu proposes de changer d'outil de rendu, justifie-le et chiffre le coût.
- **Pas de ressources téléchargées au rendu** : GSAP et les polices sont copiés localement. Le réseau de l'environnement est limité (les registres de paquets sont accessibles, mais pas les banques de sons ou d'images). Tout son ou visuel doit être créé par l'outil ou ajouté au dépôt, et libre de droits.
- **Le dessin peut être généré par code** (SVG, Canvas, WebGL si le rendu logiciel suffit), ou venir de fichiers ajoutés au dépôt. Évalue aussi des bibliothèques d'animation de personnages compatibles (rigs SVG, Lottie, Rive…), en tenant compte du rendu déterministe.
- **Tout le texte destiné à l'utilisateur est en français.**
- **Le carnet `production/` est tenu à jour** à chaque étape, selon les règles de `terrarium/CLAUDE.md`.
- **Git** : travailler sur la branche `claude/gsap-js-nodejs-app-jtzfgz`, ne pas créer de PR sans demande, et ne jamais écrire d'identifiant de modèle dans le dépôt.

## Le livrable attendu

Un plan en français, lisible sur téléphone, qui contient :
- les sections 1 à 6 ci-dessus ;
- un tableau récapitulatif des étapes ;
- **une seule question de choix par étape** pour l'utilisateur.

Il doit être assez précis pour qu'un autre modèle l'exécute sans relire ce brief, en citant les fichiers à créer ou à modifier et les fonctions existantes à réutiliser (par exemple `drift(arrangement)` dans `scripts/build-sons.js`, le calcul de cadrage `vueDe` dans `film.js`, la validation dans `shared/scenarios.js`).
