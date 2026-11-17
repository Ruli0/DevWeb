#!/usr/bin/env python3
"""
Génère la voix clonée de l'auteur sur un texte (à utiliser quand il le demande : sa vraie voix reste préférable).
  <venv>/bin/python scripts/voix-clonee.py "<texte>" <reference.wav> <sortie-prefixe> [graine ...]
Écrit <sortie-prefixe>-<graine>.wav pour chaque graine (3 prises par défaut). Voir production/PASSATION-AVIS.md, section 6 bis.
Il faut l'environnement à part (3,7 Go : pip install chatterbox-tts "setuptools<81") et HF_HUB_DISABLE_XET=1.
La référence : une vingtaine de secondes de sa voix, sans silence, en 24 kHz mono (ffmpeg -af silenceremove=...).
Ensuite : retranscrire chaque prise (faster-whisper), garder celle qui dit exactement le texte, puis python3 scripts/voix.py <prise.wav> <id>
et ajouter "generee": true dans videos/voix/<id>/mots.json (le montage ajoute alors le rappel « à signaler comme généré par IA »).
Le modèle pose un filigrane inaudible « généré par IA » : ne pas le retirer.
"""
import sys, time, torch, torchaudio
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

def main():
    if len(sys.argv) < 4: sys.exit(__doc__)
    texte, ref, prefixe = sys.argv[1:4]
    graines = [int(g) for g in sys.argv[4:]] or [3, 11, 29]
    m = ChatterboxMultilingualTTS.from_pretrained(device='cpu')
    for g in graines:
        torch.manual_seed(g); t = time.time()
        wav = m.generate(texte, language_id='fr', audio_prompt_path=ref, exaggeration=0.45, cfg_weight=0.4)
        torchaudio.save(f'{prefixe}-{g}.wav', wav, m.sr)
        print(f'prise {g} : {round(time.time() - t)} s, {wav.shape[-1] / m.sr:.1f} s', flush=True)

if __name__ == '__main__':
    main()
