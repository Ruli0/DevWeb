# État de l'outil

_Dernière mise à jour : 16 novembre 2026._

## Chaîne « avis » (15 nov. 2026)

Le cap de la branche `claude/busy-feynman-m0q7yp` : la voix de l'auteur d'abord. Passation complète dans `PASSATION-AVIS.md`.

| Ce qui marche | Où |
|---|---|
| Voix : débruitage RNNoise, transcription mot par mot, silences | `scripts/voix.py` |
| Montage : blancs retirés, passages coupés, vitesse, fondu aux raccords | `studio/avis/montage.js`, `page.js` |
| Sous-titres mot par mot, mot en cours en pastille | `studio/avis/lecteur.js` |
| 5 plans (dont `visuel`, sans texte), 11 illustrations, 3 fonds unis, 3 décors illustrés, fond photo, 4 transitions | `studio/avis/` |
| Épisode `agriculteur-ia` (37 s, vraie voix) : champ, supermarché, robot, « model collapse » | `videos/episodes/agriculteur-ia.json` |
| Épisode `valeur-ia` (57 s), 5 versions envoyées | `videos/episodes/valeur-ia.json` |
| Épisode `enigme-thermometre` (33 s) : pause de 5 s avec compte à rebours et tics, décor `salon` | `videos/episodes/enigme-thermometre.json` |
| Décor `riziere` (Vietnam) et essai de 12 s ; réservoir d'idées | `studio/avis/decors.js`, `production/IDEES-VIDEOS.md` |
| Style du compte « papier découpé vif » et 4 autres thèmes ; `--theme=` et `--3d` pour changer de style | `studio/avis/themes.js`, `scripts/video.js` |
| Décors 3D `mur3d` et `riziere3d` (Three.js), aspect doux par défaut ou aplats (`--aspect=decoupe`) ; caméra pilotée par l'épisode (9 mouvements, vitesse, force, coups de zoom sur les mots forts) ; souffles et ambiance | `studio/avis/decors3d.js`, `scripts/sons-v3.js` |
| Accroche : conseils du montage, ouverture vive, `--accroche`, guide | `studio/avis/montage.js`, `lecteur.js`, `production/ACCROCHES.md` |
| Session neuve prête en une commande (essai à blanc réussi) | `scripts/installer.sh`, `PASSATION-AVIS.md` section 0 |
| Son : musique `house-plate` (validée) qui baisse sous la voix, bruitages des décors | `scripts/sons-avis.js`, `studio/avis/montage.js`, `page.js` |
| Mascotte : un petit hibou de verre en 2D, sept poses, six décors, à l'ouverture et à la fin seulement | `studio/avis/personnage.js` |
| Six palettes de couleurs (`--palette=`), `coucher` choisie par l'auteur ; texte toujours droit | `studio/avis/palettes.js`, `themes.js`, `lecteur.js` |
| Photos de l'auteur : fond `photo`, détourage local (`scripts/decouper.py`), collage en autocollant ; première photo (Fontainebleau) sur la maquette d'escalade | `studio/avis/page.js`, `scripts/decouper.py`, `videos/medias/` (hors dépôt) |
| Mixage en un seul fichier, limiteur à −3 dB | `studio/avis/page.js` |
| Maquette muette `escalade-techniques` (37 s) : décor `mur`, six gestes dessinés | `scripts/maquette-voix.js`, `videos/episodes/escalade-techniques.json` |

Limites : le son n'est jugé que par l'auteur (le modèle ne peut pas écouter) ; le fond photo n'a jamais servi avec une vraie photo ; pas de décor pour les relations ; les dessins d'escalade n'ont pas été relus par un grimpeur ; musique héritée de la V3 ; rien n'est publié. En attente : deux prises de voix de l'auteur (`valeur-ia` resserré et `escalade-techniques`).

## Cap V3 (14 nov. 2026)

