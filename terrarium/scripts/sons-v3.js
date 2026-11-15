// Sons de la V3 (« éditorial scientifique ») : trois ambiances sobres et quatre bruitages.
// Tout est synthétisé et déterministe (hasard à graine fixe), comme build-sons.js.
// Usage : node scripts/sons-v3.js <dossier>  → écrit les sons de test dans ce dossier.
const path = require('node:path');

const O = () => require('./build-sons.js').outils; // chargé à l'appel (dépendance circulaire)

// Réverbération de Schroeder : quatre filtres en peigne amortis, puis deux passe-tout.
function reverbe(buf, melange = 0.3, longueur = 0.84) {
  const sortie = new Float32Array(buf.length);
  [1557, 1617, 1491, 1422].forEach((d) => {
    const ligne = new Float32Array(d); let k = 0; let filtre = 0;
    for (let i = 0; i < buf.length; i += 1) {
      const y = ligne[k];
      filtre = y * 0.6 + filtre * 0.4;
      ligne[k] = buf[i] + filtre * longueur;
      sortie[i] += y / 4;
      k = (k + 1) % d;
    }
  });
  [225, 556].forEach((d) => {
    const ligne = new Float32Array(d); let k = 0;
    for (let i = 0; i < buf.length; i += 1) {
      const z = ligne[k]; const x = sortie[i];
      const y = -0.5 * x + z;
      ligne[k] = x + 0.5 * y;
      sortie[i] = y;
      k = (k + 1) % d;
    }
  });
  for (let i = 0; i < buf.length; i += 1) buf[i] = buf[i] * (1 - melange) + sortie[i] * melange * 2.2;
  return buf;
}

// Passe-bas d'ordre 1, en place.
function passeBas(buf, frequence) {
  const { FREQ } = O();
  const k = 1 - Math.exp((-2 * Math.PI * frequence) / FREQ); let y = 0;
  for (let i = 0; i < buf.length; i += 1) { y += k * (buf[i] - y); buf[i] = y; }
  return buf;
}

// Accords (notes MIDI) : la mineur 9, fa majeur 7, do majeur 7 (sur mi), mi mineur 7.
const ACCORDS = [[57, 60, 64, 67, 71], [53, 57, 60, 64, 69], [52, 55, 59, 60, 64], [52, 55, 59, 62, 67]];

// Nappe : chaque note est faite de deux sinus désaccordés, avec une attaque lente.
function nappe(buf, accord, debut, duree, volume, { attaque = 0.8, souffle = null } = {}) {
  const { sinus, note } = O();
  accord.forEach((n, j) => {
    [-0.12, 0.12].forEach((d) => {
      const f = note(n + d);
      sinus(buf, () => f, (x) => {
        const env = Math.min(1, x / attaque) * Math.min(1, Math.max(0, (duree - x) / 0.6));
        return (volume / accord.length) * env * (souffle ? souffle(debut + x) : 1) * (j === 0 ? 1.2 : 1);
      }, debut, 'sin', duree + 0.05);
    });
  });
}

// Coupures : un temps de silence (fondu de 6 ms de chaque côté).
function couper(buf, coupures, temps) {
  const { FREQ } = O();
  coupures.forEach((t) => {
    const i0 = Math.round(t * FREQ); const i1 = Math.round((t + temps) * FREQ); const f = Math.round(0.006 * FREQ);
    for (let i = Math.max(0, i0 - f); i < Math.min(buf.length, i1 + f); i += 1) {
      buf[i] *= i < i0 ? (i0 - i) / f : i >= i1 ? (i - i1) / f : 0;
    }
  });
}

// Montée : un bruit dont le filtre s'ouvre sur une mesure, pour annoncer le « plein ».
function monteeBruit(buf, debut, duree, volume, graineN) {
  const { bruit, graine } = O();
  bruit(buf, (x) => volume * (x / duree) ** 2, { bas: 400, haut: (x) => 800 + 9000 * (x / duree) ** 2, debut, duree, hasard: graine(graineN) });
}

// Squelette commun : parcourt les mesures et appelle « mesure » avec la partie demandée.
function composer(bpm, arrangement, mesure, { melange = 0.3 } = {}) {
  const { tampon } = O();
  const DUREE = arrangement.duree || 45;
  const TEMPS = 60 / bpm; const MESURE = 4 * TEMPS;
  const b = tampon(DUREE);
  const parties = arrangement.parties || [];
  for (let m = 0; m * MESURE < DUREE; m += 1) mesure(b, m, m * MESURE, parties[m] || 'plein', TEMPS);
  reverbe(b, melange);
  couper(b, arrangement.coupures || [], arrangement.coupure || TEMPS);
  return b;
}

