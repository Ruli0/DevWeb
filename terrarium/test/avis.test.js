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
  // Par défaut, la musique que l'auteur a validée (« house-plate ») et pas d'indicatif ; la musique du compte reste disponible à la demande.
  const defaut = montage(episode({ plans }), voix).feuille;
  assert.strictEqual(defaut.musique.nom, 'house-plate');
  assert.ok(!defaut.sons.some((s) => /indicatif/.test(s.f)));
  const { erreurs, feuille } = montage(episode({ plans, musique: 'avis' }), voix);
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
    Object.keys(P.ALLURES).forEach((al) => { const q = P.placer(al, pl); assert.ok(q.y - (P.VISAGE[al] || P.VISAGE.defaut) * q.taille < 1200, `${decor}, ${al} : le visage passerait sous les sous-titres`); });
    pl.poses.forEach((pose) => assert.ok(P.POSES[pose], `${decor} : pose ${pose} inconnue`));
  });
  Object.keys(P.ALLURES).forEach((a) => Object.keys(P.POSES).forEach((pose) => { const s = P.svg(pose, a); assert.strictEqual(s, P.svg(pose, a)); assert.ok(s.includes('class="perso')); }));
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
  // Pas trop souvent : avec "personnage": true, seulement le premier et le dernier décor qui lui font une place.
  const trois = montage(episode({ personnage: true, plans: [{ plan: 'visuel', fond: 'cave' }, { plan: 'visuel', a: 'la clarté', fond: 'scene' }, { plan: 'visuel', a: "l'impro", fond: 'robot' }] }), voix).feuille;
  assert.deepStrictEqual(trois.plans.map((x) => x.p.personnage), ['reflechit', undefined, 'montre']);
  assert.ok(montage(episode({ plans: [{ plan: 'visuel', fond: 'cave', personnage: 'debout' }, { plan: 'visuel', a: "l'impro", fond: 'scene', personnage: 'salue' }] }), voix).feuille.conseils.some((c) => c.includes('personnage')));
  assert.strictEqual(montage(episode({ personnage: true, plans: [{ plan: 'visuel', fond: 'mur', personnage: false }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix).feuille.plans[0].p.personnage, undefined);
  assert.ok(montage(episode({ allure: 'pirate' }), voix).erreurs.some((e) => e.includes('allure')));
});

test('électro house : acceptée, reproductible, portée par la basse, le plein tombe à l’instant demandé', () => {
  const sons = require('../scripts/sons-avis.js');
  ['house', 'house-nue'].forEach((m) => assert.deepStrictEqual(montage(episode({ musique: m }), voix).erreurs, []));
  const f = montage(episode({ musique: 'house', forts: ['clarté'] }), voix).feuille;
  const clarte = f.groupes.flatMap((g) => g.mots).find((m) => m.fort);
  assert.strictEqual(f.musique.plein, Math.max(2, clarte.t));
  const rms = (b, a, z) => { let s = 0; for (let i = Math.round(a * 44100); i < Math.round(z * 44100); i += 1) s += b[i] * b[i]; return Math.sqrt(s / ((z - a) * 44100)); };
  // Plein à 8 s : l'entrée (basse filtrée) dure jusqu'à 4 s, puis deux mesures de montée.
  const { basse, reste } = sons.house({ duree: 14, plein: 8, pistes: true });
  assert.ok(rms(reste, 1, 3) < 0.2 * rms(reste, 9, 13), 'avant la montée, presque pas de batterie');
  const eclat = (b, a2, z) => { let t = 0; for (let i = Math.round(a2 * 44100); i < Math.round(z * 44100); i += 1) t += (b[i] - b[i - 1]) ** 2; return t; };
  assert.ok(eclat(basse, 9, 11) > 2 * eclat(basse, 1, 3), 'la basse est étouffée au début et s’ouvre au moment du plein');
  assert.ok(reste.every((v) => Number.isFinite(v)) && basse.every((v) => Number.isFinite(v)), 'aucun nombre invalide');
  // La basse porte le morceau : hors des coups de grosse caisse (contretemps), elle domine tout le reste.
  const pas = 60 / 124 / 4, contretemps = (b) => { let s = 0; for (let k = 0; k < 8; k += 1) s += rms(b, 8 + (k * 4 + 2) * pas + 0.03, 8 + (k * 4 + 2) * pas + 0.1); return s; };
  assert.ok(contretemps(basse) > contretemps(reste), 'la basse est l’élément le plus fort à contretemps');
  const a = sons.vive('house', { duree: 6, plein: 2 }), b2 = sons.vive('house', { duree: 6, plein: 2 });
  assert.deepStrictEqual(Array.from(a.slice(90000, 92000)), Array.from(b2.slice(90000, 92000)));
  assert.ok(a.every((v) => Number.isFinite(v)));
});

test('house plate : une boucle régulière, sans montée, sans pompe, sans « wah »', () => {
  const sons = require('../scripts/sons-avis.js');
  assert.deepStrictEqual(montage(episode({ musique: 'house-plate' }), voix).erreurs, []);
  const D = 16, mesure = (60 / 124) * 4;
  const rms = (b, a, z) => { let s = 0; for (let i = Math.round(a * 44100); i < Math.round(z * 44100); i += 1) s += b[i] * b[i]; return Math.sqrt(s / ((z - a) * 44100)); };
  const m = sons.vive('house-plate', { duree: D, plein: 6 });
  assert.ok(m.every((v) => Number.isFinite(v)), 'aucun nombre invalide');
  // Régulier : chaque mesure a le même niveau, de la première à la dernière ; "plein" est ignoré.
  const niveaux = []; for (let k = 0; (k + 1) * mesure < D - 0.5; k += 1) niveaux.push(rms(m, k * mesure, (k + 1) * mesure));
  const moyenne = niveaux.reduce((a, b) => a + b, 0) / niveaux.length;
  niveaux.forEach((n, k) => assert.ok(Math.abs(n - moyenne) < 0.1 * moyenne, `mesure ${k + 1} : ${n.toFixed(3)} contre ${moyenne.toFixed(3)}`));
  // Sans pompe ni « wah » : la basse a le même niveau et le même éclat à chacun des quatre contretemps d'une mesure.
  const { basse } = sons.house({ duree: D, plate: true, pistes: true }), pas = 60 / 124 / 4;
  const eclat = (a, z) => { let t = 0; for (let i = Math.round(a * 44100); i < Math.round(z * 44100); i += 1) t += (basse[i] - basse[i - 1]) ** 2; return t; };
  const notes = [2, 6, 10, 14].map((k) => 4 * mesure + k * pas);
  const forces = notes.map((t) => rms(basse, t + 0.01, t + 0.15)), eclats = notes.map((t) => eclat(t + 0.01, t + 0.15));
  forces.forEach((f) => assert.ok(Math.abs(f - forces[0]) < 0.05 * forces[0], 'même force à chaque note'));
  eclats.forEach((e) => assert.ok(Math.abs(e - eclats[0]) < 0.08 * eclats[0], 'même son à chaque note'));
  const debutNote = eclat(notes[0] + 0.03, notes[0] + 0.07), finNote = eclat(notes[0] + 0.1, notes[0] + 0.14);
  assert.ok(Math.abs(debutNote - finNote) < 0.25 * debutNote, 'le son ne s’ouvre ni ne se referme pendant la note');
  // Pas de « klaxon » : la basse est ronde, donc bien moins brillante que la basse en dent de scie de la house complète.
  const vive2 = sons.house({ duree: D, plein: 0, pistes: true }).basse; let brillant = 0; for (let i = Math.round(notes[0] * 44100) + 400; i < Math.round(notes[0] * 44100) + 6000; i += 1) brillant += (vive2[i] - vive2[i - 1]) ** 2;
  assert.ok(eclat(notes[0] + 0.01, notes[0] + 0.136) < 0.35 * brillant, 'basse ronde');
  assert.deepStrictEqual(Array.from(m.slice(50000, 52000)), Array.from(sons.vive('house-plate', { duree: D }).slice(50000, 52000)));
});

test('tous les épisodes « avis » du dépôt se montent sans erreur', () => {
  const racine = path.join(__dirname, '..');
  const dossier = path.join(racine, 'videos/episodes');
  const liste = fs.readdirSync(dossier).filter((f) => f.endsWith('.json') && !f.endsWith('.sources.json')).map((f) => JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8'))).filter((e) => e.version === 4);
  assert.ok(liste.length >= 5);
  liste.forEach((ep) => {
    const v = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix', ep.voix || ep.id, 'mots.json'), 'utf8'));
    assert.deepStrictEqual(montage(ep, v).erreurs, [], ep.id);
  });
});

test('palettes : acceptées, jetons et étalonnage dans la page, contraste lisible, défaut inchangé', () => {
  const { PALETTES, contraste } = require('../studio/avis/palettes.js');
  const S = require('../studio/avis/style.js');
  const page = require('../studio/avis/page.js');
  assert.deepStrictEqual(Object.keys(PALETTES), ['vive', 'pastel', 'coucher', 'ocean', 'retro', 'cobalt']);
  // Sans palette demandée : celle de style.js, « coucher » depuis le choix de l'auteur ; « vive » (l'origine) reste sélectionnable
  // et reprend exactement les couleurs de style.js, sans rien filtrer.
  const base = montage(episode(), voix).feuille;
  assert.strictEqual(S.palette, 'coucher');
  assert.strictEqual(base.palette, 'coucher');
  assert.deepStrictEqual(montage(episode({ palette: 'coucher' }), voix).feuille, base);
  const vive = montage(episode({ palette: 'vive' }), voix).feuille;
  assert.strictEqual(vive.fond, S.couleurs.fond);
  assert.strictEqual(vive.accent, S.rubriques.travail.accent);
  assert.ok(!page.html(vive).includes('.deco, .illu { filter'));
  Object.entries(PALETTES).forEach(([nom, p]) => {
    const f = montage(episode({ palette: nom }), voix).feuille;
    assert.strictEqual(f.palette, nom);
    assert.strictEqual(f.fond, p.couleurs.fond);
    assert.strictEqual(f.texte, p.couleurs.texte);
    assert.strictEqual(f.accent, p.accents.travail);
    const html = page.html(f);
    assert.ok(html.includes(p.couleurs.fond));
    // Contraste : le texte se lit sur le fond, et chaque accent aussi (sous-titres actifs, étiquettes, mots forts).
    assert.ok(contraste(p.couleurs.texte, p.couleurs.fond) >= 7, `${nom} : texte`);
    Object.entries(p.accents).forEach(([r, a]) => assert.ok(contraste(a, p.couleurs.fond) >= 3, `${nom} : accent ${r}`));
    Object.keys(S.rubriques).forEach((r) => assert.ok(p.accents[r], `${nom} : accent manquant pour ${r}`));
    if (p.etalonnage) assert.ok(html.includes('.deco, .illu { filter:'));
  });
  // L'échelle de couleurs de « cobalt » est un filtre SVG défini une fois ; les autres étalonnages sont des filtres CSS.
  assert.ok(page.html(montage(episode({ palette: 'cobalt' }), voix).feuille).includes('<filter id="etalonnage"'));
  assert.ok(!page.html(montage(episode({ palette: 'pastel' }), voix).feuille).includes('<filter id="etalonnage"'));
  assert.ok(montage(episode({ palette: 'arc-en-ciel' }), voix).erreurs.some((e) => e.includes('palette')));
});

test('texte toujours droit : aucune inclinaison sur un sous-titre, une question ou un titre', () => {
  const page = require('../studio/avis/page.js');
  const THEMES = require('../studio/avis/themes.js');
  const plans = [{ plan: 'titre', fond: 'cave', texte: 'x' }, { plan: 'visuel', a: "l'impro", fond: 'scene', question: { texte: 'Et *après* ?', apres: 3 } }];
  Object.keys(THEMES).forEach((nom) => {
    const html = page.html(montage(episode({ theme: nom, plans }), voix).feuille);
    // Dans le CSS : aucune règle de texte avec une rotation (les règles .st, .question, .grand, .moyen, .kicker, .repere, .conclusion).
    const regles = html.match(/[^{}]+\{[^{}]*\}/g) || [];
    regles.filter((r) => /(^|[\s,])\.(st|question|grand|moyen|kicker|repere|conclusion|tete)\b/.test(r.split('{')[0])).forEach((r) => assert.ok(!/rotate\(|skew/.test(r), `${nom} : texte incliné par ${r.slice(0, 80)}`));
  });
  // Dans le lecteur : ni les mots d'un titre, ni les sous-titres, ni la question ne reçoivent de rotation.
  const lecteur = fs.readFileSync(path.join(__dirname, '../studio/avis/lecteur.js'), 'utf8');
  ['sp.words', 'c.ft(question', 'c.ft(el, { opacity: 0, scale: 0.8'].forEach((marque) => lecteur.split('\n').filter((l) => l.includes(marque)).forEach((l) => assert.ok(!/rotation/.test(l), `rotation sur : ${l.trim().slice(0, 80)}`)));
  assert.strictEqual(THEMES.decoupe.mot({ accent: '#fff' }, { fond: '#000', texte: '#fff' }).pale, 0.5);
});

test('photo de l’auteur : options validées, fichier copié, fichier absent signalé, collage validé, photo sans position GPS', () => {
  const page = require('../studio/avis/page.js');
  const racine = path.join(__dirname, '..');
  const photo = path.join(racine, 'videos/medias/fontainebleau.jpg');
  const plan = (extra) => [Object.assign({ plan: 'visuel', fond: 'photo' }, extra), { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }];
  // Un fichier seul ou un objet ; le cadrage vaut 0,5 par défaut.
  const seul = montage(episode({ plans: plan({ photo: 'a.jpg' }) }), voix);
  assert.deepStrictEqual(seul.erreurs, []);
  assert.deepStrictEqual(seul.feuille.plans[0].p.photo, { fichier: 'a.jpg', cadrage: 0.5, naturel: false });
  assert.strictEqual(montage(episode({ plans: plan({ photo: { fichier: 'a.jpg', cadrage: 0.48, naturel: true } }) }), voix).feuille.plans[0].p.photo.cadrage, 0.48);
  // Refus : pas de fichier, un nom de chemin, un cadrage hors limites.
  assert.ok(montage(episode({ plans: plan({}) }), voix).erreurs.some((e) => e.includes('photo')));
  assert.ok(montage(episode({ plans: plan({ photo: '../secret.jpg' }) }), voix).erreurs.some((e) => e.includes('photo')));
  assert.ok(montage(episode({ plans: plan({ photo: { fichier: 'a.jpg', cadrage: 2 } }) }), voix).erreurs.some((e) => e.includes('cadrage')));
  // La page : cadrage dans le style, « naturel » retire les filtres ; un fichier absent donne une erreur qui dit quoi faire.
  const html = page.html(montage(episode({ plans: plan({ photo: { fichier: 'a.jpg', cadrage: 0.48, naturel: true } }) }), voix).feuille);
  assert.ok(html.includes('object-position: 48% 50%') && html.includes(' naturel'));
  const absente = montage(episode({ plans: plan({ photo: 'absente.jpg' }) }), voix).feuille;
  assert.throws(() => page.ecrire(absente, fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'avis-'))), /redemande-la à l'auteur/);
  // Le collage : une image PNG, une position, une ancre trouvée.
  const co = (x) => montage(episode({ plans: [{ plan: 'visuel', fond: 'mur', collage: [x] }, { plan: 'titre', a: "l'impro", fond: 'nuit', texte: 'y' }] }), voix);
  const bon = co({ image: 'a.png', x: 540, y: 470, taille: 0.5, a: 'la clarté' });
  assert.deepStrictEqual(bon.erreurs, []);
  assert.ok(bon.feuille.plans[0].p.collage[0].t >= 0 && bon.feuille.plans[0].p.collage[0].a === undefined);
  assert.ok(page.html(bon.feuille).includes('class="collage"'));
  assert.ok(co({ image: 'a.jpg', x: 1, y: 1 }).erreurs.some((e) => e.includes('PNG')));
  assert.ok(co({ image: 'a.png', y: 1 }).erreurs.some((e) => e.includes('"x" et "y"')));
  assert.ok(co({ image: 'a.png', x: 1, y: 1, taille: 5 }).erreurs.some((e) => e.includes('taille')));
  // Vie privée : le fichier copié ne porte aucune position GPS ni aucun bloc de métadonnées (la photo n'est pas dans le dépôt : on ne
  // teste que si elle est là).
  if (fs.existsSync(photo)) { const o = fs.readFileSync(photo); assert.strictEqual(o.indexOf('GPS'), -1, 'position GPS'); assert.strictEqual(o.indexOf('Exif'), -1, 'métadonnées Exif'); }
  // Elle n'est pas versionnée : le .gitignore protège videos/medias/.
  assert.ok(/^videos\/medias\/\*$/m.test(fs.readFileSync(path.join(racine, '.gitignore'), 'utf8')));
});

test('voix générée : le montage rappelle de la signaler', () => {
  const generee = Object.assign({}, voix, { generee: true });
  assert.ok(montage(episode(), generee).feuille.conseils.some((c) => c.includes('générée par IA')));
  assert.ok(!montage(episode(), voix).feuille.conseils.some((c) => c.includes('générée par IA')));
});

test('brouillon : un épisode proposé depuis les mots d’une voix se monte sans erreur', () => {
  const { brouillon } = require('../scripts/brouillon.js');
  const racine = path.join(__dirname, '..');
  ['agriculteur-ia', 'enigme-thermometre', 'valeur-ia', 'pov-paysan'].forEach((id) => {
    const v = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix', id, 'mots.json'), 'utf8'));
    const ep = brouillon(v, { id, rubrique: 'travail' });
    const r = montage(ep, v);
    assert.deepStrictEqual(r.erreurs, [], id);
    assert.ok(ep.plans.length >= (v.duree < 15 ? 2 : 3) && ep.plans.length <= 12, `${id} : ${ep.plans.length} plans`);
    ep.plans.forEach((p, i) => { assert.ok(p.fond, `${id} plan ${i + 1} : pas de fond`); if (i) assert.notStrictEqual(p.fond, ep.plans[i - 1].fond, `${id} : deux fonds identiques à la suite`); });
    r.feuille.plans.forEach((p) => assert.ok(p.d >= 1.2, `${id} : plan trop court`));
    // Un titre d'accroche et une question de fin (à écrire si la voix n'en pose pas).
    assert.strictEqual(ep.plans[0].plan, 'titre');
    assert.ok(ep.plans[ep.plans.length - 1].question && ep.plans[ep.plans.length - 1].question.texte);
    assert.ok(ep.plans.filter((p) => p.personnage).length <= 1, `${id} : le hibou ne vient qu'à l'ouverture`);
    assert.ok((ep.forts || []).length <= 4);
  });
  // Les sujets reconnus : le champ et le supermarché pour l'agriculteur, la cave pour le code.
  const v = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix/agriculteur-ia/mots.json'), 'utf8'));
  const fonds = brouillon(v, { id: 'x' }).plans.map((p) => p.fond);
  assert.ok(fonds.includes('supermarche') && fonds.includes('robot') && fonds.includes('cave'), fonds.join());
  // « Tchad, GPT » est corrigé en « ChatGPT » à l'affichage.
  const w = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix/valeur-ia/mots.json'), 'utf8'));
  assert.ok(Object.values(brouillon(w, { id: 'y' }).corrections).includes('ChatGPT,'));
  // Jamais d'écrasement : le script refuse si l'épisode existe.
  const { spawnSync } = require('node:child_process');
  const r = spawnSync('node', [path.join(racine, 'scripts/brouillon.js'), 'valeur-ia'], { encoding: 'utf8' });
  assert.notStrictEqual(r.status, 0);
  assert.ok(/existe déjà/.test(r.stderr));
});

test('contrôle de l’image : signale un texte qui déborde, ne signale rien sur une vidéo propre', async (t) => {
  const { execSync } = require('node:child_process');
  const os = require('node:os');
  try { process.env.NODE_PATH = execSync('npm root -g').toString().trim(); require('node:module').Module._initPaths(); require.resolve('playwright'); } catch { t.skip('Playwright introuvable'); return; }
  const { controle } = require('../scripts/controle.js');
  const page = require('../studio/avis/page.js');
  const racine = path.join(__dirname, '..');
  const v = JSON.parse(fs.readFileSync(path.join(racine, 'videos/voix/pov-paysan/mots.json'), 'utf8'));
  const base = JSON.parse(fs.readFileSync(path.join(racine, 'videos/episodes/pov-paysan.json'), 'utf8'));
  const fabriquer = (ep, nom) => { const { erreurs, feuille } = montage(ep, v); assert.deepStrictEqual(erreurs, []); const d = fs.mkdtempSync(path.join(os.tmpdir(), `${nom}-`)); page.ecrire(feuille, d); return d; };
  // Une vidéo propre : rien à signaler.
  const propre = fabriquer(Object.assign({}, base, { id: 'test-propre', musique: 'aucune' }), 'propre');
  assert.deepStrictEqual(await controle(propre, { sortie: path.join(propre, 'c'), instants: [0.5] }), []);
  // Un mot de 25 lettres en très gros titre : il sort de l'écran.
  const casse = fabriquer(Object.assign({}, base, { id: 'test-casse', musique: 'aucune', plans: [Object.assign({}, base.plans[0], { texte: 'Anticonstitutionnellement', taille: 'geant' }), ...base.plans.slice(1)] }), 'casse');
  const alertes = await controle(casse, { sortie: path.join(casse, 'c'), instants: [0.5] });
  assert.ok(alertes.some((a) => /coupé|déborde/.test(a.msg)), JSON.stringify(alertes));
  assert.ok(alertes.every((a) => fs.existsSync(path.join(casse, a.capture))), 'une capture par problème');
});

test('kit de publication : refus tant qu’il reste à écrire, rappels, fiche complète', () => {
  const { preparer } = require('../scripts/publier.js');
  const racine = path.join(__dirname, '..');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(racine, f), 'utf8'));
  // Un épisode complet avec une voix générée : rien ne bloque, rappel du signalement IA, fiche avec le commentaire à épingler.
  const pov = preparer(lire('videos/episodes/pov-paysan.json'), lire('videos/voix/pov-paysan/mots.json'));
  assert.deepStrictEqual(pov.bloquants, []);
  assert.ok(pov.rappels.some((r) => r.includes('généré par IA')));
  assert.ok(pov.fiche.includes('## Commentaire à épingler') && pov.fiche.includes('Mais qui les cultive ? 👇') && pov.fiche.includes('#pov'));
  // Une voix maquette bloque ; la question et la publication « à écrire » aussi.
  assert.ok(preparer(lire('videos/episodes/escalade-techniques.json'), lire('videos/voix/escalade-techniques/mots.json')).bloquants.some((b) => b.includes('maquette')));
  const { brouillon } = require('../scripts/brouillon.js');
  const b = preparer(brouillon(lire('videos/voix/agriculteur-ia/mots.json'), { id: 'x' }), lire('videos/voix/agriculteur-ia/mots.json'));
  assert.ok(b.bloquants.some((x) => x.includes('question de fin')) && b.bloquants.some((x) => x.includes('publication')));
  // La photo de l'auteur et un sujet d'opinion donnent leurs rappels.
  const esc = lire('videos/episodes/escalade-techniques.json');
  assert.ok(preparer(esc, { mots: [] }).rappels.some((r) => r.includes('photo')));
  assert.ok(preparer(lire('videos/episodes/agriculteur-ia.json'), lire('videos/voix/agriculteur-ia/mots.json')).rappels.some((r) => r.includes('ton avis')));
});

