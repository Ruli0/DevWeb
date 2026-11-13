// Pistes A et C : même caméléon, même mouche, même mise en scène ; seul le rendu change.
// Repère du caméléon : origine entre les pattes, tourné vers la droite.
const G = {
  queue: 'M -78 -28 C -125 -24 -158 10 -146 48 C -136 80 -98 80 -94 54 C -91 36 -110 32 -114 46',
  corps: 'M -80 -22 C -92 -72 -42 -112 18 -108 C 50 -106 66 -98 78 -104 L 100 -134 C 122 -114 152 -80 162 -48 C 152 -32 124 -20 92 -20 C 52 -6 -38 -4 -80 -22 Z',
  ventre: 'M -76 -24 C -30 -10 46 -10 96 -22 L 92 -19 C 52 -5 -38 -3 -80 -21 Z',
  patteAv: 'M 52 -22 L 66 2 L 74 20',
  patteAr: 'M -40 -20 L -54 2 L -42 20',
  bouche: 'M 160 -46 C 144 -42 128 -41 114 -39',
  taches: [[-52, -80, 8], [-18, -98, 9], [20, -102, 7], [54, -96, 6], [-30, -58, 5], [8, -72, 6], [-62, -50, 4]],
  oeil: [112, -72],
  pieds: [0, 20],
  bouchePt: [160, -46],
};
const CAM = { x: 380, y: 920, s: 2.2 };
const P0 = [820, 640];
const P1 = [700, 540];
const local = ([x, y]) => [+((x - CAM.x) / CAM.s).toFixed(2), +((y - CAM.y) / CAM.s).toFixed(2)];
const oeilEcran = [CAM.x + G.oeil[0] * CAM.s, CAM.y + G.oeil[1] * CAM.s];
const angle = ([x, y]) => +(Math.atan2(y - oeilEcran[1], x - oeilEcran[0]) * 180 / Math.PI).toFixed(1);

// Trajets de la mouche (coordonnées d'écran).
function boucles() {
  const c = [P1[0], P1[1] - 60]; const pts = [];
  for (let k = 1; k <= 16; k += 1) { const t = Math.PI / 2 + (k * Math.PI) / 4; pts.push({ x: +(c[0] + 60 * Math.cos(t)).toFixed(1), y: +(c[1] + 60 * Math.sin(t)).toFixed(1) }); }
  return pts;
}
const RETOUR = [{ x: P1[0], y: P1[1] }, { x: 780, y: 480 }, { x: 870, y: 560 }, { x: P0[0], y: P0[1] }];