Le projet devient un générateur de vidéos « cerveau et santé » pour adultes (30 à 60 s, études à l'appui). Les documents de passation sont écrits : `BRIEF-V3.md`, `DA-V3.md`, `PLAN-V3.md`, `SOURCES.md`, et six skills dans `.claude/skills/`. **Étape 1 faite** : style « Laboratoire » validé (`studio/style.js`, `studio/dessins/cerveau.js`, `studio/polices/`). **Étape 2 faite** : musique « Labo » (`scripts/sons-v3.js`). **Format « test » en place** (cerveau vivant, scènes `test`, `question`, `revelation`, `appel`) et pilote `procrastination` (41 s) monté ; sa fiche de sources est « à vérifier » : le réseau de la session bloque PubMed et les copies d'articles. Avant : **étape 3** : la chaîne V3 marche (`npm run video -- essai-scenes`) : 9 scènes, montage avec contrôle des sources, lecteur GSAP (SplitText, DrawSVG, MorphSVG, CustomEase), page HyperFrames, son déduit. Limites : l'ancienne chaîne n'est pas encore archivée ; les chiffres de l'épisode d'essai sont « à vérifier ». Le studio décrit ci-dessous est la base technique à garder ; ses personnages et son décor sont archivés.

## Le studio (refonte, étape 2)

La nouvelle chaîne, dans la direction artistique A2, vit dans `studio/`. Une vidéo s'écrit en temps forts, dans `videos/episodes/<id>.json` (la démo fait 15 lignes), et `npm run video -- <id> [--rendu]` fait le reste.

| Brique | Fichier | État |
|---|---|---|
| Compilateur (épisode → feuille de route) | `studio/compiler.js` | Fonction pure. Suit l'état de la scène, vérifie la lecture des textes, les chevauchements de gestes et la boucle |
| Temps forts | `studio/temps-forts.js` | `accroche`, `presenter` (ia, tache, outil), `rater` (aveugle, court), `narguer`, `etapes`, `reussir`, `reveler`, `boucler` |
| Personnages | `studio/rigs/` | caméléon (5 gestes), mouche au fil (5), Mousse (6) |
| Décor | `studio/decors/branche.js` | 4 calques de profondeur, parallaxe pendant les zooms |
| Lecteur | `studio/runtime.js` | Code fixe : caméra, gestes, texte tapé, étiquettes |
| Page et musique | `studio/page.js` | Composition HyperFrames, Drift arrangée par mesure |
| Catalogue | `studio/catalogue.js` → `production/CATALOGUE.md` | Tout ce qu'il faut lire pour écrire un épisode |
| Tests | `test/studio.test.js` | 9 tests (32 au total avec l'ancienne chaîne) |
| Épisodes | `videos/episodes/` | `demo` (16,6 s), `nuit-1` (IA, abandonné), `jugement` (la peur du jugement, 29,8 s) |
| Lumière | `studio/lumiere.js` | Liserés chauds sur Mousse et le caméléon, ombres portées, flaques de lumière, projecteur à faisceau |
| Voisins | `studio/rigs/{grenouille,lucioles,pensees,ambiance}.js` | La grenouille, les trois lucioles, les bulles de pensée, le projecteur et son voile (`"voisins": true` dans l'épisode) |

Limites : un seul décor, un seul couple de rôles (caméléon et mouche), six temps forts. La sortie (`videos/studio/`) n'est pas versionnée : elle se régénère à l'identique.

L'ancienne chaîne (`videos/scenarios/`, `scripts/build-video.js`, `public/js/film/film.js`) et le site sont gelés.

## En une phrase

Un scénario JSON donne une vidéo TikTok de 19 à 25 s, en 1080 × 1920, avec image animée, légendes, musique phonk et bruitages, vérifiée automatiquement et rendue en MP4 par HyperFrames. **Aucune vidéo n'a encore été publiée** : on ne sait donc pas encore si elles retiennent.

## Ce qui marche

| Étape | Outil | État |
|---|---|---|
| Écrire une vidéo | `videos/scenarios/<id>.json` | 5 scénarios, chacun avec 3 accroches |
| Valider le scénario | `shared/scenarios.js`, `npm test` (23 tests) | Temps de lecture, longueur des textes, accroche ≤ 3 s, révélation ≤ 3,5 s, boucle, sons |
| Animer | `public/js/film/film.js` | Une timeline GSAP en pause, sans hasard ni minuterie. 33 actions, caméra 9:16 qui suit le sujet |
| Dessiner | `public/js/art/terrarium.js` | Vivarium vectoriel, calculable aussi en Node |
| Sonoriser | `scripts/build-sons.js`, `videos/sons/table.js` | Phonk originale (130 BPM), 13 bruitages, ambiance, tous synthétisés |
| Composer | `scripts/build-video.js` | Une composition HyperFrames par accroche, plus un `publication.md` |
| Vérifier | `scripts/verifier-videos.js`, `npx hyperframes lint` | Zone sûre et lignes : 15/15 conformes. Lint : 0 erreur |
| Rendre | `npx hyperframes render` | Environ 70 s par vidéo. Son AAC, niveau moyen d'environ -14,5 dB, sans saturation |
| Thème de nuit | `public/js/art/nuit.js`, `public/js/art/gardien.js` | `"theme": "nuit"` : vivarium nocturne bioluminescent, Mousse et sa lanterne, légendes tapées dans son terminal, repère « Nuit n° X ». Actions `gardien.*` (lanterne, expression, gestes), `mouche.esquiver`, `mouche.narguer`, `scene.etiquette`, langue ratée ou partielle. Caméra qui cadre la mouche et avance pendant le plan (`poussee`) |
| Suivre la musique | `tempo`, `arrangement` dans le scénario | Les plans doivent commencer sur un temps (validé). La piste Drift est fabriquée pour chaque vidéo : une partie par mesure (intro, creux, montée, plein) et des coupures d'un temps |
| Aperçu sans rendu | `scripts/apercu.js` | Une planche d'images clés en 15 s environ, au lieu d'un rendu de plusieurs minutes |
| Mesurer | `videos/resultats.csv` | Prêt, encore vide |

Le site (`public/`) joue les mêmes scénarios en temps réel, avec cinq chapitres interactifs.

## Limites connues

- **Aucune donnée d'audience.** Toutes les règles (durées, accroches, rythme) sont des hypothèses tant qu'on n'a pas publié.
- **La phonk n'a jamais été écoutée.** Elle a été vérifiée par analyse (rythme, volumes), pas à l'oreille. Une boucle synthétisée par code reste plus pauvre qu'une vraie production.
- **Ajouter un concept coûte du code.** Une nouvelle métaphore demande en général de nouveaux éléments de dessin et de nouvelles actions dans `film.js`. C'est le principal frein pour passer de 5 à 50 vidéos.
- **Le style est vectoriel à plat.** Il est cohérent et lisible, mais sans lumière, profondeur ni texture.
- **La couverture** est décrite (instant et titre) mais pas encore générée en image.
- **Les coupes ne tombent pas sur le temps** de la musique.
- **La caméra ne cadre que des points fixes** ou des habitants connus. Il n'y a pas de suivi automatique d'un objet en mouvement, sauf le caméléon.
- **Déterminisme** : sur une image de la vidéo du caméléon, 18 pixels varient légèrement selon l'ordre des sauts dans la timeline. C'est sans effet visible.
- **Avertissements HyperFrames restants** : fichiers trop gros, à découper en sous-compositions, et un faux positif sur un état caché.
- **Les rendus se lancent à la main.** Il n'y a ni commande unique, ni rendu automatique à chaque modification.

## Pilote de nuit (13 nov. 2026)

« Nuit 1 : la langue » (`cameleon.json`), tour 2 : 29,8 s, phonk Drift arrangée, 60 images par seconde, rendu en environ 5 min 40 (26 Mo). Les 4 autres épisodes sont encore dans l'ancien style de jour.

## Dernières vidéos rendues (12 nov. 2026)

15 MP4 : 5 épisodes × 3 accroches, avec la phonk, de 19 à 24,5 s, 1080 × 1920. Le son est en AAC, avec un niveau moyen de -14,5 à -17 dB. Contrôlés image par image.

Points faibles repérés en les regardant :
- **La boîte en verre (épisode 5)** est la plus faible : l'idée de « boîte » se voit mal en plein écran (on ne voit plus les parois), la pousse des plantes est peu lisible, et le caméléon qui se promène attire l'œil.
- **L'accroche des fourmis (épisode 4)** montre une fourmilière presque immobile : peu de mouvement dans la première seconde.
- **Le caméléon, la dionée et le ruisseau** ont des accroches lisibles et en mouvement.
