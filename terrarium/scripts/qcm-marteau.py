#!/usr/bin/env python3
"""
« 5 coups pour le libérer » : le hibou est pris dans la glace ; accroche en gros plan avec un 1er coup de marteau à 0,3 s ;
5 QCM de 5 s ; chaque bonne réponse = un coup de marteau sur le « ding » (fissures, copeaux, un glaçon de la jauge saute) ;
au 5e coup la glace éclate. Épisode : videos/episodes/qcm-marteau.json (gabarit : qcm-glace).
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
d = copy.deepcopy(json.load(open(os.path.join(R, 'videos/episodes/qcm-glace.json'))))
Q = [
  ("Combien de pattes a une araignée ?", ["6", "8", "10"], 1, "Huit pattes !"),
  ("Planète la plus proche du Soleil ?", ["Vénus", "Mercure", "Mars"], 1, "Mercure !"),
  ("Joueurs d'une équipe de foot sur le terrain ?", ["9", "10", "11"], 2, "Onze joueurs !"),
  ("L'animal terrestre le plus rapide ?", ["Le guépard", "Le lion", "Le cheval"], 0, "Le guépard !"),
  ("Combien d'os dans le corps d'un adulte ?", ["106", "206", "306"], 1, "Deux cent six !"),
]
T0, PAS, REV = 2.0, 5.0, 3.5
TEMPS = 60 / 108; PUB = round(54 * TEMPS, 4); D = round(PUB + 0.4, 4)
d['id'] = 'qcm-marteau'; d['titre'] = '5 coups pour le libérer (QCM)'; d['numero'] = 62
d['publication'] = {'texte': "Chaque bonne réponse = un coup de marteau 🔨🧊 Libère le hibou ! À quel coup t'as raté ?", 'hashtags': ['#quiz', '#culturegenerale', '#qcm', '#hibou', '#defi'], 'commentaire': "À quel coup t'as raté ? 🔨 Le hibou lit tout 👀"}
d.pop('voixOff', None)
pl = d['plans'][0]
pl['muet'].update({'reponses': [round(D - 3, 4)]})
pl['qcm'] = {'reponse': REV, 'questions': [{'t': round(T0 + i * PAS, 3), 'etage': '', 'q': q, 'r': r, 'ok': ok, 'tete': f'COUP {i + 1}/5'} for i, (q, r, ok, _) in enumerate(Q)]}
REVS = [round(T0 + i * PAS + REV, 3) for i in range(5)]
P = pl['presentateur']; P['danse'] = False
P['glace'] = {'marteau': True, 'coups': [0.45] + REVS, 'paliers': [], 'liberation': REVS[4]}
P['accroche'] = {'texte': '5 COUPS', 'sous': '1 bonne réponse = 1 coup de marteau 🔨', 'fin': 1.95, 'taille': 190, 'tailleSous': 62}
L = [{'t': 0.4, 'texte': "Aide-moi ! Chaque bonne réponse, c'est un coup de marteau !", 'emotion': 'panique', 'jusqua': round(T0 + REV - 0.1, 3)}]
for i, x in enumerate(Q): L.append(dict({'t': round(REVS[i] + 0.1, 3), 'texte': x[3], 'emotion': 'joie' if i == 4 else 'choc'}, **({'jusqua': round(T0 + (i + 1) * PAS - 0.55, 3)} if i < 4 else {})))
L.append({'t': round(REVS[4] + 1.35, 3), 'texte': "Libre ! Like si tu m'as sauvé !", 'emotion': 'joie'})
P['lignes'] = L
P['cta'] = {'t': round(REVS[4] + 1.4, 3), 'texte': "À quel coup t'as raté ? 👇", 'haut': True}
S = [{'f': 'coup-glace.wav', 't': 0.45, 'v': 0.7}]
for i in range(5):
    ts = T0 + i * PAS
    S.append({'f': 'chrono-3.wav', 't': round(ts + 0.5, 3), 'v': 0.42})
    if i: S.append({'f': 'whoosh.wav', 't': round(ts - 0.35, 3), 'v': 0.2})
    S.append({'f': 'whoosh.wav', 't': round(REVS[i] - 0.3, 3), 'v': 0.3})
    S.append({'f': 'coup-glace.wav', 't': REVS[i], 'v': 0.65})
S += [{'f': 'bris.wav', 't': REVS[4] + 0.02, 'v': 0.6}, {'f': 'merveille.wav', 't': round(REVS[4] + 0.1, 3), 'v': 0.45}, {'f': 'whoosh.wav', 't': 1.9, 'v': 0.4}]
pl['sons'] = S
open(os.path.join(R, 'videos/episodes/qcm-marteau.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('durée', D, 'publiée', PUB, 'coups', [0.45] + REVS)
