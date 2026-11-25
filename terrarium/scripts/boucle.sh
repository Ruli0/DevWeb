#!/usr/bin/env bash
# Boucle parfaite : les dernières images se fondent dans la toute première, pour que TikTok reboucle sans coupure visible
# (revisionnages). Le son s'éteint sur la même durée et attaque proprement au début.
#   bash scripts/boucle.sh <id> [fondu=0.35]
# Modifie videos/studio/<id>/<id>-final.mp4 sur place (garde une copie <id>-sans-boucle.mp4).
set -euo pipefail
ID="$1"; F="${2:-0.35}"; D="$(dirname "$0")/../videos/studio/$ID"; V="$D/$ID-final.mp4"
[ -f "$D/$ID-sans-boucle.mp4" ] && [ "$D/$ID-sans-boucle.mp4" -nt "$V" ] || cp "$V" "$D/$ID-sans-boucle.mp4"   # relance : repartir de la copie d'origine
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$D/$ID-sans-boucle.mp4")
ST=$(python3 -c "print(round($DUR - $F - 0.05, 3))")   # fondu fini 3 images avant la fin : la dernière image = l'image 0
ffmpeg -v error -y -i "$D/$ID-sans-boucle.mp4" -vf "select=eq(n\,0)" -frames:v 1 "$D/image0.png"
ffmpeg -v error -y -i "$D/$ID-sans-boucle.mp4" -loop 1 -t "$DUR" -i "$D/image0.png" \
  -filter_complex "[1:v]format=rgba,fade=t=in:st=$ST:d=$F:alpha=1[i];[0:v][i]overlay=0:0:shortest=1,format=yuv420p[v];[0:a]afade=t=in:st=0:d=0.03,afade=t=out:st=$ST:d=$F[a]" \
  -map "[v]" -map "[a]" -r 60 -c:v libx264 -crf 18 -preset slow -c:a aac -b:a 192k -movflags +faststart "$V"
rm -f "$D/image0.png"
echo "Boucle : $V ($DUR s, fondu de $F s vers l'image 0)"
