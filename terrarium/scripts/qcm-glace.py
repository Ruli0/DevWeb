#!/usr/bin/env python3
"""
« Libère le hibou » : le hibou est pris dans un bloc de glace ; 5 QCM de 5 s ; à chaque bonne réponse, deux flammes plus
grandes font fondre la glace ; à la 5e, le bloc éclate et le hibou est libre (« Merci ! Like si tu m'as sauvé ! »).
Épisode : videos/episodes/qcm-glace.json (gabarit : qcm-iceberg).
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
d = copy.deepcopy(json.load(open(os.path.join(R, 'videos/episodes/qcm-iceberg.json'))))
Q = [
  ("Quelle part d'un iceberg est sous l'eau ?", ["10 %", "50 %", "90 %"], 2, "Quatre-vingt-dix pour cent !"),
  ("Où vit l'ours polaire ?", ["Arctique", "Antarctique", "Les deux"], 0, "L'Arctique !"),
  ("Le Titanic a coulé en…", ["1912", "1923", "1898"], 0, "En 1912 !"),
  ("Le plus grand animal du monde ?", ["Requin-baleine", "Baleine bleue", "Calmar géant"], 1, "La baleine bleue !"),
  ("Combien de cœurs a une pieuvre ?", ["1", "2", "3"], 2, "Trois cœurs !"),
]
T0, PAS, REV = 1.2, 5.0, 3.5
TEMPS = 60 / 108; PUB = round(51 * TEMPS, 4); D = round(PUB + 0.4, 4)
d['id'] = 'qcm-glace'; d['titre'] = 'Libère le hibou (QCM)'; d['numero'] = 61
d['publication'] = {'texte': "Le hibou est gelé 🥶🦉 Réponds aux 5 questions pour le libérer ! Combien t'en as eu ?", 'hashtags': ['#quiz', '#culturegenerale', '#qcm', '#hibou', '#defi'], 'commentaire': "Combien t'en as eu sur 5 ? Le hibou te remercie 🦉🔥"}
d.pop('voixOff', None)
pl = d['plans'][0]
pl['muet'].update({'reponses': [round(D - 3, 4)]})
pl['qcm'] = {'reponse': REV, 'questions': [dict({'t': round(T0 + i * PAS, 3), 'etage': '', 'q': q, 'r': r, 'ok': ok}, **({'tete': 'LIBÈRE LE HIBOU !'} if i == 0 else {'tete': f'QUESTION {i + 1}/5'})) for i, (q, r, ok, _) in enumerate(Q)]}
pl['fond3d'] = 'iceberg'; pl['fond3dOpts'] = {'t0': 0, 'L': PUB, 'prof': [[0, 0]]}
P = pl['presentateur']; P['danse'] = False
REVS = [round(T0 + i * PAS + REV, 3) for i in range(5)]
P['glace'] = {'paliers': REVS[:4], 'liberation': REVS[4]}
L = [{'t': 0.4, 'texte': "Au secours ! Je suis enfermé dans la glace ! Trouve les réponses !", 'emotion': 'panique', 'jusqua': 4.6}]
for i, x in enumerate(Q): L.append(dict({'t': round(REVS[i] + 0.05, 3), 'texte': x[3], 'emotion': 'joie' if i == 4 else 'choc'}, **({'jusqua': round(T0 + (i + 1) * PAS - 0.55, 3)} if i < 4 else {})))   # la réponse disparaît avec sa question
L.append({'t': round(REVS[4] + 1.35, 3), 'texte': "Merci ! Like si tu m'as sauvé !", 'emotion': 'joie'})
P['lignes'] = L
P['cta'] = {'t': round(REVS[4] + 1.4, 3), 'texte': "Combien t'en as eu sur 5 ? 👇", 'haut': True}
S = []
for i in range(5):
    ts = T0 + i * PAS
    S.append({'f': 'chrono-3.wav', 't': round(ts + 0.5, 3), 'v': 0.45})
    if i: S.append({'f': 'whoosh.wav', 't': round(ts - 0.35, 3), 'v': 0.22})
    S.append({'f': 'feu.wav', 't': round(REVS[i] - 0.02, 3), 'v': 0.5})
S += [{'f': 'bris.wav', 't': REVS[4], 'v': 0.6}, {'f': 'merveille.wav', 't': round(REVS[4] + 0.1, 3), 'v': 0.45}]
pl['sons'] = S
open(os.path.join(R, 'videos/episodes/qcm-glace.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('durée', D, 'publiée', PUB, 'révélations', REVS)
