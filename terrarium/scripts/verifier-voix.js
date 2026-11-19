// Vérifie sur le SIGNAL SONORE réel qu'un jeu de mots fléchés ne montre jamais une réponse avant que la voix l'ait dite.
//   node scripts/verifier-voix.js <id>        (après : npm run video -- <id>)
// Lit videos/studio/<id>/feuille.json et assets/sons/voix.wav (la voix montée, à l'échelle de la vidéo). Pour chaque réponse :
//   - la première lettre est posée après la fin de la phrase dite (parole mesurée sur l'énergie du signal, pas sur la transcription) ;
//   - aucun sous-titre n'est affiché dans un silence (écart > 0,15 s avec le début de la parole) ;
//   - il y a bien un silence de réflexion avant la réponse.
// Sort avec le code 1 s'il y a un problème ; scripts/publier.js refuse alors le rendu final. Voir production/PASSATION-AVIS.md.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

// Les segments de parole d'une piste mono (échantillons flottants) : énergie par 20 ms, seuil à 32 dB sous le niveau fort, blancs de moins de 0,12 s comblés.
const MARGE = 0.3;   // marge minimale entre la fin de la phrase de réponse et la première lettre (un son en retard de 0,3 s sur l'image arrive encore avant)
function segmentsParole(ech, taux, { pas = 0.02, bas = 32, comble = 0.12, mini = 0.06 } = {}) {
  const b = Math.max(1, Math.round(taux * pas)), n = Math.floor(ech.length / b), db = new Array(n);
  for (let i = 0; i < n; i += 1) { let s = 0; for (let j = i * b; j < (i + 1) * b; j += 1) s += ech[j] * ech[j]; db[i] = 10 * Math.log10(s / b + 1e-12); }
  const tri = db.slice().sort((x, y) => x - y), haut = tri[Math.floor(n * 0.95)], seuil = haut - bas;
  const brut = []; let debut = null;
  db.forEach((v, i) => { if (v > seuil && debut === null) debut = i; if ((v <= seuil || i === n - 1) && debut !== null) { brut.push([debut * pas, (i + (v > seuil ? 1 : 0)) * pas]); debut = null; } });
  const fus = [];
  brut.forEach(([a, c]) => { const d = fus[fus.length - 1]; if (d && a - d[1] < comble) d[1] = c; else fus.push([a, c]); });
  return fus.filter(([a, c]) => c - a >= mini);
}

function verifier(feuille, ech, taux) {
  const problemes = [], seg = segmentsParole(ech, taux);
  const G = require('../studio/avis/grille.js');
  feuille.plans.filter((x) => x.id === 'grille' && !x.p.muetCfg).forEach((x) => {
    const g = G.construire(x.p.mots), neuves = G.nouvelles(g, x.p.mots.length);
    x.p.mots.forEach((m, k) => {
      const tr = x.t0 + m.reponse.t, H = G.horaires(tr, neuves[k].length, x.t0 + (m.reponse.f == null ? m.reponse.t : m.reponse.f)), ou = `mot ${k + 1} (${m.texte})`;
      // La phrase de réponse : le segment de parole qui commence au plus tôt 0,6 s avant l'ancre.
      const s = seg.find(([a, c]) => c > tr - 0.1 && a >= tr - 0.6) || seg.find(([a, c]) => a <= tr + 0.1 && c > tr);
      if (!s) { problemes.push(`${ou} : aucune parole mesurée autour de la réponse (${tr.toFixed(2)} s)`); return; }
      if (x.p.voixVerifiee === false) return;
      if (s[1] - s[0] > 1.7) { problemes.push(`${ou} : la phrase de réponse (${s[0].toFixed(2)} à ${s[1].toFixed(2)} s) n'est pas isolée : elle se prolonge dans la définition suivante`); return; }
      const finMot = s[1];
      if (H.pose[0] < finMot + MARGE - 0.02) problemes.push(`${ou} : la première lettre se pose à ${H.pose[0].toFixed(2)} s, moins de ${MARGE} s après la fin de la phrase dite (${finMot.toFixed(2)} s) : la réponse peut s'afficher avant la voix`);
      if (H.pose[0] < s[0] + 0.2) problemes.push(`${ou} : la première lettre (${H.pose[0].toFixed(2)} s) précède le début de la parole (${s[0].toFixed(2)} s)`);
      if (H.depart < s[0] - 0.05) problemes.push(`${ou} : l'étincelle part à ${H.depart.toFixed(2)} s, avant le début de la parole (${s[0].toFixed(2)} s)`);
      const prec = seg.filter(([, c]) => c < s[0] - 0.05).pop(), blanc = prec ? s[0] - prec[1] : s[0];
      if (x.p.cadence && blanc < x.p.cadence - 5) problemes.push(`${ou} : le silence de réflexion avant la réponse ne dure que ${blanc.toFixed(1)} s (cadence ${x.p.cadence} s)`);
    });
  });
  // Les sous-titres : un groupe dont le début tombe dans un silence est affiché avant la voix.
  (feuille.groupes || []).forEach((gr) => {
    const dans = seg.some(([a, c]) => a <= gr.t0 + 0.15 && c >= gr.t0 + 0.02);
    if (!dans) { const suivant = seg.find(([a]) => a > gr.t0); problemes.push(`sous-titre « ${gr.mots.map((w) => w.m).join(' ')} » affiché à ${gr.t0.toFixed(2)} s dans un silence (la parole reprend à ${suivant ? suivant[0].toFixed(2) : '?'} s)`); }
  });
  return { problemes, segments: seg };
}

function lirePiste(chemin, taux = 16000) {
  const b = execFileSync('ffmpeg', ['-v', 'error', '-i', chemin, '-vn', '-ac', '1', '-ar', String(taux), '-f', 'f32le', '-'], { maxBuffer: 1 << 28 });
  return new Float32Array(b.buffer, b.byteOffset, Math.floor(b.length / 4));
}

module.exports = { verifier, segmentsParole, lirePiste };

if (require.main === module) {
  const [id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (!id) { console.error('Usage : node scripts/verifier-voix.js <id>'); process.exit(1); }
  const dossier = path.join(__dirname, '..', 'videos/studio', id);
  const f = path.join(dossier, 'feuille.json'), v = path.join(dossier, 'assets/sons/voix.wav');
  if (!fs.existsSync(f) || !fs.existsSync(v)) { console.error(`composition absente : npm run video -- ${id}`); process.exit(1); }
  const feuille = JSON.parse(fs.readFileSync(f, 'utf8'));
  if (feuille.voix && feuille.voix.muet) { console.log('Vérification de la voix : jeu muet, rien à vérifier.'); process.exit(0); }
  if (!feuille.plans.some((x) => x.id === 'grille') && !(feuille.groupes || []).length) { console.log('Vérification de la voix : rien à vérifier.'); process.exit(0); }
  const r = verifier(feuille, lirePiste(v), 16000);
  if (!r.problemes.length) console.log(`Vérification de la voix (${id}) : la réponse n'est jamais affichée avant la voix, aucun sous-titre dans un silence.`);
  else { console.error(`Vérification de la voix (${id}) : ${r.problemes.length} problème(s) :\n  - ${r.problemes.join('\n  - ')}`); process.exit(1); }
}
