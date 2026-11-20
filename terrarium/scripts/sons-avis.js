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
// --- L'électro house, portée par la basse (16 nov. : « Juste la basse, essaye de faire une instru electro house ») --------------
// Une note de basse de house : une onde riche (dent de scie et carré) dans un filtre passe-bas résonant qui s'ouvre puis se
// referme à chaque note (le « wah »), plus un sinus à la même hauteur pour le poids. ouverture (0 à 1) : filtre plus ou moins ouvert.
// Les notes restent au-dessus de 60 Hz : en dessous, un téléphone ne les rend pas.
// fixe : une coupure constante en hertz (pas de « wah » : le son de la basse ne bouge pas).
function basseHouse(b, n, t, duree, a, ouverture = 1, fixe = 0) {
  const { FREQ } = O();
  const f = note(n), debut = Math.round(t * FREQ), fin = Math.min(b.length, Math.round((t + duree + 0.06) * FREQ));
  let phase = 0, bas = 0, bande = 0;
  for (let i = debut; i < fin; i += 1) {
    const x = (i - debut) / FREQ;
    phase += f / FREQ;
    // Une seconde dent de scie à l'octave : c'est elle qu'on entend sur un téléphone, qui ne rend presque rien sous 200 Hz.
    const onde = 0.5 * (2 * (phase % 1) - 1) + 0.3 * (phase % 1 < 0.5 ? 1 : -1) + 0.34 * (2 * ((2 * phase) % 1) - 1);
    // Filtre à variable d'état : la coupure descend d'environ 2 400 Hz à 550 Hz en un dixième de seconde.
    const coupure = fixe || (480 + 1900 * ouverture * Math.exp(-x / 0.11)) * (0.3 + 0.7 * ouverture) + 90;
    const k = 2 * Math.sin((Math.PI * Math.min(coupure, 6000)) / FREQ);
    bas += k * bande; bande += k * (onde - bas - 0.42 * bande);
    const env = Math.min(1, x / 0.004) * (x < duree ? 1 : Math.exp(-(x - duree) / 0.02));
    b[i] += a * env * (1.05 * bas + 0.4 * Math.sin(2 * Math.PI * f * x));
  }
}
// La grosse caisse de house : plus sèche et plus forte, avec un petit claquement à l'attaque.
function caisseHouse(b, t, a, g) {
  const { sinus, bruit, enveloppe, graine } = O();
  sinus(b, (x) => 48 + 170 * Math.exp(-x * 40), (x) => a * enveloppe(x, 0.0015, 0.19), t, 'sin', 0.6);
  bruit(b, (x) => a * 0.3 * enveloppe(x, 0.0003, 0.004), { bas: 2000, haut: 9000, debut: t, hasard: graine(g), duree: 0.02 });
}
const sinusDoux = (b, f, ampli, t, duree) => O().sinus(b, () => f, ampli, t, 'sin', duree);
// La ligne de basse : [double croche dans la mesure, intervalle au-dessus de la fondamentale, durée en doubles croches].
const LIGNE_HOUSE = [[2, 0, 1.5], [5, 0, 0.7], [6, 0, 1.5], [10, 12, 1.5], [13, 7, 0.7], [14, 0, 1.5]];
// La ligne « plate » : la même note sur les quatre contretemps, sans saut d'octave ni note de passage.
const LIGNE_PLATE = [[2, 0, 1.5], [6, 0, 1.5], [10, 0, 1.5], [14, 0, 1.5]];

