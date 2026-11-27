#!/usr/bin/env python3
"""
« 4 princesses, 2e partie » (décision 104) : même structure que « 4 princesses » (4 mots, un par étage, hibou qui parle) mais
  - le hibou est déguisé en PRINCE (couronne, cape) et vole en continu (`presentateur.croisiere`) ;
  - le fond est le voyage 3D « chemin vers le château » (`fond3d: 'chemin'`, studio/avis/chemin3d.js) : un biome par étage (forêt, prairie,
    lac et pont, jardin royal), la caméra avance sans coupure jusqu'à entrer dans le château ;
  - nouvelle accroche : « AIDE-MOI ! 4 princesses ouvrent le château ».
Mots, indices et réponses vocales : videos/voix-ia/princesses2/mots.json (écrit à la préparation des voix) ; sinon valeurs par défaut.
  python3 scripts/princesses2.py   → videos/episodes/princes-{1..4}.json + videos/studio/princes/plan.json
"""
import json, copy, os
R = os.path.join(os.path.dirname(__file__), '..')
BASE = json.load(open(os.path.join(R, 'videos/episodes/jeu-mots-mirage-hibou.json')))
X = 0.3; TEMPS = 60 / 108
DEF = [('BELLE', 'Elle aime une bête', "C'est Belle !"), ('MULAN', 'Elle se déguise en soldat', "C'est Mulan !"),
       ('AURORE', 'Elle dort cent ans', "C'est Aurore !"), ('POCAHONTAS', 'Elle parle avec le vent', "C'est Pocahontas !")]
