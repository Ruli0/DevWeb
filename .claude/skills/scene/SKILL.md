---
name: scene
description: Ajoute ou modifie une scène de la bibliothèque du studio vidéo (terrarium/studio/scenes/) en respectant le gabarit, le style V3 et les règles du rendu déterministe. À utiliser quand un épisode a besoin d'une scène qui n'existe pas.
---

# Ajouter une scène

**À lire** : le skill `style`, une scène voisine dans `terrarium/studio/scenes/`, et la section 6 de `terrarium/production/DA-V3.md`. Avant l'étape 3 du plan, le modèle de forme est un rig de `terrarium/studio/rigs/`.

## Gabarit

Un fichier `studio/scenes/<nom>.js` au format UMD (comme les rigs), qui expose :
- `dessin(params, style)` : le HTML ou le SVG, calculé à la compilation (texte pur) ;
- `duree(params, T)` ou `GESTES` : ce que la scène occupe, pour le compilateur ;
- `jouer(c, t, params)` : ses animations, posées sur la timeline avec `c.ft`, `c.repos`, `c.cycle`.

Puis : l'enregistrer dans le compilateur, régénérer le catalogue (`node studio/catalogue.js`), ajouter un test.

## Règles du rendu déterministe

- Une seule timeline en pause. Ni minuterie, ni `Math.random`, ni `repeat: -1`.
- Chaque animation est un `fromTo` sans rendu immédiat (`c.ft`), qui part de l'état d'arrivée de la précédente. Les états de repos passent par `c.repos`.
- Les cycles d'ambiance ont une période qui divise la durée de la vidéo (`c.cycle`).
- Chaque élément minuté porte `.clip`, `data-start` et `data-duration`.

## Pièges connus

- **Une propriété animée par élément** : pour deux mouvements, emboîter deux groupes.
- **`svgOrigin`** se lit dans le repère local du groupe.
- **Ne pas animer `x`, `y` et `scale` d'un groupe dont le contenu bouge** : animer un objet de valeurs et réécrire l'attribut `transform` dans `onUpdate` (voir la caméra de `studio/runtime.js`).
- **SplitText** après `document.fonts.ready`, sinon les lignes sont fausses au rendu.
- **Le texte ne doit pas se décaler** : tout le texte est dans la page dès le début, on anime sa visibilité, pas sa présence.
- **Interdits de style** : `back`, `elastic`, `bounce`.

## Vérifier

`npm test`, puis le skill `apercu` sur un épisode qui utilise la scène. Regarder la planche.
