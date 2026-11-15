// Cerveau vivant, tour 2 : test de mouvement de 8 s (rendu R1 « Constellation »), avec la musique « Labo ».
// repos → plongée vers l'amygdale → alarme et décharges → le cortex préfrontal freine → retour au large.
// Usage : NODE_PATH=$(npm root -g) node essais/cerveau-vivant/mouvement.cjs [sortie-dir]
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { generer, ZONES } = require('../../studio/reseau/modele.js');
const { outils, MUSIQUES_ARRANGEES } = require('../../scripts/build-sons.js');
const { BRUITAGES } = require('../../scripts/sons-v3.js');
const S = require('../../studio/style.js');

const SORTIE = path.resolve(process.argv[2] || path.join(__dirname, 'sortie'));
fs.mkdirSync(SORTIE, { recursive: true });
const R = (f) => fs.readFileSync(path.join(__dirname, '../../studio', f), 'utf8');
const police = (f) => 'file://' + path.join(__dirname, '../../studio/polices', f);
const GSAP = path.join(__dirname, '../../node_modules/gsap/dist');
const DUREE = 8, IPS = 60;
const c = S.couleurs;

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'SG';font-weight:500;src:url(${police('space-grotesk-latin-500-normal.woff2')})}
@font-face{font-family:'JM';src:url(${police('jetbrains-mono-latin-400-normal.woff2')})}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;color:${c.texte};font-family:SG;background:radial-gradient(90% 60% at 45% 48%, #101824, #06090d 75%)}
canvas{position:absolute;left:0;top:0}
.tete{position:absolute;top:170px;left:80px;right:80px;display:flex;justify-content:space-between;font:400 28px JM;letter-spacing:.06em;opacity:.5}
.ph{position:absolute;top:270px;left:80px;width:920px;font:500 92px/1.04 SG;letter-spacing:-.015em}
.ph em{font-style:normal}
.chaud{color:#ff7a4d}.froid{color:#8fc4ea}
.ligne{overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em}
.etiq{position:absolute;font:400 30px JM;white-space:nowrap;opacity:0}
.etiq::before{content:'';position:absolute;left:-90px;top:18px;width:80px;height:1.5px;background:currentColor;opacity:.5}
.src{position:absolute;top:1400px;left:80px;font:400 28px JM;opacity:.55}
</style></head><body><canvas id="c" width="1080" height="1920"></canvas>
<div class="tete"><span>CERVEAU · 45 s</span><span>N° 01 — PROCRASTINATION</span></div>
<p class="ph" id="p1">Une tâche pénible ?</p>
<p class="ph" id="p2">Ton cerveau sonne <span style="white-space:nowrap">l’<em class="chaud">alarme</em>.</span></p>
<p class="ph" id="p3">Le cortex préfrontal tente de <em class="froid">freiner</em>.</p>
<div class="etiq chaud" id="e-amygdale">amygdale</div>
<div class="etiq froid" id="e-pfc">cortex préfrontal</div>
<div class="src">— schéma simplifié</div>
<script src="file://${GSAP}/gsap.min.js"></script><script src="file://${GSAP}/SplitText.min.js"></script><script src="file://${GSAP}/CustomEase.min.js"></script>
<script>${R('dessins/cerveau.js')}${R('reseau/dessin.js')}
gsap.registerPlugin(SplitText, CustomEase);
const m = ${JSON.stringify(generer())}, Z = ${JSON.stringify(ZONES)};
const etat = { cam: { cx: 425, cy: 215, zoom: 1.15, rot: 0.04 },
  act: { amygdale: 0.1, insula: 0.08, cortex: 0.1, pfc: 0.1, striatum: 0.1, hippocampe: 0.1, cervelet: 0.05 }, decharges: 0,
  couleurs: { base: '#5f7d99', froid: '#8fc4ea', chaud: '#ff7a4d', ambre: '#e8a23c' } };
document.fonts.ready.then(() => {
  CustomEase.create('entree', '${S.mouvement.entree}');
  const ctx = document.getElementById('c').getContext('2d');
  const tl = gsap.timeline({ paused: true });
  const ft = (a, de, vers, t) => tl.fromTo(a, de, Object.assign({ immediateRender: false }, vers), t);
  const lignes = (id) => new SplitText('#' + id, { type: 'lines', mask: 'lines', linesClass: 'ligne' }).lines;
  const [l1, l2, l3] = ['p1', 'p2', 'p3'].map(lignes);
  gsap.set([...l1, ...l2, ...l3], { yPercent: 110 });
  const entrer = (l, t) => ft(l, { yPercent: 110 }, { yPercent: 0, duration: 1, ease: 'entree', stagger: .12 }, t);
  const sortir = (l, t) => ft(l, { yPercent: 0 }, { yPercent: -110, duration: .55, ease: 'power2.in', stagger: .06 }, t);
  const cam = (vers, t, d, ease) => ft(etat.cam, Object.assign({}, etat.cam), Object.assign({ duration: d, ease: ease || 'power2.inOut' }, vers), t);
  const zone = (vers, t, d) => ft(etat.act, Object.assign({}, etat.act), Object.assign({ duration: d, ease: 'power2.out' }, vers), t);
  // Les états de départ de chaque tween sont écrits en dur (pas de lecture de l’état courant au montage).
  entrer(l1, 0.1);
  tl.fromTo(etat.cam, { cx: 425, cy: 215, zoom: 1.15, rot: 0.04 }, { cx: 380, cy: 360, zoom: 2.1, rot: 0.16, duration: 2.6, ease: 'power2.inOut', immediateRender: false }, 1.0);
  sortir(l1, 2.4);
  entrer(l2, 2.9);
  tl.fromTo(etat.act, { amygdale: 0.1, insula: 0.08 }, { amygdale: 1, insula: 0.55, duration: 0.9, ease: 'power2.out', immediateRender: false }, 2.8);
  tl.fromTo(etat, { decharges: 0 }, { decharges: 1, duration: 0.6, immediateRender: false }, 2.9);
  tl.fromTo('#e-amygdale', { opacity: 0 }, { opacity: 1, duration: .6, immediateRender: false }, 3.3);
  // Le frein : on recule, le cortex préfrontal s’allume, l’alarme baisse.
  sortir(l2, 4.6);
  tl.fromTo('#e-amygdale', { opacity: 1 }, { opacity: 0, duration: .4, immediateRender: false }, 4.6);
  tl.fromTo(etat.cam, { cx: 380, cy: 360, zoom: 2.1, rot: 0.16 }, { cx: 330, cy: 260, zoom: 1.55, rot: 0.1, duration: 1.6, ease: 'power2.inOut', immediateRender: false }, 4.6);
  entrer(l3, 5.0);
  tl.fromTo(etat.act, { pfc: 0.1, amygdale: 1, insula: 0.55 }, { pfc: 0.95, amygdale: 0.4, insula: 0.2, duration: 1.2, ease: 'power2.out', immediateRender: false }, 5.0);
  tl.fromTo('#e-pfc', { opacity: 0 }, { opacity: 1, duration: .6, immediateRender: false }, 5.6);
  // Retour au large, tout se calme.
  tl.fromTo(etat.cam, { cx: 330, cy: 260, zoom: 1.55, rot: 0.1 }, { cx: 425, cy: 215, zoom: 1.15, rot: 0.04, duration: 1.4, ease: 'power2.inOut', immediateRender: false }, 6.6);
  tl.fromTo(etat.act, { pfc: 0.95, amygdale: 0.4, insula: 0.2 }, { pfc: 0.1, amygdale: 0.1, insula: 0.08, duration: 1.2, ease: 'power2.inOut', immediateRender: false }, 6.7);
  tl.fromTo(etat, { decharges: 1 }, { decharges: 0, duration: 1, immediateRender: false }, 6.8);
  tl.fromTo('#e-pfc', { opacity: 1 }, { opacity: 0, duration: .4, immediateRender: false }, 6.6);
  sortir(l3, 7.3);
  tl.set({}, {}, ${DUREE});
  const eA = document.getElementById('e-amygdale'), eP = document.getElementById('e-pfc');
  tl.eventCallback('onUpdate', () => {
    Terrarium.reseauDessin.dessiner(ctx, m, etat, tl.time(), 'constellation');
    const a = Terrarium.reseauDessin.ecranDe('amygdale', etat, Z), p = Terrarium.reseauDessin.ecranDe('pfc', etat, Z);
    eA.style.left = (a.x + 150) + 'px'; eA.style.top = (a.y + 100) + 'px';
    eP.style.left = (p.x + 300) + 'px'; eP.style.top = (p.y - 300) + 'px';
  });
  tl.seek(0.001); tl.seek(0);
  window.__tl = tl; window.__pret = true;
});
</script></body></html>`;

(async () => {
  // Le son : « Labo » arrangée sur 3 mesures, et les bruitages calés sur les temps forts.
  const { FREQ, tampon, normaliser, ecrireWav } = outils;
  const musique = normaliser(MUSIQUES_ARRANGEES.labo({ duree: DUREE, parties: ['intro', 'montee', 'plein'], coupures: [2.3], coupure: 0.45 }), 0.89);
  const b = tampon(DUREE);
  for (let i = 0; i < b.length; i += 1) b[i] = 0.55 * musique[i];
  for (const [n, t, v] of [['souffle.wav', 0.1, 0.4], ['impact.wav', 2.8, 0.6], ['souffle.wav', 2.9, 0.35], ['tic.wav', 3.3, 0.3], ['souffle.wav', 5.0, 0.35], ['tic.wav', 5.6, 0.3], ['souffle.wav', 6.6, 0.3]]) {
    const s = normaliser(BRUITAGES[n](), 0.89), i0 = Math.round(t * FREQ);
    for (let i = 0; i < s.length && i0 + i < b.length; i += 1) b[i0 + i] += v * s[i];
  }
  normaliser(b, 1);
  for (let i = 0; i < b.length; i += 1) b[i] = (0.85 * Math.tanh(2.2 * b[i])) / Math.tanh(2.2);
  const wav = path.join(SORTIE, 'son.wav'); ecrireWav(wav, b, true);

  const fichier = path.join(SORTIE, 'mouvement.html');
  fs.writeFileSync(fichier, html);
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('page :', e.message));
  await p.goto('file://' + fichier);
  await p.waitForFunction(() => !!window.__pret);
  const mp4 = path.join(SORTIE, 'mouvement.mp4');
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(IPS), '-i', '-', '-i', wav,
    '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-c:a', 'aac', '-b:a', '192k', '-shortest', mp4], { stdio: ['pipe', 'inherit', 'inherit'] });
  const n = Math.round(DUREE * IPS);
  for (let i = 0; i < n; i++) {
    await p.evaluate((t) => { window.__tl.seek(t, false); return true; }, i / IPS);
    const img = await p.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(img)) await new Promise((r) => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await nav.close();
  const imgs = [0.5, 2.0, 3.6, 4.4, 5.8, 7.0].map((t, i) => { const f = path.join(SORTIE, `k${i}.png`); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=270:480', f]); return f; });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...imgs.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${imgs.length}`, path.join(SORTIE, 'planche.png')]);
  console.log(mp4);
})();
