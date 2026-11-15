# Journal des décisions

Chaque décision qui engage la suite, avec sa raison et ce qu'on a écarté. La plus récente en bas.

## 1. Le terrarium comme univers visuel (12 nov. 2026)

- **Décision** : expliquer les concepts d'agents IA avec un vivarium illustré et vivant, pas avec des schémas.
- **Pourquoi** : une identité forte et reconnaissable d'un épisode à l'autre, et des métaphores qui se comprennent sans texte (le bocal pour le contexte, le caméléon pour la boucle d'outils, la dionée pour les hooks, le ruisseau pour le middleware, les fourmis pour les multi-agents).
- **Écarté** : une brigade de cuisine, une mission spatiale, une tour de contrôle, une agence de détectives.

## 2. Un rendu déterministe, image par image (12 nov. 2026)

- **Décision** : chaque vidéo est une seule timeline GSAP en pause, sans minuterie, sans hasard non reproductible et sans répétition infinie.
- **Pourquoi** : c'est la condition d'un rendu image par image fiable, et la même entrée donne toujours la même vidéo.
- **Écarté** : filmer l'écran pendant que la scène tourne (images manquées, résultat différent à chaque fois).

## 3. HyperFrames plutôt que Remotion (12 nov. 2026)

- **Décision** : rendre avec HyperFrames.
- **Pourquoi** : le vivarium est déjà en HTML + GSAP, il passe tel quel. La licence est Apache 2.0, gratuite même pour un usage commercial. L'outil tourne ici, et l'app Claude a un connecteur HyperFrames.
- **Écarté** : Remotion, qui demanderait de tout réécrire en React, avec une licence payante au-delà d'une petite structure. À reconsidérer seulement si on a besoin de son rendu dans le cloud.

## 4. Le scénario JSON comme source unique (12 nov. 2026)

- **Décision** : une vidéo = un fichier `videos/scenarios/<id>.json`. Le site et la vidéo jouent le même scénario.
- **Pourquoi** : versionnable, validable par des tests, facile à écrire pour un humain ou un agent.
- **Écarté** : un format inventé par un agent à chaque demande (impossible à valider ni à rendre de façon fiable).

## 5. Pas de voix off (12 nov. 2026)

- **Décision** : le texte à l'écran porte la narration.
- **Pourquoi** : ton choix. Cela permet aussi une production entièrement automatique, sans enregistrement.
- **Conséquences** : des légendes grosses, découpées en morceaux, minutées selon le temps de lecture, et un son qui repose sur la musique et les bruitages.
- **À revoir si** les chiffres montrent une rétention faible par rapport aux vidéos avec voix.

## 6. Le format TikTok après la revue critique (12 nov. 2026)

- **Constat** : la technique était bonne, mais les vidéos ressemblaient à une leçon. Elles étaient muettes, avec une accroche faible, un titre et un cadre qui mangeaient l'écran, des légendes sous l'interface TikTok, des cartes de code de 9 s illisibles, et aucune boucle.
- **Décision** : 9:16 plein écran, zone sûre, légendes en morceaux animés, accroche en mouvement, révélation en une phrase de 3 s, fin qui boucle, 3 accroches par vidéo, durée de 19 à 25 s.

## 7. Des sons synthétisés par l'outil (12 nov. 2026)

- **Décision** : bruitages, ambiance et musique sont générés par `scripts/build-sons.js`.
- **Pourquoi** : les banques de sons ne sont pas accessibles depuis l'environnement de travail. Synthétiser garantit l'absence de problème de droits, et un résultat identique à chaque fois.
- **Limite** : moins riche qu'un vrai enregistrement.

## 8. Une phonk originale intégrée (12 nov. 2026)

- **Décision** : une boucle phonk originale est mixée dans chaque vidéo, sous les bruitages. L'option `--sans-musique` permet d'ajouter plutôt un son tendance dans TikTok.
- **Pourquoi** : ta demande. Une musique sous droits intégrée au fichier serait coupée ou démonétisée, alors qu'un son tendance ajouté dans l'appli peut aider la diffusion.
- **À tester** : la phonk maison contre un son tendance, sur le même épisode.

## 9. Les nuits du terrarium, racontées par Mousse (13 nov. 2026)

- **Décision** : le compte devient « Les nuits du terrarium ». C'est un vivarium nocturne bioluminescent (style B), gardé par Mousse, un petit robot à lanterne. Ses légendes s'affichent dans son terminal (T6), sur une musique phonk Drift. Chaque épisode a un gag.
- **Pourquoi** : tu voulais un style propre, une âme qui donne envie de s'abonner, et des vidéos divertissantes. Chaque élément a été choisi par toi, sur des propositions concrètes, en plusieurs tours (voir `IDENTITE.md`).
- **Écarté** : néon phonk violet, nuit douce, gros titres détourés, bulle de dialogue, sous-titres mot à mot, phonk sombre et phonk joueuse.
- **Technique** : le thème de nuit est une transformation du dessin à la génération (`nuit.js`), pas un second dessin. Mousse est un calque d'écran (`gardien.js`). Le thème de jour reste disponible.

## 10. Direction artistique de la refonte : les ombres lumineuses (13 nov. 2026)

- **Décision** : le monde est dessiné en silhouettes sombres sur plusieurs plans, avec des contours, des yeux et des taches qui brillent (piste A). Le texte de Mousse s'affiche sans cadre, directement sur l'image (piste B). La mouche est suspendue à un fil (piste C).
- **Pourquoi** : ton choix, après le test des trois pistes sur la même scène. Ce style cache les limites du dessin par code (une silhouette est toujours propre), garde l'identité de nuit, et un nouveau personnage y coûte peu : une forme, un contour lumineux et deux yeux.
- **Écarté** : tout en pixel art (B), et le papier découpé complet (C).

## 11. Le studio construit directement sur la direction A2 (13 nov. 2026)

- **Décision** : le socle du studio (`studio/`) est construit sur le rendu A2, sans passer par l'ancien moteur. Les épisodes sont des données (temps forts en mesures). Un compilateur pur produit une feuille de route, et un lecteur fixe la joue. Aucun code n'est écrit par épisode.
- **Pourquoi** : réécrire « Nuit 1 » sur l'ancien moteur (prévu à l'étape 2 du plan) aurait été jeté avec l'ancien dessin. Séparer les données du code fixe garde le coût d'une vidéo au niveau d'un fichier de quelques dizaines de lignes.
- **Écarté** : générer du code JavaScript par épisode, comme le faisait `build-video.js` ; il est plus fragile et plus coûteux à relire.
- **Leçon technique** : la caméra anime un objet « vue » et réécrit la transformation de chaque calque. Animer `x`, `y` et `scale` des calques faisait dériver l'image, car GSAP prend l'origine dans leur boîte englobante, qui change quand les personnages bougent.

