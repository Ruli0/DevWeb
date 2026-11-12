# Le Terrarium agentique : scripts des vidéos

Cinq vidéos courtes, une par concept. Chacune montre d'abord une scène de nature dans le vivarium, puis le vrai concept.

- **Format** : vertical 9:16 (1080 × 1920), de 30 à 40 secondes.
- **Ordre de publication** : le caméléon, la dionée, puis le ruisseau, les fourmis et la boîte en verre.
- **Structure commune** :
  1. une accroche (3 s) ;
  2. la scène du vivarium, reprise telle quelle des pages vidéo (environ 20 s) ;
  3. la révélation : le schéma ou le code du vrai concept (8 à 10 s) ;
  4. une phrase de fin (3 s).

## Les pages vidéo

Chaque scène existe en page HTML autonome, en 9:16, sans interface, qui se rejoue en boucle :

```bash
cd terrarium
node scripts/build-demo.js --scene=cycle       # demo/video-cycle.html
# et aussi : bocal, couches, capteurs, ecosysteme
```

Ouvre la page dans un navigateur réglé à 1080 × 1920 (ou zoomé) pour filmer l'écran.
`window.terrariumVideo.tours` passe à 1 à la fin du premier passage : c'est le moment de couper.

La page commence par 2 s de titre, puis joue la scène. Les durées ci-dessous partent du début de la page, et ont été mesurées dans un navigateur.

| Page | Durée d'un passage |
|---|---|
| `video-cycle.html` | 24,7 s |
| `video-capteurs.html` | 18,3 s |
| `video-couches.html` | 27,3 s |
| `video-ecosysteme.html` | 20,3 s |
| `video-bocal.html` | 18,1 s |

## Produire les vidéos avec HyperFrames

- **Depuis l'app Claude (claude.ai)**, avec le connecteur HyperFrames : on crée un projet HeyGen hébergé et on le rend en MP4 dans le cloud. Donne à Claude le script ci-dessous et le fichier de la page vidéo. C'est le plus simple depuis un iPhone.
- **Depuis Claude Code**, la création et le rendu par le connecteur sont désactivés. On installe les skills locales (`npx skills add heygen-com/hyperframes`), qui produisent des compositions HTML + GSAP. Les pages vidéo sont déjà en HTML + GSAP, elles peuvent donc servir de point de départ.
- **Sans HyperFrames**, on peut aussi filmer la page vidéo, puis ajouter l'accroche, la révélation et la voix off dans un logiciel de montage.

---

## Vidéo 1 · Le caméléon : la boucle d'outils

**Durée cible** : 38 s. **Page** : `video-cycle.html`, de 2,5 s à 24,7 s.

