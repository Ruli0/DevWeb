/*
 * Écrit la composition HyperFrames d'un épisode « avis » : videos/studio/<id>/index.html et assets/.
 * La voix montée (coupes, égalisation, niveau) est fabriquée ici avec ffmpeg depuis videos/voix/<id>/propre.flac.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const S = require('./style.js');
const PLANS = require('./plans.js');

const RACINE = path.join(__dirname, '../..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const typo = (s) => String(s).replace(/'/g, '’').replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
const md = (s) => esc(typo(s)).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const u = { esc: (s) => esc(typo(s)), md };
const PLUGINS = ['gsap.min.js', 'SplitText.min.js', 'DrawSVGPlugin.min.js'];
const GRAIN = '<svg class="grain" width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.1"/></svg>';

function css(f) {
  const c = S.couleurs, P = S.polices, acc = f.accent;
  const fontes = Object.entries(P.fichiers).flatMap(([fam, poids]) => Object.entries(poids).map(([w, fichier]) =>
    `@font-face{font-family:'${fam}';font-weight:${w};font-style:${/italic/.test(fichier) ? 'italic' : 'normal'};src:url(assets/polices/${fichier}) format('woff2');font-display:block}`)).join('\n');
  return `${fontes}
* { box-sizing: border-box; margin: 0; padding: 0; } html, body { background: ${c.fond}; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; color: ${c.texte}; font-family: '${P.titre}'; background: ${c.fond}; }
#halo { position: absolute; left: -200px; top: -100px; width: 1480px; height: 1500px; background: radial-gradient(closest-side, ${acc}38, ${acc}00); }
.grain { position: absolute; inset: 0; mix-blend-mode: overlay; pointer-events: none; }
.barre { position: absolute; top: 120px; left: 70px; width: 940px; height: 4px; background: ${c.texte}22; }
.barre i { position: absolute; inset: 0; background: ${acc}; transform-origin: 0 50%; }
.tete { position: absolute; top: 158px; left: 70px; right: 70px; display: flex; justify-content: space-between; align-items: center; font: 400 28px '${P.mono}'; letter-spacing: .08em; text-transform: uppercase; }
.tete b { font-weight: 400; color: ${acc}; display: flex; align-items: center; gap: 14px; }
.tete b::before { content: ''; width: 16px; height: 16px; border-radius: 50%; background: ${acc}; }
.tete span { opacity: .5; }
.plan, .cadre { position: absolute; inset: 0; }
.cadre { padding: 300px 70px 0 70px; display: flex; flex-direction: column; gap: 34px; width: 1010px; }
em { font: italic 400 1.1em/0.9 '${P.fort}'; color: ${acc}; letter-spacing: 0; }
.ligne { overflow: hidden; padding-bottom: .12em; margin-bottom: -.12em; }
.kicker { font: 400 30px '${P.mono}'; letter-spacing: .08em; text-transform: uppercase; color: ${acc}; }
.grand { font: 700 108px/1.02 '${P.titre}'; letter-spacing: -.025em; }
.grand.geant { font-size: 168px; line-height: .98; letter-spacing: -.035em; }
.moyen { font: 700 76px/1.05 '${P.titre}'; letter-spacing: -.02em; }
.moyen.bas { font-weight: 500; opacity: .85; }
.filet { display: block; width: 180px; height: 8px; background: ${acc}; transform-origin: 0 50%; margin-top: 10px; }
.items { list-style: none; display: flex; flex-direction: column; gap: 22px; margin-top: 8px; }
.items li { font: 700 92px/1.05 '${P.titre}'; letter-spacing: -.02em; display: flex; align-items: center; gap: 26px; }
.items li::before { content: ''; flex: none; width: 22px; height: 22px; border-radius: 50%; background: ${acc}; }
.items li span { position: relative; }
.rature { position: absolute; left: -8px; right: -8px; top: 54%; height: 8px; background: ${acc}; transform-origin: 0 50%; }
.conclusion { font: 500 62px/1.1 '${P.titre}'; margin-top: 14px; }
.jauge { display: flex; flex-direction: column; gap: 20px; margin-top: 26px; }
.jauge p { font: 700 84px/1 '${P.titre}'; letter-spacing: -.02em; }
.jauge .rail { height: 30px; border-radius: 15px; background: ${c.texte}1c; overflow: hidden; width: 940px; }
.jauge i { display: block; height: 100%; border-radius: 15px; background: ${c.texte}; transform-origin: 0 50%; }
.jauge.d p { color: ${acc}; } .jauge.d i { background: ${acc}; }
.jauge span { font: 400 32px '${P.mono}'; opacity: .7; letter-spacing: .04em; }
.fleche { position: absolute; left: 0; top: 0; color: ${acc}; }
#st { position: absolute; left: 60px; width: 890px; top: 1130px; height: 220px; }
.st { position: absolute; left: 0; right: 0; top: 0; text-align: center; font: 700 86px/1.08 '${P.titre}'; letter-spacing: -.02em; text-shadow: 0 4px 30px ${c.fond}; }
.st span { display: inline-block; margin: 0 .11em; }
.st .fort { color: ${acc}; }`;
}

function html(f) {
  const plans = f.plans.map((pl, i) => `  <div id="plan-${i}" class="plan clip" data-start="${pl.t0}" data-duration="${pl.d}" data-track-index="1"><div class="cadre">${PLANS[pl.id].dessin(pl.p, u)}</div></div>`).join('\n');
  const st = f.groupes.map((g, i) => `<div class="st" id="st-${i}">${g.mots.map((m) => `<span${m.fort ? ' class="fort"' : ''}>${u.esc(m.m)}</span>`).join('')}</div>`).join('\n   ');
  const propre = JSON.parse(JSON.stringify(f));
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${esc(f.titre)}</title>
${PLUGINS.map((p) => `<script src="assets/${p}"></script>`).join('')}
<style>${css(f)}</style></head>
<body>
<div id="root" data-composition-id="${f.id}" data-start="0" data-duration="${f.duree}" data-width="1080" data-height="1920" data-fps="60">
 <div id="halo"></div>
 <div class="barre"><i id="prog"></i></div>
 <div class="tete"><b>${esc(f.rubrique)}</b><span>Avis · N° ${String(f.numero).padStart(2, '0')}</span></div>
${plans}
 <div id="st" class="clip" data-start="0" data-duration="${f.dureeVoix}" data-track-index="2">
   ${st}
 </div>
 ${GRAIN}
 <audio id="voix" class="clip" src="assets/sons/voix.wav" data-start="0" data-duration="${f.dureeVoix}" data-track-index="5" data-volume="${f.voix.volume}"></audio>
 <audio id="musique" class="clip" src="assets/sons/musique.wav" data-start="0" data-duration="${f.duree}" data-track-index="6" data-volume="${f.musique.volume}"></audio>
</div>
<script>
${lire('studio/avis/plans.js')}
${lire('studio/avis/lecteur.js')}
(function () {
  gsap.registerPlugin(SplitText, DrawSVGPlugin);
  var feuille = ${JSON.stringify(propre)};
  window.__timelines = window.__timelines || {};
  document.fonts.ready.then(function () { window.__timelines[feuille.id] = Avis.lecteur.jouer(feuille); });
})();
</script>
</body></html>
`;
}

// La chaîne de traitement de la voix (après le débruitage fait par scripts/voix.py).
function filtreVoix(v) {
  const garde = v.garde.map(([a, b]) => `between(t,${a},${b})`).join('+');
  return [`aselect='${garde}'`, 'asetpts=N/SR/TB', 'highpass=f=85',
    'equalizer=f=170:t=q:w=1:g=1.5', 'equalizer=f=320:t=q:w=1.2:g=-2', 'equalizer=f=4200:t=q:w=1:g=2.5', 'deesser=i=0.35',
    'acompressor=threshold=-22dB:ratio=3:attack=8:release=140:makeup=3', `atempo=${v.vitesse}`,
    'loudnorm=I=-15:TP=-1.5:LRA=7', 'aresample=48000'].join(',');
}

function ecrire(f, dossier) {
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  fs.mkdirSync(path.join(dossier, 'assets/polices'), { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), html(f));
  fs.writeFileSync(path.join(dossier, 'feuille.json'), `${JSON.stringify(f, null, 1)}\n`);
  for (const g of PLUGINS) fs.copyFileSync(path.join(RACINE, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  for (const poids of Object.values(S.polices.fichiers)) for (const p of Object.values(poids)) fs.copyFileSync(path.join(RACINE, 'studio/polices', p), path.join(dossier, 'assets/polices', p));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(RACINE, 'videos/voix', f.voix.id, 'propre.flac'), '-af', filtreVoix(f.voix), '-c:a', 'pcm_s16le', path.join(dossier, 'assets/sons/voix.wav')]);
  const { MUSIQUES_ARRANGEES, outils } = require('../../scripts/build-sons.js');
  const mesures = Math.ceil(f.duree / (4 * 60 / 90)) + 1;
  const m = outils.normaliser(MUSIQUES_ARRANGEES[f.musique.nom]({ duree: f.duree + 0.3, parties: Array.from({ length: mesures }, () => 'plein'), coupures: [] }), 0.8);
  outils.ecrireWav(path.join(dossier, 'assets/sons/musique.wav'), m, true);
}

module.exports = { html, ecrire, filtreVoix };
