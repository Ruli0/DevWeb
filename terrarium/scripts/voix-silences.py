#!/usr/bin/env python3
"""
Insère de vrais silences dans une voix (typiquement une voix générée, qui n'en a presque pas) après des phrases choisies.
  python3 scripts/voix-silences.py <voix.wav> <mots.json> <sortie.wav> "<phrase>" ["<phrase>" ...] [--duree=0.7]
mots.json : la transcription faite par scripts/voix.py sur ce même fichier. Pour chaque phrase, le silence est posé au milieu du blanc
entre son dernier mot et le mot suivant. Ensuite, relancer scripts/voix.py sur la sortie : les silences deviennent des coupures sur
lesquelles le montage peut insérer ses pauses ("pauses", ou "cadence" du jeu de mots fléchés). Voir production/PASSATION-AVIS.md.
"""
import json, re, subprocess, sys, unicodedata

def cle(t):
    t = unicodedata.normalize('NFD', t.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in t if unicodedata.category(c) != 'Mn'))

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    duree = next((float(a.split('=')[1]) for a in sys.argv[1:] if a.startswith('--duree=')), 0.7)
    if len(args) < 4: sys.exit(__doc__)
    wav, mots_json, sortie, phrases = args[0], args[1], args[2], args[3:]
    d = json.load(open(mots_json)); mots = d['mots']; coupes = []
    for ph in phrases:
        a = [cle(x) for x in ph.split() if cle(x)]
        i = next((i for i in range(len(mots) - len(a) + 1) if all(cle(mots[i + k]['m']) == a[k] for k in range(len(a)))), -1)
        if i < 0 or i + len(a) >= len(mots): sys.exit(f'phrase introuvable (ou dernière) : {ph}')
        fin = mots[i + len(a) - 1]; suivant = mots[i + len(a)]
        coupes.append((fin['f'] + suivant['d']) / 2)
    coupes.sort()
    pts = [0] + coupes + [d['duree'] + 0.5]; filtres = []; liens = []
    for i in range(len(pts) - 1):
        filtres.append(f"[0:a]atrim={pts[i]}:{pts[i + 1]},asetpts=PTS-STARTPTS[a{i}]"); liens.append(f"[a{i}]")
        if i < len(pts) - 2:
            filtres.append(f"anullsrc=r=24000:cl=mono,atrim=0:{duree}[s{i}]"); liens.append(f"[s{i}]")
    filtres.append(''.join(liens) + f"concat=n={len(liens)}:v=0:a=1[out]")
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-filter_complex', ';'.join(filtres), '-map', '[out]', sortie], check=True)
    print(f'{len(coupes)} silences de {duree} s insérés → {sortie}')

if __name__ == '__main__':
    main()
