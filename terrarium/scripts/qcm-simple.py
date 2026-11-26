#!/usr/bin/env python3
"""
« QCM simple » (décision 101) : page nette, sans hibou ni voix, 10 questions à trois choix de la surface aux abysses ;
chaque question dure 5 s de décompte (anneau + chiffre 5-4-3-2-1) puis la réponse ; la question SUIVANTE (carte + réponses)
attend déjà en petit sous le décompte, puis monte prendre sa place ; fond 3D iceberg qui descend d'un cran par question,
jauge de profondeur en mètres ; la 10e reste sans réponse (commentaires). Épisode : videos/episodes/qcm-simple.json.
Réponses vérifiées : voir qcm-iceberg.py.
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
d = copy.deepcopy(json.load(open(os.path.join(R, 'videos/episodes/qcm-iceberg.json'))))
Q = [
  ("LA SURFACE", "Quelle part d'un iceberg est sous l'eau ?", ["10 %", "50 %", "90 %"], 2),
  ("LA SURFACE", "Où vit l'ours polaire ?", ["Arctique", "Antarctique", "Les deux"], 0),
  ("LA SURFACE", "Un iceberg est fait d'eau…", ["salée", "douce", "gazeuse"], 1),
  ("SOUS L'EAU", "Le Titanic a coulé en…", ["1912", "1923", "1898"], 0),
  ("SOUS L'EAU", "Le plus grand animal du monde ?", ["Requin-baleine", "Baleine bleue", "Calmar géant"], 1),
  ("LES PROFONDEURS", "Combien de cœurs a une pieuvre ?", ["1", "2", "3"], 2),
  ("LES PROFONDEURS", "La corne du narval est en fait…", ["une dent", "un os", "une nageoire"], 0),
  ("LES ABYSSES", "Profondeur de la fosse des Mariannes ?", ["3 km", "11 km", "25 km"], 1),
  ("LES ABYSSES", "Quel animal peut redevenir jeune ?", ["La tortue", "La méduse", "Le requin"], 1),
  ("LE FOND", "Quelle couleur disparaît en premier sous l'eau ?", ["Rouge", "Bleu", "Vert"], -1),   # réponse (rouge) laissée aux commentaires
]
A = 0.4                         # amorce de la boucle parfaite
TEMPS = 60 / 108
PAS = round(12 * TEMPS, 4)      # 12 temps = 6,667 s : 5 s de décompte + la réponse
NB = 12 * len(Q) + 4            # 4 temps de plus pour la 10e (« ? » et appel au commentaire)
PUB = round(NB * TEMPS, 4); D = round(PUB + A, 4)
pl = d['plans'][0]
d['id'] = 'qcm-simple'; d['titre'] = "QCM simple : de la surface aux abysses"; d['numero'] = 63
d['publication'] = {'texte': "10 questions, de la surface aux abysses 🧊 Tu tiens jusqu'où ? La dernière, personne la trouve… Envoie-le à un pote qui se croit fort 👀", 'hashtags': ['#quiz', '#culturegenerale', '#qcm', '#iceberg', '#culture'], 'commentaire': "Et la 10e, c'était quoi ? 👇"}
d.pop('voixOff', None); d['voixGeneree'] = False
d['reglages'] = {'musique': 0.5, 'musiqueSeule': 1.0, 'bruitages': 1.0}
pl.pop('presentateur', None)
pl['muet'] = {'intro': 0.3, 'cadence': 3, 'debuts': [0.3], 'reponses': [round(D - 3, 4)], 'fin': 3, 'tempo': 108, 'titreFixe': True}
pl['regle'] = 'QCM'; pl['decor'] = 'banquise'; pl.pop('fondAnime', None)
TS = [round(A + i * PAS, 4) for i in range(len(Q))]
PROFS = [0, 30, 50, 100, 200, 500, 1000, 2000, 5000, 11000]
REV = 5.0
pl['qcm'] = {'simple': True, 'compte': 5, 'profondeurs': PROFS, 'reponse': REV,
             'partage': {'t': round(TS[-1] + REV + 0.35, 3), 'texte': 'Écris la réponse en commentaire 👇'},
             'questions': [{'t': TS[i], 'etage': e, 'q': q, 'r': r, 'ok': ok} for i, (e, q, r, ok) in enumerate(Q)]}
NIV = [round(3.9 * k / 9, 3) for k in range(10)]
prof = [[0, 0]]
for i in range(1, 10): prof += [[round(TS[i] - 0.9, 3), NIV[i - 1]], [round(TS[i] - 0.05, 3), NIV[i]]]
prof += [[round(D - 1.35, 3), NIV[-1]], [round(D - 0.55, 3), 0]]
pl['fond3d'] = 'iceberg'; pl['fond3dOpts'] = {'t0': 0, 'L': PUB, 'prof': prof}
pl['amorceBoucle'] = A
S = []
for i, ts in enumerate(TS):
    S.append({'f': 'chrono-5.wav', 't': round(ts, 3), 'v': 0.5})   # tic-tac toutes les 0,5 s puis plus vite, « ding » à 5,0 s = la réponse
    if i: S.append({'f': 'whoosh.wav', 't': round(ts - 0.38, 3), 'v': 0.22})
    if i and Q[i][0] != Q[i - 1][0]: S.append({'f': 'bulles.wav', 't': round(ts - 0.9, 3), 'v': 0.3})
S += [{'f': 'whoosh.wav', 't': round(D - 1.4, 3), 'v': 0.3}, {'f': 'bulles.wav', 't': round(D - 1.4, 3), 'v': 0.4}]
pl['sons'] = S
open(os.path.join(R, 'videos/episodes/qcm-simple.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('durée', D, 'publiée', PUB, 'questions à', TS)
