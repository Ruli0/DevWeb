// Le son de la chaîne « avis » : l'indicatif du compte (un motif de quatre notes), la musique de fond construite dessus
// (une instrumentation par rubrique) et les bruitages calés sur l'image.
// Tout est synthétisé et reproductible (hasard à graine fixe), comme build-sons.js et sons-v3.js. Aucun échantillon externe.
//   node scripts/sons-avis.js <dossier>   → écrit les trois indicatifs proposés et un extrait de chaque musique
'use strict';
const path = require('node:path');

const O = () => require('./build-sons.js').outils;           // chargé à l'appel (dépendance circulaire)
const { reverbe } = require('./sons-v3.js');
const note = (n) => 440 * 2 ** ((n - 69) / 12);

// --- Trois timbres --------------------------------------------------------------------
const TIMBRES = {
  // Cloche douce : des partiels non harmoniques qui s'éteignent à des vitesses différentes.
  cloche(b, f, t, a, tenue = 1) {
    const { sinus, enveloppe } = O();
    sinus(b, () => f, (x) => a * enveloppe(x, 0.004, 0.55 * tenue), t, 'sin', 2.6 * tenue);
    sinus(b, () => f * 2.76, (x) => a * 0.22 * enveloppe(x, 0.002, 0.24 * tenue), t, 'sin', 1.2 * tenue);
    sinus(b, () => f * 5.4, (x) => a * 0.08 * enveloppe(x, 0.001, 0.1), t, 'sin', 0.5);
  },
  // Corde pincée : une attaque franche, des harmoniques qui tombent vite.
  pince(b, f, t, a, tenue = 1) {
    const { sinus, bruit, enveloppe, graine } = O();
    sinus(b, () => f, (x) => a * enveloppe(x, 0.002, 0.3 * tenue), t, 'sin', 1.6 * tenue);
    sinus(b, () => f * 2, (x) => a * 0.4 * enveloppe(x, 0.002, 0.16 * tenue), t, 'sin', 0.9 * tenue);
    sinus(b, () => f * 3, (x) => a * 0.18 * enveloppe(x, 0.001, 0.08), t, 'sin', 0.5);
    bruit(b, (x) => a * 0.12 * enveloppe(x, 0.0005, 0.008), { bas: 1500, haut: 7000, debut: t, hasard: graine(71), duree: 0.04 });
  },
  // Lame de bois (marimba) : ronde et courte, avec un petit claquement.
  bois(b, f, t, a, tenue = 1) {
    const { sinus, enveloppe } = O();
    sinus(b, () => f, (x) => a * enveloppe(x, 0.002, 0.2 * tenue), t, 'sin', 1.1 * tenue);
    sinus(b, () => f * 4, (x) => a * 0.28 * enveloppe(x, 0.001, 0.035), t, 'sin', 0.2);
    sinus(b, () => f * 10, (x) => a * 0.06 * enveloppe(x, 0.0005, 0.012), t, 'sin', 0.08);
  },
};

// --- Les trois indicatifs proposés à l'auteur (il en choisit un) -----------------------
// notes : hauteurs MIDI ; temps : instants des notes en secondes.
const INDICATIFS = {
  A: { nom: 'A, la cloche qui monte', timbre: 'cloche', notes: [69, 72, 76, 74], temps: [0, 0.16, 0.32, 0.54] },
  B: { nom: 'B, la corde qui rebondit', timbre: 'pince', notes: [62, 69, 67, 74], temps: [0, 0.14, 0.3, 0.44] },
  C: { nom: 'C, le bois qui répond', timbre: 'bois', notes: [76, 72, 69, 76], temps: [0, 0.13, 0.26, 0.5] },
};

