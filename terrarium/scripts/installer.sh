#!/usr/bin/env bash
# Prépare une session neuve pour fabriquer des vidéos « avis » (voir production/PASSATION-AVIS.md).
#   bash scripts/installer.sh            depuis terrarium/
# Installe : les dépendances Node, la transcription et le débruitage (Python), le CLI de rendu HyperFrames (hors du dépôt).
# Sans danger à relancer. La voix clonée (3,7 Go) n'est pas installée ici : voir la passation, section « Voix clonée ».
set -euo pipefail
cd "$(dirname "$0")/.."

echo "1/4 Dépendances Node"
npm install --silent

echo "2/4 Transcription et débruitage (Python)"
pip install --quiet --root-user-action=ignore faster-whisper pyrnnoise soundfile "numpy<2"

echo "3/4 CLI de rendu HyperFrames, dans ${HYPERFRAMES_DOSSIER:=$HOME/.cache/avis-hyperframes}"
mkdir -p "$HYPERFRAMES_DOSSIER"
if [ ! -x "$HYPERFRAMES_DOSSIER/node_modules/.bin/hyperframes" ]; then
  (cd "$HYPERFRAMES_DOSSIER" && { [ -f package.json ] || npm init -y >/dev/null; } && npm install --silent hyperframes)
fi

echo "4/4 Vérifications"
command -v ffmpeg >/dev/null || { echo "ffmpeg manque"; exit 1; }
NAVIGATEUR=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
[ -x "$NAVIGATEUR" ] || echo "Attention : navigateur de rendu introuvable ($NAVIGATEUR) ; indiquer le bon chemin dans HYPERFRAMES_BROWSER_PATH"
python3 -c "import faster_whisper, pyrnnoise, soundfile" || { echo "Les bibliothèques Python ne se chargent pas"; exit 1; }
npm test 2>&1 | grep -E "^# (pass|fail)"

cat <<FIN

Prêt. Pour rendre une vidéo :
  npm run video -- <id>                      # composition et planche d'aperçu
  cd videos/studio/<id> && HYPERFRAMES_BROWSER_PATH=$NAVIGATEUR \\
    $HYPERFRAMES_DOSSIER/node_modules/.bin/hyperframes render --workers 3 --fps 30 --quiet -o <id>.mp4
La transcription demande l'accès à huggingface.co et us.aws.cdn.hf.co (environnement « DevWeb ») et HF_HUB_DISABLE_XET=1.
FIN
