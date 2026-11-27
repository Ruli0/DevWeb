// Aperçu du fond 3D « chemin » sans passer par la vidéo : rend le fond aux temps T donnés (temps global) et écrit une planche.
//   node scripts/apercu-chemin.js <sortie.png> [--res=720x1280] T1 T2 …
// Charge three.min.js, chemin3d.js et, s'ils existent, biomes3d-a.js, biomes3d-b.js, chateau3d.js. Affiche le temps de rendu par image.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
(async () => {
  const args = process.argv.slice(2), sortie = args[0], res = (args.find((a) => a.startsWith('--res=')) || '--res=720x1280').slice(6).split('x').map(Number);
  const temps = args.slice(1).filter((a) => !a.startsWith('--')).map(Number);
  const R = path.join(__dirname, '..');
  const navigateur = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await navigateur.newPage({ viewport: { width: res[0], height: res[1] } });
  page.on('pageerror', (e) => console.error('ERREUR PAGE', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('console', m.text()); });
  await page.setContent(`<body style="margin:0"><canvas id="c" width="${res[0]}" height="${res[1]}"></canvas></body>`);
  await page.addScriptTag({ path: path.join(R, 'node_modules/three/build/three.min.js') });
  await page.evaluate(() => { window.Avis = {}; });
  for (const f of ['fond3d.js', 'biomes3d-a.js', 'biomes3d-b.js', 'chateau3d.js', 'chemin3d.js']) if (fs.existsSync(path.join(R, 'studio/avis', f))) await page.addScriptTag({ path: path.join(R, 'studio/avis', f) });
  const L = 38.89;
  await page.evaluate(({ L }) => { window.sc = window.Avis.chemin.creer(document.getElementById('c'), L, { t0: 0 }); }, { L });
  const imgs = [];
  for (const T of temps) {
    const t0 = Date.now();
    await page.evaluate((T) => window.sc.maj(T), T);
    const ms = Date.now() - t0;
    const b64 = await page.evaluate(() => document.getElementById('c').toDataURL('image/png').split(',')[1]);
    const f = sortie.replace(/\.png$/, `-${T}.png`); fs.writeFileSync(f, Buffer.from(b64, 'base64')); imgs.push(f);
    console.log(`T=${T} : ${ms} ms`);
  }
  await navigateur.close();
  const cols = Math.min(6, imgs.length), ent = imgs.map((f) => `-i "${f}"`).join(' ');
  const ech = imgs.map((_, i) => `[${i}:v]scale=360:-1[v${i}]`).join(';'), lay = imgs.map((_, i) => `${(i % cols) * 360}_${Math.floor(i / cols) * 640}`).join('|');
  execSync(`ffmpeg -v error -y ${ent} -filter_complex "${ech};${imgs.map((_, i) => `[v${i}]`).join('')}xstack=inputs=${imgs.length}:layout=${lay}:fill=black" "${sortie}"`);
  console.log('Planche :', sortie);
})();
