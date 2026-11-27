# Spécification : « Le chemin vers le château » (fond 3D, décision 104)

Vidéo « 4 princesses, 2e partie » : la caméra avance en continu (sans coupure) sur le chemin d'une colline jusqu'à entrer dans un château de conte. Un **biome différent par question** : forêt enchantée → prairie fleurie → lac, pont et cascade → jardin royal et château. Le hibou (déguisé en prince, dessin 2D par-dessus) vole tranquillement devant la caméra.

## Rendu et contraintes (à respecter absolument)
- Three.js **r149** global (`THREE`, fichier `node_modules/three/build/three.min.js`). Pas de modules ES, pas d'addons (pas de GLTFLoader, pas de BufferGeometryUtils : fusionner à la main si besoin).
- Rendu logiciel (swiftshader), canvas 720 × 1280, 60 images/s, ~2 400 images : **budget par module** : ≤ 120 000 triangles, ≤ 60 appels de dessin (utiliser `InstancedMesh` + `setColorAt`, ou fusionner les géométries). Pas d'ombres portées (`castShadow` interdit), pas de texture image (couleurs de sommets / d'instance, `CanvasTexture` possible mais déterministe).
- **Déterminisme absolu** : aucun `Math.random`, aucune minuterie, aucun `Date`. Aléa = `ctx.rng(graine)` (générateur à graine fixe). Toute animation est une fonction pure du temps `T` (secondes, temps global de la vidéo) ; les mouvements répétés doivent être **périodiques sur `ctx.L`** secondes (nombre entier de cycles par `L`) pour que la boucle reste parfaite.
- Style : « dessin animé » doux et joli (pastel saturé, formes simples à facettes, éclairage chaud), pas de réalisme photo. Facettes : `geo = geo.toNonIndexed(); geo.computeVertexNormals();` + `MeshLambertMaterial({ vertexColors: true })` (ou couleur d'instance). Les éléments lumineux (fenêtres, lanternes, champignons) en `MeshBasicMaterial` (non éclairé).
- L'éclairage (hémisphère + soleil), le brouillard (`scene.fog`), le ciel, la caméra et le terrain sont gérés par le noyau (`studio/avis/chemin3d.js`, écrit par Claude) : **ne pas les créer**. Les couleurs de sommets doivent être pensées pour une lumière qui change (matin bleuté → après-midi → coucher de soleil doré) : éviter le noir et le blanc pur.
- Zone sûre d'écran (portrait 1080 × 1920) : le haut (y < 290) et le bas (y > 1480) sont recouverts par l'interface de TikTok ; le sujet principal tient entre x 80 et x 900.
- Code en français (commentaires courts), style du dépôt (voir `studio/avis/fond3d.js`, `studio/avis/decors3d.js`). Module UMD : `(function (racine, fabrique) { ... })(typeof self !== 'undefined' ? self : this, function () { ... })` qui exporte vers `racine.Avis.<nom>`.
- **Ne pas faire de commit** (Claude s'en charge). Ne modifier que les fichiers indiqués dans ta mission. Pour tout fichier partagé existant, utiliser uniquement l'outil Edit (jamais Write sur un fichier existant).

## Monde et interface commune
Axes : Y vers le haut, 1 unité = 1 mètre. Le chemin va globalement vers −Z (du départ, z ≈ 0, vers le château, z ≈ −420) en serpentant en X ; il monte la colline (Y croît). La caméra vole à 1,8–2,6 m au-dessus du chemin, regarde 14 m devant elle, champ vertical ≈ 62°.

Chaque module de biome exporte `racine.Avis.biomes3d.<nom>` = `{ creer(ctx) → { group, maj(T, sCam) } }` :

```js
ctx = {
  THREE,                       // le global
  rng: (graine) => () => x,    // générateur déterministe, x dans [0, 1[
  L: 38.9,                     // période de la boucle (s)
  hauteur: (x, z) => y,        // hauteur du terrain (le terrain est aplani sous le chemin)
  chemin: {
    longueur: 420,             // mètres
    point: (s) => [x, y, z],   // ligne centrale, s dans [0, 1] (0 = départ, 1 = porte du château)
    tangente: (s) => [tx, tz], // direction de marche, unitaire, horizontale
    largeur: 5,                // largeur du chemin (m) : ne rien poser à moins de largeur/2 + 1,5 m de la ligne centrale
  },
  zone: [s0, s1],              // la partie du chemin dont ce biome est responsable (déborder de ±0,03 pour fondre avec les voisins)
  graine: 1234,
};
creer(ctx) → { group: THREE.Group, maj(T, sCam) }   // maj est appelée à chaque image ; T = temps global (s), sCam = position de la caméra (0 à 1)
```
Poser les objets sur le terrain avec `ctx.hauteur(x, z)` (légèrement enfoncés, 0,05 m), des deux côtés du chemin, en groupes naturels (pas de grille régulière), plus denses près du chemin, avec des vides pour respirer. Penser « vu de la caméra » : des silhouettes lisibles à 5, 20 et 80 m, quelques éléments mémorables (arche, pont, moulin, fontaine) qui font dire « waouh » au passage.

Les zones (en s) : forêt [0, 0,30], prairie [0,30, 0,526], lac [0,526, 0,753], jardin [0,753, 1,0]. Le château se dresse sur un plateau à s = 1 (module `chateau3d`, voir sa mission).

## Banc d'essai (à écrire dans le dossier temporaire de la session, pas dans le dépôt)
Playwright et Chromium sont préinstallés : `require('playwright')`, `chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] })`. Page vide avec `<canvas width=720 height=1280>`, `addScriptTag({ path: 'node_modules/three/build/three.min.js' })`, puis ton module, puis une scène de test (sol de test simple, chemin factice qui serpente, éclairage hémisphère + directionnel, brouillard, caméra à 2 m sur le chemin) ; capturer plusieurs images PNG (`canvas.toDataURL` ou capture d'écran) à différents `T` et **les regarder** (outil Read sur les PNG) : le résultat doit être beau, lisible et sans artefact. Mesurer aussi le temps de rendu d'une image.
