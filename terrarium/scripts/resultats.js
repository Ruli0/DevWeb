// Résumé des chiffres relevés après publication (videos/resultats.csv) : une ligne par vidéo, regroupée par version (voix, muet, avis…).
//   node scripts/resultats.js
// À remplir à la main 48 heures après chaque publication (voir production/PLAN-PUBLICATION.md) ; ce script ne fait que résumer.
'use strict';
const fs = require('node:fs');
const path = require('node:path');

function lireCsv(texte) {
  const [tete, ...lignes] = texte.trim().split(/\r?\n/);
  const cles = tete.split(',');
  return lignes.filter(Boolean).map((l) => Object.fromEntries(l.split(',').map((v, i) => [cles[i], v.trim()])));
}
const nombre = (x) => (x === '' || x === undefined || Number.isNaN(+x) ? null : +x);
const moyenne = (a) => (a.length ? a.reduce((s, v) => s + v, 0) / a.length : null);

function resumer(lignes) {
  const groupes = {};
  lignes.forEach((l) => { (groupes[l.version || '?'] = groupes[l.version || '?'] || []).push(l); });
  return Object.entries(groupes).map(([version, ls]) => ({
    version, videos: ls.length,
    vues: moyenne(ls.map((l) => nombre(l.vues)).filter((x) => x != null)),
    retention3s: moyenne(ls.map((l) => nombre(l.retention_3s_pct)).filter((x) => x != null)),
    complet: moyenne(ls.map((l) => nombre(l.visionnage_complet_pct)).filter((x) => x != null)),
    commentaires: moyenne(ls.map((l) => nombre(l.commentaires)).filter((x) => x != null)),
  }));
}

module.exports = { lireCsv, resumer };

if (require.main === module) {
  const f = path.join(__dirname, '..', 'videos', 'resultats.csv');
  const lignes = lireCsv(fs.readFileSync(f, 'utf8'));
  if (!lignes.length) { console.log('Aucun chiffre relevé : publie une vidéo, puis ajoute une ligne à videos/resultats.csv 48 h plus tard.'); process.exit(0); }
  const fmt = (x) => (x == null ? '—' : x.toFixed(1));
  console.log('version      vidéos  vues  rétention 3 s (%)  visionnage complet (%)  commentaires');
  resumer(lignes).forEach((r) => console.log(`${r.version.padEnd(12)} ${String(r.videos).padStart(6)}  ${fmt(r.vues).padStart(4)}  ${fmt(r.retention3s).padStart(17)}  ${fmt(r.complet).padStart(22)}  ${fmt(r.commentaires).padStart(12)}`));
}