// A. « Labo » (90 BPM) : nappe froide, pulsation sourde sur 1 et 3, tic de pendule sur chaque temps.
function labo(arrangement = {}) {
  const { sinus, bruit, enveloppe, graine, note } = O();
  return composer(90, arrangement, (b, m, t0, partie, T) => {
    const accord = ACCORDS[m % 4];
    nappe(b, accord, t0, 4 * T, partie === 'intro' ? 0.22 : 0.3, { attaque: 1.2 });
    sinus(b, () => note(accord[0] - 12), (x) => 0.16 * Math.min(1, x / 0.3) * Math.min(1, (4 * T - x) / 0.3), t0, 'sin', 4 * T);
    if (partie !== 'intro' && partie !== 'creux') [0, 2].forEach((p) => {
      sinus(b, (x) => 52 + 60 * Math.exp(-x * 30), (x) => 0.55 * enveloppe(x, 0.004, 0.18), t0 + p * T, 'sin', 0.6);
    });
    for (let p = 0; p < 4; p += 1) {
      if (partie === 'intro' && p % 2) continue;
      bruit(b, (x) => (p % 2 ? 0.05 : 0.08) * enveloppe(x, 0.0005, 0.012), { bas: 3500, haut: 9000, debut: t0 + p * T, hasard: graine(2000 + m * 4 + p), duree: 0.08 });
      sinus(b, () => (p % 2 ? 1760 : 2350), (x) => 0.03 * enveloppe(x, 0.001, 0.03), t0 + p * T, 'sin', 0.12);
    }
    if (partie === 'montee') monteeBruit(b, t0, 4 * T, 0.12, 2100 + m);
  });
}

// B. « Synapse » (96 BPM) : arpège doux en doubles croches, basse ronde, kick feutré.
function synapse(arrangement = {}) {
  const { sinus, bruit, enveloppe, graine, note, tampon, FREQ } = O();
  const arpege = tampon(arrangement.duree || 45);
  const ORDRE = [0, 2, 4, 1, 3, 2, 4, 3, 0, 2, 4, 1, 3, 4, 2, 1];
  const b = composer(96, arrangement, (b, m, t0, partie, T) => {
    const accord = ACCORDS[m % 4];
    const D = T / 4;
    nappe(b, accord, t0, 4 * T, 0.12, { attaque: 0.6 });
    ORDRE.forEach((k, pas) => {
      if (partie === 'intro' && pas % 2) return;
      const n = accord[k] + 12;
      sinus(arpege, () => note(n), (x) => 0.2 * enveloppe(x, 0.003, 0.16), t0 + pas * D, 'sin', 0.5);
      sinus(arpege, () => note(n) * 2, (x) => 0.05 * enveloppe(x, 0.002, 0.05), t0 + pas * D, 'sin', 0.2);
    });
    if (partie === 'plein' || partie === 'montee') {
      [[0, 4 * D * 1.5], [6 * D, 2 * D], [10 * D, 6 * D]].forEach(([p, d]) => {
        sinus(b, () => note(accord[0] - 24), (x) => 0.3 * Math.min(1, x / 0.01) * Math.min(1, (d - x) / 0.05), t0 + p, 'sin', d);
      });
    }
    if (partie === 'plein') [0, 2].forEach((p) => sinus(b, (x) => 48 + 70 * Math.exp(-x * 40), (x) => 0.5 * enveloppe(x, 0.003, 0.12), t0 + p * T, 'sin', 0.4));
    if (partie !== 'intro') for (let p = 0; p < 8; p += 1) {
      bruit(b, (x) => (p % 2 ? 0.05 : 0.025) * enveloppe(x, 0.002, 0.03), { bas: 6000, haut: 14000, debut: t0 + (p * T) / 2, hasard: graine(3000 + m * 8 + p), duree: 0.1 });
    }
    if (partie === 'montee') monteeBruit(b, t0, 4 * T, 0.1, 3100 + m);
  }, { melange: 0.22 });
  // L'arpège est adouci (passe-bas) et réverbéré à part, puis ajouté.
  reverbe(passeBas(arpege, 2600), 0.4);
  for (let i = 0; i < b.length; i += 1) b[i] += arpege[i];
  couper(b, arrangement.coupures || [], arrangement.coupure || 60 / 96);
  void FREQ;
  return b;
}

