// La chaîne « avis » : montage de la voix, sous-titres et ancres des plans.
'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { montage, chercher, garder, horloge, reunir } = require('../studio/avis/montage.js');

const voix = {
  duree: 10,
  mots: [
    { m: 'Bon,', d: 0.5, f: 0.9 }, { m: 'alors', d: 1.0, f: 1.4 },
    { m: 'La', d: 3.0, f: 3.2 }, { m: 'clarté', d: 3.2, f: 3.8 }, { m: 'compte.', d: 3.9, f: 4.5 },
    { m: "L'impro", d: 6.0, f: 6.6 }, { m: 'aide', d: 6.7, f: 7.0 }, { m: 'vraiment.', d: 7.1, f: 7.8 },
  ],
  silences: [[0, 0.45], [1.5, 2.95], [4.6, 5.95], [8.0, 10]],
};
const episode = (plus) => Object.assign({
  version: 4, id: 'essai', rubrique: 'travail', essai: true,
  plans: [{ plan: 'titre', texte: 'La *clarté*' }, { plan: 'titre', a: "l'impro", texte: 'Impro' }, { plan: 'fin', apres: 3, texte: 'Et *toi* ?' }],
}, plus);

test('chercher : retrouve une ancre sans tenir compte de la casse ni de la ponctuation', () => {
  assert.strictEqual(chercher(voix.mots, 'la clarté'), 2);
  assert.strictEqual(chercher(voix.mots, 'L’impro'), 5);
  assert.strictEqual(chercher(voix.mots, 'absent'), -1);
});

test('reunir : fusionne les intervalles qui se chevauchent', () => {
  assert.deepStrictEqual(reunir([[3, 4], [0, 1], [0.5, 2]]), [[0, 2], [3, 4]]);
});

test('garder : les silences sont réduits à une respiration et la voix montée est plus courte', () => {
  const g = garder(voix, [], { respiration: 0.14, marge: 0.05 });
  const total = g.reduce((n, [a, b]) => n + b - a, 0);
  assert.ok(total < 6 && total > 4.5, `durée gardée ${total}`);
  const h = horloge(g, 1);
  assert.ok(h(3.0) < 2.0, 'le mot après un long silence est avancé');
  assert.ok(h(6.0) > h(3.9), 'l’ordre des mots est conservé');
});

test('montage : un passage retiré disparaît des sous-titres et la vidéo commence sur le mot suivant', () => {
  const { erreurs, feuille } = montage(episode({ retirer: [['Bon,', 'alors']] }), voix);
  assert.deepStrictEqual(erreurs, []);
  const mots = feuille.groupes.flatMap((g) => g.mots.map((m) => m.m));
  assert.deepStrictEqual(mots.slice(0, 2), ['La', 'clarté']);
  assert.ok(feuille.groupes[0].t0 < 0.2);
  assert.strictEqual(feuille.duree, +(feuille.dureeVoix + 3).toFixed(3));
});

test('montage : chaque plan commence sur son ancre, et les erreurs disent quoi changer', () => {
  const { feuille } = montage(episode(), voix);
  const impro = feuille.groupes.flatMap((g) => g.mots).find((m) => m.m === "L'impro");
  assert.ok(Math.abs(feuille.plans[1].t0 - (impro.t - 0.12)) < 0.01);
  const r = montage(episode({ rubrique: 'cuisine', plans: [{ plan: 'titre', texte: 'x' }, { plan: 'titre', a: 'introuvable', texte: 'y' }] }), voix);
  assert.ok(r.erreurs.some((e) => e.includes('rubrique')));
  assert.ok(r.erreurs.some((e) => e.includes('introuvable')));
});

test('montage : sous-titres courts, mots forts marqués, corrections appliquées', () => {
  const { feuille } = montage(episode({ forts: ['clarté'], corrections: { 1: '' } }), voix);
  feuille.groupes.forEach((g) => assert.ok(g.mots.length <= 4 && g.t1 > g.t0));
  const mots = feuille.groupes.flatMap((g) => g.mots);
  assert.ok(mots.find((m) => m.m === 'clarté').fort);
  assert.ok(!mots.some((m) => m.m === 'alors'));
});

