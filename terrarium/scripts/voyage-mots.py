#!/usr/bin/env python3
"""
« Voyage de mots » : générateur RÉUTILISABLE d'une vidéo en 4 étages (un mot par étage, du plus facile au plus long), hibou qui parle,
accroche en gros plan, fond au choix. Premier usage : « 4 princesses, 2e partie » (videos/voyages/princes.json).
  python3 scripts/voyage-mots.py videos/voyages/<id>.json
    → videos/episodes/<id>-{1..4}.json et videos/studio/<id>/plan.json ; puis voyage-rendre.sh <id> (voix, rendu des étages, assemblage).
Spécification JSON (tout est facultatif sauf id, mots, accroche) :
  id, titre ; fond : "chemin" (voyage 3D vers le château, studio/avis/chemin3d.js) ou "reve" (dégradé rose-violet 2D) ;
  costume : "prince" (couronne et cape) ou absent ; croisiere : vrai par défaut avec fond "chemin" (le hibou vole en continu) ;
  mots : 4 × { mot (A-Z sans espace), indice (≤ 7 mots, lu à voix haute et affiché), reponse (« C'est Belle ! », dit par le hibou) } ;
  reactions : 4 phrases courtes (« Trop facile ! », « Ça se corse… », …) ; accroche : { texte, sous, voix, taille, tailleSous, glow, ombre, voile, opaciteVoile } ;
  final : phrase de fin du dernier étage ; cta : appel à commenter (étiquette en haut) ; etiquette : « PRINCESSE » (→ « PRINCESSE 1/4 ») ;
  publication : { texte, hashtags, commentaire } ; fond3dOpts : réglages du voyage 3D (vitesse, flash, porte, lueur… voir chemin3d.js).
Voix : dossier videos/voix-ia/<id>/f1..f4/ (l1.wav…) : f1 = accroche, indice, réaction, réponse ; f2 et f3 = indice, réaction, réponse ;
f4 = indice, réaction, réponse, final (voir production/BIBLIOTHEQUE.md).
"""
import json, copy, os, sys
R = os.path.join(os.path.dirname(__file__), '..')
spec = json.load(open(sys.argv[1] if len(sys.argv) > 1 else os.path.join(R, 'videos/voyages/princes.json')))
ID = spec['id']
BASE = json.load(open(os.path.join(R, 'videos/episodes/jeu-mots-mirage-hibou.json')))
X = 0.3; TEMPS = 60 / 108
M = spec['mots']; assert len(M) == 4, '4 mots exactement'
REAC = spec.get('reactions', ['Trop facile !', 'Ça se corse…', "Ouh là, c'est dur !", 'Personne trouve celle-là !'])
AC = spec['accroche']; FOND = spec.get('fond', 'chemin'); ET = spec.get('etiquette', 'ÉTAPE')
def ordre(n): return [n - 1, round(n / 2)]
# L'accroche parlée dure accroche.duree (s) : l'indice du 1er étage ne démarre qu'après (3,2 s au minimum), et tout le 1er étage se décale d'autant.
SH = max(0.0, round(0.4 + AC.get('duree', 2.2) + 0.15 - 3.2, 2))
ETAGES = [
  dict(m=M[0], deb=round(3.2 + SH, 2), pas=2.0, d=round(11.55 + SH, 2),
       lignes=[(0.4, AC['voix'], 'panique', None, False), (round(3.2 + SH, 2), M[0]['indice'] + '…', 'neutre', None, True), (round(5.22 + SH, 2), REAC[0], 'defi', None, False), (round(9.22 + SH, 2), M[0]['reponse'], 'joie', None, False)],
       sons=[('whoosh.wav', 2.11, .45), ('whoosh.wav', 2.2, .4), ('ailes.wav', 2.2, .3), ('ailes.wav', round(3.72 + SH, 2), .25), ('pouf.wav', round(4.52 + SH, 2), .5), ('whoosh.wav', round(5.22 + SH, 2), .3), ('merveille.wav', round(9.3 + SH, 2), .4)]),
  dict(m=M[1], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, M[1]['indice'] + '…', 'neutre', None, True), (2.27, REAC[1], 'choc', None, False), (6.27, M[1]['reponse'], 'joie', None, False)],
       sons=[('whoosh.wav', 2.27, .3), ('merveille.wav', 6.4, .4)]),
  dict(m=M[2], deb=0.25, pas=2.0, d=8.6,
       lignes=[(0.25, M[2]['indice'] + '…', 'neutre', None, True), (4.27, REAC[2], 'panique', 'tremble', False), (6.32, M[2]['reponse'], 'joie', None, False)],
       sons=[('hou-hou.wav', 4.29, .4), ('merveille.wav', 6.45, .4)]),
  dict(m=M[3], deb=0.25, pas=2.4, d=None,
       lignes=[(0.25, M[3]['indice'] + '…', 'neutre', None, True), (5.07, REAC[3], 'agace', None, False), (7.47, M[3]['reponse'], 'joie', 'emerveille', False), (8.75, spec.get('final', "Un like si t'as tout trouvé !"), 'joie', None, False)],
       sons=[('hou-hou.wav', 5.1, .4), ('merveille.wav', 7.42, .55), ('whoosh.wav', 10.7, .3)]),
]
somme = sum(e['d'] for e in ETAGES[:3]) - 3 * X
PUB = round(70 * TEMPS, 4); TOT = round(PUB + 0.4, 4)
ETAGES[3]['d'] = round(TOT - somme, 4)
G, t = [], 0.0
for e in ETAGES: G.append(round(t, 4)); t += e['d'] - X
for k, e in enumerate(ETAGES):
    d = copy.deepcopy(BASE); n = k + 1; mot = e['m']['mot'].upper()
    d['id'] = f'{ID}-{n}'; d['titre'] = f"{spec.get('titre', ID)}, étage {n} ({mot.lower()})"; d['numero'] = 80 + n
    d['musique'] = 'aucune'; d.pop('voixOff', None)
    if 'publication' in spec: d['publication'] = spec['publication']
    pl = d['plans'][0]
    pl['mots'][0]['texte'] = mot; pl['mots'][0]['indice'] = {'texte': e['m']['indice']}
    o = ordre(len(mot)); nh = len(o); rep = round(e['deb'] + e['pas'] * (nh + 1) - 0.5, 4)
    pl['muet'].update({'debuts': [e['deb']], 'reponses': [rep], 'fin': round(e['d'] - rep, 4), 'etapes': {'pas': e['pas'], 'ordre': o}})
    pl['regle'] = f'{ET} {n}/4'; pl['decor'] = 'reve'; pl['animation'] = 'aucune'; pl.pop('fondAnime', None)
    if FOND == 'chemin':
        pl['fond3d'] = 'chemin'; pl['fond3dRes'] = [720, 1280]; pl['fond3dOpts'] = dict({'t0': G[k], 'L': PUB}, **spec.get('fond3dOpts', {}))
    if FOND == 'chateau2d':   # château dessiné en SVG (voir dessins-animes.py) : la caméra s'approche à chaque mot, la porte s'ouvre à la fin
        pl['fondAnime'] = 'chateau'
        pl['fondAnimeOpts'] = {'t0': G[k], 'L': PUB, 'cles': [[0, 0.55], [G[1], 0.72], [G[2], 0.9], [G[3], 1.15], [G[3] + 7.4, 1.4], [G[3] + 8.5, 1.55], [G[3] + 10.5, 8.0]],
                               'ouvre': [round(G[3] + 9.3, 3), round(G[3] + 10.3, 3)], 'flash': [round(G[3] + 10.2, 3), round(G[3] + 10.65, 3), round(G[3] + 11.2, 3)]}
    P = pl['presentateur']; P.pop('corniche', None); P['danse'] = False
    if spec.get('costume'): P['costume'] = spec['costume']
    if spec.get('croisiere', FOND == 'chemin'): P['croisiere'] = True
    P['lignes'] = [dict({'t': t0, 'texte': tx, 'emotion': em}, **({'folie': fo} if fo else {}), **({'lecture': True} if lu else {})) for t0, tx, em, fo, lu in e['lignes']]
    if n == 1:
        P['accroche'] = {'texte': AC['texte'], 'sous': AC.get('sous', ''), 'fin': 2.45}
        for c in ('taille', 'tailleSous', 'glow', 'ombre', 'voile', 'opaciteVoile'):
            if c in AC: P['accroche'][c] = AC[c]
        P['vol'] = {'depart': 2.2, 'arrivee': 3.0, 'pose': round(4.52 + SH, 2), 'x': 855, 'y': -871, 'direct': True}
    else: P.pop('accroche', None); P.pop('vol', None); pl.pop('amorceBoucle', None)
    if n == 4 and spec.get('cta'): P['cta'] = {'t': 8.4, 'texte': spec['cta'], 'haut': True}
    else: P.pop('cta', None)
    pl['sons'] = [{'f': f, 't': t0, 'v': v} for f, t0, v in e['sons']]
    open(os.path.join(R, f'videos/episodes/{ID}-{n}.json'), 'w').write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
os.makedirs(os.path.join(R, f'videos/studio/{ID}'), exist_ok=True)
json.dump({'etages': [{'id': f'{ID}-{k+1}', 'debut': G[k], 'duree': e['d']} for k, e in enumerate(ETAGES)], 'fondu': X, 'total': TOT, 'publie': PUB, 'tempo': 108},
          open(os.path.join(R, f'videos/studio/{ID}/plan.json'), 'w'), indent=2)
print(ID, 'mots', [e['m']['mot'] for e in ETAGES], 'début des étages', G, 'total', TOT, 'publié', PUB)
