#!/usr/bin/env bash
# Assemble « Dessins animés » : les 4 étages rendus (videos/studio/dessins-N/iceberg-N-final.mp4), enchaînés par des fondus de
# 0,3 s sur des fonds identiques (même temps global), une seule musique « Rêverie » continue sous les voix, puis la boucle parfaite.
#   bash scripts/assembler-dessins.sh   → videos/studio/dessins/dessins-final.mp4
set -euo pipefail
R="$(cd "$(dirname "$0")/.." && pwd)"; D="$R/videos/studio/dessins"; P="$D/plan.json"
python3 - "$R" "$P" "$D" <<'PY'
import json, subprocess, sys
R, P, D = sys.argv[1:4]; pl = json.load(open(P)); X = pl['fondu']; E = pl['etages']
ins = sum([['-i', f"{R}/videos/studio/{e['id']}/{e['id']}-final.mp4"] for e in E], [])
f, v, a, off = [], '[0:v]', '[0:a]', 0.0
for k in range(1, len(E)):
    off += E[k - 1]['duree'] - X
    f.append(f"{v}[{k}:v]xfade=transition=fade:duration={X}:offset={off:.4f}[v{k}]"); v = f'[v{k}]'
    f.append(f"{a}[{k}:a]acrossfade=d={X}:c1=tri:c2=tri[a{k}]"); a = f'[a{k}]'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(f), '-map', v, '-map', a, '-r', '60', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-c:a', 'pcm_s16le', f'{D}/sans-musique.mkv'], check=True)
PY
TOT=$(python3 -c "import json;print(json.load(open('$P'))['total'])")
node -e "
const A = require('$R/scripts/sons-avis.js'), O = require('$R/scripts/build-sons.js').outils;
O.ecrireWav('$D/musique.wav', O.normaliser(A.vive('reverie', { duree: $TOT + 0.3, tempo: 108 }), 0.8), true);"
ffmpeg -v error -y -i "$D/sans-musique.mkv" -i "$D/musique.wav" -filter_complex "[1:a]volume=0.5,atrim=0:$TOT[m];[0:a][m]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.6:level=false[s]" -map 0:v -map "[s]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$D/dessins-final.mp4"
rm -f "$D/dessins-sans-boucle.mp4"
bash "$R/scripts/boucle.sh" dessins 0.4
