#!/usr/bin/env python3
"""
Fabrique les 4 épisodes-étages de « L'iceberg » (un mot par étage, du plus facile au plus dur) à partir du gabarit hibou
de MIRAGE, avec le fond 3D « iceberg » continu (temps et profondeur globaux), sans musique (elle est ajoutée à l'assemblage).
  python3 scripts/iceberg.py           → videos/episodes/iceberg-{1..4}.json + videos/studio/iceberg/plan.json
Ensuite : voix de chaque étage (presentateur-voix.py), rendu de chaque étage, puis bash scripts/assembler-iceberg.sh.
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
BASE = json.load(open(os.path.join(R, 'videos/episodes/jeu-mots-mirage-hibou.json')))
X = 0.3                                    # fondu entre deux étages
TEMPS = 60 / 108
ETAGES = [
  dict(mot='IGLOO', q='Maison de glace des Inuits', regle='ÉTAGE 1 · LA SURFACE', ordre=[4, 2], deb=1.95, pas=2.0, d=10.3,
       lignes=[(0.4, 'STOP ! Tu vas perdre !', 'defi', None, False), (1.95, 'Maison de glace des Inuits…', 'neutre', None, True), (3.97, 'Trop facile !', 'defi', None, False), (7.97, 'Igloo !', 'joie', None, False)],
       sons=[('whoosh.wav', 1.2, .45), ('whoosh.wav', 1.3, .4), ('ailes.wav', 1.3, .3), ('ailes.wav', 2.82, .25), ('pouf.wav', 3.62, .5), ('whoosh.wav', 3.97, .3), ('bulles.wav', 9.0, .5)]),
  dict(mot='MORSE', q='Gros phoque à défenses', regle="ÉTAGE 2 · SOUS L'EAU", ordre=[4, 2], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, 'Gros phoque à défenses…', 'neutre', None, True), (2.27, 'Ça se corse…', 'choc', None, False), (6.27, 'Morse !', 'joie', None, False)],
       sons=[('whoosh.wav', 2.27, .3), ('bulles.wav', 7.3, .5)]),
  dict(mot='NARVAL', q='La licorne des mers', regle='ÉTAGE 3 · LES PROFONDEURS', ordre=[5, 3], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, 'La licorne des mers…', 'neutre', None, True), (4.27, "J'ai froid… très froid !", 'panique', 'tremble', False), (6.27, 'Narval !', 'joie', None, False)],
       sons=[('gloups.wav', 4.29, .45), ('bulles.wav', 7.3, .5)]),
  dict(mot='KRILL', q='Minuscule crevette, repas des baleines', regle='ÉTAGE 4 · LES ABYSSES', ordre=[4, 2], deb=0.25, pas=2.4, d=None,
       lignes=[(0.25, 'Minuscule crevette, repas des baleines…', 'neutre', None, True), (5.07, 'Personne trouve celui-là !', 'agace', None, False), (7.47, "KRILL ! Like si t'es allé jusqu'au fond !", 'joie', 'emerveille', False), (10.2, 'Encore un ?', 'defi', None, False)],
       sons=[('hou-hou.wav', 5.1, .4), ('merveille.wav', 7.42, .5), ('whoosh.wav', 10.0, .3), ('bulles.wav', 10.0, .45)]),
]
# Durée totale : la vidéo publiée (totale − 0,4 s d'amorce) fait un nombre entier de temps de musique.
somme = sum(e['d'] for e in ETAGES[:3]) - 3 * X
PUB = round(68 * TEMPS, 4); TOT = round(PUB + 0.4, 4)
ETAGES[3]['d'] = round(TOT - somme, 4)
G, t = [], 0.0
for e in ETAGES: G.append(round(t, 4)); t += e['d'] - X
PROF = [[0, 0], [9.0, 0], [10.3, 1.1], [G[1] + 7.3, 1.1], [G[1] + 8.6, 2.2], [G[2] + 7.3, 2.2], [G[2] + 8.6, 3.4], [G[3] + 10.0, 3.4], [G[3] + 11.0, 0]]
for k, e in enumerate(ETAGES):
    d = copy.deepcopy(BASE); n = k + 1
    d['id'] = f'iceberg-{n}'; d['titre'] = f"L'iceberg, étage {n} ({e['mot'].lower()})"; d['numero'] = 50 + n
    d['musique'] = 'aucune'; d.pop('voixOff', None)
    pl = d['plans'][0]
    pl['mots'][0]['texte'] = e['mot']; pl['mots'][0]['indice'] = {'texte': e['q']}
    nh = len(e['ordre']); rep = round(e['deb'] + e['pas'] * (nh + 1) - 0.5, 4)
    pl['muet'].update({'debuts': [e['deb']], 'reponses': [rep], 'fin': round(e['d'] - rep, 4), 'etapes': {'pas': e['pas'], 'ordre': e['ordre']}})
    pl['regle'] = e['regle']; pl['decor'] = 'banquise'; pl.pop('fondAnime', None)
    pl['fond3d'] = 'iceberg'; pl['fond3dOpts'] = {'t0': G[k], 'L': PUB, 'prof': PROF}
    P = pl['presentateur']; P['corniche'] = True; P['danse'] = True
    P['lignes'] = [dict({'t': t0, 'texte': tx, 'emotion': em}, **({'folie': fo} if fo else {}), **({'lecture': True} if lu else {})) for t0, tx, em, fo, lu in e['lignes']]
    if n != 1: P.pop('accroche', None); P.pop('vol', None); pl.pop('amorceBoucle', None)
    if n == 4: P['cta'] = {'t': 8.4, 'texte': "À quel étage t'as coulé ? 👇", 'haut': True}
    else: P.pop('cta', None)
    pl['sons'] = [{'f': f, 't': t0, 'v': v} for f, t0, v in e['sons']]
    pl.pop('fond3dOpts', None) if False else None
    open(os.path.join(R, f'videos/episodes/iceberg-{n}.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
os.makedirs(os.path.join(R, 'videos/studio/iceberg'), exist_ok=True)
json.dump({'etages': [{'id': f'iceberg-{k+1}', 'debut': G[k], 'duree': e['d']} for k, e in enumerate(ETAGES)], 'fondu': X, 'total': TOT, 'publie': PUB, 'tempo': 108},
          open(os.path.join(R, 'videos/studio/iceberg/plan.json'), 'w'), indent=2)
print('début des étages', G, 'durées', [e['d'] for e in ETAGES], 'total', TOT, 'publié', PUB)
