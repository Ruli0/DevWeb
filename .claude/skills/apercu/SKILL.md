---
name: apercu
description: Compile un épisode du studio vidéo et produit sa planche d'images clés en quelques secondes, sans rendu. À utiliser après chaque modification d'un épisode ou d'une scène, et avant tout rendu.
---

# Aperçu d'un épisode

Depuis `terrarium/` :

```bash
npm run video -- <id>
```

Cela monte `videos/episodes/<id>.json` (chaîne V3 si `"version": 3` : `studio/montage.js`, `studio/page-v3.js`), écrit la composition dans `videos/studio/<id>/` et la planche `videos/studio/<id>/apercu.png` (une image par scène, à 70 % de sa durée).

Pour des instants précis :

```bash
NODE_PATH=$(npm root -g) node scripts/apercu.js videos/studio/<id>/index.html videos/studio/<id>/apercu.png 0.5 3.2 7.8
```

## Si la compilation échoue

Le message dit quoi changer : texte trop long pour sa durée, plus de 34 caractères, scène inconnue, source manquante, gestes qui se chevauchent, fin qui ne reboucle pas. Corriger l'épisode, pas le compilateur.

## Regarder la planche (toujours, avec Read)

- Le texte est lisible sur téléphone et reste dans la zone sûre (x 60 à 940, y 150 à 1440).
- Un seul point focal par image ; rien ne passe sous un autre élément.
- Un seul accent de couleur ; la source est visible sous chaque chiffre.
- Rien d'enfantin (voir le skill `style`).
- La dernière image ressemble à la première (la vidéo boucle).

Corriger ce qui se voit, refaire la planche, puis seulement la montrer à l'utilisateur. Deux aperçus au plus par épisode en régime normal.
