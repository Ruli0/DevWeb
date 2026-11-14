# Direction artistique V3 : « éditorial scientifique »

_Écrit le 14 novembre 2026. À lire en entier avant de dessiner. Les valeurs chiffrées sont un point de départ : l'étape 1 du plan les fait valider par l'utilisateur, puis elles vont dans `studio/style.js`._

## 1. L'intention

Une vidéo doit donner l'impression d'un **article scientifique mis en mouvement par un studio de design** : calme, précis, beau, adulte. On pense aux infographies animées des grands journaux, aux génériques de documentaires, aux keynotes.

Trois mots guident chaque choix : **sobre, précis, vivant**.
- Sobre : peu d'éléments à l'écran, beaucoup d'espace, une seule couleur d'accent.
- Précis : chaque tracé, chaque alignement, chaque chiffre est juste.
- Vivant : toujours un mouvement lent quelque part, jamais d'image figée.

**Le test à faire sur chaque image** : est-ce qu'elle pourrait illustrer un livre pour enfants ? Si oui, elle est à refaire.

## 2. Couleur

Le fond est sombre et chaud. Une seule couleur d'accent par épisode : elle porte le mot clé, la zone du cerveau active, la barre importante du graphique.

| Rôle | Valeur de départ | Usage |
|---|---|---|
| Fond | `#14110f` (encre chaude) | Tout l'écran, avec un dégradé très léger vers `#1c1814` |
| Texte | `#f2ece1` (blanc cassé) | Phrases, chiffres |
| Texte secondaire | `#f2ece1` à 60 % | Légendes, sources, axes |
| Trait | `#f2ece1` à 35 % | Schémas, grilles, filets |
| Accent | selon l'épisode | Un seul par vidéo |

Accents possibles, un par thème : ambre `#e8a23c` (motivation, procrastination), corail `#e8674a` (stress, peur), sauge `#8fb89a` (sommeil, calme), bleu glacier `#7fb6d9` (attention, mémoire), lilas `#b49be0` (émotions, lien social).

Règles :
- Jamais de noir pur ni de blanc pur.
- Jamais deux accents dans la même vidéo.
- Pas de dégradé arc-en-ciel, pas de néon, pas de contour lumineux épais.
- La lumière existe, mais discrète : un halo doux de l'accent derrière l'élément important, à 15 % d'opacité au plus.
- Un grain fin sur toute l'image (bruit à 4 à 6 % d'opacité), pour la matière.

## 3. Typographie

La typographie est le personnage principal. Trois familles, chargées par Google Fonts (elles sont embarquées au rendu) :

| Rôle | Police de départ | Usage |
|---|---|---|
| Phrases | **Instrument Serif** (ou Fraunces) | Accroche, phrases fortes, citations |
| Données | **Inter Tight** en gras et semi-gras (ou Geist) | Chiffres, étiquettes, étapes |
| Sources | **JetBrains Mono** | Références, unités, petites mentions |

Tailles, sur un écran de 1080 × 1920 :

| Élément | Taille | Remarques |
|---|---|---|
| Chiffre géant | 300 à 440 px | Inter Tight gras, interlettrage serré (−0,03 em) |
| Phrase forte | 88 à 120 px | Serif, 3 lignes au plus, interligne 1,05 |
| Texte courant | 56 à 68 px | 4 lignes au plus |
| Étiquette de schéma ou d'axe | 34 à 40 px | Inter Tight semi-gras, parfois en capitales espacées |
| Source | 28 à 30 px | Mono, 60 % d'opacité. Jamais plus petit que 28 px |

Règles :
- Alignement **à gauche** par défaut, sur une marge de 80 px. Le centré est réservé au chiffre géant et à l'accroche.
- Le mot clé prend la couleur d'accent, ou passe en italique serif. Pas de pastille, pas de surlignage épais, pas de contour.
- Pas de texte en capitales pour les phrases. Les capitales espacées servent aux petites étiquettes.
- Les guillemets, apostrophes et espaces insécables sont français (« », ’, espace avant ? ! : ;).
- Le texte apparaît **par ligne ou par mot** (SplitText), en glissant de 20 à 40 px avec un fondu. La frappe lettre par lettre est abandonnée.

