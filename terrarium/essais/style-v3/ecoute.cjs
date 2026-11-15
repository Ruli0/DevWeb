// Étape 2 du plan V3 : les trois ambiances sur le test de mouvement, avec les bruitages calés.
// Usage : node essais/style-v3/ecoute.cjs <dossier contenant mouvement.mp4>
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { outils, MUSIQUES_ARRANGEES } = require('../../scripts/build-sons.js');
const { BRUITAGES } = require('../../scripts/sons-v3.js');

const { FREQ, tampon, normaliser, ecrireWav } = outils;
const DOSSIER = path.resolve(process.argv[2] || path.join(__dirname, 'sortie'));
const DUREE = 6.4;

// Les instants du test de mouvement (voir mouvement.cjs).
const REPERES = [
  ['impact.wav', 0.1, 0.55],   // le chiffre arrive
  ['souffle.wav', 0.95, 0.4],  // la légende entre
  ['montee.wav', 1.3, 0.35],   // annonce la transformation
  ['souffle.wav', 2.65, 0.4],  // le texte sort
  ['tic.wav', 3.7, 0.35],      // les sillons se dessinent
  ['impact.wav', 4.3, 0.6],    // l'amygdale s'allume (après une courte coupure)
  ['tic.wav', 4.7, 0.3],       // le signal part
  ['souffle.wav', 5.35, 0.3],  // les étiquettes
];
const AMBIANCES = {
  labo: { parties: ['intro', 'creux', 'plein'] },
  synapse: { parties: ['intro', 'plein', 'plein'] },
  respiration: { parties: ['intro', 'plein', 'plein'] },
};

const sons = Object.fromEntries(Object.entries(BRUITAGES).map(([n, f]) => [n, normaliser(f(), 0.89)]));
for (const [nom, arr] of Object.entries(AMBIANCES)) {
  const musique = normaliser(MUSIQUES_ARRANGEES[nom]({ duree: DUREE, ...arr, coupures: [3.85], coupure: 0.45 }), 0.89);
  const b = tampon(DUREE);
  for (let i = 0; i < b.length; i += 1) b[i] = 0.55 * musique[i];
  for (const [n, t, v] of REPERES) {
    const s = sons[n]; const i0 = Math.round(t * FREQ);
    for (let i = 0; i < s.length && i0 + i < b.length; i += 1) b[i0 + i] += v * s[i];
  }
  const wav = path.join(DOSSIER, `son-${nom}.wav`);
  // Compression douce : vise environ -14 dB de niveau moyen sans saturer.
  normaliser(b, 1);
  for (let i = 0; i < b.length; i += 1) b[i] = (0.85 * Math.tanh(2.2 * b[i])) / Math.tanh(2.2);
  ecrireWav(wav, b, true);
  const mp4 = path.join(DOSSIER, `mouvement-${nom}.mp4`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(DOSSIER, 'mouvement.mp4'), '-i', wav,
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', mp4]);
  console.log(mp4);
}
void fs;
