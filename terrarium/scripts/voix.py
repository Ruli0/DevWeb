#!/usr/bin/env python3
"""
Prépare une voix enregistrée au téléphone pour la chaîne « avis » (voir production/DA-AVIS.md).
  python3 scripts/voix.py <enregistrement.m4a> <id>
Écrit videos/voix/<id>/ :
  propre.flac  la voix débruitée (RNNoise), non coupée, 48 kHz mono
  mots.json    { duree, mots: [{ m, d, f }], silences: [[debut, fin]] }
Dépendances : ffmpeg, et `pip install faster-whisper pyrnnoise soundfile numpy`.
Le modèle de transcription vient de huggingface.co (à autoriser dans l'environnement).
"""
import json, os, subprocess, sys
import numpy as np
import soundfile as sf

SR = 48000

def decoder(chemin, sr):
    brut = subprocess.run(['ffmpeg', '-v', 'error', '-i', chemin, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'],
                          check=True, capture_output=True).stdout
    return np.frombuffer(brut, dtype=np.int16)

def debruiter(x):
    from pyrnnoise import RNNoise
    d = RNNoise(sample_rate=SR)
    return np.concatenate([np.asarray(t).reshape(-1) for _, t in d.denoise_chunk(x[None, :])])

def silences(y, seuil_db=-42.0, mini=0.16):
    """Plages où la voix débruitée reste sous le seuil (relatif à son niveau fort) pendant au moins `mini` s."""
    v = y.astype(np.float64) / 32768
    pas = SR // 100
    n = len(v) // pas
    rms = np.sqrt(np.mean(v[:n * pas].reshape(n, pas) ** 2, axis=1) + 1e-12)
    ref = np.percentile(rms, 95)
    calme = 20 * np.log10(rms / ref) < seuil_db
    out, debut = [], None
    for i, c in enumerate(list(calme) + [False]):
        if c and debut is None: debut = i
        if not c and debut is not None:
            if (i - debut) / 100 >= mini: out.append([round(debut / 100, 2), round(i / 100, 2)])
            debut = None
    return out

def transcrire(chemin, sil=None, invite=None):
    """Transcription mot par mot. Whisper date mal les mots d'une longue piste qui contient de longs blancs (dérive de plusieurs secondes) :
    on transcrit donc chaque PHRASE séparément (les plages de parole entre deux silences d'au moins 0,3 s) et on remet les dates à l'échelle de la piste.
    invite : un texte (le script) qui aide Whisper à retrouver les bons mots (réponses courtes, noms propres)."""
    from faster_whisper import WhisperModel
    modele = WhisperModel('medium', device='cpu', compute_type='int8')
    audio = decoder(chemin, 16000).astype(np.float32) / 32768
    duree = len(audio) / 16000
    blancs = [(a, b) for a, b in (sil or []) if b - a >= 0.3]
    zones, depart = [], 0.0
    for a, b in blancs + [(duree, duree)]:
        if a - depart >= 0.12: zones.append((max(0.0, depart - 0.08), min(duree, a + 0.08)))
        depart = b
    if not blancs: zones = [(0.0, duree)]
    mots = []
    for z0, z1 in zones:
        morceau = audio[int(z0 * 16000):int(z1 * 16000)]
        segments, _ = modele.transcribe(morceau, language='fr', word_timestamps=True, initial_prompt=invite, condition_on_previous_text=False)
        for sg in segments:
            for w in sg.words:
                d, f = round(w.start + z0, 2), round(w.end + z0, 2)
                # Whisper sépare « l » et « 'ère » : on recolle ce qui n'est pas précédé d'une espace.
                if mots and not w.word.startswith(' '):
                    mots[-1]['m'] += w.word; mots[-1]['f'] = f
                else:
                    mots.append({'m': w.word.strip(), 'd': d, 'f': f})
    return dedoublonner(mots)

def dedoublonner(mots):
    """Whisper répète parfois une phrase quand un blanc suit (« Académicien ou singe ? Académicien ou singe ? ») : on retire le premier bloc d'une répétition
    immédiate de 1 à 4 mots."""
    import re
    norm = lambda w: re.sub(r'[^a-z0-9àâäéèêëîïôöùûüç]', '', w['m'].lower())
    i = 0
    while i < len(mots):
        for n in (4, 3, 2, 1):
            if i + 2 * n <= len(mots) and all(norm(mots[i + k]) == norm(mots[i + n + k]) for k in range(n)) and any(norm(mots[i + k]) for k in range(n)):
                del mots[i:i + n]; i -= 1; break
        i += 1
    return mots

def main():
    if len(sys.argv) != 3: sys.exit(__doc__)
    source, ident = sys.argv[1], sys.argv[2]
    dossier = os.path.join(os.path.dirname(__file__), '..', 'videos', 'voix', ident)
    os.makedirs(dossier, exist_ok=True)
    y = debruiter(decoder(source, SR))
    sf.write(os.path.join(dossier, 'propre.flac'), y, SR)
    sil = silences(y)
    script = os.path.join(dossier, '..', '..', 'scripts', ident + '.txt')
    invite = open(script, encoding='utf-8').read().strip() if os.path.exists(script) else None
    mots = transcrire(source, sil, invite)
    donnees = {'duree': round(len(y) / SR, 2), 'mots': mots, 'silences': sil}
    with open(os.path.join(dossier, 'mots.json'), 'w') as f:
        f.write('{\n "duree": %s,\n "mots": [\n  %s\n ],\n "silences": %s\n}\n' % (
            donnees['duree'], ',\n  '.join(json.dumps(m, ensure_ascii=False) for m in mots), json.dumps(donnees['silences'])))
    print(f"{ident} : {donnees['duree']} s, {len(mots)} mots, {len(donnees['silences'])} silences")

if __name__ == '__main__':
    main()
