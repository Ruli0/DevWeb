# Identité du compte

_En construction, pas à pas : chaque élément est proposé, puis validé par toi. Dernière mise à jour : 13 novembre 2026._

## Ce qui est décidé

- **Direction artistique (refonte)** : piste A, « ombres lumineuses », avec le texte sans cadre de B et la mouche au fil de C (choisi le 13 nov., mélange A2 en validation).

- **Texte (refonte)** : D1 + D2 + D3 (13 nov., en validation) : grandes lettres rondes en néon, mot clé géant sur sa ligne, bandeau sombre flou, centré en haut. Remplace le terminal T6 pour la taille et le style ; la frappe lettre par lettre est gardée.
- **Texte (avant la refonte)** : **le terminal de Mousse** (T6, validé le 13 nov.). C'est l'écran du robot qui raconte : texte vert en Space Mono, tapé lettre par lettre, avec un curseur et l'invite `mousse@terrarium:~$`.
- **Musique** : **Drift**, phonk à 145 BPM, cloche rapide et saturée, 808 lourde (validée le 13 nov.).
- **Style** : **nuit bioluminescente à la lanterne, dosage B** (validé le 13 nov.). Palette du style 1 (vert acide, cyan, langue rose, fond bleu nuit), obscurité forte (0,75) autour de la zone éclairée, faisceau chaud de la lanterne, et ce qui est bioluminescent brille dans le noir.
- **Âme du compte** : **le gardien du terrarium**, un personnage récurrent qui garde des IA dans son terrarium et commente avec humour.
- **Ton** : divertissant avant tout. Chaque épisode a un gag, et l'apprentissage vient en bonus.

## En cours de choix

| Élément | Statut | Pistes |
|---|---|---|
| Style de nuit | **validé** (tour 2, dosage B) | — |
| Le gardien | intégré au pilote | « Mousse » (nom provisoire) : petit robot rond, tête moussue, un œil cyan, lanterne au bout d'une perche |
| Musique | **validée** : Drift (145 BPM) | — |
| Texte à l'écran | **validé** : T6, le terminal de Mousse | — |
| Scénarios | **validés** (« Go ») | 6 pitchs (nuits 0 à 5), un gag par épisode, le caméléon comme personnage récurrent |
| Pilote Nuit 1 | **tour 2 envoyé, en attente de ton avis** | `videos/scenarios/cameleon.json`, 29,8 s, 60 images par seconde |
| Nom du compte et bio | plus tard | `@les.nuits.du.terrarium`, `@mousse.terrarium` |

## Itérations

### Style, tour 1 (13 nov.)

- **Montré** : la même image (deuxième coup de langue du caméléon, plan large) en 4 styles de nuit, avec un premier croquis de Mousse en bas à droite tenant sa lanterne vers la scène, une légende d'exemple en haut et le repère « Nuit n° 1 ».
  1. **Bioluminescente** : bleu nuit, caméléon vert acide lumineux, langue rose, accents verts.
  2. **Lanterne** : presque noir, seule la lumière chaude de la lanterne éclaire le caméléon.
  3. **Néon phonk** : violet profond, caméléon rose néon, langue cyan.
  4. **Douce** : bleu clair de lune, couleurs adoucies, proche du style actuel.
- **Méthode** : recoloration de l'image actuelle par un script d'essai (hors du dépôt), pas encore intégrée au moteur.
- **Corrigé avant l'envoi** : plan trop serré, papillon devant le sujet, langue devenue bleue, lanterne peu lisible, carrés autour des lucioles.
- **Ton retour** : « Couleur du 1 avec l'effet nuit du 2. »

### Style, tour 2 (13 nov.)

- **Montré** : le mélange demandé, en 3 dosages d'obscurité sur la même image. La palette est celle du 1 : caméléon vert acide, langue rose, mousse et lucioles qui luisent. La nuit est celle du 2 : obscurité autour d'une zone éclairée, et un faisceau chaud qui part de la lanterne vers le caméléon.
  - A : obscurité 0,6 ;
  - B : 0,75 ;
  - C : 0,85.
- **Nouveau** : les éléments bioluminescents gardent leur propre lueur par-dessus l'obscurité. On les voit dans le noir, sans que la lanterne les éclaire.
- **Corrigé avant l'envoi** : lueurs trop grosses, dosages trop proches, faisceau invisible.
- **Ton retour** : « B ». Style validé.

### Musique, tour 1 (13 nov.)