test('l’épisode valeur-ia se monte sans erreur', () => {
  const racine = path.join(__dirname, '..');
  const ep = JSON.parse(fs.readFileSync(path.join(racine, 'videos/episodes/valeur-ia.json'), 'utf8'));
  const v = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix/valeur-ia/mots.json'), 'utf8'));
  const { erreurs, feuille } = montage(ep, v);
  assert.deepStrictEqual(erreurs, []);
  assert.ok(feuille.duree < 60);
});

test('maquette de voix : un script donne des mots horodatés, et l’épisode d’escalade se monte dessus', () => {
  const { estimer } = require('../scripts/maquette-voix.js');
  const v = estimer('Un : la réglette. Doigts tendus ?');
  assert.deepStrictEqual(v.mots.map((m) => m.m), ['Un :', 'la', 'réglette.', 'Doigts', 'tendus ?']);
  v.mots.forEach((m, i) => { assert.ok(m.f > m.d); if (i) assert.ok(m.d >= v.mots[i - 1].f); });
  assert.strictEqual(chercher(v.mots, 'Un : la réglette'), 0);
  const racine = path.join(__dirname, '..');
  const ep = JSON.parse(fs.readFileSync(path.join(racine, 'videos/episodes/escalade-techniques.json'), 'utf8'));
  const voixEsc = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix/escalade-techniques/mots.json'), 'utf8'));
  assert.deepStrictEqual(montage(ep, voixEsc).erreurs, []);
});

test('pauses : un silence ajouté décale la suite, donne un compte à rebours et ses bruitages', () => {
  const plans = [{ plan: 'titre', texte: 'x' }, { plan: 'rebours', a: 'compte' }, { plan: 'titre', a: "l'impro", texte: 'y' }];
  const sans = montage(episode({ plans }), voix);
  const avec = montage(episode({ plans, pauses: [{ apres: 'compte', duree: 5 }] }), voix);
  assert.ok(sans.erreurs.some((e) => e.includes('aucune pause')));
  assert.deepStrictEqual(avec.erreurs, []);
  assert.ok(Math.abs(avec.feuille.duree - sans.feuille.duree - 5) < 0.01);
  assert.strictEqual(avec.feuille.pauses[0].d, 5);
  assert.strictEqual(avec.feuille.sons.filter((s) => s.f === 'tic.wav').length, 5);
  assert.ok(Math.abs(avec.feuille.plans[2].t0 - sans.feuille.plans[2].t0 - 5) < 0.01);
});

test('thèmes : chaque style fournit son habillage, et un thème inconnu est refusé', () => {
  const THEMES = require('../studio/avis/themes.js');
  const page = require('../studio/avis/page.js');
  assert.ok(montage(episode({ theme: 'inconnu' }), voix).erreurs.some((e) => e.includes('theme')));
  Object.keys(THEMES).forEach((nom) => {
    const { erreurs, feuille } = montage(episode({ theme: nom }), voix);
    assert.deepStrictEqual(erreurs, []);
    assert.strictEqual(feuille.theme, nom);
    const html = page.html(feuille);
    assert.ok(html.includes(`thème « ${nom} »`));
    THEMES[nom].polices.forEach((p) => assert.ok(fs.existsSync(path.join(__dirname, '../studio/polices', p)), p));
  });
});

test('3D : "decors3d" remplace un décor par sa version 3D quand elle existe, et seulement alors', () => {
  const plans = [{ plan: 'titre', fond: 'mur', texte: 'x' }, { plan: 'titre', a: "l'impro", fond: 'cave', texte: 'y' }, { plan: 'fin', apres: 3, fond: 'nuit', texte: 'z' }];
  const plat = montage(episode({ plans }), voix).feuille, volume = montage(episode({ plans, decors3d: true }), voix).feuille;
  assert.deepStrictEqual(plat.plans.map((p) => p.fond), ['mur', 'cave', 'nuit']);
  assert.deepStrictEqual(volume.plans.map((p) => p.fond), ['mur3d', 'cave', 'nuit']);
  const page = require('../studio/avis/page.js');
  assert.ok(page.html(volume).includes('three.min.js') && !page.html(plat).includes('three.min.js'));
});