## 4. Mise en page

- Grille : marges de 80 px à gauche et à droite. Le contenu tient entre y = 220 et y = 1380, dans la zone sûre TikTok (x de 60 à 940, y de 150 à 1440). Rien d'important sous y = 1440.
- **Un point focal par écran** : un chiffre, ou une phrase, ou un schéma. Jamais les trois.
- Beaucoup de vide. Si l'écran semble plein, on retire un élément.
- Les éléments s'alignent entre eux : mêmes marges, mêmes lignes de base d'une scène à l'autre.
- En haut à gauche, discret et constant : le nom de la série et le numéro de l'épisode (mono, 28 px). En bas, la source quand il y en a une.

## 5. Mouvement

Lent, net, continu. Rien ne rebondit.

| Réglage | Valeur de départ |
|---|---|
| Courbe d'entrée | `CustomEase` proche de `expo.out` : `M0,0 C0.16,1 0.3,1 1,1` |
| Courbe de sortie | `power2.in`, plus courte que l'entrée |
| Entrée d'un texte | 0,6 à 0,9 s, décalage de 0,06 à 0,1 s entre les lignes ou les mots |
| Tracé qui se dessine (DrawSVG) | 0,8 à 1,6 s, `power2.inOut` |
| Transformation de forme (MorphSVG) | 0,8 à 1,2 s |
| Compteur de chiffre | 1 à 1,6 s, `power2.out` |
| Dérive permanente | zoom de 3 à 5 % sur la durée de la scène, ou glissement de 20 à 40 px |

Règles :
- **Interdits** : `back`, `elastic`, `bounce`, les secousses, les rotations gratuites, les effets de « pop ».
- **Un changement visuel toutes les 2 à 3 secondes**, calé sur la pulsation de la musique.
- **Transitions entre scènes**, par ordre de préférence :
  1. un élément commun se transforme : le point du « i » devient le point d'une courbe, le cercle d'un chiffre devient une zone du cerveau (MorphSVG, Flip) ;
  2. un volet par lignes : le texte sort ligne par ligne, le suivant entre de même ;
  3. une coupe franche, sur le temps.
  Jamais de fondu enchaîné mou, jamais de volet décoratif.
- **Profondeur** : deux ou trois plans (fond avec formes floues très lentes, contenu, grain). La mise au point se fait par un léger flou des éléments secondaires.
- Tout reste **déterministe** : une timeline en pause, pas de minuterie, pas de hasard non reproductible (voir `GUIDE-EXECUTION.md`, section 5).

## 6. La bibliothèque de scènes

Chaque scène est une brique de `studio/scenes/`, avec des paramètres simples. L'épisode les enchaîne. Sa durée vient du temps de lecture de son texte, arrondi au temps de la musique.

| Scène | Ce qu'on voit | Paramètres principaux |
|---|---|---|
| `accroche` | Une question ou une phrase courte, en grand, centrée. Un détail graphique bouge déjà à la première image. | `texte`, `mot_cle` |
| `chiffre` | Un chiffre géant qui compte jusqu'à sa valeur, une ligne d'explication, la source. | `valeur`, `unite`, `legende`, `source` |
| `cerveau` | Un cerveau de profil au trait fin. Une ou deux zones s'allument avec l'accent, leur nom apparaît, un signal circule de l'une à l'autre. | `zones`, `lien`, `texte` |
| `mecanisme` | Deux à quatre étapes reliées par un tracé qui se dessine (déclencheur, réaction, conséquence). | `etapes`, `boucle` |
| `graphique` | Barres ou courbe qui se dessinent, avec la valeur importante en accent, les axes minimaux, la source. | `type`, `donnees`, `accent_sur`, `source` |
| `comparaison` | Deux états côte à côte ou l'un après l'autre (croyance et réalité, avant et après). | `gauche`, `droite`, `source` |
| `citation` | Une phrase d'un chercheur ou d'un article, en serif italique, avec la référence. | `texte`, `source` |
| `geste` | Une action concrète en une phrase, avec un pictogramme au trait ou une liste de 2 ou 3 points qui se cochent. | `texte`, `points` |
| `boucle` | Retour à l'image d'ouverture, avec la mention « information, pas un avis médical » et l'invitation à suivre. | `texte` |

