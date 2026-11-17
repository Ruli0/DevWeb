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

## 19. Des décors illustrés plutôt que des aplats (15 nov. 2026)

- **Décision** : les plans importants ont un décor plein écran dessiné (cave du développeur, robot, scène de théâtre), avec ses propres couleurs et de la profondeur. Le texte arrive mot par mot ; dans les sous-titres, le mot en cours est dans une pastille.
- **Pourquoi** : tes mots : « les visuels font trop IA encore », « cave avec pc pour métier développeur, robot pour l'IA et pour le théâtre une scène avec masque et micro », « améliore comment le texte s'affiche ».
- **Écarté** : des images générées (aucun outil gratuit dans la session, et le reproche « trop IA » resterait) ; des banques d'images (réseau fermé, à rouvrir si tu le veux).
- **Reste ouvert** : tes propres photos et vidéos en fond (`"fond": "photo"`), sans doute le meilleur remède.
- **Où** : `studio/avis/decors.js`, `lecteur.js`, `production/PASSATION-AVIS.md`.

## 20. Le style du compte : papier découpé aux couleurs vives (16 nov. 2026)

- **Décision** : le thème `decoupe` devient le style par défaut de toutes les vidéos « avis » : cadre crème, calques du décor avec une ombre nette, couleurs saturées, sous-titres sur une étiquette de papier posée de travers (Bricolage Grotesque), mot en cours dans la couleur de la rubrique.
- **Pourquoi** : tes mots, après les quatre planches : « J'aime bien le papier découpé mais avec des couleurs plus vives comme le 2. Et j'aime bien aussi l'affichage du texte sur le papier découpé. »
- **Écarté** : `neon` (dont on garde seulement la vivacité des couleurs), `feutre`, `affiche`. Ils restent dans `studio/avis/themes.js` et se choisissent avec `"theme"`.
- **Où** : `studio/avis/themes.js` (`decoupe`), valeur par défaut dans `montage.js` et `page.js`.

## 21. La 3D entre dans la chaîne, dans le style papier découpé (16 nov. 2026)

- **Décision** : certains décors ont une version en volume (Three.js), choisie par `--3d` ou `"decors3d": true`. La caméra est pilotée par l'épisode (`"camera"` : tour, spirale, plongée, contre-plongée, zoom, recul, travelling, survol), calée sur les mots. La 3D est rendue en aplats, avec contours et ombres nettes, pour rester dans le style du compte.
- **Pourquoi** : tes mots : « essayons three.js », « on doit faire le projet pour switcher facilement entre nos différentes versions de style », « on pourrait encore plus jouer sur les effets caméra en faisant des tours, des effets plongeants, des zooms », puis « Ahaha j'aime bien ! Comment améliorer ? ».
- **Écarté pour l'instant** : des personnages modelés dans un logiciel 3D (il faudrait ouvrir le réseau vers une banque de modèles) ; la 3D pour tous les décors (seuls `mur3d` et `riziere3d` existent).
- **Coût accepté** : un rendu plus long (4 min pour 20 s en pleine résolution).
- **Où** : `studio/avis/decors3d.js`, `montage.js` (validation, accents, sons), `scripts/sons-v3.js` (`campagne.wav`).

## 22. Image épurée : ni bulle de rubrique, ni écran « Et toi ? » ; 3D douce (16 nov. 2026)

- **Décision** : plus rien en haut de l'image ; la question de fin se pose dans le décor du dernier plan (`"question"`) ; la 3D revient à son premier aspect (éclairage doux), l'aspect en aplats devient une option (`--aspect=decoupe`).
- **Pourquoi** : tes mots : « Enlève la bulle en haut qui spécifie le thème », « À la fin, enlève le Et toi ? ou intègre-le dans le décor », « la qualité de l'image est un peu dégradée, c'était plus joli avant ».
- **Gardé de l'essai précédent** : la scène enrichie, les nouveaux mouvements de caméra, l'ambiance sonore, la pleine résolution.
- **Où** : `studio/avis/page.js`, `montage.js`, `lecteur.js`, `decors3d.js` ; les quatre épisodes sont convertis.

## 23. L'accroche est vérifiée par l'outil ; la passation est exécutable (16 nov. 2026)