test('caméra 3D : les mouvements se calent sur leurs ancres, les autres se partagent le plan, les inconnus sont refusés', () => {
  const plan = (camera) => [{ plan: 'visuel', fond: 'riziere3d', camera }, { plan: 'fin', apres: 3, fond: 'nuit', texte: 'z' }];
  const { erreurs, feuille } = montage(episode({ plans: plan(['tour', { m: 'zoom:paysan', a: "l'impro" }]) }), voix);
  assert.deepStrictEqual(erreurs, []);
  const cam = feuille.plans[0].p.camera;
  assert.strictEqual(cam[0].t, 0);
  assert.ok(cam[1].t > 1 && cam[1].t < feuille.plans[0].d);
  assert.ok(montage(episode({ plans: plan(['looping']) }), voix).erreurs.some((e) => e.includes('looping')));
  assert.ok(montage(episode({ plans: plan(['zoom:licorne']) }), voix).erreurs.some((e) => e.includes('licorne')));
});

test('caméra 3D : nouveaux mouvements, réglages, coups de zoom sur les mots forts, souffles et ambiance', () => {
  const plan = (camera) => [{ plan: 'visuel', fond: 'riziere3d', camera }, { plan: 'fin', apres: 3, fond: 'nuit', texte: 'z' }];
  const ok = montage(episode({ forts: ['clarté'], plans: plan([{ m: 'spirale', vitesse: 'lent' }, { m: 'travelling:paysan', a: 'compte' }, { m: 'contre-plongee:cabane', a: "l'impro", vitesse: 'vif', force: 1.4 }, 'recul']) }), voix);
  assert.deepStrictEqual(ok.erreurs, []);
  const p0 = ok.feuille.plans[0];
  assert.strictEqual(p0.p.accents.length, 2);   // le coup d'ouverture, puis le mot fort
  assert.ok(p0.p.accents[1] > 0.15 && p0.p.accents[1] < p0.d);
  assert.strictEqual(ok.feuille.sons.filter((s) => s.f === 'souffle.wav').length, 3);
  const amb = ok.feuille.sons.find((s) => s.f === 'campagne.wav');
  assert.ok(amb && amb.duree === p0.dClip);
  assert.ok(!montage(episode({ reglages: { ambiance: 0 }, plans: plan(['tour']) }), voix).feuille.sons.some((s) => s.f === 'campagne.wav'));
  assert.ok(montage(episode({ plans: plan([{ m: 'tour', vitesse: 'turbo' }]) }), voix).erreurs.some((e) => e.includes('vitesse')));
  assert.ok(montage(episode({ plans: plan([{ m: 'tour', force: 9 }]) }), voix).erreurs.some((e) => e.includes('force')));
  const mur = montage(episode({ plans: [{ plan: 'visuel', fond: 'mur3d', camera: ['contre-plongee:grimpeur', 'zoom:prise'] }, { plan: 'fin', apres: 3, fond: 'nuit', texte: 'z' }] }), voix);
  assert.deepStrictEqual(mur.erreurs, []);
  assert.ok(montage(episode({ plans: [{ plan: 'visuel', fond: 'mur3d', camera: ['zoom:buffle'] }, { plan: 'fin', apres: 3, fond: 'nuit', texte: 'z' }] }), voix).erreurs.some((e) => e.includes('buffle')));
});