// L'indicatif seul. court : les deux premières notes seulement (pour la première image de la vidéo).
function indicatif(cle = 'A', { court = false } = {}) {
  const { tampon } = O();
  const m = INDICATIFS[cle] || INDICATIFS.A, n = court ? 2 : m.notes.length;
  const b = tampon(court ? 1.1 : 3);
  for (let k = 0; k < n; k += 1) TIMBRES[m.timbre](b, note(m.notes[k]), 0.02 + m.temps[k], k === n - 1 ? 0.5 : 0.38, k === n - 1 ? 1.3 : 0.8);
  return reverbe(b, 0.3);
}

// --- La musique de fond : la même mélodie pour tout le compte, une instrumentation par rubrique --------------
const TEMPO = 96, TEMPS = 60 / TEMPO, MESURE = 4 * TEMPS;
const ACCORDS = [[57, 60, 64], [53, 57, 60], [48, 55, 64], [55, 59, 62]];   // la mineur, fa, do, sol
const RUBRIQUES = {
  travail: { timbre: 'cloche', pouls: 'sourd' },
  escalade: { timbre: 'bois', pouls: 'bois' },
  voyage: { timbre: 'pince', pouls: 'arpege' },
  enigme: { timbre: 'pince', pouls: 'pizz' },
  relations: { timbre: 'cloche', pouls: 'arpege-lent' },
};

function musique({ duree = 30, rubrique = 'travail', indicatif: cle = 'A' } = {}) {
  const { tampon, sinus, bruit, enveloppe, graine } = O();
  const b = tampon(duree), r = RUBRIQUES[rubrique] || RUBRIQUES.travail, motif = INDICATIFS[cle] || INDICATIFS.A;
  const jouer = TIMBRES[r.timbre];
  for (let m = 0; m * MESURE < duree; m += 1) {
    const t0 = m * MESURE, accord = ACCORDS[m % 4];
    // La nappe : l'accord tenu, très doux, une octave en dessous.
    accord.forEach((n, k) => sinus(b, () => note(n - 12), (x) => 0.07 * Math.min(1, x / 0.6) * Math.min(1, (MESURE - x) / 0.5) * (k ? 0.8 : 1), t0, 'sin', MESURE));
    sinus(b, () => note(accord[0] - 24), (x) => 0.09 * Math.min(1, x / 0.3) * Math.min(1, (MESURE - x) / 0.4), t0, 'sin', MESURE);
    // Le motif du compte revient toutes les quatre mesures, et son écho (à l'envers, plus bas) deux mesures après.
    if (m % 4 === 0) motif.notes.forEach((n, k) => jouer(b, note(n), t0 + motif.temps[k] * 1.6, 0.16, 1));
    if (m % 4 === 2) [...motif.notes].reverse().forEach((n, k) => jouer(b, note(n - 12), t0 + motif.temps[k] * 1.6, 0.1, 1));
    // Le pouls, propre à la rubrique.
    for (let d = 0; d < 8; d += 1) {
      const t = t0 + d * TEMPS / 2, n = accord[d % 3];
      if (r.pouls === 'sourd' && d % 4 === 0) sinus(b, (x) => 52 + 70 * Math.exp(-x * 26), (x) => 0.3 * enveloppe(x, 0.003, 0.16), t, 'sin', 0.5);
      if (r.pouls === 'sourd' && d % 2 === 1) bruit(b, (x) => 0.035 * enveloppe(x, 0.001, 0.02), { bas: 5000, haut: 11000, debut: t, hasard: graine(80 + d), duree: 0.08 });
      if (r.pouls === 'bois' && [0, 3, 4, 6].includes(d)) TIMBRES.bois(b, note(n + 12), t, 0.13, 0.6);
      if (r.pouls === 'bois' && d % 4 === 2) bruit(b, (x) => 0.08 * enveloppe(x, 0.001, 0.03), { bas: 900, haut: 4000, debut: t, hasard: graine(90 + d), duree: 0.1 });
      if (r.pouls === 'arpege') TIMBRES.pince(b, note(n + (d > 3 ? 12 : 0)), t, 0.09, 0.7);
      if (r.pouls === 'pizz' && [0, 3].includes(d)) TIMBRES.pince(b, note(n), t, 0.13, 0.35);
      if (r.pouls === 'arpege-lent' && d % 2 === 0) TIMBRES.pince(b, note(n), t, 0.08, 1);
    }
  }
  return reverbe(b, 0.28);
}