- **Décision** : le montage donne des conseils sur les deux premières secondes (sans jamais bloquer), le premier plan a son texte et son sous-titre en place dès la première image et s'ouvre sur un zoom ; `production/ACCROCHES.md` sert de guide. Une session neuve se prépare avec `scripts/installer.sh`, et la section 0 de la passation suffit pour fabriquer une vidéo.
- **Pourquoi** : tes questions : « Comment faire de meilleurs hooks pour la rétention ? » et « Est-ce que je peux passer la main à Opus pour faire les vidéos ? ».
- **Limite assumée** : aucune donnée d'audience ; les seuils (12 mots, 4 s, 45 s) sont des points de départ à corriger avec tes chiffres.
- **Vérifié** : essai à blanc depuis un dossier propre, jusqu'au MP4 de l'énigme.

## 24. Le personnage au bonnet, avec parcimonie ; la musique du compte écartée (16 nov. 2026)

- **Décision** : le personnage récurrent a l'allure « bonnet » et n'apparaît, par défaut, qu'à l'ouverture et à la fin d'une vidéo. La musique du compte et son indicatif ne sont plus le réglage par défaut : retour à « Labo ».
- **Pourquoi** : tes mots : « Je n'aime pas la musique. Le personnage 1, mais il ne faut pas qu'il reste trop souvent à l'écran. »
- **Gardé** : la musique qui baisse quand tu parles, les bruitages des décors.
- **Ouvert** : ce qui te déplaît dans la musique (mélodie, sonorité, ou le fait qu'il y en ait une). Tant que ce n'est pas clair, on ne propose pas une nouvelle musique à l'aveugle.
- **Où** : `studio/avis/style.js` (`musique`, `personnage`), `montage.js`.

## 25. La mascotte est un hibou ; la musique : un fond rond et constant (16 nov. 2026)

- **Décision** : le hibou remplace le personnage humain comme repère du compte (mêmes poses, mêmes places, toujours peu présent). Pour la musique, la piste retenue à ce stade est `house-plate` avec une basse ronde ; le défaut reste `labo` tant que tu n'as pas dit oui.
- **Pourquoi** : tes mots : « Je verrais plus un hibou qu'un personnage pour la référence » et « Juste le fond, pas le klaxon ».
- **Écarté** : les trois allures humaines ; la basse en dent de scie ; les montées, la pompe et les effets.
- **Où** : `studio/avis/personnage.js` (`hibou`, `placer`), `style.js`, `scripts/sons-avis.js`.

## 26. Musique validée ; le hibou est en verre et petit (16 nov. 2026)

- **Décision** : `house-plate` (boucle régulière, grosse caisse, charley, basse ronde) est la musique de toutes les vidéos. Le hibou est transparent comme du verre, petit, et vole sur place juste au-dessus des sous-titres.
- **Pourquoi** : tes mots : « La musique est parfaite. Fais le hibou couleur verre transparent et plus petit. »
- **Où** : `studio/avis/style.js` (`musique`), `studio/avis/personnage.js` (`hibou`, `placer`).

## 27. L'ASCII est écarté ; des palettes à choisir (17 nov. 2026)

- **Décision** : l'aspect ASCII (essayé le 16 nov.) est retiré du code. À la place, six palettes de couleurs sont proposées sur des planches ; le défaut reste la palette actuelle jusqu'à ton choix.
- **Pourquoi** : tes mots : « En réalité je n'aime pas le style ASCII. Propose d'autres palettes et je choisis ! »
- **Écarté** : le rendu en caractères, en couleur comme en vert.
- **Où** : `studio/avis/palettes.js`, `--palette=` dans `scripts/video.js`, `"palette"` dans l'épisode.

## 28. Palette « coucher de soleil » et texte toujours droit (17 nov. 2026)

- **Décision** : `coucher` est la palette de toutes les vidéos. Plus aucun texte n'est incliné (étiquettes de sous-titres, question de fin, mots des titres), ni au repos ni à l'arrivée ; les mots à venir d'un sous-titre passent de 32 % à 50 % d'opacité.
- **Pourquoi** : tes mots : « J'aime la palette 3. […] Le fait que ça soit penché rend le texte difficile à lire. »
- **Écarté** : l'alternance de pente d'une étiquette à l'autre, qui donnait un effet « papier posé de travers ».
- **Où** : `studio/avis/style.js` (`palette`), `themes.js`, `lecteur.js` ; un test interdit toute rotation sur du texte.
