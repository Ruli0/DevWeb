# Plan de refonte : rapport, direction artistique, étapes

_Écrit le 13 novembre 2026, en réponse à `BRIEF-REFONTE.md`. À lire avec `SPEC-STUDIO.md` (l'architecture) et `GUIDE-EXECUTION.md` (comment travailler)._

## 1. Rapport court

### Le verdict

L'idée est bonne **à trois conditions**. Aucune n'est remplie aujourd'hui.

1. **Publier pour apprendre.** Après deux pilotes et 15 rendus, aucune vidéo n'est en ligne et `videos/resultats.csv` est vide. Toutes nos règles sont des hypothèses. Le plus gros risque du projet n'est pas le style : c'est de polir sans jamais mesurer.
2. **Faire baisser le coût d'une vidéo.** Le pilote « Nuit 1 » a demandé 9 actions nouvelles dans le moteur, un scénario de 462 lignes et plusieurs rendus de contrôle. À ce prix, on ne fera jamais 50 vidéos.
3. **Accepter le plafond du dessin par code, et choisir un style qui le cache.** Un modèle qui écrit du SVG à la main produit du « clip-art » correct, pas de l'illustration. Il faut une direction artistique où les formes simples sont une force : silhouettes, lumière, yeux expressifs.

Personne ne peut promettre la viralité. Ce plan vise ce qu'on contrôle : une accroche forte, un rythme calé sur la musique, une identité reconnaissable, un coût bas, et des mesures.

### Ce qui marche (à garder)

| Élément | Pourquoi le garder |
|---|---|
| Mousse, le gardien | Un personnage récurrent donne une raison de s'abonner. Ses réactions portent l'humour. |
| Le terminal (T6) | Une signature visuelle immédiate, qui remplace la voix off. |
| La phonk Drift arrangeable (`drift(arrangement)` dans `scripts/build-sons.js`) | Validée à l'oreille. La synchronisation par mesure fonctionne. |
| Le rendu déterministe HyperFrames | Même scénario, même vidéo. C'est la base de la reproductibilité. |
| Les contrôles (`shared/scenarios.js`, `scripts/verifier-videos.js`) | Temps de lecture, zone sûre, plans sur le temps : à étendre, pas à refaire. |
| La nuit bioluminescente | Elle distingue le compte dans un fil d'écrans clairs, et elle cache les faiblesses du dessin. |

### Ce qui ne marche pas (à changer)

| Problème | Preuve | Remède (voir `SPEC-STUDIO.md`) |
|---|---|---|
| Le scénario est en secondes et en coordonnées | Il a fallu mesurer la position de la mouche pour qu'elle reste à l'écran | Un format d'épisode en **temps forts** et en **mesures**, compilé vers le format actuel |
| Chaque gag coûte du code moteur | 9 actions ajoutées pour un épisode | Une bibliothèque de **temps forts** et de **gestes** réutilisables |
| Les personnages ne sont pas des pantins réutilisables | Le caméléon est dessiné dans le décor, et ses points d'appui sont en dur dans `film.js` | Des **rigs** avec une interface commune : ancres, poses, expressions, cycles |
| L'accroche est faible | Le pilote s'ouvre sur un écran noir et une phrase qui se tape | **Le gag d'abord** : la première seconde montre une action |
| Le concept arrive trop tôt et trop souvent | Trois étiquettes avant le premier gag | **Gag d'abord, concept en chute**, avec une seule idée par vidéo |
| La boucle d'essai est lente | 5 min 40 par rendu en 60 images par seconde | Un **aperçu** en planche d'images (quelques secondes), un rendu brouillon, et le rendu final une seule fois |
| Le moteur sert le site et les vidéos | Chaque changement risque de casser le site | **Geler le site.** Le studio vidéo évolue seul. |

### Deux désaccords avec le brief

- **Changer d'outil de rendu (Remotion, Rive, Lottie) n'est pas la priorité.** Le problème est en amont : le format du scénario et l'absence de briques. HyperFrames suffit. Rive et Lottie demandent des fichiers faits dans un éditeur graphique, que nous n'avons pas.
- **Le terrarium reste l'univers, mais il ne doit plus être un seul décor.** Il devient un monde avec plusieurs « coins » (branche, mare, fourmilière, serre) et des habitants. Une métaphore par épisode, un coin par métaphore.

## 2. Direction artistique : trois pistes à tester

Toutes gardent la nuit, Mousse, le terminal et la phonk. Elles changent la façon de dessiner et de bouger.

| | A. Théâtre d'ombres lumineuses | B. L'écran de Mousse | C. Diorama en papier découpé |
|---|---|---|---|
| **L'idée** | Le décor est en silhouettes sombres, sur 3 ou 4 plans de profondeur. Les personnages sont des formes simples qui brillent, avec de grands yeux. | Toute la vidéo se passe sur l'écran cathodique de Mousse : pixel art, vert phosphore, effets de balayage et de bug. | Des calques de papier texturé, avec des ombres portées et de la profondeur. |
| **Références** | Les jeux Limbo et Ori, les lucioles | Les consoles portables rétro, les « edits » phonk | Les livres animés, le stop motion |
| **Ce que ça cache** | Les défauts du dessin : une silhouette est toujours propre | Tout : un sprite de 24 × 24 se dessine comme une grille de texte | Rien : il faut bien dessiner |
| **Mouvement** | Parallaxe, traînées de lumière, squash and stretch | Image par image, sec et rythmé : idéal sur la phonk | Pantins articulés, plus lent |
| **Coût par vidéo** | Faible | Très faible | Élevé |
| **Coût de rendu** | Moyen (quelques flous) | Très faible | Élevé (ombres et textures) |
| **Variété** | Grande : un nouveau personnage est une forme et deux yeux | Très grande : n'importe quel objet en sprite | Moyenne |
| **Risque** | Moins « mignon » si les yeux sont ratés | S'éloigne du « beau terrarium » voulu au départ | Retomber dans le clip-art |

**Ma recommandation : A, avec B en renfort.** Le monde est en ombres lumineuses. L'écran de Mousse (B) sert de second registre pour les moments d'explication : un insert de 2 s en pixel art qui résume le concept. Ce mélange donne deux textures visuelles, donc du rythme, pour un coût faible.

**Une quatrième voie, si tu veux un saut de qualité** : des images faites avec un générateur d'images, découpées en calques et ajoutées au dépôt, que le studio anime comme des pantins. C'est le plafond le plus haut, mais il dépend de toi (créer et envoyer les images), et la cohérence entre les images est difficile à tenir. Je la garde en option, pas dans le chemin principal.

**Le test (étape 1)** : la même scène, « le caméléon rate la mouche », dans les trois pistes. Pour chacune : une image fixe et une boucle de 4 s, avec la musique. Aucune vidéo complète.

## 3. Règles de viralité à appliquer dès le prochain pilote

Ce sont des hypothèses solides, à confirmer par nos chiffres (`APPRENTISSAGES.md`).

1. **Première seconde : une action, pas une présentation.** L'épisode s'ouvre sur le gag ou sur son résultat. Jamais d'écran noir de plus de 0,4 s.
2. **Une vidéo, une idée.** Le concept tient en une phrase, dite une fois, à la fin. Les étiquettes servent à désigner, pas à faire un cours.
3. **Au plus 4 mots à l'écran à la fois**, et un changement visuel à chaque mesure (1,66 s à 145 BPM).
4. **Le gag suit la règle de trois** : essai raté, essai raté autrement, réussite inattendue.
5. **La chute relance** : la dernière image est la première, et le texte final donne envie de revoir (« et ça recommence… »).
6. **Mousse réagit à chaque temps fort.** C'est lui qu'on suit d'un épisode à l'autre.
7. **Un format récurrent et nommé** (« Nuit n° X »), une question épinglée en commentaire, et deux accroches de rechange à comparer.
8. **Durée : de 20 à 30 s.** On tranchera avec le taux de visionnage complet.

## 4. Les étapes

Chaque étape est petite, montre quelque chose, et pose **une seule question**. Rien n'est commencé avant ta réponse à l'étape d'avant, sauf l'étape 0, qui ne dépend que de toi.

| # | Étape | Ce que tu vois | Ta décision | Critère de fin | Effort |
|---|---|---|---|---|---|
| 0 | **Publier le pilote actuel** (tour 2), tel quel | Rien de nouveau : le MP4 déjà reçu | Tu le publies, ou non ? | Une ligne dans `videos/resultats.csv` après 48 h | 5 min pour toi |
| 1 | **Test de direction artistique** | 3 images et 3 boucles de 4 s (pistes A, B, C) | Laquelle, ou quel mélange ? | Choix noté dans `IDENTITE.md` | 1 séance |
| 2 | **Socle du studio** : format d'épisode, compilateur, aperçu, studio séparé du site | « Nuit 1 » réécrite en moins de 60 lignes, qui redonne la même vidéo | Le format d'épisode te paraît-il lisible ? | Compilation identique à l'actuel `cameleon.json`, tests verts | 1 à 2 séances |
| 3 | **Rigs dans la nouvelle direction** : Mousse, le caméléon, la mouche, et un coin de décor en calques | Une planche des poses et expressions, et une boucle de 4 s | Les personnages te plaisent-ils ? | 3 rigs conformes à l'interface, visibles dans `CATALOGUE.md` | 1 à 2 séances |
| 4 | **Temps forts et pilote 3** : le gag d'abord, la musique déduite automatiquement | Le pilote 3 (25 à 30 s) | Publiable ? Sinon, quoi changer en une ligne ? | Pilote validé, 0 ligne de moteur écrite pour lui | 1 séance |
| 5 | **Preuve de la palette** : un 2ᵉ épisode avec d'autres personnages (la dionée : les hooks), écrit par Sonnet avec le seul catalogue | L'épisode 2, et son coût réel | Le coût et la qualité sont-ils bons ? | Épisode en moins de 60 lignes, au plus 2 aperçus, 1 rendu | 1 séance |
| 6 | **Production en série** : 5 épisodes, publication, mesures | Les vidéos, puis les chiffres | Que garde-t-on, que change-t-on ? | 3 publications mesurées, `APPRENTISSAGES.md` à jour | En continu |

L'ordre a une raison : l'étape 2 vient avant les nouveaux dessins, parce que c'est elle qui fait baisser le coût de tout le reste. L'étape 5 est le vrai test du plan : si un modèle plus léger ne sait pas faire un épisode avec le catalogue seul, le studio n'est pas fini.

## 5. Objectifs chiffrés

| Mesure | Aujourd'hui (pilote Nuit 1) | Objectif après l'étape 5 |
|---|---|---|
| Lignes écrites pour un épisode | 462 lignes de JSON, plus environ 250 lignes de moteur | Moins de 60 lignes, 0 ligne de moteur |
| Fichiers à lire pour écrire un épisode | `film.js`, `scenarios.js`, le dessin (environ 1 500 lignes) | `GUIDE-EXECUTION.md` et `CATALOGUE.md` (moins de 300 lignes) |
| Rendus complets par épisode | 3 à 4 | 1, après 2 aperçus au plus |
| Temps d'un aperçu | 5 min 40 (rendu complet) | Moins de 20 s (planche d'images) |
| Nouveau personnage | Dessin et moteur mêlés | 1 fichier de rig, de moins de 150 lignes |

## 6. Risques

| Risque | Parade | Réversible ? |
|---|---|---|
| La nouvelle direction ne plaît pas plus | L'étape 1 coûte une séance, et on ne garde que ce qui est choisi | Oui : l'ancien style reste dans le dépôt |
| Le compilateur devient une usine à gaz | Il produit le format actuel, que le moteur sait déjà jouer. On ajoute un temps fort seulement quand un épisode en a besoin | Oui : on peut toujours écrire le format bas niveau |
| Le pixel art (piste B) rend mal | Le tester à l'étape 1 sur un seul sprite | Oui |
| On refait de l'outillage sans publier | L'étape 0 est proposée tout de suite, et l'étape 6 ne commence pas sans 3 publications mesurées | — |
| Le français limite l'audience | Le texte est court : une version anglaise est une variante de plus, à tester plus tard | Oui |
