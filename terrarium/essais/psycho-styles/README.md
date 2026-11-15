# Maquettes de style : série « psycho en métaphores »

Épisode de référence : « la peur du jugement » (l'effet projecteur). Deux moments fixes, dans quatre styles complets (décor, personnages, texte) :

| Style | Décor | Personnages | Texte |
|---|---|---|---|
| S1. Ombres lumineuses | Le terrarium de nuit actuel, en silhouettes | Corps sombres, contours et yeux lumineux | Néon, mot clé géant, bandeau sombre |
| S2. Doux et pastel | Nuit lavande et rose, buissons ronds, étoiles douces | Ronds, couleurs tendres, joues roses, ombres douces | Lettres rondes blanches, pastille rose pour le mot clé |
| S3. Bande dessinée | Bleu tramé, feuilles en aplat, trait noir | Couleurs vives, trait noir épais, sueur, onomatopée | Cartouche jaune en majuscules, mot clé rouge |
| S4. Livre en papier découpé | Papier texturé, collines, ombres portées | Pantins de papier avec attaches dorées | Écriture à la main sur une étiquette, mot clé souligné en rouge |
| S5. Pâte à modeler | Volumes doux, bokeh flou, lune en relief | Volumes modelés (dégradés), ombres portées, joues roses | (au tour du texte) |
| S6. Aplats géométriques | Montagnes en triangles, sarcelle et orange | Aplats francs, sans contour | (au tour du texte) |

Moments :
1. « il croit que tout le monde le regarde » : projecteur sur le caméléon, la grenouille et les lucioles le fixent ;
2. « la grenouille pense à sa mouche » : la bulle de pensée, le caméléon camouflé.

Refaire les planches :

```bash
NODE_PATH=$(npm root -g) node essais/psycho-styles/maquettes.cjs styles  # → planche-styles.png (6 styles, sans texte)
NODE_PATH=$(npm root -g) node essais/psycho-styles/maquettes.cjs   # → essais/psycho-styles/planche.png
```
