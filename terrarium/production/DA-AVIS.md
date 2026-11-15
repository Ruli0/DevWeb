# Chaîne « avis » : la voix d'abord

_Ouverte le 15 novembre 2026, sur la branche `claude/busy-feynman-m0q7yp`. Elle vit à côté de la V3 (cerveau et santé), sans la remplacer._

## L'idée

L'auteur parle librement d'un sujet (travail, escalade, relations…) et enregistre sa voix au téléphone. L'outil nettoie la voix, retire les blancs, et habille le propos : sous-titres calés sur les mots, plans visuels simples au-dessus. La valeur vient du propos et de la voix ; le visuel sert la lecture.

## Le système graphique (le même pour tout le compte)

- Fond presque noir (`#0c0c0e`), texte blanc chaud (`#f3efe6`), un halo de la couleur de la rubrique, du grain.
- **Une couleur par rubrique** : travail `#5b8cff`, escalade `#ff8a3d`, relations `#ff5d7a` (`studio/avis/style.js`).
- Inter Tight 700 pour les titres et les sous-titres, Instrument Serif italique pour le mot fort (`*mot*`), JetBrains Mono pour les étiquettes.
- En haut : barre de progression, nom de la rubrique, numéro. Plans entre y 300 et 1040, sous-titres vers y 1130, rien sous y 1440 (interface de TikTok).
- Quatre plans : `titre`, `liste`, `bascule`, `fin`. La fin pose toujours une question au spectateur.

## Fabriquer une vidéo

```bash
python3 scripts/voix.py <enregistrement.m4a> <id>   # débruitage (RNNoise), transcription, silences → videos/voix/<id>/
# écrire videos/episodes/<id>.json ("version": 4) : modèle valeur-ia.json
npm run video -- <id>                               # composition et planche d'aperçu
```

Dans l'épisode : `retirer` (passages coupés, par leurs premiers et derniers mots), `corrections` (orthographe d'un mot, par son indice dans `mots.json`), `forts` (mots en couleur dans les sous-titres), `plans` (chacun commence sur son ancre `a`, une suite de mots de la voix). Réglages de la voix dans `reglages` (`vitesse`, `respiration`, `musique`).

`scripts/voix.py` demande `pip install faster-whisper pyrnnoise soundfile numpy` et l'accès à `huggingface.co` et `us.aws.cdn.hf.co` (environnement « DevWeb »).

## Limites connues (15 nov. 2026)

- Personne n'a écouté le résultat avant l'auteur : le modèle ne peut pas entendre. Niveaux mesurés seulement.
- Le ton et les intonations ne sont pas modifiés : seuls le bruit, l'égalisation, le niveau, les blancs et la vitesse (+5 %) le sont.
- La musique est « Labo », à bas volume ; une signature sonore propre au compte reste à faire.
- Les plans sont typographiques ; pas encore de schémas dessinés (voie d'escalade, ligne de temps).
