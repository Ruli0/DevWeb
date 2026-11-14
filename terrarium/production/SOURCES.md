# La règle scientifique

_Écrit le 14 novembre 2026. Elle s'applique à tous les épisodes de la V3._

## La règle

**Aucun chiffre et aucune affirmation scientifique à l'écran sans fiche de source vérifiée.** Un épisode sans fiche complète ne se compile pas.

Le public est adulte : une erreur ou une exagération se voit, se commente et détruit la crédibilité du compte.

## Choisir une étude

Par ordre de préférence :
1. une **méta-analyse** ou une revue systématique ;
2. une étude **répliquée**, ou de grande taille ;
3. une étude classique, **en signalant** si sa réplication est discutée.

À éviter : une étude isolée sur un petit échantillon présentée comme une vérité, un communiqué de presse, un article de blog, un chiffre « connu de tous » sans origine.

## Vérifier

1. **Chercher la source d'origine** : auteurs, année, revue, volume, pages, DOI.
2. **Lire le chiffre dans l'article**, ou à défaut dans le résumé officiel. Si seules des sources secondaires le donnent, la fiche le dit, et l'épisode ne peut pas être publié tel quel (statut « à vérifier »).
3. **Vérifier ce que l'étude mesure vraiment** : sur qui, combien de personnes, corrélation ou causalité.
4. **Chercher les critiques** : échecs de réplication, limites reconnues par les auteurs.

Ne jamais inventer une référence, un chiffre ou une citation. Si la recherche ne confirme pas, on change d'angle ou d'étude.

## Formuler à l'écran

- **Pas d'arrondi silencieux** : « 46 % » ne devient pas « 50 % ». On peut écrire « près de la moitié » si le chiffre exact figure dans la fiche et dans le texte du post.
- **Pas de causalité inventée** : une corrélation se dit « est lié à », pas « provoque ».
- **Pas de généralisation** : « des étudiants américains », pas « tout le monde », quand c'est le cas.
- **La source est visible** à chaque chiffre : auteur principal, année, revue abrégée (par exemple « Steel, 2007, Psychological Bulletin »).
- **Le geste proposé** vient d'une étude, ou il est présenté comme une piste (« essaie »), jamais comme un traitement.
- **Jamais** : promesse de guérison, diagnostic, conseil de médicament ou d'arrêt de traitement. Mention en fin de vidéo : « information, pas un avis médical ».

## La fiche de sources d'un épisode

Un fichier `videos/episodes/<id>.sources.json`, à côté de l'épisode :

```json
{
  "episode": "procrastination",
  "statut": "verifie",
  "verifie_le": "2026-11-14",
  "affirmations": [
    {
      "id": "c1",
      "texte_ecran": "le texte exact affiché dans la vidéo",
      "type": "chiffre",
      "valeur": "la valeur exacte de l'article",
      "reference": "Auteur, A., & Auteur, B. (année). Titre. Revue, volume(numéro), pages.",
      "doi": "10.xxxx/xxxxx",
      "citation_origine": "la phrase de l'article ou du résumé qui porte le chiffre",
      "lu_dans": "article",
      "population": "qui a été étudié, et combien",
      "limites": "ce que l'étude ne dit pas",
      "affichage_source": "Auteur, année, Revue"
    }
  ]
}
```

- `statut` : `verifie` (toutes les affirmations sont lues dans l'article ou le résumé officiel) ou `a-verifier` (au moins une vient de sources secondaires). Seul `verifie` autorise le rendu final.
- `type` : `chiffre`, `mecanisme` ou `geste`.
- `lu_dans` : `article`, `resume` ou `secondaire`.
- Dans l'épisode, chaque scène qui affiche un fait porte `"source": "c1"`. Le compilateur vérifie que la fiche existe, que l'identifiant existe, et que `texte_ecran` correspond au texte de la scène.

## Un exemple de ce qu'il ne faut pas refaire

L'épisode « La peur du jugement » (version terrarium) affichait « 50 % » et « 25 % » pour l'étude de Gilovich, Medvec et Savitsky (2000). Les sources secondaires consultées donnaient environ 46 % et 23 %, et l'article original n'avait pas été lu. Avec cette règle, sa fiche aurait eu le statut `a-verifier` et l'épisode n'aurait pas été rendu.
