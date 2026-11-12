const test = require('node:test');
const assert = require('node:assert/strict');
const { simulate } = require('../shared/simulation.js');
const content = require('../shared/content.js');

test('cycle : la boucle finit par une réponse sans outil', () => {
  const { steps, tours } = simulate('cycle');
  assert.equal(steps.at(-1).type, 'reponse');
  assert.equal(steps.filter((s) => s.type === 'appel').length, 3);
  assert.equal(tours, 4);
});

test('couches : le journal avant le filtre laisse fuir l\'e-mail', () => {
  const fuite = simulate('couches', { layers: ['journal', 'filtre'] });
  assert.ok(fuite.steps[0].fuite);
  const sain = simulate('couches', { layers: ['filtre', 'journal'] });
  assert.ok(!sain.steps.some((s) => s.fuite));
  assert.ok(!sain.steps.find((s) => s.phase === 'modele').payload.includes('@'));
});

test('couches : le cache court-circuite le modèle au second passage', () => {
  const layers = ['filtre', 'cache', 'debit'];
  const un = simulate('couches', { layers });
  assert.ok(un.steps.some((s) => s.phase === 'modele'));
  const deux = simulate('couches', { layers, state: un.state });
  assert.ok(!deux.steps.some((s) => s.phase === 'modele'));
  assert.equal(deux.state.appels, 1, 'le quota ne bouge pas sous le cache');
});

test('couches : la limite de débit refuse la 4e requête', () => {
  let state;
  let r;
  for (let i = 0; i < 4; i += 1) {
    r = simulate('couches', { layers: ['debit'], state });
    state = r.state;
  }
  assert.match(r.reponse, /429/);
  assert.ok(!r.steps.some((s) => s.phase === 'modele'));
});

test('capteurs : sans hook, tout est arraché et inondé', () => {
  const { issue } = simulate('capteurs', { hooks: [] });
  assert.deepEqual(issue, { plantes: false, inonde: true, corrige: false, carnet: 0 });
});

test('capteurs : les hooks bloquent, modifient et notent', () => {
  const { issue, steps } = simulate('capteurs', { hooks: ['garde', 'limiteur', 'carnet', 'hygrometre'] });
  assert.equal(issue.plantes, true);
  assert.equal(issue.inonde, false);
  assert.equal(issue.carnet, 3);
  assert.ok(steps.some((s) => s.verdict === 'bloque'));
  assert.ok(steps.some((s) => s.verdict === 'modifie'));
});

test('capteurs : l\'hygromètre seul permet de corriger l\'inondation', () => {
  const { issue } = simulate('capteurs', { hooks: ['hygrometre'] });
  assert.equal(issue.corrige, true);
  assert.equal(issue.inonde, false);
});

test('écosystème : déléguer garde le bocal principal léger', () => {
  const equipe = simulate('ecosysteme', { mode: 'equipe' });
  const seul = simulate('ecosysteme', { mode: 'seul' });
  assert.equal(equipe.bilan.principal, 1850);
  assert.equal(equipe.bilan.deborde, false);
  assert.equal(seul.bilan.principal, 29300);
  assert.equal(seul.bilan.deborde, true);
});

test('scénario inconnu et options hostiles', () => {
  assert.equal(simulate('inconnu'), null);
  assert.equal(simulate('constructor'), null);
  assert.ok(simulate('couches', { layers: 'x', state: { appels: 'abc', cache: [{}] } }));
});

test('contenu : cinq chapitres complets', () => {
  assert.equal(content.chapters.length, 5);
  for (const c of content.chapters) {
    assert.equal(c.quiz.length, 2);
    assert.ok(c.code.source.length > 100);
    for (const q of c.quiz) assert.ok(q.reponse >= 0 && q.reponse < q.options.length);
  }
});
