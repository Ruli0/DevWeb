# Description du projet et de la vidéo pilote (pour un avis extérieur)

_15 nov. 2026. Ce document décrit le projet et sa première vidéo pour qu'une personne extérieure donne son avis. La vidéo à regarder : « La procrastination », 41 s, format vertical 1080 × 1920._

## 1. Le projet

- **But** : produire des vidéos TikTok de 30 à 60 secondes sur le cerveau et la santé (procrastination, peur du jugement, stress, sommeil…), pour des **adultes de tout horizon**. Chaque vidéo s'appuie sur des études scientifiques.
- **Promesse** : « ton cerveau, expliqué en quelques secondes, études à l'appui ». Une vidéo porte un mécanisme, une étude et un geste concret.
- **L'outil** : un générateur de vidéos écrit en JavaScript (GSAP pour l'animation, Node pour la chaîne, rendu image par image avec HyperFrames). Une vidéo s'écrit en une trentaine de lignes de description, Claude Code faisant office de moteur. Le rendu est déterministe : même description, même vidéo. La musique et les bruitages sont synthétisés par le code.
- **Règle scientifique** : aucun chiffre à l'écran sans fiche de source (référence complète, chiffre exact, limites de l'étude). La source est affichée à l'écran sous chaque chiffre. Mention en fin de vidéo : « information, pas un avis médical ».

## 2. Le chemin parcouru

| Étape | Ce qui a été essayé | Retour de l'auteur |
|---|---|---|
| 1 | Un univers de terrarium : un caméléon, une mouche, un robot jardinier, des métaphores animalières | « un peu trop enfantin… je n'aime pas vraiment les visuels » |
| 2 | Une infographie sobre : fond bleu-noir, typographie, schéma du cerveau au trait, chiffres animés, graphiques | « c'est pas mal mais il y a déjà trop de vidéo comme ça sur TikTok » |
| 3 | Un « cerveau vivant » génératif (réseau de neurones lumineux) | « j'aime mieux les visuels mais… les gens ne participent pas. Je veux plus de dynamisme » |
| 4 | Le format actuel : un **test participatif** joué sur le cerveau vivant, monté sur le rythme | « Oui » |

## 3. La direction actuelle

- **Le personnage, c'est le cerveau** : environ 3 800 neurones et 4 900 liaisons, placés par le code dans la silhouette d'un cerveau de profil, en rendu « constellation » (points fins, liaisons très fines, fond presque noir). Les zones s'allument selon le propos :
  - **orange** (`#ff7a4d`) pour l'alarme : amygdale, insula ;
  - **bleu** (`#8fc4ea`) pour le frein : cortex préfrontal.

  Des impulsions courent sur les liaisons, et la caméra plonge dans une zone ou recule. Le cerveau est légendé « schéma simplifié ».
- **Le format « test »** :
  1. « TEST. » ;
  2. une question du quotidien et deux réponses A et B ;
  3. un compte à rebours 3, 2, 1 ;
  4. la réponse « piège » s'allume ;
  5. la **révélation** dans le cerveau ;
  6. « Et toi ? A ou B ? Dis-le en commentaire », avec une flèche vers les commentaires.

  Le but est que le spectateur réponde dans sa tête, puis en commentaire.
- **Le rythme** : la musique est à 90 BPM et chaque changement d'écran tombe sur un temps, avec un petit coup de zoom. Le cerveau pulse sur chaque temps. Une barre de progression avance en haut. Avant chaque révélation, la musique se tait une demi-seconde, puis on a un flash et un zoom rapide.
- **Typographie** : Space Grotesk (texte), JetBrains Mono (sources, étiquettes). Mot clé en couleur, phrases courtes, lecture lente vérifiée par l'outil.
- **Son** : une musique originale « Labo » (nappe froide, pulsation sourde, tics de pendule) et des bruitages feutrés : impact, souffle, tic, montée.

## 4. La vidéo pilote : « La procrastination »

41,3 s, 60 images par seconde, son à environ −11,5 dB de niveau moyen.

