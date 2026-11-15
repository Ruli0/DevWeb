/*
 * Écrit la composition HyperFrames d'un épisode V3 : videos/studio/<id>/index.html et assets/.
 * html(feuille) est une fonction pure (même feuille de route, même page).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const STYLE = require('./style.js');
const { SCENES } = require('./montage.js');
const { ecrireMusique, outils } = require('../scripts/build-sons.js');
const { BRUITAGES } = require('../scripts/sons-v3.js');

const RACINE = path.join(__dirname, '..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
// Typographie française : apostrophe courbe, espaces insécables avant ? ! : ;
const typo = (s) => String(s).replace(/'/g, '’').replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
// Le mot clé reste collé à ce qui le touche (« l’évitement », « paresse. ») : jamais coupé en fin de ligne.
const md = (s) => esc(typo(s)).replace(/([^\s*]*)\*([^*]+)\*([^\s*]*(?:\u00a0[?!:;»])?)/g, (m, a, b, c) => `<span class="nw">${a}<em>${b}</em>${c}</span>`);
const u = { esc: (s) => esc(typo(s)), md };
const PLUGINS = ['gsap.min.js', 'SplitText.min.js', 'DrawSVGPlugin.min.js', 'MorphSVGPlugin.min.js', 'CustomEase.min.js'];

const styleDe = (f) => {
  const s = JSON.parse(JSON.stringify(STYLE));
  s.couleurs.accent = f.accent;
  return s;
};

function css(S) {
  const c = S.couleurs, t = S.tailles, P = S.polices;
  const fontes = Object.entries(P.fichiers).flatMap(([fam, poids]) => Object.entries(poids).map(([w, f]) =>
    `@font-face{font-family:'${fam}';font-weight:${w};src:url(assets/polices/${f}) format('woff2');font-display:block}`)).join('\n');
  return `${fontes}
* { box-sizing: border-box; margin: 0; padding: 0; } html, body { background: ${c.fond}; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; color: ${c.texte}; font-family: '${P.titre}';
  background: radial-gradient(120% 80% at 30% 35%, ${c.fond2}, ${c.fond} 70%); }
#root.test { background: radial-gradient(90% 60% at 45% 48%, #101824, #06090d 75%); }
.points { position: absolute; inset: 0; background-image: radial-gradient(${c.texte}22 1.6px, transparent 1.8px); background-size: 40px 40px; }
.grain { position: absolute; inset: 0; mix-blend-mode: overlay; pointer-events: none; }
.tete { position: absolute; top: 170px; left: 80px; right: 80px; display: flex; justify-content: space-between; font: 400 ${t.tete}px '${P.mono}'; letter-spacing: .06em; opacity: .55; text-transform: uppercase; }
.scene, .derive { position: absolute; inset: 0; }
.derive { transform-origin: 540px 900px; }
em { font-style: normal; color: ${c.accent}; }
.nw { white-space: nowrap; }
.guillemet-txt { position: absolute; top: 420px; left: 66px; font: 700 260px/1 '${P.titre}'; color: ${c.accent}; }
.ligne { overflow: hidden; padding-bottom: .1em; margin-bottom: -.1em; }
svg.dessin, svg.filet { position: absolute; left: 0; top: 0; overflow: visible; }
.ph { position: absolute; top: 270px; left: 80px; width: 900px; font: 500 ${t.phrase}px/1.04 '${P.titre}'; letter-spacing: -.015em; }
.centre { position: absolute; left: 80px; right: 80px; top: 560px; height: 760px; display: flex; flex-direction: column; justify-content: center; gap: 48px; }
.centre .ph { position: static; width: auto; font-size: 112px; line-height: 1.02; }
.trait-acc { display: block; overflow: visible; }
.kicker { position: absolute; top: 470px; left: 80px; font: 500 ${t.kicker}px/1 '${P.titre}'; opacity: .8; }
.chiffre { position: absolute; top: 566px; left: 66px; display: flex; font: 700 ${t.chiffre}px/.86 '${P.donnees}'; letter-spacing: -.05em; font-variant-numeric: tabular-nums; }
.chiffre .pc { font-size: ${t.pourcent}px; color: ${c.accent}; margin-left: 10px; letter-spacing: 0; line-height: 1; }
.legende { position: absolute; top: 1050px; left: 80px; width: 880px; font: 500 ${t.legende}px/1.05 '${P.titre}'; }
.src { position: absolute; left: 80px; font: 400 ${t.source}px '${P.mono}'; opacity: .6; letter-spacing: .02em; white-space: nowrap; }
.src::before { content: ''; display: inline-block; width: 28px; height: 2px; background: currentColor; vertical-align: middle; margin-right: 14px; }
.etiq { position: absolute; display: flex; flex-direction: column; gap: 6px; }
.etiq b { font: 600 ${t.etiquette}px '${P.titre}'; color: ${c.accent}; }
.etiq span { font: 400 28px '${P.mono}'; opacity: .6; white-space: nowrap; }
.etape { position: absolute; left: 190px; width: 800px; display: flex; gap: 22px; align-items: baseline; }
.etape .num { font: 400 30px '${P.mono}'; opacity: .55; }
.etape p { font: 500 62px/1.08 '${P.titre}'; }
.barre-label { position: absolute; left: 80px; width: 900px; font: 500 44px/1.1 '${P.titre}'; opacity: .85; }
.barre-val { position: absolute; font: 700 52px/1 '${P.donnees}'; font-variant-numeric: tabular-nums; }
.barre-val.acc { color: ${c.accent}; }
.col { position: absolute; top: 540px; width: 400px; }
.col.gauche { left: 80px; } .col.droite { left: 600px; }
.col-titre { font: 400 28px '${P.mono}'; text-transform: uppercase; letter-spacing: .08em; opacity: .6; }
.col-texte { margin-top: 28px; font: 500 64px/1.08 '${P.titre}'; }
.nature { position: absolute; top: 676px; left: 80px; font: 400 28px '${P.mono}'; text-transform: uppercase; letter-spacing: .08em; opacity: .6; }
.ph.citation { top: 800px; font-size: 80px; line-height: 1.08; }
.point { position: absolute; left: 170px; width: 820px; font: 500 56px/1.1 '${P.titre}'; }
#monde { position: absolute; inset: 0; transform-origin: 540px 900px; }
#cerveau { position: absolute; left: 0; top: 0; }
#voile { position: absolute; inset: 0; background: #06090d; opacity: 0; }
#flash { position: absolute; inset: 0; background: #ff7a4d; opacity: 0; mix-blend-mode: screen; }
.barre { position: absolute; top: 120px; left: 80px; width: 920px; height: 4px; background: ${c.texte}22; }
.barre i { position: absolute; inset: 0; background: #ff7a4d; transform-origin: 0 50%; }
.chaud { color: #ff7a4d; } .froid { color: #8fc4ea; }
.ph.choc { top: 250px; font: 700 150px/1 '${P.titre}'; letter-spacing: -.03em; }
.carte { position: absolute; top: 1060px; width: 440px; height: 290px; border: 2px solid ${c.texte}55; border-radius: 28px; padding: 30px 34px; background: #0d1117cc; }
.carte b { display: block; font: 400 34px '${P.mono}'; opacity: .6; }
.carte p { margin-top: 16px; font: 500 50px/1.08 '${P.titre}'; }
.carte.a { left: 80px; } .carte.b { left: 560px; }
.rebours { position: absolute; left: 440px; top: 800px; width: 200px; height: 200px; }
.rebours svg { position: absolute; left: 0; top: 0; }
.rebours span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font: 700 120px '${P.titre}'; }
.etiq-z { position: absolute; font: 400 30px '${P.mono}'; white-space: nowrap; }
.etiq-z span { display: block; font-size: 26px; opacity: .7; margin-top: 4px; }
.etiq-z::before { content: ''; position: absolute; left: -90px; top: 18px; width: 80px; height: 1.5px; background: currentColor; opacity: .5; }
.mention { position: absolute; top: 1300px; left: 80px; font: 400 30px/1.6 '${P.mono}'; opacity: .6; }`;
}

const GRAIN = '<svg class="grain" width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.12"/></svg>';

function sonsAudio(f, dureeSon) {
  const sons = [{ f: 'musique.wav', t: 0, v: 0.8, duree: f.duree }];
  f.sons.forEach((s) => sons.push({ f: s.f, t: s.t, v: s.v, duree: Math.min(dureeSon(s.f), f.duree - s.t) }));
  const fins = [];
  return sons.map((s, i) => {
    let piste = fins.findIndex((fin) => fin <= s.t);
    if (piste === -1) { piste = fins.length; fins.push(0); }
    fins[piste] = s.t + s.duree;
    return `  <audio id="son-${i}" class="clip" src="assets/sons/${s.f}" data-start="${s.t}" data-duration="${s.duree.toFixed(3)}" data-track-index="${5 + piste}" data-volume="${s.v}"></audio>`;
  }).join('\n');
}

const DUREES_BRUITAGES = { 'souffle.wav': 0.7, 'impact.wav': 1.4, 'tic.wav': 0.5, 'montee.wav': 1.8 };

function html(f) {
  const S = styleDe(f);
  const scenes = f.scenes.map((s, i) => `  <div id="scene-${i}" class="scene clip" data-start="${s.t0}" data-duration="${s.d}" data-track-index="1"><div class="derive">${SCENES[s.id].dessin(s.p, S, u)}</div></div>`).join('\n');
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${esc(f.titre)}</title>
${PLUGINS.map((p) => `<script src="assets/${p}"></script>`).join('')}
<style>${css(S)}</style></head>
<body>
<div id="root"${f.reseau ? ' class="test"' : ''} data-composition-id="${f.id}" data-start="0" data-duration="${f.duree}" data-width="1080" data-height="1920" data-fps="60">
 ${f.reseau ? `<div id="monde"><canvas id="cerveau" width="1080" height="1920"></canvas></div><div id="voile"></div><div id="flash"></div>
 <div class="barre"><i id="prog"></i></div>` : '<div class="points"></div>'}
 <div class="tete"><span>${f.reseau ? 'Test · cerveau' : `Cerveau · ${Math.round(f.duree)} s`}</span><span>N° ${String(f.numero).padStart(2, '0')} — ${esc(f.sujet)}</span></div>
${scenes}
 ${GRAIN}
${sonsAudio(f, (n) => DUREES_BRUITAGES[n] || 1)}
</div>
<script>
${lire('studio/dessins/cerveau.js')}
${f.reseau ? lire('studio/reseau/dessin.js') : ''}
${f.scenes.map((s) => s.id).filter((x, i, a) => a.indexOf(x) === i).concat(f.scenes.some((s) => s.id === 'cerveau') ? ['chiffre'] : []).filter((x, i, a) => a.indexOf(x) === i).map((n) => lire(`studio/scenes/${n}.js`)).join('\n')}
${lire('studio/lecteur.js')}
(function () {
  gsap.registerPlugin(SplitText, DrawSVGPlugin, MorphSVGPlugin, CustomEase);
  var feuille = ${JSON.stringify(f)};
  var style = ${JSON.stringify(S)};
  window.__timelines = window.__timelines || {};
  document.fonts.ready.then(function () {
    window.__timelines[feuille.id] = Terrarium.lecteur.jouer(feuille, style);
  });
})();
</script>
</body></html>
`;
}

function ecrire(f, dossier) {
  const { normaliser, ecrireWav } = outils;
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  fs.mkdirSync(path.join(dossier, 'assets/polices'), { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), html(f));
  fs.writeFileSync(path.join(dossier, 'feuille.json'), `${JSON.stringify(f, null, 1)}\n`);
  for (const g of PLUGINS) fs.copyFileSync(path.join(RACINE, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  for (const p of fs.readdirSync(path.join(RACINE, 'studio/polices'))) fs.copyFileSync(path.join(RACINE, 'studio/polices', p), path.join(dossier, 'assets/polices', p));
  for (const s of new Set(f.sons.map((x) => x.f))) ecrireWav(path.join(dossier, 'assets/sons', s), normaliser(BRUITAGES[s](), 0.89), true);
  // Musique compressée doucement : niveau moyen autour de -14 dB avec les bruitages.
  const { MUSIQUES_ARRANGEES } = require('../scripts/build-sons.js');
  const m = normaliser(MUSIQUES_ARRANGEES[f.musique]({ duree: f.duree + 0.3, ...f.arrangement }), 1);
  for (let i = 0; i < m.length; i += 1) m[i] = (0.85 * Math.tanh(2.4 * m[i])) / Math.tanh(2.4);
  ecrireWav(path.join(dossier, 'assets/sons/musique.wav'), m, true);
}

module.exports = { html, ecrire, md };