// house({ duree, plein, nue, pistes }) : plein = l'instant où tout entre (avant : la basse filtrée seule, puis une montée).
// nue : seulement la basse, la grosse caisse et le charley. pistes : renvoie { basse, reste } au lieu du mélange (pour les tests).
// plate : une boucle régulière, sans effets (demande de l'auteur : « fais plus plat », « régulier, sans effets ») : tout joue dès
// la première seconde et ne change plus ; ni entrée étouffée, ni montée, ni pompe, ni « wah » ; plein est alors ignoré.
// Sa basse est ronde (des sinus), pas en dent de scie.
function house({ duree = 30, plein = 3.87, nue = false, plate = false, pistes = false } = {}) {
  if (plate) { plein = 0; nue = true; }
  const { tampon, bruit, enveloppe, graine, FREQ } = O();
  const TEMPO_H = 124, temps = 60 / TEMPO_H, pas = temps / 4, mesure = 16 * pas;
  const bz = tampon(duree), bat = tampon(duree), pompe = tampon(duree);
  // Le plein tombe sur un début de mesure : on décale la grille pour que la mesure commence à l'instant demandé.
  const decal = ((plein % mesure) + mesure) % mesure - mesure;
  for (let m = 0; decal + m * mesure < duree; m += 1) {
    const t0 = decal + m * mesure, accord = ACCORDS[((m % 4) + 4) % 4], g = 400 + m * 40;
    for (let k = 0; k < 16; k += 1) {
      const t = t0 + k * pas; if (t < 0 || t >= duree - 0.05) continue;
      const lance = t >= plein - 1e-6, monte = !lance && t >= plein - 2 * mesure;
      const ouverture = lance ? 1 : Math.max(0.16, 0.16 + 0.7 * Math.max(0, 1 - (plein - t) / (2 * mesure)) ** 2);
      if (plate) {
        // « Juste le fond, pas le klaxon » (16 nov.) : la basse en dent de scie sonnait comme un klaxon. Ici, une basse ronde :
        // des sinus seulement (la note, son octave et sa quinte au-dessus pour rester audible sur un téléphone), attaque douce.
        LIGNE_PLATE.filter(([d]) => d === k).forEach(([, , d]) => {
          const f = note(accord[0] - 12), env = (x) => 0.42 * Math.min(1, x / 0.012) * Math.min(1, Math.max(0, (d * pas + 0.05 - x) / 0.05));
          sinusDoux(bz, f, env, t, d * pas + 0.05); sinusDoux(bz, f * 2, (x) => env(x) * 0.38, t, d * pas + 0.05); sinusDoux(bz, f * 3, (x) => env(x) * 0.12, t, d * pas + 0.05);
        });
      } else LIGNE_HOUSE.filter(([d]) => d === k).forEach(([, i, d]) => basseHouse(bz, accord[0] - 12 + i, t, d * pas, 0.5, ouverture));
      if (lance) {
        if (k % 4 === 0) { caisseHouse(bat, t, 0.95, g + k); pompe[Math.round(t * FREQ)] = 1; }
        if (k % 4 === 2) BATTERIE.charley(bat, t, 0.22, g + 60 + k, true);
        if (!nue && (k === 4 || k === 12)) BATTERIE.mains(bat, t, 0.42, g + k);
        if (!nue && k % 2 === 1) BATTERIE.charley(bat, t, 0.07, g + 80 + k, false);
        if (!nue && k === 7) clavier(bz, accord.map((n) => n + 12), t, 0.1, 0.09);
      } else if (monte) {
        // La montée : la caisse claire se resserre (croches, puis doubles croches sur la dernière mesure).
        if (t >= plein - mesure ? true : k % 2 === 0) BATTERIE.claire(bat, t, 0.12 + 0.3 * (1 - (plein - t) / (2 * mesure)), g + k);
      } else if (k % 4 === 2) BATTERIE.charley(bat, t, 0.1, g + 60 + k, false);
    }
  }
  // Le souffle qui monte avant le plein, et une cymbale à l'instant où tout entre.
  const dm = Math.min(plein, 2 * mesure);
  // (x peut être très légèrement négatif au premier échantillon : sans le max, la puissance donnerait un nombre invalide.)
  if (dm > 0.5 && !plate) bruit(bat, (x) => 0.2 * (Math.max(0, x) / dm) ** 2.2, { bas: 600, haut: (x) => 1500 + 9000 * (Math.max(0, x) / dm) ** 2, debut: plein - dm, hasard: graine(399), duree: dm });
  if (plein < duree - 0.5 && !plate) bruit(bat, (x) => 0.3 * enveloppe(x, 0.002, 0.5), { bas: 5000, haut: 12000, debut: Math.max(0, plein), hasard: graine(398), duree: 1.6 });
  // La pompe : la basse s'écrase sur chaque coup de grosse caisse et remonte en un quart de seconde.
  let depuis = 1;
  if (!plate) for (let i = 0; i < bz.length; i += 1) { if (pompe[i]) depuis = 0; bz[i] *= 0.22 + 0.78 * Math.min(1, depuis / 0.24) ** 1.6; depuis += 1 / FREQ; }
  reverbe(bat, 0.1);
  if (pistes) return { basse: bz, reste: bat };
  for (let i = 0; i < bz.length; i += 1) bz[i] += bat[i];
  return bz;
}
VIVES.house = { nom: 'Électro house', tempo: 124, fabrique: (o) => house(o) };
VIVES['house-plate'] = { nom: 'Électro house plate (régulière, sans effets)', tempo: 124, fabrique: (o) => house(Object.assign({}, o, { plate: true })) };
VIVES['house-nue'] = { nom: 'Électro house, basse et grosse caisse seules', tempo: 124, fabrique: (o) => house(Object.assign({}, o, { nue: true })) };

