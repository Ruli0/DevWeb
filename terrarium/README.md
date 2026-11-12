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
```

## Les cinq chapitres

| Chapitre | Dans le terrarium | Concept agentique | Ce qu'on manipule |
|---|---|---|---|
| 1. Le bocal | Un volume fermé et limité | Fenêtre de contexte, context engineering, compactage | On remplit le bocal, il déborde, on composte |
| 2. Le cycle de l'eau | L'eau qui tourne en boucle | Boucle d'outils | Une goutte avance étape par étape : pensée, appel, résultat, retour au contexte |
| 3. Les couches | Mousse, charbon, terreau, gravier | Middleware | On active et on réordonne les couches : fuite dans le journal, cache, quota |
| 4. Les capteurs | Thermostat, hygromètre | Hooks avant et après l'action | On branche des capteurs qui bloquent, modifient, notent ou informent |
| 5. L'écosystème | Le jardinier et ses petites bêtes | Orchestrateur et sous-agents | On compare « déléguer » et « tout faire seul » |

Chaque chapitre contient une explication courte, une scène interactive, les points à retenir, un exemple de code et un quiz de deux questions. Réussir le quiz termine le chapitre.

## Architecture

```
server.js              API REST + fichiers statiques
shared/content.js      contenu des chapitres (textes, code, quiz)
shared/simulation.js   simulations pas à pas (fonctions pures)
public/js/app.js       routeur par hash, page de chapitre, quiz, progression
public/js/home.js      page d'accueil (le grand bocal en SVG)
public/js/scenes/      une scène animée par chapitre
test/                  tests node:test de la simulation
scripts/build-demo.js  démo autonome en un fichier
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
