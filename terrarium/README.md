# Le Terrarium agentique

Une application pédagogique qui explique des concepts d'agents IA avancés avec la métaphore d'un terrarium.
Stack : **Node.js (Express)**, **JavaScript natif** et **GSAP** (ScrollTrigger, Flip, MotionPath). Aucun framework front.

## Lancer

```bash
cd terrarium
npm install
npm start        # http://localhost:3000  (PORT=4000 npm start pour changer de port)
npm test         # tests de la simulation
npm run build:demo   # démo en un seul fichier : demo/index.html, jouable sans serveur
node scripts/build-demo.js --scene=cycle   # page vidéo 9:16 d'une scène : demo/video-cycle.html
```

## Le vivarium

La page d'accueil est un vivarium illustré, entièrement dessiné en SVG par `public/js/art/terrarium.js` et animé avec GSAP : cascade et ruisseau, plantes qui bougent chacune à leur rythme, caméléon qui se promène sur sa branche, grenouille, papillons, escargot, fourmis.

Cinq scènes de nature (`public/js/art/vignettes.js`) jouent chacune un concept, avec une légende qui suit l'action. Elles sont pensées pour être filmées, et « Tout regarder » les enchaîne.

| Scène | Ce qu'on voit | Concept |
|---|---|---|
| La boîte en verre | Les plantes poussent jusqu'à déborder, puis on taille | Fenêtre de contexte, context engineering |
| Le caméléon | Il vise, lance sa langue, avale, change de couleur, et recommence | Boucle d'outils |
| Le ruisseau | Une goutte trouble traverse la mousse, le sable et les galets | Middleware |
| La dionée | Elle se referme sur un scarabée, puis la grenouille coasse | Hooks avant et après |
| Les fourmis | Trois éclaireuses partent, puis rapportent chacune une trouvaille | Multi-agents |

## Les vidéos

Les scripts des cinq vidéos (format vertical, plan par plan, avec texte à l'écran et voix off) sont dans [`videos/scripts.md`](videos/scripts.md), avec la marche à suivre pour les produire avec HyperFrames.

## Les cinq chapitres

| Chapitre | Dans le terrarium | Concept agentique | Ce qu'on manipule |
|---|---|---|---|
| 1. La boîte en verre | Un volume fermé et limité | Fenêtre de contexte, context engineering, compactage | On remplit le bocal, il déborde, on composte |
| 2. Le caméléon | Il vise, lance sa langue, avale, recommence | Boucle d'outils | Une goutte avance étape par étape : pensée, appel, résultat, retour au contexte |
| 3. Le ruisseau | Sable, mousse, terreau, galets | Middleware | On active et on réordonne les couches : fuite dans le journal, cache, quota |
| 4. Les capteurs | La dionée, la grenouille, des capteurs | Hooks avant et après l'action | On branche des capteurs qui bloquent, modifient, notent ou informent |
| 5. L'écosystème | La fourmilière et ses éclaireuses | Orchestrateur et sous-agents | On compare « déléguer » et « tout faire seul » |

Chaque chapitre contient une explication courte, une scène interactive, les points à retenir, un exemple de code et un quiz de deux questions. Réussir le quiz termine le chapitre.

## Architecture

```
server.js              API REST + fichiers statiques
shared/content.js      contenu des chapitres (textes, code, quiz)
shared/simulation.js   simulations pas à pas (fonctions pures)
public/js/app.js       routeur par hash, page de chapitre, quiz, progression
public/js/art/         le vivarium illustré et ses cinq scènes animées
public/js/home.js      page d'accueil (vivarium, légende, liste des chapitres)
public/js/scenes/      une scène animée par chapitre
test/                  tests node:test de la simulation
scripts/build-demo.js  démo autonome en un fichier, et pages vidéo par scène
videos/scripts.md      scripts des vidéos
```

### API

| Méthode | Route | Rôle |
|---|---|---|
| GET | `/api/chapters` | Liste des chapitres |
| GET | `/api/chapters/:id` | Contenu complet d'un chapitre |
| POST | `/api/simulate` | Trace pas à pas d'un scénario : `{ "scenario": "cycle" \| "couches" \| "capteurs" \| "ecosysteme", "options": {…} }` |
| GET / PUT | `/api/progress/:id` | Progression d'un visiteur (stockée dans `data/progress.json`) |

Le front anime la trace renvoyée par `/api/simulate`. Par exemple :

```bash
curl -X POST localhost:3000/api/simulate -H 'Content-Type: application/json' \
  -d '{"scenario":"capteurs","options":{"hooks":["garde","limiteur"]}}'
```

`shared/` est écrit pour tourner aussi dans le navigateur : si le serveur est injoignable, le front rejoue la même simulation en local et garde la progression dans `localStorage`. C'est ce qui rend la démo en un fichier possible.

## Accessibilité et mobile

- Pensé d'abord pour le téléphone : cibles tactiles de 44 px, aucun défilement horizontal, zones sûres de l'iPhone respectées.
- Thèmes clair et sombre selon le réglage du système.
- `prefers-reduced-motion` : les animations d'ambiance sont coupées et les autres presque instantanées.
- Chaque scène annonce son résultat dans une zone `role="status"`, et tout se pilote au clavier.
