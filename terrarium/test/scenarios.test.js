const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { valider, ACTIONS } = require('../shared/scenarios.js');

const dossier = path.join(__dirname, '../videos/scenarios');
const scenarios = fs.readdirSync(dossier).filter((f) => f.endsWith('.json'))
  .map((f) => ({ f, sc: JSON.parse(fs.readFileSync(path.join(dossier, f), 'utf8')) }));
const film = fs.readFileSync(path.join(__dirname, '../public/js/film/film.js'), 'utf8');

test('cinq scénarios, un par chapitre', () => {
  assert.equal(scenarios.length, 5);
  const chapitres = scenarios.map(({ sc }) => sc.chapitre).sort();
  assert.deepEqual(chapitres, ['bocal', 'capteurs', 'couches', 'cycle', 'ecosysteme']);
});

for (const { f, sc } of scenarios) {
  test(`${f} est valide et tient en moins de 45 s`, () => {
    assert.deepEqual(valider(sc), []);
    assert.equal(sc.id, path.basename(f, '.json'));
    assert.ok(sc.duree <= 45);
    assert.ok(sc.plans[0].fin <= 3, 'une accroche de 3 s au plus');
  });
}

test('le moteur connaît exactement les actions annoncées', () => {
  const noms = [...film.matchAll(/^ {6}'([a-z]+\.[a-z]+)'\(t/gm)].map((m) => m[1]).sort();
  assert.deepEqual(noms, [...ACTIONS].sort());
});

test('le validateur repère les erreurs courantes', () => {
  const base = { id: 'x', titre: 'X', concept: 'Y', duree: 6, plans: [{ debut: 0, fin: 3 }, { debut: 3, fin: 6 }] };
  assert.deepEqual(valider(base), []);
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 3 }, { debut: 4, fin: 6 }] }).some((e) => e.includes('sans trou')));
  assert.ok(valider({ ...base, duree: 8 }).some((e) => e.includes('durée annoncée')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, actions: [{ type: 'cameleon.voler' }] }] }).some((e) => e.includes('action inconnue')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, actions: [{ type: 'cameleon.langue', a: 7 }] }] }).some((e) => e.includes('hors du plan')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, camera: { cible: 'lune' } }] }).some((e) => e.includes('caméra')));
});

test('le dessin et les cartes se calculent en Node, toujours identiques', () => {
  const bac = { window: {} };
  vm.createContext(bac);
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../public/js/art/terrarium.js'), 'utf8'), bac);
  vm.runInContext(film, bac);
  const { art, film: f } = bac.window.Terrarium;
  assert.equal(art.svg(), art.svg());
  for (const id of ['cam', 'cam-langue', 'mouche', 'dionee-g', 'grenouille-sac', 'goutte-requete', 'filtre-sable', 'fourmiliere', 'butin', 'eclats']) {
    assert.ok(art.svg().includes(`id="${id}"`), `élément #${id} présent`);
  }
  const html = f.carteHTML({ type: 'code', titre: 'T', lignes: ['a <b>', 'c'], surligne: [1] });
  assert.ok(html.includes('a &lt;b&gt;') && html.includes('surligne'));
});

test('le moteur respecte le contrat des rendus image par image', () => {
  assert.ok(!/repeat:\s*-1/.test(film), 'pas de répétition infinie');
  assert.ok(!/Math\.random|Date\.now|setTimeout|setInterval|requestAnimationFrame/.test(film), 'ni hasard, ni horloge, ni minuterie');
  assert.ok(!/querySelector(All)?\(`/.test(film) && !/\bqa?\(`/.test(film), 'pas de sélecteur en gabarit (le compilateur HyperFrames les refuse)');
});