// --- « Rêverie » : l'ambiance du jeu de mots fléchés (18 nov. 2026, demandée « dans l'esprit de Call it what you like »). ------------
// Une musique originale, onirique et mi-lente : des nappes chaudes sur quatre accords (fa maj7, la m7, ré m7, do maj7), un arpège de cloches
// doux, une basse ronde et rare, un pouls feutré (grosse caisse sourde, petit claquement). Aucune mélodie ni suite d'accords du morceau cité.
function reverie({ duree = 30, tempo = 108, paliers } = {}) {
  const { tampon, sinus, bruit, enveloppe, graine } = O();
  const temps = 60 / tempo, mesure = 4 * temps, b = tampon(duree);
  const SUITE = [[53, 57, 60, 64], [57, 60, 64, 67], [50, 53, 57, 60], [48, 52, 55, 59]];
  const ARPEGE = [0, 1, 2, 3, 2, 1, 2, 3];
  // Dynamique dès la première seconde (pouls, charleston, basse), puis la musique « s'excite » : niveau 1 à paliers[0] (arpège en doubles croches, claquements), niveau 2 à paliers[1] (basse en croches, cloches doublées, chocs de cymbale).
  const niveau = (t) => (!paliers ? 1 : t >= paliers[1] - 0.1 ? 2 : t >= paliers[0] - 0.1 ? 1 : 0);
  for (let m = 0; m * mesure < duree; m += 1) {
    const t0 = m * mesure, accord = SUITE[m % 4], L = niveau(t0);
    accord.forEach((n) => [1, 1.0035].forEach((d) => sinus(b, () => note(n + 12) * d, (x) => (0.026 + L * 0.004) * Math.min(1, x / 0.15) * Math.min(1, (mesure + 0.6 - x) / 1.1), t0 - 0.02, 'sin', mesure + 0.6)));
    basse(b, accord[0] - 24, t0, 3.2 * temps, 0.3); basse(b, accord[0] - 24, t0 + 2.5 * temps, 1.4 * temps, 0.2);
    for (let k = 0; k < 4; k += 1) BATTERIE.grosse(b, t0 + k * temps, 0.4);
    [1, 3].forEach((k) => BATTERIE.mains(b, t0 + k * temps, L ? 0.2 : 0.15, 600 + m * 7 + k));
    for (let k = 0; k < 8; k += 1) { BATTERIE.charley(b, t0 + k * temps / 2 + temps / 4, 0.045 + (L >= 1 ? 0.02 : 0), 900 + m * 9 + k, false); basse(b, accord[0] - 12, t0 + k * temps / 2, temps * 0.4, L === 2 ? 0.14 : 0.08); }
    ARPEGE.forEach((i, k) => TIMBRES.cloche(b, note(accord[i] + 24 + (L >= 2 && k % 2 ? 12 : 0)), t0 + k * temps / 2, 0.034 + (k % 2 ? 0 : 0.012), 0.9));
    if (L >= 1) for (let k = 0; k < 16; k += 1) TIMBRES.cloche(b, note(accord[(k * 3) % 4] + 36), t0 + k * temps / 4, 0.012, 0.4);
    if (L >= 2) { for (let k = 0; k < 16; k += 1) BATTERIE.charley(b, t0 + k * temps / 4, 0.03, 1500 + m * 16 + k, false); if (m % 2 === 0) bruit(b, (x) => 0.06 * enveloppe(x, 0.002, 1.0), { bas: 3500, haut: 13000, debut: t0, hasard: graine(400 + m), duree: 1.5 }); }
    bruit(b, (x) => 0.012 * Math.sin(Math.PI * Math.min(1, x / mesure)) * (1 + L), { bas: 5000, haut: 12000, debut: t0, hasard: graine(700 + m), duree: mesure });
  }
  // Une montée (souffle qui grossit) juste avant chaque palier.
  (paliers || []).forEach((p, j) => bruit(b, (x) => 0.06 * (x / 1.2) * (x / 1.2), { bas: 1500, haut: 11000, debut: Math.max(0, p - 1.2), hasard: graine(800 + j), duree: 1.2 }));
  return reverbe(b, 0.3);
}
VIVES.reverie = { nom: 'Rêverie (onirique et dynamique, pour le jeu de mots fléchés)', tempo: 108, fabrique: (o) => reverie(o) };


