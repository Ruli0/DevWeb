const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { valider, morceaux, variante, ACTIONS } = require('../shared/scenarios.js');
const { SONS_PAR_ACTION, SON_CARTE, SON_CAMERA, SON_AMBIANCE } = require('../videos/sons/table.js');

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
  test(`${f} : format TikTok (valide, 18 à 32 s, accroche courte, révélation brève, boucle)`, () => {
    assert.deepEqual(valider(sc), []);
    assert.equal(sc.id, path.basename(f, '.json'));
    assert.ok(sc.duree >= 18 && sc.duree <= 32, `durée ${sc.duree} s`);
    assert.ok(sc.plans[0].fin <= 3, 'une accroche de 3 s au plus');
    assert.ok(sc.plans[0].legende, 'une accroche écrite dès la première image');
    for (const p of sc.plans) if (p.carte) assert.ok(p.fin - p.debut <= 3.5, 'une révélation de 3,5 s au plus');
    const premier = sc.plans[0].camera;
    const dernier = [...sc.plans].reverse().find((p) => p.camera).camera;
    assert.deepEqual([dernier.cible, dernier.zoom], [premier.cible, premier.zoom], 'la fin reprend le cadrage du début');
    assert.ok(sc.serie && sc.publication && sc.publication.hashtags.length >= 3, 'série et kit de publication');
    assert.ok(Object.keys(sc.accroches || {}).length >= 2, 'au moins deux accroches de rechange');
  });
}

test('le moteur connaît exactement les actions annoncées', () => {
  const noms = [...film.matchAll(/^ {6}'([a-z]+\.[a-z]+)'\(t/gm)].map((m) => m[1]).sort();
  assert.deepEqual(noms, [...ACTIONS].sort());
});

test('les morceaux de légende se partagent le plan sans trou', () => {
  const plan = { debut: 2, fin: 5, legende: ['Tirer la langue :', 'un *appel d\'outil*.'] };
  const m = morceaux(plan);
  assert.equal(m.length, 2);
  assert.equal(m[0].debut, 2);
  assert.equal(m[0].fin, m[1].debut);
  assert.ok(Math.abs(m[1].fin - 5) < 0.01);
  assert.equal(m[0].besoin, 1.4, 'la ponctuation isolée ne compte pas comme un mot');
});

test('une variante ne change que l\'accroche', () => {
  const sc = scenarios.find((x) => x.sc.id === 'cameleon').sc;
  const b = variante(sc, 'b');
  assert.equal(b.id, 'cameleon-b');
  assert.deepEqual(b.plans[0].legende, sc.accroches.b);
  assert.deepEqual(b.plans.slice(1), sc.plans.slice(1));
  assert.throws(() => variante(sc, 'z'));
});

test('chaque bruitage existe et chaque action sonore existe', () => {
  const dossierSons = path.join(__dirname, '../videos/sons');
  const fichiers = new Set([SON_CARTE, SON_CAMERA, SON_AMBIANCE].map((s) => s.fichier));
  for (const [action, sons] of Object.entries(SONS_PAR_ACTION)) {
    assert.ok(ACTIONS.includes(action), `action inconnue dans la table des sons : ${action}`);
    sons.forEach((s) => fichiers.add(s.fichier));
  }
  for (const f of fichiers) assert.ok(fs.existsSync(path.join(dossierSons, f)), `${f} manquant : lancer node scripts/build-sons.js`);
});

test('le validateur repère les erreurs courantes', () => {
  const base = { id: 'x', titre: 'X', concept: 'Y', duree: 6, plans: [{ debut: 0, fin: 3 }, { debut: 3, fin: 6 }] };
  assert.deepEqual(valider(base), []);
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 3 }, { debut: 4, fin: 6 }] }).some((e) => e.includes('sans trou')));
  assert.ok(valider({ ...base, duree: 8 }).some((e) => e.includes('durée annoncée')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, actions: [{ type: 'cameleon.voler' }] }] }).some((e) => e.includes('action inconnue')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, actions: [{ type: 'cameleon.langue', a: 7 }] }] }).some((e) => e.includes('hors du plan')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 6, camera: { cible: 'lune' } }] }).some((e) => e.includes('caméra')));
  assert.ok(valider({ ...base, plans: [{ debut: 0, fin: 1, legende: 'Une phrase bien trop longue pour une seule seconde' }, { debut: 1, fin: 6 }] }).some((e) => e.includes('caractères') || e.includes('pour le lire')));
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