// --- Trois musiques vivantes (16 nov. : l'auteur trouve les musiques trop sages et en veut de « plus vivantes ») ---------------
// Batterie, basse et accords sur la même suite d'accords (la mineur, fa, do, sol). Tout se joue sur une grille de doubles croches.
const BATTERIE = {
  grosse(b, t, a) { const { sinus, enveloppe } = O(); sinus(b, (x) => 46 + 120 * Math.exp(-x * 32), (x) => a * enveloppe(x, 0.002, 0.17), t, 'sin', 0.5); },
  claire(b, t, a, g) { const { sinus, bruit, enveloppe, graine } = O(); bruit(b, (x) => a * enveloppe(x, 0.001, 0.085), { bas: 1300, haut: 7500, debut: t, hasard: graine(g), duree: 0.3 }); sinus(b, () => 196, (x) => a * 0.5 * enveloppe(x, 0.001, 0.05), t, 'sin', 0.2); },
  charley(b, t, a, g, ouvert) { const { bruit, enveloppe, graine } = O(); bruit(b, (x) => a * enveloppe(x, 0.0005, ouvert ? 0.09 : 0.022), { bas: 7000, haut: 13000, debut: t, hasard: graine(g), duree: ouvert ? 0.3 : 0.08 }); },
  mains(b, t, a, g) { const { bruit, enveloppe, graine } = O(); [0, 0.011, 0.024].forEach((d, k) => bruit(b, (x) => a * enveloppe(x, 0.0008, k === 2 ? 0.07 : 0.012), { bas: 900, haut: 5200, debut: t + d, hasard: graine(g + k), duree: 0.25 })); },
  maracas(b, t, a, g) { const { bruit, enveloppe, graine } = O(); bruit(b, (x) => a * enveloppe(x, 0.012, 0.03), { bas: 5000, haut: 11000, debut: t, hasard: graine(g), duree: 0.12 }); },
};
function basse(b, n, t, duree, a) { const { sinus } = O(); const f = note(n), env = (x) => a * Math.min(1, x / 0.006) * Math.exp(-x / (duree * 0.9)); sinus(b, () => f, env, t, 'sin', duree * 2); sinus(b, () => f * 2, (x) => env(x) * 0.45, t, 'sin', duree * 2); sinus(b, () => f * 3, (x) => env(x) * 0.2, t, 'sin', duree * 1.2); }
function clavier(b, notes, t, a, tenue = 0.13) { const { sinus, enveloppe } = O(); notes.forEach((n) => { const f = note(n); sinus(b, () => f, (x) => a * enveloppe(x, 0.003, tenue), t, 'sin', tenue * 5); sinus(b, () => f * 2, (x) => a * 0.35 * enveloppe(x, 0.002, tenue * 0.6), t, 'sin', tenue * 3); sinus(b, () => f * 4, (x) => a * 0.12 * enveloppe(x, 0.001, 0.03), t, 'sin', 0.2); }); }

