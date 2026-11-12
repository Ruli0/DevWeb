// Vérifie chaque composition vidéo dans un vrai navigateur (Playwright requis) :
//   node scripts/verifier-videos.js            -> toutes les compositions de videos/hyperframes/
//   node scripts/verifier-videos.js cameleon   -> une seule
// Pour chaque morceau de légende, chaque carte et chaque sujet filmé, à l'instant où il est à l'écran :
//   - il reste dans la zone sûre TikTok (shared/scenarios.js, ZONE_SURE) ;
//   - une légende tient en 2 lignes au plus.
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const { ZONE_SURE } = require('../shared/scenarios.js');

const dossier = path.join(__dirname, '../videos/hyperframes');
const demandes = process.argv.slice(2);
const ids = fs.readdirSync(dossier).filter((d) => fs.existsSync(path.join(dossier, d, 'index.html')))
  .filter((d) => !demandes.length || demandes.includes(d));

(async () => {
  const navigateur = await chromium.launch();
  let problemes = 0;
  for (const id of ids) {
    const page = await navigateur.newPage({ viewport: { width: 1080, height: 1920 } });
    const erreurs = [];
    page.on('pageerror', (e) => erreurs.push(e.message));
    await page.goto('file://' + path.join(dossier, id, 'index.html'));
    await page.waitForFunction((i) => Boolean(window.__timelines && window.__timelines[i]), id);
    const constats = await page.evaluate(({ id, Z }) => {
      const tl = window.__timelines[id];
      const sortie = [];
      const montrer = (t) => {
        tl.seek(t, false);
        document.querySelectorAll('.clip').forEach((c) => {
          const s = +c.dataset.start; const d = +(c.dataset.duration || 1e9);
          c.style.visibility = t >= s && t < s + d ? 'visible' : 'hidden';
        });
      };
      const dedans = (r) => r.left >= Z.x0 - 1 && r.right <= Z.x1 + 1 && r.top >= Z.y0 - 1 && r.bottom <= Z.y1 + 1;
      document.querySelectorAll('.clip.legende, .clip.carte').forEach((c) => {
        const t = +c.dataset.start + Math.min(0.3, +c.dataset.duration / 2);
        montrer(t);
        const el = c.querySelector('.leg-texte, .carte-in');
        const r = el.getBoundingClientRect();
        if (!dedans(r)) sortie.push(`${t.toFixed(2)} s : « ${el.textContent.trim().slice(0, 40)} » sort de la zone sûre (${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)})`);
        if (el.classList.contains('leg-texte')) {
          const lignes = Math.round(r.height / parseFloat(getComputedStyle(el).lineHeight));
          if (lignes > 2) sortie.push(`${t.toFixed(2)} s : « ${el.textContent.trim()} » fait ${lignes} lignes`);
        }
      });
      return sortie;
    }, { id, Z: ZONE_SURE });
    // Le sujet de chaque plan, une fois la caméra arrivée.
    const sc = JSON.parse(await page.evaluate(() => document.scripts[document.scripts.length - 1].textContent.match(/var scenario = (\{.*\});/)[1]));
    for (const plan of sc.plans) {
      if (!plan.camera) continue;
      const t = Math.min(plan.fin - 0.05, plan.debut + (plan.camera.duree ?? 0.9) + 0.05);
      const point = await page.evaluate(({ id, t, cible }) => {
        window.__timelines[id].seek(t, false);
        const svg = document.getElementById('vivarium');
        const T = window.Terrarium.film;
        let xy = Array.isArray(cible) ? cible : T.CIBLES[cible];
        if (!xy) {
          const corps = document.getElementById('cam-corps');
          const m = corps.getScreenCTM();
          const p = new DOMPoint(cible === 'cameleon-oeil' ? 46 : 6, cible === 'cameleon-oeil' ? -36 : -28).matrixTransform(m);
          return [p.x, p.y];
        }
        const p = new DOMPoint(xy[0], xy[1]).matrixTransform(svg.getScreenCTM());
        return [p.x, p.y];
      }, { id, t, cible: plan.camera.cible || 'ensemble' });
      const [x, y] = point;
      if (x < ZONE_SURE.x0 || x > ZONE_SURE.x1 || y < ZONE_SURE.y0 || y > ZONE_SURE.y1) {
        constats.push(`${t.toFixed(2)} s : le sujet « ${plan.camera.cible} » tombe hors de la zone sûre (${Math.round(x)}, ${Math.round(y)})`);
      }
    }
    if (erreurs.length) constats.push(...erreurs.map((e) => 'erreur JavaScript : ' + e));
    problemes += constats.length;
    console.log(constats.length ? `✗ ${id}\n  - ${constats.join('\n  - ')}` : `✓ ${id}`);
    await page.close();
  }
  await navigateur.close();
  process.exit(problemes ? 1 : 0);
})();
