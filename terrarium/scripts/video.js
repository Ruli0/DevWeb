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
const { erreurs, feuille } = compiler(JSON.parse(fs.readFileSync(source, 'utf8')));
if (erreurs.length) { console.error(`${id}.json :\n  - ${erreurs.join('\n  - ')}`); process.exit(1); }
const dossier = path.join(RACINE, 'videos/studio', id);
page.ecrire(feuille, dossier);
console.log(`Composition écrite : videos/studio/${id}/ (${feuille.duree} s, ${feuille.ordres.length} gestes, ${feuille.sons.length} sons)`);

if (!option('--sans-apercu')) {
  // Une image par plan de caméra, quand la caméra est arrivée.
  const instants = feuille.camera.filter((k) => k.ease !== 'none').map((k) => +Math.min(feuille.duree - 0.05, k.t + k.duree + 0.5).toFixed(2));
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
