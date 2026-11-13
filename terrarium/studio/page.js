/*
 * Écrit la composition HyperFrames d'un épisode : videos/studio/<id>/index.html et assets/.
 * html(feuille) est une fonction pure (même feuille de route, même page).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { RIGS, DECORS } = require('./compiler.js');
const { ecrireMusique } = require('../scripts/build-sons.js');

const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const dureeSon = (f) => (fs.statSync(path.join(RACINE, 'videos/sons', f)).size - 44) / 88200;

// Le texte de Mousse : toutes les lettres dans la page dès le début, invisibles.
function lettres(texte) {
  let acc = false; let h = '';
  for (const ch of texte) {
    if (ch === '*') { acc = !acc; continue; }
    h += `<span class="c${acc ? ' acc' : ''}">${ch === ' ' ? ' ' : esc(ch)}</span>`;
  }
  return `${h}<span class="c fin">&nbsp;</span>`;
}

const DEFS = `
  <filter id="lueur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="lueur-forte" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/></filter>
  <radialGradient id="vignette" cx="540" cy="880" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient>
  <radialGradient id="halo-mouche"><stop offset="0" stop-color="#eaff7a" stop-opacity="0.55"/><stop offset="1" stop-color="#eaff7a" stop-opacity="0"/></radialGradient>`;

const CSS = `
* { box-sizing: border-box; } html, body { margin: 0; background: #000; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; font-family: "Space Mono", monospace; }
#scene { position: absolute; left: 0; top: 0; }
/* Le texte de Mousse, sans cadre, en haut de la zone sûre. */
.invite { position: absolute; left: 80px; top: 170px; margin: 0; font: 700 22px/1 "Space Mono", monospace; color: rgba(182,255,92,.6); }
.ligne-texte { position: absolute; left: 80px; width: 760px; top: 206px; pointer-events: none; }
.ligne { margin: 0; font: 700 54px/1.2 "Space Mono", monospace; color: #b6ff5c; text-shadow: 0 0 12px rgba(182,255,92,.8), 0 2px 14px rgba(0,0,0,.9); }
.ligne .chevron { opacity: .55; }
.c { visibility: hidden; } .c.vu { visibility: visible; }
.c.acc { color: #ff6fb5; text-shadow: 0 0 14px rgba(255,111,181,.9), 0 2px 14px rgba(0,0,0,.9); }
.c.cur { visibility: visible; color: transparent; text-shadow: none; background: #b6ff5c; box-shadow: 0 0 10px rgba(182,255,92,.8); }
`;

function html(f) {
  const decor = DECORS[f.decor];
  const d = decor.dessin();
  const place = decor.PLACES;
  const acteurs = RIGS.cameleon.dessin(place.ia) + RIGS.mouche.dessin();
  const calques = d.calques.map((c) => `   <g class="calque" id="calque-${c.id}" data-f="${c.f}">${c.svg}${c.acteurs ? acteurs : ''}</g>`).join('\n');
  const textes = f.textes.map((m, k) => `  <div id="ligne-${k}" class="clip ligne-texte" data-start="${m.debut}" data-duration="${(m.fin - m.debut).toFixed(3)}" data-track-index="2"><p class="ligne"><span class="chevron">&gt;</span> ${lettres(m.texte)}</p></div>`).join('\n');

  // Sons : chaque son dure sa vraie longueur ; ceux qui se chevauchent vont sur des pistes différentes.
  const sons = [];
  if (f.musique) sons.push({ f: 'musique.wav', t: 0, v: 0.5, duree: f.duree });
  f.sons.forEach((s) => sons.push({ f: s.f, t: s.t, v: s.v, duree: Math.min(dureeSon(s.f), f.duree - s.t) }));
  const fins = [];
  const audio = sons.map((s, i) => {
    let piste = fins.findIndex((fin) => fin <= s.t);
    if (piste === -1) { piste = fins.length; fins.push(0); }
    fins[piste] = s.t + s.duree;
    return `  <audio id="son-${i}" class="clip" src="assets/sons/${s.f}" data-start="${s.t}" data-duration="${s.duree.toFixed(3)}" data-track-index="${5 + piste}" data-volume="${s.v}"></audio>`;
  }).join('\n');

  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${esc(f.titre)}</title>
<script src="assets/gsap.min.js"></script><script src="assets/MotionPathPlugin.min.js"></script>
<style>${CSS}</style></head>
<body>
<div id="root" data-composition-id="${f.id}" data-start="0" data-duration="${f.duree}" data-width="1080" data-height="1920" data-fps="60">
 <svg id="scene" width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
  <defs>${DEFS}${d.defs}</defs>
  ${d.fond}
  <g id="monde">
${calques}
  </g>
  ${RIGS.mousse.dessin()}
  <g id="etiquettes"></g>
  <rect width="1080" height="1920" fill="url(#vignette)"/>
  <rect width="1080" height="1920" filter="url(#grain)" opacity="0.06"/>
 </svg>
 <p class="invite">mousse@terrarium:~$</p>
${textes}
${audio}
</div>
<script>
${lire('studio/runtime.js')}
${lire('studio/rigs/cameleon.js')}
${lire('studio/rigs/mouche.js')}
${lire('studio/rigs/mousse.js')}
${lire(`studio/decors/${f.decor}.js`)}
(function () {
  gsap.registerPlugin(MotionPathPlugin);
  var feuille = ${JSON.stringify(f)};
  var tl = Terrarium.studio.jouer(feuille, { racine: document.getElementById('root') });
  window.__timelines = window.__timelines || {};
  window.__timelines[feuille.id] = tl;
})();
</script>
</body></html>
`;
}

function ecrire(f, dossier) {
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), html(f));
  fs.writeFileSync(path.join(dossier, 'feuille.json'), `${JSON.stringify(f, null, 1)}\n`);
  for (const g of ['gsap.min.js', 'MotionPathPlugin.min.js']) fs.copyFileSync(path.join(RACINE, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  for (const s of new Set(f.sons.map((x) => x.f))) fs.copyFileSync(path.join(RACINE, 'videos/sons', s), path.join(dossier, 'assets/sons', s));
  if (f.musique) ecrireMusique(f.musique, { duree: f.duree + 0.3, parties: f.arrangement.parties, coupures: f.arrangement.coupures }, path.join(dossier, 'assets/sons/musique.wav'));
}

module.exports = { html, ecrire };
