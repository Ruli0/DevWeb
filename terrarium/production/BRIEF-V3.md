# Brief V3 : des vidéos « cerveau et santé » pour adultes

_Écrit le 14 novembre 2026. C'est le prompt de recadrage du projet. Il se lit seul. Les détails sont dans `DA-V3.md` (direction artistique), `PLAN-V3.md` (étapes) et `SOURCES.md` (règle scientifique)._

## Ta mission

Tu reprends un outil de production de vidéos TikTok, dans `terrarium/`. Tu dois le transformer en **générateur de vidéos de 30 à 60 secondes, pour des adultes de tout horizon, sur le cerveau et la santé** : procrastination, peur du jugement, sommeil, stress, habitudes, attention.

Chaque vidéo tient en trois choses : **un mécanisme** (ce qui se passe dans le cerveau), **une étude** (un chiffre vérifié, avec sa source à l'écran) et **un geste** (une action concrète et réaliste).

La promesse du compte : « ton cerveau, expliqué en 45 secondes, études à l'appui ».

## Ce qui change

Les versions précédentes mettaient en scène des animaux dans un terrarium (caméléon, grenouille, lucioles, robot à lanterne). L'utilisateur les juge **trop enfantines** et n'aime pas les visuels. Tout cet univers est **archivé** : ne le réutilise pas, ne le fais pas évoluer.

| Abandonné | Remplacé par |
|---|---|
| Mascottes, animaux, gros yeux, bulles de pensée | Typographie, schémas au trait, données animées, formes abstraites |
| Couleurs fluo, contours lumineux | Fond sombre et chaud, une seule couleur d'accent par épisode |
| Phonk agressive | Nappe et pulsation sobres |
| Métaphores animalières | Le mécanisme réel, montré simplement |
| Sujets d'IA | Cerveau, psychologie, santé du quotidien |

## Ce que tu gardes (c'est solide, ne le refais pas)

- **La chaîne** : un épisode JSON, compilé en feuille de route, jouée par un lecteur fixe dans une page HyperFrames, rendue en MP4.
  - `studio/compiler.js` : fonction pure, qui suit l'état de la scène et refuse les épisodes invalides ;
  - `studio/runtime.js` : le lecteur (une timeline GSAP en pause, déterministe) ;
  - `studio/page.js` : la page et les sons ;
  - `scripts/video.js` : la commande unique `npm run video -- <id> [--rendu]` ;
  - `scripts/apercu.js` : une planche d'images clés en 15 s, sans rendu.
- **Les règles de lecture** : 0,45 s par mot et 0,8 s par morceau de texte ; au plus 34 caractères par morceau ; toutes les lettres sont dans la page dès le début, pour que rien ne se décale.
- **Le rendu** : 1080 × 1920, 60 images par seconde, zone sûre TikTok (x de 60 à 940, y de 150 à 1440).
- **La synthèse sonore** : `scripts/build-sons.js` fabrique des sons et des musiques en Node, sans fichier externe.
- **Les tests** (`npm test`) et **le carnet** (`production/`).
- **La méthode** : voir « Comment travailler » plus bas.

## La direction artistique, en bref

Elle s'appelle « **éditorial scientifique** » : l'esprit des infographies animées des grands médias et des keynotes. Lis `DA-V3.md` en entier avant de dessiner quoi que ce soit.

- **Fond** sombre et chaud, avec un grain léger. Jamais de noir pur.
- **Une seule couleur d'accent par épisode**, plus un blanc cassé.
- **La typographie est le personnage principal** : une serif éditoriale pour les phrases, une grotesque pour les données, des chiffres géants.
- **Des images précises** : cerveau au trait fin dont les zones s'allument, courbes et barres qui se dessinent, formes géométriques pour les idées abstraites.
- **Un mouvement lent et net** : ça se dessine, ça se transforme, ça glisse. Rien ne rebondit.
- **La source à l'écran**, en petit, à chaque chiffre.

Le niveau visé est celui d'une production de studio. **Sois ambitieux** : pour l'instant, la priorité est la qualité visuelle, pas l'économie.

## Pousser l'outil au maximum

- **GSAP 3.15 est installé avec tous ses modules** (`node_modules/gsap/dist/`) : SplitText, DrawSVGPlugin, MorphSVGPlugin, CustomEase, MotionPathPlugin, Flip. Ils sont tous gratuits. Sers-t'en : texte animé par ligne et par mot, tracés qui se dessinent, formes qui se transforment l'une en l'autre, courbes d'animation sur mesure.
- **Une bibliothèque de scènes** remplace les personnages (`studio/scenes/`). Chaque scène est une brique paramétrable : titre, chiffre géant, cerveau, mécanisme en étapes, graphique, comparaison, source, geste, boucle. Le détail est dans `DA-V3.md`, section 6.
- **Des transitions travaillées** : une forme d'une scène devient un élément de la suivante.
- **React** : seulement pour une interface d'aperçu, plus tard (étape 5 du plan). Ne réécris pas le rendu en React.

## La rigueur scientifique (non négociable)

Lis `SOURCES.md`. La règle : **aucun chiffre et aucune affirmation scientifique à l'écran sans fiche de source vérifiée**.

- Tu vérifies chaque étude par une recherche. Tu n'inventes jamais une référence, un chiffre ou une citation.
- Tu ne l'arrondis pas en silence, et tu n'en tires pas plus que ce qu'elle montre.
- Le compilateur refuse un épisode sans fiche de sources complète.
- Pas de promesse de guérison ni de conseil médical. Mention discrète en fin de vidéo : « information, pas un avis médical ».

## Claude Code comme moteur, à bas coût

Le but final est un générateur piloté par Claude Code qui dépense peu de tokens par vidéo. Des **skills de projet** existent dans `.claude/skills/` : `/episode`, `/sources`, `/apercu`, `/rendu`, `/scene`, `/style`. Utilise-les, et tiens-les à jour quand la chaîne change.

Trois règles d'économie :
- **Lis le moins possible.** Pour écrire un épisode : le skill `/episode` et `production/CATALOGUE.md`. Pas le moteur.
- **Laisse les scripts faire le travail mécanique** : compiler, contrôler, faire la planche.
- **Regarde la planche avant tout rendu.** Un rendu de 45 s prend plus de 10 minutes.

## Comment travailler

1. **Une étape à la fois**, dans l'ordre de `PLAN-V3.md`. À la fin de chaque étape, tu montres quelque chose et tu poses **une seule question**.
2. **Une image avant une vidéo.** Des maquettes fixes, puis un test de mouvement court, puis seulement une vidéo complète.
3. **Plusieurs tours sont normaux.** L'utilisateur répond en une ligne ; à toi de traduire. Ne refais que ce qu'il a commenté.
4. **L'utilisateur est sur iPhone.** Envoie les images et les MP4 comme fichiers. Écris-lui en français, simplement.
5. **Note chaque tour** dans `production/IDENTITE.md` (ce qui est montré, son retour mot pour mot, ce qui change), et les décisions dans `DECISIONS.md`.
6. **Avant de rendre la main** : `npm test` vert, planche regardée, carnet à jour, commit et push sur la branche de travail. Pas de pull request sans demande. Aucun identifiant de modèle dans les fichiers du dépôt.

## Par où commencer

1. Lis `DA-V3.md`, `PLAN-V3.md` et `SOURCES.md`.
2. Lis `GUIDE-EXECUTION.md` (commandes, rendu déterministe, pièges déjà rencontrés).
3. Commence l'**étape 1** de `PLAN-V3.md` : les maquettes de style.