Précisions :
- **Le cerveau** est l'élément le plus important à réussir. C'est une vue de profil au trait fin (1,5 à 2,5 px), anatomiquement plausible, avec des zones nommées : cortex préfrontal, amygdale, striatum, hippocampe, insula, cortex cingulaire antérieur. Les zones profondes se montrent par transparence. Il est légendé « schéma simplifié ». Vérifie la position de chaque zone avant de la dessiner.
- **Les formes abstraites** servent aux idées sans image : un point qui hésite entre deux chemins (choix), une courbe qui retombe (motivation), deux cercles qui se rapprochent (lien), une ligne qui se tend (stress).
- **Les pictogrammes** sont au trait, géométriques, sans visage. Une silhouette humaine est possible si elle reste abstraite (un cercle et un trait).
- **Les graphiques** sont honnêtes : axe qui part de zéro pour les barres, échelle indiquée, pas d'effet qui exagère un écart.

## 7. Le son

- **Musique** : une nappe chaude et une pulsation douce, entre 80 et 100 BPM. Pas de phonk, pas de batterie agressive. Elle est synthétisée par `scripts/build-sons.js`, comme avant, et arrangée par mesure.
- **Bruitages** : peu, doux, précis. Un souffle pour une entrée de texte, un impact feutré pour un chiffre, un tic léger pour une étape, une montée discrète avant la révélation.
- **Le silence compte** : une demi-seconde de quasi-silence avant le chiffre de l'étude lui donne du poids.
- Niveau moyen autour de −14 dB, sans saturation.

## 8. À faire, à ne jamais faire

| À faire | À ne jamais faire |
|---|---|
| Un point focal par écran | Remplir l'écran |
| Une couleur d'accent par épisode | Plusieurs couleurs vives |
| Des tracés fins et précis | Des contours épais, des halos fluo |
| Des entrées lentes par ligne | Des rebonds, des secousses, des « pop » |
| La source visible à chaque chiffre | Un chiffre sans origine |
| Des schémas plausibles, légendés « simplifié » | Un cerveau de dessin animé |
| Des formes abstraites pour les idées | Des mascottes, des animaux, des visages, des émojis |
| Un vocabulaire d'adulte, direct | Un ton de comptine, des points d'exclamation en série |
| Du vide | De la décoration |

## 9. Les trois variantes à maquetter (étape 1 du plan)

Elles suivent toutes les règles ci-dessus. Elles diffèrent par la palette et la typographie.

| Variante | Fond et accent | Typographie | Caractère |
|---|---|---|---|
| **V1. Encre et ambre** | Encre chaude `#14110f`, accent ambre | Instrument Serif et Inter Tight | Chaleureux, éditorial, proche d'un magazine |
| **V2. Papier de nuit** | Vert très sombre `#0f1a17`, blanc crème, accent corail | Fraunces et Geist | Plus doux, plus « livre », un peu rétro |
| **V3. Laboratoire** | Bleu-noir `#0d1117`, accent bleu glacier, grille de points visible | Space Grotesk seule, avec JetBrains Mono | Plus technique, plus froid, très « données » |

Pour chaque variante, deux images fixes : la scène `chiffre` et la scène `cerveau`, sur le sujet de la procrastination. Puis, pour la variante retenue, un test de mouvement de 5 s.
