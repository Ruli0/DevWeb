---
name: prompteur
description: Ouvre un prompteur (page hébergée) pour que l'auteur lise un texte qui défile et enregistre sa voix depuis son téléphone. À utiliser quand l'auteur demande « /prompteur », un prompteur, ou veut enregistrer sa voix sur un texte.
---

# Prompteur

`/prompteur <id d'épisode | texte libre>`

1. Générer la page : `cd terrarium && node scripts/prompteur.js <id ou texte>` → `videos/studio/prompteur-<id>.html`. Le texte vient de `videos/scripts/<id>.txt`, sinon `videos/voix/<id>/script.txt`, sinon l'argument.
2. La publier avec l'outil Artifact : `file_path` = ce fichier, `icon` « microphone », `capabilities: {"assets": {}, "downloads": true}`. Pour un texte déjà publié, republier le même fichier (même lien). Donner le lien en une ligne.
3. Dire à l'auteur : ouvre le lien sur ton téléphone, appuie sur ● Enregistrer, lis. Si le micro est refusé dans la page (cas probable dans l'app), le texte défile quand même : enregistre avec Dictaphone, puis « Déposer un fichier » et « Envoyer à Claude », ou envoie le fichier dans la conversation.
4. Quand il écrit « envoyé » : `Artifact` `action: "list"`, `scope: "assets"`, `url` = le lien, prendre le plus récent ; `action: "read"` avec `path` = son id (le fichier est un mp4 ou webm audio) ; `ffmpeg -i <fichier> -vn -c:a aac prise.m4a` ; puis `HF_HUB_DISABLE_XET=1 python3 scripts/voix.py prise.m4a <id>` et `node scripts/brouillon.js <id>` (voir le skill `avis`).
5. Dire ce qui n'a pas pu être vérifié : le micro réel du téléphone et le son de la prise.

Réponses courtes, en français.
