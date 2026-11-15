---
name: sources
description: Cherche, vérifie et rédige la fiche de sources scientifiques d'un épisode vidéo (terrarium/videos/episodes/<id>.sources.json). À utiliser avant d'écrire un épisode, ou pour contrôler un chiffre ou une étude à afficher.
---

# Fiche de sources d'un épisode

Règle complète : `terrarium/production/SOURCES.md`. **Aucun chiffre ni affirmation scientifique à l'écran sans fiche vérifiée. Ne jamais inventer une référence, un chiffre ou une citation.**

## Étapes

1. **Cerner le sujet** en une phrase : le mécanisme à expliquer et le geste proposé.
2. **Chercher** (WebSearch, mode étendu si besoin) 2 ou 3 études candidates. Préférer : méta-analyse, puis étude répliquée, puis étude classique en signalant ses limites.
3. **Pour chaque affirmation retenue**, trouver la source d'origine (auteurs, année, revue, volume, pages, DOI) et lire le chiffre dans l'article ou son résumé officiel. Noter d'où il est lu : `article`, `resume` ou `secondaire`.
4. **Vérifier** ce que l'étude mesure : population, effectif, corrélation ou causalité. Chercher les critiques et les échecs de réplication.
5. **Écrire** `terrarium/videos/episodes/<id>.sources.json` au format de `SOURCES.md` (champs : `texte_ecran`, `type`, `valeur`, `reference`, `doi`, `citation_origine`, `lu_dans`, `population`, `limites`, `affichage_source`).
6. **Fixer le statut** : `verifie` si tout est lu dans l'article ou le résumé officiel ; sinon `a-verifier`. Seul `verifie` autorise le rendu final.

## Formulation à l'écran

- Pas d'arrondi silencieux (« 46 % » reste « 46 % », ou « près de la moitié » avec le chiffre exact dans le post).
- Corrélation : « est lié à », jamais « provoque ».
- Dire sur qui porte l'étude quand c'est restreint.
- Jamais de promesse de guérison ni de conseil médical.

## Compte rendu à l'utilisateur

En quelques lignes : les affirmations retenues avec leur source, celles écartées et pourquoi, le statut, et ce qui reste à vérifier dans l'article.
