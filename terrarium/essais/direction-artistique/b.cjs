// Piste B : l'écran de Mousse. Pixel art vert phosphore sur une grille de 54 × 96 cases
const path = require('node:path');
// (une case = 20 px), mouvements case par case, balayage, et un bug d'écran sur le raté.
const C = require('./commun.cjs');
const R = C.graine(5);
const entre = (a, b) => a + (b - a) * R();
const P = { g0: '#020d06', g1: '#04190c', g2: '#0b3315', g3: '#1f7a33', g4: '#4fd660', g5: '#b6ff5c', rose: '#ff5fa2', jaune: '#f6ff7a', cyan: '#5ef2ff', blanc: '#e9fff0', noir: '#020d06' };

// Une liste de cases { x, y, c } → des rectangles, fusionnés par rangée et par couleur.
function cases(liste, extra = '') {
  const parLigne = {};
  liste.forEach((k) => { (parLigne[k.y] = parLigne[k.y] || []).push(k); });
  let s = '';
  for (const y of Object.keys(parLigne)) {
    const l = parLigne[y].sort((a, b) => a.x - b.x);
    for (let i = 0; i < l.length;) {
      let j = i;
      while (j + 1 < l.length && l[j + 1].x === l[j].x + 1 && l[j + 1].c === l[i].c) j += 1;
      s += `<rect x="${l[i].x}" y="${y}" width="${j - i + 1}" height="1" fill="${l[i].c}"/>`;
      i = j + 1;
    }
  }
  return extra ? `<g ${extra}>${s}</g>` : s;
}
// Une image ASCII → des cases (origine : coin haut gauche + décalage).
function image(lignes, palette, dx = 0, dy = 0) {
  const l = [];
  lignes.forEach((ligne, y) => [...ligne].forEach((ch, x) => { if (palette[ch]) l.push({ x: x + dx, y: y + dy, c: palette[ch] }); }));
  return l;
}

// --- Le caméléon, rastérisé à partir de formes simples (repère : pieds en 0,0) ---
function cameleon() {
  const dans = (x, y) => {
    const e = (cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    const tri = (a, b, c) => { const s = (p, q, r) => (p[0] - r[0]) * (q[1] - r[1]) - (q[0] - r[0]) * (p[1] - r[1]); const d1 = s([x, y], a, b); const d2 = s([x, y], b, c); const d3 = s([x, y], c, a); return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0)); };
    const r = Math.hypot(x + 13, y + 2.5);
    return e(0, -7, 10, 5.3) || e(10, -8.5, 5.6, 4.6) || e(14, -7.5, 3.2, 2.6) || tri([7, -12], [11, -17], [13.5, -10.5])
      || (r <= 4.1 && r >= 1.7 && !(x > -13 && y > -2.5 && x < -10)) || (x >= -11.5 && x <= -8.5 && y >= -6.5 && y <= -3);
  };
  const plein = {};
  for (let y = -18; y < 0; y += 1) for (let x = -18; x < 19; x += 1) if (dans(x + 0.5, y + 0.5)) plein[`${x},${y}`] = true;
  [[5, -2], [5, -1], [6, -1], [-5, -2], [-5, -1], [-6, -1]].forEach(([x, y]) => { plein[`${x},${y}`] = true; });
  const l = [];
  for (const k of Object.keys(plein)) {
    const [x, y] = k.split(',').map(Number);
    const bord = !plein[`${x + 1},${y}`] || !plein[`${x - 1},${y}`] || !plein[`${x},${y + 1}`] || !plein[`${x},${y - 1}`];
    const haut = !plein[`${x},${y - 1}`] || !plein[`${x},${y - 2}`];
    l.push({ x, y, c: bord ? P.g3 : haut && y < -9 ? P.g5 : P.g4 });
  }
  // Bouche, anneau de l'œil.
  [[13, -7], [14, -7], [15, -7], [16, -7]].forEach(([x, y]) => l.push({ x, y, c: P.g2 }));
  for (let x = 9; x <= 13; x += 1) for (let y = -12; y <= -8; y += 1) if (x === 9 || x === 13 || y === -12 || y === -8) l.push({ x, y, c: P.g2 });
  const fond = l.filter((k) => !(k.x >= 9 && k.x <= 13 && k.y >= -12 && k.y <= -8) || k.c === P.g2);
  const taches = [[-6, -9], [-2, -11], [2, -11], [-4, -6], [1, -7], [-8, -6]];
  return { corps: cases(fond.filter((k) => !taches.some(([x, y]) => x === k.x && y === k.y))), taches: taches.map(([x, y]) => `<rect class="tache" x="${x}" y="${y}" width="1" height="1" fill="${P.g5}"/>`).join('') };
}