test('question de fin dans le décor : elle prolonge le dernier plan, et seulement lui', () => {
  const plans = [{ plan: 'titre', texte: 'x' }, { plan: 'visuel', a: "l'impro", fond: 'cave', question: { texte: 'Tu mises sur *quoi* ?', apres: 3 } }];
  const { erreurs, feuille } = montage(episode({ plans }), voix);
  assert.deepStrictEqual(erreurs, []);
  assert.strictEqual(feuille.duree, +(feuille.dureeVoix + 3).toFixed(3));
  const q = feuille.plans[1].p.question;
  assert.ok(Math.abs(feuille.plans[1].t0 + q.t - feuille.dureeVoix) < 0.01);
  const page = require('../studio/avis/page.js');
  const html = page.html(feuille);
  assert.ok(html.includes('class="question"') && !html.includes('<div class="tete">'));
  const mal = montage(episode({ plans: [{ plan: 'titre', texte: 'x', question: { texte: 'y' } }, { plan: 'titre', a: "l'impro", texte: 'z' }] }), voix);
  assert.ok(mal.erreurs.some((e) => e.includes('dernier plan')));
  assert.strictEqual(montage(episode({ aspect3d: 'decoupe' }), voix).feuille.aspect3d, 'decoupe');
  assert.strictEqual(montage(episode(), voix).feuille.aspect3d, 'doux');
  assert.ok(montage(episode({ aspect3d: 'flou' }), voix).erreurs.some((e) => e.includes('aspect3d')));
});

