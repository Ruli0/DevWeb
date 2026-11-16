# Passation : la chaîne « avis » (la voix d'abord)

_Écrit le 15 novembre 2026, relu et nettoyé le 16, pour le modèle qui reprend le travail (l'auteur prévoit de passer la main à Opus 5.5). À lire en premier, avant tout autre fichier. Branche : `claude/busy-feynman-m0q7yp`._

## 0. Démarrer en cinq minutes

```bash
cd terrarium && bash scripts/installer.sh     # dépendances Node et Python, CLI de rendu, tests (sans danger à relancer)
```

L'environnement « DevWeb » lance ce script tout seul au démarrage d'une session neuve, si le dépôt est ouvert sur une branche qui le contient (enregistré le 16 nov. ; pas encore éprouvé sur une vraie session neuve : en cas de doute, le relancer à la main).

Puis, pour une vidéo à partir d'un enregistrement de l'auteur (il arrive en pièce jointe, dans `/root/.claude/uploads/<session>/`) :

```bash
HF_HUB_DISABLE_XET=1 python3 scripts/voix.py <enregistrement.m4a> <id>   # voix débruitée et transcrite → videos/voix/<id>/
# lire videos/voix/<id>/mots.json, puis écrire videos/episodes/<id>.json (modèle : enigme-thermometre.json)
npm run video -- <id>                     # composition, conseils d'accroche, planche d'aperçu à regarder
npm run video -- <id> --accroche          # les trois premières secondes en quatre images
# rendu : la commande exacte est affichée à la fin de scripts/installer.sh ; envoyer le MP4 comme fichier
```

**Les choix de l'auteur, à respecter sans les redemander :**

- style « papier découpé » aux couleurs vives (le défaut : ne pas préciser `"theme"`) ; en 3D, l'aspect doux (le défaut) ;
- presque aucun texte à l'écran en dehors des sous-titres : au plus trois textes par vidéo ;
- rien en haut de l'image (ni barre de progression, ni bulle de rubrique) ;
- pas d'écran « Et toi ? » : la question de fin se pose dans le décor du dernier plan (`"question"`) ;
- sous-titres bas (y 1300), pour ne pas couvrir le sujet ;
- des réponses **courtes**, en français ; un MP4 envoyé à chaque étape ; dire ce qui n'a pas pu être vérifié (le son : le modèle ne peut pas écouter).

À lire ensuite selon le besoin : `ACCROCHES.md` (les deux premières secondes), `IDEES-VIDEOS.md` (sujets), `DA-AVIS.md` (direction artistique), et le skill `avis`.

## 1. Où on en est

- L'auteur veut **parler librement** de sujets variés (travail et IA, escalade, relations, énigmes, voyage) et que l'outil habille sa voix. Le format « cerveau et santé » (V3) est en attente.
- La chaîne « avis » fait cela : une voix enregistrée au téléphone entre, une vidéo verticale sous-titrée et illustrée sort.
- Quatre épisodes existent : `valeur-ia` (57 s, vraie voix, à réenregistrer plus court), `enigme-thermometre` (32 s, vraie voix, le plus abouti), `escalade-techniques` (maquette muette, voix attendue), `essai-riziere` (maquette muette, sert à montrer la 3D).
- **Prochaines actions attendues** : monter les prises de voix que l'auteur enverra ; l'aider sur ses accroches ; publier et mesurer.
- Rien n'est publié. Aucune donnée d'audience. Tout ce qui touche au rythme est une hypothèse.

## 2. Ce que l'auteur a dit (mot pour mot), dans l'ordre

| Tour | Ce qui a été montré | Son retour |
|---|---|---|
| 1 | Voix nettoyée (filtre ffmpeg) | « il y a encore trop de bruit parasite […] améliorer la voix en général sur le ton et les intonations […] Essaye de couper les blancs pour faire plus rapide et je te laisse gérer » |
| 2 | Vidéo v1 : fond sombre, typographie, sous-titres | « j'aime bien, c'est pas mal […] essaye de changer de fond, faire des choses plus dynamiques, mettre plus d'illustrations. […] on s'ennuie un peu quand on lit juste les textes et les graphiques […] fais des transitions » |
| 3 | Vidéo v2 : fonds alternés, transitions, illustrations au trait | « c'est beaucoup mieux » (sur le script réécrit) ; « Améliore comment le texte s'affiche » ; « les visuels font trop IA encore. Peux-tu mettre des fonds différents ? Du style cave avec pc pour métier développeur, robot pour l'IA et pour le théâtre une scène avec des éléments tels que masque et micro » |
| 4 | Vidéo v3 : décors illustrés (cave, robot, scène), texte mot par mot, mot en cours en pastille | « Met le texte un peu plus bas pour ne pas gêner les visuels » (sous-titres descendus à y 1300) |
| 5 | Vidéo v4 : sous-titres plus bas | « met moins d'éléments visuels genre texte autre que celui que je dis. Ça peut être trop d'infos pour le spectateur » |
| 6 | Vidéo v5 : plans sans texte (`visuel`), trois textes seulement (accroche, « Théâtre d'impro », question de fin) | « Fais un script d'escalade où tu parles de 3 techniques de mains et de pied et fais le visuel […] Je ferai la voix demain » |
| 7 | Script d'escalade et maquette muette `escalade-techniques` (37 s) : décor `mur`, six dessins de gestes | « pour les prochaines vidéos ne mets pas de barre de progression, je n'aime pas » |
| 8 | Nouvelle prise de voix (une énigme) : « Je vais te donner juste un texte et tu vas essayer d'en faire une vidéo » → `enigme-thermometre` (33 s), envoyée | « fais des visuels sur un décor de rizière animé comme au Vietnam. Et aide-moi à trouver de l'inspiration […] Fais-toi un .md avec plein d'idées » |
| 9 | Décor `riziere` (essai de 12 s envoyé) et `production/IDEES-VIDEOS.md` (une soixantaine d'idées) | « Maintenant que tu as ma voix, tu peux l'utiliser sur du texte nouveau ? Aussi trouve un moyen d'améliorer les visuels pour se donner un style particulier (propose-les-moi) et de l'affichage du texte aussi » |
| 10 | Quatre styles proposés en planches (`decoupe`, `neon`, `feutre`, `affiche`) ; essai de clonage de voix (voir section 6 bis) | « J'aime bien le papier découpé mais avec des couleurs plus vives comme le 2. Et j'aime bien aussi l'affichage du texte sur le papier découpé » → `decoupe` devient le style par défaut |
| 11 | Essai de voix clonée (8 s) envoyé ; question sur la 3D → « Ok, essayons three.js pour un test. De toute manière on doit faire le projet pour switcher facilement entre nos différentes versions de style » → décor `mur3d`, options `--theme` et `--3d`, vidéo d'essai envoyée | « Ça me plaît, on pourrait encore plus jouer sur les effets caméra en faisant des tours, des effets plongeants, des zooms. Fais des essais sur la rizière où tu peux zoomer sur des éléments » |
| 12 | `riziere3d` et le système de caméra (`tour`, `plongee`, `zoom:cible`, `survol`), essai de 20 s envoyé | « Ahaha j'aime bien ! Comment améliorer ? » (plan d'amélioration approuvé) |
| 13 | 3D en papier découpé, scène enrichie, nouveaux mouvements, ambiance sonore ; `riziere-3d-v2` envoyée | « J'aime bien. Enlève la bulle en haut qui spécifie le thème. À la fin, enlève le Et toi ? ou intègre-le dans le décor. J'ai l'impression que la qualité de l'image est un peu dégradée, c'était plus joli avant » |
| 14 | Bulle de rubrique retirée ; question de fin en étiquette dans le décor (`"question"`) ; 3D revenue à l'aspect doux par défaut ; `riziere-3d-v3` envoyée | « Comment faire de meilleurs hooks pour la rétention ? Et est-ce que je peux passer la main à Opus pour faire les vidéos ? » |
| 15 | Guide `ACCROCHES.md`, conseils d'accroche dans le montage, ouverture plus vive, `--accroche`, `scripts/installer.sh`, passation nettoyée ; essai à blanc réussi (dossier propre → vidéo de l'énigme rendue en suivant la section 0) | « Comment aller plus loin dans la création artistique, l'attractivité ? » → quatre pistes proposées, toutes retenues : signature sonore, personnage récurrent, plan-séquence avec les mots dans le décor, ses images en collage |
| 16 | Lot 1 (son) : trois indicatifs à choisir (A, B, C), musique du compte par rubrique, musique qui baisse sous la voix, bruitages des décors ; énigme renvoyée avec ce son | **en attente : quel indicatif ?** (A en attendant, `indicatif` dans `style.js`) |
| 17 | Lot 2 (personnage) : trois allures au choix (bonnet, casquette, boucles), sept poses, une place dans six décors ; planches et maquette d'escalade envoyées | « Je n'aime pas la musique. Le personnage 1, mais il ne faut pas qu'il reste trop souvent à l'écran » |
| 18 | Musique revenue à « Labo » par défaut, sans indicatif ; allure `bonnet` fixée ; le personnage n'apparaît qu'au premier et au dernier décor ; énigme renvoyée | en attente (ce qu'il n'aime pas dans la musique n'est pas encore connu) |

Demandes constantes : **réponses courtes**, tout en français, savoir si **tout est gratuit** (oui, voir section 8).

Ce qu'il ne faut pas reproposer : la bulle de rubrique en haut de l'image (retirée le 16 nov.) ; un écran de fin « Et toi ? » séparé (la question se pose dans le décor du dernier plan) ; la 3D en aplats avec contours comme aspect par défaut (« c'était plus joli avant ») ; une voix de synthèse comme solution par défaut (la voix clonée a été essayée à sa demande : la réserver au dépannage) ; le terrarium ; l'infographie sobre seule ; **la musique du compte et son indicatif comme réglage par défaut (« Je n'aime pas la musique », 16 nov.) ; le personnage à l'écran plus de 40 % du temps ; une barre de progression** (« pour les prochaines vidéos ne mets pas de barre de progression, je n'aime pas », retirée le 15 nov.) ; du texte à l'écran en plus des sous-titres.

## 3. Fabriquer une vidéo, de bout en bout

```bash
cd terrarium && bash scripts/installer.sh                    # une fois par session
# 1. La voix : débruitage (RNNoise), transcription mot par mot (Whisper « medium »), silences
HF_HUB_DISABLE_XET=1 python3 scripts/voix.py <enregistrement.m4a> <id>     # → videos/voix/<id>/propre.flac et mots.json
# 2. L'épisode : videos/episodes/<id>.json ("version": 4). Modèle : valeur-ia.json
# 3. La composition et la planche d'aperçu (une image par plan)
npm run video -- <id>            # regarder videos/studio/<id>/apercu.png
npm test                         # tous verts
# 4. Le rendu (le CLI HyperFrames est installé hors du dépôt par scripts/installer.sh)
cd videos/studio/<id> && HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  ~/.cache/avis-hyperframes/node_modules/.bin/hyperframes render --workers 3 --fps 30 --quiet -o <id>.mp4
```

- Les enregistrements de l'auteur arrivent dans `/root/.claude/uploads/<session>/…m4a` (pièce jointe du message).
- Un rendu de 57 s en 30 images par seconde prend environ 3 minutes. Le rendu final se fera en 60 (`--fps 60`), une fois le montage validé.
- Envoyer le MP4 à l'auteur comme fichier. Les MP4 et `videos/studio/` ne vont pas dans le dépôt ; `videos/voix/<id>/` y va (c'est la source).
- Avant d'envoyer : recompresser un MP4 lourd avec `ffmpeg -i <id>.mp4 -c:v libx264 -crf 18 -preset slow -c:a copy <id>-envoi.mp4` (pas plus fort : l'auteur voit la dégradation).
- Lint : `hyperframes lint --json <chemin de la composition>` : 0 erreur attendue ; les avertissements « sub-composition » et « track too dense » sont connus et sans effet.

### Préparer les visuels avant la voix (maquette)

```bash
# écrire videos/voix/<id>/script.txt, puis :
node scripts/maquette-voix.js <id>      # mots.json aux instants estimés (2,7 mots par seconde) et propre.flac muet
npm run video -- <id>
```

`mots.json` porte alors `"maquette": true`. Quand la vraie voix arrive, `python3 scripts/voix.py <enregistrement> <id>` remplace les deux fichiers. Si l'auteur dit les mêmes mots, les ancres de l'épisode restent valables ; sinon le montage dit lesquelles refaire. Relire ensuite les `"corrections"` et les instants des plans sur la planche.

**Trois épisodes attendent une voix** : `valeur-ia` (script resserré, section 7), `escalade-techniques` (script dans `videos/voix/escalade-techniques/script.txt`) et `essai-riziere` (script dans `videos/voix/essai-riziere/script.txt`).

### Changer de style sans toucher à l'épisode

L'auteur veut pouvoir « switcher facilement entre nos différentes versions de style ». Trois interrupteurs, en ligne de commande ou dans l'épisode :

```bash
npm run video -- <id>                    # le style du compte : papier découpé, décors plats
npm run video -- <id> --theme=neon       # un autre thème : base, decoupe, neon, feutre, affiche
npm run video -- <id> --3d               # les décors passent en 3D quand une version existe (mur → mur3d)
npm run video -- <id> --theme=affiche --3d
npm run video -- <id> --3d --aspect=decoupe   # la 3D en aplats avec contours (non retenue par défaut)
```

Dans l'épisode, les mêmes choix s'écrivent `"theme": "neon"` et `"decors3d": true`. Un troisième interrupteur règle l'aspect de la 3D : `--aspect=doux` (défaut, celui que l'auteur préfère : facettes éclairées en dégradé, ombres douces) ou `--aspect=decoupe` (aplats à trois tons, contours, ombres nettes) ; dans l'épisode, `"aspect3d"`.

### Les mouvements de caméra (décors 3D)

Sur un plan dont le décor est en 3D, `"camera"` donne la suite des mouvements :

```json
{ "plan": "visuel", "fond": "riziere",
  "camera": ["tour", { "m": "zoom:paysan", "a": "Le paysan" }, { "m": "plongee", "a": "Le riz" }, { "m": "zoom:cabane", "a": "Tout là-haut" }, "survol"] }
```

- Mouvements : `tour` (autour de la scène), `spirale` (tourne en montant et en se rapprochant), `plongee` ou `plongee:cible` (de très haut vers la cible), `contre-plongee:cible` (depuis le sol), `zoom:cible` (s'approche en resserrant le champ), `recul:cible` (part de la cible et s'éloigne : bon pour une fin), `travelling:cible` (accompagne la cible de côté), `survol` (au ras du sol), `large` (plan d'ensemble).
- Réglages d'un mouvement : `"vitesse": "vif"` (part vite) ou `"lent"` (régulier) ; `"force"` de 0,5 à 2 (amplitude : zoom plus serré, tour plus long).
- La caméra donne d'elle-même un petit coup de zoom sur chaque mot de `"forts"` et flotte légèrement en permanence.
- Sons ajoutés par le montage sur un décor 3D : un souffle à chaque changement de mouvement, et l'ambiance du décor (`campagne.wav` pour la rizière) pendant le plan. Volume : `"reglages": { "ambiance": 0.5 }`, `0` pour la couper.
- Cibles de `riziere3d` : `paysan`, `buffle`, `repiqueuse`, `canards`, `cabane`, `palmier`, `soleil`, `oiseaux`. Cibles de `mur3d` : `grimpeur`, `prise`, `sommet`, `sol`. Chaque décor 3D déclare les siennes (`cibles` dans `decors3d.js`).
- Une ancre `"a"` fait partir le mouvement sur un mot ; sans ancre, les mouvements se partagent le plan à parts égales. Chaque mouvement glisse depuis la fin du précédent.
- En 2D (sans `--3d`), `"camera"` est ignoré : le même épisode marche dans les deux versions.
- Sans `"camera"`, un décor 3D joue son mouvement par défaut (`spirale`). Sur `mur3d`, la caméra reste devant le mur : son tour est un arc.

Un nouveau style se range toujours dans l'un de ces mécanismes (un thème dans `themes.js`, un décor 3D dans `decors3d.js`), jamais dans une copie de la chaîne.

## 4. L'épisode (`videos/episodes/<id>.json`)

| Champ | Rôle |
|---|---|
| `"version": 4`, `"rubrique"` | Choisit la chaîne « avis » ; la rubrique donne la couleur (`travail`, `escalade`, `relations`, `enigme`, `voyage`, dans `studio/avis/style.js`) |
| `"voix"` | Le dossier de `videos/voix/` (par défaut l'identifiant) |
| `"retirer"` | Passages coupés : `[["premiers mots", "derniers mots"]]`. La coupe va de silence à silence |
| `"corrections"` | Orthographe des sous-titres, par indice du mot dans `mots.json` (`""` supprime le mot affiché) |
| `"forts"` | Mots en couleur dans les sous-titres (toutes leurs occurrences) |
| `"pauses"` | `[{ "apres": "derniers mots", "duree": 5 }]` : un silence ajouté dans la voix, pour un plan `rebours` (compte à rebours, un tic par seconde) |
| `"theme"` | Le style d'ensemble : `decoupe` (défaut, choisi par l'auteur), `base`, `neon`, `feutre`, `affiche` (`studio/avis/themes.js`). **Ne pas le préciser** |
| `"ouverture"` | `vive` (défaut : zoom d'ouverture, texte déjà en place à la première image) ou `calme` |
| `"decors3d"`, `"aspect3d"` | Décors en 3D quand ils existent ; aspect `doux` (défaut) ou `decoupe` |
| `"reglages"` | `vitesse` (1,05), `respiration` (0,14 s laissée par silence), `musique` (volume 0,16), `ambiance` (0,5 ; décors 3D) |
| `"plans"` | Les plans visuels. Chacun commence sur son ancre `"a"` (une suite de mots dits) et dure jusqu'au suivant |

**Règle depuis le 15 nov. : presque aucun texte à l'écran en dehors des sous-titres.** Le plan par défaut est `visuel` (fond et illustration, sans texte). Garder au plus trois textes par vidéo : l'accroche du premier plan, un mot fort au moment clé, la question de fin. Les plans `liste`, `bascule` et `fin` existent encore dans le code mais ne sont plus utilisés.

Un plan : `"plan"` (`visuel`, `titre`, `rebours`), `"fond"`, `"illu"` (facultatif), `"transition"` (facultatif), et ses textes (`*mot*` = mot fort). **La fin** : pas d'écran « Et toi ? ». Le dernier plan porte `"question": { "texte": "Tu mises sur *quoi* ?", "apres": 3 }` : quand la voix se tait, la question apparaît sur une étiquette de papier dans le décor, à la place des sous-titres, et la vidéo dure `apres` secondes de plus.

- **Fonds unis** : `nuit`, `papier`, `accent`. **Décors illustrés** : `cave`, `robot`, `scene`, `mur` (salle d'escalade), `salon` (fenêtre ouverte, thermomètre au mur), `riziere` (terrasses au Vietnam, paysan et buffle, aigrettes). **Photo de l'auteur** : `"fond": "photo", "photo": "fichier.jpg"` (fichier dans `videos/medias/`).
- Deux plans voisins ne peuvent pas avoir le même fond (le montage le refuse). Sans `"fond"`, les fonds unis alternent.
- **Transitions** : `cercle`, `volet`, `biseau`, `rideau` (elles alternent si rien n'est précisé).
- **Illustrations** (au trait, 940 × 400, entre le texte et les sous-titres) : `question`, `code`, `chat`, `balance`, `presentation`, `sortie`, `deplacement`, `theatre`, `micro`, `duo`, `commentaire` ; pour l'escalade : `reglette`, `pince`, `aplat`, `carre`, `adherence`, `talon` ; pour l'énigme : `soleil`, `fenetre`, `thermometre`, `distance` (`"valeur"` change le nombre affiché). Sur le fond `accent` orange, la couleur de peau des dessins d'escalade se lit mal : les mettre sur `nuit` ou `papier`. Avec un décor illustré, ne pas mettre d'illustration : le décor suffit. Dans un plan `visuel`, `"moment": { "a": "mots" }` déclenche le temps fort de l'illustration (la balance bascule, la croix se trace).
- Le montage refuse l'épisode avec un message qui dit quoi changer (ancre introuvable, texte trop long, plan de moins de 1,2 s, fond répété).

## 5. Le code (`studio/avis/`), fichier par fichier

| Fichier | Rôle | Côté |
|---|---|---|
| `scripts/voix.py` | Débruite, transcrit, repère les silences | Python |
| `montage.js` | Fonction pure : épisode + `mots.json` → feuille de route (coupes de la voix, instants des mots, sous-titres, plans) | Node |
| `style.js` | Couleurs, rubriques, polices, réglages des sous-titres et de la voix | Node |
| `plans.js` | Les 6 plans (`visuel` d'abord) : `ancres`, `textes`, `dessin` (HTML), `jouer` (animation) | Node et page |
| `illustrations.js` | Les 21 illustrations : `svg`, `jouer` | Node et page |
| `decors.js` | Les 6 décors plein écran : `svg`, `jouer`, calques `.loin`, `.milieu`, `.pres` | Node et page |
| `themes.js` | Les styles : polices, CSS ajouté, aspect du mot de sous-titre (actif, dit, pâle), filtre SVG éventuel | Node |
| `decors3d.js` | Les décors en 3D (Three.js 0.149, `three.min.js`) : `creer(canvas, p, aspect)` → `maj(t, d)`, tout calculé à partir du temps du plan ; moteur de caméra `pose()` et `piloter()` | page |
| `lecteur.js` | Construit la timeline GSAP : transitions, texte mot par mot, sous-titres, décors | page |
| `page.js` | Écrit `index.html`, la voix montée (ffmpeg), la musique et le **mixage** en un seul fichier | Node |
| `scripts/maquette-voix.js` | Voix muette estimée depuis un script, pour monter les visuels avant l'enregistrement | Node |
| `personnage.js` | Le personnage récurrent : allures, poses, places dans les décors | Node et page |
| `scripts/sons-avis.js` | L'indicatif, la musique par rubrique, les bruitages | Node |
| `scripts/installer.sh` | Prépare une session neuve | shell |
| `test/avis.test.js` | Les tests du montage (une quinzaine) | Node |

`scripts/video.js` aiguille : `"version": 4` → chaîne « avis », `3` → V3, sinon l'ancienne.

### Ajouter un décor (le besoin le plus probable)

Dans `decors.js`, ajouter une entrée `{ description, accent?, svg(), jouer(c, el, t0, d) }` :

- Dessiner en 1080 × 1920. **Le sujet dans la moitié basse** (y > 700) : le haut porte le texte du plan, sous un voile sombre. Les sous-titres passent vers y 1300 à 1430 (descendus le 15 nov. à la demande de l'auteur, pour ne pas couvrir le sujet du décor). Sous y 1440, l'interface de TikTok couvre l'image : décor seulement.
- Trois groupes `.loin`, `.milieu`, `.pres` : ils glissent à des vitesses différentes (profondeur).
- Les identifiants de dégradés s'écrivent `xx-nom` (deux mots en minuscules) : `page.js` leur ajoute le numéro du plan, sinon un décor utilisé deux fois perd ses dégradés.
- Pas de filtre SVG (le flou ralentit beaucoup le rendu) : faire les halos avec des dégradés radiaux.
- Animer avec `c.ft(cible, de, vers, t)` uniquement, et des répétitions **finies** (`fois(d, periode)`). Ni minuterie, ni hasard, ni `repeat: -1` : le rendu image par image doit être reproductible.
- Prochains décors utiles : un salon ou un café pour les relations, un open space, une falaise en extérieur.
- Les dessins des gestes d'escalade sont schématiques (profil, mur à droite). Un grimpeur les jugera : demander à l'auteur s'ils sont justes, il pratique.

## 6. Pièges rencontrés (à ne pas redécouvrir)

- **Réseau** : la transcription télécharge son modèle depuis `huggingface.co` et `us.aws.cdn.hf.co`. L'environnement « DevWeb » les autorise ; l'environnement par défaut non. Mettre `HF_HUB_DISABLE_XET=1`. GitHub (hors dépôt) et les autres hôtes de modèles sont bloqués : DeepFilterNet n'a pas pu être essayé.
- **`faster-whisper` et PyAV** : `transcribe(<chemin>)` plante ici ; `voix.py` décode donc l'audio avec ffmpeg et passe un tableau.
- **Le modèle ne peut pas écouter.** Seules des mesures existent : bruit dans les pauses de −28 dB à −63 dB après RNNoise, voix à −14 LUFS, musique environ 17 dB sous la voix. C'est l'auteur qui juge à l'oreille ; lui demander un mot précis (bruit, robotique, sourde, sifflante, trop rapide).
- **Le mixage se fait dans `page.js`** (`mixage.wav` : voix, musique, bruitages, limiteur à −3 dB). Avec plusieurs pistes audio, HyperFrames baissait tout le mixage de 5 dB (« audio_lowered ») dès qu'un bruitage s'ajoutait. Avec une seule piste, il sort autour de −11 LUFS, comme les autres vidéos.
- **Une prise sans consigne** (« fais-en une vidéo ») : lire `mots.json`, comprendre le genre (avis, liste, énigme), choisir la rubrique ; en créer une dans `style.js` si aucune ne convient. Pour une énigme, ralentir (`"reglages": { "respiration": 0.32, "vitesse": 1 }`) : il faut le temps de suivre.
- **Whisper et les chiffres** : il écrit « 10% », « 30 », « 5 » ; corriger l'affichage avec `"corrections"` si besoin.
- **Whisper et les noms** : « ChatGPT » a été transcrit « Tchad, GPT ». Relire `mots.json` et corriger avec `"corrections"`.
- **Un `transform` SVG et GSAP** : animer `x` ou `y` sur un groupe qui porte déjà `transform="translate(…)"` écrase sa position (le paysan de la rizière partait en haut de l'image). Mettre l'animation sur un groupe intérieur sans attribut `transform`.
- **Pas de `from: 'random'`** dans un `stagger` : c'est du hasard, chaque processus de rendu tirerait un ordre différent.
- **Qualité d'image** : l'auteur a trouvé la 3D en aplats « dégradée ». Causes probables : ombres nettes en escalier, contours d'un pixel, et une recompression trop forte du MP4 envoyé (`crf 23`). Envoyer en `crf 18`.
- **3D, aspect « decoupe » (non retenu par défaut)** : matières en aplats (`MeshToonMaterial` et une rampe à trois tons), facettes (`forme()` recalcule les normales), contours (`contour()`), ombres nettes. Le flanc d'une forme extrudée doit recevoir des normales rayonnantes, sinon il se raye. Une forme extrudée puis couchée (`rotation.x = -π/2`) inverse l'axe : un point d'angle `a` se retrouve en `z = -d·sin(a)` ; les personnages et le riz utilisent la même convention.
- **3D, coût** : la toile est en 1080 × 1920 ; l'essai de rizière (20 s) se rend en 4 min, et le MP4 brut peut peser 25 à 50 Mo : le recompresser avant l'envoi en `crf 18`. Sans voix, le mixage sort vers −19 LUFS (musique et ambiance seules).
- **3D** : le navigateur de rendu n'a pas de carte graphique (WebGL logiciel, SwiftShader). Le filtre de couleurs vives du thème est plus doux sur la 3D (`.decor-3d`), sinon l'eau et l'herbe brûlent. Garder `preserveDrawingBuffer: true`, sinon la capture d'image est noire. Three.js est figé en 0.149 : les versions suivantes n'ont plus de fichier `three.min.js` chargeable par une balise `<script>`. Un panneau incliné recouvre les prises posées dessus : le mur est à plat.
- **Mesurer avant de déplacer** : dans `lecteur.js`, les traits sous les mots forts sont placés d'après `getBoundingClientRect` ; la mesure doit se faire avant tout `gsap.set` sur les mots.
- **Planche d'aperçu** : une image tombée au milieu d'une transition ou d'un clignement d'œil n'est pas un défaut. Demander d'autres instants : `NODE_PATH=$(npm root -g) node scripts/apercu.js videos/studio/<id>/index.html <sortie.png> t1 t2 …`.
- **`production/CATALOGUE.md`** est généré (`node studio/catalogue.js`) et vérifié par un test ; il ne décrit pas la chaîne « avis ».
- Les chaînes plus anciennes (terrarium, V3) restent dans le dépôt et leurs tests passent : ne pas les faire évoluer sans demande.

## 6 bis. Voix clonée (essai du 16 nov. 2026)

L'auteur a demandé si sa voix pouvait dire un texte nouveau. Un essai de 8 s a été généré et envoyé ; **son avis n'est pas encore connu**. Rien n'est branché dans la chaîne, et `scripts/installer.sh` ne l'installe pas.

- Outil : Chatterbox multilingue (`pip install chatterbox-tts "setuptools<81"` dans un environnement virtuel à part, 3,7 Go ; modèle téléchargé depuis Hugging Face). Sans carte graphique : environ 45 s de calcul pour 8 s de voix.
- Référence : une vingtaine de secondes de `videos/voix/valeur-ia/propre.flac`, silences retirés, en 24 kHz.
- `ChatterboxMultilingualTTS.from_pretrained(device="cpu").generate(texte, language_id="fr", audio_prompt_path="ref.wav")`.
- Le modèle pose un **filigrane inaudible** « généré par IA » sur chaque son. Il lui faut `pkg_resources` (d'où `setuptools<81`). Ne pas le désactiver.
- Vérification possible sans oreille : retranscrire le résultat avec Whisper. Sur l'essai, le texte est dit en entier ; « l'IA » et « ChatGPT » sont mal prononcés selon la transcription (« qu'il y a code », « chat de GPT ») : écrire ces mots comme ils se disent (« l'i-a », « tchate-jé-pé-té »).
- À dire à l'auteur à chaque fois : TikTok demande de signaler une voix générée par IA ; sa vraie voix reste préférable, la voix clonée sert à dépanner.

## 6 ter. Le son du compte (lot 1 du plan « aller plus loin », 16 nov. 2026)

Tout est dans `scripts/sons-avis.js`, synthétisé et reproductible.

- **L'indicatif** : un motif de quatre notes. Trois propositions (`A` cloche qui monte, `B` corde qui rebondit, `C` bois qui répond). Le choix se fixe dans `studio/avis/style.js` (`indicatif`) ; un épisode peut le changer (`"indicatif": "B"`). Deux notes sur la première image, le motif entier quand la voix se tait.
- **Non retenue par défaut** : l'auteur a écouté et n'aime pas cette musique (il n'a pas dit si c'est la mélodie, les timbres ou l'idée même). Le défaut est donc revenu à `labo`, sans indicatif (`musique` dans `style.js`). Lui demander ce qui gêne avant d'en proposer une autre ; le modèle ne pouvant pas écouter, proposer plutôt deux ou trois extraits très différents que retoucher à l'aveugle.
- **La musique du compte** (`"musique": "avis"`, à la demande) : la même mélodie et les mêmes accords pour tout le compte, une instrumentation par rubrique (`RUBRIQUES`). `"musique": "labo"` est le défaut, `"aucune"` la coupe.
- **Elle suit la voix** : le montage calcule les « creux » (les moments où l'auteur parle, `feuille.musique.creux`) ; `volumeMusique()` dans `page.js` en fait une expression pour ffmpeg : `reglages.musique` (0,16) sous la voix, `reglages.musiqueSeule` (0,42) dans les silences.
- **Les bruitages** : un décor déclare ses sons (`sons: [{ f, t, v, boucle }]` dans `decors.js` ou `decors3d.js`) ; une illustration qui surgit fait un « pop ». `"reglages": { "bruitages": 0 }` les coupe.
- **Écouter sans vidéo** : `node scripts/sons-avis.js <dossier>` écrit tous les sons.
- Mesuré sur l'énigme : −15 LUFS avant rendu ; la musique remonte pendant le compte à rebours et sur la question de fin. **Personne n'a écouté** avant l'auteur.
- Ce qui reste de ce lot dans toutes les vidéos : la musique qui baisse sous la voix (elle s'applique aussi à `labo`) et les bruitages des décors.

## 6 quater. Le personnage récurrent (lot 2 du plan « aller plus loin », 16 nov. 2026)

Un double stylisé de l'auteur, en papier découpé, le même dans chaque vidéo : `studio/avis/personnage.js`.

- **Pas trop souvent** (demande de l'auteur) : avec `"personnage": true`, il n'apparaît que dans le premier et le dernier décor qui lui font une place ; le montage donne un conseil s'il est à l'écran plus de 40 % du temps.
- **Dans l'épisode** : `"personnage": true` (pose par défaut du décor), ou sur un plan `"personnage": "salue"` ; `"personnage": false` sur un plan l'enlève. `"allure"` change son allure pour un épisode.
- **Allure** : `bonnet`, choisie par l'auteur (« le personnage 1 »). `casquette` et `boucles` restent dans le code.
- **Poses** : `debout`, `salue`, `montre`, `reflechit`, `marche`, `assis`, `grimpe`. Une pose est une liste d'angles (`POSES`) : en ajouter une coûte une ligne.
- **Places** (`PLACES`) : `cave`, `robot`, `scene`, `mur`, `salon`, `riziere`. Règle vérifiée par un test : le centre de la tête reste au-dessus de y 1200, pour que les sous-titres ne passent jamais sur le visage. Quand il est là, le figurant du décor (classe `figurant` : la silhouette de la cave, le grimpeur du mur) est caché.
- **Piège** : ne jamais l'animer avec les propriétés `x`, `y`, `rotation` ou `svgOrigin` de GSAP (elles se repèrent dans l'image entière et décalent un dessin placé par un groupe parent : il se retrouvait 300 pixels trop haut). Tout passe par l'attribut `transform` (`attr: { transform: 'rotate(9)' }`), chaque membre étant dessiné autour de son articulation.
- **Reste à faire** : sa version 3D (dans `mur3d` et `riziere3d`, comme cible de caméra `moi`) ; la pose `assis` ressemble plus à un accroupi.

## 7. Le script resserré que l'auteur doit réenregistrer

Envoyé le 15 nov. (« c'est beaucoup mieux », « je referai le texte demain ») :

> Développeur, ingénieur : à quoi on sert encore, maintenant que l'IA code ?
> J'ai posé la question à Claude. À ChatGPT. Aucune réponse ne m'a convaincu.
> Alors voilà la mienne.
> Notre valeur n'est plus dans la technique. La technique, l'IA l'a déjà.
> Notre valeur, c'est la clarté. Savoir présenter un résultat. Expliquer un sujet compliqué à quelqu'un qui n'y connaît rien.
> Et ça, ça ne s'apprend pas devant un écran.
> Du coup, moi, j'ai fait un choix bizarre pour un développeur : je me mets au théâtre d'improvisation.
> Et toi, tu mises sur quoi ?

À la réception : `scripts/voix.py` sur le nouveau fichier (nouvel identifiant, par exemple `valeur-ia-2`), nouvel épisode copié de `valeur-ia.json`, **toutes les ancres et les corrections sont à refaire** (elles dépendent des mots dits). Viser 35 à 45 s.

## 8. Les outils, tous gratuits

RNNoise (débruitage), Whisper par faster-whisper (transcription), ffmpeg (coupes, égalisation, niveau), GSAP (animation), HyperFrames et Chromium (rendu MP4), Node.js. Aucun service payant, aucune clé. Le seul coût est l'abonnement Claude de l'auteur.

## 8 bis. Le réservoir d'idées

`production/IDEES-VIDEOS.md` : une méthode pour trouver des idées, les formats disponibles, et une soixantaine d'idées par rubrique avec leur statut. Le tenir à jour : marquer ce qui est fait, ajouter les idées de l'auteur, noter ce que les chiffres disent après publication.

## 9. La suite, par ordre d'intérêt

1. **Monter les voix que l'auteur enverra** (trois épisodes en attente), en soignant l'accroche (`ACCROCHES.md`), puis rendre en 60 images par seconde une fois le montage validé.
2. **Publier, puis relever les chiffres** dans `videos/resultats.csv` (rétention à 3 secondes, visionnage complet, commentaires) : sans mesure, on règle à l'aveugle.
3. **Photos et vidéos de l'auteur** comme fonds (escalade surtout) : le meilleur remède au reproche « ça fait trop IA ». Le fond `photo` existe ; il n'a servi que sur une image de test. La vidéo en fond reste à faire.
4. Versions 3D de la cave, du théâtre et du salon ; un décor pour la rubrique « relations » ; faire relire les dessins d'escalade par l'auteur, qui pratique.
5. Une signature sonore propre au compte (la musique est encore « Labo », de la V3).
6. Si l'auteur valide la voix clonée : la brancher dans la chaîne (un texte → une vidéo), avec le signalement « généré par IA ».
