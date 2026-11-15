// Cerveau vivant, tour 3 : plus de participation et plus de dynamisme (12 s).
// Un mini-test (A ou B, compte à rebours), la réponse plonge dans le cerveau, puis l'appel à commenter.
// Coupes et entrées calées sur le temps (90 BPM : 0,667 s), barre de progression, zooms rapides.
// Usage : NODE_PATH=$(npm root -g) node essais/cerveau-vivant/interactif.cjs [sortie-dir]
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
const DUREE = 12, IPS = 60, B = 60 / 90;
const c = S.couleurs;
const CHAUD = '#ff7a4d', FROID = '#8fc4ea';

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'SG';font-weight:500;src:url(${police('space-grotesk-latin-500-normal.woff2')})}
@font-face{font-family:'SG';font-weight:700;src:url(${police('space-grotesk-latin-700-normal.woff2')})}
@font-face{font-family:'JM';src:url(${police('jetbrains-mono-latin-400-normal.woff2')})}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1080px;height:1920px;overflow:hidden;color:${c.texte};font-family:SG;background:radial-gradient(90% 60% at 45% 48%, #101824, #06090d 75%)}
#monde{position:absolute;inset:0;transform-origin:540px 900px}
canvas{position:absolute;left:0;top:0}
.barre{position:absolute;top:120px;left:80px;width:920px;height:4px;background:${c.texte}22}
.barre i{position:absolute;inset:0;background:${CHAUD};transform-origin:0 50%}
.tete{position:absolute;top:150px;left:80px;right:80px;display:flex;justify-content:space-between;font:400 28px JM;letter-spacing:.06em;opacity:.5}
.ph{position:absolute;top:250px;left:80px;width:920px;font:500 92px/1.04 SG;letter-spacing:-.015em}
.ph em{font-style:normal}
.choc{font:700 150px/1 SG;letter-spacing:-.03em}
.chaud{color:${CHAUD}}.froid{color:${FROID}}
.ligne{overflow:hidden;padding-bottom:.1em;margin-bottom:-.1em}
.nw{white-space:nowrap}
.carte{position:absolute;top:1060px;width:440px;height:290px;border:2px solid ${c.texte}55;border-radius:28px;padding:30px 34px;background:#0d1117cc}
.carte b{display:block;font:400 34px JM;opacity:.6}
.carte p{margin-top:16px;font:500 50px/1.08 SG}
#cA{left:80px} #cB{left:560px}
.compte{position:absolute;left:440px;top:800px;width:200px;height:200px}
.compte span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font:700 120px SG}
.etiq{position:absolute;font:400 30px JM;white-space:nowrap;opacity:0}
.etiq::before{content:'';position:absolute;left:-90px;top:18px;width:80px;height:1.5px;background:currentColor;opacity:.5}
.fleche{position:absolute;left:0;top:0;overflow:visible}
.src{position:absolute;top:1400px;left:80px;font:400 28px JM;opacity:.55}
.flash{position:absolute;inset:0;background:${CHAUD};opacity:0;mix-blend-mode:screen}
</style></head><body>
<div id="monde"><canvas id="c" width="1080" height="1920"></canvas></div>
<div class="flash" id="flash"></div>
<div class="barre"><i id="prog"></i></div>
<div class="tete"><span>TEST · CERVEAU</span><span>N° 01 — PROCRASTINATION</span></div>
<p class="ph choc" id="p0"><span class="chaud">TEST.</span> 3 secondes.</p>
<p class="ph" id="p1">Dossier à rendre demain. <span class="nw">Tu fais <em class="chaud">quoi</em> ?</span></p>
<div class="carte" id="cA"><b>A</b><p>Je m’y mets maintenant.</p></div>
<div class="carte" id="cB"><b>B</b><p>Je range d’abord mon bureau.</p></div>
<div class="compte" id="compte"><svg width="200" height="200"><circle cx="100" cy="100" r="90" fill="none" stroke="${c.texte}22" stroke-width="6"/><circle id="anneau" cx="100" cy="100" r="90" fill="none" stroke="${CHAUD}" stroke-width="6" stroke-linecap="round" stroke-dasharray="565.5" stroke-dashoffset="0" transform="rotate(-90 100 100)"/></svg><span id="n3">3</span><span id="n2">2</span><span id="n1">1</span></div>
<p class="ph" id="p2">Si tu as choisi B : ton <span class="nw"><em class="chaud">amygdale</em> a gagné.</span></p>
<p class="ph" id="p3">Ton cortex préfrontal est arrivé <span class="nw"><em class="froid">trop tard</em>.</span></p>
<p class="ph" id="p4">Et toi ? <span class="nw"><em class="chaud">A</em> ou <em class="chaud">B</em> ?</span> Dis-le en commentaire.</p>
<svg class="fleche" width="1080" height="1920"><path id="fleche" d="M700 1180 C860 1200 940 1250 960 1330 M930 1300 L960 1336 L990 1298" fill="none" stroke="${CHAUD}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="600" stroke-dashoffset="600"/></svg>
<div class="etiq chaud" id="e-amygdale">amygdale</div>
<div class="etiq froid" id="e-pfc">cortex préfrontal</div>
<div class="src" id="src">— schéma simplifié</div>
<script src="file://${GSAP}/gsap.min.js"></script><script src="file://${GSAP}/SplitText.min.js"></script><script src="file://${GSAP}/CustomEase.min.js"></script>
<script>${R('dessins/cerveau.js')}${R('reseau/dessin.js')}
gsap.registerPlugin(SplitText, CustomEase);
const m = ${JSON.stringify(generer())}, Z = ${JSON.stringify(ZONES)}, B = ${B};
const etat = { cam: { cx: 425, cy: 215, zoom: 1.15, rot: 0.04 },
  act: { amygdale: 0.1, insula: 0.08, cortex: 0.12, pfc: 0.1, striatum: 0.1, hippocampe: 0.1, cervelet: 0.05 }, decharges: 0,
  couleurs: { base: '#5f7d99', froid: '${FROID}', chaud: '${CHAUD}', ambre: '#e8a23c' } };
document.fonts.ready.then(() => {
  CustomEase.create('entree', '${S.mouvement.entree}');
  const ctx = document.getElementById('c').getContext('2d');
  const tl = gsap.timeline({ paused: true });
  const ft = (a, de, vers, t) => tl.fromTo(a, de, Object.assign({ immediateRender: false }, vers), t);
  const L = (id) => new SplitText('#' + id, { type: 'lines', mask: 'lines', linesClass: 'ligne' }).lines;
  const [l0, l1, l2, l3, l4] = ['p0', 'p1', 'p2', 'p3', 'p4'].map(L);
  gsap.set([...l0, ...l1, ...l2, ...l3, ...l4], { yPercent: 110 });
  gsap.set(['#cA', '#cB', '#compte', '#n3', '#n2', '#n1'], { opacity: 0 });
  const entrer = (l, t, d) => ft(l, { yPercent: 110 }, { yPercent: 0, duration: d || .55, ease: 'power3.out', stagger: .07 }, t);
  const sortir = (l, t) => ft(l, { yPercent: 0 }, { yPercent: -110, duration: .3, ease: 'power2.in', stagger: .04 }, t);
  // Un « coup » de zoom sur chaque coupe : l’image claque sur le temps.
  const coup = (t, f) => ft('#monde', { scale: f || 1.06 }, { scale: 1, duration: .45, ease: 'power3.out' }, t);
  // Le cerveau bat sur chaque temps (pulsation globale du cortex).
  for (let k = 0; k * B < ${DUREE}; k += 1) ft(etat.act, { cortex: 0.32 }, { cortex: 0.12, duration: B * 0.9, ease: 'power2.out' }, k * B);
  ft('#prog', { scaleX: 0 }, { scaleX: 1, duration: ${DUREE}, ease: 'none' }, 0);

  // 1. « TEST. » claque, 0 à 2 temps.
  ft(l0, { yPercent: 110, scale: 1.3 }, { yPercent: 0, scale: 1, duration: .35, ease: 'power4.out', stagger: .05 }, 0);
  coup(0, 1.1);
  sortir(l0, 2 * B - .3);
  // 2. La question et les deux cartes, sur les temps 2 et 3.
  entrer(l1, 2 * B); coup(2 * B);
  ft('#cA', { opacity: 0, x: -300 }, { opacity: 1, x: 0, duration: .45, ease: 'power3.out' }, 3 * B);
  ft('#cB', { opacity: 0, x: 300 }, { opacity: 1, x: 0, duration: .45, ease: 'power3.out' }, 3 * B + .12);
  // 3. Compte à rebours : 3, 2, 1 sur les temps 4, 5, 6 ; l’amygdale s’agite à chaque temps.
  ft('#compte', { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .3, ease: 'power3.out' }, 4 * B);
  ft('#anneau', { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': 565.5 }, duration: 3 * B, ease: 'none' }, 4 * B);
  ['#n3', '#n2', '#n1'].forEach((n, i) => {
    const t = (4 + i) * B;
    ft(n, { opacity: 0, scale: 1.6 }, { opacity: 1, scale: 1, duration: .25, ease: 'power3.out' }, t);
    ft(n, { opacity: 1 }, { opacity: 0, duration: .15 }, t + B - .15);
    ft(etat.act, { amygdale: 0.15 + 0.2 * i }, { amygdale: 0.35 + 0.2 * i, duration: .2, ease: 'power2.out', yoyo: true, repeat: 1 }, t);
  });
  ft('#compte', { opacity: 1 }, { opacity: 0, duration: .2 }, 7 * B - .2);
  // 4. Temps écoulé (temps 7) : la carte B s’allume, la A s’efface, puis on plonge.
  ft('#cA', { opacity: 1 }, { opacity: .25, duration: .3 }, 7 * B);
  ft('#cB', { borderColor: '${c.texte}55', scale: 1 }, { borderColor: '${CHAUD}', scale: 1.04, duration: .3, ease: 'power3.out' }, 7 * B);
  sortir(l1, 7 * B + .4);
  ft(['#cA', '#cB'], { opacity: (i) => (i ? 1 : .25), y: 0 }, { opacity: 0, y: 80, duration: .35, ease: 'power2.in' }, 8 * B - .35);
  // 5. La révélation, sur le temps 8 : flash, zoom brutal vers l’amygdale, alarme.
  ft('#flash', { opacity: .35 }, { opacity: 0, duration: .5, ease: 'power2.out' }, 8 * B);
  ft(etat.cam, { cx: 425, cy: 215, zoom: 1.15, rot: 0.04 }, { cx: 370, cy: 360, zoom: 2.0, rot: 0.14, duration: .7, ease: 'expo.out' }, 8 * B);
  ft(etat.act, { amygdale: 0.55, insula: 0.08 }, { amygdale: 1, insula: 0.6, duration: .4, ease: 'power2.out' }, 8 * B);
  ft(etat, { decharges: 0 }, { decharges: 1, duration: .3 }, 8 * B);
  coup(8 * B, 1.12);
  entrer(l2, 8 * B + .1);
  ft('#e-amygdale', { opacity: 0 }, { opacity: 1, duration: .3 }, 9 * B);
  // 6. Le cortex préfrontal arrive trop tard (temps 11).
  sortir(l2, 11 * B - .3);
  ft('#e-amygdale', { opacity: 1 }, { opacity: 0, duration: .2 }, 11 * B - .3);
  ft(etat.cam, { cx: 370, cy: 360, zoom: 2.0, rot: 0.14 }, { cx: 330, cy: 250, zoom: 1.55, rot: 0.08, duration: .8, ease: 'expo.out' }, 11 * B);
  ft(etat.act, { pfc: 0.1 }, { pfc: 0.9, duration: .8, ease: 'power2.out' }, 11 * B + .2);
  coup(11 * B);
  entrer(l3, 11 * B + .1);
  ft('#e-pfc', { opacity: 0 }, { opacity: 1, duration: .3 }, 12 * B);
  // 7. L’appel à participer (temps 14) : retour au large, flèche vers les commentaires.
  sortir(l3, 14 * B - .3);
  ft('#e-pfc', { opacity: 1 }, { opacity: 0, duration: .2 }, 14 * B - .3);
  ft(etat.cam, { cx: 330, cy: 250, zoom: 1.55, rot: 0.08 }, { cx: 425, cy: 215, zoom: 1.15, rot: 0.04, duration: .9, ease: 'expo.out' }, 14 * B);
  ft(etat.act, { pfc: 0.9, amygdale: 1, insula: 0.6 }, { pfc: 0.15, amygdale: 0.15, insula: 0.1, duration: 1, ease: 'power2.inOut' }, 14 * B);
  ft(etat, { decharges: 1 }, { decharges: 0.3, duration: 1 }, 14 * B);
  coup(14 * B);
  entrer(l4, 14 * B + .1);
  ft('#fleche', { attr: { 'stroke-dashoffset': 600 } }, { attr: { 'stroke-dashoffset': 0 }, duration: .7, ease: 'power2.out' }, 15 * B + .2);
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
  // Son : « Labo » pleine dès le début (plus d’énergie), un tic par seconde du compte à rebours,
  // une coupure juste avant la révélation, puis un impact.
  const { FREQ, tampon, normaliser, ecrireWav } = outils;
  const musique = normaliser(MUSIQUES_ARRANGEES.labo({ duree: DUREE, parties: ['plein', 'montee', 'plein', 'plein', 'plein'], coupures: [8 * B - 0.45], coupure: 0.45 }), 0.89);
  const b = tampon(DUREE);
  for (let i = 0; i < b.length; i += 1) b[i] = 0.55 * musique[i];
  const reperes = [['impact.wav', 0, 0.55], ['souffle.wav', 2 * B, 0.35], ['tic.wav', 4 * B, 0.5], ['tic.wav', 5 * B, 0.5], ['tic.wav', 6 * B, 0.55],
    ['impact.wav', 8 * B, 0.7], ['souffle.wav', 11 * B, 0.35], ['souffle.wav', 14 * B, 0.35], ['tic.wav', 15 * B + 0.2, 0.3]];
  for (const [n, t, v] of reperes) {
    const s = normaliser(BRUITAGES[n](), 0.89), i0 = Math.round(t * FREQ);
    for (let i = 0; i < s.length && i0 + i < b.length; i += 1) b[i0 + i] += v * s[i];
  }
  normaliser(b, 1);
  for (let i = 0; i < b.length; i += 1) b[i] = (0.88 * Math.tanh(2.6 * b[i])) / Math.tanh(2.6);
  const wav = path.join(SORTIE, 'son.wav'); ecrireWav(wav, b, true);

  const fichier = path.join(SORTIE, 'interactif.html');
  fs.writeFileSync(fichier, html);
  const nav = await chromium.launch();
  const p = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
  p.on('pageerror', (e) => console.error('page :', e.message));
  await p.goto('file://' + fichier);
  await p.waitForFunction(() => !!window.__pret);
  const mp4 = path.join(SORTIE, 'interactif.mp4');
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
  const imgs = [0.6, 2.3, 3.6, 5.0, 6.0, 8.0, 10.6, 11.6].map((t, i) => { const f = path.join(SORTIE, `k${i}.png`); execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-ss', String(t), '-i', mp4, '-frames:v', '1', '-vf', 'scale=270:480', f]); return f; });
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...imgs.flatMap((f) => ['-i', f]), '-filter_complex', `hstack=${imgs.length}`, path.join(SORTIE, 'planche.png')]);
  console.log(mp4);
})();
