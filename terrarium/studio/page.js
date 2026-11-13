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
// Chaque mot est regroupé (.mot, insécable) : un mot n'est jamais coupé entre deux lignes.
// Un mot en valeur (*mot*) passe seul sur sa ligne, en géant (style D1 + D2 + D3, 13 nov.) ;
// sa taille dépend de sa longueur, pour tenir dans la largeur.
// La ponctuation française (« ! », « ? », « : ») reste collée au mot qui la précède.
const COLLEE = '!?:;»…';
function lettres(texte) {
  let acc = false; const mots = []; let mot = { acc: false, h: '', n: 0 };
  const car = (ch) => `<span class="c${acc ? ' acc' : ''}">${esc(ch)}</span>`;
  const chars = [...texte];
  chars.forEach((ch, i) => {
    if (ch === '*') { acc = !acc; return; }
    if (ch === ' ' && COLLEE.includes(chars[i + 1] || '')) { mot.h += car('\u00a0'); mot.n += 1; return; }
    if (ch === ' ') { if (mot.h) mots.push(mot); mots.push({ espace: true, h: car(' ') }); mot = { acc: false, h: '', n: 0 }; return; }
    if (acc) mot.acc = true;
    mot.h += car(ch); mot.n += 1;
  });
  if (mot.h) mots.push(mot);
  // Les mots en valeur qui se suivent forment un seul groupe géant (« boucle d'outils »).
  const blocs = [];
  mots.forEach((m, i) => {
    const dernier = blocs[blocs.length - 1];
    const suivantAcc = mots[i + 1] && mots[i + 1].acc;
    if (m.acc && dernier && dernier.groupe && dernier.ouvert) { dernier.h += `<span class="m">${m.h}</span>`; dernier.n += m.n; dernier.long = Math.max(dernier.long, m.n); }
    else if (m.acc) blocs.push({ groupe: true, ouvert: true, h: `<span class="m">${m.h}</span>`, n: m.n, long: m.n });
    else if (m.espace && dernier && dernier.groupe && dernier.ouvert && suivantAcc) { dernier.h += m.h; dernier.n += 1; }
    else { if (dernier && dernier.groupe) dernier.ouvert = false; blocs.push(m); }
  });
  // Taille du groupe géant : sur une ligne s'il est court, sinon sur deux lignes, sans descendre sous 130 px.
  const geant = (b) => Math.min(176, Math.floor(820 / ((b.n > 10 ? b.long : b.n) * 0.56)));
  return `${blocs.map((b) => (b.groupe ? `<span class="mot acc" style="font-size:${geant(b)}px">${b.h}</span>` : b.espace ? b.h : `<span class="mot">${b.h}</span>`)).join('')}<span class="c fin">&nbsp;</span>`;
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
/* Le texte de Mousse (choisi le 13 nov. : D1 + D2 + D3) : grandes lettres rondes en néon,
   le mot clé géant sur sa propre ligne, sur un bandeau sombre aux bords flous. */
.invite { display: none; }
.ligne-texte { position: absolute; left: 60px; width: 880px; top: 190px; text-align: center; pointer-events: none; }
.ligne { display: inline-block; margin: 0; padding: 22px 40px 30px; border-radius: 48px;
  background: rgba(2,6,10,.72); box-shadow: 0 0 40px 30px rgba(2,6,10,.55);
  font: 800 104px/0.98 "Baloo 2", sans-serif; color: #fbfff6; -webkit-text-stroke: 6px #0a3a16; paint-order: stroke fill;
  text-shadow: 0 0 8px #b6ff5c, 0 0 26px #8dff6a, 0 0 60px rgba(141,255,106,.8), 0 0 110px rgba(141,255,106,.5); }
.chevron { display: none; }
.mot { display: inline-block; white-space: nowrap; }
.mot.acc { display: block; line-height: 0.95; white-space: normal; }
.mot .m { display: inline-block; white-space: nowrap; }
.c { visibility: hidden; } .c.vu { visibility: visible; }
.c.acc { color: #fbfeff; -webkit-text-stroke: 6px #063040; text-shadow: 0 0 8px #9af8ff, 0 0 26px #5ef2ff, 0 0 60px rgba(94,242,255,.85), 0 0 110px rgba(94,242,255,.5); }
.c.cur { visibility: visible; color: transparent; -webkit-text-stroke: 0; text-shadow: none; background: #fbfff6; box-shadow: 0 0 14px rgba(141,255,106,.9); }
.c.fin { display: none; }
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
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@800&display=block" rel="stylesheet">
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