// --- Mise en place sur la grille ---
const PIEDS = [15, 60];
const BOUCHE = [PIEDS[0] + 17, PIEDS[1] - 7];
const P0 = [42, 40];
const P1 = [34, 31];
const OEIL = [PIEDS[0] + 11, PIEDS[1] - 10];
function ligne(a, b) { // Bresenham
  const l = []; let [x0, y0] = a; const [x1, y1] = b;
  const dx = Math.abs(x1 - x0); const dy = -Math.abs(y1 - y0); const sx = x0 < x1 ? 1 : -1; const sy = y0 < y1 ? 1 : -1; let e = dx + dy;
  for (;;) { l.push([x0, y0]); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
  return l;
}
const LANGUE = ligne(BOUCHE, [P0[0] - 1, P0[1] + 1]);
const BOUCLE = Array.from({ length: 16 }, (_, k) => { const t = Math.PI / 2 + ((k + 1) * Math.PI) / 4; return { x: Math.round(P1[0] + 5 * Math.cos(t)), y: Math.round(P1[1] - 5 + 5 * Math.sin(t)) }; });
const RETOUR = [{ x: P1[0], y: P1[1] }, { x: 40, y: 26 }, { x: 46, y: 33 }, { x: P0[0], y: P0[1] }];
const dirPupille = ([x, y]) => [Math.sign(Math.round((x - OEIL[0]) / 4)), Math.max(-1, Math.min(1, Math.sign(Math.round((y - OEIL[1]) / 4))))];

const cam = cameleon();
const mouche = `
 <g id="mouche"><g id="mouche-flotte"><g id="mouche-corps">
  ${cases(image(['.ww.ww.', '.wk.kw.', '..yyy..', '..yyy..', '...y...'], { w: P.blanc, k: P.noir, y: P.jaune }, -3, -2))}
  ${cases(image(['bb...bb'], { b: '#9fe8ff' }, -3, -3), 'id="ailes-haut" opacity="0.8"')}
  ${cases(image(['bb.....bb'], { b: '#9fe8ff' }, -4, -1), 'id="ailes-bas" opacity="0.8"')}
 </g></g></g>`;

const MOUSSE = [
  '........MmmM.......',
  '......mmmmmmmm.....',
  '.....mmMmmmmMmm....',
  '....mmmmmmmmmmmm...',
  '....oooooooooooo...',
  '...obbbbbbbbbbbbo..',
  '...obsssssbbbbbbo..',
  '...obsssssbbbbbbo..',
  '...obsssssbbbbbbo..',
  '...obsssssbbbbbbo..',
  '...obsssssbbbbbbo..',
  '...obbbbbbbbbbbbo..',
  '....obbbbbcbbbbo...',
  '.....oooooooooo....',
  '......dd....dd.....',
  '.....ddd...ddd.....',
  '.....ttt...ttt.....',
];
const pm = { M: P.g5, m: P.g4, o: '#3d5078', b: '#24324f', s: '#0a1020', c: P.cyan, d: '#151c2e', t: '#3b2a24' };
const MX = 34; const MY = 64;
const mousse = `
 <g id="mousse-b"><g id="mousse-battement">
  ${cases(image(MOUSSE, pm, MX, MY))}
  <g id="oeil-neutre">${cases(image(['ccc', 'ccc', 'ccc'], { c: P.cyan }, MX + 6, MY + 7))}</g>
  <g id="oeil-blase" opacity="0">${cases(image(['ccc'], { c: P.cyan }, MX + 6, MY + 9))}</g>
  ${cases(ligne([MX + 2, MY + 8], [MX - 4, MY - 2]).map(([x, y]) => ({ x, y, c: '#151c2e' })))}
  <g id="lanterne-b">
   ${cases(image(['..y..', '.yyy.', 'yyyyy', '.yyy.', '..y..'], { y: P.jaune }, MX - 7, MY - 3), 'opacity="0.18"')}
   ${cases(image(['.o.', 'ooo', 'oYo', 'oYo', 'ooo'], { o: '#151c2e', Y: P.jaune }, MX - 6, MY - 2))}
  </g>
  <g id="main" opacity="0">${cases(image(['.oo.', 'oooo', 'oooo', '.oo.'], { o: '#3d5078' }, MX + 5, MY + 6))}</g>
 </g></g>`;

const etoiles = Array.from({ length: 34 }, () => { const x = Math.floor(entre(1, 53)); const y = Math.floor(entre(18, 50)); return `<rect class="etoile" x="${x}" y="${y}" width="1" height="1" fill="${R() < 0.3 ? P.g5 : P.g3}"/>`; }).join('');
const lune = cases((() => { const l = []; for (let y = -6; y <= 6; y += 1) for (let x = -6; x <= 6; x += 1) { const d = Math.hypot(x, y); if (d <= 6.2) l.push({ x: 46 + x, y: 22 + y, c: d > 5.2 ? P.g4 : (x === -2 && y === -1) || (x === 2 && y === 2) || (x === 1 && y === -3) ? P.g4 : P.g5 }); } return l; })(), 'opacity="0.9"');
const feuillage = (x0, y0, n, coul, graine) => { const h = C.graine(graine); const l = []; for (let k = 0; k < n; k += 1) { const cx = x0 + h() * 14 - 7; const cy = y0 + h() * 10 - 5; const r = 2 + h() * 3; for (let y = -6; y <= 6; y += 1) for (let x = -6; x <= 6; x += 1) if (Math.hypot(x, y * 1.4) <= r) l.push({ x: Math.round(cx + x), y: Math.round(cy + y), c: coul }); } const vus = {}; return cases(l.filter((k) => { const c = `${k.x},${k.y}`; if (vus[c]) return false; vus[c] = 1; return true; })); };
const branche = cases([...ligne([-2, 63], [56, 54]).map(([x, y]) => ({ x, y, c: P.g3 })), ...ligne([-2, 64], [56, 55]).map(([x, y]) => ({ x, y, c: P.g2 })), ...ligne([-2, 65], [56, 56]).map(([x, y]) => ({ x, y, c: P.g2 }))]);

const monde = `
 <rect x="-5" y="0" width="64" height="96" fill="${P.g0}"/>
 <g id="couche-loin">${etoiles}${lune}${feuillage(4, 84, 6, P.g1, 7)}${feuillage(50, 80, 5, P.g1, 8)}</g>
 <g id="couche-milieu">${feuillage(2, 70, 5, P.g2, 9)}${feuillage(52, 66, 4, P.g2, 10)}${cases(ligne([6, 0], [5, 20]).map(([x, y]) => ({ x, y, c: P.g2 })))}${cases(ligne([48, 0], [50, 14]).map(([x, y]) => ({ x, y, c: P.g2 })))}</g>
 <g id="couche-action">
  ${branche}
  <g id="cam" transform="translate(${PIEDS[0]} ${PIEDS[1]})"><g id="cam-corps">
   ${cam.corps}${cam.taches}
   <g id="sclere">${cases(image(['www', 'www', 'www'], { w: P.blanc }, 10, -11))}</g>
   <rect id="pupille" x="11" y="-10" width="1" height="1" fill="${P.noir}"/>
  </g></g>
  <g id="langue-b">${LANGUE.map(([x, y], i) => `<rect class="lg" data-i="${i}" x="${x}" y="${y}" width="1" height="1" fill="${P.rose}"/>`).join('')}</g>
  <rect id="langue-bout" x="${LANGUE[0][0]}" y="${LANGUE[0][1]}" width="2" height="2" fill="#ff9fd0"/>
  ${mouche}
 </g>
 <g id="couche-pres">${feuillage(-2, 92, 6, '#010804', 11)}${feuillage(56, 4, 4, '#010804', 12)}</g>
 ${mousse}`;

const svg = `<svg id="scene" width="1080" height="1920" viewBox="0 0 54 96" shape-rendering="crispEdges">
 <defs>
  <filter id="phosphore" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.35" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="magenta"><feColorMatrix values="1 0 0 0 0.3  0 0 0 0 0  0 0 1 0 0.3  0 0 0 0.6 0"/></filter>
 </defs>
 <g id="monde" filter="url(#phosphore)">${monde}</g>
 <use id="fantome" href="#monde" filter="url(#magenta)" opacity="0"/>
</svg>`;

const css = C.CSS_TERMINAL + `
.term { background: transparent; border: none; box-shadow: none; top: 170px; }
.term::after { display: none; }
.term .ligne { font-size: 54px; }
.crt { position: absolute; inset: 0; pointer-events: none; border-radius: 46px;
  background: repeating-linear-gradient(0deg, rgba(0,0,0,.32) 0 3px, transparent 3px 6px),
              radial-gradient(ellipse at 50% 45%, transparent 55%, rgba(0,0,0,.85) 100%);
  box-shadow: inset 0 0 120px rgba(0,0,0,.9), inset 0 0 0 14px #010402; }
.reflet { position: absolute; left: 60px; top: 50px; width: 520px; height: 300px; pointer-events: none; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(182,255,92,.07), transparent 70%); }
`;

const S = (o) => JSON.stringify(o);
const js = `
  var cases = { snap: { x: 1, y: 1 } };
  var bloc = function (v) { return Object.assign({}, v, cases); };
  // Parallaxe en cases entières.
  [['#couche-loin', 1], ['#couche-milieu', 2], ['#couche-action', 1], ['#couche-pres', 4]].forEach(function (c) {
    ft(q(c[0]), { x: 0 }, bloc({ x: -c[1], duration: D / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }), 0);
  });
  qa('.etoile').forEach(function (e, i) { cycle(e, { opacity: 1 }, { opacity: 0.2 }, T * (1 + (i % 4)), 'steps(1)'); });
  qa('.tache').forEach(function (t, i) { cycle(t, { opacity: 1 }, { opacity: 0.35 }, T, 'steps(1)'); });

  // Le caméléon : recul d'une case, élan, langue case par case.
  var corps = q('#cam-corps');
  ft(corps, { x: 0 }, { x: -1, duration: 0.01 }, b(4.3));
  ft(corps, { x: -1 }, { x: 1, duration: 0.01 }, b(4.95));
  ft(corps, { x: 1 }, { x: 0, duration: 0.01 }, b(5.8));
  var lg = qa('.lg'); var n = lg.length; var bout = q('#langue-bout');
  var L = ${S(LANGUE)};
  repos(lg, { opacity: 0 }); repos(bout, { opacity: 0 });
  lg.forEach(function (c, i) { tl.set(c, { opacity: 1 }, b(5) + i * 0.1 / n); tl.set(c, { opacity: 0 }, b(5) + 0.18 + (n - i) * 0.2 / n); });
  tl.set(bout, { opacity: 1 }, b(5));
  L.forEach(function (p, i) { tl.set(bout, { attr: { x: p[0] - 0.5, y: p[1] - 0.5 } }, b(5) + i * 0.1 / n); });
  L.slice().reverse().forEach(function (p, i) { tl.set(bout, { attr: { x: p[0] - 0.5, y: p[1] - 0.5 } }, b(5) + 0.18 + i * 0.2 / n); });
  tl.set(bout, { opacity: 0 }, b(5) + 0.4);
  [b(6), b(6.6)].forEach(function (t) { tl.set(q('#sclere'), { opacity: 0 }, t); tl.set(q('#sclere'), { opacity: 1 }, t + 0.09); });

  // Le bug d'écran sur le raté.
  var monde = q('#monde'); var fantome = q('#fantome');
  [[0, 2, 0.6], [0.05, -1, 0.5], [0.1, 1, 0.3], [0.16, 0, 0]].forEach(function (g) {
    tl.set(monde, { x: g[1] }, b(5.4) + g[0]); tl.set(fantome, { opacity: g[2], x: -g[1] - 1 }, b(5.4) + g[0]);
  });
  repos(fantome, { opacity: 0 });

  // La pupille regarde la mouche (une case dans le sens de la mouche).
  var pup = q('#pupille');
  var regarder = function (d, t) { tl.set(pup, { attr: { x: 11 + d[0], y: -10 + d[1] } }, t); };
  repos(pup, { attr: { x: 11 + ${S(dirPupille(P0))}[0], y: -10 + ${S(dirPupille(P0))}[1] } });
  regarder(${S(dirPupille(P1))}, b(5) + 0.1);

  // La mouche.
  var m = q('#mouche'); var mc = q('#mouche-corps');
  repos(m, { x: ${P0[0]}, y: ${P0[1]} });
  cycle(q('#mouche-flotte'), { y: 0 }, { y: -1 }, T, 'steps(1)');
  cycle(q('#ailes-haut'), { opacity: 0.8 }, { opacity: 0 }, D / 40, 'steps(1)');
  cycle(q('#ailes-bas'), { opacity: 0 }, { opacity: 0.8 }, D / 40, 'steps(1)');
  ft(m, { x: ${P0[0]}, y: ${P0[1]} }, bloc({ x: ${P1[0]}, y: ${P1[1]}, duration: 0.15, ease: 'power3.out' }), b(5));
  [0, 1, 2, 3].forEach(function (k) { tl.set(mc, { scaleX: k % 2 ? 1 : -1 }, b(5) + k * 0.06); });
  tl.set(mc, { scaleX: 1 }, b(5) + 0.24);
  ft(mc, { x: 0 }, { x: 1, duration: T / 4, yoyo: true, repeat: 9, ease: 'steps(1)' }, b(5.6));
  var boucle = ${S(BOUCLE)};
  boucle.forEach(function (p, k) { tl.set(m, { x: p.x, y: p.y }, b(8) + (k + 1) * b(4) / 16); regarder(${dirPupille.toString().replace(/\n/g, ' ')}.call(null, [p.x, p.y]), b(8) + (k + 1.5) * b(4) / 16); });
  ft(m, { x: ${P1[0]}, y: ${P1[1]} }, bloc({ motionPath: { path: ${S(RETOUR)}, curviness: 1.2 }, duration: b(3), ease: 'sine.inOut' }), b(12));
  regarder(${S(dirPupille([40, 26]))}, b(12)); regarder(${S(dirPupille([46, 33]))}, b(13)); regarder(${S(dirPupille(P0))}, b(14));

  // Mousse.
  cycle(q('#mousse-battement'), { y: 0 }, { y: 1 }, T, 'steps(1)');
  cycle(q('#lanterne-b'), { opacity: 1 }, { opacity: 0.75 }, T, 'steps(1)');
  repos(q('#oeil-neutre'), { opacity: 1 }); repos(q('#oeil-blase'), { opacity: 0 }); repos(q('#main'), { opacity: 0 });
  tl.set(q('#oeil-neutre'), { opacity: 0 }, b(5.5)); tl.set(q('#oeil-blase'), { opacity: 1 }, b(5.5));
  tl.set(q('#main'), { opacity: 1 }, b(5.6)); tl.set(q('#main'), { opacity: 0 }, b(9.6));
  tl.set(q('#oeil-blase'), { opacity: 0 }, b(12)); tl.set(q('#oeil-neutre'), { opacity: 1 }, b(12));
  taper(0.12, 0.045);
`;

C.ecrire(path.join(__dirname, 'sortie', 'B'), {
  id: 'piste-b', titre: "Piste B · l'écran de Mousse", svg, css,
  apres: C.terminal('mon IA *rate* tout.') + '<div class="reflet"></div><div class="crt"></div>',
  js, sons: [{ f: 'clavier.wav', t: 0.12, v: 0.35 }, { f: 'fwip.wav', t: C.b(5), v: 0.9 }, { f: 'bip.wav', t: C.b(5.6), v: 0.5 }],
});
console.log('B écrite');
