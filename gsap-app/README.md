# Gestion des adhérents — GSAP + JavaScript + Node.js

Petite application full‑stack :

- **Back‑end** : Node.js + Express (`server.js`) — API REST, données stockées dans `data/adherents.json` (créé automatiquement).
- **Front‑end** : HTML/CSS/JavaScript natif (`public/`) animé avec **GSAP** (servi depuis `node_modules`, sans CDN).

## Lancer

```bash
cd gsap-app
npm install
npm start          # ou : npm run dev (redémarre à chaque modification)
```

Puis ouvrir http://localhost:3000 (port modifiable avec `PORT=4000 npm start`).

## API

| Méthode | Route                  | Description                               |
|---------|------------------------|-------------------------------------------|
| GET     | `/api/adherents?q=...` | Liste (filtre optionnel)                  |
| POST    | `/api/adherents`       | Ajoute `{prenom, nom, sexe, activite}`    |
| PUT     | `/api/adherents/:id`   | Modifie un adhérent                       |
| DELETE  | `/api/adherents/:id`   | Supprime un adhérent                      |
| GET     | `/api/stats`           | Totaux et répartition par activité        |

## Animations GSAP utilisées

- **Timeline** d'intro : titre découpé lettre par lettre, puis apparition en cascade (`stagger`) des blocs.
- **Bulles d'arrière‑plan** en boucle infinie (`repeat: -1`, `yoyo`, `repeatRefresh`).
- **Flip** : la grille se réorganise en douceur lors d'un ajout, d'une suppression ou d'une recherche.
- **quickTo** : effet d'inclinaison 3D des cartes qui suit la souris.
- **Compteurs animés** pour les statistiques.
- **ScrollTrigger** : le graphique et ses barres s'animent à l'arrivée dans l'écran.
- Secousse `elastic` sur les champs en erreur, et notification « toast » animée.