const VIVES = {
  // Funk léger : basse qui rebondit, accords piqués à contretemps, caisse claire sur 2 et 4.
  funk: { nom: 'Funk léger', tempo: 108, jouer(b, m, t0, pas, accord, g) {
    [0, 3, 8, 10].forEach((k) => BATTERIE.grosse(b, t0 + k * pas, k === 3 ? 0.55 : 0.8));
    [4, 12].forEach((k) => BATTERIE.claire(b, t0 + k * pas, 0.5, g + k));
    for (let k = 0; k < 16; k += 1) BATTERIE.charley(b, t0 + k * pas, k % 4 === 2 ? 0.2 : 0.1, g + 20 + k, k === 14);
    [[0, 0, 1.6], [3, 0, 1], [6, 12, 1], [8, 0, 1.6], [11, 7, 1], [14, 12, 1.2]].forEach(([k, i, d]) => basse(b, accord[0] - 24 + i, t0 + k * pas, d * pas, 0.5));
    [2, 6, 10, 15].forEach((k) => clavier(b, accord.map((n) => n + 12), t0 + k * pas, 0.13, 0.07));
    if (m % 2 === 1) [[9, 12], [11, 15], [13, 12]].forEach(([k, i]) => TIMBRES.bois(b, note(accord[0] + 12 + i), t0 + k * pas, 0.12, 0.5));
  } },
  // Électro pop : grosse caisse sur chaque temps, basse à contretemps, arpège rapide.
  electro: { nom: 'Électro pop', tempo: 122, jouer(b, m, t0, pas, accord, g) {
    [0, 4, 8, 12].forEach((k) => BATTERIE.grosse(b, t0 + k * pas, 0.85));
    [4, 12].forEach((k) => BATTERIE.mains(b, t0 + k * pas, 0.4, g + k));
    [2, 6, 10, 14].forEach((k) => { BATTERIE.charley(b, t0 + k * pas, 0.2, g + 30 + k, true); basse(b, accord[0] - 24, t0 + k * pas, 1.5 * pas, 0.5); });
    const suite = [0, 1, 2, 1, 0, 2, 1, 2];
    for (let k = 0; k < 16; k += 1) TIMBRES.pince(b, note(accord[suite[k % 8]] + (k % 8 > 3 ? 24 : 12)), t0 + k * pas, 0.085, 0.35);
    const { sinus } = O(); accord.forEach((n) => sinus(b, () => note(n), (x) => 0.035 * Math.min(1, x / 0.2) * Math.min(1, (16 * pas - x) / 0.2), t0, 'sin', 16 * pas));
  } },
  // Acoustique entraînante : cordes grattées, maracas, mains qui claquent, une petite mélodie de bois.
  acoustique: { nom: 'Acoustique entraînante', tempo: 100, jouer(b, m, t0, pas, accord, g) {
    [0, 8, 10].forEach((k) => BATTERIE.grosse(b, t0 + k * pas, k === 10 ? 0.4 : 0.6));
    [4, 12].forEach((k) => BATTERIE.mains(b, t0 + k * pas, 0.45, g + k));
    for (let k = 0; k < 16; k += 2) BATTERIE.maracas(b, t0 + k * pas, k % 4 ? 0.16 : 0.09, g + 40 + k);
    [0, 3, 6, 8, 11, 14].forEach((k, i) => [accord[0] - 12, ...accord, accord[0] + 12].forEach((n, c) => TIMBRES.pince(b, note(n), t0 + k * pas + (i % 2 ? 4 - c : c) * 0.012, 0.075, 0.6)));
    const gamme = [0, 3, 5, 7, 10, 12], air = [[0, 3], [3, 4], [6, 5], [8, 4], [11, 2], [14, 3]];
    air.forEach(([k, i]) => TIMBRES.bois(b, note(69 + gamme[(i + m) % 6] + (m % 2 ? 0 : 12) - 12), t0 + k * pas, 0.13, 0.6));
    basse(b, accord[0] - 24, t0, 6 * pas, 0.35); basse(b, accord[0] - 24, t0 + 8 * pas, 6 * pas, 0.35);
  } },
};
function vive(style = 'funk', { duree = 30 } = {}) {
  const { tampon } = O();
  const v = VIVES[style] || VIVES.funk, pas = 60 / v.tempo / 4, b = tampon(duree);
  for (let m = 0; m * 16 * pas < duree; m += 1) v.jouer(b, m, m * 16 * pas, pas, ACCORDS[m % 4], 200 + m * 50);
  return reverbe(b, 0.14);
}

