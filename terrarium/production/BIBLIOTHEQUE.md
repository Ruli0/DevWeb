# Bibliothèque de composants réutilisables (27 nov. 2026)

Tout ce qui a été construit pour les vidéos hibou est réutilisable pour de nouvelles vidéos. Ce document dit **quoi**, **où** et **comment**.

## 1. Voyage 3D « chemin vers le château » (le gros morceau)
Un voyage continu, sans coupure, sur un chemin de colline : forêt enchantée → prairie fleurie (cerisiers, moulin) → lac, pont et cascade → jardin royal (arches de roses, fontaine) → porte du château, intérieur doré, flash, retour au départ (boucle parfaite). Ciel et lumière changent de l'aube au coucher de soleil.
- **Fichiers** : `studio/avis/chemin3d.js` (noyau : terrain, chemin, caméra, ciel, brouillard, flash), `biomes3d-a.js` (forêt, prairie), `biomes3d-b.js` (lac, jardin), `chateau3d.js` (château, porte, passage, cour). Spécification et contraintes : `production/SPEC-CHEMIN3D.md`.
- **Utilisation dans un plan** (jeu de mots / grille) : `fond3d: 'chemin'`, `fond3dRes: [720, 1280]`, `fond3dOpts: { t0 (début de l'étage dans la vidéo), L (durée publiée), vitesse, depart, rampe, flash: [début, pic, fin], porte: [début, fin], lueur: [début, fin] }` (valeurs par défaut dans `DEF` de chemin3d.js, adaptées à une vidéo de ~39 s). Le voile de lisibilité (`.voile-ui`) est ajouté tout seul.
- **Aperçu rapide sans passer par la vidéo** : `node scripts/apercu-chemin.js <sortie.png> T1 T2 …` (T = temps global en secondes ; affiche le temps de rendu par image).
- **Ajouter ou changer un biome** : écrire un module `Avis.biomes3d.<nom>.creer(ctx) → { group, maj(T, sCam) }` (interface dans la spec : `ctx.hauteur`, `ctx.chemin`, `ctx.eau`, `ctx.zone`, `ctx.rng`), l'ajouter aux `ZONES`, aux palettes de sol/chemin (`palette`, `matPierre`) et au `TOD` (couleurs du ciel) de chemin3d.js, et l'inclure dans la liste de `page.js`.
- **Coût** : ~130 à 700 ms par image en rendu logiciel à 720×1280 (≈ 20-30 min pour 4 étages de 39 s au total).
- **Pièges** : tout doit rester déterministe (pas de `Math.random`, pas de minuterie), périodique sur L ; budgets ≤ 120 000 triangles et ≤ 60 appels par module.

## 2. Hibou prince (costume) et vol en croisière
- `presentateur.costume: 'prince'` : couronne dorée à gemmes, cape cramoisie, col d'hermine, broche (`personnage.js`, `costumePrince()`). Pour un autre déguisement (princesse, chevalier, magicien…), ajouter une fonction sœur et une valeur de `costume`.
- `presentateur.croisiere: true` : après son arrivée il vole en place, ailes qui battent doucement (2,4 par seconde), dérive et penche dans les virages du chemin 3D (`animerHibou2`, état du chemin via `Avis.chemin.etat(T, fond3dOpts)`).
- Accroche personnalisable : `accroche: { texte, sous, taille, tailleSous, glow, ombre, voile (fond CSS), opaciteVoile }`.

## 3. Gabarits de vidéos (du plus simple au plus riche)
| Gabarit | Commande | Notes |
|---|---|---|
| **Voyage de mots** (4 étages, hibou, voyage 3D) | `python3 scripts/voyage-mots.py videos/voyages/<id>.json`, voix dans `videos/voix-ia/<id>/f1..f4`, puis `bash scripts/voyage-rendre.sh <id>` | spécification JSON documentée en tête de `voyage-mots.py` ; exemple : `videos/voyages/princes.json` |
| 4 princesses (château 2D) | `scripts/dessins-animes.py` + `scripts/assembler-dessins.sh` | première version, fond SVG `fondAnime: 'chateau'` |
| Iceberg en mots | `scripts/iceberg.py` + `scripts/assembler-iceberg.sh` | fond 3D iceberg |
| QCM simple (décompte 5 s, question suivante visible) | `scripts/qcm-simple.py` | option de plan `qcm.simple` ; sans hibou |
| QCM glaçons / iceberg du savoir | `scripts/qcm-iceberg.py` | |
| Libère le hibou (flammes) / 5 coups (marteau) | `scripts/qcm-glace.py`, `scripts/qcm-marteau.py` | variantes d'accroche : `--accroche=a|b|d`, `scripts/accroche-flash.sh` |
| Jeux de mots hibou (STOP, vol, lecture) | `jeu-mots-*-hibou.json` | gabarit de base de tous les étages |
Assemblage générique d'une vidéo en étages : `bash scripts/assembler-etages.sh <id>` (lit `videos/studio/<id>/plan.json`).

## 4. Voix (Chatterbox, intégrée) : procédure et leçons
`scripts/voix-ia.py` (prises) → `scripts/voix-choisir.py` (choix par transcription, coupe après le dernier mot) → `scripts/presentateur-voix.py <épisode> <dossier l1..lN.wav>` (traitement de personnage, enveloppe de bouche, durées). La génération est lente : la lancer en arrière-plan.
- Vérifier la transcription **sans amorce** (initial_prompt) et avec du silence autour ; les mots très courts ou les noms rares sont mal reconnus : utiliser « C'est <Nom> ! ». Noms écartés (mal prononcés) : Vaiana, Jasmine. Raiponce ≈ « réponse » (homophone : la transcription ne peut pas trancher).
- Réutilisables tels quels : « Trop facile ! » (`videos/voix-ia/iceberg/e1/l3.wav`), « Ça se corse… » (`iceberg/e2/l2.wav`), « Ouh là, c'est dur ! » (`dessins/f3/l2.wav`), « Personne trouve celle-là ! » (`dessins/f4/l2.wav`), « Un like si t'as tout trouvé ! » (`dessins/f4/l4.wav`). Les dossiers `videos/voix-ia/` ne sont pas dans le dépôt (ignorés) : à régénérer si la session est neuve.

## 5. Cadrage TikTok (obligatoire)
**Calques plein écran** : toujours des dimensions explicites `left: 0; top: 0; width: 1080px; height: 1920px`, jamais `inset: 0` (le conteneur `.cadre` ne fait que 1010 px de large : un calque en `inset: 0` laisse une bande de 70 px à droite, vue sur « 4 princesses, 2e partie »).
Largeur utile **x 80 → 900**, rien au-dessus de y 290 ni sous y 1480 ; `node scripts/apercu.js <index.html> <sortie.png> --zone-tiktok t1 t2 …` masque les zones perdues. Détails : `production/DA-AVIS.md`.

## 6. Recette « nouvelle vidéo en une heure »
1. Écrire `videos/voyages/<id>.json` (4 mots, indices, accroche). 2. Générer et choisir les voix (§4). 3. `python3 scripts/voyage-mots.py …` puis `bash scripts/voyage-rendre.sh <id>`. 4. Vérifier la planche, la boucle et le son, envoyer, publier (fiche dans `LANCEMENT-HIBOU.md`).
