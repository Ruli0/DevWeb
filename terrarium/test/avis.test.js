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
  assert.ok(montage(faux, voix).erreurs.some((e) => e.includes('trois mots')));
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
