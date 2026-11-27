#!/usr/bin/env bash
# Rend un « voyage de mots » de bout en bout : voix de chaque étage (presentateur-voix.py), rendu des 4 étages, assemblage + boucle.
#   bash scripts/voyage-rendre.sh <id>     (après : python3 scripts/voyage-mots.py videos/voyages/<id>.json et les voix dans videos/voix-ia/<id>/f1..f4)
set -euo pipefail
ID="$1"; R="$(cd "$(dirname "$0")/.." && pwd)"; cd "$R"
for n in 1 2 3 4; do
  python3 scripts/presentateur-voix.py "$ID-$n" "videos/voix-ia/$ID/f$n" < /dev/null
  mkdir -p "videos/studio/$ID-$n"
  npm run video -- "$ID-$n" --publier > "videos/studio/$ID-$n/rendu.log" 2>&1
done
bash scripts/assembler-etages.sh "$ID"
echo "Vidéo : videos/studio/$ID/$ID-final.mp4"
