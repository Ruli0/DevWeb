---
name: episode
description: Écrit un nouvel épisode vidéo (30 à 60 s, cerveau et santé) pour le studio, à partir du catalogue de scènes, sans lire le moteur. À utiliser quand on demande une nouvelle vidéo ou un nouveau sujet.
---

# Écrire un épisode

**À lire, et rien d'autre** : `terrarium/production/CATALOGUE.md` (les scènes et leurs paramètres) et un épisode existant de `terrarium/videos/episodes/` comme modèle. Ne pas lire `studio/compiler.js`, `studio/runtime.js` ni les scènes.

## Étapes

1. **Les sources d'abord** : lancer le skill `sources` pour le sujet. Sans fiche, pas d'épisode.
2. **L'angle** en une phrase : une idée reçue à renverser (« ce n'est pas de la paresse, c'est… »).
3. **La structure**, 30 à 60 s :
   1. `accroche` (0 à 3 s) : une question ou un chiffre qui touche ;
   2. le mécanisme (10 à 20 s) : `cerveau` ou `mecanisme` ;
   3. l'étude (8 à 15 s) : `chiffre`, `graphique` ou `comparaison`, avec `"source"` ;
   4. `geste` (5 à 10 s) : une action concrète et réaliste ;
   5. `boucle`.
4. **Écrire** `terrarium/videos/episodes/<id>.json`. Viser moins de 60 lignes.
5. **Le texte** : phrases courtes, vocabulaire d'adulte, au plus 34 caractères par morceau, un mot clé par morceau (`*mot*`). Typographie française. Le texte affiché d'un fait doit correspondre au `texte_ecran` de la fiche.
6. **Compiler et regarder** : skill `apercu`. Corriger d'après les messages du compilateur (ils disent quoi changer) et d'après la planche.
7. **Montrer la planche** à l'utilisateur avec une seule question, puis le skill `rendu` après son accord.

## À ne pas faire

- Ajouter du code au moteur pour un épisode. S'il manque une scène, utiliser le skill `scene` et le signaler.
- Afficher un fait sans `source`.
- Lancer un rendu avant que la planche soit validée.
