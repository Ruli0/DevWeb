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