// --- Trois autres ambiances pour le jeu (20 nov. 2026), toutes à trois niveaux comme « Rêverie » : paliers[0] = le mot du milieu, paliers[1] = le dernier. ---
const niveauDe = (paliers) => (t) => (!paliers ? 1 : t >= paliers[1] - 0.1 ? 2 : t >= paliers[0] - 0.1 ? 1 : 0);
const montee = (b, paliers, bruit, graine, ampli = 0.06) => (paliers || []).forEach((p, j) => bruit(b, (x) => ampli * (x / 1.2) * (x / 1.2), { bas: 1500, haut: 11000, debut: Math.max(0, p - 1.2), hasard: graine(800 + j), duree: 1.2 }));
const choc = (b, t, a, bruit, enveloppe, graine, g) => bruit(b, (x) => a * enveloppe(x, 0.002, 1.1), { bas: 3500, haut: 13000, debut: t, hasard: graine(g), duree: 1.6 });

// Arcade : une ambiance de jeu vidéo, ondes carrées, arpèges et basse qui pulse ; le rythme s'installe puis s'emballe.
function arcade({ duree = 30, tempo = 128, paliers } = {}) {
  const { tampon, sinus, bruit, enveloppe, graine } = O();
  const pas = 60 / tempo / 4, mes = 16 * pas, b = tampon(duree), niv = niveauDe(paliers);
  const ACC = [[57, 60, 64], [53, 57, 60], [60, 64, 67], [55, 59, 62]], BAS = [33, 29, 36, 31];
  const carre = (n, t, dur, a) => sinus(b, () => note(n), (x) => a * Math.min(1, x / 0.004) * Math.max(0, 1 - x / dur), t, 'carre', dur);
  for (let m = 0; m * mes < duree; m += 1) {
    const t0 = m * mes, acc = ACC[m % 4], L = niv(t0);
    for (let k = 0; k < 16; k += 1) {
      const t = t0 + k * pas, idx = [0, 1, 2, 1][k % 4];
      carre(acc[idx] + 24, t, pas * 1.6, 0.04);
      if (L <= 1 ? [0, 3, 6, 8, 11, 14].includes(k) : k % 2 === 0) carre(BAS[m % 4] + (L === 2 && k % 4 === 2 ? 12 : 0), t, pas * 1.7, 0.09);
      if (k % 4 === 0) BATTERIE.grosse(b, t, 0.55);
      if (k === 4 || k === 12) BATTERIE.claire(b, t, 0.3, 300 + m + k);
      if (L === 2 ? true : k % 2 === 0) BATTERIE.charley(b, t + pas / 2, L === 2 ? 0.05 : 0.06, 500 + m * 16 + k, false);
      if (L >= 1 && k % 4 === 0) carre(acc[[2, 1, 2, 0][(k >> 2) % 4]] + 36, t, pas * 3, 0.03);
      if (L === 2) {
        if (k % 4 === 3) carre(acc[[2, 1, 2, 0][(k >> 2) % 4]] + 36, t, pas * 3, 0.036);
        if (m % 4 === 3 && k >= 12) BATTERIE.claire(b, t, 0.22, 900 + k);
      }
    }
    if (L === 2 && m % 4 === 0) choc(b, t0, 0.05, bruit, enveloppe, graine, 400 + m);
  }
  montee(b, paliers, bruit, graine, 0.08);
  return reverbe(b, 0.1);
}
VIVES.arcade = { nom: 'Arcade (jeu vidéo, ondes carrées, s\'emballe)', tempo: 128, fabrique: (o) => arcade(o) };

