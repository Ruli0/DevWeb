# Guide d'exécution pour le modèle qui travaille sur le studio

_Écrit le 13 novembre 2026. À lire au début de chaque session, avant `ETAT.md`. Il dit quoi lire, quoi ne pas lire, comment vérifier, et les pièges déjà rencontrés._

## 1. Quoi lire, selon la tâche

Lire le moins possible : c'est le premier poste de dépense.

| Tâche | À lire | À ne pas lire |
|---|---|---|
| **Écrire un épisode** avec les briques existantes | Ce guide, `CATALOGUE.md`, `videos/episodes/demo.json` comme modèle. Puis `npm run video -- <id>` et regarder `videos/studio/<id>/apercu.png` | Le moteur, les rigs, le compilateur |
| **Corriger un épisode** après un retour | L'épisode, le retour, la planche d'aperçu | Tout le reste |
| **Ajouter un temps fort ou un geste** | `SPEC-STUDIO.md` (sections 2 et 3), un temps fort voisin | Le dessin du décor |
| **Ajouter un rig ou un décor** | `SPEC-STUDIO.md` (sections 3 et 4), un rig existant, la direction artistique dans `IDENTITE.md` | Le compilateur |
| **Toucher au moteur ou au rendu** | `SPEC-STUDIO.md`, la partie utile du moteur (chercher avec Grep, ne pas tout lire) | — |
| **Exécuter une étape du plan** | `PLAN-REFONTE.md` (la ligne de l'étape), `SPEC-STUDIO.md` | — |

Tant que `CATALOGUE.md` n'existe pas (avant l'étape 2 du plan), le modèle d'épisode est `videos/scenarios/cameleon.json`, et la liste des actions est `ACTIONS` dans `shared/scenarios.js`.

## 2. Quel modèle pour quelle tâche

| Tâche | Modèle conseillé | Pourquoi |
|---|---|---|
| Direction artistique, nouveau rig, nouveau temps fort, architecture | Le plus capable disponible | Jugement visuel et conception |
| Écrire ou corriger un épisode, lancer la chaîne, tenir le carnet | Sonnet | Tâche cadrée par le catalogue et les contrôles |
| Étapes 2 à 4 du plan | Opus, ou plus capable | Refonte de code avec non-régression |
| Étape 5 du plan (la preuve de la palette) | **Sonnet, obligatoirement** | C'est le test : si Sonnet n'y arrive pas avec le catalogue seul, le studio n'est pas fini |

## 3. La façon de travailler avec l'utilisateur

- **Pas à pas.** Une étape, une chose montrée, **une seule question**. Ne jamais enchaîner deux étapes sans réponse.
- **Montrer avant de produire.** Des images fixes ou une boucle de 4 s avant toute vidéo complète.
- **Supposer plusieurs tours.** À chaque tour, ne refaire que ce qui a été commenté.
- **Noter chaque tour** dans `IDENTITE.md`, section « Itérations » : ce qui a été montré, le retour mot pour mot, ce qui a changé. Ne jamais reproposer un choix écarté.
- **L'utilisateur est sur iPhone.** Envoyer les MP4 et les images comme fichiers. Pour faire écouter ou comparer, publier une page d'artifact avec les médias intégrés.
- **Le retour tient en une ligne.** C'est au modèle de le traduire en modifications.
- **Tout le texte pour l'utilisateur est en français**, y compris le carnet et les messages de commit.

## 4. La chaîne de production

Depuis `terrarium/` :

```bash
node scripts/build-sons.js                        # seulement si un son a changé
node scripts/build-video.js <id>                  # composition(s) HyperFrames
npm test                                          # 23 tests
NODE_PATH=$(npm root -g) node scripts/verifier-videos.js   # zone sûre (utilise Playwright)
npx hyperframes lint --json videos/hyperframes/<id>        # 0 erreur attendue ; les avertissements connus sont listés dans ETAT.md
```

Rendu, depuis le dossier de la composition (`videos/hyperframes/<id>/`) :

```bash
HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  npx hyperframes render --workers 3 --fps 60 --quiet -o <sortie>.mp4
```

- Le CLI HyperFrames n'est pas une dépendance du dépôt : l'installer dans le dossier temporaire de la session (`npm i hyperframes`), et lancer `npx` de là.
- Un rendu de 30 s prend environ 2 min 15 en 30 images par seconde et 5 min 40 en 60. **Un seul rendu final par tour.** Pour itérer, utiliser l'aperçu.
- Les MP4 ne vont pas dans le dépôt.

