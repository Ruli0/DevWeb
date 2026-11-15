// Maquette de voix : fabrique une « voix » muette à partir d'un script, pour préparer les visuels avant l'enregistrement.
//   node scripts/maquette-voix.js <id> [mots par seconde, 2.7 par défaut]
// Lit videos/voix/<id>/script.txt ; écrit mots.json (instants estimés) et propre.flac (silence).
// Quand la vraie voix arrive : python3 scripts/voix.py <enregistrement> <id> remplace ces deux fichiers.
// Si l'auteur dit les mêmes mots, les ancres de l'épisode restent valables.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

function estimer(texte, debit = 2.7) {
  const mots = []; const silences = [[0, 0.3]];
  let t = 0.3;
  // « Un : la » → le deux-points se colle au mot précédent, comme dans une transcription.
  const jetons = texte.replace(/\s+([:;?!])/g, '\u00a0$1').split(/[ \t\r\n]+/).filter(Boolean);
  jetons.forEach((m) => {
    const duree = (0.5 + 0.1 * m.replace(/[^\p{L}]/gu, '').length) / (debit / 2.7) * 0.37;
    mots.push({ m, d: +t.toFixed(2), f: +(t + duree).toFixed(2) });
    t += duree;
    const pause = /[.?!]$/.test(m) ? 0.45 : /[,:;]$/.test(m) ? 0.22 : 0;
    if (pause) { silences.push([+t.toFixed(2), +(t + pause).toFixed(2)]); t += pause; }
  });
  silences[silences.length - 1][1] = +(t + 0.3).toFixed(2);
  return { duree: +(t + 0.3).toFixed(2), maquette: true, mots, silences };
}

if (require.main === module) {
  const [id, debit] = process.argv.slice(2);
  if (!id) { console.error('Usage : node scripts/maquette-voix.js <id> [mots par seconde]'); process.exit(1); }
  const dossier = path.join(__dirname, '../videos/voix', id);
  const v = estimer(fs.readFileSync(path.join(dossier, 'script.txt'), 'utf8'), +debit || 2.7);
  fs.writeFileSync(path.join(dossier, 'mots.json'), `{\n "duree": ${v.duree},\n "maquette": true,\n "mots": [\n  ${v.mots.map((m) => JSON.stringify(m)).join(',\n  ')}\n ],\n "silences": ${JSON.stringify(v.silences)}\n}\n`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=mono', '-t', String(v.duree), path.join(dossier, 'propre.flac')]);
  console.log(`${id} : maquette de ${v.duree} s, ${v.mots.length} mots (voix muette)`);
}
module.exports = { estimer };