// C. « Respiration » (80 BPM) : nappe qui respire sur deux mesures, piano électrique épars.
function respiration(arrangement = {}) {
  const { sinus, enveloppe, note } = O();
  const NOTES = [[0, 76], [1.5, 79], [3, 74]];
  return composer(80, arrangement, (b, m, t0, partie, T) => {
    const accord = ACCORDS[m % 4];
    const cycle = 8 * T;
    nappe(b, accord, t0, 4 * T, 0.32, { attaque: 1.5, souffle: (t) => 0.65 + 0.35 * Math.sin((2 * Math.PI * t) / cycle - Math.PI / 2) });
    if (partie !== 'intro') NOTES.forEach(([p, n], k) => {
      if (m % 2 && k === 2) return;
      const f = note(n - (m % 4 === 1 ? 3 : 0));
      sinus(b, () => f, (x) => 0.16 * enveloppe(x, 0.004, 0.9), t0 + p * T, 'sin', 2.5);
      sinus(b, () => f * 2, (x) => 0.05 * enveloppe(x, 0.002, 0.25), t0 + p * T, 'sin', 1);
      sinus(b, () => f * 3.01, (x) => 0.02 * enveloppe(x, 0.001, 0.08), t0 + p * T, 'sin', 0.4);
    });
    if (partie === 'plein') sinus(b, () => note(accord[0] - 24), (x) => 0.14 * Math.min(1, x / 0.5) * Math.min(1, (4 * T - x) / 0.5), t0, 'sin', 4 * T);
    if (partie === 'montee') monteeBruit(b, t0, 4 * T, 0.08, 4100 + m);
  }, { melange: 0.4 });
}

// --- Bruitages ----------------------------------------------------------------------
const BRUITAGES = {
  // Souffle : l'entrée d'un texte.
  'souffle.wav': () => {
    const { tampon, bruit, graine } = O();
    const b = tampon(0.7);
    bruit(b, (x) => 0.5 * Math.sin(Math.PI * Math.min(1, x / 0.55)), { bas: 500, haut: (x) => 1500 + 5000 * Math.sin(Math.PI * Math.min(1, x / 0.55)), hasard: graine(51), duree: 0.6 });
    return reverbe(b, 0.3);
  },
  // Impact feutré : un chiffre qui tombe.
  'impact.wav': () => {
    const { tampon, sinus, bruit, enveloppe, graine } = O();
    const b = tampon(1.4);
    sinus(b, (x) => 46 + 90 * Math.exp(-x * 22), (x) => 0.9 * enveloppe(x, 0.003, 0.32), 0, 'sin', 1.3);
    bruit(b, (x) => 0.25 * enveloppe(x, 0.001, 0.05), { bas: 120, haut: 1400, hasard: graine(52), duree: 0.3 });
    return reverbe(b, 0.3);
  },
  // Tic : une étape, un tracé qui commence.
  'tic.wav': () => {
    const { tampon, sinus, bruit, enveloppe, graine } = O();
    const b = tampon(0.5);
    sinus(b, () => 2100, (x) => 0.35 * enveloppe(x, 0.0008, 0.025), 0, 'sin', 0.2);
    bruit(b, (x) => 0.2 * enveloppe(x, 0.0004, 0.006), { bas: 3000, haut: 12000, hasard: graine(53), duree: 0.05 });
    return reverbe(b, 0.35);
  },
  // Montée : avant une révélation.
  'montee.wav': () => {
    const { tampon, sinus } = O();
    const b = tampon(1.8);
    monteeBruit(b, 0, 1.6, 0.6, 54);
    sinus(b, (x) => 220 * 2 ** (x / 1.6), (x) => 0.12 * (x / 1.6) ** 2, 0, 'sin', 1.6);
    return reverbe(b, 0.3);
  },
};

const MUSIQUES = { labo, synapse, respiration };
module.exports = { MUSIQUES, BRUITAGES, reverbe };

if (require.main === module) {
  const { normaliser, ecrireWav } = O();
  const dossier = path.resolve(process.argv[2] || '.');
  for (const [nom, f] of Object.entries(BRUITAGES)) ecrireWav(path.join(dossier, nom), normaliser(f(), 0.89), true);
  console.log('bruitages écrits dans', dossier);
}
