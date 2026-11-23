#!/bin/bash
cd /home/user/DevWeb/terrarium
export HF_HUB_DISABLE_XET=1
D=videos/voix/jeu-mots-musique-chrono/brut
/root/.cache/chatterbox-venv/bin/python scripts/voix-clonee.py "Plusieurs notes jouées en même temps." $D/ref.wav $D/m2 3 11 29 >> $D/journal2.txt 2>&1
echo FINI >> $D/journal2.txt
