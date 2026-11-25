#!/usr/bin/env python3
"""
Voix de synthèse (voix intégrée de Chatterbox, pas celle de l'auteur) pour le présentateur IA.
  <venv>/bin/python scripts/voix-ia.py <dossier-sortie> [--exag=0.6] [--cfg=0.4] [--graines=3,11,29] "<phrase 1>" "<phrase 2>" ...
Écrit <dossier>/l<n>-<graine>.wav (3 prises par phrase). Le choix de la meilleure prise se fait ensuite
(transcription faster-whisper). Le modèle pose un filigrane inaudible « généré par IA » : ne pas le retirer.
Il faut HF_HUB_DISABLE_XET=1.
"""
import sys, os, time, torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

def main():
    if len(sys.argv) < 3: sys.exit(__doc__)
    opts = dict(a[2:].split('=', 1) for a in sys.argv[2:] if a.startswith('--'))
    dossier, phrases = sys.argv[1], [a for a in sys.argv[2:] if not a.startswith('--')]
    exag, cfg = float(opts.get('exag', 0.6)), float(opts.get('cfg', 0.4))
    graines = [int(g) for g in opts.get('graines', '3,11,29').split(',')]
    os.makedirs(dossier, exist_ok=True)
    m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
    for n, texte in enumerate(phrases, 1):
        for g in graines:
            torch.manual_seed(g); t = time.time()
            wav = m.generate(texte, language_id='fr', exaggeration=exag, cfg_weight=cfg)
            torchaudio.save(f'{dossier}/l{n}-{g}.wav', wav, m.sr)
            print(f'l{n} prise {g} : {round(time.time() - t)} s, {wav.shape[-1] / m.sr:.1f} s', flush=True)

if __name__ == '__main__':
    main()
