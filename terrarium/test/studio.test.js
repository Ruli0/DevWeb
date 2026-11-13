// Tests du studio : le compilateur (épisode → feuille de route), la page, le catalogue.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { compiler } = require('../studio/compiler.js');
const page = require('../studio/page.js');
const { catalogue } = require('../studio/catalogue.js');

const dossier = path.join(__dirname, '../videos/episodes');
const episodes = fs.readdirSync(dossier).filter((f) => f.endsWith('.json')).map((f) => ({ f, ep: JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8')) }));
const demo = episodes.find((x) => x.ep.id === 'demo').ep;

for (const { f, ep } of episodes) {
  test(`${f} : compile sans erreur, durée en mesures entières, sons et textes dans la vidéo`, () => {
    const { erreurs, feuille } = compiler(ep);
    assert.deepEqual(erreurs, []);
    assert.equal(ep.id, path.basename(f, '.json'));
    const M = (4 * 60) / feuille.tempo;
    assert.ok(Math.abs(feuille.duree / M - Math.round(feuille.duree / M)) < 1e-3, 'durée en mesures entières');
    assert.equal(feuille.arrangement.parties.length, Math.round(feuille.duree / M));
    feuille.sons.forEach((s) => assert.ok(s.t >= 0 && s.t < feuille.duree && fs.existsSync(path.join(__dirname, '../videos/sons', s.f)), `son ${s.f} à ${s.t} s`));
    feuille.textes.forEach((m, k) => { if (k) assert.ok(Math.abs(m.debut - feuille.textes[k - 1].fin) < 0.01, 'textes bout à bout'); });
  });
}

test('le compilateur et la page sont reproductibles', () => {
  const a = compiler(demo).feuille; const b = compiler(demo).feuille;
  assert.deepEqual(a, b);
  assert.equal(page.html(a), page.html(b));
});

test('la caméra finit sur le cadrage du début, et chaque mouvement part de la vue précédente', () => {
  const { camera } = compiler(demo).feuille;
  assert.deepEqual(camera[camera.length - 1].vers, camera[0].vers);
  camera.forEach((k, i) => { if (i) assert.deepEqual(k.de, camera[i - 1].vers); });
});

test('le compilateur refuse les épisodes invalides, avec un message clair', () => {
  const avec = (temps) => compiler({ ...demo, temps }).erreurs;
  assert.ok(avec([{ fort: 'voler' }]).some((e) => e.includes('temps fort inconnu')));
  assert.ok(avec([{ fort: 'accroche', texte: 'un texte bien trop long pour une seule mesure de musique' }]).some((e) => e.includes('caractères') || e.includes('il en faut')));
  assert.ok(avec([{ fort: 'accroche' }, { fort: 'rater' }]).some((e) => e.startsWith('boucle')), 'une fin qui ne reboucle pas est refusée');
  assert.ok(avec([{ fort: 'presenter', qui: 'dragon' }]).some((e) => e.includes('presenter')));
  assert.ok(compiler({ ...demo, id: 'Démo' }).erreurs.some((e) => e.startsWith('id')));
});

test('deux gestes du même canal ne peuvent pas se chevaucher', () => {
  const { erreurs } = compiler({ ...demo, temps: [{ fort: 'rater', mesures: 1 }, { fort: 'rater', mesures: 1 }, { fort: 'boucler' }] });
  assert.ok(erreurs.some((e) => e.includes('chevauche') || e.includes('hors de la vidéo')));
});

test('le runtime et les rigs ne contiennent ni minuterie, ni hasard, ni répétition infinie', () => {
  for (const f of ['studio/runtime.js', 'studio/rigs/cameleon.js', 'studio/rigs/mouche.js', 'studio/rigs/mousse.js', 'studio/rigs/outils.js', 'studio/rigs/schema.js', 'studio/rigs/grenouille.js', 'studio/rigs/lucioles.js', 'studio/rigs/pensees.js', 'studio/rigs/ambiance.js', 'studio/rigs/escargot.js', 'studio/decors/branche.js']) {
    const s = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.ok(!/setTimeout|setInterval|requestAnimationFrame|Math\.random|repeat:\s*-1/.test(s), f);
  }
});

test('production/CATALOGUE.md est à jour (node studio/catalogue.js)', () => {
  assert.equal(fs.readFileSync(path.join(__dirname, '../production/CATALOGUE.md'), 'utf8'), catalogue());
});

test('texte par mesure : chaque morceau occupe exactement sa mesure, et le nombre de morceaux est vérifié', () => {
  const ep = { ...demo, temps: [{ fort: 'accroche', texte: 'mon IA *rate*.' }, { fort: 'etapes', texte: ['1. *observer*', '2. *agir*', '3. *vérifier*'] }, { fort: 'boucler' }] };
  const { erreurs, feuille } = compiler(ep);
  assert.deepEqual(erreurs, []);
  const M = (4 * 60) / feuille.tempo;
  const etapes = feuille.textes.filter((m) => /^\d\./.test(m.texte));
  assert.equal(etapes.length, 3);
  etapes.forEach((m, k) => { assert.ok(Math.abs(m.fin - m.debut - M) < 0.01); assert.ok(Math.abs(m.debut - (1 + k) * M) < 0.01); });
  const mauvais = compiler({ ...ep, temps: [{ fort: 'accroche' }, { fort: 'etapes', texte: ['1. observer', '2. agir'] }, { fort: 'boucler' }] });
  assert.ok(mauvais.erreurs.some((e) => e.includes('un texte par mesure')));
});

test('nuit-1 : quatre tours de boucle comptés (tour, temps, tokens), puis le compteur revient à zéro', () => {
  const nuit = episodes.find((x) => x.ep.id === 'nuit-1');
  const { feuille } = compiler(nuit.ep);
  const compteurs = feuille.ordres.filter((o) => o.qui === 'schema' && o.geste === 'compteur');
  assert.deepEqual(compteurs.map((o) => o.p.vers.tour), [1, 2, 3, 4, 0]);
  assert.equal(compteurs[3].p.vers.s, 120, '4 tours = 2 minutes');
  const outils = feuille.ordres.filter((o) => o.qui === 'outils');
  assert.ok(outils.some((o) => o.geste === 'attrape' && o.p.id === 'loupe') && outils.some((o) => o.geste === 'attrape' && o.p.id === 'page'));
  assert.equal(feuille.depart.mouche.visible, false, 'la tâche (le bug) arrive plus tard');
});

test('jugement : le projecteur est éteint à la fin, et chaque voisin a sa bulle de pensée après la question « ? »', () => {
  const j = episodes.find((x) => x.ep.id === 'jugement');
  const { feuille, erreurs } = compiler(j.ep);
  assert.deepEqual(erreurs, []);
  const projo = feuille.ordres.filter((o) => o.qui === 'ambiance').map((o) => o.p.etat);
  assert.equal(projo[projo.length - 1], 'eteindre');
  assert.equal(projo.filter((e) => e === 'allumer').length, projo.filter((e) => e === 'eteindre').length, 'chaque projecteur allumé est éteint');
  const bulles = feuille.ordres.filter((o) => o.qui === 'pensees').map((o) => o.p.sur);
  assert.deepEqual(bulles, ['cameleon', 'grenouille', 'cameleon', 'lucioles', 'cameleon', 'escargot']);
});

test('un épisode sans « voisins » ne peut pas utiliser la grenouille, les lucioles ou le projecteur', () => {
  const j = episodes.find((x) => x.ep.id === 'jugement').ep;
  const { erreurs } = compiler({ ...j, voisins: false });
  assert.ok(erreurs.some((e) => e.includes('voisins')));
});
