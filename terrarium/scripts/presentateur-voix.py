#!/usr/bin/env python3
"""
Pose la voix du présentateur IA dans un épisode.
  python3 scripts/presentateur-voix.py <id-episode> <dossier-des-prises-choisies>
Le dossier contient l1.wav, l2.wav… (une prise choisie par phrase, cf. voix-choisir.py), dans l'ordre de presentateur.lignes.
Pour chaque phrase : silence de début retiré, niveau ramené à -16 LUFS, copie dans videos/voix/<id>/, enveloppe de la voix
à 30 valeurs par seconde (0 à 1, pour le bec du présentateur). L'épisode reçoit voixOff (une entrée par phrase, à l'instant de
la ligne), voixGeneree: true (rappel « contenu généré par IA ») et les enveloppes.
"""
import json, os, subprocess, sys
import numpy as np

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    ident, dossier = sys.argv[1:3]
    racine = os.path.join(os.path.dirname(__file__), '..')
    chemin = os.path.join(racine, 'videos/episodes', ident + '.json')
    ep = json.load(open(chemin, encoding='utf-8'))
    plan = next(p for p in ep['plans'] if p.get('presentateur'))
    lignes = plan['presentateur']['lignes']
    # Voix de personnage : demi-tons en plus (la vitesse suit, ×2^(n/12)), présence, compression. 0 = voix brute.
    dt = float((plan['presentateur'].get('voix') or {}).get('demiTons', 0))
    perso = (f'asetrate={round(24000 * 2 ** (dt / 12))},aresample=48000,' if dt else '') + 'highpass=f=90,equalizer=f=3000:t=q:w=1:g=3,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,'
    sortie = os.path.join(racine, 'videos/voix', ident); os.makedirs(sortie, exist_ok=True)
    off = []
    for n, l in enumerate(lignes, 1):
        src, dst = os.path.join(dossier, f'l{n}.wav'), os.path.join(sortie, f'l{n}.wav')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-af', 'aresample=24000,silenceremove=start_periods=1:start_threshold=-45dB,' + perso + 'loudnorm=I=-16:TP=-1.5:LRA=7,aresample=48000', '-ac', '1', dst], check=True)
        # Accent (lignes[].accent {debut, db}) : une fin de phrase qui doit claquer, montée après le traitement (le compresseur l'aplatirait).
        if l.get('accent'):
            ac = l['accent']; tmp = dst + '.tmp.wav'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', dst, '-af', f"volume=enable='gte(t,{ac['debut']})':volume={ac['db']}dB,alimiter=limit=0.89:level=false", tmp], check=True); os.replace(tmp, dst)
        brut = subprocess.run(['ffmpeg', '-v', 'error', '-i', dst, '-ac', '1', '-ar', '15000', '-f', 'f32le', '-'], capture_output=True).stdout  # 30 valeurs/s : paquets de 500
        a = np.frombuffer(brut, np.float32)
        rms = np.array([np.sqrt(np.mean(a[i:i + 500] ** 2)) for i in range(0, len(a), 500)]) if len(a) else np.zeros(1)
        env = np.clip(rms / (np.percentile(rms, 90) + 1e-6), 0, 1)
        l['env'] = [round(float(v), 2) for v in env]; l['envHz'] = 30
        duree = round(len(a) / 15000, 2)
        l['duree'] = duree
        off.append({'fichier': f'l{n}.wav', 't': l['t'], 'duree': duree})
        print(f'l{n} : {duree} s, à {l["t"]} s')
    ep['voixOff'] = off; ep['voixGeneree'] = True
    ep.setdefault('reglages', {})['musique'] = 0.6
    open(chemin, 'w', encoding='utf-8').write(json.dumps(ep, ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    main()
