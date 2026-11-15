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
const ILLUS = require('./illustrations.js');
const DECORS = require('./decors.js');

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
/* En-tête : lisible sur tous les fonds. */
.barre { position: absolute; z-index: 90; top: 112px; left: 70px; width: 940px; height: 10px; border-radius: 5px; background: ${c.fond}; overflow: hidden; border: 2px solid ${c.fond}; }
.barre i { position: absolute; inset: 0; background: ${c.texte}; transform-origin: 0 50%; border-radius: 3px; }
.tete { position: absolute; z-index: 90; top: 146px; left: 70px; right: 70px; display: flex; justify-content: space-between; align-items: center; font: 400 26px '${P.mono}'; letter-spacing: .08em; text-transform: uppercase; }
.tete b, .tete span { background: ${c.fond}; color: ${c.texte}; padding: 10px 20px; border-radius: 30px; font-weight: 400; display: flex; align-items: center; gap: 12px; }
.tete b::before { content: ''; width: 14px; height: 14px; border-radius: 50%; background: ${acc}; }
/* Les trois fonds : nuit, papier, accent. */
.plan { position: absolute; inset: 0; overflow: hidden; background: var(--bg); color: var(--fg); }
.plan.nuit { --bg: ${c.fond}; --fg: ${c.texte}; --ac: ${acc}; }
.plan.papier { --bg: ${c.texte}; --fg: ${c.fond}; --ac: ${acc}; }
.plan.accent { --bg: ${acc}; --fg: ${c.fond}; --ac: #ffffff; }
.plan.decor, .plan.photo { --bg: ${c.fond}; --fg: ${c.texte}; --ac: ${acc}; }
${Object.entries(DECORS).filter(([, d]) => d.accent).map(([n, d]) => `.plan.${n} { --ac: ${d.accent}; }`).join('\n')}
.decor-svg, .photo-img { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.photo-img { object-fit: cover; transform-origin: 50% 50%; }
/* Le voile : le haut du décor est assombri pour que le texte du plan reste lisible. */
.voile { position: absolute; inset: 0; background: linear-gradient(to bottom, #000000b8 0, #00000099 620px, #00000000 980px); }
.decor .cadre, .photo .cadre { text-shadow: 0 3px 24px #000000aa; }
.deco, .deco i { position: absolute; display: block; }
.deco { inset: 0; }
.nuit .deco .a { left: -200px; top: -100px; width: 1480px; height: 1500px; background: radial-gradient(closest-side, ${acc}55, ${acc}00); }
.nuit .deco .b { left: 560px; top: 760px; width: 900px; height: 900px; border-radius: 50%; border: 3px solid ${acc}44; }
.papier .deco { background-image: linear-gradient(${c.fond}12 2px, transparent 2px), linear-gradient(90deg, ${c.fond}12 2px, transparent 2px); background-size: 90px 90px; }
.papier .deco .a { left: 520px; top: -260px; width: 820px; height: 820px; border-radius: 50%; background: ${acc}2e; }
.papier .deco .b { left: -260px; top: 1180px; width: 640px; height: 640px; border-radius: 80px; border: 5px solid ${acc}66; }
.accent .deco .a { left: -340px; top: 300px; width: 1760px; height: 1760px; border-radius: 50%; border: 130px solid #ffffff1f; }
.accent .deco .b { left: 600px; top: -200px; width: 700px; height: 700px; border-radius: 120px; background: ${c.fond}1f; }
.contenu { position: absolute; inset: 0; transform-origin: 540px 800px; }
.illu { position: absolute; left: 70px; top: 700px; width: 940px; height: 400px; overflow: visible; }
.cadre { position: absolute; inset: 0; padding: 270px 70px 0 70px; display: flex; flex-direction: column; gap: 34px; width: 1010px; }
em { font: italic 400 1.1em/0.9 '${P.fort}'; color: var(--ac); letter-spacing: 0; }
/* Le trait de surligneur sous le mot fort : il se trace après l'arrivée du texte. */
.trait { position: absolute; left: 0; height: 12px; border-radius: 6px; background: var(--ac); opacity: .55; transform-origin: 0 50%; }
.grand, .moyen, .conclusion { position: relative; }
.ligne { overflow: hidden; padding-bottom: .12em; margin-bottom: -.12em; }
.kicker { align-self: flex-start; font: 400 28px '${P.mono}'; letter-spacing: .08em; text-transform: uppercase; color: var(--fg); border: 2px solid var(--fg); border-radius: 40px; padding: 9px 22px; }
.grand { font: 700 108px/1.02 '${P.titre}'; letter-spacing: -.025em; }
.grand.geant { font-size: 168px; line-height: .98; letter-spacing: -.035em; }
.moyen { font: 700 76px/1.05 '${P.titre}'; letter-spacing: -.02em; }
.moyen.bas { font-weight: 500; opacity: .85; }
.filet { display: block; width: 180px; height: 8px; background: var(--ac); transform-origin: 0 50%; margin-top: 10px; }
.items { list-style: none; display: flex; flex-direction: column; gap: 22px; margin-top: 8px; }
.items li { font: 700 84px/1.05 '${P.titre}'; letter-spacing: -.02em; display: flex; align-items: center; gap: 26px; }
.items li::before { content: ''; flex: none; width: 22px; height: 22px; border-radius: 50%; background: var(--ac); }
.items li span { position: relative; }
.rature { position: absolute; left: -8px; right: -8px; top: 54%; height: 9px; background: var(--ac); transform-origin: 0 50%; }
.conclusion { font: 500 62px/1.1 '${P.titre}'; margin-top: 14px; }
.jauge { display: flex; flex-direction: column; gap: 16px; margin-top: 12px; }
.jauge p { font: 700 72px/1 '${P.titre}'; letter-spacing: -.02em; }
.jauge .rail { height: 30px; border-radius: 15px; background: color-mix(in srgb, var(--fg) 14%, transparent); overflow: hidden; width: 940px; }
.jauge i { display: block; height: 100%; border-radius: 15px; background: var(--fg); transform-origin: 0 50%; }
.jauge.d p { color: var(--ac); } .jauge.d i { background: var(--ac); }
.jauge span { font: 400 32px '${P.mono}'; opacity: .7; letter-spacing: .04em; }
.fleche { position: absolute; left: 0; top: 0; color: var(--fg); }
/* Sous-titres : dans une étiquette sombre, lisibles sur tous les fonds. */
#st { position: absolute; z-index: 95; left: 50px; width: 910px; top: 1150px; height: 220px; }
.st { position: absolute; left: 0; right: 0; top: 0; text-align: center; }
.st div { display: inline-block; background: ${c.fond}; color: ${c.texte}; padding: 16px 22px 20px; border-radius: 30px; font: 700 82px/1.05 '${P.titre}'; letter-spacing: -.02em; box-shadow: 0 14px 44px #00000066; white-space: nowrap; }
.st div { border: 2px solid #ffffff24; }
.geant + .filet { display: none; }
.st span { display: inline-block; padding: 2px .11em 6px; margin: 0 .035em; border-radius: 16px; }
.st .fort { color: ${acc}; }
.grain { z-index: 99; }`;
}

function html(f) {
  // Un même décor peut servir à deux plans : ses dégradés reçoivent un identifiant propre à chaque plan
  // (un dégradé défini dans un plan caché ne s'applique plus).
  const fond = (pl, i) => {
    if (DECORS[pl.fond]) return `<svg class="decor-svg" viewBox="0 0 1080 1920">${DECORS[pl.fond].svg().replace(/(id="|url\(#)([a-z]+-[a-z]+)/g, `$1$2-${i}`)}</svg><div class="voile"></div>`;
    if (pl.fond === 'photo') return `<img class="photo-img" src="assets/medias/${esc(pl.p.photo)}" alt=""><div class="voile"></div>`;
    return '<i class="a"></i><i class="b"></i>';
  };
  const plans = f.plans.map((pl, i) => `  <div id="plan-${i}" class="plan clip ${pl.fond}${DECORS[pl.fond] ? ' decor' : ''}" style="z-index:${i + 1}" data-start="${pl.t0}" data-duration="${pl.dClip}" data-track-index="${1 + (i % 2)}"><div class="deco">${fond(pl, i)}</div><div class="contenu"><div class="cadre">${PLANS[pl.id].dessin(pl.p, u)}</div>${pl.p.illu ? `<svg class="illu" viewBox="0 0 940 400">${ILLUS[pl.p.illu].svg(pl.p)}</svg>` : ''}</div></div>`).join('\n');
  const st = f.groupes.map((g, i) => `<div class="st" id="st-${i}"><div>${g.mots.map((m) => `<span${m.fort ? ' class="fort"' : ''}>${u.esc(m.m)}</span>`).join('')}</div></div>`).join('\n   ');
  const propre = JSON.parse(JSON.stringify(f));
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${esc(f.titre)}</title>
${PLUGINS.map((p) => `<script src="assets/${p}"></script>`).join('')}
<style>${css(f)}</style></head>
<body>
<div id="root" data-composition-id="${f.id}" data-start="0" data-duration="${f.duree}" data-width="1080" data-height="1920" data-fps="60">
 <div class="barre"><i id="prog"></i></div>
 <div class="tete"><b>${esc(f.rubrique)}</b><span>Avis · N° ${String(f.numero).padStart(2, '0')}</span></div>
${plans}
 <div id="st" class="clip" data-start="0" data-duration="${f.dureeVoix}" data-track-index="3">
   ${st}
 </div>
 ${GRAIN}
 <audio id="voix" class="clip" src="assets/sons/voix.wav" data-start="0" data-duration="${f.dureeVoix}" data-track-index="5" data-volume="${f.voix.volume}"></audio>
 <audio id="musique" class="clip" src="assets/sons/musique.wav" data-start="0" data-duration="${f.duree}" data-track-index="6" data-volume="${f.musique.volume}"></audio>
</div>
<script>
${lire('studio/avis/plans.js')}
${lire('studio/avis/illustrations.js')}
${lire('studio/avis/decors.js')}
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
// Chaque passage gardé reçoit un fondu de 12 ms à ses deux bouts : aucun clic aux raccords.
function filtreVoix(v) {
  const F = 0.012;
  const bouts = v.garde.map(([a, b], i) => `[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS,afade=t=in:d=${F},afade=t=out:st=${Math.max(0, b - a - F).toFixed(3)}:d=${F}[s${i}]`);
  const chaine = ['highpass=f=90', 'equalizer=f=160:t=q:w=1:g=2', 'equalizer=f=300:t=q:w=1.2:g=-2.5', 'equalizer=f=4500:t=q:w=1:g=3',
    'highshelf=f=9000:g=2.5', 'deesser=i=0.4',
    'acompressor=threshold=-24dB:ratio=3:attack=6:release=120:makeup=4', 'acompressor=threshold=-12dB:ratio=6:attack=2:release=80',
    `atempo=${v.vitesse}`, 'loudnorm=I=-14:TP=-1.5:LRA=6', 'aresample=48000'].join(',');
  return `${bouts.join(';')};${v.garde.map((_, i) => `[s${i}]`).join('')}concat=n=${v.garde.length}:v=0:a=1,${chaine}[out]`;
}

function ecrire(f, dossier) {
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  fs.mkdirSync(path.join(dossier, 'assets/polices'), { recursive: true });
  fs.writeFileSync(path.join(dossier, 'index.html'), html(f));
  fs.writeFileSync(path.join(dossier, 'feuille.json'), `${JSON.stringify(f, null, 1)}\n`);
  for (const g of PLUGINS) fs.copyFileSync(path.join(RACINE, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  for (const poids of Object.values(S.polices.fichiers)) for (const p of Object.values(poids)) fs.copyFileSync(path.join(RACINE, 'studio/polices', p), path.join(dossier, 'assets/polices', p));
  // Les photos de l'auteur (fond « photo ») : videos/medias/ → assets/medias/.
  f.plans.filter((pl) => pl.fond === 'photo').forEach((pl) => {
    fs.mkdirSync(path.join(dossier, 'assets/medias'), { recursive: true });
    fs.copyFileSync(path.join(RACINE, 'videos/medias', pl.p.photo), path.join(dossier, 'assets/medias', pl.p.photo));
  });
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(RACINE, 'videos/voix', f.voix.id, 'propre.flac'), '-filter_complex', filtreVoix(f.voix), '-map', '[out]', '-c:a', 'pcm_s16le', path.join(dossier, 'assets/sons/voix.wav')]);
  const { MUSIQUES_ARRANGEES, outils } = require('../../scripts/build-sons.js');
  const mesures = Math.ceil(f.duree / (4 * 60 / 90)) + 1;
  const m = outils.normaliser(MUSIQUES_ARRANGEES[f.musique.nom]({ duree: f.duree + 0.3, parties: Array.from({ length: mesures }, () => 'plein'), coupures: [] }), 0.8);
  outils.ecrireWav(path.join(dossier, 'assets/sons/musique.wav'), m, true);
}

module.exports = { html, ecrire, filtreVoix };
