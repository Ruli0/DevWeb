// Synthétise les bruitages des vidéos en WAV (mono, 16 bits, 44,1 kHz) : videos/sons/*.wav
//   node scripts/build-sons.js
// Aucun échantillon externe : tout est calculé ici, avec un hasard reproductible.
// Les fichiers sont donc toujours identiques, et libres de droits.
const fs = require('node:fs');
const path = require('node:path');

const FREQ = 44100;
const dossier = path.join(__dirname, '../videos/sons');

// --- Outils de synthèse -------------------------------------------------------------
function graine(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const tampon = (secondes) => new Float32Array(Math.round(secondes * FREQ));
const enveloppe = (t, attaque, chute) => (t < attaque ? t / attaque : Math.exp(-(t - attaque) / chute));

// Oscillateur dont la fréquence suit une fonction du temps.
function sinus(buf, freq, ampli, debut = 0, forme = 'sin') {
  let phase = 0;
  for (let i = Math.round(debut * FREQ); i < buf.length; i += 1) {
    const t = i / FREQ - debut;
    const a = ampli(t);
    if (a === 0 && t > 0.01) continue;
    phase += (2 * Math.PI * freq(t)) / FREQ;
    const v = forme === 'scie' ? ((phase / Math.PI) % 2) - 1 : forme === 'carre' ? Math.sign(Math.sin(phase)) : Math.sin(phase);
    buf[i] += v * a;
  }
}

// Bruit filtré (passe-bande approximatif par deux filtres d'ordre 1).
function bruit(buf, ampli, { bas = 200, haut = 8000, debut = 0, hasard = graine(1) } = {}) {
  let lp = 0;
  let hp = 0;
  let precedent = 0;
  for (let i = Math.round(debut * FREQ); i < buf.length; i += 1) {
    const t = i / FREQ - debut;
    const h = typeof haut === 'function' ? haut(t) : haut;
    const kLp = 1 - Math.exp((-2 * Math.PI * h) / FREQ);
    const kHp = Math.exp((-2 * Math.PI * bas) / FREQ);
    const x = hasard() * 2 - 1;
    lp += kLp * (x - lp);
    hp = kHp * (hp + lp - precedent);
    precedent = lp;
    buf[i] += hp * ampli(t);
  }
}

function normaliser(buf, crete = 0.89) {
  let max = 0;
  for (const v of buf) max = Math.max(max, Math.abs(v));
  if (max > 0) for (let i = 0; i < buf.length; i += 1) buf[i] *= crete / max;
  // Petits fondus pour éviter les clics.
  const f = Math.min(200, buf.length >> 2);
  for (let i = 0; i < f; i += 1) { buf[i] *= i / f; buf[buf.length - 1 - i] *= i / f; }
  return buf;
}

function ecrireWav(nom, buf) {
  const donnees = Buffer.alloc(buf.length * 2);
  buf.forEach((v, i) => donnees.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2));
  const tete = Buffer.alloc(44);
  tete.write('RIFF', 0); tete.writeUInt32LE(36 + donnees.length, 4); tete.write('WAVE', 8);
  tete.write('fmt ', 12); tete.writeUInt32LE(16, 16); tete.writeUInt16LE(1, 20); tete.writeUInt16LE(1, 22);
  tete.writeUInt32LE(FREQ, 24); tete.writeUInt32LE(FREQ * 2, 28); tete.writeUInt16LE(2, 32); tete.writeUInt16LE(16, 34);
  tete.write('data', 36); tete.writeUInt32LE(donnees.length, 40);
  fs.writeFileSync(path.join(dossier, nom), Buffer.concat([tete, donnees]));
  console.log(`${nom.padEnd(14)} ${(buf.length / FREQ).toFixed(2)} s`);
}

