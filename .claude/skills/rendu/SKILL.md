---
name: rendu
description: Rend un épisode du studio vidéo en MP4 (60 images par seconde) avec tous les contrôles avant et après, puis l'envoie à l'utilisateur. À utiliser seulement quand la planche d'aperçu est validée.
---

# Rendu final d'un épisode

Un rendu de 45 s prend plus de 10 minutes : **un seul rendu par tour**, après validation de la planche.

## Avant

Depuis `terrarium/` :

```bash
npm test                                   # tout doit passer
npm run video -- <id> --sans-apercu        # recompile la composition (refuse une fiche « a-verifier » avec --rendu)
```

- La fiche `videos/episodes/<id>.sources.json` a le statut `verifie`. Sinon, s'arrêter et le dire à l'utilisateur.
- Lint, depuis un dossier où le CLI HyperFrames est installé (`npm i hyperframes` dans le dossier temporaire de la session) :
  `npx hyperframes lint --json <chemin>/terrarium/videos/studio/<id>` : 0 erreur attendue (les avertissements de taille de fichier sont connus).

## Rendu

Depuis `terrarium/videos/studio/<id>/`, **en arrière-plan** :

```bash
HYPERFRAMES_BROWSER_PATH=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell \
  npx hyperframes render --workers 3 --fps 60 --quiet -o <id>.mp4
```

## Après

- Durée et cadence : `ffprobe -v error -show_entries format=duration:stream=r_frame_rate -of compact <id>.mp4`.
- Son : niveau moyen autour de −14 dB (`ffmpeg -i <id>.mp4 -vn -af volumedetect -f null -`), silences et reprises aux bons instants.
- Images : extraire 8 images avec ffmpeg, les assembler et les regarder.
- Envoyer le MP4 à l'utilisateur (les MP4 ne vont pas dans le dépôt). Dire ce qui est vérifié et ce qui ne l'est pas (rythme, lisibilité sur son téléphone).
- Noter le tour dans `production/IDENTITE.md`, commit et push.
