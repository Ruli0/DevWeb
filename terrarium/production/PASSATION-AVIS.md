# Passation : la chaîne « avis » (la voix d'abord)

_Écrit le 15 novembre 2026 pour le modèle qui reprend le travail. À lire en premier, avant tout autre fichier. Branche : `claude/busy-feynman-m0q7yp`._

## 1. Où on en est, en cinq lignes

- L'auteur ne veut plus (pour l'instant) du format « cerveau et santé » : il veut **parler librement** de sujets variés (travail et IA, escalade, relations) et que l'outil habille sa voix.
- La chaîne « avis » fait cela : une voix enregistrée au téléphone entre, une vidéo verticale sous-titrée et illustrée sort.
- Un épisode existe : `valeur-ia` (57 s, rubrique Travail). Trois versions ont été envoyées ; l'auteur a dit de la dernière base : « on est sur la bonne piste », puis « on a une base stable ».
- **Prochaine action attendue** : l'auteur renvoie une nouvelle prise de voix sur le script resserré (section 7). Il faudra refaire le montage dessus.
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

Demandes constantes : **réponses courtes**, tout en français, savoir si **tout est gratuit** (oui, voir section 8).

Ce qu'il ne faut pas reproposer : une voix de synthèse ou clonée ; le terrarium ; l'infographie sobre seule ; **une barre de progression** (« pour les prochaines vidéos ne mets pas de barre de progression, je n'aime pas », retirée le 15 nov.) ; du texte à l'écran en plus des sous-titres.

## 3. Fabriquer une vidéo, de bout en bout

```bash
cd terrarium && npm install
pip install faster-whisper pyrnnoise soundfile "numpy<2"     # une fois par session
# 1. La voix : débruitage (RNNoise), transcription mot par mot (Whisper « medium »), silences
HF_HUB_DISABLE_XET=1 python3 scripts/voix.py <enregistrement.m4a> <id>     # → videos/voix/<id>/propre.flac et mots.json
# 2. L'épisode : videos/episodes/<id>.json ("version": 4). Modèle : valeur-ia.json
# 3. La composition et la planche d'aperçu (une image par plan)
npm run video -- <id>            # regarder videos/studio/<id>/apercu.png
npm test                         # 54 tests, tous verts
# 4. Le rendu (CLI HyperFrames installé hors du dépôt : npm i hyperframes dans le dossier temporaire)
cd videos/studio/<id> && HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  <dossier-temporaire>/node_modules/.bin/hyperframes render --workers 3 --fps 30 --quiet -o <id>.mp4
```

- Les enregistrements de l'auteur arrivent dans `/root/.claude/uploads/<session>/…m4a` (pièce jointe du message).
- Un rendu de 57 s en 30 images par seconde prend environ 3 minutes. Le rendu final se fera en 60 (`--fps 60`), une fois le montage validé.
- Envoyer le MP4 à l'auteur comme fichier. Les MP4 et `videos/studio/` ne vont pas dans le dépôt ; `videos/voix/<id>/` y va (c'est la source).
- Lint : `hyperframes lint --json <chemin de la composition>` : 0 erreur attendue ; les avertissements « sub-composition » et « track too dense » sont connus et sans effet.

### Préparer les visuels avant la voix (maquette)

```bash
# écrire videos/voix/<id>/script.txt, puis :
node scripts/maquette-voix.js <id>      # mots.json aux instants estimés (2,7 mots par seconde) et propre.flac muet
npm run video -- <id>
```

`mots.json` porte alors `"maquette": true`. Quand la vraie voix arrive, `python3 scripts/voix.py <enregistrement> <id>` remplace les deux fichiers. Si l'auteur dit les mêmes mots, les ancres de l'épisode restent valables ; sinon le montage dit lesquelles refaire. Relire ensuite les `"corrections"` et les instants des plans sur la planche.

**Deux épisodes attendent une voix** : `valeur-ia` (script resserré, section 7) et `escalade-techniques` (script dans `videos/voix/escalade-techniques/script.txt`, 3 techniques de mains et 3 de pieds).

## 4. L'épisode (`videos/episodes/<id>.json`)