// --- Les bruitages calés sur l'image --------------------------------------------------
const BRUITAGES = {
  'indicatif.wav': (cle) => indicatif(cle),
  'indicatif-court.wav': (cle) => indicatif(cle, { court: true }),
  // Un petit « pop » : une illustration qui surgit.
  'pop.wav': () => {
    const { tampon, sinus, enveloppe } = O();
    const b = tampon(0.4);
    sinus(b, (x) => 420 + 520 * Math.exp(-x * 40), (x) => 0.6 * enveloppe(x, 0.002, 0.05), 0, 'sin', 0.3);
    return reverbe(b, 0.15);
  },
  // Le rideau qui s'ouvre : un long frottement de tissu.
  'rideau.wav': () => {
    const { tampon, bruit, graine } = O();
    const b = tampon(1.6);
    bruit(b, (x) => 0.45 * Math.sin(Math.PI * Math.min(1, x / 1.3)) ** 1.5, { bas: 400, haut: (x) => 1200 + 2600 * Math.sin(Math.PI * Math.min(1, x / 1.3)), hasard: graine(101), duree: 1.3 });
    return reverbe(b, 0.3);
  },
  // La craie : deux petits claquements de mains poudrées.
  'craie.wav': () => {
    const { tampon, bruit, enveloppe, graine } = O();
    const b = tampon(0.9);
    [0, 0.19].forEach((t, k) => bruit(b, (x) => 0.5 * enveloppe(x, 0.001, 0.045), { bas: 700, haut: 5200, debut: t, hasard: graine(110 + k), duree: 0.25 }));
    return reverbe(b, 0.22);
  },
  // Le clavier : vingt secondes de frappe irrégulière (rythme tiré d'une suite fixe), à jouer en boucle sous un plan.
  'clavier.wav': () => {
    const { tampon, bruit, enveloppe, graine } = O();
    const D = 20, b = tampon(D), h = graine(120);
    for (let t = 0.2; t < D - 0.2; t += 0.09 + h() * 0.2 + (h() > 0.85 ? 0.5 : 0)) {
      bruit(b, (x) => (0.16 + h() * 0.12) * enveloppe(x, 0.0006, 0.012), { bas: 1800 + h() * 900, haut: 6500, debut: t, hasard: graine(Math.floor(t * 1000)), duree: 0.05 });
    }
    return reverbe(b, 0.12);
  },
  // Des pas dans l'eau : vingt secondes de clapotis réguliers, à jouer en boucle.
  'pas-eau.wav': () => {
    const { tampon, bruit, enveloppe, graine } = O();
    const D = 20, b = tampon(D);
    for (let t = 0.3, k = 0; t < D - 0.4; t += 0.63, k += 1) {
      bruit(b, (x) => 0.3 * enveloppe(x, 0.01, 0.1), { bas: 250, haut: (x) => 900 + 2600 * Math.exp(-x * 14), debut: t, hasard: graine(130 + k), duree: 0.4 });
    }
    return reverbe(b, 0.25);
  },
};

if (require.main === module) {
  const { normaliser, ecrireWav } = O();
  const dossier = process.argv[2] || '.';
  Object.keys(INDICATIFS).forEach((c) => ecrireWav(path.join(dossier, `indicatif-${c}.wav`), normaliser(indicatif(c), 0.8), true));
  Object.keys(RUBRIQUES).forEach((r) => ecrireWav(path.join(dossier, `musique-${r}.wav`), normaliser(musique({ duree: 12, rubrique: r }), 0.8), true));
  Object.keys(VIVES).forEach((v) => ecrireWav(path.join(dossier, `vive-${v}.wav`), normaliser(vive(v, { duree: 13 }), 0.8), true));
  Object.keys(BRUITAGES).forEach((f) => ecrireWav(path.join(dossier, f), normaliser(BRUITAGES[f]('A'), 0.8), true));
  console.log(`Sons écrits dans ${dossier}`);
}

module.exports = { INDICATIFS, RUBRIQUES, VIVES, indicatif, musique, vive, BRUITAGES, TEMPO };
