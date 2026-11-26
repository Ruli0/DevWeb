#!/usr/bin/env python3
"""
« Dessins animés » (décision 102, test d'audience : Jules pense que les likes viennent surtout de filles) : même structure que
« L'iceberg » (4 mots, un par étage, du plus facile au plus dur, hibou qui parle, accroche STOP, vol, lecture de l'indice), mais
sur des princesses de dessins animés, décor dégradé rose-violet (`reve`), sans 3D. 4 épisodes-étages + plan d'assemblage.
  python3 scripts/dessins-animes.py   → videos/episodes/dessins-{1..4}.json + videos/studio/dessins/plan.json
Voix : videos/voix-ia/dessins (12 phrases) + « Trop facile ! » et « Ça se corse… » réutilisées de l'iceberg.
Ensuite : presentateur-voix.py sur chaque étage, rendu de chaque étage, bash scripts/assembler-dessins.sh.
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
BASE = json.load(open(os.path.join(R, 'videos/episodes/jeu-mots-mirage-hibou.json')))
X = 0.3
TEMPS = 60 / 108
ETAGES = [
  dict(mot='ELSA', q='Reine des neiges aux pouvoirs de glace', regle='PRINCESSE 1/4', ordre=[3, 1], deb=2.85, pas=2.0, d=11.2,
       lignes=[(0.4, 'STOP ! Quatre princesses. Tu les trouves toutes ?', 'defi', None, False), (2.85, 'Reine des neiges aux pouvoirs de glace…', 'neutre', None, True), (4.87, 'Trop facile !', 'defi', None, False), (8.87, 'Elsa !', 'joie', None, False)],
       sons=[('whoosh.wav', 2.11, .45), ('whoosh.wav', 2.2, .4), ('ailes.wav', 2.2, .3), ('ailes.wav', 3.72, .25), ('pouf.wav', 4.52, .5), ('whoosh.wav', 4.87, .3), ('merveille.wav', 9.0, .4)]),
  dict(mot='ARIEL', q='La petite sirène rousse', regle='PRINCESSE 2/4', ordre=[4, 2], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, 'La petite sirène rousse…', 'neutre', None, True), (2.27, 'Ça se corse…', 'choc', None, False), (6.27, "C'est Ariel !", 'joie', None, False)],
       sons=[('whoosh.wav', 2.27, .3), ('merveille.wav', 6.4, .4)]),
  dict(mot='RAIPONCE', q='Princesse aux cheveux de vingt mètres', regle='PRINCESSE 3/4', ordre=[7, 4], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, 'Princesse aux cheveux de vingt mètres…', 'neutre', None, True), (4.27, "Ouh là, c'est dur !", 'panique', 'tremble', False), (6.32, 'Raiponce !', 'joie', None, False)],
       sons=[('hou-hou.wav', 4.29, .4), ('merveille.wav', 6.45, .4)]),
  dict(mot='CENDRILLON', q='Elle perd sa pantoufle de verre', regle='PRINCESSE 4/4', ordre=[9, 5], deb=0.25, pas=2.4, d=None,
       lignes=[(0.25, 'Elle perd sa pantoufle de verre…', 'neutre', None, True), (5.07, 'Personne trouve celle-là !', 'agace', None, False), (7.47, 'Cendrillon !', 'joie', 'emerveille', False), (8.75, "Un like si t'as tout trouvé !", 'joie', None, False)],
       sons=[('hou-hou.wav', 5.1, .4), ('merveille.wav', 7.42, .55), ('whoosh.wav', 10.7, .3)]),
]
somme = sum(e['d'] for e in ETAGES[:3]) - 3 * X
PUB = round(70 * TEMPS, 4); TOT = round(PUB + 0.4, 4)
ETAGES[3]['d'] = round(TOT - somme, 4)
G, t = [], 0.0
for e in ETAGES: G.append(round(t, 4)); t += e['d'] - X
for k, e in enumerate(ETAGES):
    d = copy.deepcopy(BASE); n = k + 1
    d['id'] = f'dessins-{n}'; d['titre'] = f"Dessins animés, princesse {n} ({e['mot'].lower()})"; d['numero'] = 70 + n
    d['musique'] = 'aucune'; d.pop('voixOff', None)
    d['publication'] = {'texte': "4 princesses, de la plus facile à la plus dure 👑🦉 Tu les trouves toutes ? Envoie-le à ta meilleure amie 💜", 'hashtags': ['#quiz', '#princesse', '#dessinanime', '#devinette', '#hibou'], 'commentaire': "Tu en as trouvé combien sur 4 ? 👇"}
    pl = d['plans'][0]
    pl['mots'][0]['texte'] = e['mot']; pl['mots'][0]['indice'] = {'texte': e['q']}
    nh = len(e['ordre']); rep = round(e['deb'] + e['pas'] * (nh + 1) - 0.5, 4)
    pl['muet'].update({'debuts': [e['deb']], 'reponses': [rep], 'fin': round(e['d'] - rep, 4), 'etapes': {'pas': e['pas'], 'ordre': e['ordre']}})
    pl['regle'] = e['regle']; pl['decor'] = 'reve'; pl['animation'] = 'vinyle'; pl.pop('fondAnime', None); pl.pop('fond3d', None); pl.pop('fond3dOpts', None)
    P = pl['presentateur']; P.pop('corniche', None); P['danse'] = True
    P['lignes'] = [dict({'t': t0, 'texte': tx, 'emotion': em}, **({'folie': fo} if fo else {}), **({'lecture': True} if lu else {})) for t0, tx, em, fo, lu in e['lignes']]
    if n == 1:
        P['accroche'] = {'texte': 'STOP !', 'sous': '4 princesses. Tu les trouves toutes ?', 'fin': 2.45, 'tailleSous': 46}
        P['vol'] = {'depart': 2.2, 'arrivee': 3.0, 'pose': 4.52, 'x': 855, 'y': -871, 'direct': True}
    else: P.pop('accroche', None); P.pop('vol', None); pl.pop('amorceBoucle', None)
    if n == 4: P['cta'] = {'t': 8.4, 'texte': "Tu en as trouvé combien ? 👇", 'haut': True}
    else: P.pop('cta', None)
    pl['sons'] = [{'f': f, 't': t0, 'v': v} for f, t0, v in e['sons']]
    open(os.path.join(R, f'videos/episodes/dessins-{n}.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
os.makedirs(os.path.join(R, 'videos/studio/dessins'), exist_ok=True)
json.dump({'etages': [{'id': f'dessins-{k+1}', 'debut': G[k], 'duree': e['d']} for k, e in enumerate(ETAGES)], 'fondu': X, 'total': TOT, 'publie': PUB, 'tempo': 108},
          open(os.path.join(R, 'videos/studio/dessins/plan.json'), 'w'), indent=2)
print('début des étages', G, 'durées', [e['d'] for e in ETAGES], 'total', TOT, 'publié', PUB)