| Temps | Scène | À l'écran | Le cerveau | Le son |
|---|---|---|---|---|
| 0 – 2,7 s | Test | « **TEST.** 3 secondes. » qui claque | Vue large, au repos | Impact |
| 2,7 – 8,7 s | Question | « Dossier à rendre demain. Tu fais *quoi* ? » Cartes : **A** « Je m'y mets maintenant. » · **B** « Je range d'abord mon bureau. » Compte à rebours 3, 2, 1 (vers 6,0 s), puis la carte B s'allume (8,0 s) | L'amygdale s'agite un peu plus à chaque seconde | Souffle, trois tics |
| 8,7 – 16,7 s | Révélation | « Si tu as choisi B : tu fuis un *malaise*, pas le travail. » Étiquette « amygdale, l'alarme » | Flash, zoom rapide dans l'amygdale qui s'embrase en orange, impulsions | Coupure de la musique, puis impact |
| 16,7 – 22,7 s | Chiffre | « jusqu'à **95 %** des étudiants *repoussent* leurs tâches. » Source : Steel, 2007 · Psychological Bulletin | Assombri derrière le chiffre | Impact, souffle |
| 22,7 – 28,7 s | Révélation | « Ranger soulage *tout de suite*. Le dossier, lui, attend. » Étiquette « cortex préfrontal, le frein » | Recul ; l'avant du cerveau s'allume en bleu, l'orange retombe | Coupure, puis impact |
| 28,7 – 34,7 s | Question | « Le plus petit premier pas, c'est *quoi* ? » **A** « Ouvrir le fichier, 2 minutes. » · **B** « Tout planifier avant. » Compte à rebours, B s'allume | Vue large, calme | Souffle, trois tics |
| 34,7 – 41,3 s | Appel | « Et toi ? *A* ou *B* ? Dis-le en commentaire. » Flèche vers les commentaires, « information, pas un avis médical » | Retour au repos | Souffle, tic |

**Le texte du post** : il reprend l'idée (fuir un malaise, préférer le soulagement immédiat) et cite Sirois & Pychyl (2013) et Steel (2007). Le commentaire à épingler est « A ou B ? Réponds honnêtement ».

## 5. Les limites connues

- **Sources non vérifiées dans le texte des articles** : les références sont confirmées par recherche (Steel, 2007, *Psychological Bulletin* 133(1), 65–94 ; Sirois & Pychyl, 2013, *Social and Personality Psychology Compass* 7(2), 115–127), mais pas leurs phrases exactes. La vidéo n'est pas publiable en l'état.
- **Le « 95 % »** est une estimation (80 à 95 % des étudiants) citée dans l'introduction de Steel d'après des travaux antérieurs. Ce n'est pas un résultat de sa méta-analyse. L'auto-déclaration et le public étudiant limitent sa portée.
- **Le rôle de l'amygdale** est une simplification visuelle de « l'émotion qui pousse à fuir ». Il n'a pas de source propre dans la fiche, et le texte à l'écran ne l'affirme pas directement.
- **Aucune donnée d'audience** : rien n'est encore publié, donc toutes les règles de rythme et d'accroche sont des hypothèses.
- **La seconde question** n'est pas suivie d'une révélation : la réponse est laissée au spectateur.

## 6. Questions pour le relecteur

1. **Accroche** : les 2 premières secondes donnent-elles envie de rester ? « TEST. 3 secondes. » est-il assez fort ?
2. **Participation** : le test fait-il vraiment répondre (dans sa tête, puis en commentaire) ? A et B sont-elles des réponses crédibles, pas trop évidentes ?
3. **Science** : le propos est-il juste et sans exagération ? « Tu fuis un malaise, pas le travail » est-il un bon résumé de la recherche sur la procrastination ?
4. **Visuel** : le cerveau vivant se distingue-t-il de ce qu'on voit déjà sur TikTok ? Est-il lisible sur un téléphone ?
5. **Rythme** : 41 s, est-ce trop long pour ce format ? Quelle scène couper ou raccourcir ?
6. **Ce qui manque** : un geste concret plus clair ? Une deuxième révélation ? Une voix off ?
7. **En une phrase** : qu'est-ce que tu changerais en premier ?
