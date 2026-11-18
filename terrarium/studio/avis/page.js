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
const THEMES = require('./themes.js');
const PAL = require('./palettes.js');
const DECORS3D = require('./decors3d.js');
const PERSO = require('./personnage.js');
const ORBE = require('./orbe.js');

const RACINE = path.join(__dirname, '../..');
const lire = (f) => fs.readFileSync(path.join(RACINE, f), 'utf8');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const typo = (s) => String(s).replace(/'/g, '’').replace(/ ([?!:;»])/g, ' $1').replace(/« /g, '« ');
const md = (s) => esc(typo(s)).replace(/\*([^*]+)\*/g, '<em>$1</em>');
const u = { esc: (s) => esc(typo(s)), md };
const PLUGINS = ['gsap.min.js', 'SplitText.min.js', 'DrawSVGPlugin.min.js'];
const GRAIN = '<svg class="grain" width="1080" height="1920"><filter id="g"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter><rect width="100%" height="100%" filter="url(#g)" opacity="0.1"/></svg>';

function css(f) {
  const pal = PAL.PALETTES[f.palette] || PAL.PALETTES[S.palette];
  const c = pal.couleurs, P = S.polices, acc = f.accent;
  const fontes = Object.entries(P.fichiers).flatMap(([fam, poids]) => Object.entries(poids).map(([w, fichier]) =>
    `@font-face{font-family:'${fam}';font-weight:${w};font-style:${/italic/.test(fichier) ? 'italic' : 'normal'};src:url(assets/polices/${fichier}) format('woff2');font-display:block}`)).join('\n');
  return `${fontes}
* { box-sizing: border-box; margin: 0; padding: 0; } html, body { background: ${c.fond}; }
#root { position: relative; width: 1080px; height: 1920px; overflow: hidden; color: ${c.texte}; font-family: '${P.titre}'; background: ${c.fond}; }
/* Les trois fonds : nuit, papier, accent. */
.plan { position: absolute; inset: 0; overflow: hidden; background: var(--bg); color: var(--fg); }
.plan.nuit { --bg: ${c.fond}; --fg: ${c.texte}; --ac: ${acc}; }
.plan.papier { --bg: ${c.texte}; --fg: ${c.fond}; --ac: ${acc}; }
.plan.accent { --bg: ${acc}; --fg: ${c.fond}; --ac: #ffffff; }
.plan.decor, .plan.photo { --bg: ${c.fond}; --fg: ${c.texte}; --ac: ${acc}; }
${/* Chaque décor a son accent ; sauf avec une autre palette que l'originale, où l'accent de la palette prime. */ (f.palette || S.palette) !== 'vive' ? '' : Object.entries(Object.assign({}, DECORS, DECORS3D)).filter(([, d]) => d.accent).map(([n, d]) => `.plan.${n} { --ac: ${d.accent}; }`).join('\n')}
.decor-svg, .photo-img, .decor-3d { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
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
/* Plan sans texte : l'illustration prend la place, plus grande ; le décor n'est pas assombri. */
.sans-texte .illu { left: 30px; top: 520px; width: 1020px; height: 434px; }
.sans-texte .voile { display: none; }
.rebours { position: absolute; left: 280px; top: 520px; width: 520px; height: 520px; }
.rebours svg { position: absolute; left: 0; top: 0; }
.rebours span { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font: 700 300px/1 '${P.titre}'; letter-spacing: -.04em; }
/* Le personnage récurrent : au-dessus du décor, avec l'ombre nette du papier découpé. */
.perso-svg { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: visible; filter: drop-shadow(6px 8px 0 #00000030); }
.avec-perso .figurant, .avec-perso .corde { display: none; }
/* Le collage : un autocollant. Un contour blanc épais (huit ombres sans flou), puis une ombre nette. */
.collage { position: absolute; z-index: 6; height: auto; transform-origin: 50% 100%; filter: drop-shadow(7px 0 0 #fff) drop-shadow(-7px 0 0 #fff) drop-shadow(0 7px 0 #fff) drop-shadow(0 -7px 0 #fff) drop-shadow(5px 5px 0 #fff) drop-shadow(-5px 5px 0 #fff) drop-shadow(5px -5px 0 #fff) drop-shadow(-5px -5px 0 #fff) drop-shadow(14px 16px 0 #00000055); }
/* Sur une photo, la question passe en haut : en bas, elle cacherait l'auteur (le zoom le place entre y 900 et 1350). */
.plan.photo .question { top: 300px; }
/* Un autocollant remplace le figurant du décor (le grimpeur, la corde). */
.avec-collage .figurant, .avec-collage .corde { display: none; }
/* Une photo « naturelle » garde ses couleurs : ni l'étalonnage de la palette, ni les couleurs vives du thème. */
.plan.naturel .deco, .plan.naturel .photo-img { filter: none; }
/* La question de fin : une grande étiquette de papier dans le décor, à la place des sous-titres. */
.question { position: absolute; left: 60px; width: 880px; top: 1180px; text-align: center; transform-origin: 50% 50%; }
.question p { display: inline-block; background: ${c.texte}; color: ${c.fond}; font: 700 92px/1.06 '${P.titre}'; letter-spacing: -.025em; padding: 26px 36px 32px; border-radius: 14px; box-shadow: 12px 12px 0 ${c.fond}; }
.question em { color: ${acc}; }
.kicker.repere { font-size: 34px; opacity: 1; padding: 12px 28px; background: var(--fg); color: var(--bg); border-color: var(--fg); }
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
#orbe { position: absolute; z-index: 90; left: 90px; top: 550px; width: 900px; height: 900px; pointer-events: none; }
#st { position: absolute; z-index: 95; left: 50px; width: 910px; top: 1300px; height: 220px; }
.st { position: absolute; left: 0; right: 0; top: 0; text-align: center; }
.st div { display: inline-block; background: ${c.fond}; color: ${c.texte}; padding: 16px 22px 20px; border-radius: 30px; font: 700 82px/1.05 '${P.titre}'; letter-spacing: -.02em; box-shadow: 0 14px 44px #00000066; white-space: nowrap; }
.st div { border: 2px solid #ffffff24; }
.geant + .filet { display: none; }
.st span { display: inline-block; padding: 2px .11em 6px; margin: 0 .035em; border-radius: 16px; }
.st .fort { color: ${acc}; }
.grain { z-index: 99; }
/* --- thème « ${f.theme} » --- */
${THEMES[f.theme || 'decoupe'].css(f, c)}
/* --- palette « ${f.palette || S.palette} » : l'étalonnage des décors --- */
${PAL.regle(pal)}`;
}

function html(f) {
  // Un même décor peut servir à deux plans : ses dégradés reçoivent un identifiant propre à chaque plan
  // (un dégradé défini dans un plan caché ne s'applique plus).
  const fond = (pl, i) => {
    if (DECORS[pl.fond]) return `<svg class="decor-svg" viewBox="0 0 1080 1920">${DECORS[pl.fond].svg().replace(/(id="|url\(#)([a-z]+-[a-z]+)/g, `$1$2-${i}`)}</svg><div class="voile"></div>`;
    if (DECORS3D[pl.fond]) return '<canvas class="decor-3d" width="1080" height="1920"></canvas><div class="voile"></div>';
    if (pl.fond === 'photo') return `<img class="photo-img" src="assets/medias/${esc(pl.p.photo.fichier)}" alt="" style="object-position: ${Math.round(pl.p.photo.cadrage * 100)}% 50%; transform-origin: ${Math.round(pl.p.photo.cadrage * 100)}% 85%"><div class="voile"></div>`;
    return '<i class="a"></i><i class="b"></i>';
  };
  // Le personnage : un calque posé sur le décor, à la place que le décor lui a faite. Le figurant du décor est alors caché.
  const perso = (pl) => { const pl0 = PERSO.PLACES[pl.fond] && PERSO.placer(f.allure, PERSO.PLACES[pl.fond]); return pl.p.personnage && pl0 ? `<svg class="perso-svg" viewBox="0 0 1080 1920"><g transform="translate(${pl0.x} ${pl0.y}) scale(${pl0.taille})">${PERSO.svg(pl.p.personnage, f.allure)}</g></svg>` : ''; };
  // Le collage : des photos détourées posées sur le décor, avec un contour blanc et une ombre nette (un autocollant). Jamais inclinées.
  const collage = (pl) => (pl.p.collage || []).map((co) => { const w = Math.round(1080 * (co.taille || 0.45)); return `<img class="collage" src="assets/medias/${esc(co.image)}" alt="" style="left:${Math.round(co.x - w / 2)}px; top:${Math.round(co.y)}px; width:${w}px">`; }).join('');
  const plans = f.plans.map((pl, i) => `  <div id="plan-${i}" class="plan clip ${pl.fond}${DECORS[pl.fond] || DECORS3D[pl.fond] ? ' decor' : ''}${pl.id === 'visuel' ? ' sans-texte' : ''}${pl.p.personnage ? ' avec-perso' : ''}${pl.fond === 'photo' && pl.p.photo.naturel ? ' naturel' : ''}${(pl.p.collage || []).length ? ' avec-collage' : ''}" style="z-index:${i + 1}" data-start="${pl.t0}" data-duration="${pl.dClip}" data-track-index="${1 + (i % 2)}"><div class="deco">${fond(pl, i)}${perso(pl)}</div><div class="contenu"><div class="cadre">${PLANS[pl.id].dessin(pl.p, u)}</div>${collage(pl)}${pl.p.question ? `<div class="question"><p>${u.md(pl.p.question.texte)}</p></div>` : ''}${pl.p.illu ? `<svg class="illu" viewBox="0 0 940 400">${ILLUS[pl.p.illu].svg(pl.p)}</svg>` : ''}</div></div>`).join('\n');
  const st = f.groupes.map((g, i) => `<div class="st" id="st-${i}"><div>${g.mots.map((m) => `<span${m.fort ? ' class="fort"' : ''}>${u.esc(m.m)}</span>`).join('')}</div></div>`).join('\n   ');
  const propre = JSON.parse(JSON.stringify(f));
  const troisD = f.plans.some((pl) => DECORS3D[pl.fond]);
  const theme = THEMES[f.theme || 'decoupe'];
  const palette = PAL.PALETTES[f.palette] || PAL.PALETTES[S.palette];
  propre.mot = theme.mot(f, palette.couleurs);
  return `<!doctype html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=1080, height=1920">
<title>${esc(f.titre)}</title>
${PLUGINS.map((p) => `<script src="assets/${p}"></script>`).join('')}${troisD ? '<script src="assets/three.min.js"></script>' : ''}
<style>${css(f)}</style></head>
<body>
${theme.filtre || ''}${palette.etalonnage && palette.etalonnage.echelle ? PAL.filtreEchelle(palette.etalonnage.echelle) : ''}
<div id="root" data-composition-id="${f.id}" data-start="0" data-duration="${f.duree}" data-width="1080" data-height="1920" data-fps="60">
${plans}
 ${f.orbe ? `<canvas id="orbe" class="clip" width="900" height="900" data-start="0" data-duration="${f.duree}" data-track-index="4"></canvas>` : ''}
 <div id="st" class="clip" data-start="0" data-duration="${f.dureeVoix}" data-track-index="3">
   ${st}
 </div>
 ${GRAIN}
 <audio id="son" class="clip" src="assets/sons/mixage.wav" data-start="0" data-duration="${f.duree}" data-track-index="5" data-volume="1"></audio>
</div>
<script>
${lire('studio/avis/plans.js')}
${lire('studio/avis/illustrations.js')}
${lire('studio/avis/decors.js')}
${lire('studio/avis/personnage.js')}
${f.orbe ? lire('studio/avis/orbe.js') : ''}
${troisD ? lire('studio/avis/decors3d.js') : ''}
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
  // Une pause demandée (compte à rebours) : du silence ajouté à la fin du passage ; il est allongé de `vitesse` car l'accélération vient après.
  const pause = (i) => (v.pauses || []).filter((p) => p.k === i).map((p) => `,apad=pad_dur=${(p.d * v.vitesse).toFixed(3)}`).join('');
  const bouts = v.garde.map(([a, b], i) => `[0:a]atrim=${a}:${b},asetpts=PTS-STARTPTS,afade=t=in:d=${F},afade=t=out:st=${Math.max(0, b - a - F).toFixed(3)}:d=${F}${pause(i)}[s${i}]`);
  const chaine = ['highpass=f=90', 'equalizer=f=160:t=q:w=1:g=2', 'equalizer=f=300:t=q:w=1.2:g=-2.5', 'equalizer=f=4500:t=q:w=1:g=3',
    'highshelf=f=9000:g=2.5', 'deesser=i=0.4',
    'acompressor=threshold=-24dB:ratio=3:attack=6:release=120:makeup=4', 'acompressor=threshold=-12dB:ratio=6:attack=2:release=80',
    `atempo=${v.vitesse}`, 'loudnorm=I=-14:TP=-1.5:LRA=6', 'aresample=48000'].join(',');
  return `${bouts.join(';')};${v.garde.map((_, i) => `[s${i}]`).join('')}concat=n=${v.garde.length}:v=0:a=1,${chaine}[out]`;
}

// Le volume de la musique au fil du temps : fort quand l'auteur se tait, bas pendant chaque « creux » (il parle),
// avec une descente de 0,3 s et une remontée de 0,5 s. Expression lue par le filtre « volume » de ffmpeg.
function volumeMusique(mu) {
  const creux = (mu.creux || []).map(([a, b]) => `clip((t-${Math.max(0, a - 0.3).toFixed(2)})/${a < 0.3 ? '0.01' : '0.3'},0,1)*clip((${(b + 0.5).toFixed(2)}-t)/0.5,0,1)`);
  if (!creux.length || mu.seule <= mu.volume) return String(mu.volume);
  return `${mu.seule}-${(mu.seule - mu.volume).toFixed(3)}*min(1,${creux.join('+')})`;
}

// Les photos de l'auteur ne sont pas dans le dépôt (voir .gitignore) : un fichier absent est une erreur claire, pas un plantage.
function copierMedia(nom, dossier) {
  const source = path.join(RACINE, 'videos/medias', nom);
  if (!fs.existsSync(source)) throw new Error(`la photo « ${nom} » manque dans videos/medias/ : elle n'est pas dans le dépôt, redemande-la à l'auteur (voir production/PASSATION-AVIS.md)`);
  fs.copyFileSync(source, path.join(dossier, 'assets/medias', nom));
}

function ecrire(f, dossier) {
  fs.mkdirSync(path.join(dossier, 'assets/sons'), { recursive: true });
  fs.mkdirSync(path.join(dossier, 'assets/polices'), { recursive: true });
  if (f.plans.some((pl) => DECORS3D[pl.fond])) fs.copyFileSync(path.join(RACINE, 'node_modules/three/build/three.min.js'), path.join(dossier, 'assets/three.min.js'));
  for (const g of PLUGINS) fs.copyFileSync(path.join(RACINE, 'node_modules/gsap/dist', g), path.join(dossier, 'assets', g));
  for (const p of THEMES[f.theme || 'decoupe'].polices) fs.copyFileSync(path.join(RACINE, 'studio/polices', p), path.join(dossier, 'assets/polices', p));
  for (const poids of Object.values(S.polices.fichiers)) for (const p of Object.values(poids)) fs.copyFileSync(path.join(RACINE, 'studio/polices', p), path.join(dossier, 'assets/polices', p));
  // Les photos de l'auteur (fond « photo ») : videos/medias/ → assets/medias/.
  f.plans.filter((pl) => pl.fond === 'photo').forEach((pl) => {
    fs.mkdirSync(path.join(dossier, 'assets/medias'), { recursive: true });
    copierMedia(pl.p.photo.fichier, dossier);
  });
  f.plans.forEach((pl) => (pl.p.collage || []).forEach((co) => { fs.mkdirSync(path.join(dossier, 'assets/medias'), { recursive: true }); copierMedia(co.image, dossier); }));
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(RACINE, 'videos/voix', f.voix.id, 'propre.flac'), '-filter_complex', filtreVoix(f.voix), '-map', '[out]', '-c:a', 'pcm_s16le', path.join(dossier, 'assets/sons/voix.wav')]);
  // L'orbe suit le vrai rythme de la voix montée : on mesure son énergie, 60 fois par seconde (repli : les mots, déjà dans la feuille).
  if (f.orbe) {
    try {
      const brut = execFileSync('ffmpeg', ['-v', 'error', '-i', path.join(dossier, 'assets/sons/voix.wav'), '-ac', '1', '-ar', '8000', '-f', 's16le', '-'], { maxBuffer: 1 << 28 });
      const ech = new Float32Array(brut.length >> 1); for (let i = 0; i < ech.length; i += 1) ech[i] = brut.readInt16LE(i * 2) / 32768;
      const n = ORBE.niveauxAudio(ech, 8000, 60);
      while (n.length < Math.ceil(f.duree * 60) + 1) n.push(0);
      f.orbe.pas = 60; f.orbe.niveaux = n; f.orbe.source = 'voix';
    } catch (e) { f.orbe.source = 'mots'; }
  }
  fs.writeFileSync(path.join(dossier, 'index.html'), html(f));
  fs.writeFileSync(path.join(dossier, 'feuille.json'), `${JSON.stringify(f, null, 1)}\n`);
  const { MUSIQUES_ARRANGEES, outils } = require('../../scripts/build-sons.js');
  const { BRUITAGES } = require('../../scripts/sons-v3.js');
  const sons = path.join(dossier, 'assets/sons');
  const AVIS = require('../../scripts/sons-avis.js');
  const fabriques = Object.assign({}, BRUITAGES, AVIS.BRUITAGES);
  for (const b of new Set((f.sons || []).map((x) => x.f))) outils.ecrireWav(path.join(dossier, 'assets/sons', b), outils.normaliser(fabriques[b](f.musique.indicatif), 0.89), true);
  // La musique : celle du compte (construite sur l'indicatif, une instrumentation par rubrique), l'ancienne « labo », ou aucune.
  let m;
  if (f.musique.nom === 'avis') m = outils.normaliser(AVIS.musique({ duree: f.duree + 0.3, rubrique: f.musique.rubrique, indicatif: f.musique.indicatif }), 0.8);
  else if (AVIS.VIVES[f.musique.nom]) m = outils.normaliser(AVIS.vive(f.musique.nom, { duree: f.duree + 0.3, plein: f.musique.plein }), 0.8);
  else if (f.musique.nom === 'aucune') m = outils.tampon(f.duree + 0.3);
  else m = outils.normaliser(MUSIQUES_ARRANGEES[f.musique.nom]({ duree: f.duree + 0.3, parties: Array.from({ length: Math.ceil(f.duree / (4 * 60 / 90)) + 1 }, () => 'plein'), coupures: [] }), 0.8);
  outils.ecrireWav(path.join(dossier, 'assets/sons/musique.wav'), m, true);
  // Le mixage est fait ici, en un seul fichier (voix, musique, bruitages), avec un limiteur à -3 dB :
  // laissé au moteur de rendu, le niveau d'ensemble changeait d'une vidéo à l'autre.
  const bruits = f.sons || [];
  const entrees = ['-i', path.join(sons, 'voix.wav'), '-i', path.join(sons, 'musique.wav'), ...bruits.flatMap((b) => ['-i', path.join(sons, b.f)])];
  const pistes = [`[0:a]volume=${f.voix.volume}[v]`, `[1:a]volume='${volumeMusique(f.musique)}':eval=frame[m]`, ...bruits.map((b, i) => `[${i + 2}:a]${b.duree ? `atrim=0:${b.duree},afade=t=in:d=0.6,afade=t=out:st=${Math.max(0, b.duree - 0.9).toFixed(3)}:d=0.9,` : ''}volume=${b.v},adelay=${Math.round(b.t * 1000)}:all=1[b${i}]`)];
  const mixage = `${pistes.join(';')};[v][m]${bruits.map((_, i) => `[b${i}]`).join('')}amix=inputs=${2 + bruits.length}:normalize=0:duration=longest,alimiter=limit=0.7:level=disabled,atrim=0:${f.duree},aresample=48000[out]`;
  execFileSync('ffmpeg', ['-v', 'error', '-y', ...entrees, '-filter_complex', mixage, '-map', '[out]', '-c:a', 'pcm_s16le', path.join(sons, 'mixage.wav')]);
}

module.exports = { html, ecrire, filtreVoix, volumeMusique };
