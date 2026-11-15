// Étape 1 du plan V3 : test de mouvement (variante V3 « Laboratoire »).
// Le chiffre compte, le texte sort par lignes, le filet d'accent se transforme en cerveau,
// les sillons se dessinent, le cortex préfrontal s'allume, l'amygdale pulse.
// Usage : NODE_PATH=$(npm root -g) node essais/style-v3/mouvement.cjs [sortie-dir]
// Rendu image par image (timeline en pause, seek), encodé en MP4 60 i/s avec ffmpeg.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const { VARIANTES, FONTES, CERVEAU, grain } = require('./maquettes.cjs');

const SORTIE = path.resolve(process.argv[2] || path.join(__dirname, 'sortie'));
fs.mkdirSync(SORTIE, { recursive: true });
const GSAP = path.join(__dirname, '..', '..', 'node_modules', 'gsap', 'dist');
const v = VARIANTES.v3;
const DUREE = 6.4;
const IPS = 60;

// Repère du cerveau → écran : origine (SX, SY), échelle K.
const K = 1.1, SX = 50, SY = 700;
const loc = (x, y) => [((x - SX) / K).toFixed(1), ((y - SY) / K).toFixed(1)];
// Le filet sous le chiffre (écran : x 80→260, y 1012), exprimé dans le repère du cerveau.
const [fx1, fy] = loc(80, 1012), [fx2] = loc(260, 1012);
const FILET = `M${fx1} ${fy} C${fx1} ${fy - 1} ${fx2} ${fy - 1} ${fx2} ${fy} C${fx2} ${fy + 1} ${fx1} ${fy + 1} ${fx1} ${fy} Z`;
const A = CERVEAU.amygdale;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>${FONTES}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;color:${v.texte};font-family:'Space Grotesk';
  background:radial-gradient(120% 80% at 30% 35%, ${v.fond2}, ${v.fond} 70%)}
