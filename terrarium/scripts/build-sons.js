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
function sinus(buf, freq, ampli, debut = 0, forme = 'sin', duree = Infinity) {
  let phase = 0;
  const fin = Math.min(buf.length, Math.round((debut + duree) * FREQ));
  for (let i = Math.round(debut * FREQ); i < fin; i += 1) {
    const t = i / FREQ - debut;
    const a = ampli(t);
    if (a === 0 && t > 0.01) continue;
    phase += (2 * Math.PI * freq(t)) / FREQ;
    const v = forme === 'scie' ? ((phase / Math.PI) % 2) - 1 : forme === 'carre' ? Math.sign(Math.sin(phase)) : Math.sin(phase);
    buf[i] += v * a;
  }
}

// Bruit filtré (passe-bande approximatif par deux filtres d'ordre 1).
function bruit(buf, ampli, { bas = 200, haut = 8000, debut = 0, hasard = graine(1), duree = Infinity } = {}) {
  let lp = 0;
  let hp = 0;
  let precedent = 0;
  const fin = Math.min(buf.length, Math.round((debut + duree) * FREQ));
  for (let i = Math.round(debut * FREQ); i < fin; i += 1) {
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

function ecrireWav(nom, buf, silencieux) {
  const donnees = Buffer.alloc(buf.length * 2);
  buf.forEach((v, i) => donnees.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2));
  const tete = Buffer.alloc(44);
  tete.write('RIFF', 0); tete.writeUInt32LE(36 + donnees.length, 4); tete.write('WAVE', 8);
  tete.write('fmt ', 12); tete.writeUInt32LE(16, 16); tete.writeUInt16LE(1, 20); tete.writeUInt16LE(1, 22);
  tete.writeUInt32LE(FREQ, 24); tete.writeUInt32LE(FREQ * 2, 28); tete.writeUInt16LE(2, 32); tete.writeUInt16LE(16, 34);
  tete.write('data', 36); tete.writeUInt32LE(donnees.length, 40);
  fs.writeFileSync(path.isAbsolute(nom) ? nom : path.join(dossier, nom), Buffer.concat([tete, donnees]));
  if (!silencieux) console.log(`${nom.padEnd(14)} ${(buf.length / FREQ).toFixed(2)} s`);
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

// --- Musique : une boucle phonk originale ------------------------------------------
// 130 BPM, fa mineur. Mélodie de cloche (« cowbell »), basse 808 saturée qui glisse,
// claps sur les temps 2 et 4, charleston en croches avec des roulements, grain « lo-fi ».
function phonk() {
  const BPM = 130;
  const DOUBLE = 60 / BPM / 4; // une double croche
  const MESURES = 24; // 44 s : plus que la plus longue vidéo
  const b = tampon(MESURES * 16 * DOUBLE + 1);
  const cloche = tampon(b.length / FREQ);
  const basse = tampon(b.length / FREQ);
  const N = { Db5: 554.4, Eb5: 622.3, F5: 698.5, Ab5: 830.6, Bb5: 932.3, C6: 1046.5 };
  // Deux mesures de mélodie : [double croche, note]
  const MELODIE = [
    [[0, 'F5'], [3, 'F5'], [6, 'Ab5'], [8, 'C6'], [10, 'Bb5'], [12, 'Ab5'], [14, 'F5']],
    [[0, 'Eb5'], [3, 'Eb5'], [6, 'F5'], [8, 'Ab5'], [10, 'F5'], [12, 'Eb5'], [14, 'Db5']],
  ];
  // Basse 808 : [double croche, fréquence]
  const BASSE = [
    [[0, 87.3], [6, 87.3], [10, 103.8]],
    [[0, 69.3], [6, 77.8], [11, 87.3]],
  ];
  const h = graine(21);
  for (let m = 0; m < MESURES; m += 1) {
    const t0 = m * 16 * DOUBLE;
    const phrase = m % 2;
    // Cloche : deux carrés au rapport 1,48 (le timbre de la cloche de la 808).
    MELODIE[phrase].forEach(([pas, note]) => {
      const f = N[note];
      const env = (t) => (t < 0 ? 0 : 0.5 * enveloppe(t, 0.001, 0.09));
      sinus(cloche, () => f, env, t0 + pas * DOUBLE, 'carre', 0.5);
      sinus(cloche, () => f * 1.48, (t) => 0.6 * env(t), t0 + pas * DOUBLE, 'carre', 0.5);
    });
    // Basse 808 : chaque note s'arrête quand la suivante commence.
    const notes = BASSE[phrase];
    notes.forEach(([pas, f], k) => {
      const debut = t0 + pas * DOUBLE;
      const fin = k + 1 < notes.length ? t0 + notes[k + 1][0] * DOUBLE : t0 + 16 * DOUBLE;
      const d = fin - debut;
      sinus(basse, (t) => f * (1 + 2.2 * Math.exp(-t * 45)), (t) => enveloppe(t, 0.003, 0.32) * Math.min(1, (d - t) / 0.02), debut, 'sin', d);
    });
    // Claps sur les temps 2 et 4 : trois éclats de bruit rapprochés.
    [4, 12].forEach((pas) => {
      const debut = t0 + pas * DOUBLE;
      [0, 0.011, 0.023].forEach((dt, k) => bruit(b, (t) => (t < 0 ? 0 : (k === 2 ? 0.55 : 0.35) * enveloppe(t, 0.001, k === 2 ? 0.07 : 0.01)), { bas: 900, haut: 5500, debut: debut + dt, hasard: graine(100 + m * 10 + pas + k), duree: 0.4 }));
      sinus(b, () => 190, (t) => 0.18 * enveloppe(t, 0.001, 0.04), debut, 'sin', 0.25);
    });
    // Charleston : croches, et un roulement en fin de phrase.
    for (let pas = 0; pas < 16; pas += 2) {
      bruit(b, (t) => (t < 0 ? 0 : (pas % 4 ? 0.13 : 0.2) * enveloppe(t, 0.0005, 0.018)), { bas: 7000, haut: 16000, debut: t0 + pas * DOUBLE, hasard: graine(500 + m * 16 + pas), duree: 0.15 });
    }
    if (phrase === 1) {
      for (let k = 0; k < 6; k += 1) {
        bruit(b, (t) => (t < 0 ? 0 : (0.08 + 0.02 * k) * enveloppe(t, 0.0005, 0.012)), { bas: 7000, haut: 16000, debut: t0 + 13 * DOUBLE + (k * DOUBLE) / 2, hasard: graine(900 + m * 8 + k), duree: 0.1 });
      }
    }
    h();
  }
  // La cloche : filtrée (ni trop grave, ni trop aiguë). La basse : saturée.
  let bas = 0;
  let haut = 0;
  let precedent = 0;
  for (let i = 0; i < b.length; i += 1) {
    bas += 0.35 * (cloche[i] - bas);
    haut = 0.92 * (haut + bas - precedent);
    precedent = bas;
    b[i] += 0.8 * haut + 0.6 * Math.tanh(2 * basse[i]);
  }
  // Grain lo-fi : légère saturation et résolution réduite.
  for (let i = 0; i < b.length; i += 1) b[i] = Math.round(Math.tanh(1.1 * b[i]) * 4096) / 4096;
  return b;
}
SONS['phonk.wav'] = phonk;

// Arrangement (facultatif) de drift() : { duree, parties, coupures }.
//   parties[m] : « intro » (cloche douce), « creux » (sans basse ni claps), « montee » (roulement), « plein ».
//   coupures : instants (en secondes) où la musique se tait pendant un temps.
// --- Drift : la phonk validée pour « Les nuits du terrarium » (13 nov. 2026) ---------
// 145 BPM, fa dièse mineur : cloche rapide et saturée, charleston en doubles croches,
// 808 lourde qui glisse, claps sur 2 et 4, roulement en fin de phrase.
const note = (n) => 440 * 2 ** ((n - 69) / 12);
function drift(arrangement = {}) {
  const DUREE = arrangement.duree || 45;
  const parties = arrangement.parties || [];
  const DOUBLE = 60 / 145 / 4;
  const b = tampon(DUREE);
  const cloche = tampon(DUREE);
  const basse = tampon(DUREE);
  const MELODIE = [
    [[0, 78], [2, 78], [3, 81], [6, 78], [8, 85], [10, 83], [11, 81], [12, 78], [14, 76]],
    [[0, 76], [2, 76], [3, 78], [6, 81], [8, 83], [10, 81], [12, 78], [13, 76], [14, 73]],
  ];
  const BASSE = [[[0, 42], [6, 42], [10, 45]], [[0, 40], [6, 40], [11, 37]]];
  const mesures = Math.ceil(DUREE / (16 * DOUBLE));
  for (let m = 0; m < mesures; m += 1) {
    const t0 = m * 16 * DOUBLE;
    const phrase = m % 2;
    const partie = parties[m] || 'plein';
    const plein = partie === 'plein';
    MELODIE[phrase].forEach(([pas, n]) => {
      const env = (x) => (partie === 'intro' ? 0.38 : 0.6) * enveloppe(x, 0.001, 0.07);
      sinus(cloche, () => note(n), env, t0 + pas * DOUBLE, 'carre', 0.5);
      sinus(cloche, () => note(n) * 1.48, (x) => 0.6 * env(x), t0 + pas * DOUBLE, 'carre', 0.5);
    });
    if (plein) BASSE[phrase].forEach(([pas, n], k, notes) => {
      const debut = t0 + pas * DOUBLE;
      const fin = k + 1 < notes.length ? t0 + notes[k + 1][0] * DOUBLE : t0 + 16 * DOUBLE;
      const d = fin - debut;
      sinus(basse, (x) => note(n) * (1 + 2.6 * Math.exp(-x * 40)), (x) => enveloppe(x, 0.003, 0.45) * Math.min(1, (d - x) / 0.02), debut, 'sin', d);
    });
    if (plein) [4, 12].forEach((pas) => {
      const debut = t0 + pas * DOUBLE;
      [0, 0.011, 0.023].forEach((dt, k) => bruit(b, (x) => (k === 2 ? 0.55 : 0.35) * enveloppe(x, 0.001, k === 2 ? 0.07 : 0.01), { bas: 900, haut: 5500, debut: debut + dt, hasard: graine(100 + m * 10 + pas + k), duree: 0.4 }));
    });
    for (let pas = 0; pas < 16; pas += 1) {
      if (partie === 'intro' && pas % 4) continue;
      bruit(b, (x) => 0.2 * (pas % 4 ? 0.65 : 1) * enveloppe(x, 0.0005, 0.018), { bas: 7000, haut: 16000, debut: t0 + pas * DOUBLE, hasard: graine(500 + m * 16 + pas), duree: 0.15 });
    }
    if (partie === 'montee') {
      // Roulement qui accélère et monte : il annonce le retour de la basse.
      for (let k = 0; k < 32; k += 1) bruit(b, (x) => (0.06 + 0.006 * k) * enveloppe(x, 0.0005, 0.01), { bas: 5000 + 150 * k, haut: 16000, debut: t0 + (k * DOUBLE) / 2, hasard: graine(1300 + m * 40 + k), duree: 0.08 });
    }
    if (phrase === 1 && plein) {
      for (let k = 0; k < 6; k += 1) bruit(b, (x) => (0.08 + 0.02 * k) * enveloppe(x, 0.0005, 0.012), { bas: 7000, haut: 16000, debut: t0 + 13 * DOUBLE + (k * DOUBLE) / 2, hasard: graine(900 + m * 8 + k), duree: 0.1 });
    }
  }
  let bas = 0; let haut = 0; let precedent = 0;
  for (let i = 0; i < b.length; i += 1) {
    bas += 0.35 * (cloche[i] - bas); haut = 0.92 * (haut + bas - precedent); precedent = bas;
    b[i] += 0.8 * haut + 0.7 * Math.tanh(3 * basse[i]);
  }
  for (let i = 0; i < b.length; i += 1) b[i] = Math.round(Math.tanh(1.5 * b[i]) * 4096) / 4096;
  // Coupures : un temps de silence, avec 4 ms de fondu de chaque côté.
  const TEMPS = 4 * DOUBLE;
  (arrangement.coupures || []).forEach((t) => {
    const i0 = Math.round(t * FREQ); const i1 = Math.round((t + TEMPS) * FREQ); const f = Math.round(0.004 * FREQ);
    for (let i = Math.max(0, i0 - f); i < Math.min(b.length, i1 + f); i += 1) {
      b[i] *= i < i0 ? (i0 - i) / f : i >= i1 ? (i - i1) / f : 0;
    }
  });
  return b;
}
SONS['drift.wav'] = () => drift();

// --- Les sons de Mousse ---------------------------------------------------------------
// Le clic de la lanterne : un déclic sec et un petit « toc » métallique.
SONS['clic.wav'] = () => {
  const b = tampon(0.25);
  bruit(b, (t) => enveloppe(t, 0.0005, 0.006), { bas: 2000, haut: 12000, hasard: graine(30) });
  sinus(b, () => 1900, (t) => 0.35 * enveloppe(t, 0.001, 0.03), 0, 'sin', 0.15);
  sinus(b, (t) => 260 * Math.exp(-t * 8), (t) => 0.4 * enveloppe(t, 0.002, 0.04), 0.01, 'sin', 0.2);
  return b;
};
// Le « bip » de Mousse quand il réagit : deux notes de robot.
SONS['bip.wav'] = () => {
  const b = tampon(0.32);
  sinus(b, () => 880, (t) => 0.5 * enveloppe(t, 0.004, 0.05), 0, 'carre', 0.12);
  sinus(b, () => 1320, (t) => 0.5 * enveloppe(t, 0.004, 0.07), 0.11, 'carre', 0.2);
  return b;
};
// Le terminal qui tape : une rafale de petits clics de clavier.
SONS['clavier.wav'] = () => {
  const b = tampon(0.6);
  const h = graine(31);
  for (let k = 0; k < 12; k += 1) {
    bruit(b, (t) => (0.4 + 0.3 * h()) * enveloppe(t, 0.0005, 0.007), { bas: 1800, haut: 9000, debut: k * 0.035 + h() * 0.008, hasard: graine(40 + k), duree: 0.04 });
  }
  return b;
};

// Une musique arrangée pour une vidéo (voir « arrangement » dans le scénario) :
// écrite à l'endroit demandé (chemin absolu), au même niveau que la boucle générale.
const MUSIQUES_ARRANGEES = { drift };
function ecrireMusique(nom, arrangement, fichier) {
  ecrireWav(fichier, normaliser(MUSIQUES_ARRANGEES[nom](arrangement), 0.8), true);
}

if (require.main === module) {
  fs.mkdirSync(dossier, { recursive: true });
  for (const [nom, fabrique] of Object.entries(SONS)) {
    ecrireWav(nom, normaliser(fabrique(), { 'ambiance.wav': 0.5, 'phonk.wav': 0.8 }[nom] || 0.89));
  }
}
module.exports = { ecrireMusique, MUSIQUES_ARRANGEES };
