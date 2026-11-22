# Plan de publication : la première semaine (à partir du 22 novembre 2026)

But : **apprendre avant de développer**. Rien n'est encore publié ; tous les choix (décors, rythme, voix) sont des paris. On publie peu de vidéos, de formes différentes, et on lit les chiffres.

## Les vidéos de la semaine

| Jour | Vidéo | Version | Fichier | Ce qu'on teste |
|---|---|---|---|---|
| 1 | « Plus malin qu'un Robinson ? » | voix clonée | `videos/studio/jeu-plage/jeu-plage-final.mp4` | le jeu parlé |
| 2 | « Plus malin qu'un Robinson ? » | **muet** | `videos/studio/jeu-plage-muet/jeu-plage-muet-final.mp4` | le même jeu sans voix (même grille : comparaison directe) |
| 4 | « Plus malin qu'un académicien ? » | voix clonée | `videos/studio/jeu-langue/jeu-langue-final.mp4` | un deuxième thème |
| 6 | un **avis en voix réelle** (travail et IA, escalade…) | voix de Jules (prompteur) | à enregistrer : `/prompteur` | ta valeur ajoutée contre le jeu |

À publier à la même heure d'un jour à l'autre (noter l'heure), de préférence en soirée. Texte, hashtags et commentaire à épingler : `videos/studio/<id>/publication.md` (généré par `--publier`).

## À cocher à chaque publication

- [ ] Voix clonée : cocher « contenu généré par IA ». Version muette : rien à cocher.
- [ ] Présenter le jeu comme un jeu, pas comme un test scientifique (« indicateur de ton intelligence conversationnelle » est une formule de ton, sans source).
- [ ] Épingler le commentaire proposé (la question de fin) et répondre aux premiers commentaires.
- [ ] Noter la date et l'heure dans `videos/resultats.csv` (ligne créée tout de suite, chiffres vides).

## Relevé à 48 heures

Pour chaque vidéo, dans TikTok (Statistiques) : vues, **part de spectateurs encore là à 3 secondes** (rétention à 3 s), **visionnage complet**, partages, commentaires. Ajouter la ligne dans `videos/resultats.csv` (colonnes : date, video, version, accroche, duree_s, vues, retention_3s_pct, visionnage_complet_pct, partages, commentaires, remarques) puis lancer `node scripts/resultats.js` (résumé par version).

## Règle de décision (après la semaine)

1. Le jeu muet fait-il mieux ou aussi bien que le jeu parlé en rétention à 3 s et en visionnage complet ? Si oui : on garde le muet (plus simple, pas de voix IA).
2. L'avis en voix réelle fait-il plus de commentaires que les jeux ? Si oui : retour aux avis (ta valeur ajoutée), les jeux deviennent un complément.
3. Ce qui retient mal (moins de 30 % à 3 s) : on revoit l'accroche des deux premières secondes avant tout autre développement.
4. **Aucun nouveau développement** de montage avant ces chiffres, sauf pour corriger un bug.

Voir aussi : `ACCROCHES.md` (sept modèles d'accroche), `IDEES-VIDEOS.md`, `APPRENTISSAGES.md` (à remplir après le premier relevé).

## Série « mots fléchés mot par mot » : description générique (21 nov. 2026)
Description à coller (vidéos muettes, pas de mention « contenu généré par IA ») :
> Tu trouves le mot avant la fin du minuteur ? 🧩 Écris le mot mystère de la fin en commentaire 👇 Et dis-moi combien de mots tu as trouvés (1, 2 ou 3) !
> #motsfleches #quiz #jeu #defi #culturegenerale #fyp

Épingler un commentaire du même genre. Couverture à ~0,6 s. Ordre conseillé (une par jour, même heure) : volcans, banquise, ville, forêt, abysses, océan, cuisine. Déjà publiées : espace, jungle, désert.

## Test du format court (21 nov. 2026)
10 vidéos de 15,7 s (`jeu-mots-<thème>-court`), même description générique. Publier à la même heure que les longues, comparer à 24-48 h (≥ 500 vues) : visionnage moyen, % de vision complète, likes, commentaires.

## Prochaine publication (22 nov. 2026) : `jeu-mots-desert-rarete`
Une seule vidéo, pas de série. Ajouter le son TikTok « rare / super rare / legendary » dans l'appli (la vidéo est sans musique), couverture vers 3 s, publier à l'heure des meilleurs résultats passés, commentaire épinglé « Écris le mot mystère ».
Description : « Tu trouves un mot toutes les 5 secondes ? 🏜️ Du commun au légendaire… Écris le mot mystère de la fin en commentaire 👇 Dis-moi à quel mot tu as bloqué ! #motsfleches #quiz #jeu #defi #legendary #fyp »
