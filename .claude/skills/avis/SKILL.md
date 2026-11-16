---
name: avis
description: Monte une vidéo « avis » à partir d'un enregistrement de la voix de l'auteur (chaîne « la voix d'abord », "version": 4) - débruitage, transcription, coupes des blancs, sous-titres, plans, décors. À utiliser quand l'auteur envoie un fichier audio ou demande une vidéo où il parle.
---

# Monter une vidéo « avis »

**À lire, et rien d'autre** : `terrarium/production/PASSATION-AVIS.md` (sections 3 et 4) et le modèle `terrarium/videos/episodes/valeur-ia.json`. Ne lire `studio/avis/*.js` que pour ajouter un plan, une illustration ou un décor.

Pour choisir un sujet avec l'auteur : `terrarium/production/IDEES-VIDEOS.md` (idées par rubrique, formats, statuts). Le tenir à jour.

## Étapes

1. **La voix** : `HF_HUB_DISABLE_XET=1 python3 scripts/voix.py <fichier> <id>` depuis `terrarium/`. Lire `videos/voix/<id>/mots.json` en entier : repérer les mots mal transcrits (noms propres) et les passages à retirer.
2. **L'épisode** : `videos/episodes/<id>.json`, `"version": 4`, une `"rubrique"`. Un plan toutes les 4 à 7 secondes, ancré sur les mots dits. Presque tous les plans sont `visuel` (sans texte) : au plus trois textes par vidéo (accroche, mot fort, question de fin). Alterner fonds unis et décors illustrés. Finir par un plan `fin` (`"apres": 3.2`) qui pose une question.
3. **La planche** : `npm run video -- <id>`, regarder `videos/studio/<id>/apercu.png`. Corriger d'après les messages du montage et d'après l'image.
4. **Tests** : `npm test`.
5. **Rendu** en 30 images par seconde pour un avis, en 60 pour la version finale (commande dans la passation), puis envoyer le MP4 comme fichier.
6. **Dire à l'auteur**, en peu de mots : ce qui a changé, ce qui n'a pas pu être vérifié (le son : le modèle ne peut pas écouter), une seule question.

## À ne pas faire

- Couper au milieu d'une phrase sans que l'auteur puisse l'entendre : couper de silence à silence (`"retirer"`).
- Changer les mots affichés par rapport à ce qui est dit (seule l'orthographe se corrige).
- Proposer une voix de synthèse.
- Retoucher `videos/studio/<id>/index.html` à la main : l'épisode est la source.
