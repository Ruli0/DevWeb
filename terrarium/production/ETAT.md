# État de l'outil

_Dernière mise à jour : 13 novembre 2026 (soir)._

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
| Épisodes | `videos/episodes/` | `demo` (16,6 s), `nuit-1` (le pilote, 29,8 s) |

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
