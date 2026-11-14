// Tests de la chaîne V3 (scènes et montage), sans navigateur.
const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { montage, SCENES, NOMS } = require('../studio/montage.js');

const ep = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../videos/episodes/essai-scenes.json'), 'utf8'));
const fiche = () => JSON.parse(fs.readFileSync(path.join(__dirname, '../videos/episodes/essai-scenes.sources.json'), 'utf8'));

test('V3 : les 9 scènes exposent la même interface', () => {
  assert.strictEqual(NOMS.length, 13);
  for (const n of NOMS) {
    const s = SCENES[n];
    assert.strictEqual(s.id, n);
    for (const k of ['description', 'params', 'min', 'textes', 'sons', 'dessin', 'jouer']) assert.ok(s[k] != null, `${n}.${k}`);
    if (s.source) assert.strictEqual(typeof s.texteSource, 'function', `${n}.texteSource`);
  }
});

test('V3 : l’épisode d’essai se monte, durées calées sur le temps', () => {
  const { erreurs, feuille } = montage(ep(), fiche());
  assert.deepStrictEqual(erreurs, []);
  const T = 60 / 90;
  feuille.scenes.forEach((s) => assert.ok(Math.abs(s.d / T - Math.round(s.d / T)) < 1e-3, `${s.id} : ${s.d}`));
  assert.strictEqual(feuille.scenes[0].p._source, undefined);
  assert.ok(feuille.scenes[1].p._source.includes('Steel'));
});

test('V3 : refus sans source, sans fiche, texte qui ne correspond pas, trop long ou hors durée', () => {
  const e1 = ep(); delete e1.scenes[1].source;
  assert.ok(montage(e1, fiche()).erreurs.some((x) => x.includes('demande "source"')));
  assert.ok(montage(ep(), null).erreurs.some((x) => x.includes('fiche')));
  const e2 = ep(); e2.scenes[1].legende = 'autre chose';
  assert.ok(montage(e2, fiche()).erreurs.some((x) => x.includes('ne correspond pas')));
  const e3 = ep(); e3.scenes[0].texte = 'x '.repeat(50);
  assert.ok(montage(e3, fiche()).erreurs.some((x) => x.includes('caractères')));
  const e4 = ep(); delete e4.essai;
  assert.ok(montage(e4, fiche()).erreurs.some((x) => x.includes('entre 30 et 60 s')));
  const e5 = ep(); e5.scenes.pop();
  assert.ok(montage(e5, fiche()).erreurs.some((x) => x.includes('boucle')));
});

test('V3 : ni hasard, ni minuterie, ni répétition infinie dans le lecteur et les scènes', () => {
  const fichiers = ['studio/lecteur.js', ...NOMS.map((n) => `studio/scenes/${n}.js`)];
  for (const f of fichiers) {
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.ok(!/Math\.random|setTimeout|setInterval|requestAnimationFrame|repeat:\s*-1/.test(src), f);
  }
});

test('Format « test » : le pilote se monte, scènes sur les temps, cerveau dans la feuille', () => {
  const ep = JSON.parse(fs.readFileSync(path.join(__dirname, '../videos/episodes/procrastination.json'), 'utf8'));
  const fi = JSON.parse(fs.readFileSync(path.join(__dirname, '../videos/episodes/procrastination.sources.json'), 'utf8'));
  const { erreurs, feuille } = montage(ep, fi);
  assert.deepStrictEqual(erreurs, []);
  const T = 60 / 90;
  feuille.scenes.forEach((s) => assert.ok(Math.abs(s.t0 / T - Math.round(s.t0 / T)) < 1e-2, `${s.id} commence sur un temps`));
  assert.ok(feuille.reseau.n > 2000 && feuille.reseau.liaisons.length > 2000);
  assert.ok(feuille.arrangement.coupures.length >= 1);
  const sans = JSON.parse(JSON.stringify(ep)); sans.scenes = sans.scenes.filter((s) => s.scene !== 'question');
  assert.ok(montage(sans, fi).erreurs.some((x) => x.includes('"question"')));
  const finFaux = JSON.parse(JSON.stringify(ep)); finFaux.scenes.pop();
  assert.ok(montage(finFaux, fi).erreurs.some((x) => x.includes('"appel"')));
});

test('Cerveau vivant : même graine, même réseau ; aucun hasard au rendu', () => {
  const { generer } = require('../studio/reseau/modele.js');
  assert.deepStrictEqual(generer({ n: 600 }), generer({ n: 600 }));
  for (const f of ['studio/reseau/dessin.js', 'studio/scenes/test.js', 'studio/scenes/question.js', 'studio/scenes/revelation.js', 'studio/scenes/appel.js']) {
    const src = fs.readFileSync(path.join(__dirname, '..', f), 'utf8');
    assert.ok(!/Math\.random|setTimeout|setInterval|requestAnimationFrame|repeat:\s*-1/.test(src), f);
  }
});
