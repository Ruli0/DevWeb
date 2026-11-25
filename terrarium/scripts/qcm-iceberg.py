#!/usr/bin/env python3
"""
« L'iceberg du savoir » (QCM) : 10 questions à trois choix, de la surface aux abysses, une toutes les 5 s, avec le hibou,
le fond 3D iceberg et la boucle parfaite. Un seul épisode : videos/episodes/qcm-iceberg.json (gabarit : MIRAGE hibou).
Réponses vérifiées (sources courantes : NOAA, Britannica, musées) : ~90 % d'un iceberg est immergé ; ours polaire en Arctique ;
iceberg = eau douce (glacier) ; Titanic 1912 ; baleine bleue ; 3 cœurs chez la pieuvre ; « corne » du narval = dent ;
fosse des Mariannes ≈ 11 km ; méduse Turritopsis dohrnii ; le rouge est absorbé en premier sous l'eau.
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
d = copy.deepcopy(json.load(open(os.path.join(R, 'videos/episodes/jeu-mots-mirage-hibou.json'))))
Q = [
  ("LA SURFACE", "Quelle part d'un iceberg est sous l'eau ?", ["10 %", "50 %", "90 %"], 2, 0.0, ("Facile !", 'joie')),
  ("LA SURFACE", "Où vit l'ours polaire ?", ["Arctique", "Antarctique", "Les deux"], 0, 0.0, ("Trop facile !", 'defi')),
  ("LA SURFACE", "Un iceberg est fait d'eau…", ["salée", "douce", "gazeuse"], 1, 0.0, ("Ça se corse…", 'choc')),
  ("SOUS L'EAU", "Le Titanic a coulé en…", ["1912", "1923", "1898"], 0, 1.0, ("Aïe…", 'choc')),
  ("SOUS L'EAU", "Le plus grand animal du monde ?", ["Requin-baleine", "Baleine bleue", "Calmar géant"], 1, 1.3, ("Ouh là…", 'agace')),
  ("LES PROFONDEURS", "Combien de cœurs a une pieuvre ?", ["1", "2", "3"], 2, 1.9, ("J'ai froid… très froid !", 'panique')),
  ("LES PROFONDEURS", "La corne du narval est en fait…", ["une dent", "un os", "une nageoire"], 0, 2.2, ("Aïe…", 'choc')),
  ("LES ABYSSES", "Profondeur de la fosse des Mariannes ?", ["3 km", "11 km", "25 km"], 1, 2.8, ("Personne trouve celui-là !", 'agace')),
  ("LES ABYSSES", "Quel animal peut redevenir jeune ?", ["La tortue", "La méduse", "Le requin"], 1, 3.1, ("Ouh là…", 'agace')),
  ("LE FOND", "Quelle couleur disparaît en premier sous l'eau ?", ["Rouge", "Bleu", "Vert"], 0, 3.4, ("Personne l'a !", 'choc')),
]
T0, PAS, REV = 2.7, 5.0, 3.5
TEMPS = 60 / 108; PUB = round(100 * TEMPS, 4); D = round(PUB + 0.4, 4)
pl = d['plans'][0]
d['id'] = 'qcm-iceberg'; d['titre'] = "L'iceberg du savoir (QCM)"; d['numero'] = 60
d['publication'] = {'texte': "10 questions, de la surface aux abysses 🧊🦉 Combien t'en as eu ?", 'hashtags': ['#quiz', '#culturegenerale', '#qcm', '#iceberg', '#hibou'], 'commentaire': "Combien t'en as eu sur 10 ? Le hibou lit tout 👀"}
d.pop('voixOff', None)
pl['mots'][0]['texte'] = 'GLACE'; pl['mots'][0]['indice'] = {'texte': 'glace'}
pl['muet'] = {'intro': 0.3, 'cadence': 3, 'debuts': [0.3], 'reponses': [round(D - 3, 4)], 'fin': 3, 'tempo': 108, 'titreFixe': True}
pl['regle'] = 'QCM'; pl['decor'] = 'banquise'; pl.pop('fondAnime', None); pl.pop('fond3dOpts', None)
pl['qcm'] = {'reponse': REV, 'questions': [{'t': round(T0 + i * PAS, 3), 'etage': e, 'q': q, 'r': r, 'ok': ok} for i, (e, q, r, ok, _, _) in enumerate(Q)]}
prof = [[0, 0]]
for i, x in enumerate(Q):
    if i: prof += [[round(T0 + i * PAS - 0.8, 3), Q[i - 1][4]], [round(T0 + i * PAS - 0.1, 3), x[4]]]
fin = round(T0 + 10 * PAS, 3)
prof += [[54.2, Q[-1][4]], [55.2, 0]]
pl['fond3d'] = 'iceberg'; pl['fond3dOpts'] = {'t0': 0, 'L': PUB, 'prof': prof}
P = pl['presentateur']; P.pop('vol', None); P['corniche'] = True; P['danse'] = True
P['accroche'] = {'texte': 'STOP !', 'sous': '10 questions. Personne arrive au fond.', 'fin': 2.6}
L = [{'t': 0.4, 'texte': 'Personne arrive au fond !', 'emotion': 'defi'}]
for i, x in enumerate(Q):
    l = {'t': round(T0 + i * PAS + REV + 0.05, 3), 'texte': x[5][0], 'emotion': x[5][1]}
    if x[5][1] == 'panique': l['folie'] = 'tremble'
    L.append(l)
L.append({'t': 52.6, 'texte': "Combien t'en as eu sur 10 ?", 'emotion': 'defi'})
P['lignes'] = L
P['cta'] = {'t': 52.6, 'texte': "Combien t'en as eu sur 10 ? 👇", 'haut': True}
S = [{'f': 'whoosh.wav', 't': 2.45, 'v': 0.4}]
for i, x in enumerate(Q):
    ts = T0 + i * PAS
    S.append({'f': 'chrono-3.wav', 't': round(ts + 0.5, 3), 'v': 0.45})
    if i: S.append({'f': 'whoosh.wav', 't': round(ts - 0.32, 3), 'v': 0.25})
    if i and x[4] != Q[i - 1][4]: S.append({'f': 'bulles.wav', 't': round(ts - 0.8, 3), 'v': 0.35})
S += [{'f': 'whoosh.wav', 't': 54.1, 'v': 0.3}, {'f': 'bulles.wav', 't': 54.1, 'v': 0.4}]
pl['sons'] = S
open(os.path.join(R, 'videos/episodes/qcm-iceberg.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
print('durée', D, 'publiée', PUB, 'fin des questions', fin)