// La mise en scène (code navigateur). mode : « vol » (A) ou « fil » (C).
function mise(mode) {
  const cible = local(P0);
  const pts = boucles();
  return `
  // --- Parallaxe : chaque couche glisse à sa vitesse, et revient (la vidéo boucle).
  [['#couche-loin', 10], ['#couche-milieu', 24], ['#couche-action', 34], ['#couche-pres', 80]].forEach(function (c) {
    if (q(c[0])) ft(q(c[0]), { x: 0 }, { x: -c[1], duration: D / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 0);
  });
  qa('.spore').forEach(function (s, i) {
    var p = D / (1 + (i % 3));
    cycle(s, { y: 0, x: 0 }, { y: -30 - (i % 5) * 8, x: (i % 2 ? 12 : -12) }, p);
  });
  qa('.tache').forEach(function (t) { cycle(t, { opacity: 0.55 }, { opacity: 1 }, T); });

  // --- Le caméléon : respire, s'élance (anticipation, élan, rebond), tire la langue, cligne.
  cycle(q('#cam-respire'), { scaleY: 1, svgOrigin: '0 20' }, { scaleY: 1.025, svgOrigin: '0 20' }, 2 * T);
  var corps = q('#cam-corps');
  repos(corps, { rotation: 0, svgOrigin: '0 20' });
  ft(corps, { rotation: 0, svgOrigin: '0 20' }, { rotation: -7, svgOrigin: '0 20', duration: b(0.7), ease: 'power2.out' }, b(4.2));
  ft(corps, { rotation: -7, svgOrigin: '0 20' }, { rotation: 4, svgOrigin: '0 20', duration: 0.08, ease: 'power3.out' }, b(4.95));
  ft(corps, { rotation: 4, svgOrigin: '0 20' }, { rotation: 0, svgOrigin: '0 20', duration: 0.6, ease: 'elastic.out(1, 0.4)' }, b(4.95) + 0.08);
  var langue = q('#langue'); var bout = q('#langue-bout');
  repos(q('#langue-g'), { opacity: 0 });
  tl.set(q('#langue-g'), { opacity: 1 }, b(5));
  ft(langue, { attr: { x2: ${G.bouchePt[0]}, y2: ${G.bouchePt[1]} } }, { attr: { x2: ${cible[0]}, y2: ${cible[1]} }, duration: 0.1, ease: 'power3.out' }, b(5));
  ft(bout, { attr: { cx: ${G.bouchePt[0]}, cy: ${G.bouchePt[1]}, r: 4 } }, { attr: { cx: ${cible[0]}, cy: ${cible[1]}, r: 7.5 }, duration: 0.1, ease: 'power3.out' }, b(5));
  ft(langue, { attr: { x2: ${cible[0]}, y2: ${cible[1]} } }, { attr: { x2: ${G.bouchePt[0]}, y2: ${G.bouchePt[1]} }, duration: 0.2, ease: 'power2.in' }, b(5) + 0.2);
  ft(bout, { attr: { cx: ${cible[0]}, cy: ${cible[1]}, r: 7.5 } }, { attr: { cx: ${G.bouchePt[0]}, cy: ${G.bouchePt[1]}, r: 4 }, duration: 0.2, ease: 'power2.in' }, b(5) + 0.2);
  tl.set(q('#langue-g'), { opacity: 0 }, b(5) + 0.4);
  [b(6), b(6.6)].forEach(function (t) { ft(q('#sclere'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.08, transformOrigin: '50% 50%', duration: 0.07, yoyo: true, repeat: 1 }, t); });

  // --- La pupille suit la mouche.
  var pupille = q('#pupille');
  var a = ${angle(P0)};
  repos(pupille, { rotation: a, svgOrigin: '${G.oeil.join(' ')}' });
  function regarder(vers, t, d, ease) { ft(pupille, { rotation: a, svgOrigin: '${G.oeil.join(' ')}' }, { rotation: vers, svgOrigin: '${G.oeil.join(' ')}', duration: d, ease: ease || 'power2.out' }, t); a = vers; }
  regarder(${angle(P1)}, b(5) + 0.1, 0.15);

  // --- La mouche : vol stationnaire sur le temps, esquive, moquerie, retour.
  var m = q('#mouche'); var mc = q('#mouche-corps');
  repos(m, { x: ${P0[0]}, y: ${P0[1]} });
  cycle(q('#mouche-flotte'), { y: 0 }, { y: -9 }, T);
  cycle(qa('.aile'), { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 0.25, transformOrigin: '50% 100%' }, D / 66, 'none');
  ft(m, { x: ${P0[0]}, y: ${P0[1]} }, { x: ${P1[0]}, y: ${P1[1]}, duration: 0.14, ease: 'power3.out' }, b(5));
  ${mode === 'vol'
    ? `ft(mc, { rotation: 0 }, { rotation: -360, duration: 0.45, ease: 'power2.out' }, b(5));
  ft(mc, { rotation: 0 }, { rotation: 16, duration: T / 4, yoyo: true, repeat: 9, ease: 'sine.inOut' }, b(5.6));
  // Deux loopings moqueurs (la pupille suit, en retard d'un rien).
  var pts = ${JSON.stringify(pts)};
  ft(m, { x: ${P1[0]}, y: ${P1[1]} }, { motionPath: { path: [{ x: ${P1[0]}, y: ${P1[1]} }].concat(pts), curviness: 1.25 }, duration: b(4), ease: 'sine.inOut' }, b(8));
  ft(mc, { rotation: 0 }, { rotation: 720, duration: b(4), ease: 'sine.inOut' }, b(8));
  pts.forEach(function (p, k) { regarder(Math.atan2(p.y - ${oeilEcran[1]}, p.x - ${oeilEcran[0]}) * 180 / Math.PI, b(8) + (k + 0.6) * b(4) / 16, b(4) / 16, 'none'); });`
    : `// Au bout de son fil, la mouche est tirée en l'air, puis fait le yoyo pour se moquer.
  ft(mc, { rotation: 0, svgOrigin: '0 -16' }, { rotation: 25, svgOrigin: '0 -16', duration: T / 2, yoyo: true, repeat: 5, ease: 'sine.inOut' }, b(5.2));
  ft(m, { y: ${P1[1]} }, { y: ${P1[1] + 70}, duration: T / 2, yoyo: true, repeat: 7, ease: 'power2.in' }, b(8));
  ft(mc, { scaleY: 1, scaleX: 1, svgOrigin: '0 10' }, { scaleY: 0.72, scaleX: 1.2, svgOrigin: '0 10', duration: 0.06, yoyo: true, repeat: 1 }, b(8.5));
  ft(mc, { scaleY: 1, scaleX: 1, svgOrigin: '0 10' }, { scaleY: 0.72, scaleX: 1.2, svgOrigin: '0 10', duration: 0.06, yoyo: true, repeat: 1 }, b(9.5));
  ft(mc, { scaleY: 1, scaleX: 1, svgOrigin: '0 10' }, { scaleY: 0.72, scaleX: 1.2, svgOrigin: '0 10', duration: 0.06, yoyo: true, repeat: 1 }, b(10.5));
  [0, 1, 2, 3].forEach(function (k) { regarder(${angle([P1[0], P1[1] + 70])}, b(8.4 + k), T / 2, 'sine.inOut'); regarder(${angle(P1)}, b(8.9 + k), T / 2, 'sine.inOut'); });`}
  ft(m, { x: ${P1[0]}, y: ${P1[1]} }, { motionPath: { path: ${JSON.stringify(RETOUR)}, curviness: 1.3 }, duration: b(3), ease: 'sine.inOut' }, b(12));
  regarder(${angle([RETOUR[1].x, RETOUR[1].y])}, b(12), b(1), 'sine.inOut');
  regarder(${angle([RETOUR[2].x, RETOUR[2].y])}, b(13), b(1), 'sine.inOut');
  regarder(${angle(P0)}, b(14), b(1), 'sine.inOut');
  qa('.trace').forEach(function (g, k) {
    var r = (k + 1) * 0.035;
    repos(g, { x: ${P0[0]}, y: ${P0[1]} });
    ft(g, { x: ${P0[0]}, y: ${P0[1]} }, { x: ${P1[0]}, y: ${P1[1]}, duration: 0.14, ease: 'power3.out' }, b(5) + r);
    ${mode === 'vol' ? `ft(g, { x: ${P1[0]}, y: ${P1[1]} }, { motionPath: { path: [{ x: ${P1[0]}, y: ${P1[1]} }].concat(pts), curviness: 1.25 }, duration: b(4), ease: 'sine.inOut' }, b(8) + r);` : ''}
    ft(g, { x: ${P1[0]}, y: ${P1[1]} }, { motionPath: { path: ${JSON.stringify(RETOUR)}, curviness: 1.3 }, duration: b(3), ease: 'sine.inOut' }, b(12) + r);
  });

  // --- Mousse : il hoche la tête sur le temps, et se cache l'œil quand c'est raté.
  cycle(q('#mousse-battement'), { y: 7 }, { y: 0 }, T);
  cycle(q('#mousse-pousse'), { rotation: -10, transformOrigin: '0% 100%' }, { rotation: 10, transformOrigin: '0% 100%' }, 2 * T);
  cycle(q('#lanterne-flamme'), { scaleY: 0.9, transformOrigin: '50% 100%' }, { scaleY: 1.08, transformOrigin: '50% 100%' }, D / 52);
  cycle(q('#mousse-perche'), { rotation: -2, svgOrigin: '246 172' }, { rotation: 2, svgOrigin: '246 172' }, 4 * T);
  repos(qa('#mousse-oeil > g'), { opacity: 0 }); repos(q('#oeil-neutre'), { opacity: 1 });
  tl.set(q('#oeil-neutre'), { opacity: 0 }, b(5.5)); tl.set(q('#oeil-blase'), { opacity: 1 }, b(5.5));
  tl.set(q('#oeil-blase'), { opacity: 0 }, b(12)); tl.set(q('#oeil-neutre'), { opacity: 1 }, b(12));
  var geste = q('#mousse-geste'); var bras = q('#mousse-bras');
  ft(geste, { rotation: 0, y: 0, svgOrigin: '135 336' }, { rotation: 7, y: 16, svgOrigin: '135 336', duration: 0.3, ease: 'back.out(2)' }, b(5.5));
  ft(bras, { rotation: 0, scale: 1, svgOrigin: '35 210' }, { rotation: -109, scale: 1.5, svgOrigin: '35 210', duration: 0.28, ease: 'back.out(1.6)' }, b(5.6));
  ft(bras, { rotation: -109, scale: 1.5, svgOrigin: '35 210' }, { rotation: 0, scale: 1, svgOrigin: '35 210', duration: 0.35, ease: 'power2.inOut' }, b(9.6));
  ft(geste, { rotation: 7, y: 16, svgOrigin: '135 336' }, { rotation: 0, y: 0, svgOrigin: '135 336', duration: 0.4, ease: 'power2.inOut' }, b(9.6));
  taper(0.12, 0.045);
`;
}
const SONS = (b) => [{ f: 'clavier.wav', t: 0.12, v: 0.35 }, { f: 'fwip.wav', t: b(5), v: 0.9 }, { f: 'bip.wav', t: b(5.6), v: 0.5 }];
module.exports = { G, CAM, P0, P1, mise, SONS, local };
