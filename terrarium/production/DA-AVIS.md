# Direction artistique de la chaîne « avis »

_Ouverte le 15 novembre 2026. Pour reprendre le travail, lire d'abord `PASSATION-AVIS.md`._

## L'idée

L'auteur parle librement (travail, escalade, relations) et enregistre sa voix au téléphone. L'outil nettoie la voix, retire les blancs et habille le propos. La valeur vient du propos et de la voix ; l'image sert l'écoute et empêche de s'ennuyer.

## Ce qui ne change jamais (l'identité du compte)

- **Rien en haut de l'image** : ni barre de progression (« je n'aime pas », 15 nov.), ni bulle de rubrique (retirée le 16 nov.). La rubrique ne se voit plus que par la couleur d'accent.
- **Typographie** : Inter Tight 700 (titres, sous-titres), Instrument Serif italique pour le mot fort (`*mot*`), JetBrains Mono pour les étiquettes.
- **Sous-titres** : une étiquette sombre vers y 1300, au plus 4 mots ; le mot en cours est dans une pastille de la couleur de la rubrique, les mots à venir sont pâles, les mots forts restent en couleur.
- **Couleur de rubrique** : travail `#5b8cff`, escalade `#ff8a3d`, relations `#ff5d7a`, énigme `#a78bfa`, voyage `#3fbf8f`.
- **Fin** : une question au spectateur, sur une étiquette de papier posée dans le décor du dernier plan. Pas d'écran « Et toi ? » séparé.
- Du grain sur toute l'image.

## Le personnage et le son (16 nov. 2026)

**Une mascotte** revient d'une vidéo à l'autre : un petit hibou de verre (transparent, liseré blanc, reflets, grands yeux), qui vole sur place juste au-dessus des sous-titres. L'auteur l'a préféré à un personnage humain. Il se montre peu : à l'ouverture et à la fin. **Le son** : une house régulière et sobre (grosse caisse, charley, basse ronde, sans effets), validée par l'auteur ; elle baisse quand il parle, et les décors ont leurs bruitages.

## Peu de texte

Le spectateur lit déjà les sous-titres : un second texte à l'écran fait trop d'informations (retour de l'auteur, 15 nov.). La plupart des plans sont donc sans texte (`visuel`). Au plus trois textes par vidéo : l'accroche, un mot fort au moment clé, la question de fin. L'en-tête ne garde que la rubrique. Dans une vidéo en liste, un compteur très court est permis (`"repere": "Mains 1/3"`).

## Ce qui varie (pour ne pas lasser)

- **Les fonds**, jamais deux fois le même à la suite : trois fonds unis (`nuit`, `papier`, `accent`) et des **décors illustrés** plein écran, avec leurs propres couleurs : `cave` (le développeur de dos devant ses écrans), `robot` (l'IA), `scene` (théâtre : rideaux, projecteurs, micro, masques), `mur` (salle d'escalade : prises de couleur, corde, quelqu'un de dos), `salon` (fenêtre ouverte sur un dehors brûlant, canapé, thermomètre au mur), `riziere` (terrasses inondées au lever du soleil, montagnes dans la brume, paysan au chapeau conique et son buffle). Le fond `photo` affiche une photo de l'auteur.
- **Les transitions** : cercle, volet, biseau, rideau.
- **Les illustrations au trait**, sur les fonds unis seulement.
- **Le mouvement** : chaque plan arrive avec un léger zoom, son texte monte mot par mot, le mot fort est souligné d'un trait ; les décors vivent (code qui s'écrit, yeux qui clignent, masques qui flottent) et leurs calques glissent à des vitesses différentes.

## Le style du compte : papier découpé, couleurs vives (choisi le 16 nov. 2026)

**`decoupe` est le style par défaut** : l'auteur l'a choisi parmi quatre, en demandant les couleurs vives du néon. Les trois autres restent disponibles, mais ne pas les utiliser sans demande.

Un style est une couche posée sur le même contenu (`"theme"` dans l'épisode, `studio/avis/themes.js`).

| Thème | Image | Texte et sous-titres | Coût au rendu |
|---|---|---|---|
| `base` | Les décors tels quels | Inter Tight, étiquette sombre, mot en cours en pastille | — |
| **`decoupe`** (défaut) | Cadre crème, calques avec une ombre nette, couleurs saturées | Bricolage Grotesque, étiquette de papier posée de travers | faible |
| `neon` | Image assombrie et contrastée, lignes d'écran | Anton en capitales, sans étiquette, cerné de noir, le mot en cours s'allume | faible |
| `feutre` | Tous les contours tremblent comme un dessin à la main | Caveat Brush, surligneur jaune | plus élevé (filtre SVG sur tout le décor) |
| `affiche` | Une seule encre sombre sur papier crème, trame de points | Anton en capitales, un bloc par mot | faible |

## Décors en 3D (essai du 16 nov. 2026)

L'auteur a aimé le premier essai (« ça me plaît ») et veut « des tours, des effets plongeants, des zooms ». Un décor peut avoir une version en volume (`mur3d`, `riziere3d`) : formes simples à facettes, vraie caméra qui se déplace, ombres portées. Elle se choisit avec `--3d` ou `"decors3d": true`. La caméra enchaîne des mouvements calés sur les mots (`"camera"`, voir la passation). À réserver aux plans où le mouvement de caméra apporte quelque chose ; les personnages restent des silhouettes de blocs.

### Les palettes de couleurs

Six palettes existent (`studio/avis/palettes.js`) : `vive` (l'actuelle, par défaut), `pastel`, `coucher`, `ocean`, `retro`, `cobalt` (deux encres). L'auteur choisit (17 nov.) ; en attendant, `vive` reste le défaut. Elles changent les fonds unis, les accents par rubrique et, par un étalonnage, tous les décors.

### L'aspect de la 3D


Par défaut, la 3D est « douce » : facettes éclairées en dégradé, ombres douces. L'aspect en aplats avec contours (`decoupe`) a été essayé le 16 nov. ; l'auteur a préféré l'aspect d'avant. Il reste disponible avec `--aspect=decoupe`. La rizière vit (riz en rangs qui ondule, eau qui scintille, paysan à la palanche, buffle, repiqueuse, canards, brume, lumière qui se lève) et une ambiance de campagne passe sous la voix.

## Mise en page (1080 × 1920)

| Zone | y | Contenu |
|---|---|---|
| Plan | 270 à 700 | étiquette, titre ou liste |
| Illustration | 700 à 1280 | dessin au trait (fonds unis) ou sujet du décor |
| Sous-titres | 1300 à 1430 | la voix, mot par mot |
| Bas | sous 1440 | rien d'important : interface de TikTok |

Rien d'important à droite de x 940 dans la moitié basse (boutons de TikTok).

## Limites connues

- Les décors sont des dessins vectoriels faits à la main dans le code : plus chaleureux que des aplats, mais ce ne sont pas des photos. De vraies images de l'auteur feront mieux.
- La musique est « Labo », héritée de la V3, à bas volume.
- Le ton et les intonations de la voix ne sont pas modifiés.
