// La commande unique du studio.
//   npm run video -- <id>             compile videos/episodes/<id>.json, écrit la composition, fait la planche d'aperçu
//   npm run video -- <id> --rendu     … puis le rendu MP4 en 60 images par seconde
//   npm run video -- <id> --brouillon … rendu rapide (30 images par seconde, qualité brouillon)
// Sortie : videos/studio/<id>/ (index.html, feuille.json, apercu.png, <id>.mp4)
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execSync, spawnSync } = require('node:child_process');
const { compiler } = require('../studio/compiler.js');
const page = require('../studio/page.js');

const RACINE = path.join(__dirname, '..');
const [id] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const option = (o) => process.argv.includes(o);
if (!id) { console.error('Usage : npm run video -- <id> [--rendu | --brouillon] [--sans-apercu]'); process.exit(1); }

const source = path.join(RACINE, 'videos/episodes', `${id}.json`);
const episode = JSON.parse(fs.readFileSync(source, 'utf8'));
const V3 = episode.version === 3;
let erreurs; let feuille;
if (V3) {
  // Chaîne V3 : scènes, fiche de sources obligatoire.
  const ficheChemin = path.join(RACINE, 'videos/episodes', `${id}.sources.json`);
  const fiche = fs.existsSync(ficheChemin) ? JSON.parse(fs.readFileSync(ficheChemin, 'utf8')) : null;
  ({ erreurs, feuille } = require('../studio/montage.js').montage(episode, fiche));
  if (!erreurs.length && (option('--rendu')) && feuille.statutSources !== 'verifie') erreurs.push(`la fiche de sources a le statut « ${feuille.statutSources} » : le rendu final demande « verifie » (voir production/SOURCES.md). Pour un essai : --brouillon`);
} else ({ erreurs, feuille } = compiler(episode));
if (erreurs.length) { console.error(`${id}.json :\n  - ${erreurs.join('\n  - ')}`); process.exit(1); }
const dossier = path.join(RACINE, 'videos/studio', id);
if (V3) require('../studio/page-v3.js').ecrire(feuille, dossier); else page.ecrire(feuille, dossier);
console.log(V3 ? `Composition écrite : videos/studio/${id}/ (${feuille.duree} s, ${feuille.scenes.length} scènes, ${feuille.sons.length} sons, sources : ${feuille.statutSources})`
  : `Composition écrite : videos/studio/${id}/ (${feuille.duree} s, ${feuille.ordres.length} gestes, ${feuille.sons.length} sons)`);

if (!option('--sans-apercu')) {
  // V3 : une image par scène, à 70 % de sa durée. Ancienne chaîne : une image par plan de caméra.
  const instants = V3 ? feuille.scenes.map((s) => +(s.t0 + 0.7 * s.d).toFixed(2))
    : feuille.camera.filter((k) => k.ease !== 'none').map((k) => +Math.min(feuille.duree - 0.05, k.t + k.duree + 0.5).toFixed(2));
  const globaux = execSync('npm root -g').toString().trim();
  const r = spawnSync('node', [path.join(RACINE, 'scripts/apercu.js'), path.join(dossier, 'index.html'), path.join(dossier, 'apercu.png'), ...instants.map(String)], { stdio: 'inherit', env: { ...process.env, NODE_PATH: globaux } });
  if (r.status) process.exit(r.status);
}

if (option('--rendu') || option('--brouillon')) {
  const navigateur = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
  const env = { ...process.env };
  if (!env.HYPERFRAMES_BROWSER_PATH && fs.existsSync(navigateur)) env.HYPERFRAMES_BROWSER_PATH = navigateur;
  const args = ['--yes', 'hyperframes', 'render', '--workers', '3', '--quiet', '-o', `${id}.mp4`];
  if (option('--brouillon')) args.push('--fps', '30', '--quality', 'draft'); else args.push('--fps', '60');
  const r = spawnSync('npx', args, { cwd: dossier, stdio: 'inherit', env });
  if (r.status) process.exit(r.status);
  console.log(`Vidéo : videos/studio/${id}/${id}.mp4`);
}
