---
name: scene
description: Ajoute ou modifie une scène de la bibliothèque du studio vidéo (terrarium/studio/scenes/) en respectant le gabarit, le style V3 et les règles du rendu déterministe. À utiliser quand un épisode a besoin d'une scène qui n'existe pas.
---

# Ajouter une scène

**À lire** : le skill `style`, une scène voisine dans `terrarium/studio/scenes/`, et la section 6 de `terrarium/production/DA-V3.md`. Les outils de la timeline (`c.ft`, `c.lignes`, `c.mots`, `c.entrer`, `c.sortir`, `c.apparaitre`, `c.disparaitre`, `c.tracer`, `c.compteur`) sont dans `terrarium/studio/lecteur.js`. Le CSS commun est dans `css()` de `terrarium/studio/page-v3.js`.

## Gabarit

Un fichier `studio/scenes/<nom>.js` au format UMD (comme les rigs), qui expose :
- `id`, `description`, `params` (pour le catalogue), `min` (durée minimale), `source` (true si elle affiche un fait), `texteSource(p)` ;
- `textes(p)` : les textes à lire (pour la durée) ; `sons(p, d)` : `[[fichier, instant, volume]]` ;
- `dessin(p, S, u)` : le HTML ou le SVG (texte pur, `u.md` pour `*mot*`, `u.esc`) ;
- `jouer(c, el, p, t0, d, fin, ctx)` : entrées à partir de `t0`, sorties à `fin`.

Puis : l'ajouter à `NOMS` dans `studio/montage.js`, régénérer le catalogue (`node studio/catalogue.js`), compléter `test/scenes.test.js`.

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