// Lo-fi : accords chauds de piano électrique, batterie traînante, craquements de vinyle ; de plus en plus fourni.
function lofi({ duree = 30, tempo = 84, paliers } = {}) {
  const { tampon, sinus, bruit, enveloppe, graine } = O();
  const pas = 60 / tempo / 4, mes = 16 * pas, b = tampon(duree), niv = niveauDe(paliers);
  const ACC = [[50, 53, 57, 60], [43, 47, 50, 53], [48, 52, 55, 59], [45, 48, 52, 55]];
  const rhodes = (n, t, a, tenue) => { const f = note(n); sinus(b, () => f, (x) => a * enveloppe(x, 0.008, tenue), t, 'sin', tenue * 3); sinus(b, () => f * 2, (x) => a * 0.3 * enveloppe(x, 0.004, tenue * 0.4), t, 'sin', tenue); sinus(b, () => f * 7, (x) => a * 0.05 * enveloppe(x, 0.001, 0.06), t, 'sin', 0.2); };
  for (let m = 0; m * mes < duree; m += 1) {
    const t0 = m * mes, acc = ACC[m % 4], L = niv(t0), sw = (k) => (k % 2 ? pas * 0.28 : 0);
    (L <= 1 ? [0, 6, 10] : [0, 3, 6, 10, 14]).forEach((k) => acc.forEach((n, i) => rhodes(n + 12, t0 + k * pas + i * 0.012, 0.03, 0.55 + (k === 0 ? 0.5 : 0))));
    [0, 6, 10].forEach((k) => sinus(b, () => note(acc[0] - 12), (x) => 0.2 * enveloppe(x, 0.006, 0.4), t0 + k * pas, 'sin', 1.2));
    if (L === 2) [3, 8, 12, 15].forEach((k) => sinus(b, () => note(acc[(k >> 2) % 4] + 12), (x) => 0.1 * enveloppe(x, 0.004, 0.25), t0 + k * pas, 'sin', 0.8));
    for (let k = 0; k < 16; k += 1) {
      const t = t0 + k * pas;
      if ([0, 7, 10].includes(k)) BATTERIE.grosse(b, t, 0.4);
      if (k === 4 || k === 12) BATTERIE.claire(b, t + 0.012, 0.24, 300 + m + k);
      if (k % 2 === 0) BATTERIE.charley(b, t + sw(k), 0.05, 500 + m * 16 + k, false);
      if (L === 2 && k % 2 === 1) BATTERIE.charley(b, t + sw(k), 0.035, 700 + m * 16 + k, k === 15);
      if (L === 2 && (k === 7 || k === 14)) BATTERIE.claire(b, t, 0.1, 100 + k);
    }
    bruit(b, (x) => 0.008 * (1 + L * 0.5) * Math.sin(Math.PI * Math.min(1, x / mes)), { bas: 3000, haut: 9000, debut: t0, hasard: graine(1200 + m), duree: mes });
  }
  montee(b, paliers, bruit, graine, 0.04);
  return reverbe(b, 0.22);
}
VIVES.lofi = { nom: 'Lo-fi chaleureux (piano électrique, vinyle, de plus en plus fourni)', tempo: 84, fabrique: (o) => lofi(o) };

// Épique : une montée cinématographique : nappes sombres, puis tambours et pizzicati, puis cordes qui galopent et chocs de cymbales.
function epique({ duree = 30, tempo = 100, paliers } = {}) {
  const { tampon, sinus, bruit, enveloppe, graine } = O();
  const pas = 60 / tempo / 4, mes = 16 * pas, b = tampon(duree), niv = niveauDe(paliers);
  const ACC = [[50, 53, 57], [46, 50, 53], [53, 57, 60], [48, 52, 55]], RAC = [38, 34, 41, 36];
  for (let m = 0; m * mes < duree; m += 1) {
    const t0 = m * mes, acc = ACC[m % 4], L = niv(t0);
    acc.forEach((n) => [1, 1.004].forEach((d) => sinus(b, () => note(n) * d, (x) => (0.018 + L * 0.006) * Math.min(1, x / 0.8) * Math.min(1, (mes + 0.5 - x) / 0.9), t0 - 0.05, 'scie', mes + 0.5)));
    sinus(b, () => note(RAC[m % 4]), (x) => 0.18 * Math.min(1, x / 0.3) * Math.min(1, (mes - x) / 0.5 + 0.2), t0, 'sin', mes);
    if (L === 0) TIMBRES.cloche(b, note(acc[2] + 24), t0 + 8 * pas, 0.03, 1.2);
    for (let k = 0; k < 16; k += 1) {
      const t = t0 + k * pas;
      { if (k % 4 === 0) BATTERIE.grosse(b, t, [0.4, 0.5, 0.7][L]); if (k % 2 === 0) TIMBRES.pince(b, note(acc[(k >> 1) % 3] + 24), t, 0.03, 0.8); if (L === 0 && k === 12) BATTERIE.claire(b, t, 0.25, 300 + m); }
      if (L === 2) {
        TIMBRES.pince(b, note(acc[k % 3] + 12), t, 0.02, 0.5);
        sinus(b, () => note(acc[(k >> 1) % 3] + 12), (x) => 0.02 * Math.min(1, x / 0.02) * Math.max(0, 1 - x / (pas * 1.6)), t, 'scie', pas * 1.6);
        if (k === 4 || k === 12) BATTERIE.claire(b, t, 0.4, 300 + m + k);
        if (k % 2 === 0) BATTERIE.charley(b, t, 0.05, 500 + m * 16 + k, false);
        if (m % 4 === 3 && k >= 12) BATTERIE.grosse(b, t + pas / 2, 0.55);
      }
    }
    if (L === 2 && m % 2 === 0) choc(b, t0, 0.07, bruit, enveloppe, graine, 400 + m);
  }
  montee(b, paliers, bruit, graine, 0.1);
  return reverbe(b, 0.3);
}
VIVES.epique = { nom: 'Épique (cinématographique, tambours et cordes)', tempo: 100, fabrique: (o) => epique(o) };