test('accroche : des conseils, jamais des erreurs ; ouverture vive par défaut', () => {
  // La voix d'essai commence par « Bon, alors » puis un long silence : l'accroche est mauvaise, le montage le dit sans refuser.
  const tardif = { duree: 6, mots: [{ m: 'Alors', d: 1.2, f: 1.5 }, { m: 'voilà.', d: 1.6, f: 2.0 }], silences: [[2.1, 6]] };
  const r1 = montage({ version: 4, id: 'x', rubrique: 'travail', essai: true, plans: [{ plan: 'titre', fond: 'nuit', texte: 'x' }] }, tardif);
  assert.deepStrictEqual(r1.erreurs, []);
  assert.ok(r1.feuille.conseils.some((c) => c.includes('la voix commence')));
  assert.ok(r1.feuille.conseils.some((c) => c.includes('fond uni')));
  const net = montage(episode({ retirer: [['Bon,', 'alors']], plans: [{ plan: 'titre', fond: 'cave', texte: 'x' }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix);
  assert.deepStrictEqual(net.feuille.conseils, []);
  const longue = { duree: 30, mots: Array.from({ length: 16 }, (_, i) => ({ m: i === 15 ? 'fin.' : `mot${i}`, d: i * 0.4, f: i * 0.4 + 0.3 })), silences: [] };
  const r3 = montage({ version: 4, id: 'x', rubrique: 'travail', essai: true, plans: [{ plan: 'titre', fond: 'cave', texte: 'x' }] }, longue);
  assert.ok(r3.feuille.conseils.some((c) => c.includes('16 mots')));
  assert.strictEqual(net.feuille.ouverture, 'vive');
  assert.strictEqual(montage(episode({ ouverture: 'calme' }), voix).feuille.ouverture, 'calme');
  assert.ok(montage(episode({ ouverture: 'explosive' }), voix).erreurs.some((e) => e.includes('ouverture')));
  const en3d = montage(episode({ plans: [{ plan: 'visuel', fond: 'riziere3d' }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix).feuille;
  assert.strictEqual(en3d.plans[0].p.accents[0], 0.15);
});

test('signature sonore : indicatif, musique qui suit la voix, bruitages des décors', () => {
  const plans = [{ plan: 'titre', fond: 'cave', texte: 'x' }, { plan: 'visuel', a: "l'impro", fond: 'scene', question: { texte: 'Et *après* ?', apres: 3 } }];
  const { erreurs, feuille } = montage(episode({ plans }), voix);
  assert.deepStrictEqual(erreurs, []);
  const noms = feuille.sons.map((s) => s.f);
  assert.ok(noms.includes('indicatif-court.wav') && noms.includes('indicatif.wav'));
  assert.ok(Math.abs(feuille.sons.find((s) => s.f === 'indicatif.wav').t - feuille.dureeVoix) < 0.3);
  const clavier = feuille.sons.find((s) => s.f === 'clavier.wav');
  assert.ok(clavier && clavier.duree > 0 && clavier.duree <= 19);
  assert.ok(noms.includes('rideau.wav'));
  // La musique : des « creux » qui couvrent tous les mots, et une expression de volume qui descend pendant qu'il parle.
  const mu = feuille.musique;
  assert.strictEqual(mu.nom, 'avis');
  feuille.groupes.forEach((g) => assert.ok(mu.creux.some(([a, b]) => g.t0 >= a - 0.01 && g.t1 <= b + 0.01)));
  mu.creux.forEach(([a, b], i) => { assert.ok(b > a); if (i) assert.ok(a - mu.creux[i - 1][1] >= 0.9); });
  const { volumeMusique } = require('../studio/avis/page.js');
  const expr = volumeMusique(mu);
  const clip = (x, a, b) => Math.min(b, Math.max(a, x));
  const vol = (t) => Function('t', 'clip', 'min', `return ${expr};`)(t, clip, Math.min);
  const milieu = (mu.creux[0][0] + mu.creux[0][1]) / 2;
  assert.ok(Math.abs(vol(milieu) - mu.volume) < 0.01, 'bas pendant la parole');
  assert.ok(Math.abs(vol(feuille.duree - 0.2) - mu.seule) < 0.05, 'fort quand la voix s’est tue');
  // Réglages : sans bruitages, sans musique, valeurs refusées.
  const muet = montage(episode({ plans, musique: 'aucune', reglages: { bruitages: 0 } }), voix).feuille;
  assert.ok(!muet.sons.some((s) => /clavier|rideau|indicatif/.test(s.f)));
  assert.ok(montage(episode({ musique: 'techno' }), voix).erreurs.some((e) => e.includes('musique')));
  assert.ok(montage(episode({ indicatif: 'Z' }), voix).erreurs.some((e) => e.includes('indicatif')));
  const sons = require('../scripts/sons-avis.js');
  assert.deepStrictEqual(Array.from(sons.indicatif('B').slice(0, 2000)), Array.from(sons.indicatif('B').slice(0, 2000)), 'synthèse reproductible');
});

test('personnage récurrent : poses par décor, visage au-dessus des sous-titres, dessin reproductible', () => {
  const P = require('../studio/avis/personnage.js');
  Object.entries(P.PLACES).forEach(([decor, pl]) => {
    assert.ok(pl.y - 424 * pl.taille < 1200, `${decor} : le visage passerait sous les sous-titres`);
    pl.poses.forEach((pose) => assert.ok(P.POSES[pose], `${decor} : pose ${pose} inconnue`));
  });
  Object.keys(P.ALLURES).forEach((a) => Object.keys(P.POSES).forEach((pose) => { const s = P.svg(pose, a); assert.strictEqual(s, P.svg(pose, a)); assert.ok(s.includes('class="perso"')); }));
  const plans = (perso) => [{ plan: 'visuel', fond: 'scene', personnage: perso }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }];
  const ok = montage(episode({ plans: plans('salue') }), voix);
  assert.deepStrictEqual(ok.erreurs, []);
  assert.strictEqual(ok.feuille.plans[0].p.personnage, 'salue');
  const page = require('../studio/avis/page.js');
  assert.ok(page.html(ok.feuille).includes('perso-svg'));
  assert.ok(montage(episode({ plans: plans('grimpe') }), voix).erreurs.some((e) => e.includes('grimpe')));
  // "personnage": true dans l'épisode : la pose par défaut de chaque décor qui a une place ; rien ailleurs, sans erreur.
  const partout = montage(episode({ personnage: true, plans: [{ plan: 'visuel', fond: 'mur' }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix);
  assert.deepStrictEqual(partout.erreurs, []);
  assert.strictEqual(partout.feuille.plans[0].p.personnage, 'grimpe');
  assert.strictEqual(partout.feuille.plans[1].p.personnage, undefined);
  assert.strictEqual(montage(episode({ personnage: true, plans: [{ plan: 'visuel', fond: 'mur', personnage: false }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix).feuille.plans[0].p.personnage, undefined);
  assert.ok(montage(episode({ allure: 'pirate' }), voix).erreurs.some((e) => e.includes('allure')));
});