- **Montré** : 3 extraits phonk originaux de 10 s, sur l'image du style B, au même volume (normalisés à -14 LUFS, pour ne pas favoriser le plus fort).
  1. **Drift** : 145 BPM, cloche rapide et saturée, charleston en doubles croches, 808 lourde qui glisse.
  2. **Sombre** : 96 BPM en demi-temps, cloche grave noyée de réverbération, nappe menaçante, 808 longue.
  3. **Joueuse** : 124 BPM avec du swing, cloche qui saute d'octave, 808 courte et rebondissante, claquements de doigts.
- **Méthode** : script d'essai hors du dépôt, avec les outils de synthèse de `scripts/build-sons.js`.
- **Ton retour** : « Drift est parfait ». Musique validée.
- **Envoi** : l'envoi de fichiers a d'abord échoué (erreur 503), puis a fonctionné. Les extraits sont aussi sur la page d'écoute « Atelier des nuits » (artifact privé), avec les sons intégrés.

### Texte à l'écran, tour 1 (13 nov.)

- **Demandé par toi** : valider aussi comment le texte s'affiche sur la vidéo.
- **Montré** : sur l'image du style B, le morceau « Jamais du premier coup. » dans 4 styles. Tous sont dans la zone sûre, sur 2 lignes au plus.
  - **T1, gros titre** : blanc détouré de noir, mot clé en vert, en haut.
  - **T2, néon** : le texte brille en vert et cyan, comme une enseigne.
  - **T3, bulle de Mousse** : c'est le gardien qui parle, dans une bulle bordée de cyan dont la queue pointe vers lui.
  - **T4, mot à mot** : trois ou quatre mots à la fois, le mot en cours surligné (deux instants montrés).
- **Ton retour** : « Texte pas convaincu encore. »

### Texte à l'écran, tour 2 (13 nov.)

- **Hypothèse** : les 4 premiers styles se ressemblaient trop (du texte blanc gras, sous différentes formes). Ce tour propose des directions franches, chacune avec une personnalité.
  - **T5, edit phonk** : League Gothic en capitales, penché, décalage rouge et bleu, qui claque sur le temps.
  - **T6, terminal de Mousse** : Space Mono vert sur l'écran du robot, tapé lettre par lettre, avec un curseur.
  - **T7, annotations** : Permanent Marker et flèches dessinées sur la scène (« ton IA », « un outil ! »).
  - **T8, cinéma** : EB Garamond en italique, avec des filets, en fondu lent.
- **Contraintes** : tous dans la zone sûre. T7 utilise une police non fournie par HyperFrames : il faudra l'embarquer dans `assets/fonts/`.
- **Ton retour** : « T6 ». Texte validé.

### Pilote « Nuit 1 : la langue » (13 nov.)

- **Montré** : la vidéo complète (25,2 s). Elle s'ouvre dans le noir, avec seulement l'œil cyan de Mousse ; la lanterne s'allume. Le caméléon tire la langue et rate : la mouche esquive puis le nargue, et Mousse est blasé. Au deuxième essai, il l'attrape, devient turquoise et en veut encore. Le terminal tape « réfléchir. agir. recommencer. = boucle d'outils », puis annonce la nuit suivante, et la lanterne s'éteint : la fin reboucle sur le début.
- **Corrigé avant l'envoi** : l'esquive envoyait la mouche hors de l'écran. Au zoom 2,6, une unité du décor vaut environ 8 pixels, donc les déplacements de la mouche doivent rester petits.
- **Ton retour** : le texte se décale à la fin de la frappe ; pas assez d'animation, le robot ne bouge pas assez ; la mouche est mal dessinée ; la métaphore n'est pas claire, il faut des zooms qui présentent les personnages ; la vidéo doit suivre la musique (la musique est bonne) ; 30 s ; pas d'annonce « demain » ; tout doit être fluide.

### Pilote « Nuit 1 », tour 2 (13 nov.)