mj = os.path.join(R, 'videos/voix-ia/princesses2/mots.json')
M = [(m['mot'].upper(), m['indice'], m['reponse_voix']) for m in json.load(open(mj))['mots']] if os.path.exists(mj) else DEF
assert len(M) == 4
def ordre(n): return [n - 1, round(n / 2)]
HOOK = "Aide-moi ! Quatre princesses ouvrent le château !"
ETAGES = [
  dict(mot=M[0][0], q=M[0][1], regle='PRINCESSE 1/4', deb=3.2, pas=2.0, d=11.55,
       lignes=[(0.4, HOOK, 'panique', None, False), (3.2, M[0][1] + '…', 'neutre', None, True), (5.22, 'Trop facile !', 'defi', None, False), (9.22, M[0][2], 'joie', None, False)],
       sons=[('whoosh.wav', 2.11, .45), ('whoosh.wav', 2.2, .4), ('ailes.wav', 2.2, .3), ('ailes.wav', 3.72, .25), ('pouf.wav', 4.52, .5), ('whoosh.wav', 5.22, .3), ('merveille.wav', 9.3, .4)]),
  dict(mot=M[1][0], q=M[1][1], regle='PRINCESSE 2/4', deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, M[1][1] + '…', 'neutre', None, True), (2.27, 'Ça se corse…', 'choc', None, False), (6.27, M[1][2], 'joie', None, False)],
       sons=[('whoosh.wav', 2.27, .3), ('merveille.wav', 6.4, .4)]),
  dict(mot=M[2][0], q=M[2][1], regle='PRINCESSE 3/4', deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, M[2][1] + '…', 'neutre', None, True), (4.27, "Ouh là, c'est dur !", 'panique', 'tremble', False), (6.32, M[2][2], 'joie', None, False)],
       sons=[('hou-hou.wav', 4.29, .4), ('merveille.wav', 6.45, .4)]),
  dict(mot=M[3][0], q=M[3][1], regle='PRINCESSE 4/4', deb=0.25, pas=2.4, d=None,
       lignes=[(0.25, M[3][1] + '…', 'neutre', None, True), (5.07, 'Personne trouve celle-là !', 'agace', None, False), (7.47, M[3][2], 'joie', 'emerveille', False), (8.75, "Un like si t'as tout trouvé !", 'joie', None, False)],
       sons=[('hou-hou.wav', 5.1, .4), ('merveille.wav', 7.42, .55), ('whoosh.wav', 10.7, .3)]),
]
for e in ETAGES: e['ordre'] = ordre(len(e['mot']))
somme = sum(e['d'] for e in ETAGES[:3]) - 3 * X
PUB = round(70 * TEMPS, 4); TOT = round(PUB + 0.4, 4)
ETAGES[3]['d'] = round(TOT - somme, 4)
G, t = [], 0.0
for e in ETAGES: G.append(round(t, 4)); t += e['d'] - X
for k, e in enumerate(ETAGES):
    d = copy.deepcopy(BASE); n = k + 1
    d['id'] = f'princes-{n}'; d['titre'] = f"4 princesses, 2e partie, étage {n} ({e['mot'].lower()})"; d['numero'] = 80 + n
    d['musique'] = 'aucune'; d.pop('voixOff', None)
    d['publication'] = {'texte': "Le prince hibou doit rejoindre le château 👑🏰 Trouve les 4 princesses pour lui ouvrir la porte ! Laquelle t'as pas trouvée ?", 'hashtags': ['#quiz', '#princesse', '#dessinanime', '#devinette', '#hibou'], 'commentaire': "Laquelle t'as pas trouvée ? 👇"}
    pl = d['plans'][0]
    pl['mots'][0]['texte'] = e['mot']; pl['mots'][0]['indice'] = {'texte': e['q']}
    nh = len(e['ordre']); rep = round(e['deb'] + e['pas'] * (nh + 1) - 0.5, 4)
    pl['muet'].update({'debuts': [e['deb']], 'reponses': [rep], 'fin': round(e['d'] - rep, 4), 'etapes': {'pas': e['pas'], 'ordre': e['ordre']}})
    pl['regle'] = e['regle']; pl['decor'] = 'reve'; pl['animation'] = 'aucune'; pl.pop('fondAnime', None)
    pl['fond3d'] = 'chemin'; pl['fond3dRes'] = [720, 1280]; pl['fond3dOpts'] = {'t0': G[k], 'L': PUB}
    P = pl['presentateur']; P.pop('corniche', None); P['danse'] = False; P['costume'] = 'prince'; P['croisiere'] = True
    P['lignes'] = [dict({'t': t0, 'texte': tx, 'emotion': em}, **({'folie': fo} if fo else {}), **({'lecture': True} if lu else {})) for t0, tx, em, fo, lu in e['lignes']]
    if n == 1:
        P['accroche'] = {'texte': 'AIDE-MOI !', 'sous': '4 princesses ouvrent le château 🏰', 'fin': 2.45, 'taille': 150, 'tailleSous': 44,
                         'voile': 'radial-gradient(circle at 50% 52%, #2a0d5ad9 0%, #12062cf2 100%)', 'opaciteVoile': 0.9, 'glow': '#c46bff', 'ombre': '#4a1a8a'}
        P['vol'] = {'depart': 2.2, 'arrivee': 3.0, 'pose': 4.52, 'x': 855, 'y': -871, 'direct': True}
    else: P.pop('accroche', None); P.pop('vol', None); pl.pop('amorceBoucle', None)
    if n == 4: P['cta'] = {'t': 8.4, 'texte': "Laquelle t'as pas trouvée ? 👇", 'haut': True}
    else: P.pop('cta', None)
    pl['sons'] = [{'f': f, 't': t0, 'v': v} for f, t0, v in e['sons']]
    open(os.path.join(R, f'videos/episodes/princes-{n}.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
os.makedirs(os.path.join(R, 'videos/studio/princes'), exist_ok=True)
json.dump({'etages': [{'id': f'princes-{k+1}', 'debut': G[k], 'duree': e['d']} for k, e in enumerate(ETAGES)], 'fondu': X, 'total': TOT, 'publie': PUB, 'tempo': 108},
          open(os.path.join(R, 'videos/studio/princes/plan.json'), 'w'), indent=2)
print('mots', [e['mot'] for e in ETAGES], 'début des étages', G, 'durées', [e['d'] for e in ETAGES], 'total', TOT, 'publié', PUB)
