#!/usr/bin/env bash
# Accroche « la fin d'abord » (décision 100, variante C) : montre le moment le plus fort de la vidéo
# (ex. la glace qui éclate) pendant ~1,6 s avec « 30 SECONDES PLUS TÔT… », puis la vidéo entière.
#   bash scripts/accroche-flash.sh <id-source> <debut_s> <fin_s> <id-sortie> ["texte"]
# Source : videos/studio/<id-source>/<id-source>-final.mp4 ; sortie : videos/studio/<id-sortie>/<id-sortie>-final.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=videos/studio/$1/$1-final.mp4; A=$2; B=$3; OUT=videos/studio/$4; TXT=${5:-"30 SECONDES PLUS TÔT…"}
POLICE=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf
mkdir -p "$OUT"
D=$(python3 -c "print(round($B-$A,3))"); T1=$(python3 -c "print(round($B-$A-0.7,3))")
ffmpeg -v error -y -i "$SRC" -filter_complex "
[0:v]trim=$A:$B,setpts=PTS-STARTPTS,drawtext=fontfile=$POLICE:text='$TXT':fontsize=62:fontcolor=white:box=1:boxcolor=black@0.65:boxborderw=26:x=(w-tw)/2:y=1020:enable='gte(t,$T1)'[v1];
[0:a]atrim=$A:$B,asetpts=PTS-STARTPTS,afade=t=out:st=$(python3 -c "print(round($D-0.12,3))"):d=0.12[a1];
[0:v]setpts=PTS-STARTPTS[v2];[0:a]asetpts=PTS-STARTPTS[a2];
[v1][a1][v2][a2]concat=n=2:v=1:a=1[v][a]" -map "[v]" -map "[a]" -r 60 -c:v libx264 -crf 16 -preset medium -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart "$OUT/$4-final.mp4"
echo "Vidéo : $OUT/$4-final.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$OUT/$4-final.mp4") s)"