.points{position:absolute;inset:0;background-image:radial-gradient(${v.texte}22 1.6px, transparent 1.8px);background-size:40px 40px}
.grain{position:absolute;inset:0;mix-blend-mode:overlay}
#scene{position:absolute;inset:0;transform-origin:540px 900px}
.tete{position:absolute;top:170px;left:80px;right:80px;display:flex;justify-content:space-between;font:400 28px 'JetBrains Mono';letter-spacing:.06em;opacity:.55}
.bloc{position:absolute;top:470px;left:80px;width:900px}
.kicker{font:500 84px/1 'Space Grotesk';opacity:.8}
.chiffre{margin:10px 0 0 -14px;font:700 440px/.86 'Space Grotesk';letter-spacing:-.05em;font-variant-numeric:tabular-nums;display:flex}
.chiffre .pc{font-size:210px;color:${v.accent};margin-left:10px;letter-spacing:0;line-height:1}
.legende{position:absolute;top:1050px;left:80px;width:880px;font:500 78px/1.05 'Space Grotesk'}
.legende em{font-style:normal;color:${v.accent}}
.source{position:absolute;font:400 28px 'JetBrains Mono';opacity:.6;letter-spacing:.02em;white-space:nowrap;left:80px}
.source::before{content:'';display:inline-block;width:28px;height:2px;background:currentColor;vertical-align:middle;margin-right:14px}
.phrase{position:absolute;top:270px;left:80px;width:900px;font:500 96px/1.04 'Space Grotesk';letter-spacing:-.015em}
.phrase em{font-style:normal;color:${v.accent}}
.etiq{position:absolute;display:flex;flex-direction:column;gap:6px}
.etiq b{font:600 38px 'Space Grotesk';color:${v.accent}}
.etiq span{font:400 28px 'JetBrains Mono';opacity:.6}
.ligne{overflow:hidden;padding-bottom:.08em}
svg{position:absolute;left:0;top:0;overflow:visible}
</style></head><body>
<div class="points"></div>
<div id="scene">
  <div class="tete"><span>CERVEAU · 45 s</span><span>N° 01 — PROCRASTINATION</span></div>
  <div class="bloc"><div class="kicker" id="kicker">jusqu’à</div>
    <div class="chiffre" id="chiffre"><span id="compte">0</span><span class="pc" id="pc">%</span></div></div>
  <p class="legende" id="legende">des étudiants disent <em>repousser</em> des tâches importantes.</p>
  <div class="source" id="src1" style="top:1352px">Steel, 2007 · Psychological Bulletin</div>
  <p class="phrase" id="phrase">Ce n’est pas de la paresse. C’est une <em>alarme</em>.</p>
  <svg width="1080" height="1920"><defs>
    <radialGradient id="halo"><stop offset="0" stop-color="${v.accent}" stop-opacity=".32"/><stop offset="1" stop-color="${v.accent}" stop-opacity="0"/></radialGradient>
    <radialGradient id="zone" cx="210" cy="230" r="190" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${v.accent}" stop-opacity=".55"/><stop offset=".6" stop-color="${v.accent}" stop-opacity=".22"/><stop offset="1" stop-color="${v.accent}" stop-opacity="0"/></radialGradient>
    <clipPath id="dans"><path d="${CERVEAU.contour}"/></clipPath>
    <clipPath id="avant"><rect x="0" y="0" width="330" height="390"/></clipPath>
  </defs>
  <g transform="translate(${SX} ${SY}) scale(${K})" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <g id="lueur" opacity="0"><ellipse cx="240" cy="230" rx="220" ry="190" fill="url(#halo)"/><path d="${CERVEAU.contour}" fill="url(#zone)"/></g>
    <path id="contour" d="${FILET}" stroke="${v.accent}" stroke-width="2.6"/>
    <path id="bordPFC" d="${CERVEAU.contour}" stroke="${v.accent}" stroke-width="2.8" clip-path="url(#avant)" opacity="0"/>
    <g stroke="${v.texte}">
      <path class="trace" d="${CERVEAU.cervelet}" stroke-opacity=".5" stroke-width="2"/>
      ${CERVEAU.cerveletPlis.map((d) => `<path class="trace" d="${d}" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}
      <path class="trace" d="${CERVEAU.tronc}" stroke-opacity=".45" stroke-width="2"/>
      <g clip-path="url(#dans)">${CERVEAU.sillons.map((d) => `<path class="trace sillon" d="${d}" stroke-opacity=".22" stroke-width="1.5"/>`).join('')}</g>
    </g>
    <path class="trace" d="${CERVEAU.striatum}" stroke="${v.texte}" stroke-opacity=".4" stroke-width="1.6" stroke-dasharray="5 6" id="striatum" opacity="0"/>
    <g id="amyg" transform="translate(${A.x} ${A.y})">
      <circle r="110" fill="url(#halo)" opacity=".7" id="amygHalo"/>
      <circle r="34" stroke="${v.accent}" stroke-opacity=".5" stroke-width="1.6" class="onde"/>
      <circle r="52" stroke="${v.accent}" stroke-opacity=".25" stroke-width="1.4" class="onde"/>
      <circle r="19" fill="${v.accent}" id="amygPoint"/>
    </g>
    <path id="lien" d="M338 398 C306 360 286 330 262 284" stroke="${v.accent}" stroke-width="2.2" stroke-dasharray="2 10"/>
    <circle id="signal" r="7" fill="${v.accent}" cx="0" cy="0"/>
    <path id="renvoi1" d="M184 -78 L184 150" stroke="${v.texte}" stroke-opacity=".45" stroke-width="1.4"/>
    <path id="renvoi2" d="M${A.x} 520 L${A.x} ${A.y + 54}" stroke="${v.texte}" stroke-opacity=".45" stroke-width="1.4"/>
  </g></svg>
  <div class="etiq" id="etiq1" style="left:${SX + 194 * K}px;top:${SY - 92 * K}px"><b>Cortex préfrontal</b><span>le frein</span></div>
  <div class="etiq" id="etiq2" style="left:${SX + (A.x - 8) * K}px;top:${SY + 528 * K}px"><b>Amygdale</b><span>l’alarme</span></div>
  <div class="source" id="src2" style="top:1388px">schéma simplifié</div>
</div>
${grain(0.12)}
<script src="file://${GSAP}/gsap.min.js"></script>
<script src="file://${GSAP}/SplitText.min.js"></script>
<script src="file://${GSAP}/DrawSVGPlugin.min.js"></script>
<script src="file://${GSAP}/MorphSVGPlugin.min.js"></script>
<script src="file://${GSAP}/CustomEase.min.js"></script>
<script>
gsap.registerPlugin(SplitText, DrawSVGPlugin, MorphSVGPlugin, CustomEase);
document.fonts.ready.then(() => {
  const entree = CustomEase.create('entree', 'M0,0 C0.16,1 0.3,1 1,1');
  const tl = gsap.timeline({ paused: true });
  const ft = (cible, de, a, t) => tl.fromTo(cible, de, Object.assign({ immediateRender: false }, a), t);
  const lignes = (el) => new SplitText(el, { type: 'lines', mask: 'lines', linesClass: 'ligne' }).lines;
  const lk = lignes('#kicker'), ll = lignes('#legende'), lp = lignes('#phrase');
  gsap.set([...lp], { yPercent: 110 });
  gsap.set(['#etiq1', '#etiq2', '#src2'], { opacity: 0, y: 20 });
  gsap.set(['#lien', '#renvoi1', '#renvoi2'], { drawSVG: '0%' });
  gsap.set('.trace', { drawSVG: '0%' });
  gsap.set('#amyg', { scale: 0, transformOrigin: '50% 50%' });
  gsap.set('#signal', { opacity: 0 });

  // Dérive lente de toute la scène.
  ft('#scene', { scale: 1 }, { scale: 1.035, duration: ${DUREE}, ease: 'none' }, 0);
  // 1. Le chiffre.
  ft(lk, { yPercent: 110 }, { yPercent: 0, duration: .7, ease: entree }, 0);
  const n = { v: 0 }, compte = document.getElementById('compte');
  ft(n, { v: 0 }, { v: 95, duration: 1.4, ease: 'power2.out', onUpdate: () => { compte.textContent = Math.round(n.v); } }, .1);
  ft('#chiffre', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: .8, ease: entree }, .1);
  ft('#pc', { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: .6, ease: entree }, .7);
  ft('#contour', { drawSVG: '0%' }, { drawSVG: '100%', duration: .8, ease: 'power2.inOut' }, .8);
  ft(ll, { yPercent: 110 }, { yPercent: 0, duration: .8, ease: entree, stagger: .09 }, 1.0);
  ft('#src1', { opacity: 0, y: 16 }, { opacity: .6, y: 0, duration: .6, ease: entree }, 1.5);
  // 2. Sortie par lignes.
  ft([...lk, '#chiffre'], { yPercent: 0, opacity: 1 }, { yPercent: -30, opacity: 0, duration: .45, ease: 'power2.in', stagger: .05 }, 2.7);
  ft(ll, { yPercent: 0 }, { yPercent: -110, duration: .45, ease: 'power2.in', stagger: .05 }, 2.75);
  ft('#src1', { opacity: .6 }, { opacity: 0, duration: .3, ease: 'power2.in' }, 2.8);
  // 3. Le filet devient le cerveau.
  ft('#contour', { morphSVG: ${JSON.stringify(FILET)}, stroke: '${v.accent}' },
    { morphSVG: ${JSON.stringify(CERVEAU.contour)}, stroke: '${v.texte}', strokeOpacity: .7, duration: 1.1, ease: 'power3.inOut', shapeIndex: 'auto' }, 3.0);
  ft(lp, { yPercent: 110 }, { yPercent: 0, duration: .8, ease: entree, stagger: .1 }, 3.2);
  ft('.trace', { drawSVG: '0%' }, { drawSVG: '100%', duration: .9, ease: 'power2.inOut', stagger: .035 }, 3.7);
  ft('#striatum', { opacity: 0 }, { opacity: 1, duration: .4 }, 4.1);
  // 4. L'amygdale s'allume, le signal monte vers le cortex préfrontal.
  ft('#amyg', { scale: 0 }, { scale: 1, duration: .6, ease: entree }, 4.3);
  ft('.onde', { scale: .6, opacity: 0 }, { scale: 1, opacity: 1, duration: .8, ease: entree, stagger: .12, transformOrigin: '50% 50%' }, 4.4);
  ft('#lien', { drawSVG: '0%' }, { drawSVG: '100%', duration: .7, ease: 'power2.inOut' }, 4.7);
  ft('#signal', { opacity: 0 }, { opacity: 1, duration: .1 }, 4.7);
  const sg = { p: 0 };
  ft(sg, { p: 0 }, { p: 1, duration: .7, ease: 'power2.inOut',
    onUpdate() { const p = sg.p, c = document.getElementById('lien'), L = c.getTotalLength(), q = c.getPointAtLength(L * p);
      document.getElementById('signal').setAttribute('cx', q.x); document.getElementById('signal').setAttribute('cy', q.y); } }, 4.7);
  ft('#lueur', { opacity: 0 }, { opacity: 1, duration: .9, ease: 'power2.out' }, 5.2);
  ft('#bordPFC', { opacity: 0 }, { opacity: 1, duration: .6 }, 5.2);
  ft('#renvoi2', { drawSVG: '0%' }, { drawSVG: '100%', duration: .4 }, 4.6);
  ft('#etiq2', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: entree }, 4.7);
  ft('#renvoi1', { drawSVG: '0%' }, { drawSVG: '100%', duration: .4 }, 5.3);
  ft('#etiq1', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, ease: entree }, 5.4);
  ft('#src2', { opacity: 0, y: 20 }, { opacity: .6, y: 0, duration: .6, ease: entree }, 5.7);
  ft('#amygPoint', { scale: 1 }, { scale: 1.25, duration: .3, ease: 'sine.inOut', yoyo: true, repeat: 3, transformOrigin: '50% 50%' }, 5.0);
  tl.seek(0);
  window.__tl = tl; window.__pret = true;
});
</script></body></html>`;

(async () => {
  const fichier = path.join(SORTIE, 'mouvement.html');
  fs.writeFileSync(fichier, html);
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('page :', e.message));
  await p.goto('file://' + fichier);
  await p.waitForFunction(() => !!window.__pret);
  const mp4 = path.join(SORTIE, 'mouvement.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(IPS), '-i', '-',
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(DUREE * IPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => { window.__tl.seek(t, false); return true; }, i / IPS);
    const img = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  // Planche de contrôle : 8 instants.
  const instants = [0.5, 1.6, 2.9, 3.4, 4.0, 4.8, 5.6, 6.3];
  const imgs = [];
  for (const [i, t] of instants.entries()) {
    await p.evaluate((x) => { window.__tl.seek(x, false); return true; }, t);
    const f = path.join(SORTIE, `m-${i}.png`); await p.screenshot({ path: f }); imgs.push(f);
  }
  await nav.close();
  const { execFileSync } = require('child_process');
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...imgs.flatMap((f) => ['-i', f]), '-filter_complex',
    imgs.map((_, i) => `[${i}]scale=270:480[s${i}]`).join(';') + ';' + imgs.map((_, i) => `[s${i}]`).join('') +
    'xstack=inputs=8:layout=0_0|270_0|540_0|810_0|0_480|270_480|540_480|810_480', path.join(SORTIE, 'mouvement-planche.png')]);
  console.log(mp4);
})();
