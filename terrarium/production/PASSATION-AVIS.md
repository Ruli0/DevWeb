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

- style « papier découpé » aux couleurs vives (le défaut : ne pas préciser `"theme"`), palette « coucher de soleil » (le défaut : ne pas préciser `"palette"`) ;
- du texte toujours droit : jamais d'inclinaison ni de rotation, même à l'arrivée ; en 3D, l'aspect doux (le défaut) ;
- presque aucun texte à l'écran en dehors des sous-titres : au plus trois textes par vidéo ;
- rien en haut de l'image (ni barre de progression, ni bulle de rubrique) ;
- pas d'écran « Et toi ? » : la question de fin se pose dans le décor du dernier plan (`"question"`) ;
- sous-titres bas (y 1300), pour ne pas couvrir le sujet ;
- des réponses **courtes**, en français ; un MP4 envoyé à chaque étape ; dire ce qui n'a pas pu être vérifié (le son : le modèle ne peut pas écouter).

À lire ensuite selon le besoin : `ACCROCHES.md` (les deux premières secondes), `IDEES-VIDEOS.md` (sujets), `DA-AVIS.md` (direction artistique), et le skill `avis`.

## 1. Où on en est

- L'auteur veut **parler librement** de sujets variés (travail et IA, escalade, relations, énigmes, voyage) et que l'outil habille sa voix. Le format « cerveau et santé » (V3) est en attente.
- La chaîne « avis » fait cela : une voix enregistrée au téléphone entre, une vidéo verticale sous-titrée et illustrée sort.
- Cinq épisodes existent : `agriculteur-ia` (37 s, vraie voix, le plus récent et le meilleur modèle à copier), `valeur-ia` (57 s, vraie voix, à réenregistrer plus court), `enigme-thermometre` (32 s, vraie voix), `escalade-techniques` (maquette muette, voix attendue), `essai-riziere` (maquette muette, sert à montrer la 3D).
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
| 18 | Musique revenue à « Labo » par défaut, sans indicatif ; allure `bonnet` fixée ; le personnage n'apparaît qu'au premier et au dernier décor ; énigme renvoyée | « On peut faire des musiques plus vivantes ? » |
| 19 | Trois musiques vivantes proposées (`funk`, `electro`, `acoustique`), envoyées seules puis sous sa voix | « Juste la basse, essaye de faire une instru electro house » |
| 20 | Électro house portée par la basse, deux versions (`house`, `house-nue`), envoyées seules, sous sa voix, et dans la vidéo de l'énigme | « J'aime pas trop, fais plus plat » ; précisé à ma question : « Régulier, sans effets » |
| 21 | `house-plate` : la même house en boucle régulière (ni montée, ni pompe, ni « wah », une seule note de basse par accord), envoyée seule et dans l'énigme | « Juste le fond, pas le klaxon. Comment faire pour améliorer l'outil au global ? Je verrais plus un hibou qu'un personnage pour la référence » |
| 22 | Basse de `house-plate` rendue ronde (plus de dent de scie : c'était le « klaxon ») ; **le hibou** remplace le personnage comme mascotte (mêmes poses, mêmes places) ; planches et extraits envoyés | « La musique est parfaite. Fais le hibou couleur verre transparent et plus petit » |
| 23 | `house-plate` devient la musique par défaut ; hibou de verre, petit, en vol juste au-dessus des sous-titres ; maquette d'escalade renvoyée | Nouvel enregistrement et son idée : l'agriculteur qui ne veut plus cultiver puisque le supermarché est plein ; l'IA entraînée sur le code des humains, qui s'appauvrit si elle apprend sur elle-même |
| 24 | Épisode `agriculteur-ia` (37 s, vraie voix) : décors `champ` et `supermarche`, illustrations `rayons` et `copies` ; envoyé | « Est-ce que tu penses que tu peux générer des vidéos avec le ASCII art ? » |
| 25 | Aspect 3D `ascii` et `ascii-vert` : la scène écrite en caractères ; deux essais sur la rizière envoyés | « En réalité je n'aime pas le style ASCII. Propose d'autres palettes et je choisis ! » |
| 26 | ASCII retiré du code ; six palettes de couleurs proposées (`vive`, `pastel`, `coucher`, `ocean`, `retro`, `cobalt`), une planche par palette sur cinq scènes de `agriculteur-ia` | **en attente : laquelle ?** (le défaut reste `vive`) |
| 27 | (sans demande) | « J'adore le visuel du paysan de dos ! » : le paysan du décor `champ` (chapeau de paille, fourche, vu de dos, au premier plan) est le visuel qu'il préfère jusqu'ici ; en faire un modèle pour les prochains décors (un sujet de dos, grand, au premier plan, devant le paysage) |
| 28 | Palette `coucher` par défaut ; plus aucun texte penché (sous-titres, question de fin, titres) ; mots à venir à 50 % au lieu de 32 % ; planche avant/après et `agriculteur-ia` renvoyée | « J'aime la palette 3. Maintenant il faut revoir comment on affiche le texte. Le fait que ça soit penché rend le texte difficile à lire. » ; puis « J'aime bien c'est cool ! » |
| 29 | **Première vraie photo** : l'auteur à Fontainebleau, assis sur un bloc après l'escalade. Fond `photo` (cadrage, mode naturel), `scripts/decouper.py` (détourage), collage en autocollant ; dernier plan de `escalade-techniques` en photo ; quatre traitements montrés | « C'est une photo de moi à Fontainebleau qui a fini l'escalade » ; en attente du choix du traitement |
| 30 | Un texte seul, sans voix : « Pov t'es un paysan et tu te rends compte qu'il y a déjà des légumes au supermarché et que tu peux prendre ta retraite. Tu vois l'ironie dans ce texte ? Fais des propositions de vidéos » → maquette `pov-paysan` (11 s) + propositions | en attente de son choix et de sa voix |

Demandes constantes : **réponses courtes**, tout en français, savoir si **tout est gratuit** (oui, voir section 8).

Ce qu'il ne faut pas reproposer : la bulle de rubrique en haut de l'image (retirée le 16 nov.) ; un écran de fin « Et toi ? » séparé (la question se pose dans le décor du dernier plan) ; la 3D en aplats avec contours comme aspect par défaut (« c'était plus joli avant ») ; une voix de synthèse comme solution par défaut (la voix clonée a été essayée à sa demande : la réserver au dépannage) ; le terrarium ; l'infographie sobre seule ; **une autre musique que `house-plate` (« La musique est parfaite », 16 nov.) ; un personnage humain ou un hibou brun et grand (il veut un petit hibou de verre) ; le personnage à l'écran plus de 40 % du temps ; du texte penché ou tourné, même un peu, même à l'arrivée (« Le fait que ça soit penché rend le texte difficile à lire », 17 nov.) ; la palette `vive` par défaut (il a choisi `coucher`) ; une barre de progression** (« pour les prochaines vidéos ne mets pas de barre de progression, je n'aime pas », retirée le 15 nov.) ; du texte à l'écran en plus des sous-titres.

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
npm run video -- <id> --palette=cobalt   # une autre palette de couleurs : coucher (défaut, choisie par l'auteur), vive (l'ancienne), pastel, ocean, retro, cobalt
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

- **Fonds unis** : `nuit`, `papier`, `accent`. **Décors illustrés** : `cave`, `robot`, `scene`, `mur` (salle d'escalade), `salon` (fenêtre ouverte, thermomètre au mur), `riziere` (terrasses au Vietnam, paysan et buffle, aigrettes), `champ` (rangs de légumes, ferme, agriculteur de dos), `supermarche` (étal de légumes sous les néons, chariot). **Photo de l'auteur** : `"fond": "photo", "photo": "fichier.jpg"` (fichier dans `videos/medias/`).
- Deux plans voisins ne peuvent pas avoir le même fond (le montage le refuse). Sans `"fond"`, les fonds unis alternent.
- **Transitions** : `cercle`, `volet`, `biseau`, `rideau` (elles alternent si rien n'est précisé).
- **Illustrations** (au trait, 940 × 400, entre le texte et les sous-titres) : `question`, `code`, `chat`, `balance`, `presentation`, `sortie`, `deplacement`, `theatre`, `micro`, `duo`, `commentaire` ; pour l'escalade : `reglette`, `pince`, `aplat`, `carre`, `adherence`, `talon` ; pour l'énigme : `soleil`, `fenetre`, `thermometre`, `distance` (`"valeur"` change le nombre affiché) ; `rayons` (des rayons qui se vident au temps fort) et `copies` (des copies de copies qui se dégradent). Sur le fond `accent` orange, la couleur de peau des dessins d'escalade se lit mal : les mettre sur `nuit` ou `papier`. Avec un décor illustré, ne pas mettre d'illustration : le décor suffit. Dans un plan `visuel`, `"moment": { "a": "mots" }` déclenche le temps fort de l'illustration (la balance bascule, la croix se trace).
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
| `palettes.js` | Les palettes de couleurs (jetons, accents, étalonnage) | Node |
| `themes.js` | Les styles : polices, CSS ajouté, aspect du mot de sous-titre (actif, dit, pâle), filtre SVG éventuel | Node |
| `decors3d.js` | Les décors en 3D (Three.js 0.149, `three.min.js`) : `creer(canvas, p, aspect)` → `maj(t, d)`, tout calculé à partir du temps du plan ; moteur de caméra `pose()` et `piloter()` | page |
| `lecteur.js` | Construit la timeline GSAP : transitions, texte mot par mot, sous-titres, décors | page |
| `page.js` | Écrit `index.html`, la voix montée (ffmpeg), la musique et le **mixage** en un seul fichier | Node |
| `scripts/maquette-voix.js` | Voix muette estimée depuis un script, pour monter les visuels avant l'enregistrement | Node |
| `personnage.js` | Le personnage récurrent : allures, poses, places dans les décors | Node et page |
| `scripts/sons-avis.js` | L'indicatif, la musique par rubrique, les bruitages | Node |
| `scripts/decouper.py` | Détoure une photo (autocollant du collage) | Python |
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
- **Aucune rotation sur du texte** : un test (`texte toujours droit`) parcourt le CSS de tous les thèmes et le lecteur ; en ajouter une règle ou une animation de texte avec `rotate`, `skew` ou `rotation` le fait échouer.
- **Un mot transcrit de travers peut changer le sens** : dans `agriculteur-ia`, Whisper a écrit « Si on arrête de l'IA, l'IA va finir… » là où la phrase veut « Si on arrête de coder, l'IA… ». Corrigé dans les sous-titres, et signalé à l'auteur puisque le modèle ne peut pas vérifier à l'oreille. Les `"forts"` et les ancres se cherchent dans les mots transcrits, pas dans les mots corrigés.
- **Le sujet d'un décor et les sous-titres** : l'agriculteur du champ avait la tête sous la bande des sous-titres ; il a été remonté. Vérifier chaque nouveau décor sur la planche `--accroche`.
- **Whisper et les chiffres** : il écrit « 10% », « 30 », « 5 » ; corriger l'affichage avec `"corrections"` si besoin.
- **Whisper et les noms** : « ChatGPT » a été transcrit « Tchad, GPT ». Relire `mots.json` et corriger avec `"corrections"`.
- **Un `transform` SVG et GSAP** : animer `x` ou `y` sur un groupe qui porte déjà `transform="translate(…)"` écrase sa position (le paysan de la rizière partait en haut de l'image). Mettre l'animation sur un groupe intérieur sans attribut `transform`.
- **Pas de `from: 'random'`** dans un `stagger` : c'est du hasard, chaque processus de rendu tirerait un ordre différent.
- **Les palettes** (`studio/avis/palettes.js`) : une palette = deux jetons (fond, texte), un accent par rubrique et un « étalonnage » (filtre CSS, ou échelle de trois couleurs en filtre SVG pour `cobalt`) posé sur `.deco` et `.illu`, donc sur les décors, la 3D, le hibou et les dessins, mais pas sur les sous-titres ni les textes. Depuis le 17 nov., la palette par défaut est `coucher`. Hors de la palette `vive`, les accents propres à chaque décor (`accent` dans `decors.js`) sont ignorés au profit de l'accent de la palette. Un test impose texte/fond au moins 7 pour 1 et accent/fond au moins 3 pour 1. Pour ajouter une palette : une entrée dans `PALETTES`, et le test vérifie le reste. Coût au rendu : 62 s en `vive`, 81 s en `cobalt` pour 37 s de vidéo. Limite : un étalonnage est un réglage global, il ne remplace pas la couleur de chaque décor ; certains décors (théâtre, rizière) y perdent en nuances.
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
- **La musique du compte est `house-plate`** (défaut dans `style.js`), validée par l'auteur après six essais : « La musique est parfaite ». Ne plus y toucher sans demande. Le chemin pour y arriver est décrit ci-dessous ; la première proposition (mélodie et indicatif, `avis`) n'a pas plu.
- **Ce qu'il veut** : des musiques « plus vivantes ». Trois styles avec batterie et basse ont été proposés le 16 nov. (`VIVES` dans `sons-avis.js`) : `funk` (108 à la minute), `electro` (122), `acoustique` (100). Essai : `npm run video -- <id> --musique=funk`. Quand il aura choisi, mettre son choix dans `style.js` (`musique`) ; s'il veut un style par rubrique, ajouter une table rubrique → musique au même endroit.
- **Sa réponse aux trois styles** : « Juste la basse, essaye de faire une instru electro house ». D'où `house` et `house-nue` (`house()` dans `sons-avis.js`) : 124 à la minute, grosse caisse sur chaque temps, basse à contretemps passée dans un filtre résonant (`basseHouse`), « pompe » sur chaque coup de grosse caisse, entrée étouffée puis montée ; le plein tombe sur le premier mot fort (`feuille.musique.plein`). `house-nue` ne garde que la basse, la grosse caisse et le charley.
- **Puis « fais plus plat »**, c'est-à-dire, selon lui, « régulier, sans effets » : `house-plate` (`house({ plate: true })`) joue la boucle complète dès la première seconde et ne change plus : pas d'entrée étouffée, pas de montée, pas de pompe, pas de « wah » (coupure du filtre fixe à 720 Hz), la même note de basse aux quatre contretemps. Un test mesure cette régularité. **Leçon** : après plusieurs essais refusés, demander ce que le mot veut dire avant de refaire (le modèle ne peut pas écouter) ; il aime ce qui est constant et sobre, pas les effets.
- **Puis « Juste le fond, pas le klaxon »** : le « klaxon » était la basse en dent de scie de `house-plate`. Elle est maintenant faite de sinus seulement (note, octave, quinte au-dessus), avec une attaque douce. Retenir : il n'aime pas les sons riches et nasillards ; il veut un fond rond et constant.
- **Deux pièges rencontrés** : une puissance d'un nombre très légèrement négatif (`x ** 2.2` au premier échantillon) donnait un nombre invalide que la réverbération propageait : toute la batterie devenait muette sans erreur ; un test vérifie maintenant qu'aucun nombre invalide ne sort. Et un téléphone ne rend presque rien sous 200 Hz : la basse a une seconde onde à l'octave et un filtre assez ouvert, sinon elle disparaît (mesurer la bande 250 à 2 000 Hz, pas seulement le niveau global).
- **La musique du compte** (`"musique": "avis"`, à la demande) : la même mélodie et les mêmes accords pour tout le compte, une instrumentation par rubrique (`RUBRIQUES`). `"musique": "labo"` rend l'ancienne, `"aucune"` la coupe.
- **Elle suit la voix** : le montage calcule les « creux » (les moments où l'auteur parle, `feuille.musique.creux`) ; `volumeMusique()` dans `page.js` en fait une expression pour ffmpeg : `reglages.musique` (0,16) sous la voix, `reglages.musiqueSeule` (0,42) dans les silences.
- **Les bruitages** : un décor déclare ses sons (`sons: [{ f, t, v, boucle }]` dans `decors.js` ou `decors3d.js`) ; une illustration qui surgit fait un « pop ». `"reglages": { "bruitages": 0 }` les coupe.
- **Écouter sans vidéo** : `node scripts/sons-avis.js <dossier>` écrit tous les sons.
- Mesuré sur l'énigme : −15 LUFS avant rendu ; la musique remonte pendant le compte à rebours et sur la question de fin. **Personne n'a écouté** avant l'auteur.
- Ce qui reste de ce lot dans toutes les vidéos : la musique qui baisse sous la voix (elle s'applique aussi à `labo`) et les bruitages des décors.

## 6 quater. La mascotte : un hibou (lot 2 du plan « aller plus loin », 16 nov. 2026)

**La mascotte du compte est un hibou** en papier découpé (`"personnage": 'hibou'` dans `style.js`), choisi par l'auteur après avoir vu un personnage humain : « Je verrais plus un hibou qu'un personnage pour la référence ». Tout est dans `studio/avis/personnage.js` ; le mot « personnage » reste dans le code et dans l'épisode.

- **Le hibou** (`hibou()`) reprend les poses du personnage : ses ailes sont ses bras (seul l'angle du haut du bras sert), ses pupilles regardent vers le geste.
- **En verre et petit** (« Fais le hibou couleur verre transparent et plus petit ») : aplats bleutés très transparents, liseré blanc, reflets ; pas de dégradé SVG (un dégradé défini dans un plan caché ne s'applique plus). `placer()` le met à la même abscisse que le personnage mais toujours à la même hauteur : pieds à y 1282, juste au-dessus des sous-titres, taille 0,6. Il vole sur place (léger va-et-vient).
- Les allures humaines (`bonnet`, `casquette`, `boucles`) restent dans le code ; ne pas les reproposer.

- **Pas trop souvent** (demande de l'auteur) : avec `"personnage": true`, il n'apparaît que dans le premier et le dernier décor qui lui font une place ; le montage donne un conseil s'il est à l'écran plus de 40 % du temps.
- **Dans l'épisode** : `"personnage": true` (pose par défaut du décor), ou sur un plan `"personnage": "salue"` ; `"personnage": false` sur un plan l'enlève. `"allure"` change son allure pour un épisode.
- **Poses** : `debout`, `salue`, `montre`, `reflechit`, `marche`, `assis`, `grimpe`. Une pose est une liste d'angles (`POSES`) : en ajouter une coûte une ligne.
- **Places** (`PLACES`) : `cave`, `robot`, `scene`, `mur`, `salon`, `riziere`. Règle vérifiée par un test : le centre de la tête reste au-dessus de y 1200, pour que les sous-titres ne passent jamais sur le visage. Quand il est là, le figurant du décor (classe `figurant` : la silhouette de la cave, le grimpeur du mur) est caché.
- **Piège** : ne jamais l'animer avec les propriétés `x`, `y`, `rotation` ou `svgOrigin` de GSAP (elles se repèrent dans l'image entière et décalent un dessin placé par un groupe parent : il se retrouvait 300 pixels trop haut). Tout passe par l'attribut `transform` (`attr: { transform: 'rotate(9)' }`), chaque membre étant dessiné autour de son articulation.
- **Reste à faire** : le hibou en 3D (dans `mur3d` et `riziere3d`, comme cible de caméra) ; une pose de vol plus franche pour le mur d'escalade (aujourd'hui `grimpe` lève seulement les ailes).

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

## 8 quater. Les photos de l'auteur (16-17 nov. 2026)

- **Où elles vivent** : `videos/medias/`, **hors du dépôt** (`.gitignore`). Une session neuve doit les redemander ; le montage donne une erreur qui le dit. À ne les versionner qu'après avoir demandé à l'auteur si le dépôt `Ruli0/DevWeb` est privé.
- **Vie privée** : toute photo est copiée avec `ffmpeg -map_metadata -1` (une photo de téléphone porte souvent sa position GPS). Un test vérifie qu'elle n'a ni GPS ni Exif. Ne jamais envoyer une photo brute à un service externe : le détourage se fait en local.
- **Fond `photo`** : `"fond": "photo", "photo": { "fichier": "fontainebleau.jpg", "cadrage": 0.48, "naturel": false }` (ou le nom du fichier seul). `cadrage` : la part horizontale gardée (0 à 1) ; le zoom lent part du bas de la photo pour garder l'auteur entre y 900 et 1350, au-dessus des sous-titres ; `naturel` : garde les couleurs de la photo (sans l'étalonnage de la palette). Sur une photo, la **question de fin passe en haut** (sinon elle cache le sujet) ; pas de hibou.
- **Détourage** : `python3 scripts/decouper.py <photo> <sortie.png>`. Modèle BiRefNet lite en ONNX (licence MIT, 224 Mo téléchargés depuis `huggingface.co`, exécuté en local sur le processeur ; ~20 s par photo). `pip install onnxruntime pillow`. Met `HF_HUB_DISABLE_XET=1` avant l'import (déjà fait dans le script). Sur la photo de Fontainebleau le résultat est propre (cheveux, baskets, capuche) ; quelques herbes restent sous les chaussures.
- **Collage** : `"collage": [{ "image": "fontainebleau-decoupe.png", "x": 540, "y": 470, "taille": 0.55, "a": "mots" }]` sur un plan : l'image détourée arrive sur son mot avec un rebond, un contour blanc épais et une ombre nette (un autocollant), jamais inclinée. Elle remplace le figurant du décor (grimpeur, corde).
- **À demander à l'auteur** : le dépôt est-il privé ? d'autres photos ou courtes vidéos (escalade, bureau, voyage) ? quel traitement préfère-t-il ?

## 8 ter. Améliorer l'outil dans son ensemble (réponse donnée à l'auteur le 16 nov.)

Par ordre d'effet, ce qui a été dit à l'auteur quand il a demandé comment améliorer l'outil « au global » :

1. **Publier et mesurer** : rien n'est en ligne ; tous les réglages sont des paris.
2. **De l'enregistrement à la vidéo en une étape** : aujourd'hui l'épisode s'écrit à la main après lecture de la transcription. Une commande qui propose un premier épisode (découpage en plans, décors, mots forts, accroche) ferait gagner le plus de temps.
3. **La musique** : cinq versions synthétisées refusées ou à moitié acceptées. Le modèle ne peut pas écouter ; de vrais morceaux libres de droits choisis par l'auteur (il faudrait ouvrir le réseau vers une banque de sons) régleraient le problème plus sûrement.
4. **Ses propres images** (photos, courtes vidéos), surtout pour l'escalade.
5. **Moins d'options** : cinq thèmes, deux aspects 3D, sept musiques ; retirer ce qu'il a écarté une fois ses choix stables.
6. **Un contrôle automatique de l'image** avant envoi (texte coupé, visage sous les sous-titres, plan vide), et le rendu final en 60 images par seconde.

## 9. La suite, par ordre d'intérêt

1. **Monter les voix que l'auteur enverra** (trois épisodes en attente), en soignant l'accroche (`ACCROCHES.md`), puis rendre en 60 images par seconde une fois le montage validé.
2. **Publier, puis relever les chiffres** dans `videos/resultats.csv` (rétention à 3 secondes, visionnage complet, commentaires) : sans mesure, on règle à l'aveugle.
3. **Photos et vidéos de l'auteur** (voir 8 quater) : une première photo est utilisée ; demander d'autres photos, et des courtes vidéos (le fond vidéo reste à faire).
4. Versions 3D de la cave, du théâtre et du salon ; un décor pour la rubrique « relations » ; faire relire les dessins d'escalade par l'auteur, qui pratique.
5. Une signature sonore propre au compte (la musique est encore « Labo », de la V3).
6. Si l'auteur valide la voix clonée : la brancher dans la chaîne (un texte → une vidéo), avec le signalement « généré par IA ».
