# Le Terrarium IA : la chaîne de production des vidéos TikTok

Une série de cinq vidéos verticales, une par concept d'agent IA, jouées par les habitants d'un vivarium illustré.

## Le format

- **9:16 plein écran** (1080 × 1920, 30 images/s), de 19 à 24,5 s.
- **Pas de voix off** : le texte à l'écran porte la narration. Il apparaît en gros morceaux de 1 à 5 mots, qui se remplacent sans blanc.
- **Une accroche dès la première image** : une action déjà en mouvement, en gros plan, avec une promesse liée à un problème qu'on vit (« Ton IA ne répond pas. »).
- **Une révélation de 3 à 3,5 s** : une seule phrase forte (« En vrai : … »), pas de bloc de code.
- **Une fin qui boucle** : le dernier plan reprend le cadrage du premier, et la dernière phrase s'enchaîne avec l'accroche.
- **La zone sûre TikTok** (x 60 à 940, y 150 à 1440) : légendes, cartes et sujets filmés y restent. Quand le sujet est bas dans l'image, la légende passe en haut.
- **Le son** : une boucle **phonk** originale (130 BPM, fa mineur : cloche « cowbell », basse 808 saturée, claps, charleston), des bruitages calés sur les actions (langue, avalé, « clac », coassement, gouttes, fourmis…) et une ambiance d'eau en fond. Tout est synthétisé par `scripts/build-sons.js` : libre de droits, utilisable aussi sur Reels et Shorts.
- **Un son tendance plutôt ?** `node scripts/build-video.js --sans-musique` produit les mêmes vidéos sans la phonk, pour ajouter un son de la bibliothèque TikTok dans l'appli. Un son tendance peut aider la diffusion. Un scénario peut aussi choisir `"musique": null`.

## Les épisodes

| # | Vidéo | Concept | Accroche a | Accroche b | Accroche c |
|---|---|---|---|---|---|
| 1 | Le caméléon | La boucle d'outils | Ton IA ne répond pas. | Ton IA est un caméléon. | Regarde sa langue. |
| 2 | La dionée | Les hooks | Ton IA va tout casser. | Comment empêcher une IA… | L'IA voulait tout arracher. |
| 3 | Le ruisseau | Le middleware | Ta question passe… | Où va ta question ? | Ta question est filtrée. |
| 4 | Les fourmis | Le système multi-agents | Une IA seule déborde. | Une IA, trois fourmis. | Comment une IA délègue |
| 5 | La boîte en verre | La fenêtre de contexte | Pourquoi ton IA oublie tout ? | Ton IA a la mémoire courte. | Pourquoi ChatGPT oublie |

Le déroulé complet de chaque vidéo est dans son scénario (`scenarios/<id>.json`). Le texte du post, les hashtags, la couverture et le commentaire à épingler sont dans `hyperframes/<id>/publication.md`.

## De l'idée au MP4

```
videos/scenarios/<id>.json   le scénario : plans, caméra, actions, légendes, carte, accroches, publication
        │  node scripts/build-sons.js     (une fois : synthèse des bruitages dans videos/sons/)
        │  node scripts/build-video.js    (une composition par accroche : <id>, <id>-b, <id>-c)
        ▼
videos/hyperframes/<id>/     index.html + assets/ (GSAP, bruitages) + publication.md
        │  node scripts/verifier-videos.js   (zone sûre et lignes, dans un vrai navigateur)
        │  npx hyperframes lint
        │  npx hyperframes render -o <id>.mp4
        ▼
MP4 1080 × 1920 avec le son
```

`npm test` vérifie aussi les scénarios : durées de lecture, longueur des morceaux, accroche de 3 s au plus, révélation courte, fin qui reprend le cadrage du début, sons existants.

Les bruitages copiés dans chaque composition (`assets/sons/`) ne sont pas versionnés : `build-video.js` les recrée à partir de `videos/sons/`.

### Écrire un scénario

Le format complet est décrit en tête de `shared/scenarios.js`. L'essentiel :

```json
{
  "debut": 7, "fin": 10,
  "camera": { "cible": "cameleon", "zoom": 1.6, "duree": 0.8 },
  "legende": ["Tirer la langue :", "un *appel d'outil*."],
  "actions": [{ "type": "cameleon.langue", "a": 0.4 }]
}
```

- `legende` : une liste de morceaux de 34 caractères au plus. `*mot*` met un mot en valeur (en vert). Chaque morceau reçoit une part du plan proportionnelle à son temps de lecture (0,3 s par mot, plus 0,5 s par morceau). Le validateur refuse un plan trop court pour être lu.
- `camera.cible` : un habitant (`cameleon`, `cameleon-oeil`, `dionee`, `grenouille`, `pousse`, `fourmiliere`), un lieu (`cascade`, `sable`, `mousse`, `galets`, `bassin`, `sol`, `branche`, `ensemble`) ou des coordonnées `[x, y]` dans le dessin (600 × 744). Le sujet est cadré aux deux cinquièmes de la hauteur.
- `carte` : `{ "type": "phrase", "titre": "En vrai", "texte": "…" }`.
- `accroches` : d'autres légendes pour le premier plan, à comparer.
- Les sons sont choisis automatiquement d'après les actions (`videos/sons/table.js`).

## Mesurer et améliorer

1. Publie une variante à la fois, à quelques jours d'écart.
2. Après 48 h, relève dans les statistiques TikTok les vues, la part de spectateurs encore là à 3 s, le temps de visionnage moyen, le taux de visionnage complet et les partages. Note-les dans `resultats.csv`.
3. Après trois publications, garde le style d'accroche qui retient le mieux à 3 s, et réécris les autres dans le même esprit.