| Champ | Rôle |
|---|---|
| `"version": 4`, `"rubrique"` | Choisit la chaîne « avis » ; la rubrique donne la couleur (`travail`, `escalade`, `relations`, `enigme`, `voyage`, dans `studio/avis/style.js`) |
| `"voix"` | Le dossier de `videos/voix/` (par défaut l'identifiant) |
| `"retirer"` | Passages coupés : `[["premiers mots", "derniers mots"]]`. La coupe va de silence à silence |
| `"corrections"` | Orthographe des sous-titres, par indice du mot dans `mots.json` (`""` supprime le mot affiché) |
| `"forts"` | Mots en couleur dans les sous-titres (toutes leurs occurrences) |
| `"pauses"` | `[{ "apres": "derniers mots", "duree": 5 }]` : un silence ajouté dans la voix, pour un plan `rebours` (compte à rebours, un tic par seconde) |
| `"theme"` | Le style d'ensemble : `base` (défaut), `decoupe`, `neon`, `feutre`, `affiche` (`studio/avis/themes.js`). **Ne pas le préciser : le défaut est `decoupe`, le style choisi par l'auteur** |
| `"reglages"` | `vitesse` (1,05), `respiration` (0,14 s laissée par silence), `musique` (volume 0,16) |
| `"plans"` | Les plans visuels. Chacun commence sur son ancre `"a"` (une suite de mots dits) et dure jusqu'au suivant |

**Règle depuis le 15 nov. : presque aucun texte à l'écran en dehors des sous-titres.** Le plan par défaut est `visuel` (fond et illustration, sans texte). Garder au plus trois textes par vidéo : l'accroche du premier plan, un mot fort au moment clé, la question de fin. Les plans `liste` et `bascule` existent encore mais ne sont plus utilisés.

Un plan : `"plan"` (`visuel`, `titre`, `rebours`, `liste`, `bascule`, `fin`), `"fond"`, `"illu"` (facultatif), `"transition"` (facultatif), et ses textes (`*mot*` = mot fort). Le dernier plan est `fin` avec `"apres": 3.2` (il vient après la voix).

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
| `lecteur.js` | Construit la timeline GSAP : transitions, texte mot par mot, sous-titres, décors | page |
| `page.js` | Écrit `index.html`, la voix montée (ffmpeg), la musique et le **mixage** en un seul fichier | Node |
| `scripts/maquette-voix.js` | Voix muette estimée depuis un script, pour monter les visuels avant l'enregistrement | Node |
| `test/avis.test.js` | 10 tests du montage | Node |

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
- **Mesurer avant de déplacer** : dans `lecteur.js`, les traits sous les mots forts sont placés d'après `getBoundingClientRect` ; la mesure doit se faire avant tout `gsap.set` sur les mots.
- **Planche d'aperçu** : une image tombée au milieu d'une transition ou d'un clignement d'œil n'est pas un défaut. Demander d'autres instants : `NODE_PATH=$(npm root -g) node scripts/apercu.js videos/studio/<id>/index.html <sortie.png> t1 t2 …`.
- **`production/CATALOGUE.md`** est généré (`node studio/catalogue.js`) et vérifié par un test ; il ne décrit pas la chaîne « avis ».
- Les chaînes plus anciennes (terrarium, V3) restent dans le dépôt et leurs tests passent : ne pas les faire évoluer sans demande.

## 6 bis. Voix clonée (essai du 16 nov. 2026)

L'auteur a demandé si sa voix pouvait dire un texte nouveau. Un essai de 8 s a été généré et envoyé ; **son avis n'est pas encore connu**. Rien n'est branché dans la chaîne.

- Outil : Chatterbox multilingue (`pip install chatterbox-tts "setuptools<81"` dans un environnement virtuel à part, 3,7 Go ; modèle téléchargé depuis Hugging Face). Sans carte graphique : environ 45 s de calcul pour 8 s de voix.
- Référence : une vingtaine de secondes de `videos/voix/valeur-ia/propre.flac`, silences retirés, en 24 kHz.
- `ChatterboxMultilingualTTS.from_pretrained(device="cpu").generate(texte, language_id="fr", audio_prompt_path="ref.wav")`.
- Le modèle pose un **filigrane inaudible** « généré par IA » sur chaque son. Il lui faut `pkg_resources` (d'où `setuptools<81`). Ne pas le désactiver.
- Vérification possible sans oreille : retranscrire le résultat avec Whisper. Sur l'essai, le texte est dit en entier ; « l'IA » et « ChatGPT » sont mal prononcés selon la transcription (« qu'il y a code », « chat de GPT ») : écrire ces mots comme ils se disent (« l'i-a », « tchate-jé-pé-té »).
- À dire à l'auteur à chaque fois : TikTok demande de signaler une voix générée par IA ; sa vraie voix reste préférable, la voix clonée sert à dépanner.

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

1. Monter la nouvelle prise de voix (section 7), obtenir l'accord de l'auteur, rendre en 60 images par seconde.
2. **Photos et vidéos de l'auteur** comme fonds (escalade surtout) : c'est le meilleur remède au reproche « ça fait trop IA ». Le fond `photo` existe ; il n'a été essayé que sur une image de test, jamais sur une vraie photo. La vidéo en fond reste à faire.
3. Décors pour la rubrique « relations » ; faire relire les dessins d'escalade par l'auteur.
4. Une signature sonore propre au compte (la musique est encore « Labo », de la V3) et quelques bruitages sur les transitions.
5. Publier, puis relever les chiffres dans `videos/resultats.csv` : sans mesure, on règle à l'aveugle.