// --- Les sons ------------------------------------------------------------------------
const SONS = {
  // La langue du caméléon : un « fwip » qui monte très vite.
  'fwip.wav'() {
    const b = tampon(0.22);
    sinus(b, (t) => 260 + 2400 * (t / 0.12) ** 1.6, (t) => 0.6 * enveloppe(t, 0.005, 0.05));
    bruit(b, (t) => 0.5 * enveloppe(t, 0.004, 0.035), { bas: 1500, haut: (t) => 3000 + 20000 * t, hasard: graine(2) });
    return b;
  },
  // Avaler : un « gloup » grave qui descend.
  'gloup.wav'() {
    const b = tampon(0.32);
    sinus(b, (t) => 240 * Math.exp(-t * 6) + 70, (t) => 0.9 * enveloppe(t, 0.01, 0.08));
    sinus(b, (t) => 160 * Math.exp(-t * 5) + 60, (t) => 0.5 * enveloppe(t, 0.01, 0.06), 0.12);
    return b;
  },
  // La dionée qui claque.
  'clac.wav'() {
    const b = tampon(0.3);
    bruit(b, (t) => enveloppe(t, 0.001, 0.012), { bas: 1800, haut: 12000, hasard: graine(3) });
    sinus(b, (t) => 140 * Math.exp(-t * 18) + 55, (t) => 0.9 * enveloppe(t, 0.002, 0.07));
    return b;
  },
  // Un coassement : une dent de scie grave, modulée.
  'croa.wav'() {
    const b = tampon(0.42);
    sinus(b, (t) => 118 + 18 * Math.sin(t * 40), (t) => 0.55 * enveloppe(t, 0.02, 0.16) * (0.55 + 0.45 * Math.sin(2 * Math.PI * 32 * t)), 0, 'scie');
    bruit(b, (t) => 0.12 * enveloppe(t, 0.02, 0.12), { bas: 300, haut: 1600, hasard: graine(4) });
    return b;
  },
  // Une goutte : « plic ».
  'plic.wav'() {
    const b = tampon(0.35);
    sinus(b, (t) => 600 + 1500 * Math.exp(-t * 40), (t) => 0.8 * enveloppe(t, 0.002, 0.045));
    sinus(b, (t) => 500 + 1100 * Math.exp(-t * 40), (t) => 0.25 * enveloppe(t, 0.002, 0.04), 0.09);
    return b;
  },
  // Une goutte qui traverse un filtre : « bloup » plus doux.
  'bloup.wav'() {
    const b = tampon(0.3);
    sinus(b, (t) => 380 + 520 * Math.exp(-t * 22), (t) => 0.75 * enveloppe(t, 0.006, 0.06));
    bruit(b, (t) => 0.15 * enveloppe(t, 0.004, 0.04), { bas: 400, haut: 2500, hasard: graine(5) });
    return b;
  },
  // Une mouche qui arrive : bourdonnement qui grossit.
  'bzz.wav'() {
    const b = tampon(1.4);
    sinus(b, (t) => 210 + 25 * Math.sin(t * 55) + 15 * Math.sin(t * 13), (t) => 0.3 * Math.min(1, t / 0.6) * Math.min(1, (1.4 - t) / 0.2), 0, 'carre');
    return b;
  },
  // Des pattes qui trottinent.
  'trotte.wav'() {
    const b = tampon(1.6);
    const h = graine(6);
    for (let k = 0; k < 26; k += 1) {
      const t0 = k * 0.058 + h() * 0.02;
      bruit(b, (t) => (t < 0 ? 0 : 0.6 * enveloppe(t, 0.001, 0.008)), { bas: 2500, haut: 9000, debut: t0, hasard: graine(60 + k) });
    }
    return b;
  },
  // Le verre qui vibre quand la boîte déborde.
  'vitre.wav'() {
    const b = tampon(0.9);
    sinus(b, (t) => 1850, (t) => 0.35 * enveloppe(t, 0.01, 0.3) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 18 * t)));
    sinus(b, (t) => 2770, (t) => 0.2 * enveloppe(t, 0.01, 0.25));
    bruit(b, (t) => 0.35 * enveloppe(t, 0.002, 0.05) * (0.5 + 0.5 * Math.sin(2 * Math.PI * 22 * t)), { bas: 900, haut: 6000, hasard: graine(7) });
    return b;
  },
  // Un coup de cisailles.
  'cisaille.wav'() {
    const b = tampon(0.4);
    bruit(b, (t) => enveloppe(t, 0.001, 0.02), { bas: 2500, haut: 14000, hasard: graine(8) });
    bruit(b, (t) => (t < 0 ? 0 : 0.8 * enveloppe(t, 0.001, 0.02)), { bas: 2500, haut: 14000, debut: 0.16, hasard: graine(9) });
    return b;
  },
  // Un changement de couleur : petit carillon qui monte.
  'carillon.wav'() {
    const b = tampon(0.9);
    [1047, 1319, 1568].forEach((f, k) => sinus(b, () => f, (t) => 0.4 * enveloppe(t, 0.004, 0.25), k * 0.09));
    return b;
  },
  // L'apparition d'une carte : « pop ».
  'pop.wav'() {
    const b = tampon(0.2);
    sinus(b, (t) => 380 + 900 * Math.exp(-t * 60), (t) => 0.9 * enveloppe(t, 0.002, 0.035));
    return b;
  },
  // Un mouvement de caméra : souffle qui passe.
  'souffle.wav'() {
    const b = tampon(0.7);
    bruit(b, (t) => 0.5 * Math.sin(Math.PI * Math.min(1, t / 0.7)) ** 2, { bas: 300, haut: (t) => 900 + 2600 * Math.sin(Math.PI * Math.min(1, t / 0.7)), hasard: graine(10) });
    return b;
  },
  // Ambiance : eau qui coule, rares chants d'oiseaux. 45 s, coupée à la durée de chaque vidéo.
  'ambiance.wav'() {
    const d = 45;
    const b = tampon(d);
    bruit(b, (t) => 0.22 * (0.8 + 0.2 * Math.sin(t * 0.7) * Math.sin(t * 1.9)), { bas: 120, haut: 1400, hasard: graine(11) });
    bruit(b, (t) => 0.06 * (0.6 + 0.4 * Math.sin(t * 3.1)), { bas: 2500, haut: 7000, hasard: graine(12) });
    const h = graine(13);
    for (let t0 = 1.5; t0 < d - 1; t0 += 2.5 + h() * 4) {
      const base = 2400 + h() * 1600;
      const n = 2 + Math.floor(h() * 3);
      for (let k = 0; k < n; k += 1) {
        sinus(b, (t) => base + 900 * Math.sin(t * 60), (t) => (t < 0 || t > 0.09 ? 0 : 0.05 * Math.sin((Math.PI * t) / 0.09)), t0 + k * 0.13);
      }
    }
    return b;
  },
};

fs.mkdirSync(dossier, { recursive: true });
for (const [nom, fabrique] of Object.entries(SONS)) {
  ecrireWav(nom, normaliser(fabrique(), nom === 'ambiance.wav' ? 0.5 : 0.89));
}