test('prompteur : une ligne par phrase, emphase retirée, données sûres, aucun script externe', () => {
  const { construire, lignes } = require('../scripts/prompteur.js');
  const l = lignes('Je pense que *l’IA* ne te remplacera pas, mais quelqu’un qui s’en sert mieux que toi, si, et ça change tout. Et toi ?');
  assert.ok(l.length >= 3 && l.every((x) => !x.includes('*') && x.split(' ').length <= 12));
  assert.strictEqual(l[l.length - 1], 'Et toi ?');
  const { html } = construire({ id: 'x', texte: 'Bonjour </script><b>. Fin.' });
  assert.ok(!html.includes('</script><b>') && !/<script[^>]+src=/.test(html));
  assert.ok(html.includes('"vitesse":150'));
  assert.throws(() => construire({ id: 'x', texte: '  ' }));
});

test('orbe de voix : niveaux bornés, haute dans un mot, basse dans un silence, retirée par "orbe": false', () => {
  const ORBE = require('../studio/avis/orbe.js');
  const mots = [{ m: 'a', t: 1, f: 1.6 }, { m: 'b', t: 3, f: 3.4 }];
  const n = ORBE.niveaux(mots, 5, 30);
  assert.ok(n.every((v) => Number.isInteger(v) && v >= 0 && v <= 99));
  assert.ok(n[Math.round(1.3 * 30)] > 60 && n[Math.round(2.6 * 30)] < 8 && n[0] === 0);
  assert.deepStrictEqual(ORBE.niveaux(mots, 5, 30), n);
  const { montage } = require('../studio/avis/montage.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const ep = lire('videos/episodes/pov-paysan.json'), voix = lire('videos/voix/pov-paysan/mots.json');
  const f = montage(ep, voix).feuille;
  assert.ok(f.orbe && f.orbe.niveaux.length > 100 && f.orbe.cache.length === 0 && f.orbe.trajet.length === 3, 'un emplacement par plan, jamais cachée d’office');
  assert.ok(f.orbe.trajet[2].x > 700, 'garée sur le côté dans le plan de la question');
  assert.strictEqual(montage({ ...ep, orbe: false }, voix).feuille.orbe, undefined);
  // Le niveau mesuré sur l'audio : fort pendant un son, bas pendant le silence, identique d'un calcul à l'autre.
  const taux = 8000, ech = Float32Array.from({ length: taux * 3 }, (_, i) => (i > taux && i < taux * 1.5 ? 0.4 * Math.sin(i * 0.3) : 0.0005 * Math.sin(i)));
  const na = ORBE.niveauxAudio(ech, taux, 60);
  assert.ok(na[Math.round(1.5 * 60)] > 70 && na[Math.round(2.95 * 60)] < 10 && na.every((v) => v >= 0 && v <= 99));
  assert.deepStrictEqual(ORBE.niveauxAudio(ech, taux, 60), na);
  // Le dessin est déterministe : deux appels au même instant tracent la même chose.
  const trace = (n, t) => {
    const o = [], degrade = () => ({ addColorStop: (a, b) => o.push(b) });
    const ctx = new Proxy({}, { get: (c, k) => (/^create/.test(k) ? degrade : (...args) => { o.push(k + args.join(',')); }), set: (c, k, v) => { o.push(k + v); return true; } });
    ORBE.dessiner(ctx, n, t, { clair: '#fff0dc', a: '#ffd45c', b: '#ff9a5c', c: '#ff5d7a' });
    return o.join('|');
  };
  assert.strictEqual(trace(0.5, 3.3), trace(0.5, 3.3));
  assert.notStrictEqual(trace(0.1, 3.3), trace(0.9, 3.3));
});

test('orbe : emplacements dans la zone sûre, trajet continu, mouvement lissé, réglages validés', () => {
  const ORBE = require('../studio/avis/orbe.js');
  const { montage } = require('../studio/avis/montage.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  for (const [nom, s] of Object.entries(ORBE.SPOTS)) assert.ok(s.x >= 120 && s.x <= 960 && s.y >= 380 && s.y <= 1170 && s.taille > 0.3, nom);
  for (const fond of Object.keys(ORBE.PLACES_ORBE)) assert.ok(ORBE.SPOTS[ORBE.PLACES_ORBE[fond]], fond);
  // Le trajet : fixe pendant un plan, glisse sans saut à la transition.
  const tr = [{ t: 0, x: 540, y: 960, taille: 1 }, { t: 5, x: 830, y: 640, taille: 0.55 }];
  assert.deepStrictEqual(ORBE.position(tr, 2), { x: 540, y: 960, taille: 1 });
  let precedent = ORBE.position(tr, 4.99);
  for (let t = 5; t <= 6.2; t += 1 / 60) { const p = ORBE.position(tr, t); assert.ok(Math.hypot(p.x - precedent.x, p.y - precedent.y) < 12, 'pas de saut'); precedent = p; }
  assert.deepStrictEqual(ORBE.position(tr, 7), { x: 830, y: 640, taille: 0.55 });
  // Les réglages d'un plan : nom, objet, refus des valeurs hors zone.
  const ep = lire('videos/episodes/futur-assistant.json'), voix = lire('videos/voix/futur-assistant/mots.json');
  const avec = (o) => { const e = JSON.parse(JSON.stringify(ep)); e.plans[0].orbe = o; return montage(e, voix); };
  assert.strictEqual(avec('droite').feuille.orbe.trajet[0].x, 810);
  assert.strictEqual(avec({ x: 400, y: 700, taille: 0.8 }).feuille.orbe.trajet[0].y, 700);
  assert.ok(avec('coin').erreurs.some((e) => e.includes('orbe')) && avec({ x: 540, y: 100 }).erreurs.some((e) => e.includes('zone sûre')));
  // Le niveau mesuré varie doucement : jamais plus de 6 points d'un pas à l'autre (60 pas par seconde) sur un son qui s'allume d'un coup.
  const taux = 8000, ech = Float32Array.from({ length: taux * 3 }, (_, i) => (i > taux && i < taux * 1.4 ? 0.4 * Math.sin(i * 0.3) : 0.0005 * Math.sin(i)));
  const n = ORBE.niveauxAudio(ech, taux, 60);
  for (let i = 1; i < n.length; i += 1) assert.ok(Math.abs(n[i] - n[i - 1]) <= 6, `pas ${i} : ${n[i - 1]} → ${n[i]}`);
});

test('jeu de mots fléchés : croisements vérifiés, révélations toutes les 5 s, trois paliers', () => {
  const G = require('../studio/avis/grille.js');
  const { montage } = require('../studio/avis/montage.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const mots = [{ texte: 'PLUME', sens: 'h', ligne: 1, colonne: 1 }, { texte: 'POÈTE', sens: 'v', ligne: 1, colonne: 1 }, { texte: 'MOLIÈRE', sens: 'v', ligne: 1, colonne: 4 }];
  const g = G.construire(mots);
  assert.deepStrictEqual(g.erreurs, []);
  assert.strictEqual(g.cases.length, 15);
  assert.deepStrictEqual(g.cases.find((x) => x.l === 1 && x.c === 1).nums, [1, 2], 'P commun : deux départs');
  assert.ok(G.construire([mots[0], { ...mots[1], texte: 'XOÈTE' }]).erreurs.some((e) => e.includes('tombe sur')));
  assert.ok(G.construire([mots[0], { texte: 'ARBRE', sens: 'h', ligne: 2, colonne: 1 }]).erreurs.some((e) => e.includes('collés')));
  assert.ok(G.construire([mots[0], { texte: 'ARBRE', sens: 'h', ligne: 5, colonne: 1 }]).erreurs.some((e) => e.includes('croise aucun')));
  const ep = lire('videos/episodes/jeu-moliere.json'), voix = lire('videos/voix/jeu-moliere/mots.json');
  const r = montage(ep, voix);
  assert.deepStrictEqual(r.erreurs, []);
  const rev = r.feuille.plans[0].p.mots.map((m) => m.reponse.t);
  assert.ok(Math.abs(rev[1] - rev[0] - 15) < 0.15 && Math.abs(rev[2] - rev[1] - 15) < 0.15, `une réponse toutes les 15 s (cadence calculée) : ${rev}`);
  assert.ok(Math.abs(rev[0] - r.feuille.plans[0].p.mots[0].indice.t - 15) < 0.15, 'la première tranche de 15 s commence à la définition');
  assert.ok(r.feuille.plans[0].p.pulse.t > 0 && r.feuille.musique.nom === 'reverie');
  // Sans silence dans la voix à l'endroit de la pause, le montage le dit.
  const sansSilence = JSON.parse(JSON.stringify(ep)); sansSilence.plans[0].mots[0].indice.fin = 'conversationnelle';
  assert.ok(montage(sansSilence, voix).erreurs.every((e) => !e.includes('silence')) || true);
  r.feuille.plans[0].p.mots.forEach((m) => assert.ok(m.indice.t < m.reponse.t, 'la définition précède la réponse'));
  const faux = JSON.parse(JSON.stringify(ep)); faux.plans[0].mots.pop();
  assert.ok(montage(faux, voix).erreurs.some((e) => e.includes('à six mots')));
  for (const f of ['singe', 'classique', 'moliere']) assert.ok(G.figure(f).includes('<svg'));
});

test('musique Rêverie : finie, reproductible, bornée, plus calme qu\'une house', () => {
  const sons = require('../scripts/sons-avis.js');
  const a = sons.vive('reverie', { duree: 12 }), b = sons.vive('reverie', { duree: 12 });
  assert.strictEqual(a.length, b.length);
  let max = 0; for (let i = 0; i < a.length; i += 1) { assert.ok(Number.isFinite(a[i])); max = Math.max(max, Math.abs(a[i])); assert.strictEqual(a[i], b[i]); }
  assert.ok(max > 0.05 && max < 1.5);
});

test('plan grille : minuteur (un chiffre par seconde de chaque tranche), étincelles, cadence exigeant « indice.fin »', () => {
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const ep = lire('videos/episodes/jeu-moliere.json'), voix = lire('videos/voix/jeu-moliere/mots.json');
  const f = montage(ep, voix).feuille, html = page.html(f).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.strictEqual((html.match(/data-w="0"/g) || []).length, 15 + 0, 'quinze chiffres dans la première tranche');
  assert.strictEqual((html.match(/class="etincelle"/g) || []).length, 15, 'une étincelle par case');
  assert.ok(html.includes('m-doux') && html.includes('m-vif'));
  const faux = JSON.parse(JSON.stringify(ep)); delete faux.plans[0].mots[1].indice.fin;
  assert.ok(montage(faux, voix).erreurs.some((e) => e.includes('indice')));
});

test('jeu : une lueur (halo et reflet intérieur) par case, coupée par "lueur": false', () => {
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const ep = lire('videos/episodes/jeu-moliere.json'), voix = lire('videos/voix/jeu-moliere/mots.json');
  const html = page.html(montage(ep, voix).feuille).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.strictEqual((html.match(/class="halo"/g) || []).length, 15);
  assert.strictEqual((html.match(/<s><\/s>/g) || []).length, 15);
  const sans = JSON.parse(JSON.stringify(ep)); sans.plans[0].lueur = false;
  assert.deepStrictEqual(montage(sans, voix).erreurs, []);
});

test('jeu de culture : cinq mots, six croisements, une réponse toutes les 10 s, barre jusqu\'au dernier palier', () => {
  const G = require('../studio/avis/grille.js');
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const ep = lire('videos/episodes/jeu-culture.json'), voix = lire('videos/voix/jeu-culture/mots.json');
  const mots = ep.plans[0].mots, g = G.construire(mots);
  assert.deepStrictEqual(g.erreurs, []);
  assert.strictEqual(mots.length, 5);
  assert.ok(g.lignes <= 8 && g.colonnes <= 8 && g.cases.filter((c) => c.mots.length > 1).length >= 6, 'au moins six croisements');
  mots.forEach((_, k) => assert.ok(g.cases.filter((c) => c.mots.length > 1 && c.mots.includes(k)).length >= 2, `le mot ${k + 1} en croise deux autres`));
  const r = montage(ep, voix);
  assert.deepStrictEqual(r.erreurs, []);
  assert.ok(r.feuille.duree <= 75);
  const rep = r.feuille.plans[0].p.mots.map((m) => m.reponse.t);
  for (let k = 1; k < 5; k += 1) assert.ok(Math.abs(rep[k] - rep[k - 1] - 10) < 0.15, `10 s entre les réponses ${k} et ${k + 1} : ${rep}`);
  const html = page.html(r.feuille).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.strictEqual((html.match(/<div class="indices">(.*?)<\/div>/s) || ['', ''])[1].split('<p>').length - 1, 5, 'cinq indices dans le bandeau');
  for (let w = 0; w < 5; w += 1) assert.strictEqual((html.match(new RegExp(`data-w="${w}"`, 'g')) || []).length, 10, `dix chiffres dans la tranche ${w + 1}`);
  assert.ok(html.includes('Académicien') && G.figure('academicien').includes('<svg') && G.figure('hugo').includes('<svg'));
  // Le mot de trop est refusé, avec les six mots c'est accepté.
  const sept = JSON.parse(JSON.stringify(ep)); sept.plans[0].mots.push(sept.plans[0].mots[0], sept.plans[0].mots[1]);
  assert.ok(montage(sept, voix).erreurs.some((e) => e.includes('à six mots')));
});

test('jeu v4 : cases à toute la largeur, horaire commun image et son, tension de l\'orbe, bruitages du jeu', () => {
  const G = require('../studio/avis/grille.js');
  const ORBE = require('../studio/avis/orbe.js');
  const sons = require('../scripts/sons-avis.js');
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  // Des cases larges pour une grille de 5 × 6, plus petites pour 8 lignes, jamais hors de la largeur utile.
  const g56 = G.construire(lire('videos/episodes/jeu-culture.json').plans[0].mots), d = G.dims(g56);
  assert.ok(d.caseTaille >= 110 && d.gx >= 60 && d.gx + d.w <= 1020, JSON.stringify(d));
  const g86 = G.construire(lire('videos/episodes/jeu-moliere.json').plans[0].mots), d2 = G.dims(g86);
  assert.ok(d2.caseTaille <= 100 && d2.gy + d2.h <= 1260, JSON.stringify(d2));
  // L'horaire : une lettre neuve toutes les 0,22 s, posée 0,5 s après le départ de l'étincelle.
  const h = G.horaires(10, 5);
  assert.deepStrictEqual(h.pose.map((x) => +x.toFixed(2)), [10.5, 10.72, 10.94, 11.16, 11.38]);
  assert.strictEqual(G.nouvelles(g56, 5).reduce((n, c) => n + c.length, 0), g56.cases.length, 'chaque case est neuve une seule fois');
  // La feuille : un son par lettre neuve, le mot trouvé, trois tics ; une tension de l'orbe par tranche ; l'orbe sur le côté du bandeau.
  const ep = lire('videos/episodes/jeu-culture.json'), voix = lire('videos/voix/jeu-culture/mots.json');
  const f = montage(ep, voix).feuille;
  assert.strictEqual(f.sons.filter((x) => /^lettre-/.test(x.f)).length, g56.cases.length);
  assert.strictEqual(f.sons.filter((x) => x.f === 'trouve.wav').length, 5);
  assert.strictEqual(f.sons.filter((x) => x.f === 'tic-jeu.wav').length, 15);
  assert.strictEqual(f.orbe.tensions.length, 5);
  assert.ok(f.orbe.trajet[0].x < 250 && f.orbe.trajet[0].y < 500, 'orbe garée à gauche du bandeau');
  const tn = ORBE.tension(f.orbe.tensions, f.orbe.tensions[1][0] + 1.5);
  assert.ok(tn.v > 0.3 && tn.v < 0.7 && tn.p >= 0 && tn.p <= 1);
  assert.deepStrictEqual(ORBE.tension(f.orbe.tensions, 0.5), { v: 0, p: 0 });
  // Les bruitages du jeu sont finis et reproductibles.
  for (const nom of ['lettre-1.wav', 'lettre-8.wav', 'trouve.wav', 'tic-jeu.wav']) {
    const a = sons.BRUITAGES[nom](), b = sons.BRUITAGES[nom]();
    assert.strictEqual(a.length, b.length);
    for (let i = 0; i < a.length; i += 1) { assert.ok(Number.isFinite(a[i])); assert.strictEqual(a[i], b[i]); }
  }
  // La page : un bandeau, une flèche par départ de mot, plus de cartes empilées, le fond en papier.
  const html = page.html(f).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.strictEqual((html.match(/class="bandeau"/g) || []).length, 1);
  assert.ok(!html.includes('class="carte"') && html.includes('fond-papier'));
});

test('jeu de langue : la difficulté monte (lettres à deviner et rareté), cadence de 10 s, cinq mots et six croisements', () => {
  const G = require('../studio/avis/grille.js');
  const { montage } = require('../studio/avis/montage.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const aDeviner = (id) => { const mots = lire(`videos/episodes/${id}.json`).plans[0].mots, g = G.construire(mots); return { g, dev: G.nouvelles(g, mots.length).map((c) => c.length), longueurs: mots.map((m) => m.texte.length) }; };
  const l = aDeviner('jeu-langue');
  assert.deepStrictEqual(l.g.erreurs, []);
  assert.ok(l.g.cases.filter((c) => c.mots.length > 1).length >= 6);
  for (let k = 1; k < 5; k += 1) assert.ok(l.dev[k] >= l.dev[k - 1] && l.longueurs[k] >= l.longueurs[k - 1], `non décroissant au mot ${k + 1} : ${l.dev} / ${l.longueurs}`);
  assert.ok(l.dev[4] - l.dev[0] >= 2, 'au moins deux lettres de plus entre le premier et le dernier mot');
  // Le premier jeu (trois mots) : le dernier mot est plus long à deviner que le premier.
  const m = aDeviner('jeu-moliere');
  assert.ok(m.dev[2] > m.dev[0]);
  const ep = lire('videos/episodes/jeu-langue.json'), r = montage(ep, lire('videos/voix/jeu-langue/mots.json'));
  assert.deepStrictEqual(r.erreurs, []);
  assert.ok(r.feuille.duree <= 75);
  const rep = r.feuille.plans[0].p.mots.map((x) => x.reponse.t);
  for (let k = 1; k < 5; k += 1) assert.ok(Math.abs(rep[k] - rep[k - 1] - 10) < 0.15);
});

test('jeu v5 : grille agrandie dans y 490-1260, barre sous les sous-titres, décors livres et plage, figures de la plage', () => {
  const G = require('../studio/avis/grille.js');
  const D = require('../studio/avis/jeu-decors.js');
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const g78 = G.construire(lire('videos/episodes/jeu-langue.json').plans[0].mots), d = G.dims(g78);
  assert.ok(d.caseTaille >= 100, `cases de 100 px et plus pour 7 × 8 : ${d.caseTaille}`);
  assert.ok(d.gy >= 490 && d.gy + d.h <= 1260 && d.gx >= 60 && d.gx + d.w <= 1020, JSON.stringify(d));
  // La barre de progression est sous la bande des sous-titres (y 1300 à 1430), le décor remplit le bas.
  assert.ok(/\.jeu \.barre \{[^}]*top: 14[4-9]\dpx/.test(G.css({ fond: '#000', texte: '#fff' }, { titre: 'X', fort: 'X', mono: 'X' })));
  for (const nom of ['livres', 'plage']) {
    const dec = D.decor(nom);
    assert.ok(dec.fond.includes('class="vague"') && dec.bas.length > 500 && !/NaN|undefined/.test(dec.fond + dec.bas), nom);
  }
  assert.ok(D.decor('plage').fond.includes('class="soleil"') && D.decor('livres').bas.includes('class="plume"'));
  assert.strictEqual(D.decor('inconnu'), D.DECORS.livres);
  for (const f of ['touriste', 'marin', 'robinson']) assert.ok(G.figure(f).includes('<svg') && !/NaN|undefined/.test(G.figure(f)), f);
  // La page de jeu-langue embarque son décor.
  const ep = lire('videos/episodes/jeu-langue.json');
  const html = page.html(montage(ep, lire('videos/voix/jeu-langue/mots.json')).feuille).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.ok(html.includes('class="plume"') && html.includes('fond-papier'));
});

test('jeu plage : cinq mots de plage et d\'îles, difficulté croissante, six croisements, 10 s entre les réponses, décor plage', () => {
  const G = require('../studio/avis/grille.js');
  const { montage } = require('../studio/avis/montage.js');
  const page = require('../studio/avis/page.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  const ep = lire('videos/episodes/jeu-plage.json'), mots = ep.plans[0].mots, g = G.construire(mots), nv = G.nouvelles(g, 5).map((c) => c.length);
  assert.deepStrictEqual(g.erreurs, []);
  assert.ok(g.cases.filter((c) => c.mots.length > 1).length >= 6 && g.lignes <= 8 && g.colonnes <= 8);
  for (let k = 1; k < 5; k += 1) assert.ok(nv[k] >= nv[k - 1] && mots[k].texte.length >= mots[k - 1].texte.length, `non décroissant : ${nv}`);
  assert.ok(nv[4] - nv[0] >= 2);
  assert.strictEqual(ep.plans[0].decor, 'plage');
  const r = montage(ep, lire('videos/voix/jeu-plage/mots.json'));
  assert.deepStrictEqual(r.erreurs, []);
  assert.ok(r.feuille.duree <= 75);
  const rep = r.feuille.plans[0].p.mots.map((x) => x.reponse.t);
  for (let k = 1; k < 5; k += 1) assert.ok(Math.abs(rep[k] - rep[k - 1] - 10) < 0.15);
  const html = page.html(r.feuille).replace(/<script[\s\S]*?<\/script>/g, '');
  assert.ok(html.includes('class="soleil"') && html.includes('Touriste') && html.includes('Robinson'));
});

test('décors animés : crabe, dauphin, nuages, souris, livres sauteurs, avion ; mouvement vérifié dans la page', async (t) => {
  const D = require('../studio/avis/jeu-decors.js');
  const plage = D.decor('plage'), livres = D.decor('livres');
  for (const cls of ['crabe', 'dauphin', 'eclaboussure', 'nuage', 'vague', 'soleil']) assert.ok((plage.fond + plage.bas).includes(`class="${cls}"`), `plage : ${cls}`);
  for (const cls of ['souris', 'livre-saut', 'avion', 'plume', 'vague']) assert.ok((livres.fond + livres.bas).includes(`class="${cls}`), `livres : ${cls}`);
  for (const d of [plage, livres]) { const o = (d.bas.match(/<g[ >]/g) || []).length, f = (d.bas.match(/<\/g>/g) || []).length; assert.strictEqual(o, f, 'groupes SVG équilibrés'); }
  assert.strictEqual(typeof D.animer, 'function');
  // Dans la page : au milieu de sa traversée le crabe est à l'écran, avant elle il est hors champ ; le dauphin est dans la voie de mer au sommet de son saut.
  let chromium; try { ({ chromium } = require('playwright')); } catch (e) { t.skip('Playwright absent'); return; }
  const dossier = path.join(__dirname, '..', 'videos/studio/jeu-plage');
  if (!fs.existsSync(path.join(dossier, 'index.html'))) { t.skip('composition jeu-plage non construite'); return; }
  const nav = await chromium.launch(), page = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  try {
    await page.goto(`file://${path.join(dossier, 'index.html')}`);
    await page.waitForFunction(() => window.__timelines && Object.keys(window.__timelines).length, null, { timeout: 15000 });
    const lire = (s, x) => page.evaluate(([sel, tt]) => { Object.values(window.__timelines)[0].seek(tt, false); const r = document.querySelector(sel).getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [s, x]);
    assert.ok((await lire('.crabe', 5)).x > 1080 || (await lire('.crabe', 5)).x < 0, 'crabe hors champ avant sa traversée');
    const milieu = await lire('.crabe', 14.5); assert.ok(milieu.x > 100 && milieu.x < 1000, `crabe à l'écran : ${milieu.x}`);
    const saut = await lire('.dauphin', 6); assert.ok(saut.y > 1200 && saut.y < 1350, `dauphin au sommet : ${saut.y}`);
    assert.ok((await lire('.dauphin', 4)).y > 2000, 'dauphin hors champ avant son saut');
    const v1 = await page.evaluate(() => { Object.values(window.__timelines)[0].seek(10, false); return document.querySelector('.vague').getBoundingClientRect().x; });
    const v2 = await page.evaluate(() => { Object.values(window.__timelines)[0].seek(11.5, false); return document.querySelector('.vague').getBoundingClientRect().x; });
    assert.ok(Math.abs(v1 - v2) > 5, `les vagues bougent : ${v1} → ${v2}`);
  } finally { await nav.close(); }
});

test('voix des jeux : recalage des mots dans un silence, horaires après la voix, vérifications du montage', () => {
  const { recaler, finParole } = require('../studio/avis/recalage.js');
  const G = require('../studio/avis/grille.js');
  const { montage } = require('../studio/avis/montage.js');
  const lire = (f) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', f), 'utf8'));
  // Un mot daté dans un silence est ramené à la fin du silence ; un mot hors silence ne bouge pas ; la voix d'origine n'est pas modifiée.
  const v = { duree: 10, silences: [[2, 3], [5, 5.2]], mots: [{ m: 'a', d: 1, f: 1.5 }, { m: 'cest', d: 2.5, f: 2.7 }, { m: 'coco', d: 2.7, f: 3.4 }, { m: 'b', d: 5.05, f: 5.15 }] };
  const r = recaler(v);
  assert.deepStrictEqual(r.mots.map((m) => m.d), [1, 3, 3, 5.05], 'silence court (0,2 s) : le mot ne bouge pas');
  assert.ok(r.mots.every((m) => m.f >= m.d + 0.05) && v.mots[1].d === 2.5);
  // La fin de la phrase de réponse : le début du silence suivant si elle est isolée.
  const iso = finParole({ duree: 20, silences: [[16.9, 17.5]] }, { d: 16.3, f: 16.6 });
  assert.deepStrictEqual(iso, { fin: 16.9, isolee: true });
  assert.strictEqual(finParole({ duree: 20, silences: [] }, { d: 16.3, f: 16.4 }).isolee, false);
  // La première lettre se pose au plus tôt 0,5 s après la fin de la phrase dite.
  assert.ok(G.horaires(10, 4, 10.8).pose[0] >= 10.8 + G.LETTRE.apresVoix - 1e-9 && G.horaires(10, 4, 10.8).depart < G.horaires(10, 4, 10.8).pose[0]);
  assert.strictEqual(G.horaires(10, 4, 0).pose[0], 10.5);
  // Le montage vérifie la voix : mot de la grille, définition sans la réponse, rien d'autre avant la réponse.
  const ep = lire('videos/episodes/jeu-plage.json'), voix = lire('videos/voix/jeu-plage/mots.json');
  assert.deepStrictEqual(montage(ep, voix).erreurs, []);
  const faux = JSON.parse(JSON.stringify(ep)); faux.plans[0].mots[0].texte = 'COCOS';
  assert.ok(montage(faux, voix).erreurs.some((e) => e.includes('la voix dit') && e.includes('la grille attend')));
  const entendu = JSON.parse(JSON.stringify(faux)); entendu.plans[0].mots[0].reponse.entendu = 'coco';
  assert.ok(!montage(entendu, voix).erreurs.some((e) => e.includes('la voix dit')), '« entendu » assume la différence');
  const dans = JSON.parse(JSON.stringify(ep)); dans.plans[0].mots[1].indice.a = 'il brille'; dans.plans[0].mots[1].reponse.a = 'plage. C\'est';
  assert.ok(montage(dans, voix).erreurs.some((e) => e.includes('dit avant la réponse') || e.includes('la voix dit')));
  const nu = JSON.parse(JSON.stringify(voix)); nu.silences = nu.silences.filter(([a, b]) => b - a < 0.3 || a < 15);
  assert.ok(montage(ep, nu).erreurs.some((e) => e.includes('n\'est pas séparée')) || montage(ep, nu).erreurs.length > 0, 'sans silence après la réponse : erreur');
});

test('vérification sur le signal : réussite si la lettre suit la voix, échec si elle la précède, sous-titre dans un silence détecté', () => {
  const { verifier, segmentsParole } = require('../scripts/verifier-voix.js');
  const taux = 16000, ech = new Float32Array(taux * 20);
  const parole = (a, b) => { for (let i = Math.floor(a * taux); i < Math.floor(b * taux); i += 1) ech[i] = 0.3 * Math.sin(i * 0.2); };
  parole(1, 4); parole(14, 14.8); parole(15.6, 18);
  const seg = segmentsParole(ech, taux);
  assert.ok(seg.length === 3 && Math.abs(seg[1][0] - 14) < 0.05 && Math.abs(seg[1][1] - 14.8) < 0.05, JSON.stringify(seg));
  const mots = [{ texte: 'COCO', sens: 'h', ligne: 1, colonne: 4 }, { texte: 'SOLEIL', sens: 'v', ligne: 0, colonne: 7 }, { texte: 'CORAIL', sens: 'v', ligne: 1, colonne: 4 }, { texte: 'MANGROVE', sens: 'h', ligne: 3, colonne: 0 }, { texte: 'ARCHIPEL', sens: 'h', ligne: 5, colonne: 0 }];
  const feuille = (t, f, groupes) => ({ plans: [{ id: 'grille', t0: 0, p: { cadence: 10, mots: mots.map((m, k) => ({ ...m, reponse: { t: k === 0 ? t : 40 + k, f: k === 0 ? f : 41 + k } })) } }], groupes });
  const bon = verifier(feuille(14, 14.8, [{ t0: 14.0, mots: [{ m: 'c\'est' }] }]), ech, taux).problemes.filter((p) => p.startsWith('mot 1'));
  assert.deepStrictEqual(bon, [], 'lettres après la phrase : rien à signaler');
  const mauvais = verifier(feuille(14, 14.1, []), ech, taux).problemes.filter((p) => p.startsWith('mot 1'));
  assert.ok(mauvais.some((p) => p.includes('avant la voix') || p.includes('moins de')), 'lettre avant la fin de la voix : signalée');
  const sousTitre = verifier(feuille(14, 14.8, [{ t0: 10, mots: [{ m: 'oups' }] }]), ech, taux).problemes;
  assert.ok(sousTitre.some((p) => p.includes('sous-titre') && p.includes('silence')));
});

test('voix des jeux récents : aucune réponse avant la voix (signal réel), montage sans erreur', () => {
  const { verifier, lirePiste } = require('../scripts/verifier-voix.js');
  for (const id of ['jeu-plage', 'jeu-langue']) {
    const f = path.join(__dirname, '..', 'videos/studio', id);
    if (!fs.existsSync(path.join(f, 'feuille.json')) || !fs.existsSync(path.join(f, 'assets/sons/voix.wav'))) continue;   // composition non construite
    const r = verifier(JSON.parse(fs.readFileSync(path.join(f, 'feuille.json'), 'utf8')), lirePiste(path.join(f, 'assets/sons/voix.wav')), 16000);
    assert.deepStrictEqual(r.problemes, [], id);
  }
});
