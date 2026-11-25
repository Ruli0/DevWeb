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

## 29. Les photos de l'auteur : hors du dépôt, sans métadonnées, détourées en local (17 nov. 2026)

- **Décision** : les photos vivent dans `videos/medias/`, ignoré par git ; elles sont copiées sans métadonnées (position GPS) ; le détourage tourne en local (BiRefNet lite, MIT) : la photo ne quitte pas la machine.
- **Pourquoi** : tu as envoyé ta première photo (Fontainebleau). Une photo de téléphone porte souvent sa position ; le dépôt GitHub n'est peut-être pas privé.
- **Ouvert** : à quel traitement tu donnes la préférence (fond, autocollant, ou les deux) ; si le dépôt est privé (la photo pourrait alors y être enregistrée, pour qu'une session neuve la retrouve).
- **Où** : `.gitignore`, `scripts/decouper.py`, `studio/avis/page.js`, `montage.js`, `lecteur.js`.

## 30. Contrôle de l'image et kit de publication (17 nov. 2026)

- **Décision** : `--controle` signale sans bloquer (texte hors zone sûre, sur le visage du hibou, illisible, plan vide) ; `--publier` rend en 60 i/s et écrit `publication.md`, mais refuse tant qu'une clé `"_a_ecrire"` ou une voix maquette subsiste.
- **Pourquoi** : le modèle ne peut ni écouter ni tout regarder ; ces garde-fous évitent d'envoyer une vidéo avec une question de fin provisoire.
- **Écarté** : bloquer sur le contrôle d'image (trop de faux positifs possibles).
- **Où** : `scripts/controle.js`, `scripts/publier.js`, `scripts/video.js`.

## 31. Le prompteur est un Artifact (17 nov. 2026)

- **Décision** : page hébergée (Artifact) générée par `scripts/prompteur.js`, appelée par `/prompteur` ; défilement au rythme de 150 mots par minute réglable ; enregistrement dans la page si le micro est accordé, sinon dépôt d'un fichier Dictaphone ; l'audio part dans `assets` sous un type mp4 ou webm.
- **Pourquoi** : le conteneur n'est pas joignable depuis le téléphone ; un Artifact l'est.
- **Écarté** : serveur local (injoignable), dictée (`dictation`) qui ne rend que du texte.
- **Ouvert** : le micro dans le cadre de l'Artifact n'a pas été éprouvé sur un téléphone.

## 32. Une orbe de verre qui suit la voix (18 nov. 2026)

- **Décision** : orbe (sphère dégradée, halo, reflet, étincelles) au-dessus des sous-titres, aux couleurs de la palette ; son niveau vient des instants des mots (attaque 80 ms, descente 250 ms), appliqué par un tween piloté par le temps. Retirée par `"orbe": false`, absente du plan de la question.
- **Pourquoi** : tu as montré l'orbe d'un assistant vocal ; elle montre qui parle sans texte de plus.
- **Écarté** : mesure de l'amplitude audio (les mots suffisent et restent exacts après les coupes) ; bleu de la photo (tu as choisi la palette coucher).
- **Ouvert** : elle recouvre le centre de certains décors (le paysan de dos) ; à juger sur pièce.

### Mise à jour du 18 nov. (même décision)

- L'orbe est maintenant dessinée sur un canevas (halo lumineux, nappes de lumière dans le verre, 150 particules en gravitation : plus elles sont près, plus elles vont vite, et la voix les repousse). Son niveau vient désormais de l'énergie réelle de la voix montée, mesurée 60 fois par seconde (`niveauxAudio`), avec repli sur les mots. L'essai se fait sur `essai-orbe` (fond `nuit`, voix de `pov-paysan`).

## 33. L'orbe se déplace et bouge plus doucement (18 nov. 2026)

- **Décision** : un emplacement par plan (`orbe.trajet` : milieu, ou garée en haut à droite selon le décor, la question, l'illustration ou un titre géant), glissement de 0,9 s à la transition ; réglable par plan. Niveau de voix lissé en deux passes (montée 0,12 s, descente 0,45 s), ondulation et particules plus lentes, vitesse indépendante de la voix : seule l'amplitude suit.
- **Pourquoi** : au centre elle cachait la tête du robot ou le sujet du décor, et elle battait chaque syllabe (« trop rapide et nerveux »).
- **Écarté** : la cacher dans le plan de la question (elle se gare à côté) ; un réglage de fluidité (valeurs fixes).
- **Où** : `studio/avis/orbe.js` (`SPOTS`, `PLACES_ORBE`, `trajet`, `position`), `montage.js`, `lecteur.js`, `scripts/controle.js`.

## 34. Un format « jeu » : le mot fléché (18 nov. 2026)

- **Décision** : plan `grille` : trois mots qui se croisent révélés toutes les 5 s environ (facile, moyen, difficile), définitions écrites dans des cartes numérotées avec flèche et dites par l'orbe, barre à trois paliers (singe, homme classique, Molière) sous la grille, au-dessus des sous-titres ; orbe garée à droite de la grille ; voix clonée d'abord.
- **Pourquoi** : ton idée du 18 nov. ; un jeu invite à commenter son score et se répète en série.
- **Écarté** : la barre en haut (ta règle « rien en haut ») ; la définition dans la case seule (trop petite à 80 px) : des cartes à droite, numérotées comme les cases de départ.
- **Piège** : les pauses ne s'insèrent qu'aux silences réels de la voix ; il faut en créer dans une voix générée.

## 35. Jeu v2 : cadence de 15 s, minuteur, musique originale (19 nov. 2026)

- **Décision** : une réponse toutes les 15 s (silences calculés par le montage), minuteur discret par tranche, révélation lettre par lettre avec étincelles venues de l'orbe, courte intro (« indicateur de ton intelligence conversationnelle »), musique originale « Rêverie ».
- **Pourquoi** : ta demande du 19 nov. ; 15 s laissent réellement le temps de chercher.
- **Écarté** : utiliser *Call it what you like* (protégé par des droits d'auteur, et je ne peux pas écouter) : une ambiance originale à la place ; tu peux ajouter le morceau voulu depuis la bibliothèque de TikTok à la publication.
- **Réserve** : la formule « indicateur de l'intelligence conversationnelle » n'a pas de source ; à présenter comme un jeu (rappel dans `publication.md`).

## 36. Les cases du mot cherché s'illuminent (19 nov. 2026)

- **Décision** : pendant la tranche d'un mot, ses cases vides (hors croisements déjà révélés) s'illuminent en vague puis respirent ; la carte de l'indice est entourée d'un liseré ; tout s'éteint juste avant les étincelles de la révélation.
- **Pourquoi** : « sinon on ne sait pas où regarder pour commencer ».
- **Où** : `studio/avis/plans.js` (plan `grille`), `studio/avis/grille.js` (style).

## 37. Deuxième grille : cinq mots, six croisements, 10 s par mot (20 nov. 2026)

- **Décision** : `jeu-culture` (langue et littérature) : ROMAN, TEXTE, PIÈCE, CONTE, PROSE (le dernier, « Monsieur Jourdain en faisait sans le savoir », fait écho à Molière) ; grille 5 × 6 trouvée par une recherche en échelle ; 10 s par mot pour tenir 57 s ; paliers Singe → Académicien → Hugo.
- **Pourquoi** : ta demande de plus de mots et de croisements ; 5 × 15 s dépasserait les 75 s.
- **Écarté** : un solveur général sur des grilles denses (rendues illisibles par des mots collés) ; l'adaptation de la taille des cases (inutile pour une grille 5 × 6).

## 38. Mots fléchés v4 : plein écran, papier découpé, sons, orbe sous tension, difficulté croissante (20 nov. 2026)

- **Décision** : bandeau d'indice unique, grille pleine largeur, fond de papiers superposés, cases de papier découpé à bords irréguliers, une couleur par mot, tampon, bruitages synthétisés, orbe garée à gauche du bandeau avec une tension dans les trois dernières secondes ; nouvelle grille `jeu-langue` (LIRE, TITRE, AUTEUR, PARODIE, VOLTAIRE) dont les lettres à deviner passent de 4 à 6 ; paliers Singe → Académicien → Voltaire.
- **Pourquoi** : tes quatre questions (place, attrait, orbe, difficulté) : la grille n'occupait que la moitié gauche, le fond était uni, il n'y avait aucun bruitage, et les derniers mots étaient les plus faciles (3 lettres déjà visibles).
- **Écarté** : une main de papier qui écrit ; cahier et crayon ; magazine de mots fléchés (proposés, non retenus : tu as choisi le papier découpé) ; les cinq cartes d'indice empilées.
- **Limite** : `jeu-moliere` reste un peu en dessous (cases de 77 px, 8 lignes) ; à regrouper en 6 lignes si on le refait.

## 39. Mots fléchés v5 : grille agrandie, décor thématique, jeu plage (21 nov. 2026)

- **Décision** : grille de y 490 à 1260 sur toute la largeur ; barre de progression déplacée sous les sous-titres, sur une bande de papier lisible sur tous les fonds ; décor en papier découpé en bas de l'écran (`livres`, `plage`) ; `jeu-langue` refait ; `jeu-plage` : COCO, SOLEIL, CORAIL, MANGROVE, ARCHIPEL (4, 5, 5, 6, 6 lettres à deviner), paliers Touriste → Marin → Robinson.
- **Pourquoi** : « grossir la grille, trop de partie inutilisée en bas, un décor sur le thème ».
- **Écarté** : le mot EAU (la voix clonée le lit « tôt » ou « tout ») et un voilier posé sur le sable (remplacé par un parasol).
- **Piège** : une voix générée lit mal les mots très courts ; choisir des mots d'au moins quatre lettres pour les jeux.

## 40. Décors d'origine animés (22 nov. 2026)

- **Décision** : retour aux décors `plage` et `livres` ; ajout d'animations d'ambiance (vagues qui bougent derrière, crabe qui sort de l'écran, dauphin qui saute ; souris, livres qui sautent, avion en papier pour les livres), programmées à des instants fixes. Les six maquettes plus sobres restent dans le code, non utilisées.
- **Pourquoi** : « je préférais les décors d'avant » ; l'animation donne la vie sans changer le style.
- **Écarté** : lier les animations à la voix (inutile, et cela compliquerait les ancres) ; des boucles infinies (interdites par le moteur).

## 41. La réponse n'est jamais affichée avant la voix (22 nov. 2026)

- **Décision** : marge de 0,5 s entre la fin de la phrase de réponse et la première lettre ; dates de mots recalées sur les silences ; transcription phrase par phrase (Whisper dérivait de plusieurs secondes sur une piste à longs blancs) avec le script comme amorce ; vérification du mot dit, de la définition et de l'isolement de la réponse au montage ; `verifier-voix.js` sur le signal réel, bloquant à la publication ; `voix-choisir.py` pour choisir et couper les prises.
- **Pourquoi** : « ça affiche la réponse avant [la voix] » : la lettre se posait 0,5 s après le début du « c'est », donc pendant la prononciation, et les dates de mots étaient parfois fausses.
- **Écarté** : décaler seulement les étincelles (la lettre restait trop tôt) ; faire confiance aux dates Whisper sans les confronter au signal.
- **Limite** : je ne peux pas écouter la voix ; la mesure se fait sur l'énergie du signal. Les deux anciens jeux ne passent pas ces contrôles et sont marqués `"voixVerifiee": false`.

## 42. Jeu muet et première semaine de publication (22 nov. 2026)

- **Décision** : un mode muet pour les jeux (texte, musique, bruitages, orbe sur la musique) pour comparer avec la version parlée ; puis publier avant de développer davantage (`PLAN-PUBLICATION.md`).
- **Pourquoi** : tu as demandé si ça marche sans voix ; beaucoup regardent sans le son, et rien n'est encore publié : tous les choix de la chaîne sont des paris. Ma réserve : on s'était éloigné de ta valeur ajoutée (ta voix, tes opinions).
- **Écarté** : continuer le polissage des décors et des animations sans chiffres.
- **Règle** : plus de nouvelles fonctions de montage avant le premier relevé à 48 h, sauf correction de bug.

## 43. Premier relevé : accroche immédiate et version courte (22 nov. 2026)

- **Constat** : première capture TikTok Studio du jeu muet (moins de 100 vues) : la plupart des spectateurs partent à 0:01, plus personne après 0:25.
- **Décision** : `jeu-plage-muet-court` : titre fixe en haut dès la première image, premier indice et minuteur à 0,67 s, trois mots de 8 s, 28 s au total (option de plan `muet.titreFixe`, `muet.tempo`). À comparer à la version longue.
- **Réserve** : moins de 100 vues, probablement les nôtres : ne pas conclure sur ce seul relevé.

## 44. Jeu « mot par mot » sur fond dégradé violet → noir (20 nov. 2026)
Demande de Jules : plus dynamique, une seule suite de cases à la fois avec la question en gros, plus de sable ni de décor. Option de plan `"affichage": "progressif"` + décor `degrade` (grille.js `dims(g, prog)`, plans.js, jeu-decors.js). Les cases d'un mot arrivent (pop) au début de sa fenêtre ; l'ancien affichage reste le défaut. Écarté : zoom caméra (sparks plus complexes), à reprendre si besoin. Épisode : `jeu-mots-violet`.

## 45. Variante « espace » du jeu progressif (20 nov. 2026)
Option de plan `"animation": "fusee"` (défaut : bonhomme qui danse puis scène en flammes) et décor `espace` (bleu nuit étoilé). Fusée : au sol, allumage au mot 2, décollage + étoiles filantes au dernier mot. Épisode `jeu-mots-espace` (LUNE, ETOILE, PLANETE). Le bonhomme du jeu précédent finit désormais en flammes (sueur, chaleur, flammes, braises).

## 46. Série « mot par mot » : 10 thèmes (20 nov. 2026)
Catalogue d'animations à 3 niveaux (`danse`→flammes, `fusee`, `volcan`, `robot`, `vague`) et de fonds dégradés (`espace`, `ocean`, `jungle`, `desert`, `banquise`, `ville`, `foret`, `volcans`, `abysses`, `cuisine`), choisis par `"animation"` et `"decor"` dans le plan grille progressif. Épisodes `jeu-mots-<thème>` (3 mots croisés, de l'indice le plus facile au plus dur). Rythme conseillé : 1 par jour, relevé à 48 h pour garder les thèmes qui marchent.

## 47. Fin « teaser », musique qui s'excite, premier mot très facile (20 nov. 2026)
Suite au relevé du 20 nov. (visionnage moyen ~55 %, 0 interaction) : (1) option de plan `"teaser": {texte, n}` : après le dernier mot, la grille s'efface et une nouvelle question facile arrive avec ses cases vides et son minuteur ; la vidéo coupe avant la réponse et reboucle sur la première question (`muet.fin` 5,8 s) ; (2) la musique Rêverie prend des `paliers` (mot 2 et mot 3, comme l'animation) : nappes et cloches rares, puis pouls et arpège, puis croches, charleston, basse et cloches doublées, avec une montée de souffle avant chaque palier ; (3) le premier indice est le plus facile possible (ex. « Au clair de la ... »). Appliqué aux 10 épisodes `jeu-mots-*`.

## 48. Trois ambiances de plus pour le jeu : arcade, lofi, epique (20 nov. 2026)
Même principe que Rêverie (3 niveaux selon `paliers`), choisies par `"musique"` dans l'épisode ; extraits d'écoute dans `videos/studio/musiques-demo/` (30,5 s, paliers à 9,27 s et 17,27 s). Mesure : le volume moyen monte de -29/-23/-22 dB (niveau 0) à -18/-17/-16 dB (niveau 2) pour arcade/lofi/epique ; Rêverie reste quasi plate (-17,8 → -17,4 dB). Le choix se fait à l'oreille (Jules).

## 49. Finale spectaculaire avant la question mystère ; musique Rêverie dynamique retenue (20 nov. 2026)
Jules garde Rêverie (108 bpm, pouls et charleston dès la 1re seconde). Chaque animation a un finale 2,4 s après la dernière réponse (quand les lettres ont fini de tomber) : fusée qui décolle et sort de l'écran, volcan en grande éruption (éclair, jets de lave), bonhomme qui saute les bras en l'air dans des flammes géantes, robot qui gonfle puis explose en éclat blanc et fait une vrille, bateau soulevé par une vague géante. La question mystère arrive 5,6 s après la dernière réponse (`teaser.delai`), la vidéo dure 34,3 s (`muet.fin` 9,6). Les éclairs couvrent tout l'écran (rect étendu).

## 50. Ouverture accrocheuse après le relevé 2 h (visionnage moyen 2,6 s) (20 nov. 2026)
Options de plan : `"premiereLettre": true` (la 1re lettre du 1er mot est déjà posée), question visible dès l'image 0, cases du 1er mot qui claquent une à une avec un « pop » (son) dès 0,02 s, zoom d'entrée de la caméra (1,12 → 1 en 0,7 s) ; `muet.intro` 0,3 s, `cadence` 5 s au lieu de 8 (durée 24,9 s). Appliqué aux 10 épisodes. À mesurer : visionnage moyen et % de vision complète (le seuil à battre : 2,6 s / 2,59 %). Écarté pour l'instant : aperçu du finale en ouverture (à tester seul).

## 51. Des scènes dans le thème, sans personnage (21 nov. 2026)
Jules ne veut plus de bonhomme ni de robot qui danse : l'animation du bas doit illustrer le thème. Quatre nouvelles scènes à trois niveaux + finale (`jeu-decors.js`) : `iceberg` (banquise : il flotte, neige et aurore, un bloc se détache et plonge), `immeubles` (ville : les immeubles poussent, fenêtres qui s'allument, taxi, projecteurs, feu d'artifice), `foret` (arbres qui poussent, cimes qui virent à l'automne, rafale de feuilles), `marmite` (cuisine : mijote, bout, déborde, le couvercle saute). `danse` et `robot` restent dans le code mais ne servent plus. Jungle (déjà publiée) inchangée. Banquise : ESQUIMAU remplacé par EMPEREUR (terme jugé daté) ; ville : question de fin « La ville qui ne dort jamais ».

## 52. Format court de 15,7 s (21 nov. 2026)
Après 5 publications identiques (~500 vues, 1-2 likes, ~5 s, ~6 % de vision complète ; l'oasis 8 likes), test du format court : `muet.cadence` 3 s, `finaleDelai` 2 s, `teaser.delai` 4 s, `muet.fin` 6,4 s (épisodes `jeu-mots-<thème>-court`). Une seule variable change par rapport aux longues (la durée). Seuil à battre : ~6 % de vision complète et ~5 s de visionnage moyen. Écarté pour l'instant : sujets d'actualité (à tester ensuite, culture pop plutôt qu'actu brute).

## 53. Série « culture pop » en format court (21 nov. 2026)
Pour comparer avec la série nature/lieux : quatre vidéos de 15,7 s sur des sujets qui se commentent, avec des scènes dans le thème (`jeu-decors.js`) : `vinyle` (musique : disque, barres d'égaliseur, notes, projecteurs, finale disque emballé), `cinema` (bobine, faisceau, étoiles, finale statuette dorée), `stade` (ballon, projecteurs, tribunes, finale tir au but et confettis), `blocs` (blocs qui tombent et s'empilent, finale lignes complètes). Épisodes `jeu-mots-{musique,cinema,sport,jeux}-court` ; questions mystère : PIANO, ACTION, ARBITRE, VIES. Hypothèse : plus de commentaires que la série précédente (~1-2 likes, ~500 vues). Écarté : actualité (à tester après).

## 54. Vidéo « fromage » (21 nov. 2026)
Demande de Jules : fondue, raclette, tartiflette. TARTIFLETTE (11 lettres) est horizontale (11 colonnes × 8 lignes), RACLETTE croise son A, FONDUE son F (case donnée). Scène `fondue` (caquelon, bulles, fourchette qui trempe, finale : grand étirement du fromage puis gouttes dorées), fond `fromage`. Question mystère : EMMENTAL. `finaleDelai` 2,6 s et `teaser.delai` 4,6 s car TARTIFLETTE pose 9 lettres ; durée 16,3 s. Épisode `jeu-mots-fromage-court`.

## 55. Version « rareté » pour un son TikTok (21 nov. 2026)
Jules veut caler les mots fléchés sur un son TikTok en vogue (« rare, super rare, legendary », 37 s, départ à 0 s). Je ne peux ni écouter ni intégrer le son (licence) : la vidéo est rendue **sans musique ni bruitages** (`musique: aucune`, `reglages.bruitages: 0`) et Jules ajoute le son dans l'appli. Nouvelles options : `muet.reponses` (instants exacts des réponses, ici 11 / 22 / 30 s, à ajuster sur le son) et `rarete.couleurs` (bleu, violet, or : halo plein écran à chaque mot, rayons dorés au dernier). Épisode `jeu-mots-loot` (thème jeux vidéo, 37 s). Instants de départ = hypothèse, à recaler avec les vrais temps du son.

## 56. Version rareté : un mot toutes les 5 s (21 nov. 2026)
Jules veut un mot toutes les 5 secondes : `jeu-mots-loot` passe à 6 mots (PERSONNAGE en épine, croisé par BOSS, PIXEL, NIVEAU, ARCADE, LEGENDE), réponses à 5,3 / 10,3 / 15,3 / 20,3 / 25,3 / 30,3 s, finale à +2,4 s, question mystère MANETTE à +4,6 s, 37,0 s au total. `rarete.couleurs` accepte N teintes (gris, vert, bleu, violet, or, orange-rouge), halo croissant, rayons dorés sur les deux derniers mots. Toujours sans musique ni bruitages (le son TikTok est ajouté dans l'appli) ; calage sur les vrais temps du son à faire avec Jules.

## 57. Prochaine vidéo à poster : « Désert » rareté, un mot toutes les 5 s (22 nov. 2026)
Après la baisse de portée (~150 vues, 1 like), on ne poste pas une vidéo de plus de la même série : une seule vidéo qui combine ce qui a le mieux marché (le désert, premier mot imagé OASIS, 8 likes) et les nouveautés voulues par Jules (6 mots, un toutes les 5 s, couleurs de rareté, son TikTok « rare / super rare / legendary » ajouté dans l'appli). Épisode `jeu-mots-desert-rarete` (37 s, sans musique ni bruitages) : épine DROMADAIRE croisée par OASIS, DUNE, SABLE, CARAVANE, MIRAGE ; question mystère SCORPION ; scène `dunes` (soleil, vent, tempête de sable, finale : la tempête se dissipe sur une oasis). Temps du son à recaler avec Jules.

## 58. Test d'ouverture : phrase d'accroche en gros (22 nov. 2026)
Les courbes de fidélisation du désert (rareté) et du loot sont identiques : ~50 % des spectateurs partent en moins de 2 s, ~10 % restent à 7 s ; trafic « Pour toi » à 94-95 %. Le goulot est l'ouverture, pas la durée ni le thème. Option de plan `accroche {texte, duree}` : phrase de défi en très gros (128 px) dès l'image 0, puis fondu à 2 s et arrivée de la question du mot 1 (`muet.intro` 2,0). Phrase honnête, sans statistique inventée : « Tu trouves les 3 mots ? ». Épisode `jeu-mots-musique-accroche` (copie de `jeu-mots-musique-court`, un seul changement). Mesure : % restant à 2 s (réf. ~50 %) et à 7 s (réf. ~10 %), visionnage moyen (réf. ~5 s). La règle « seul texte = la question » est suspendue pour ce test.

## 59. Voix de Jules sur un jeu muet (22 nov. 2026)
Pour le test d'ouverture, Jules enregistre 5 phrases (accroche, 3 indices, question mystère) en une seule prise ; la prise est découpée par silences, débruitée (`afftdn`), normalisée (-18 LUFS, crête -3 dB) en `videos/voix/<id>/ligne-N.wav`. Nouveau champ d'épisode `voixOff: [{fichier, t, duree}]` : le montage le recopie dans `feuille.voix.off` et en tire des « creux » (la musique baisse sous la voix) ; `page.js` pose chaque clip à son instant sur la piste `voix.wav` d'un jeu muet. `reglages.musique` 0,6 / `musiqueSeule` 1,0 / `bruitages` 0,5. Vraie voix de Jules : pas de mention « contenu généré par IA ». Épisode `jeu-mots-musique-accroche` : 19,2 s.

## 60. Voix de Jules : chaîne refaite et mixage (22 nov. 2026)
Retour de Jules : voix pas assez audible et « pas folle ». Mesures de la prise : bruit de fond -64 dB (le débruitage `afftdn` était inutile et risquait d'abîmer), crête +0,4 dB (écrêtage au micro), AAC mono 24 kHz. Nouvelle chaîne : `adeclip`, coupe-bas 90 Hz, creux 250 Hz, présence +3 dB à 3,5 kHz, air +2 dB à 8 kHz, `deesser`, `acompressor`, `loudnorm` -14 LUFS / crête -2 dB, sans débruitage. Mixage : voix ×1,4 (`reglages.volume`), musique 0,3 sous la voix (`musiqueSeule` 1,0 entre les phrases) : parole ≈ 12 dB au-dessus de la musique ; crête du mix -2,9 dB. Re-prise conseillée si insuffisant (micro à ~15 cm, moins fort, endroit calme) ; autre option : voix clonée propre (mention IA).

## 61. Arrêt de la voix ; test « grille complète dès l'image 0 » (22 nov. 2026)
Jules arrête la voix (micro du téléphone insuffisant). `voixOff` reste disponible dans le moteur mais n'est plus utilisé. Nouvelle option de plan `grilleComplete` : toute la grille de mots fléchés (cases vides) est visible dès l'image 0, caméra fixe sur la grille entière, les mots se révèlent un à un (le mot actif s'illumine) ; la question du mot 1 est visible dès l'image 0 (le bandeau n'apparaît plus en fondu en mode progressif). Épisodes : `jeu-mots-musique-grille` (15,7 s, un seul changement par rapport à `jeu-mots-musique-court`) et `jeu-mots-musique-accroche-muet` (accroche en gros, sans voix, 17,4 s). À mesurer comme avant : % restant à 2 s (réf. ~50 %) et à 7 s (réf. ~10 %), visionnage moyen (réf. ~5 s). Publier une seule vidéo à la fois.

## 62. Retour au format classique + trois tests à une variable (23 nov. 2026)
Après la recherche (blogs marketing, chiffres non vérifiés : décision de rester en 1,5-3 s, quiz = accroche de curiosité, réponse en fin = « payoff », testez plusieurs ouvertures), retour à la version classique (un mot à l'écran au début, les autres s'ajoutent), sans voix. Trois vidéos, une variable chacune : A `jeu-mots-musique-accroche-muet` (accroche en gros), B `jeu-mots-cinema-rapide` (2,5 s par mot, ≈13 s ; la durée minimale d'un jeu muet passe de 15 à 10 s), C `jeu-mots-sport-reveal` (option `teaser.reponse` : la réponse ARBITRE s'affiche en fin de vidéo). Publier une seule à la fois, mêmes heure et description ; mesurer % restant à 2 s / 7 s, visionnage moyen, vision complète. Grille complète dès l'image 0 (`jeu-mots-musique-grille`) mise en réserve.

## 63. Format « chrono » avec voix clonée (23 nov. 2026)
Inspiré des vidéos que Jules a regardées : une question, puis un chronomètre de 5 s qui démarre à l'apparition de la question ; la voix dit « Like si tu as trouvé ! La troisième est vraiment compliquée. » avant le mot difficile. Nouveautés : bruitage `chrono-5.wav` (tic-tac toutes les 0,5 s puis 0,25 s, ding à 5 s) posé à chaque question et sur la question mystère (`muet.chrono`), `muet.debuts` (début de chaque mot) en plus de `muet.reponses`, `voixGeneree` (rappel « contenu généré par IA » dans `publication.md`), réponse du mot mystère révélée à la fin du chrono. Voix : clone de la voix de Jules (Chatterbox, référence 15 s extraite de `videos/voix/jeu-moliere/propre.flac`, 2 prises par phrase, prise retenue d'après la transcription Whisper), niveaux égalisés (-16 dB moyen par clip), musique Rêverie à 0,3 sous la voix. Épisode `jeu-mots-musique-chrono` (31,3 s) : CHANT, ECOUTER, TIMBRE (mot difficile), question mystère PIANO. Écarté : la voix réelle de Jules (micro insuffisant). Non vérifiable par moi : le timbre cloné et le naturel (pas d'écoute).

## 64. Animation de texte « Like si tu as trouvé… » calée sur la voix (23 nov. 2026)
Option de plan `hype {t, duree, mots[{texte, t, sortie, taille, top, style, coeur}]}` : calque plein écran (scène assombrie) avec typographie cinétique : « LIKE » + cœur qui bat (style `like`), « si tu as trouvé ! » (`sub`), « La 3ᵉ est » (`sub`), « VRAIMENT » en dégradé feu qui tremble (`feu`), « COMPLIQUÉE » qui s'écrase en tampon doré (`stamp`). Instants relevés par transcription mot à mot (Whisper) du clip de voix : like 0,0 s, « si tu as trouvé » 0,28 s, « la troisième est » 1,30 s, « vraiment » 1,84 s, « compliquée » 2,14 s (relatifs à 11,5 s). Le style `tampon` a été renommé `stamp` (conflit avec la classe `.tampon` du jeu). Synchronisme calculé, pas écouté.

## 65. Vidéo chrono : retours de Jules (23 nov. 2026)
(1) L'annonce ne reste plus sur la grille : chaque mot du calque `hype` s'efface avant la fin du calque (sortie par défaut = durée − 0,12 s, fondu 0,2 s). (2) Elle passe avant la grille du mot 2 : 7,2 → 10,0 s (la révélation du mot 1 est à 5,3 s, ses lettres ont fini de tomber vers 7,0 s). (3) Voix plus forte : `reglages.volume` 1,4 → 1,7. (4) ECOUTER remplacé par ACCORD (« Plusieurs notes jouées en même temps »), nouvelle phrase de voix clonée (prise graine 11, 1,84 s). Nouveau calendrier : réponses à 5,3 / 16,0 / 23,0 s, question mystère à 27,0 s, réponse PIANO à ~33 s ; durée 34,1 s. Niveaux mesurés : voix -16 à -17 dB par clip ; crête du mix -2,9 dB.

## 66. Mini-jeu « Devine en 3 secondes » de 7 s (23 nov. 2026)
Constat : visionnage moyen stable ~5 s quelle que soit la durée (12-37 s) ; vision complète 2-6 %. Test d'une vidéo très courte à un seul mot : question en gros + cases (1ʳᵉ lettre donnée) dès l'image 0, chrono de 3 s (`chrono-3.wav`, option `muet.chronoDuree`), réponse qui claque, finale de la scène (`finaleDelai` 0,5 s), coupe nette pour la boucle. Moteur : un seul mot permis en affichage progressif, durée minimale d'un jeu muet 5 s, scènes à deux mots ou moins calmes jusqu'au finale. Épisodes `jeu-mots-desert-3s` (OASIS, scène dunes, recommandé) et `jeu-mots-volcan-3s` (LAVE, secours), 6,9 s, sans voix.

## 67. Revue des mini-vidéos « Devine en 3 secondes » et corrections (23 nov. 2026)
Revue des MP4 `jeu-mots-desert-3s` / `jeu-mots-volcan-3s` (planche à 2 i/s, image 0, pixels, bruitages). Défauts corrigés : (1) la réponse était délavée par les voiles plein écran (tempête, éclair) et masquée par les jets de lave → la scène du bas passe derrière la grille, la question et le minuteur (z-index) ; (2) 0,5 s de vide entre le « ding » et la première lettre → en mode chrono, le chrono, l'anneau et le compte à rebours finissent sur la première lettre posée (`montage.js`, `plans.js`) ; (3) chrono presque invisible → gros compte à rebours 3-2-1 (190 px, « 1 » en rouge) au-dessus des cases pour un jeu à un mot ; (4) image 0 incomplète (une seule case, recadrée) → toutes les cases et la première lettre visibles dès 0 s, sans zoom d'entrée ; (5) question petite et effacée à 3,7 s → 100/88/74 px selon la longueur et gardée jusqu'à la fin ; (6) scène du bas descendue jusqu'au bord ; (7) fin raccourcie : 5,9 s au lieu de 6,9 s ; (8) marge gauche de la question portée à 34 px (texte à 67 px du bord). Non changé, à décider par Jules : le cadre crème de 26 px du thème papier découpé (`themes.js:25`), visible sur toutes les vidéos.

## 68. Retrait du cadre crème (23 nov. 2026)
Jules retire le cadre crème de 26 px du thème « papier découpé » (`studio/avis/themes.js`) : l'image va maintenant jusqu'aux bords ; seul le léger vignettage intérieur reste. S'applique à toutes les vidéos rendues à partir de maintenant ; les vidéos déjà publiées gardent leur cadre. Les deux mini-vidéos 3 s sont re-rendues sans cadre.

## 69. Règle affichée et question raccourcie sur les mini-vidéos (23 nov. 2026)
Pour la première seconde : option de plan `regle` (bandeau doré « 3 SECONDES » avec une icône de chronomètre, 68 px, en haut dès l'image 0) ; question du désert raccourcie à « Palmiers et eau en plein désert » (6 mots, 2 lignes). Appliqué à `jeu-mots-desert-3s` et `jeu-mots-volcan-3s` (5,9 s). « Opti » reste à vérifier sur les chiffres.

## 70. Mini-jeu « À quelle lettre tu trouves ? » (23 nov. 2026)
Idée de Jules après la mini-vidéo 3 s (rétention 84-92 %, vision complète 17 %, mais 0 réaction et diffusion arrêtée à 63 vues) : un mot difficile dont une lettre de plus apparaît toutes les 2 s jusqu'à la révélation, pour donner une raison de rester et de commenter (« je l'ai eu à la 2ᵉ lettre »). Option `muet.etapes { pas, ordre }` (un seul mot) : chaque lettre d'`ordre` claque sur le « ding » d'un chrono de 2 s (`chrono-2.wav`), la révélation finale tombe sur le dernier ding ; bandeau « À QUELLE LETTRE TU TROUVES ? » (police réduite automatiquement pour un texte long). Épisodes `jeu-mots-mirage-lettres` (MIRAGE, désert : M → M____E → M_R__E → MIR__E → MIRAGE) et `jeu-mots-comete-lettres` (COMETE, espace, fusée), 11,2 s, sans voix. La fusée utilise désormais le même calcul de niveaux que les autres scènes (calme jusqu'au finale pour un mot seul). Dans un jeu d'un seul mot, la lettre donnée s'anime avec les autres cases à l'image 0.

## 71. Mots longs pour « À quelle lettre tu trouves ? » (23 nov. 2026)
Demande de Jules : des mots plus longs (plus durs à trouver tôt, révélation finale plus forte). Trois vidéos de 11,2 s, une lettre toutes les 1,6 s (`etapes.pas` 1,6, `chrono-1.6.wav`), 4 indices puis 5 à 7 lettres d'un coup : VOLCANOLOGUE (12, volcan : V → …E → …G… → …C… → …N…), HIPPOCAMPE (10, océan), DROMADAIRE (10, désert). Grille d'une seule ligne : largeur utile 1 040 px et cases plus serrées (80 px pour 12 lettres, ~98 px pour 10). Au-delà de 12 lettres, les cases deviendraient trop petites pour un téléphone.

## 72. Grand chrono visible dans « À quelle lettre tu trouves ? » ; première image nette (23 nov. 2026)
Demande de Jules : un chrono visible. Dans le mode `etapes`, un grand anneau doré (220 px) entre la question et les cases se vide jusqu'à la révélation, avec un chiffre par seconde (8 → 1, les 3 derniers en rouge) et une pulsation à chaque nouvelle lettre ; le petit anneau du coin est masqué dans ce mode. Image 0 : pour un jeu d'un seul mot, plus de « pop » des cases, et `ouverture: "calme"` supprime désormais tout zoom d'entrée sur le premier plan (`lecteur.js`) : la première image (couverture) est identique à l'état stable. Appliqué aux 5 vidéos `*-lettres` et aux 2 vidéos `*-3s`.

## 73. Carte d'introduction « TROUVE LE MOT » (23 nov. 2026)
Demande de Jules : une phrase d'introduction en gros sur le décor seul, puis la vidéo telle quelle. Option de plan `intro {texte, duree}` : un calque avec le fond du décor (la scène du bas reste visible) et le texte en très gros (170 px, deux lignes « TROUVE / LE MOT »), visible dès l'image 0 (couverture), léger zoom, puis fondu de 0,18 s ; toute la ligne de temps du jeu est décalée de 1,2 s (`muet.debuts` 1,5 s, `muet.reponses` 9,0 s). Appliqué aux 5 vidéos `*-lettres` (12,4 s).

## 74. Zone sûre TikTok pour les jeux d'un mot (24 nov. 2026)
Capture de MIRAGE publiée : la barre de recherche de TikTok cachait la règle « À QUELLE LETTRE TU TROUVES ? » (y 178) et la colonne d'icônes cachait la dernière case (grille de 1 040 px). Option de plan grille `zoneSure: true` : règle sur une ligne à y 300 (44 px), question à y 370 sur 840 px, grille d'une ligne sur 860 px centrée sur x 470 (de 40 à 900, caméra recentrée), grand chrono recentré. Les cases de 12 lettres passent à ~66 px (lisibles, mais c'est la limite : rester à 12 lettres au plus). Contrôle visuel `apercu.js --zone-tiktok`. Appliqué aux 5 vidéos `*-lettres` ; MIRAGE, déjà en ligne, n'est pas republiée. Alternative écartée : laisser la grille pleine largeur et réduire la colonne d'icônes (impossible, c'est l'interface de TikTok).

## 75. Retrait de la carte « TROUVE LE MOT » (24 nov. 2026)
MIRAGE avec carte d'intro : 3,6 s de visionnage moyen (29 %) sur 12,4 s, moins que la mini 3 s. La carte retarde le jeu ; elle est retirée des 4 vidéos non publiées (VOLCANOLOGUE, HIPPOCAMPE, DROMADAIRE, COMETE), qui reviennent à 11,2 s avec le jeu dès l'image 0 (`muet.debuts` 0,3 s, `reponses` 7,8 s), en gardant la zone sûre TikTok. L'option `intro` reste disponible dans le moteur. Test suivant : VOLCANOLOGUE, à comparer au temps moyen de MIRAGE.

## 76. Au plus 8 lettres pour « À quelle lettre tu trouves ? » (24 nov. 2026)
Avec la zone sûre (860 px utiles), VOLCANOLOGUE donnait des cases de ~66 px, trop petites selon Jules ; il refuse le mot coupé sur deux lignes. Nouveaux mots de 7-8 lettres, cases de ~105-117 px : CRATÈRE (« La bouche du volcan », volcan), PIEUVRE (« Huit bras et trois cœurs », océan), SCORPION (« Il pique avec sa queue dans le désert », désert) ; réglage de MIRAGE (3 indices, une lettre toutes les 2 s, 11,2 s, sans carte d'intro). VOLCANOLOGUE, HIPPOCAMPE, DROMADAIRE restent en réserve.

## 77. Essai « Devine la blague » (24 nov. 2026)
Jules : « il nous faut des likes » ; idée d'une devinette drôle (« Le roi de la pop qui fait du bruit quand on appuie dessus ? Michael Klaxon »). Même moteur que « À quelle lettre » : question drôle se terminant par « Michael… », KLAXON lettre par lettre (K → K….N → K.A..N → KLAXON, une lettre toutes les 2 s), puis la chute en gros (« MICHAEL KLAXON ! ») et « LIKE ❤️ si t'as ri 😂 » ; règle « DEVINE LA BLAGUE », décor musique / vinyle, 10,2 s, jeu dès l'image 0. Épisode `blague-klaxon`. Hypothèse : l'humour fait liker plus qu'une devinette sérieuse.
Mise à jour (Jules) : question « Le roi de la pop qui fait « tut tut » ? », MICHAEL KLAXON entier à deviner. Option de plan grille `coupure: n` (`GR.couper`, `grille.js`) : un nom écrit d'un seul tenant (`MICHAELKLAXON`) passe sur deux lignes centrées à partir de la n-ième lettre (MICHAEL / KLAXON, cases ~110 px), caméra descendue (centre y 1075) pour laisser la place au chrono. Option de plan `sons [{f, t, v}]` (bruitages propres au plan, `montage.js`) et nouveau bruitage synthétisé `klaxon.wav` (« tut tut », `sons-avis.js`), joué à 0,1 s et à la révélation (8,35 s). Indices : M → K → X → H → N, révélation à 8,3 s, chute et « LIKE si tu as trouvé ! », 12,2 s.

## 78. Relance sur un nouveau compte TikTok (24 nov. 2026)
La blague Klaxon fait un flop comme les précédentes : depuis la 7e vidéo, tout plafonne entre 30 et 150 vues, quel que soit le format, contre ~550-590 pour les 6 premières. Hypothèse : compte freiné. Jules choisit un compte neuf (plan dans `PLAN-NOUVEAU-COMPTE.md` : 2 jours de navigation, 1 vidéo par jour, 7 vidéos courtes, décision à 7 jours). Alternatives écartées pour l'instant : Jules à l'écran (gardé si le compte neuf plafonne aussi), sons tendance seuls (ne règle pas un compte freiné), pause et bilan.

## 79. Virage vers « une personne à l'écran » (24 nov. 2026)
Jules : « ce format fonctionnait peut-être en 2015, pas fin 2026 ». Recherche (`TENDANCES-2026.md`) : en 2026, l'engagement vient surtout d'une vraie personne (brut, humour, défi, réaction, séries). Prochain format proposé : « Ils essaient de trouver le mot » (un proche filmé qui joue à une devinette de l'outil, grille incrustée en haut, sous-titres). Le plan du nouveau compte reste valable avec ce format. Aucun code avant la première vidéo filmée. Alternatives : continuer les devinettes sans personne (plafond constaté), IA réaliste (étiquette obligatoire, engagement incertain).

## 80. Avatar IA présentateur (24 nov. 2026)
Jules ne veut pas montrer son visage et choisit un avatar IA qui présente et réagit aux devinettes (présence humaine, cf. décision 79). Pas de génération possible ici (pas de carte graphique ; création HeyGen refusée depuis Claude Code) : Jules génère le clip (fond vert, 9:16, voix française) avec les scripts de `AVATAR-IA.md` ; Claude l'assemblera (transcription mot à mot, jeu calé sur la voix, détourage, avatar en bas à gauche dans la zone sûre, sous-titres, étiquette IA). L'outil d'assemblage sera écrit à l'arrivée du premier clip. Alternatives écartées par Jules : son visage, ses mains, un proche, une mascotte dessinée.

## 81. Présentateur IA fait maison : le hibou qui parle (24 nov. 2026)
Jules : « fais au mieux tout seul ». Sans carte graphique, pas d'avatar réaliste : le hibou (mascotte choisie au début) devient présentateur. Option de plan grille `presentateur { allure, saut, lignes [{t, texte, env}] }` : hibou en bas à gauche (visible dès l'image 0), une bulle par phrase, bec (`.bouche`) ouvert selon l'enveloppe de la voix (15 valeurs/s), clignements, saut à la révélation. `PERSO.jouer(..., deja)` : sans entrée. Voix : voix intégrée de Chatterbox (pas celle de Jules), `scripts/voix-ia.py` (3 prises par phrase), tri `voix-choisir.py`, pose `scripts/presentateur-voix.py` (voixOff, -16 LUFS, enveloppes, voixGeneree). Leçon : éviter les lettres isolées dans le texte parlé (Whisper ne les vérifie pas : « E » → « et »). Premier épisode : `jeu-mots-cratere-hibou` (11,2 s). Étiquette « contenu généré par IA » obligatoire.

## 82. Hibou « zinzin » et voix de personnage (25 nov. 2026)
Jules aime la voix IA, demande de l'améliorer et « des trucs de zinzin ». Voix : génération plus expressive (`voix-ia.py --exag=0.9 --cfg=0.3`, 4 graines), puis traitement de personnage dans `presentateur-voix.py` (`presentateur.voix.demiTons` : +2 demi-tons, vitesse ×1,12, présence +3 dB à 3 kHz, compression, -16 LUFS). Folies par phrase (`lignes[].folie`) : `zoom` (coup de zoom + bulle qui tremble), `yeux` (yeux énormes + écran qui tremble), `tete` (tour complet), `tremble` (hibou qui tremble, plumes qui tombent, chrono qui s'affole), `ejecte` (le volcan l'éjecte en diagonale, vrilles, confettis, flash, retombée en rebond). Bruitages synthétisés : `boing`, `hou-hou`, `whoosh`, `explosion`. Script plus fou (« Je parie MES PLUMES… », « REGARDE LA FIN ! », « T'as toujours pas ?! Sérieux ?! », « Je transpire des plumes là… »). Limite : après accélération, « tu trouves » est moins net pour la transcription automatique (à juger à l'oreille).

## 83. Hibou 2 : personnage expressif animé image par image (25 nov. 2026)
Demande de Jules : un hibou plus fluide, une vidéo de lancement ambitieuse. Nouvelle allure `hibou2` (`personnage.js`), toujours en verre : sourcils (émotions `defi`, `choc`, `agace`, `panique`, `joie`), paupières, pupilles mobiles, bec articulé (mâchoire + bouche + langue), joues, ailes articulées. Animation par une seule fonction du temps (`animerHibou2` dans `plans.js`, pilote GSAP fini, attributs posés directement) : respiration, balancement, émotions fondues, gestes d'ailes avec léger dépassement, regard vers chaque nouvelle lettre, clignements, synchro labiale à 30 valeurs/s lissée, tremblement et plumes (panique), éjection avec anticipation, traînée de 3 fantômes (`<use>`), vrilles, retombée écrasée, poussière et rebond ; zoom-coup de poing à l'ouverture. Fin en boucle (« Encore un ? ») et appel au commentaire (« À quelle lettre ? 👇 »). Bruitages ajoutés : `gloups`, `pouf`. Contrôles : mesure image par image (60 i/s) des déplacements du hibou, de la tête, des ailes et du bec (les seuls grands écarts sont le vol, voulu) ; planche complète à 10 i/s regardée ; zone sûre ; niveaux. Fiche : `LANCEMENT-HIBOU.md`.

## 84. Boucle parfaite, hibou tricheur, appel au commentaire (25 nov. 2026)
Recherche (blogs 2026, non officiels) : le visionnage complet et les revisionnages pèsent le plus ; boucles parfaites et détails cachés font revoir ; les commentaires détaillés comptent plus que les likes ; une mascotte au caractère affirmé porte un compte (Duolingo). Ajouts : `scripts/boucle.sh` (fondu des 0,35 dernières secondes vers l'image 0, son en fondu, dernière image = première) ; option `presentateur.triche {t, duree, texte}` (il soulève l'aile, la réponse est écrite sur son flanc, il y jette un œil) ; `presentateur.cta.haut` (appel sous les cases, flèche vers le bouton commentaires). Sources dans la réponse du 25 nov. ; fiche `LANCEMENT-HIBOU.md` mise à jour.

## 85. Boucle parfaite, image et son (25 nov. 2026)
Jules : « la boucle n'est pas encore parfaite, il ne faut pas de coupure même au niveau de la musique ». L'ancienne boucle fondait l'image vers une image fixe et coupait le son en fondu (creux audible). Nouvelle méthode (`scripts/boucle.sh`) : l'épisode commence par une amorce de 0,4 s (option de plan `amorceBoucle`, tous les instants décalés de 0,4 s ; hibou déjà en « défi » et bulle déjà affichée pendant l'amorce) ; la vidéo publiée commence après l'amorce et ses 0,37 dernières secondes se fondent dans l'amorce, image (xfade) et son (fondu à puissance constante calculé échantillon par échantillon en Python, l'acrossfade de ffmpeg se bloquant sur deux branches du même fichier). Au raccord, on enchaîne la fin de l'amorce et l'instant qui la suit : aucune rupture. Durée publiée = 22 temps à 108 bpm (12,22 s), pour que le rythme de la musique tombe juste. Mesures : écart entre dernière et première image 37,6 dB, identique à deux images consécutives (37,6 dB) ; saut d'échantillon au raccord dans la plage normale ; musique continue.

## 86. SCORPION : le hibou danse entre ses phrases (25 nov. 2026)
Demande de Jules : une vidéo SCORPION « aussi bien qu'avant », le hibou dansant entre chaque phrase. Option `presentateur.danse` : dans chaque silence (calculé avec `lignes[].duree`, posé par `presentateur-voix.py`), le hibou danse sur le tempo de la musique (108 bpm) : un saut par temps avec écrasement à l'atterrissage, déhanché et pas chassés, ailes en alternance (sinus au carré, sans à-coup), tête qui balance, sourcils joyeux, yeux plissés ; entrée et sortie de danse en 0,3 s ; jamais pendant l'amorce de boucle ni l'éjection. Pour laisser de la place à la danse : une lettre toutes les 2,8 s (`chrono-2.8.wav`), durée publiée 28 temps (15,6 s). Script : « Celui-là, personne le trouve. Vas-y ! » (défi, zoom), « Regarde la fin… REGARDE LA FIN ! » (choc, réutilisée), « T'as toujours pas ?! Sérieux ?! » (agacé, réutilisée), « Attention… ça pique… ÇA PIQUE ! » (panique, plumes), « SCORPION ! Like si tu l'avais ! » (joie, éjection), « Encore un ? » (réutilisée). `boucle.sh` rendu robuste à un son plus court de quelques échantillons. Contrôles : voix exactes après traitement, fluidité image par image (seul geste rapide : la panique, comme CRATÈRE), planche complète à 8 i/s, zone sûre, crête -2,9 dB, raccord de boucle 38,6 dB (= deux images consécutives).
Correction (Jules : « on n'entend pas bien le dernier ça pique ») : la prise retenue disait le dernier « ça pique » en 0,3 s et la coupe automatique de `voix-choisir.py` laissait trop peu de marge. Remplacée par la prise n° 11 entière (« Attention… ça pique… ça pique… ÇA PIQUE ! », dernier mot bien détaché) et nouvelle option `lignes[].accent {debut, db}` dans `presentateur-voix.py` : accent monté après le traitement (le compresseur aplatissait un accent posé avant), avec limiteur. Mesures : dernier « ça pique » 4,4 dB plus fort que le premier, crête -1 dB sur la phrase, -2,6 dB sur la vidéo ; boucle toujours parfaite (38,6 dB).

## 87. Accroche « STOP ! » en gros plan et fond animé (25 nov. 2026)
Courbe du hibou CRATÈRE (nouveau compte, 99 % « Pour toi ») : la moitié part dès la 1re seconde, comme pour toutes nos vidéos. Test sur SCORPION (seule l'ouverture change, plus le fond demandé par Jules) : option `presentateur.accroche {texte, sous, fin}` : de l'image 0 à ~1,2 s, voile sombre sur le jeu, hibou en très gros plan au centre (×2,6, il pointe le spectateur), texte géant « STOP ! » + « Tu vas perdre. » qui tremble sur le tempo, voix « Stop ! Tu vas perdre ! » (pause après « Stop ! ») ; puis dézoom en 0,38 s vers le jeu (+ souffle). Option de plan `fondAnime: "desert"` : fond animé image par image (rayons de soleil qui tournent, deux couches de dunes en défilement parallaxe, 40 grains de sable dans le vent, buisson roulant), périodique sur la durée publiée pour que la boucle reste parfaite. Corrections : la danse ne s'arrête plus net avant l'éjection (saut d'image mesuré à 11,90 s, supprimé). Vérifications : voix exacte, raccord de boucle 26,8 dB (≥ deux images consécutives, 24,1 dB), crête -2,3 dB, planche 8 i/s, zone sûre. À comparer à CRATÈRE : part de spectateurs restants à 1 s et à 3 s.

## 88. Fond 3D : désert au coucher du soleil (25 nov. 2026)
Demande de Jules : un fond « à l'état de l'art ». Nouveau module `studio/avis/fond3d.js` (Three.js, shader plein écran, option de plan `fond3d: "desert"`) : terrain de dunes calculé par lancer de rayons (bruit périodique, crêtes allongées par le vent, rides), caméra qui avance au-dessus des dunes en suivant le relief, ciel du crépuscule (indigo → magenta → or), soleil couchant net à l'horizon à droite avec halo et rayons tournants, brume de chaleur, contre-jour sur les crêtes, grains qui scintillent, brume de distance, étalonnage doux et vignette. Rendu à mi-résolution (540 × 960, agrandi) : ~0,45 s par image sans carte graphique (rendu complet 8 min). Périodique sur la durée publiée (le terrain se répète en profondeur, la caméra avance d'une période) : boucle parfaite conservée (raccord 27 dB ≥ deux images consécutives 24 dB). Avec le fond 3D, le décor 2D est masqué (classe `f3d`), seuls restent les grains de sable et le buisson roulant ; le hibou de verre reçoit une ombre portée pour se détacher du sable. Prototype et réglages : soleil d'abord surexposé et bande lumineuse dans la brume (corrigés), relief trop montagneux (adouci), caméra qui traversait une dune (suit le relief).

## 89. Le hibou arrive en volant et lit la question (25 nov. 2026)
Demande de Jules : un moment où le hibou lit la question, arrivée en vol « très fluide », puis atterrissage. Après l'accroche STOP (choix de Jules) : il se tasse, décolle pendant le dézoom et sort à gauche (souffle, battements d'ailes), revient en haut à droite, descend en planant jusqu'au vol stationnaire à droite du chrono (sans survoler la question), lit « Il pique avec sa queue dans le désert… C'est quoi ? » en regardant la question, dont les mots s'allument en doré au rythme de sa voix (karaoké, horaires des mots par faster-whisper dans `presentateur-voix.py`, option `lecture`), puis redescend vers sa place, atterrit avec écrasement, rebond et « pouf ». Option `presentateur.vol {depart, arrivee, pose, x, y}` : trajectoire en courbes d'Hermite cubiques (position et vitesse continues), inclinaison selon la vitesse, battements à 5,5 par seconde avec montée sur chaque coup d'ailes en stationnaire, danse coupée en vol et reprise en douceur. Bruitage `ailes.wav`. Le jeu est décalé de 9 temps (5 s) : 20,6 s publiées, boucle parfaite (raccord 26,9 dB ≥ deux images consécutives 24,3 dB), crête -2,2 dB. Mesure image par image : seuls écarts rapides voulus (déploiement des ailes au décollage, impact à l'atterrissage, passage hors champ).

## 90. Gabarit court du hibou : MIRAGE (25 nov. 2026)
SCORPION (20,6 s) : l'accroche STOP retient mieux à 1 s et 3 s, mais les 5 s de vol et de lecture font partir des spectateurs jusqu'à ~6 s. Option `vol.direct` : il décolle du gros plan et monte directement se placer près de la question en passant par la droite, sous la grille (sans croiser chrono ni question), lit la question sans « C'est quoi ? », se pose ; le jeu commence ~2,2 s plus tôt (décalage de 5 temps au lieu de 9). SCORPION étant déjà publiée, le gabarit court sert à MIRAGE (« Illusion d'eau en plein désert », désert 3D, nouvelles phrases « J'ai soif… j'ai TROP soif ! » et « MIRAGE ! Like si tu l'avais ! »). 18,35 s, boucle parfaite (27,0 dB ≥ 24,3 dB), crête -2,6 dB. À comparer à SCORPION : part restante à 3 s et à 6 s, visionnage complet.

## 91. Fond 3D « mirage » pour MIRAGE (25 nov. 2026)
Demande de Jules : un fond représentatif du mot. `fond3d: "mirage"` (`studio/avis/fond3d.js`, même désert avec `#define MIRAGE`) : horizon remonté entre le chrono et la grille ; au loin le relief s'aplanit en plaine (là où naissent les vrais mirages) ; sous l'horizon, une fausse eau qui reflète le ciel et le soleil, avec vaguelettes et lignes de scintillement, qui « respire » ; au-dessus, une oasis de trois palmiers en silhouette (tronc courbé, palmes en arc qui retombent) qui ondule dans la chaleur, avec son reflet inversé dans l'eau. Tout est périodique sur la durée publiée : boucle parfaite (raccord 27,0 dB ≥ 24,4 dB). Premiers essais corrigés : palmiers qui ressemblaient à des branches mortes, eau cachée par les dunes, ondulation en zigzag trop forte.