| Temps | Image | Texte à l'écran | Voix off |
|---|---|---|---|
| 0 – 3 s | Gros plan sur l'œil du caméléon, qui tourne. | Comment pense un agent IA ? | « Un agent IA, ça ne répond pas d'un coup. Ça chasse. » |
| 3 – 6 s | Plan large du vivarium. Le caméléon est sur sa branche. | Un agent travaille en boucle. | « Regarde ce caméléon. » |
| 6 – 9 s | Une mouche arrive, l'œil la suit. | Il vise : le modèle réfléchit. | « Il repère une proie et il vise. C'est le modèle qui réfléchit. » |
| 9 – 11 s | La langue part et attrape la mouche. | Il lance sa langue : appel d'outil. | « Il lance sa langue. Pour l'agent, c'est un appel d'outil. » |
| 11 – 14 s | La langue revient, le caméléon avale. | Il ramène sa prise : le résultat. | « Il ramène sa prise : c'est le résultat de l'outil. » |
| 14 – 17 s | Sa peau devient turquoise. | Sa couleur change : le contexte s'enrichit. | « Et ce résultat change ce qu'il sait. » |
| 17 – 23 s | Deuxième tour, plus rapide. La peau devient orange. | Et ça recommence. | « Puis il recommence. Viser, attraper, avaler. » |
| 23 – 27 s | Le caméléon s'immobilise. | Il s'arrête quand il n'a plus faim. | « Il s'arrête quand il n'a plus besoin d'outil. C'est lui qui décide. » |
| 27 – 35 s | **Révélation** : la boucle du chapitre 2 (schéma en cercle : pensée, appel d'outil, résultat, contexte), puis l'extrait de code `while (true)` du chapitre. | Réfléchir → appeler un outil → lire le résultat → recommencer | « En code, c'est une simple boucle : le modèle demande un outil, le programme l'exécute, le résultat revient dans le contexte. Jusqu'à la réponse finale. » |
| 35 – 38 s | Retour au vivarium, le caméléon reprend sa promenade. | La boucle d'outils. Le moteur de tout agent. | « La boucle d'outils. Le moteur de tout agent. » |

**À retenir pour le montage** : le modèle ne lance pas l'outil lui-même. Il le demande, et le programme l'exécute. La voix off des plans 27 – 35 s le dit, ne pas la couper.

---

## Vidéo 2 · La dionée et la grenouille : les hooks

**Durée cible** : 32 s. **Page** : `video-capteurs.html`, de 2,2 s à 18,3 s.

| Temps | Image | Texte à l'écran | Voix off |
|---|---|---|---|
| 0 – 3 s | Gros plan sur la jeune pousse qui tremble. | Comment empêcher un agent de faire une bêtise ? | « Comment empêcher un agent IA de faire une bêtise ? » |
| 3 – 6 s | Plan sur la pousse, au sol. | Une pousse fragile. | « Voici une jeune pousse. Elle est fragile. » |
| 6 – 9 s | Le scarabée file vers la pousse. | Un scarabée arrive. | « Un scarabée file droit dessus. » |
| 9 – 13 s | La dionée se referme d'un coup sur le scarabée. | Bloqué avant d'agir : hook « avant ». | « Clac. La dionée se referme avant qu'il n'arrive. C'est un hook avant l'action : il peut tout bloquer. » |
| 13 – 17 s | La grenouille gonfle sa gorge et coasse, avec des ondes. | Elle prévient après coup : hook « après ». | « La grenouille, elle, coasse après coup pour prévenir tout le monde. C'est un hook après l'action. » |
| 17 – 20 s | Plan large, le vivarium au calme. | Ils ne demandent pas la permission. | « Aucun des deux ne demande l'avis de l'agent. Ils se déclenchent à coup sûr. » |
| 20 – 29 s | **Révélation** : l'extrait de code du chapitre 4 (`agent.hook("avantOutil", …)` qui renvoie `bloquer`, puis `apresOutil` qui note dans le carnet). | Une consigne demande. Un hook garantit. | « Écrire “n'arrache jamais les plantes” dans la consigne, c'est demander. Brancher un hook, c'est garantir. Avant l'action, il bloque ou modifie. Après, il note ou prévient. » |
| 29 – 32 s | Retour sur la dionée qui se rouvre lentement. | Les hooks. Des réflexes, pas des conseils. | « Les hooks : des réflexes, pas des conseils. » |

**À retenir pour le montage** : quand un hook bloque, le modèle reçoit la raison et peut choisir une autre action. On peut l'ajouter en sous-titre pendant la révélation.

---

## Vidéo 3 · Le ruisseau : le middleware

**Durée cible** : 38 s. **Page** : `video-couches.html`, de 2,3 s à 27,3 s.

| Temps | Image | Texte à l'écran | Voix off |
|---|---|---|---|
| 0 – 3 s | Gros plan sur la goutte trouble en haut de la cascade. | Par où passe une requête ? | « Quand tu parles à une IA, ta demande ne va pas directement au modèle. » |
| 3 – 7 s | La goutte descend la cascade. | Une requête traverse des couches. | « Elle traverse des couches, comme l'eau de ce ruisseau. » |
| 7 – 12 s | La goutte passe le sable et devient claire. | Le sable : le filtre de données sensibles. | « Le sable retient les impuretés : les données sensibles sont masquées. » |
| 12 – 17 s | La goutte passe la mousse. | La mousse : le journal. | « La mousse garde une trace du passage. C'est le journal. Il arrive après le filtre, donc il ne note rien de sensible. » |
| 17 – 22 s | La goutte passe les galets. | Les galets : la limite de débit. | « Les galets freinent le courant : c'est la limite de débit. » |
| 22 – 26 s | La goutte arrive au bassin, des rides s'étendent. | Elle arrive propre au modèle. | « L'eau arrive propre au bassin. » |
| 26 – 34 s | **Révélation** : la pile de couches du chapitre 3, puis l'extrait `composer([filtre, journal, cache, limiteDebit], appelerModele)`. | L'ordre des couches compte. | « Chaque couche peut observer, modifier ou arrêter la requête. Et l'ordre compte : un journal placé avant le filtre enregistrerait les données en clair. » |
| 34 – 38 s | Retour au ruisseau qui coule. | Le middleware. | « C'est ça, le middleware. » |

---

## Vidéo 4 · Les fourmis : le système multi-agents

**Durée cible** : 32 s. **Page** : `video-ecosysteme.html`, de 2,2 s à 20,3 s.

| Temps | Image | Texte à l'écran | Voix off |
|---|---|---|---|
| 0 – 3 s | Gros plan sur la fourmilière. | Un agent ne peut pas tout faire seul. | « Une tâche trop grosse pour un seul agent ? » |
| 3 – 6 s | La fourmilière s'agite. | Trop de travail pour une fourmi. | « Préparer l'hiver, c'est trop pour une seule fourmi. » |
| 6 – 10 s | Trois éclaireuses partent dans trois directions. | Trois sous-agents, en même temps. | « La fourmilière découpe le travail. Trois éclaireuses partent en même temps. » |
| 10 – 13 s | Chacune fouille son coin. | Chacune dans son propre contexte. | « Chacune fouille son coin, sans encombrer les autres. » |
| 13 – 18 s | Elles reviennent avec une feuille, une graine, une goutte. | Elles ne rapportent que l'essentiel. | « Et chacune ne rapporte qu'un résumé de ce qu'elle a trouvé. » |
| 18 – 20 s | Les trois trouvailles apparaissent devant la fourmilière. | La fourmilière assemble. | « La fourmilière assemble le tout. » |
| 20 – 29 s | **Révélation** : la comparaison du chapitre 5. Le bocal du jardinier à 1 850 tokens en équipe, contre 29 300 tokens qui débordent quand il fait tout seul. | Déléguer garde le contexte léger. | « En IA, c'est pareil : un orchestrateur confie des morceaux à des sous-agents. Chacun travaille dans son propre contexte et ne renvoie qu'un résumé. Le contexte principal reste léger. » |
| 29 – 32 s | Retour sur la file de fourmis. | Le système multi-agents. | « Le système multi-agents. » |

---

## Vidéo 5 · La boîte en verre : la fenêtre de contexte

**Durée cible** : 30 s. **Page** : `video-bocal.html`, de 2,3 s à 18,1 s.

| Temps | Image | Texte à l'écran | Voix off |
|---|---|---|---|
| 0 – 3 s | Le cadre en verre s'illumine. | Que voit vraiment une IA ? | « Que voit vraiment une IA quand elle te répond ? » |
| 3 – 8 s | Plan large du vivarium. | Tout doit tenir dans la boîte. | « Seulement ce qui tient dans sa boîte. On l'appelle la fenêtre de contexte. » |
| 8 – 12 s | Les plantes grandissent, la vitre rougit, le couvercle tremble. | Trop de contenu : ça déborde. | « Si on y met tout, ça déborde, et ce qui dépasse est perdu. » |
| 12 – 16 s | On taille, les feuilles tombent au compost. | On résume l'ancien. | « Alors on taille : on garde l'essentiel, on résume le reste. » |
| 16 – 19 s | La vitre redevient verte. | Choisir ce qui entre. | « Choisir ce qui entre dans la boîte, c'est le context engineering. » |
| 19 – 27 s | **Révélation** : la jauge du chapitre 1 qui passe de « déborde » à « tout tient », puis l'extrait `construireContexte` qui garde la consigne, les extraits utiles et un résumé. | Un extrait utile vaut mieux qu'un document entier. | « Un bon contexte n'est pas rempli, il est choisi : la consigne, la demande, les bons extraits, et un résumé de l'ancien. » |
| 27 – 30 s | Retour au vivarium vivant. | La fenêtre de contexte. | « La fenêtre de contexte. » |
