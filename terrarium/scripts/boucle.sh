#!/usr/bin/env bash
# Boucle parfaite (image ET son, sans aucune rupture) pour TikTok.
# Principe : l'épisode commence par une amorce de F secondes (musique, hibou au repos, rien d'autre). La vidéo publiée
# commence juste après l'amorce ; ses F dernières secondes se fondent (image et son, en même temps) dans l'amorce.
# Quand TikTok reboucle, on passe de la fin de l'amorce (fondue) à l'instant qui la suit : aucune coupure.
# Pour que le rythme de la musique tombe juste au raccord, la durée publiée (durée - F) doit être un nombre entier de temps.
#   bash scripts/boucle.sh <id> [F=0.4]
# Lit <id>-final.mp4 (ou <id>-sans-boucle.mp4 s'il est plus récent), écrit <id>-final.mp4 (durée - F).
set -euo pipefail
ID="$1"; F="${2:-0.4}"; D="$(dirname "$0")/../videos/studio/$ID"; V="$D/$ID-final.mp4"; B="$D/$ID-sans-boucle.mp4"
if [ ! -f "$B" ] || [ "$V" -nt "$B" ]; then cp "$V" "$B"; fi   # <id>-final.mp4 plus récent = nouveau rendu
ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$B" | grep -q . || { echo "Erreur : $B n'a pas de son" >&2; exit 1; }
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$B")
OFF=$(python3 -c "print(round($DUR - 2 * $F, 4))")
FD=$(python3 -c "print(round($F - 2 / 60, 4))")   # le fondu finit 2 images avant la fin : les dernières images sont l'amorce pure
# Image : la vidéo sans l'amorce, ses dernières images fondues dans l'amorce (xfade).
ffmpeg -v error -y -i "$B" -filter_complex "\
[0:v]split[v1][v2];[v1]trim=start=$F,setpts=PTS-STARTPTS[a];[v2]trim=end=$F,setpts=PTS-STARTPTS[b];\
[a][b]xfade=transition=fade:duration=$FD:offset=$OFF,format=yuv420p[v]" -map "[v]" -an -r 60 -c:v libx264 -crf 18 -preset slow "$D/boucle-image.mp4"
# Son : même opération, échantillon par échantillon (fondu à puissance constante), à la même durée que l'image.
NI=$(ffprobe -v error -count_frames -select_streams v -show_entries stream=nb_read_frames -of csv=p=0 "$D/boucle-image.mp4")
ffmpeg -v error -y -i "$B" -vn -ac 2 -ar 48000 -f f32le "$D/boucle-son.raw"
python3 - "$D/boucle-son.raw" "$F" "$FD" "$NI" <<'PY'
import sys, numpy as np
f, F, FD, NI = sys.argv[1], float(sys.argv[2]), float(sys.argv[3]), int(sys.argv[4])
a = np.fromfile(f, np.float32).reshape(-1, 2); sr = 48000
nF, nFD, n = round(F * sr), round(FD * sr), round(NI / 60 * sr)
A, Bm = a[nF:], a[:nF]                      # sans l'amorce ; l'amorce
off = n - nF                                # le fondu commence là où l'image commence le sien
x = np.linspace(0, 1, nFD, endpoint=False)[:, None]
out = A[:n].copy()
out[off:off + nFD] = A[off:off + nFD] * np.cos(x * np.pi / 2) + Bm[:nFD] * np.sin(x * np.pi / 2)
out[off + nFD:n] = Bm[nFD:nFD + (n - off - nFD)]
out.astype(np.float32).tofile(f)
print(f"son : {n / sr:.3f} s, raccord {np.abs(out[0] - out[-1]).max():.4f}")
PY
ffmpeg -v error -y -i "$D/boucle-image.mp4" -f f32le -ar 48000 -ac 2 -i "$D/boucle-son.raw" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -movflags +faststart "$V"
rm -f "$D/boucle-image.mp4" "$D/boucle-son.raw"
touch "$B"   # l'original reste plus récent que la version bouclée : une relance repart de lui
echo "Boucle : $V ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$V") s ; fondu image + son de $F s vers l'amorce)"
