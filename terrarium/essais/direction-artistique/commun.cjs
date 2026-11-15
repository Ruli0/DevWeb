// Outils communs aux trois pistes du test de direction artistique (étape 1 du plan).
// Chaque piste fabrique une composition HyperFrames de 4 mesures (16 temps à 145 BPM).
const fs = require('node:fs');
const path = require('node:path');
const DEPOT = path.join(__dirname, '../..');
const { ecrireMusique } = require(path.join(DEPOT, 'scripts/build-sons.js'));
const gardien = require(path.join(DEPOT, 'public/js/art/gardien.js'));

const T = 60 / 145;
const D = +(16 * T).toFixed(4);
const b = (n) => +(n * T).toFixed(4); // n temps, en secondes

function graine(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Mousse, recoloré pour une piste.
function mousse(couleurs) {
  let s = gardien.mousse();
  for (const [de, vers] of Object.entries(couleurs)) s = s.split(de).join(vers);
  return s;
}

// Le texte tapé : toutes les lettres sont en place dès le début (rien ne se décale).
function lettres(texte) {
  let acc = false; let h = '';
  for (const ch of texte) {
    if (ch === '*') { acc = !acc; continue; }
    h += `<span class="c${acc ? ' acc' : ''}">${ch === ' ' ? ' ' : ch.replace('<', '&lt;')}</span>`;
  }
  return h + '<span class="c fin">&nbsp;</span>';
}

// Code navigateur commun, injecté avant le script de la piste.
const AIDES = `
var T = ${T}, D = ${D};
var b = function (n) { return n * T; };
var tl = gsap.timeline({ paused: true });
var q = function (s) { return document.querySelector(s); };
var qa = function (s) { return document.querySelectorAll(s); };
var ft = function (c, de, vers, t) { return tl.fromTo(c, de, Object.assign({}, vers, { immediateRender: false }), t); };
var repos = function (c, v) { gsap.set(c, v); tl.set(c, v, 0); };
// Une animation qui revient à son départ toutes les « periode » secondes, sur toute la vidéo.
var cycle = function (c, de, vers, periode, ease) {
  var n = Math.round(D / periode);
  ft(c, de, Object.assign({}, vers, { duration: periode / 2, yoyo: true, repeat: 2 * n - 1, ease: ease || 'sine.inOut' }), 0);
};
function taper(t0, pas) {
  var l = qa('.term .c');
  l.forEach(function (c, j) {
    var k = c.getAttribute('class');
    tl.set(c, { attr: { class: k + ' cur' } }, t0 + Math.max(0, j - 1) * pas + (j ? 0.001 : 0));
    if (j < l.length - 1) tl.set(c, { attr: { class: k + ' vu' } }, t0 + j * pas + 0.002);
  });
  repos(qa('.term .c'), { attr: { class: function (i, el) { return el.getAttribute('class'); } } });
  cycle(q('.term .c.fin'), { opacity: 1 }, { opacity: 0 }, T, 'steps(1)');
}
`;

const CSS_TERMINAL = `
.term { position: absolute; left: 80px; width: 660px; top: 190px; padding: 22px 28px 26px; border-radius: 18px;
  background: rgba(3,10,8,.9); border: 2px solid rgba(182,255,92,.6); box-shadow: 0 0 28px rgba(182,255,92,.35); }
.term::after { content: ""; position: absolute; inset: 0; border-radius: 18px; pointer-events: none;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.25) 0 2px, transparent 2px 5px); }
.term .invite { margin: 0 0 10px; font: 700 22px/1 "Space Mono", monospace; color: rgba(182,255,92,.6); }
.term .ligne { margin: 0; font: 700 50px/1.2 "Space Mono", monospace; color: #b6ff5c; text-shadow: 0 0 12px rgba(182,255,92,.8); }
.term .c { visibility: hidden; } .term .c.vu { visibility: visible; }
.term .c.acc { color: #ff6fb5; text-shadow: 0 0 14px rgba(255,111,181,.9); }
.term .c.cur { visibility: visible; color: transparent; text-shadow: none; background: #b6ff5c; box-shadow: 0 0 10px rgba(182,255,92,.8); }
`;
const terminal = (texte) => `<div class="term"><p class="invite">mousse@terrarium:~$</p><p class="ligne"><span style="opacity:.55">&gt;</span> ${lettres(texte)}</p></div>`;

// Écrit la composition : <dossier>/index.html, avec GSAP et les sons dans assets/.
function ecrire(dossier, { id, titre, svg, css, js, sons, apres = '' }) {
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  for (const g of ['gsap.min.js', 'MotionPathPlugin.min.js']) fs.copyFileSync(path.join(DEPOT, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  ecrireMusique('drift', { duree: D + 0.3 }, path.join(dossier, 'assets/sons/musique.wav'));
  const duree = (f) => (fs.statSync(path.join(DEPOT, 'videos/sons', f)).size - 44) / 88200;
  const pistes = [`<audio id="musique" class="clip" src="assets/sons/musique.wav" data-start="0" data-duration="${D}" data-track-index="5" data-volume="0.5"></audio>`];
  sons.forEach((s, i) => {
    fs.copyFileSync(path.join(DEPOT, 'videos/sons', s.f), path.join(dossier, 'assets/sons', s.f));
    pistes.push(`<audio id="son-${i}" class="clip" src="assets/sons/${s.f}" data-start="${s.t.toFixed(3)}" data-duration="${Math.min(duree(s.f), D - s.t).toFixed(3)}" data-track-index="${6 + i}" data-volume="${s.v}"></audio>`);
  });
  fs.writeFileSync(path.join(dossier, 'index.html'), `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${titre}</title>
<script src="assets/gsap.min.js"></script><script src="assets/MotionPathPlugin.min.js"></script>
<style>
* { box-sizing: border-box; } html, body { margin: 0; background: #000; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Space Mono", monospace; }
#scene { position: absolute; left: 0; top: 0; }
${css}
</style></head>
<body>
<div id="root" data-composition-id="${id}" data-start="0" data-duration="${D}" data-width="1080" data-height="1920" data-fps="60">
${svg}
${apres}
${pistes.join('\n')}
</div>
<script>
(function () {
  gsap.registerPlugin(MotionPathPlugin);
${AIDES}
${js}
  window.__timelines = window.__timelines || {};
  window.__timelines['${id}'] = tl;
})();
</script>
</body></html>
`);
}

module.exports = { T, D, b, graine, mousse, terminal, CSS_TERMINAL, ecrire, gardien };
