# Test de direction artistique (étape 1 du plan de refonte)

La même scène, dans trois pistes : le caméléon tire la langue, rate la mouche, la mouche se moque, et Mousse se cache l'œil. Chaque scène dure 4 mesures de Drift (16 temps à 145 BPM, environ 6,6 s) et boucle.

| Fichier | Piste |
|---|---|
| `a.cjs` | A. Théâtre d'ombres lumineuses : silhouettes sur plusieurs plans, contours et yeux lumineux, parallaxe |
| `b.cjs` | B. L'écran de Mousse : pixel art vert phosphore (grille de 54 × 96 cases), mouvements case par case, bug d'écran sur le raté |
| `c.cjs` | C. Diorama en papier découpé : bords irréguliers, ombres portées, attaches parisiennes, mouche au bout d'un fil |
| `a2.cjs` | **Le mélange retenu** : A, avec le texte sans cadre de B et la mouche au fil de C |
| `vecteur.cjs` | Le caméléon et la mise en scène communs à A et C |
| `commun.cjs` | Le gabarit de la page HyperFrames, le terminal, la musique (Drift, 4 mesures) |

Fabriquer et voir :

```bash
node essais/direction-artistique/a.cjs          # écrit essais/direction-artistique/sortie/A/
NODE_PATH=$(npm root -g) node scripts/apercu.js  # (l'aperçu des essais se fait sur leur index.html)
cd essais/direction-artistique/sortie/A && npx hyperframes render --fps 60 -o piste-a.mp4
```

Ces scripts sont un essai : la piste retenue sera reconstruite proprement dans `studio/` (voir `production/SPEC-STUDIO.md`).
