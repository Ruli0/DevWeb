# Journal des décisions

Chaque décision qui engage la suite, avec sa raison et ce qu'on a écarté. La plus récente en bas.

## 1. Le terrarium comme univers visuel (12 nov. 2026)

- **Décision** : expliquer les concepts d'agents IA avec un vivarium illustré et vivant, pas avec des schémas.
- **Pourquoi** : une identité forte et reconnaissable d'un épisode à l'autre, et des métaphores qui se comprennent sans texte (le bocal pour le contexte, le caméléon pour la boucle d'outils, la dionée pour les hooks, le ruisseau pour le middleware, les fourmis pour les multi-agents).
- **Écarté** : une brigade de cuisine, une mission spatiale, une tour de contrôle, une agence de détectives.

## 2. Un rendu déterministe, image par image (12 nov. 2026)

- **Décision** : chaque vidéo est une seule timeline GSAP en pause, sans minuterie, sans hasard non reproductible et sans répétition infinie.
- **Pourquoi** : c'est la condition d'un rendu image par image fiable, et la même entrée donne toujours la même vidéo.
- **Écarté** : filmer l'écran pendant que la scène tourne (images manquées, résultat différent à chaque fois).

## 3. HyperFrames plutôt que Remotion (12 nov. 2026)

- **Décision** : rendre avec HyperFrames.
- **Pourquoi** : le vivarium est déjà en HTML + GSAP, il passe tel quel. La licence est Apache 2.0, gratuite même pour un usage commercial. L'outil tourne ici, et l'app Claude a un connecteur HyperFrames.
- **Écarté** : Remotion, qui demanderait de tout réécrire en React, avec une licence payante au-delà d'une petite structure. À reconsidérer seulement si on a besoin de son rendu dans le cloud.

## 4. Le scénario JSON comme source unique (12 nov. 2026)

- **Décision** : une vidéo = un fichier `videos/scenarios/<id>.json`. Le site et la vidéo jouent le même scénario.
- **Pourquoi** : versionnable, validable par des tests, facile à écrire pour un humain ou un agent.
- **Écarté** : un format inventé par un agent à chaque demande (impossible à valider ni à rendre de façon fiable).

## 5. Pas de voix off (12 nov. 2026)

- **Décision** : le texte à l'écran porte la narration.
- **Pourquoi** : ton choix. Cela permet aussi une production entièrement automatique, sans enregistrement.
- **Conséquences** : des légendes grosses, découpées en morceaux, minutées selon le temps de lecture, et un son qui repose sur la musique et les bruitages.
- **À revoir si** les chiffres montrent une rétention faible par rapport aux vidéos avec voix.

## 6. Le format TikTok après la revue critique (12 nov. 2026)

- **Constat** : la technique était bonne, mais les vidéos ressemblaient à une leçon. Elles étaient muettes, avec une accroche faible, un titre et un cadre qui mangeaient l'écran, des légendes sous l'interface TikTok, des cartes de code de 9 s illisibles, et aucune boucle.
- **Décision** : 9:16 plein écran, zone sûre, légendes en morceaux animés, accroche en mouvement, révélation en une phrase de 3 s, fin qui boucle, 3 accroches par vidéo, durée de 19 à 25 s.

## 7. Des sons synthétisés par l'outil (12 nov. 2026)

- **Décision** : bruitages, ambiance et musique sont générés par `scripts/build-sons.js`.
- **Pourquoi** : les banques de sons ne sont pas accessibles depuis l'environnement de travail. Synthétiser garantit l'absence de problème de droits, et un résultat identique à chaque fois.
- **Limite** : moins riche qu'un vrai enregistrement.

## 8. Une phonk originale intégrée (12 nov. 2026)

- **Décision** : une boucle phonk originale est mixée dans chaque vidéo, sous les bruitages. L'option `--sans-musique` permet d'ajouter plutôt un son tendance dans TikTok.
- **Pourquoi** : ta demande. Une musique sous droits intégrée au fichier serait coupée ou démonétisée, alors qu'un son tendance ajouté dans l'appli peut aider la diffusion.
- **À tester** : la phonk maison contre un son tendance, sur le même épisode.
