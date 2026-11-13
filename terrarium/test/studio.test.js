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
  for (const f of ['studio/runtime.js', 'studio/rigs/cameleon.js', 'studio/rigs/mouche.js', 'studio/rigs/mousse.js', 'studio/decors/branche.js']) {
    const s = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.ok(!/setTimeout|setInterval|requestAnimationFrame|Math\.random|repeat:\s*-1/.test(s), f);
  }
});

test('production/CATALOGUE.md est à jour (node studio/catalogue.js)', () => {
  assert.equal(fs.readFileSync(path.join(__dirname, '../production/CATALOGUE.md'), 'utf8'), catalogue());
});

test('texte par mesure : chaque morceau occupe exactement sa mesure, et le nombre de morceaux est vérifié', () => {
  const nuit = episodes.find((x) => x.ep.id === 'nuit-1');
  if (!nuit) return;
  const { feuille } = compiler(nuit.ep);
  const M = (4 * 60) / feuille.tempo;
  const etapes = feuille.textes.filter((m) => /observer\*$|agir\*$|vérifier\*$/.test(m.texte) && /^\d\./.test(m.texte));
  assert.equal(etapes.length, 3);
  etapes.forEach((m) => assert.ok(Math.abs(m.fin - m.debut - M) < 0.01, `${m.texte} dure une mesure`));
  const { erreurs } = compiler({ ...nuit.ep, temps: [{ fort: 'etapes', texte: ['1. observer', '2. agir'] }, { fort: 'boucler' }] });
  assert.ok(erreurs.some((e) => e.includes('un texte par mesure')));
});
