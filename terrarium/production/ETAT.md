# État de l'outil

_Dernière mise à jour : 12 novembre 2026._

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

## Dernières vidéos rendues

- 5 épisodes × 3 accroches (15 MP4), avec la phonk. Rendus en cours le 12 novembre ; une vidéo, le caméléon (accroche a), a déjà été contrôlée et envoyée.
