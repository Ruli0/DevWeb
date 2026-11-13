// Planche d'aperçu d'une vidéo, sans rendu : quelques secondes au lieu de plusieurs minutes.
//   NODE_PATH=$(npm root -g) node scripts/apercu.js <id> <sortie.png> [t1 t2 …]
// Sans instants donnés : le milieu de chaque plan du scénario.
// Utilise Playwright (installé globalement) et ffmpeg.
const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const { chromium } = require('playwright');

(async () => {
  const [id, sortie, ...donnes] = process.argv.slice(2);
  if (!id || !sortie) { console.error('Usage : node scripts/apercu.js <id> <sortie.png> [t1 t2 …]'); process.exit(1); }
  const racine = path.join(__dirname, '..');
  const html = path.join(racine, 'videos/hyperframes', id, 'index.html');
  const base = id.replace(/-[b-z]$/, '');
  const sc = JSON.parse(fs.readFileSync(path.join(racine, 'videos/scenarios', `${base}.json`), 'utf8'));
  const temps = donnes.length ? donnes.map(Number) : sc.plans.map((p) => +((p.debut + p.fin) / 2).toFixed(2));

  const navigateur = await chromium.launch();
  const page = await navigateur.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', (e) => console.log('Erreur dans la page :', e.message));
  await page.goto('file://' + html);
  // Ne jamais renvoyer la timeline elle-même : la sérialiser bloque le script.
  await page.waitForFunction(() => !!(window.__timelines && Object.keys(window.__timelines).length), null, { timeout: 8000 });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const images = [];
  for (const [i, t] of temps.entries()) {
    await page.evaluate((instant) => {
      Object.values(window.__timelines)[0].seek(instant, false);
      // Au rendu, HyperFrames affiche chaque clip pendant sa plage : ici, on le fait à la main.
      document.querySelectorAll('.clip').forEach((c) => {
        const debut = +c.dataset.start; const duree = +c.dataset.duration;
        c.style.display = instant >= debut && instant < debut + duree ? '' : 'none';
      });
    }, t);
    const f = sortie.replace(/\.png$/, `-${i}.png`);
    images.push(f);
    await page.screenshot({ path: f });
  }
  await navigateur.close();

  const colonnes = Math.min(6, images.length);
  const entrees = images.map((f) => `-i "${f}"`).join(' ');
  const echelles = images.map((_, i) => `[${i}:v]scale=360:640[v${i}]`).join(';');
  const grille = images.map((_, i) => `${(i % colonnes) * 360}_${Math.floor(i / colonnes) * 640}`).join('|');
  const filtre = images.length === 1 ? '[0:v]scale=360:640' : `${echelles};${images.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${images.length}:layout=${grille}:fill=black`;
  execSync(`ffmpeg -v error -y ${entrees} -filter_complex "${filtre}" "${sortie}"`);
  images.forEach((f) => fs.unlinkSync(f));
  console.log(`Planche écrite : ${sortie} (${temps.join(' s, ')} s)`);
})();
