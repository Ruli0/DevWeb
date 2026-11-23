#!/bin/bash
cd /home/user/DevWeb/terrarium
export HF_HUB_DISABLE_XET=1
D=videos/voix/jeu-mots-musique-chrono/brut
PY=/root/.cache/chatterbox-venv/bin/python
i=0
while IFS= read -r ligne; do
  i=$((i+1))
  $PY scripts/voix-clonee.py "$ligne" $D/ref.wav $D/l$i 3 11 >> $D/journal.txt 2>&1
done <<'TXT'
On le fait sous la douche.
Ce qu'on fait avec des écouteurs.
Like si tu as trouvé ! La troisième est vraiment compliquée.
Ce qui distingue le son d'une guitare de celui d'un piano.
L'instrument à quatre-vingt-huit touches. Écris la réponse en commentaire.
TXT
echo FINI >> $D/journal.txt
