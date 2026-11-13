# Feuille de route

_Dernière mise à jour : 12 novembre 2026._

Statuts : **à faire**, **en cours**, **fait**, **abandonné**. Les priorités vont de P0 (bloquant) à P3 (plus tard).

## P0 : mesurer pour de vrai

| # | Étape | Qui | Statut |
|---|---|---|---|
| 1 | Rendre les 15 vidéos (5 épisodes × 3 accroches) avec la phonk | Claude | fait |
| 2 | Écouter la phonk et les bruitages sur un téléphone, et donner un avis | Toi | à faire |
| 3 | Publier les épisodes 1, 2 et 3 (accroche a), à 2 ou 3 jours d'écart | Toi | à faire |
| 4 | Après 48 h, relever les chiffres dans `videos/resultats.csv` | Toi | à faire |
| 5 | Analyser, noter les apprentissages et réécrire les accroches | Claude | à faire |

## Refonte en cours (13 nov. 2026)

Le plan est dans `PLAN-REFONTE.md` : 7 étapes, de la publication du pilote actuel (étape 0) à la production en série (étape 6). Prochaine action : ta réponse à l'étape 0 (publier le pilote) et le lancement de l'étape 1 (test de direction artistique). Les lignes ci-dessous restent valables, mais passent après la refonte.

## P1 : qualité et rétention

| # | Étape | Pourquoi | Statut |
|---|---|---|---|
| 21 | Pilote « Nuit 1 » : recueillir ton avis et ajuster | Valider l'identité avant de produire le reste | tour 2 envoyé, en attente de ton retour |
| 22 | Passer les nuits 0, 2, 3, 4 et 5 au thème de nuit, avec leurs gags | La série « Les nuits du terrarium » | après le pilote |
| 23 | Photo de profil, bio et kit de publication dans la voix de Mousse | L'âme du compte | après le pilote |
| 19 | Retravailler la boîte en verre : montrer les parois qui se remplissent, et arrêter la promenade du caméléon dans cet épisode | L'épisode le plus faible visuellement | à faire |
| 20 | Accroche des fourmis : partir d'une fourmilière qui déborde déjà de fourmis | La première seconde manque de mouvement | à faire |
| 6 | Caler les coupes et les apparitions de texte sur le temps de la musique | Une vidéo synchronisée paraît plus pro et retient mieux | fait pour la Nuit 1 (`tempo`, `arrangement`) ; à étendre aux autres épisodes |
| 7 | Générer l'image de couverture (titre en gros sur la meilleure image) | La couverture compte sur la page de profil | à faire |
| 8 | Une commande unique : `npm run video -- <id>` (valider, composer, vérifier, rendre) | Moins d'étapes manuelles, moins d'oublis | à faire |
| 9 | Deux ou trois boucles phonk de plus, choisies par scénario | Éviter que toutes les vidéos sonnent pareil | à faire |
| 10 | Une animation d'accent sur les mots en vert (léger rebond, ou effet machine à écrire) | Le texte porte la narration, il doit vivre | à faire |
| 11 | Une planche de contrôle automatique par vidéo (images clés et masque TikTok) | Relire une vidéo en 10 secondes avant publication | à faire |

## P2 : passer à l'échelle

| # | Étape | Pourquoi | Statut |
|---|---|---|---|
| 12 | Une bibliothèque d'actions génériques (déplacer, apparaître, pulser, suivre un chemin) utilisables sur n'importe quel élément | Écrire un épisode sans toucher au code | à faire |
| 13 | Une liste de concepts pour la saison 2 (mémoire, RAG, MCP, injection de prompt, évaluations…) | Avoir un stock d'épisodes | à faire |
| 14 | Un assistant qui propose un scénario JSON à partir d'un concept, validé par `npm test` | La production devient « écrire un concept » | à faire |
| 15 | Rendu automatique à chaque modification de scénario (GitHub Actions) | Les MP4 sont toujours à jour | à faire |

## P3 : plus tard

| # | Étape | Statut |
|---|---|---|
| 16 | Profondeur visuelle : lumière, flou de profondeur, effet de parallaxe à la caméra | à faire |
| 17 | Versions Reels et Shorts (mêmes vidéos, zones sûres différentes) | à faire |
| 18 | Découper les compositions en sous-compositions (avertissements HyperFrames) | à faire |

## Fait

- Revue critique du format (12 nov.) : voir DECISIONS.md, décision 6.
- Format TikTok : 9:16 plein écran, légendes en morceaux, accroches, révélation courte, boucle, 3 variantes (12 nov.).
- Bruitages synthétisés et ambiance (12 nov.).
- Boucle phonk originale, option `--sans-musique` (12 nov.).
- Kit de publication par vidéo et `resultats.csv` (12 nov.).
- Vérification de la zone sûre dans un vrai navigateur (12 nov.).