function vive(style = 'funk', { duree = 30, plein, tempo, paliers } = {}) {
  const { tampon } = O();
  if (VIVES[style] && VIVES[style].fabrique) return VIVES[style].fabrique(Object.assign({ duree }, plein == null ? {} : { plein }, tempo == null ? {} : { tempo }, paliers ? { paliers } : {}));
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
  // Les bruitages du jeu de mots fléchés : un « tac » de papier posé (la hauteur monte avec le rang de la lettre), le mot trouvé, le tic du minuteur.
  ...Object.fromEntries([1, 2, 3, 4, 5, 6, 7, 8].map((r) => [`lettre-${r}.wav`, () => {
    const { tampon, sinus, bruit, enveloppe, graine } = O();
    const b = tampon(0.4), f = note(66 + 2 * r);
    sinus(b, () => f, (x) => 0.5 * enveloppe(x, 0.002, 0.07), 0, 'sin', 0.3);
    sinus(b, () => f * 2.01, (x) => 0.16 * enveloppe(x, 0.001, 0.035), 0, 'sin', 0.2);
    bruit(b, (x) => 0.55 * enveloppe(x, 0.0005, 0.012), { bas: 900, haut: 4800, debut: 0, hasard: graine(150 + r), duree: 0.06 });
    return reverbe(b, 0.12);
  }])),
  // Un nouvel indice arrive (jeu muet) : deux notes douces qui montent.
  'indice.wav': () => {
    const { tampon } = O();
    const b = tampon(0.9);
    [76, 83].forEach((n, i) => TIMBRES.cloche(b, note(n), i * 0.11, 0.3, 0.6));
    return reverbe(b, 0.2);
  },
  'trouve.wav': () => {
    const { tampon } = O();
    const b = tampon(1.6);
    [72, 76, 79, 84].forEach((n, i) => TIMBRES.cloche(b, note(n), i * 0.06, 0.32, 0.8));
    return reverbe(b, 0.28);
  },
  'tic-jeu.wav': () => {
    const { tampon, sinus, bruit, enveloppe, graine } = O();
    const b = tampon(0.25);
    sinus(b, () => 1800, (x) => 0.5 * enveloppe(x, 0.001, 0.02), 0, 'sin', 0.12);
    bruit(b, (x) => 0.35 * enveloppe(x, 0.0004, 0.008), { bas: 2500, haut: 9000, debut: 0, hasard: graine(170), duree: 0.04 });
    return b;
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
  Object.keys(VIVES).forEach((v) => ecrireWav(path.join(dossier, `vive-${v}.wav`), normaliser(vive(v, { duree: VIVES[v].fabrique ? 20 : 13 }), 0.8), true));
  Object.keys(BRUITAGES).forEach((f) => ecrireWav(path.join(dossier, f), normaliser(BRUITAGES[f]('A'), 0.8), true));
  console.log(`Sons écrits dans ${dossier}`);
}

module.exports = { INDICATIFS, RUBRIQUES, VIVES, indicatif, musique, vive, house, BRUITAGES, TEMPO };
