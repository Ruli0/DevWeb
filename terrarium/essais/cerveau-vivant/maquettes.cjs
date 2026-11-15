// Étape 1 du « cerveau vivant » : trois rendus du réseau, en image fixe, sur l'état « alarme ».
// Usage : NODE_PATH=$(npm root -g) node essais/cerveau-vivant/maquettes.cjs [sortie-dir]
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { generer, ZONES } = require('../../studio/reseau/modele.js');
const S = require('../../studio/style.js');

const SORTIE = path.resolve(process.argv[2] || path.join(__dirname, 'sortie'));
fs.mkdirSync(SORTIE, { recursive: true });
const R = (f) => fs.readFileSync(path.join(__dirname, '../../studio', f), 'utf8');
const police = (f) => 'file://' + path.join(__dirname, '../../studio/polices', f);
const modele = generer();
const ETAT = {
  cam: { cx: 425, cy: 215, zoom: 1.28, rot: 0.1 },
  act: { amygdale: 1, insula: 0.55, cortex: 0.12, pfc: 0.18, striatum: 0.2, hippocampe: 0.3, cervelet: 0.05 },
  decharges: 1,
  couleurs: { base: '#5f7d99', froid: '#8fc4ea', chaud: '#ff7a4d', ambre: '#e8a23c' },
};
const RENDUS = { constellation: 'R1 Constellation', bioluminescent: 'R2 Bioluminescent', donnees: 'R3 Données' };
const c = S.couleurs;

const page = (rendu) => `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'SG';font-weight:500;src:url(${police('space-grotesk-latin-500-normal.woff2')})}
@font-face{font-family:'SG';font-weight:700;src:url(${police('space-grotesk-latin-700-normal.woff2')})}
@font-face{font-family:'JM';src:url(${police('jetbrains-mono-latin-400-normal.woff2')})}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;color:${c.texte};font-family:SG;background:radial-gradient(90% 60% at 45% 48%, #101824, #06090d 75%)}
${rendu === 'donnees' ? `.points{position:absolute;inset:0;background-image:radial-gradient(${c.texte}26 1.6px, transparent 1.8px);background-size:40px 40px}` : ''}
canvas{position:absolute;left:0;top:0}
.tete{position:absolute;top:170px;left:80px;right:80px;display:flex;justify-content:space-between;font:400 28px JM;letter-spacing:.06em;opacity:.5}
.ph{position:absolute;top:270px;left:80px;width:900px;font:500 92px/1.04 SG;letter-spacing:-.015em}
.ph em{font-style:normal;color:#ff7a4d}
.etiq{position:absolute;font:400 30px JM;color:#ffb39a;white-space:nowrap}
.etiq::before{content:'';position:absolute;left:-90px;top:18px;width:80px;height:1.5px;background:#ffb39a80}
.src{position:absolute;top:1400px;left:80px;font:400 28px JM;opacity:.55}
.marque{position:absolute;bottom:60px;left:80px;font:400 26px JM;opacity:.3}
</style></head><body>${rendu === 'donnees' ? '<div class="points"></div>' : ''}<canvas id="c" width="1080" height="1920"></canvas>
<div class="tete"><span>CERVEAU · 45 s</span><span>N° 01 — PROCRASTINATION</span></div>
<p class="ph">Une tâche pénible ? Ton cerveau sonne l’<em>alarme</em>.</p>
<div class="etiq" id="etiq">amygdale</div>
<div class="src">— schéma simplifié</div>
<div class="marque">maquette ${RENDUS[rendu].toLowerCase()}</div>
<script>${R('dessins/cerveau.js')}${R('reseau/dessin.js')}
const m=${JSON.stringify(modele)}, etat=${JSON.stringify(ETAT)}, Z=${JSON.stringify(ZONES)};
document.fonts.ready.then(()=>{const ctx=document.getElementById('c').getContext('2d');
const t0=performance.now();Terrarium.reseauDessin.dessiner(ctx,m,etat,2.3,'${rendu}');window.__ms=performance.now()-t0;
const p=Terrarium.reseauDessin.ecranDe('amygdale',etat,Z);const e=document.getElementById('etiq');e.style.left=(p.x+150)+'px';e.style.top=(p.y+60)+'px';window.__pret=1;});
</script></body></html>`;

(async () => {
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error(e.message));
  const imgs = [];
  for (const r of Object.keys(RENDUS)) {
    const f = path.join(SORTIE, `${r}.html`); fs.writeFileSync(f, page(r));
    await p.goto('file://' + f); await p.waitForFunction(() => window.__pret);
    console.log(r, Math.round(await p.evaluate(() => window.__ms)), 'ms par image');
    const png = path.join(SORTIE, `${r}.png`); await p.screenshot({ path: png }); imgs.push(png);
  }
  await nav.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...imgs.flatMap((f) => ['-i', f]), '-filter_complex',
    imgs.map((_, i) => `[${i}]scale=540:960[s${i}]`).join(';') + ';[s0][s1][s2]hstack=3', path.join(SORTIE, 'planche.png')]);
  console.log(path.join(SORTIE, 'planche.png'));
})();