### L'aperçu sans rendu

`scripts/apercu.js` existe déjà :

```bash
NODE_PATH=$(npm root -g) node scripts/apercu.js <id> <sortie.png> [t1 t2 …]   # sans instants : le milieu de chaque plan
```

Son principe :

1. Ouvrir `index.html` de la composition avec Playwright, en 1080 × 1920.
2. Attendre `window.__timelines`, puis `document.fonts.ready`.
3. Pour chaque instant voulu : `timeline.seek(t, false)`, puis afficher ou cacher chaque `.clip` selon `data-start` et `data-duration` (c'est HyperFrames qui le fait au rendu, pas la page seule).
4. Faire une capture, puis assembler les captures en planche avec `ffmpeg` (filtre `xstack`).

Une planche de 12 images prend environ 15 s. Regarder la planche avant chaque rendu : c'est elle qui a révélé tous les défauts du pilote (mouche hors de l'écran, étiquette cachée, Mousse qui pivote au mauvais endroit).

## 5. Règles du rendu déterministe

- Une seule timeline GSAP **en pause**, enregistrée dans `window.__timelines[id]`, dans le même `<script>` que sa construction.
- Ni minuterie, ni `Math.random`, ni `repeat: -1` : un test le vérifie. Le hasard vient de `art.graine(n)`.
- Chaque animation est un `fromTo` sans rendu immédiat (`ft` dans le moteur). L'état de départ d'une animation est l'état d'arrivée de la précédente.
- Les états de repos passent par `repos()` : appliqués tout de suite et inscrits au temps 0.
- Les boucles d'ambiance passent par `boucle()` : une animation finie, rejouée sur la durée de la vidéo.
- Chaque élément minuté a `.clip`, `data-start`, `data-duration` et une piste. Deux sons qui se chevauchent sont sur deux pistes.
- Aucune ressource téléchargée : GSAP et les sons sont copiés dans `assets/`. Les polices disponibles au rendu sont Inter et Space Mono.

## 6. Pièges déjà rencontrés

| Piège | Ce qu'il faut faire |
|---|---|
| Une fonction passée à `page.evaluate` ou `waitForFunction` renvoie la timeline : le script se bloque | Toujours renvoyer une valeur simple (`!!window.__timelines`) |
| La mouche sortait de l'écran : les déplacements étaient en unités du décor | Raisonner en pixels d'écran ou en fractions, et mesurer la position avec Playwright avant de rendre |
| Le texte du terminal se décalait pendant la frappe | Toutes les lettres sont dans la page dès le début, invisibles. On change leur classe, pas leur présence |
| Mousse pivotait autour d'un point lointain | `svgOrigin` est dans le repère local du groupe, pas en pixels d'écran |
| Deux animations sur la même propriété du même élément | Emboîter des groupes : une propriété animée par groupe |
| Un `tl.set` au temps 0 ne s'applique pas sur l'image 0 | Utiliser `repos()` |
| Le vol stationnaire de la mouche débordait sur l'action suivante | Donner une `attente` qui se termine avant la prochaine action du même personnage |
| Une étiquette passait sous le terminal | Le terminal occupe x 80–720, y 930–1150. Placer les étiquettes au-dessus du sujet |
| Le test des actions échouait pour un nom sans point | Une action s'appelle `famille.verbe`, et elle est déclarée à 6 espaces d'indentation dans le catalogue du moteur |
| L'envoi de fichier échouait (erreur 503) | Réessayer une fois, puis publier une page d'artifact avec le média intégré |
| Le lint signale des fichiers trop gros et un état caché au temps 0 | Avertissements connus et sans effet : seules les erreurs comptent |

## 7. Avant de rendre la main

1. `npm test`, le vérificateur et le lint passent. Sinon, le dire avec la sortie.
2. La planche d'aperçu a été regardée, pas seulement générée.
3. Le carnet est à jour : `ETAT.md`, `FEUILLE-DE-ROUTE.md`, `IDENTITE.md` (le tour), `DECISIONS.md` si un choix engage la suite.
4. Commit et push sur la branche de travail indiquée par la session. Pas de pull request sans demande. Aucun identifiant de modèle dans les fichiers du dépôt.
5. Le message final à l'utilisateur : ce qui a été fait, ce qui reste imparfait, et **la seule question** de l'étape.
