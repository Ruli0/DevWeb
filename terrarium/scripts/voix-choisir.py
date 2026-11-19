#!/usr/bin/env python3
"""
Choisit la meilleure prise d'une voix générée et la nettoie.
  python3 scripts/voix-choisir.py <script.txt> <sortie.wav> <prise1.wav> [<prise2.wav> ...] [--reponses=coco,soleil,corail]
Pour chaque prise : transcription (faster-whisper, avec le script comme amorce), comparaison au texte du script (mots sans accents ni ponctuation),
puis un rapport : score de ressemblance, mots manquants, mots ajoutés, mots-réponses bien entendus. La prise au meilleur score est écrite dans <sortie.wav>
**coupée juste après le dernier mot du script** (les mots parasites de fin de prise, du type « Moi, euh… », disparaissent).
Refus (code 1) si un mot-réponse déclaré n'est entendu dans aucune prise : régénérer avec une autre graine, ou écrire le mot autrement dans le script.
Ensuite : python3 scripts/voix-silences.py … --auto=0.45, puis python3 scripts/voix.py. Voir production/PASSATION-AVIS.md.
"""
import difflib, os, re, subprocess, sys, unicodedata
import numpy as np

def norme(t):
    t = unicodedata.normalize('NFD', t.lower())
    return re.sub(r'[^a-z0-9]', '', ''.join(c for c in t if unicodedata.category(c) != 'Mn'))

def mots_de(texte):
    return [m for m in (norme(x) for x in re.split(r'[\s\-]+', re.sub(r"(?<=\w)['’](?=\w)", '', texte))) if m]

def decoder(chemin):
    brut = subprocess.run(['ffmpeg', '-v', 'error', '-i', chemin, '-ac', '1', '-ar', '16000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(brut, np.float32)

def analyser(modele, chemin, script, reponses):
    audio = decoder(chemin)
    segments, _ = modele.transcribe(audio, language='fr', word_timestamps=True, initial_prompt=script, condition_on_previous_text=False)
    entendus = []; colle = False
    for sg in segments:
        for w in sg.words:
            brut = w.word.strip(); n = norme(brut)
            if not n: continue
            if (colle or w.word.startswith(("'", '’'))) and entendus: entendus[-1] = (entendus[-1][0] + n, entendus[-1][1], w.end)   # « c' » + « est » = « cest »
            else: entendus.append((n, w.start, w.end))
            colle = brut.endswith(("'", '’'))
    attendus = mots_de(script)
    sm = difflib.SequenceMatcher(a=attendus, b=[m for m, _, _ in entendus], autojunk=False)
    manquants, ajoutes, derniere_fin = [], [], 0.0
    for op, a1, a2, b1, b2 in sm.get_opcodes():
        if op in ('delete', 'replace'): manquants += attendus[a1:a2]
        if op in ('insert', 'replace'): ajoutes += [m for m, _, _ in entendus[b1:b2]]
        if op in ('equal',): derniere_fin = entendus[b2 - 1][2]
    rep_ok = {r: any(m == norme(r) for m, _, _ in entendus) for r in reponses}
    return {'prise': chemin, 'score': round(sm.ratio(), 3), 'manquants': manquants, 'ajoutes': ajoutes, 'reponses': rep_ok, 'fin': derniere_fin, 'duree': len(audio) / 16000}

def main():
    args = [a for a in sys.argv[1:] if not a.startswith('--')]
    reponses = [r for a in sys.argv[1:] if a.startswith('--reponses=') for r in a.split('=', 1)[1].split(',') if r]
    if len(args) < 3: sys.exit(__doc__)
    script = open(args[0], encoding='utf-8').read().strip(); sortie = args[1]; prises = args[2:]
    from faster_whisper import WhisperModel
    modele = WhisperModel('medium', device='cpu', compute_type='int8')
    rapports = [analyser(modele, p, script, reponses) for p in prises]
    for r in rapports:
        print(f"{os.path.basename(r['prise'])} : score {r['score']}, réponses {sum(r['reponses'].values())}/{len(r['reponses'])}, manquants {r['manquants'] or '-'}, ajoutés {r['ajoutes'] or '-'}, durée {r['duree']:.1f} s")
    # les réponses bien entendues d'abord, puis la ressemblance
    rapports.sort(key=lambda r: (sum(r['reponses'].values()), r['score']), reverse=True)
    meilleur = rapports[0]
    mal = [k for k, v in meilleur['reponses'].items() if not v]
    if mal:
        print(f"REFUS : dans la meilleure prise, le(s) mot(s)-réponse {mal} n'est pas entendu. Régénère avec une autre graine ou écris le mot autrement dans le script.")
        sys.exit(1)
    fin = min(meilleur['duree'], meilleur['fin'] + 0.3)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', meilleur['prise'], '-t', f'{fin:.2f}', sortie], check=True)
    print(f"Choisie : {os.path.basename(meilleur['prise'])} (score {meilleur['score']}), coupée à {fin:.1f} s sur {meilleur['duree']:.1f} s → {sortie}")

if __name__ == '__main__':
    main()