- **Montré** : 29,8 s (18 mesures de Drift), en 60 images par seconde.
- **Métaphore posée par des étiquettes** : caméléon = « l'IA », mouche = « la tâche », langue = « l'outil ». Chaque personnage a son gros plan.
- **Boucle nommée pas à pas** : après le tir à l'aveugle raté, « 1. observer », « 2. agir », « 3. vérifier », puis « = boucle d'outils » et « et ça recommence… ». Plus d'annonce de la nuit suivante.
- **Calé sur la musique** : chaque plan commence sur le premier temps d'une mesure. La piste est arrangée pour la vidéo : intro douce, basse à l'arrivée de la mouche, creux pendant le raté avec un temps de silence, roulement sur « vérifier », retour à fond sur « attrapée ! ».
- **Animation** : nouvelle mouche (yeux, ailes, abdomen lumineux, vols courbes, pirouette d'esquive, dandinement moqueur). Mousse hoche la tête sur le temps, pointe sa lanterne, se penche, se cache l'œil, saute de joie et rit. La caméra avance lentement pendant chaque plan.
- **Texte** : les lettres ont leur place dès le début, donc plus rien ne se décale. La lettre suivante sert de curseur.
- **Ton retour** : en attente.

### Direction artistique, refonte, tour 1 (13 nov.)

- **Contexte** : après le pilote, refonte décidée (`PLAN-REFONTE.md`, étape 1).
- **Montré** : la même scène de 4 mesures (environ 6,6 s, en boucle, avec Drift) dans trois pistes. Le caméléon tire la langue et rate, la mouche esquive et se moque, Mousse se cache l'œil. Le terminal tape « mon IA *rate* tout. ».
  - **A. Ombres lumineuses** : silhouettes sombres sur trois plans de profondeur, contours et taches lumineux, mouche-luciole avec traînée, parallaxe.
  - **B. L'écran de Mousse** : pixel art vert phosphore, mouvements case par case, balayage cathodique, bug d'écran magenta au moment du raté.
  - **C. Papier découpé** : calques de papier aux bords irréguliers, ombres portées, attaches dorées aux articulations, mouche suspendue à un fil qui fait le yoyo devant la lune.
- **Fabrication** : `essais/direction-artistique/` (reproductible, hors du moteur).
- **Ton retour** : « A avec le texte de B et la mouche filée de C. »

### Direction artistique, refonte, tour 2 (13 nov.)

- **Montré** : le mélange A2 (`essais/direction-artistique/a2.cjs`). Il garde les ombres lumineuses de A. Le texte du terminal s'affiche directement sur l'image, sans cadre, comme en B. La mouche-luciole pend à un fil de soie lumineux et fait le yoyo, comme en C.
- **Ton retour** : « Oui ! » (validé).

### Studio, démo (13 nov.)

- **Montré** : `videos/episodes/demo.json` (15 lignes) et sa vidéo de 16,6 s (10 mesures), en 60 images par seconde. L'épisode enchaîne accroche, présentation de la tâche (étiquette « la tâche »), raté avec silence d'un temps, moquerie, réussite avec retour de la basse et saut de Mousse, puis la boucle.
- **Ton retour** : « Le texte reste un problème ». Précisé : trop petit et mal placé, et le style (police, couleurs) ne va pas. La frappe lettre par lettre et les mots eux-mêmes conviennent.

### Texte, tour 3 (13 nov.)

- **Montré** : quatre styles, sur deux images de la démo. Ils sont tous centrés en haut, en grand (80 à 118 px au lieu de 54), et gardent la frappe lettre par lettre (script : `essais/textes/tour3.cjs`).
  - **A. Bulle** : Fredoka gras, blanc avec un épais contour sombre, mot clé en vert lumineux. Ronde et très lisible.
  - **B. Titre phonk** : Rubik extra-gras italique, en majuscules, ombre portée dure, mot clé en vert.
  - **C. Écran de Mousse XXL** : la police terminal, en grand, dans un cadre sombre bordé de la couleur ambre de la lanterne.
  - **D. Lettres lumineuses** : Baloo extra-gras, en vert qui brille comme le caméléon, mot clé en cyan.
- **Ton retour** : « D mais pas convaincue encore ».

### Texte, tour 4 (13 nov.)

- **Montré** : quatre variantes franches de D (`essais/textes/tour4.cjs`).
  - **D1. Mot clé géant** : le mot clé seul sur sa ligne, deux fois plus gros, en cyan.
  - **D2. Néon** : cœur blanc, large halo vert (mot clé : halo cyan).
  - **D3. Sur bandeau** : D sur un bandeau sombre aux bords flous, qui le détache toujours de l'image.
  - **D4. Autocollant** : le mot clé en noir sur une pastille cyan penchée.
- **Changé dans le studio** : les mots ne sont plus jamais coupés entre deux lignes (chaque mot est regroupé), et un mot en valeur peut être stylé en entier.
- **Ton retour** : « D1 avec le néon de D2 et le bandeau de D3. »

### Texte, tour 5 (13 nov.) : le mélange, intégré au studio

- **Montré** : la démo refaite avec le mélange. Les grandes lettres rondes (Baloo 2) sont en néon (cœur blanc, halo vert), le mot clé passe seul sur sa ligne en géant (halo cyan, taille adaptée à sa longueur), le tout sur un bandeau sombre aux bords flous, centré en haut. La ponctuation (« ! », « … ») reste collée au mot.
- **Changé aussi** : la caméra cadre le sujet un peu plus bas (y = 860 au lieu de 768), pour que la mouche ne passe plus sous le texte.
- **Ton retour** : « Oui » (validé).

### Pilote « Nuit 1 », fait avec le studio (13 nov.)

- **Montré** : `videos/episodes/nuit-1.json` (environ 20 lignes, 10 temps forts) et sa vidéo de 29,8 s (18 mesures), en 60 images par seconde.
- **L'histoire** : l'accroche, puis la présentation de l'IA, de la tâche et de l'outil (la langue à mi-portée), chacune avec son étiquette. Viennent deux ratés, à l'aveugle puis trop court, avec un silence après chacun. La tâche se moque. La boucle est montrée une mesure par étape (observer, agir, vérifier), la basse revenant sur l'attrape. Puis la révélation « = boucle d'outils », « comme ton IA. », et le retour au début.
- **Ajouté au studio** : la langue à portée partielle, le raté « trop court », le rire de Mousse, les temps forts `etapes` et `reveler`, le texte par mesure, les expressions mises en valeur sur plusieurs mots (groupées), et des étiquettes plus grandes.
- **Ton retour** : en attente.

### Changement de sujet (13 nov.)

- **Ton retour sur la Nuit 1 « comment marche un agent »** : « L'histoire n'est pas assez bonne… on n'apprend rien de spécial. » Puis : « Je ne veux plus que ça parle d'IA, malheureusement c'est un sujet qui n'est pas tellement viral sur les réseaux. »
- **Nouveau sujet choisi** : « psycho en métaphores », des petites leçons de psychologie jouées par les bêtes du terrarium, chacune avec un conseil simple.
- **Premier épisode choisi** : la peur du jugement (l'effet projecteur).
- **Tu as demandé** des maquettes de style pour le décor, les personnages et le texte, pour choisir.

### Maquettes de style, tour 1 (13 nov.)

- **Montré** : quatre styles complets, sur deux moments de l'épisode (`essais/psycho-styles/`) : S1 ombres lumineuses, S2 doux et pastel, S3 bande dessinée, S4 livre en papier découpé.
- **Ton retour** : « Fais des propositions de style et ensuite de texte, et on va choisir. »

### Styles, tour 2 (13 nov.) : décor et personnages seuls

- **Montré** : six styles, sans texte, au moment « il croit que tout le monde le regarde » : S1 à S4, plus S5 pâte à modeler (volumes doux, flou d'arrière-plan) et S6 aplats géométriques (sarcelle et orange, triangles).
- **Ensuite** : les propositions de texte, une fois le style choisi.
- **Ton retour** : « S1 en décor mais un peu moins sombre, avec les polices du S2. On arrête les polices en surbrillance. Et il faut qu'on voie mieux Mousse, et que sa lanterne soit mieux aussi. »

### Styles, tour 3 (13 nov.)

- **Montré** : S1 éclairci en deux dosages (A un peu, B nettement), avec le texte de S2 (lettres rondes blanches, pastille rose, sans lueur). Mousse a des couleurs plus claires (bleu, mousse verte, bottes brunes), et sa lanterne est redessinée : plus grande, cadre en laiton, vitres, flamme, rayons et halo chaud (`essais/psycho-styles/maquettes.cjs tour3`).
- **Ton retour** : « A, et le reste me va. Après, on passe à la police. Travaille un peu plus les ombres et l'éclairage des lampes et de la lanterne. »
- **Décidé** : décor S1 au dosage A (un peu plus clair), texte sans lueur, nouveau Mousse et nouvelle lanterne.

### Éclairage et polices, tour 4 (13 nov.)

- **Éclairage** (`maquettes.cjs tour4`) :
  - lanterne : halo chaud plus large, cœur très clair, flaque de lumière chaude sur le sol, lueur sur tout ce qui est proche ;
  - Mousse : un **liseré chaud** sur le bord tourné vers la lanterne, une ombre douce de l'autre côté, une ombre portée au sol qui s'éloigne de la lanterne ;
  - caméléon : liseré chaud sous le ventre (lanterne), liseré clair sur le dos (projecteur) ;
  - projecteur : faisceau doux avec un cœur plus net, flaque de lumière sur la branche, ombre du caméléon dans la flaque, poussière dans le faisceau ;
  - les lucioles et la mouche éclairent autour d'elles.
  - **Écarté** : un voile orange sur Mousse et le caméléon : il grisait les couleurs.
- **Polices** (`maquettes.cjs polices`), toutes sur la même pastille : 1 Fredoka (actuelle), 2 Nunito Black, 3 Lilita One, 4 Chewy, 5 DM Serif Display (élégante, mot clé en italique), 6 Poppins ExtraBold.
- **Ton retour** : « 6 [Poppins ExtraBold]. Change la couleur des pastilles, avec moins d'opacité : il faut que ça se confonde avec le décor. À la place du rose, prends une couleur du décor. J'aime bien la police 6. »
- **Décidé** : la police est **Poppins ExtraBold**.

### Pastilles, tour 5 (13 nov.)

- **Montré** : quatre pastilles peu opaques (fond translucide avec flou, fines bordures), le mot clé dans une couleur du décor (`maquettes.cjs pastilles`) : V1 bleu nuit et jaune luciole, V2 bleu brume et cyan, V3 ambre de la lanterne, V4 vert mousse.
- **Ton retour** : « Essaye avec un violet qui reprend un peu les couleurs du décor pour la pastille. »

### Pastilles violettes, tour 6 (13 nov.)

- **Montré d'abord** : le fond lui-même en violet (quatre variantes).
- **Ton retour** : « Non, pas pour le fond, pour la pastille. » Le violet est donc pour la **pastille du mot clé** ; le fond reste translucide, comme le décor.
- **Montré ensuite** (`maquettes.cjs violets`) : le fond bleu nuit translucide, et la pastille du mot clé en W1 lavande claire, W2 violet moyen (texte blanc), W3 violet translucide fondu dans le décor, W4 dégradé violet vers bleu.
- **Ton retour** : « Le 3 » (validé).

## Identité visuelle de la série « psycho en métaphores » (décidée le 13 nov.)

- **Décor** : S1 « ombres lumineuses », au dosage A (un peu plus clair), avec l'éclairage retravaillé : liserés chauds, ombres portées, projecteur à faisceau, flaques de lumière.
- **Personnages** : caméléon, grenouille et lucioles en silhouettes lumineuses ; Mousse en couleurs claires (corps bleu, mousse verte, bottes brunes) avec la nouvelle lanterne en laiton.
- **Texte** : Poppins ExtraBold, sans lueur. Un fond bleu nuit translucide et flou, fondu dans le décor. Le mot clé passe seul sur une pastille **violette translucide** (W3), en blanc.
- **Musique** : phonk Drift (inchangée).

### Épisode 1 « La peur du jugement » : planche d'aperçu (13 nov.)

- **Montré** : la planche d'aperçu de `videos/episodes/jugement.json` (18 mesures, 29,8 s), dans l'identité visuelle décidée.
- **L'histoire** : le caméléon veut attraper la mouche mais il tremble (« tu as peur qu'on te juge ? »). Il s'imagine sous un projecteur, la scène s'assombrit, la grenouille et les lucioles le fixent. Il se camoufle et rate sa mouche. Puis on voit ce que pensent vraiment les autres (bulles de pensée : la grenouille pense à sa mouche, les lucioles à leur lumière, Mousse à sa plante). Le nom : « l'effet projecteur », qui n'existait que dans sa tête. Il ose, attrape la mouche, et personne ne réagit. Le conseil : « ils pensent à eux, pas à toi ». Fin qui reboucle.
- **Ajouté au studio** : les rigs grenouille, lucioles, bulles de pensée et projecteur ; le camouflage et le tremblement du caméléon ; `studio/lumiere.js` (liserés chauds, ombres portées, flaques de lumière) ; Mousse en couleurs claires avec la nouvelle lanterne ; le texte Poppins sur fond translucide avec la pastille violette ; sept temps forts (`hesiter`, `imaginer`, `cacher`, `penser`, `nommer`, `oser`, `conseil`).
- **Ton retour** : en attente.