## 12. On arrête l'IA : la série devient « psycho en métaphores » (13 nov. 2026)

- **Décision** : le compte ne parle plus d'IA. Les bêtes du terrarium jouent de petites leçons de psychologie (peur du jugement, procrastination, perfectionnisme, syndrome de l'imposteur), chacune avec un conseil simple.
- **Pourquoi** : ton jugement : l'IA n'est pas un sujet assez viral sur les réseaux, et les épisodes n'apprenaient rien d'utilisable. La psychologie du quotidien est un sujet très partagé, et le caractère des animaux sert la métaphore.
- **Gardé** : l'univers (terrarium, Mousse), le studio, la phonk, la méthode pas à pas. Le style est remis en jeu avec les maquettes S1 à S4.
- **Écarté** : faits d'animaux, mini-série comique, boucles apaisantes.

## 13. V3 : « éditorial scientifique », pour adultes (14 nov. 2026)

- **Décision** : le compte parle du cerveau et de la santé (procrastination, peur du jugement, etc.) à des adultes, en 30 à 60 s, avec un mécanisme, une étude vérifiée et un geste concret. L'univers du terrarium (animaux, Mousse) est archivé. La direction artistique devient typographique et graphique : fond sombre et chaud, un accent de couleur par épisode, schémas au trait, données animées, mouvement lent et net (`DA-V3.md`).
- **Pourquoi** : ton retour : les vidéos étaient trop enfantines et les visuels ne te plaisaient pas ; tu veux pousser l'outil au maximum pour un public adulte.
- **Gardé** : la chaîne du studio (épisode JSON, compilateur, lecteur fixe, aperçu, rendu déterministe), les règles de lecture, la synthèse sonore, la méthode pas à pas.
- **Ajouté** : la règle des sources (`SOURCES.md`) : aucun chiffre à l'écran sans fiche vérifiée, rendu final refusé sinon. Des skills de projet (`.claude/skills/`) pour que Claude Code produise une vidéo en lisant et en dépensant le moins possible.
- **Écarté** : réécrire le rendu en React (React seulement pour une interface d'aperçu, plus tard) ; garder des mascottes « en plus sobre ».

## 14. Style V3 « Laboratoire » (14 nov. 2026)

- **Décision** : la variante V3 de `DA-V3.md` (bleu-noir, grille de points, accent bleu glacier, Space Grotesk seule avec JetBrains Mono). Le mouvement validé : lignes qui montent dans des masques, compteur, trait d'accent qui se transforme en cerveau, sillons qui se dessinent, amygdale qui pulse et signal vers le cortex préfrontal.
- **Pourquoi** : ton choix (« 3 »), puis « C'est bien comme ça » sur le test de mouvement.
- **Où** : `studio/style.js`, `studio/dessins/cerveau.js`, `studio/polices/`.
- **Écarté** : V1 « Encre et ambre » et V2 « Papier de nuit ». Leurs couleurs restent possibles comme accents de thème.

## 15. Musique « Labo » et rythme plus lent (14 nov. 2026)

- **Décision** : la musique A « Labo » (90 BPM, nappe froide, pulsation sourde, tics de pendule), arrangée automatiquement par le montage. Le mouvement est ralenti d'environ 25 % (`studio/style.js`).
- **Pourquoi** : tes réponses « À » et « Continue mais un peu plus lent ».

## 16. Une chaîne V3 à côté de l'ancienne (14 nov. 2026)

- **Décision** : la V3 a ses propres fichiers (`studio/montage.js`, `studio/lecteur.js`, `studio/page-v3.js`, `studio/scenes/`). `npm run video` choisit la chaîne avec `"version": 3`.
- **Pourquoi** : l'ancien compilateur est bâti autour des personnages ; un hybride aurait été plus fragile qu'une chaîne neuve et courte.
- **Reporté** : le déplacement de l'ancienne chaîne dans `archive/terrarium/`, à la fin de l'étape 4, pour ne pas casser ses tests pendant la construction.

## 17. Le format « test » sur le cerveau vivant (14 nov. 2026)

- **Décision** : chaque vidéo est un mini-test participatif (question, A ou B, compte à rebours, révélation, appel à commenter) sur un cerveau vivant génératif (réseau de neurones, rendu « Constellation »), monté sur les temps de la musique.
- **Pourquoi** : tes retours : « il y a déjà trop de vidéo comme ça sur TikTok » (sur l'infographie), puis « les gens ne participent pas, je veux plus de dynamisme », enfin « Oui » sur le test de 12 s.
- **Écarté** : l'infographie seule (trop commune), le dossier d'enquête et la typographie cinétique (non choisis).
- **Où** : scènes `test`, `question`, `revelation`, `appel` ; `studio/reseau/` ; `"format": "test"` dans `studio/montage.js`.

## 18. Une chaîne « avis », la voix d'abord (15 nov. 2026)

- **Décision** : une nouvelle direction, à côté de la V3 : l'auteur parle librement (travail, escalade, relations), l'outil nettoie sa voix, retire les blancs et cale sous-titres et plans sur ses mots. Un seul système graphique, une couleur par rubrique. `"version": 4` dans l'épisode.
- **Pourquoi** : tes mots : « je vais parler librement d'un sujet », avec des visuels « cohérents entre eux » mais « variés ». La valeur ajoutée est ton propos et ta voix, pas le visuel.
- **Écarté** : une voix de synthèse ou clonée (ce ne serait plus toi) ; changer le ton ou les intonations (hors de portée sans service externe).
- **Où** : `scripts/voix.py`, `studio/avis/`, `videos/voix/`, `production/DA-AVIS.md`. Premier épisode : `valeur-ia` (57 s).
