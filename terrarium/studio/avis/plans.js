/*
 * Les plans visuels de la chaîne « avis ». Ils occupent le haut de l'image (y 280 à 1040) ; les sous-titres sont dessous.
 * Chaque plan : ancres(p) (les champs calés sur un mot de la voix), textes(p), dessin(p, u) côté Node, jouer(c, el, p, t0, d) côté page.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.plans = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const q = (el, s) => el.querySelector(s), qa = (el, s) => [...el.querySelectorAll(s)];
  const GR = typeof require === 'function' ? require('./grille.js') : (typeof self !== 'undefined' ? self : this).Avis.grille;
  const DEC = typeof require === 'function' ? require('./jeu-decors.js') : (typeof self !== 'undefined' ? self : this).Avis.jeuDecors;
  // Fond animé (« vidéo » de fond), dessiné une fois, animé image par image par animerFond(). Tout est périodique sur la durée
  // publiée (durée − amorce) : quand la vidéo reboucle, le fond est exactement au même état. Seul décor pour l'instant : désert.
  const hf = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
  function fondAnimeSvg(nom, sans2d) {
    if (nom !== 'desert') return '';
    const dune = (base, a1, a2, ph) => { let d = `M0 1920 L0 ${base}`; for (let x = 0; x <= 2160; x += 30) d += ` L${x} ${(base + a1 * Math.sin(2 * Math.PI * x / 1080 * 2 + ph) + a2 * Math.sin(2 * Math.PI * x / 1080 * 3 + ph * 2)).toFixed(1)}`; return `${d} L2160 1920 Z`; };
    const rayons = Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * 2 * Math.PI, b = a + Math.PI / 24, R = 2200; return `<path d="M0 0 L${(R * Math.cos(a)).toFixed(0)} ${(R * Math.sin(a)).toFixed(0)} L${(R * Math.cos(b)).toFixed(0)} ${(R * Math.sin(b)).toFixed(0)} Z"/>`; }).join('');
    const grains = Array.from({ length: 40 }, (_, k) => `<circle class="fa-grain" r="${(2 + hf(k + 3) * 3.5).toFixed(1)}" fill="#ffe7b8" fill-opacity="${(0.3 + hf(k + 7) * 0.35).toFixed(2)}" cx="0" cy="0"/>`).join('');
    const boule = `<g class="fa-boule" opacity="0"><g class="fa-boule-r"><circle r="52" fill="none" stroke="#8a5a2b" stroke-width="7" stroke-opacity=".8"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${(Math.cos(k) * 48).toFixed(0)} ${(Math.sin(k) * 48).toFixed(0)} Q${(Math.cos(k * 2.3) * 20).toFixed(0)} ${(Math.sin(k * 1.7) * 20).toFixed(0)} ${(Math.cos(k + 2.6) * 48).toFixed(0)} ${(Math.sin(k + 2.6) * 48).toFixed(0)}" fill="none" stroke="#a8743b" stroke-width="5" stroke-opacity=".85"/>`).join('')}</g></g>`;
    // Avec le fond 3D, seuls les grains de sable restent (le ciel, le soleil et les dunes sont en 3D).
    const d2d = sans2d ? '' : `<g transform="translate(930 1660)"><g class="fa-rayons" fill="#fff1c2" fill-opacity=".09">${rayons}</g></g><g class="fa-dune1"><path d="${dune(1540, 26, 14, 0.4)}" fill="#c9632e" fill-opacity=".42"/></g><g class="fa-dune2"><path d="${dune(1640, 30, 12, 1.9)}" fill="#9a3f1e" fill-opacity=".5"/></g>`;
    return `<svg class="fond-anime" viewBox="0 0 1080 1920" width="1080" height="1920">${d2d}${sans2d ? '' : boule}<g class="fa-grains">${grains}</g></svg>`;   // pas de buisson roulant avec le fond 3D (demande de Jules)
  }
  function animerFond(c, el, p, t0, d) {
    const sv = q(el, '.fond-anime'); if (!sv) return;
    const Lp = d - (p.amorceBoucle || 0), ray = q(sv, '.fa-rayons'), d1 = q(sv, '.fa-dune1'), d2 = q(sv, '.fa-dune2'), gr = qa(sv, '.fa-grain'), bo = q(sv, '.fa-boule'), bor = q(sv, '.fa-boule-r');
    const G = gr.map((_, k) => ({ x0: hf(k + 11) * 1180, y0: 260 + hf(k + 23) * 1560, m: 1 + Math.floor(hf(k + 31) * 3), a: 6 + hf(k + 41) * 16, ph: hf(k + 53) * 6.28 }));
    const mod = (a, b) => ((a % b) + b) % b;
    function rendre(t) {
      if (ray) ray.setAttribute('transform', `rotate(${(60 * t / Lp).toFixed(3)})`);
      if (d1) d1.setAttribute('transform', `translate(${(-mod(1080 * t / Lp, 1080)).toFixed(2)} 0)`);
      if (d2) d2.setAttribute('transform', `translate(${(-mod(2160 * t / Lp, 1080)).toFixed(2)} 0)`);
      gr.forEach((g, k) => { const P = G[k]; g.setAttribute('cx', (mod(P.x0 - 1180 * P.m * t / Lp, 1180) - 50).toFixed(1)); g.setAttribute('cy', (P.y0 + P.a * Math.sin(2 * Math.PI * 2 * t / Lp + P.ph)).toFixed(1)); });
      const a = 2.4, b = 7.4, u = (t - a) / (b - a);
      if (!bo) return;
      if (u <= 0 || u >= 1) { bo.setAttribute('opacity', '0'); return; }
      const x = -160 + 1400 * u, y = 1740 - Math.abs(Math.sin(Math.PI * u * 5)) * 80;
      bo.setAttribute('opacity', '1'); bo.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); bor.setAttribute('transform', `rotate(${(x / 52 * 57.3).toFixed(1)})`);
    }
    const pilote = { t: 0 }; rendre(0);
    c.ft(pilote, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => rendre(pilote.t) }, t0);
  }

  // Le hibou 2 : animé image par image par une seule fonction du temps (rendre(t)), appelée par un « pilote » GSAP fini.
  // Tout est continu (sinus, courbes lissées), donc fluide et identique à chaque rendu. Les attributs sont posés directement.
  // Émotions par phrase (lignes[].emotion) : sourcils, inclinaison de tête, gestes d'ailes ; synchro labiale (lignes[].env) ;
  // regard vers chaque nouvelle lettre ; clignements ; folies : zoom (phrase 1), tremble (panique), ejecte (révélation).
  function animerHibou2(c, el, p, t0, d) {
    const pr = q(el, '.presente'), Q = (s) => q(pr, s), P = PERSO();
    const pos = Q('.h2-pos'), corps = Q('.h2-corps'), tete = Q('.h2-tete'), ag = Q('.h2-ag'), ad = Q('.h2-ad'), sg = Q('.h2-sg'), sd = Q('.h2-sd');
    const pg = Q('.h2-pg'), pd = Q('.h2-pd'), lg = Q('.h2-lg'), ld = Q('.h2-ld'), bouche = Q('.h2-bouche'), langue = Q('.h2-langue'), mach = Q('.h2-mach');
    const fantomes = qa(pr, '.h2-fantome'), svgP = q(pr, 'svg'), cadre = q(el, '.cadre'), plumes = qa(pr, '.plume'), confettis = qa(pr, '.confetti'), flash = Q('.flash'), poussiere = qa(pr, '.poussiere');
    const L = p.presentateur.lignes || [], m0 = p.mots[0], et = p.muetCfg && p.muetCfg.etapes;
    // La triche (œuf de Pâques pour les revisionnages) : il soulève l'aile, on voit la réponse écrite sur son flanc, il jette un œil, puis la rabat.
    const tr = p.presentateur.triche, trTxt = Q('.h2-triche');
    const ac = p.presentateur.accroche, voile = Q('.voile'), txt = Q('.accroche-h'), bulles = qa(pr, '.bulle');
    if (tr && trTxt) trTxt.textContent = tr.texte;
    const indices = et ? et.ordre.map((_, j) => m0.indice.t + et.pas * (j + 1)) : [];
    const revel = m0.reponse.t + GR.LETTRE.vol;
    const lz = L.find((l) => l.folie === 'zoom'), lp = L.find((l) => l.folie === 'tremble'), le = L.find((l) => l.folie === 'ejecte');
    const tE = le ? le.t : null, tP = lp ? lp.t : null, finP = lp ? lp.t + 1.8 : null;
    const lm = L.find((l) => l.folie === 'emerveille');   // émerveillé : il regarde l'oasis apparaître (éclat doré)
    const cl = (x) => Math.max(0, Math.min(1, x)), lisse = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
    const dos = (x) => { x = cl(x); const s2 = 1.4; return 1 + (s2 + 1) * Math.pow(x - 1, 3) + s2 * Math.pow(x - 1, 2); };   // back.out
    const cloche = (t, a, mont, tenue, desc) => (t < a ? 0 : t < a + mont ? lisse((t - a) / mont) : t < a + mont + tenue ? 1 : lisse(1 - (t - a - mont - tenue) / desc));
    const mix = (a, b, k) => a + (b - a) * k;
    const hs = (k) => { const x = Math.sin(k * 57.3 + 7.7) * 43758.5; return x - Math.floor(x); };
    const EMO = { neutre: { tilt: 0, ailes: [6, -6] }, defi: { tilt: 6, ailes: [8, -78] }, choc: { tilt: 0, ailes: [42, -42] }, agace: { tilt: -8, ailes: [-28, 28] }, panique: { tilt: 0, ailes: [150, -150] }, joie: { tilt: 4, ailes: [165, -165] } };
    const emoDe = (i) => (i < 0 ? 'neutre' : L[i].emotion || 'neutre');
    // Avant la première phrase (amorce de boucle), le hibou est déjà dans l'émotion de la première phrase.
    const ligneA = (t) => { let i = L.length ? 0 : -1; L.forEach((l, k) => { if (l.t <= t + 1e-6) i = k; }); return i; };
    const bouchee = (t) => {   // ouverture du bec (0 à 1) : enveloppe de la phrase en cours, interpolée et adoucie
      const i = ligneA(t); if (i < 0 || t < L[i].t) return 0; const l = L[i], e = l.env || [], hz = l.envHz || 15, x = (t - l.t) * hz;
      if (!e.length || x >= e.length) return 0;
      const v = (k) => (k < 0 || k >= e.length ? 0 : e[k]), k0 = Math.floor(x), f = x - k0;
      return lisse((t - l.t) / 0.06) * lisse((e.length - x) / 2) * cl(0.5 * mix(v(k0), v(k0 + 1), f) + 0.25 * mix(v(k0 - 1), v(k0), f) + 0.25 * mix(v(k0 + 1), v(k0 + 2), f));
    };
    const clignes = [1.15, 3.55, 5.7, 7.95, 10.9].filter((b) => b < d - 0.2);
    const confs = confettis.map((_, k) => { const a = -Math.PI / 2 + (hs(k) - 0.5) * 2.6, v = 700 + hs(k + 20) * 900; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (hs(k + 5) - 0.5) * 1400 }; });
    const vol = (u) => {   // l'éjection : position, rotation et étirement du hibou, u secondes après le début de la phrase
      if (u < 0 || u > 2.3) return { x: 0, y: 0, r: 0, sx: 1, sy: 1 };
      if (u < 0.16) { const k = Math.sin(Math.PI * 0.5 * u / 0.16); return { x: 0, y: 0, r: 0, sx: 1 + 0.22 * k, sy: 1 - 0.28 * k }; }
      if (u < 0.9) { const k = (u - 0.16) / 0.74, ko = 1 - (1 - k) * (1 - k), b = lisse((u - 0.16) / 0.1); return { x: -700 * ko, y: -1150 * ko, r: 720 * ko, sx: mix(1.22, 0.86, b), sy: mix(0.72, 1.22, b) }; }
      if (u < 1.55) { const k = (u - 0.9) / 0.65, ki = k * k, b = lisse((u - 1.45) / 0.1); return { x: -700 * (1 - ki), y: -1150 * (1 - ki), r: 720 + 360 * k, sx: mix(0.86, 1, b), sy: mix(1.22, 1, b) }; }
      if (u < 1.8) { const k = Math.sin(Math.PI * (u - 1.55) / 0.25); return { x: 0, y: 0, r: 0, sx: 1 + 0.3 * k, sy: 1 - 0.32 * k }; }
      const k = (u - 1.8) / 0.5; return { x: 0, y: -70 * Math.sin(Math.PI * k) * (1 - k * 0.3), r: 0, sx: 1 - 0.06 * Math.sin(Math.PI * k), sy: 1 + 0.08 * Math.sin(Math.PI * k) };
    };
    // Le vol d'arrivée (presentateur.vol) : décollage pendant le dézoom de l'accroche, sortie par le haut, retour par la gauche
    // en planant, vol stationnaire près de la question (le temps de la lire), descente et atterrissage à sa place au sol.
    // Trajectoire : courbes d'Hermite cubiques (position et vitesse continues), en unités du dessin du hibou (× 0,62 à l'écran).
    const VO = p.presentateur.vol;
    const hermite = (K, t) => {   // K : [{t, x, y, vx?, vy?}] ; vitesses intérieures par différences centrées (spline cardinale)
      if (t <= K[0].t) return [K[0].x, K[0].y]; const n = K.length - 1; if (t >= K[n].t) return [K[n].x, K[n].y];
      const m = (i) => (K[i].vx != null ? [K[i].vx, K[i].vy] : [(K[i + 1].x - K[i - 1].x) / (K[i + 1].t - K[i - 1].t), (K[i + 1].y - K[i - 1].y) / (K[i + 1].t - K[i - 1].t)]);
      let i = 0; while (t > K[i + 1].t) i += 1;
      const a = K[i], b = K[i + 1], h = b.t - a.t, u = (t - a.t) / h, ma = m(i), mb = m(i + 1);
      const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
      return [h00 * a.x + h10 * h * ma[0] + h01 * b.x + h11 * h * mb[0], h00 * a.y + h10 * h * ma[1] + h01 * b.y + h11 * h * mb[1]];
    };
    let SEG = [];
    if (VO) {
      const td = VO.depart, ta = VO.arrivee, tp = VO.pose, X = VO.x, Y = VO.y;
      if (VO.direct) SEG = [   // version courte : il décolle du gros plan et monte directement se placer près de la question
        [{ t: td, x: 0, y: 0, vx: 0, vy: -1400 }, { t: td + (ta - td) * 0.5, x: 1032, y: -470 }, { t: ta, x: X, y: Y, vx: 0, vy: 0 }],
        null,
        [{ t: tp - 0.8, x: X, y: Y, vx: 0, vy: 0 }, { t: tp - 0.42, x: 758, y: -355 }, { t: tp, x: 0, y: 0, vx: -1500, vy: 1300 }],
      ]; else SEG = [
        // décollage : vers le haut puis sort par la gauche ; arrivée : entre en haut à droite et descend en douceur à droite
        // de la question (sans la survoler) ; descente : passe à droite puis sous la grille jusqu'à sa place.
        [{ t: td, x: 0, y: 0, vx: 0, vy: -1400 }, { t: td + 0.22, x: -113, y: -516 }, { t: td + 0.5, x: -790, y: -1323, vx: -2600, vy: -1700 }],
        [{ t: ta - 0.9, x: 1645, y: -1694, vx: -1900, vy: 1100 }, { t: ta - 0.5, x: 1242, y: -1339 }, { t: ta - 0.22, x: 984, y: -1000 }, { t: ta, x: X, y: Y, vx: 0, vy: 0 }],
        [{ t: tp - 0.8, x: X, y: Y, vx: 0, vy: 0 }, { t: tp - 0.42, x: 758, y: -355 }, { t: tp, x: 0, y: 0, vx: -1500, vy: 1300 }],
      ];
    }
    const voler = (t) => {   // { x, y, r, kF (0 au sol, 1 en vol), hov (vol stationnaire), sx, sy }
      const R = { x: 0, y: 0, r: 0, kF: 0, hov: 0, sx: 1, sy: 1 };
      if (!VO) return R;
      const td = VO.depart, ta = VO.arrivee, tp = VO.pose;
      if (t >= td - 0.16 && t < td) { const k = Math.sin(Math.PI * (t - td + 0.16) / 0.16); R.sx = 1 + 0.18 * k; R.sy = 1 - 0.22 * k; return R; }   // il se tasse
      if (t >= tp && t < tp + 0.42) { const u = (t - tp) / 0.42, k = Math.sin(Math.PI * Math.min(1, u / 0.45)) * (u < 0.45 ? 1 : 0), r2 = u >= 0.45 ? Math.sin(Math.PI * (u - 0.45) / 0.55) : 0; R.sx = 1 + 0.26 * k - 0.05 * r2; R.sy = 1 - 0.3 * k + 0.07 * r2; R.y = -34 * r2; return R; }   // atterrissage : écrasement, petit rebond
      if (t < td || t >= tp) return R;
      let K = null; const fin0 = SEG[0][SEG[0].length - 1].t;
      if (t <= fin0) K = SEG[0]; else if (SEG[1] && t >= SEG[1][0].t && t <= ta) K = SEG[1]; else if (t >= SEG[2][0].t) K = SEG[2];
      if (!K && SEG[1] && t > fin0 && t < SEG[1][0].t) { R.x = -2000; R.y = -3000; R.kF = 1; return R; }   // hors champ
      const e = 1 / 120; let x, y, vx = 0;
      if (K) { [x, y] = hermite(K, t); const a2 = hermite(K, t - e), b2 = hermite(K, t + e); vx = (b2[0] - a2[0]) / (2 * e); }
      else { x = VO.x; y = VO.y; }   // vol stationnaire
      R.x = x; R.y = y; R.kF = 1;
      R.hov = K ? (K === SEG[1] || (VO.direct && K === SEG[0]) ? lisse((t - ta + 0.25) / 0.25) : K === SEG[2] ? 1 - lisse((t - SEG[2][0].t) / 0.25) : 0) : 1;
      R.r = Math.max(-24, Math.min(24, vx * 0.011));
      R.sx = 0.95; R.sy = 1.06;
      return R;
    };
    const dansLesAirs = (t) => VO && t >= VO.depart - 0.16 && t < VO.pose + 0.42;
    const ll = L.find((l) => l.lecture), mots = ll ? qa(el, '.qm') : [];
    // La danse : dans chaque silence entre deux phrases (et après la dernière), calée sur le tempo de la musique.
    // Jamais pendant l'amorce (le raccord de la boucle reste en « défi ») ni pendant l'éjection.
    const danseOK = !!p.presentateur.danse, temps = 60 / ((p.muetCfg && p.muetCfg.tempo) || 108);
    const silences = danseOK ? L.map((l, k) => [l.t + (l.duree || 1.5) + 0.06, k + 1 < L.length ? L[k + 1].t - 0.04 : d + 1]).filter(([a, b]) => b - a > 0.3) : [];
    const danse = (t) => { if (!danseOK || (tE != null && t >= tE && t < tE + 2.3)) return 0; let k = 0; silences.forEach(([a, b]) => { k = Math.max(k, cloche(t, a, 0.3, Math.max(0, b - a - 0.6), 0.3)); }); return VO ? k * (1 - cloche(t, VO.depart - 0.8, 0.3, VO.pose + 0.3 - VO.depart + 0.5, 0.35)) : k; };   // pas de danse en vol ; reprise en douceur après l'atterrissage
    const A = (n, v) => n && n.setAttribute('transform', v);
    function rendre(t) {
      const i = ligneA(t), avant = i === 0 && t < L[0].t, e1 = emoDe(i), e0 = avant || (i === 0 && p.amorceBoucle) ? e1 : emoDe(i - 1), kE = i < 0 || avant ? 1 : lisse((t - L[i].t) / 0.18), kA = i < 0 || avant ? 1 : dos(lisse((t - L[i].t) / 0.55));
      const o = bouchee(t), pan = tP != null && t >= tP && t < finP ? cloche(t, tP, 0.15, 1.4, 0.25) : 0;
      const kD = danse(t), ph = t / temps, sa = Math.sin(Math.PI * ph), ab = Math.abs(sa), at = Math.pow(Math.max(0, Math.cos(2 * Math.PI * ph)), 3);
      // sourcils
      const S0 = P.SOURCILS[e0] || P.SOURCILS.neutre, S1 = P.SOURCILS[e1] || P.SOURCILS.neutre;
      const SJ = P.SOURCILS.joie;
      [sg, sd].forEach((n, c2) => { const v = S0[c2].map((x, j) => mix(mix(x, S1[c2][j], kE), SJ[c2][j], kD) - (j % 2 ? o * 6 : 0)); n.setAttribute('d', `M${v[0].toFixed(1)} ${v[1].toFixed(1)} Q${v[2].toFixed(1)} ${v[3].toFixed(1)} ${v[4].toFixed(1)} ${v[5].toFixed(1)}`); });
      // tête : balancement, émotion, syllabes, tremblement de panique
      const tilt = 3 * Math.sin(2 * Math.PI * t / 3.3) + mix(EMO[e0].tilt, EMO[e1].tilt, kE) + 3 * o + pan * 4 * Math.sin(t * 52) - 11 * kD * sa;
      A(tete, `translate(0 ${(-7 * o + 2 * Math.sin(2 * Math.PI * t / 1.7)).toFixed(2)}) rotate(${tilt.toFixed(2)} 0 -250)`);
      // corps : respiration (étirement doux depuis les pieds) ; folie « ejecte » : vol complet
      const sR = 0.018 * Math.sin(2 * Math.PI * t / 1.7), V = tE != null ? vol(t - tE) : vol(-1);
      const F = voler(t), fP = 2 * Math.PI * 5.5 * t, bob = F.hov * 16 * Math.sin(fP + Math.PI / 2);   // battements à 5,5 par seconde ; il monte à chaque coup d'ailes
      A(corps, `scale(${((1 - sR) * V.sx * F.sx * (1 + 0.07 * kD * at)).toFixed(4)} ${((1 + sR) * V.sy * F.sy * (1 - 0.09 * kD * at)).toFixed(4)})`);
      const jx = pan * 6 * Math.sin(t * 61) + pan * 3 * Math.sin(t * 97);
      A(pos, `translate(${(V.x + F.x + jx + 22 * kD * sa).toFixed(1)} ${(V.y + F.y + bob - 34 * kD * ab).toFixed(1)}) rotate(${(V.r + F.r).toFixed(1)} 0 -200) rotate(${(8 * kD * sa).toFixed(2)} 0 0)`);
      fantomes.forEach((g, k) => { const u = tE == null ? -1 : t - tE, Vf = vol(u - 0.035 * (k + 1)), vis = u > 0.18 && u < 1.5; g.setAttribute('opacity', vis ? (0.28 - k * 0.08).toFixed(2) : '0'); g.setAttribute('transform', `translate(${Vf.x.toFixed(1)} ${Vf.y.toFixed(1)}) rotate(${Vf.r.toFixed(1)} 0 -200)`); });
      // ailes : geste de l'émotion (arrivée avec dépassement), flottement au repos, battements de joie
      const W0 = EMO[e0].ailes, W1 = EMO[e1].ailes, bat = e1 === 'joie' ? 16 * Math.sin(t * 38) : 0, fl = 4 * Math.sin(2 * Math.PI * t / 1.3);
      const lev = tr ? cloche(t, tr.t, 0.14, tr.duree || 0.55, 0.16) : 0;
      if (trTxt) trTxt.setAttribute('opacity', lisse((lev - 0.4) / 0.4).toFixed(2));
      const dG = 50 + 65 * sa * sa, dD = -(50 + 65 * Math.cos(Math.PI * ph) ** 2);   // sinus au carré : pas d'à-coup au changement de sens
      const kF = VO ? (t < VO.depart ? lisse((t - VO.depart + 0.1) / 0.1) : 1 - lisse((t - VO.pose + 0.05) / 0.2)) : 0, battement = 80 + 62 * Math.sin(fP);
      A(ag, `rotate(${mix(mix(mix(W0[0], W1[0], kA) + fl + bat + pan * 10 * Math.sin(t * 47) + 78 * lev, dG, kD), battement, kF).toFixed(2)})`);
      A(ad, `rotate(${mix(mix(mix(W0[1], W1[1], kA) - fl - bat - pan * 10 * Math.sin(t * 43) + (e1 === 'defi' ? 6 * Math.sin(t * 9) * (1 - kE * 0.3) : 0), dD, kD), -battement, kF).toFixed(2)})`);
      // regard : vers chaque nouvelle lettre, puis vers le spectateur
      let gx = 2 * Math.sin(2 * Math.PI * t / 4.1), gy = 0;
      indices.concat([revel]).forEach((ti) => { const k = cloche(t, ti - 0.05, 0.12, 0.45, 0.2); gx = mix(gx, 13, k); gy = mix(gy, -15, k); });
      if (pan) { gx += pan * 8 * Math.sin(t * 13); }
      if (lm) { const kM = cloche(t, lm.t + 0.05, 0.25, 2.4, 0.4); gx = mix(gx, 17, kM); gy = mix(gy, -13, kM); }
      if (tr) { const kt = cloche(t, tr.t + 0.08, 0.1, (tr.duree || 0.55) - 0.1, 0.12); gx = mix(gx, -16, kt); gy = mix(gy, 12, kt); }
      if (ll) { const kl = cloche(t, ll.t - 0.15, 0.2, (ll.duree || 2) - 0.1, 0.3); gx = mix(gx, -15, kl); gy = mix(gy, -14, kl); }   // il regarde la question
      [pg, pd].forEach((n) => A(n, `translate(${gx.toFixed(2)} ${gy.toFixed(2)})`));
      if (ll && mots.length && ll.mots) {   // karaoké : le mot qu'il dit s'allume, les mots pas encore lus sont atténués
        const kW = cloche(t, ll.t - 0.2, 0.2, (ll.duree || 2) - 0.2, 0.4);
        mots.forEach((sp, k) => { const w = ll.mots[k]; if (!w) return; const a2 = ll.t + w[0], b2 = ll.t + w[1], lu = lisse((t - a2 + 0.04) / 0.08), cur = cloche(t, a2 - 0.04, 0.08, Math.max(0, b2 - a2 - 0.04), 0.22);
          sp.style.opacity = (1 - kW * 0.5 * (1 - lu)).toFixed(3); sp.style.transform = cur ? `scale(${(1 + 0.06 * cur).toFixed(4)})` : '';
          sp.style.color = cur > 0.01 ? `rgb(255, ${Math.round(255 - 43 * cur)}, ${Math.round(255 - 163 * cur)})` : ''; });
      }
      // paupières : clignements, regard à demi fermé quand il est agacé
      let lid = 0; clignes.forEach((b) => { lid = Math.max(lid, cloche(t, b, 0.06, 0.02, 0.09)); });
      lid = Math.max(lid, (e1 === 'agace' ? 0.38 * kE : 0) + (e0 === 'agace' && e1 !== 'agace' ? 0.38 * (1 - kE) : 0));
      lid = Math.max(lid, 0.3 * kD);
      [lg, ld].forEach((n) => n.setAttribute('height', (112 * lid).toFixed(1)));
      // bec
      bouche.setAttribute('ry', (0.1 + 34 * o).toFixed(2)); langue.setAttribute('ry', (0.1 + 12 * o).toFixed(2)); langue.setAttribute('cy', (-338 + 52 + 12 * o).toFixed(1));
      A(mach, `translate(0 ${(24 * o).toFixed(2)})`);
      // zoom-coup de poing de la première phrase
      const z = lz ? 1 + 0.5 * cloche(t, lz.t + 0.12, 0.14, 0.3, 0.22) : 1;
      // Accroche : gros plan du hibou au centre de l'écran (visage en 540, 880), voile sur le jeu, texte géant ; puis dézoom.
      const kC = ac ? 1 - lisse((t - ac.fin + 0.38) / 0.38) : 0, sC = (1 + 1.6 * kC) * z;
      svgP.style.transformOrigin = '230px 1260px';
      svgP.style.transform = sC === 1 && !kC ? '' : `translate(${(310 * kC).toFixed(2)}px, ${(-270 * kC).toFixed(2)}px) scale(${sC.toFixed(4)})`;
      if (ac) {
        voile.style.opacity = (0.97 * kC).toFixed(3); txt.style.opacity = kC.toFixed(3);
        const pulse = 1 + 0.06 * Math.max(0, Math.sin(2 * Math.PI * t / temps)) ** 4;
        txt.style.transform = `translate(${(4 * Math.sin(t * 53) * kC).toFixed(2)}px, ${(-40 * (1 - kC)).toFixed(1)}px) scale(${(pulse * (0.9 + 0.1 * kC)).toFixed(4)})`;
        if (bulles[0]) bulles[0].style.visibility = kC > 0.03 ? 'hidden' : '';
      }
      // plumes qui tombent pendant la panique
      plumes.forEach((pl, k) => { const tk = tP == null ? -1 : t - tP - 0.1 - k * 0.12, x0 = 120 + hs(k) * 230, y0 = 1120 + hs(k + 50) * 120;
        if (tk < 0 || tk > 1.6) { pl.setAttribute('opacity', '0'); return; }
        const kk = tk / 1.3; pl.setAttribute('opacity', (0.95 * (tk < 1.3 ? 1 : 1 - (tk - 1.3) / 0.3)).toFixed(2));
        pl.setAttribute('transform', `translate(${(x0 + (hs(k + 9) - 0.5) * 120 * kk + 18 * Math.sin(tk * 6 + k)).toFixed(1)} ${(y0 + 260 * kk * kk).toFixed(1)}) rotate(${((hs(k + 3) - 0.5) * 300 * kk + 25 * Math.sin(tk * 5)).toFixed(1)})`); });
      // éjection : confettis, flash, poussière à la retombée, écran qui tremble
      const u = tE == null ? -1 : t - tE;
      confettis.forEach((cf, k) => { const tc = u - 0.05; if (tc < 0 || tc > 1.7) { cf.setAttribute('opacity', '0'); return; } const C = confs[k];
        cf.setAttribute('opacity', (tc < 1.1 ? 1 : 1 - (tc - 1.1) / 0.6).toFixed(2));
        cf.setAttribute('transform', `translate(${(230 + C.vx * tc * 0.6).toFixed(1)} ${(1240 + C.vy * tc * 0.6 + 700 * tc * tc).toFixed(1)}) rotate(${(C.r * tc).toFixed(1)})`); });
      if (lm && t >= lm.t - 0.1 && t < lm.t + 0.7) { flash.style.background = '#ffe2a0'; flash.style.opacity = (0.42 * cloche(t, lm.t - 0.08, 0.08, 0.05, 0.5)).toFixed(3); }
      else { flash.style.background = ''; flash.style.opacity = u >= 0 && u < 0.2 ? (0.5 * cloche(u, 0, 0.04, 0.02, 0.12)).toFixed(3) : '0'; }
      poussiere.forEach((pp, k) => { const tp = u - 1.55 - k * 0.02; if (tp < 0 || tp > 0.6) { pp.setAttribute('r', '0'); return; } pp.setAttribute('r', (14 + 50 * (tp / 0.6)).toFixed(1)); pp.setAttribute('fill-opacity', (0.55 * (1 - tp / 0.6)).toFixed(2)); pp.setAttribute('cx', (150 + k * 40 + (k - 2) * 60 * tp).toFixed(1)); });
      const sec = (u >= 0 && u < 0.35 ? 14 * (1 - u / 0.35) * Math.sin(u * 95) : 0) + (u >= 1.55 && u < 1.8 ? 8 * (1 - (u - 1.55) / 0.25) * Math.sin(u * 90) : 0);
      if (cadre) cadre.style.translate = sec ? `${sec.toFixed(2)}px 0px` : '';
    }
    const pilote = { t: 0 };
    rendre(0);
    c.ft(pilote, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => rendre(pilote.t) }, t0);
  }
  // Chargé à l'appel : dans la page, personnage.js est lu après ce fichier.
  const PERSO = () => (typeof require === 'function' ? require('./personnage.js') : self.Avis.personnage);
  const kicker = (p, u) => (p.kicker ? `<div class="kicker">${u.esc(p.kicker)}</div>` : '');

  return {
    // Aucun texte : seulement le fond (décor ou fond uni) et, si on veut, une illustration. C'est le plan par défaut :
    // le spectateur lit déjà les sous-titres, il ne faut pas lui donner un second texte à lire.
    visuel: {
      description: 'Aucun texte : le fond et, si on veut, une illustration. "moment": { "a": ancre } déclenche le temps fort de l’illustration ; "repere" : un compteur court (« Mains 1/3 »).',
      max: 14,
      ancres: (p) => [[p.moment, 'a']],
      textes: (p) => [p.repere],
      // "repere" : un compteur très court (« Mains 1/3 ») pour les vidéos en liste. Ce n'est pas une phrase.
      dessin: (p, u) => (p.repere ? `<div class="kicker repere">${u.esc(p.repere)}</div>` : ''),
      jouer(c, el, p, t0) { c.monter(q(el, '.repere'), t0); },
    },
    // Une phrase forte, en grand. "taille": "geant" pour deux ou trois mots.
    titre: {
      description: 'Une phrase forte en grand (avec un surtitre facultatif). "taille": "geant" pour deux ou trois mots.',
      max: 60,
      ancres: () => [],
      textes: (p) => [p.texte],
      dessin: (p, u) => `${kicker(p, u)}<p class="grand${p.taille === 'geant' ? ' geant' : ''}">${u.md(p.texte)}</p><i class="filet"></i>`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        c.lignes(q(el, '.grand'), t0 + 0.08);
        c.ft(q(el, '.filet'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, t0 + 0.35);
      },
    },
    // Une liste dont chaque élément arrive sur son mot. "rayer" : l'ancre où tout est barré ; "conclusion" : la phrase qui suit.
    liste: {
      description: 'Une liste : chaque élément arrive sur son mot ("a"). "rayer" barre tout sur une ancre ; "conclusion" s’affiche ensuite.',
      max: 34,
      ancres: (p) => [...(p.items || []).map((x) => [x, 'a']), [p.rayer, 'a']],
      textes: (p) => [p.titre, p.conclusion, ...(p.items || []).map((x) => x.texte)],
      dessin: (p, u) => `${kicker(p, u)}${p.titre ? `<p class="moyen">${u.md(p.titre)}</p>` : ''}
        <ul class="items">${(p.items || []).map((x) => `<li><span>${u.esc(x.texte)}<i class="rature"></i></span></li>`).join('')}</ul>
        ${p.conclusion ? `<p class="conclusion">${u.md(p.conclusion)}</p>` : ''}`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.05);
        const lis = qa(el, 'li'), ratures = qa(el, '.rature');
        gsap.set(ratures, { scaleX: 0 });
        lis.forEach((li, i) => c.ft(li, { opacity: 0, x: -90, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)', transformOrigin: '0% 50%' }, t0 + (p.items[i].t == null ? 0.4 + 0.25 * i : p.items[i].t)));
        if (p.rayer) {
          const tr = t0 + p.rayer.t;
          c.ft(ratures, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out', stagger: 0.1 }, tr);
          c.ft(lis, { opacity: 1 }, { opacity: 0.45, duration: 0.3 }, tr + 0.1);
          if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), tr + 0.35);
        } else if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), t0 + d * 0.6);
      },
    },
    // Deux jauges : celle de gauche se vide, celle de droite se remplit sur son ancre.
    bascule: {
      description: 'Deux jauges : "gauche" (ce qui perd de la valeur) se vide, "droite" (ce qui en prend) se remplit sur son ancre "a".',
      max: 30,
      ancres: (p) => [[p.droite, 'a']],
      textes: (p) => [p.gauche && p.gauche.texte, p.droite && p.droite.texte, p.droite && p.droite.sous],
      dessin: (p, u) => `${kicker(p, u)}
        <div class="jauge g"><p>${u.esc(p.gauche.texte)}</p><div class="rail"><i></i></div></div>
        <div class="jauge d"><p>${u.esc(p.droite.texte)}</p><div class="rail"><i></i></div>${p.droite.sous ? `<span>${u.esc(p.droite.sous)}</span>` : ''}</div>`,
      jouer(c, el, p, t0, d) {
        const g = q(el, '.jauge.g'), dr = q(el, '.jauge.d');
        const tb = t0 + (p.droite.t == null ? d * 0.45 : p.droite.t);
        c.monter(q(el, '.kicker'), t0);
        gsap.set(dr, { opacity: 0 });
        c.ft(g, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, t0 + 0.1);
        c.ft(q(g, 'i'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, t0 + 0.2);
        c.ft(q(g, 'i'), { scaleX: 1 }, { scaleX: 0.22, duration: 0.9, ease: 'power3.inOut' }, tb);
        c.ft(g, { opacity: 1 }, { opacity: 0.45, duration: 0.6 }, tb);
        c.ft(dr, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, tb);
        c.ft(q(dr, 'i'), { scaleX: 0.05 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, tb + 0.15);
      },
    },
    // Le compte à rebours : il occupe une pause de la voix ("pauses" dans l'épisode) pour laisser le spectateur réfléchir.
    rebours: {
      description: 'Un compte à rebours pendant une pause de la voix (voir "pauses" dans l’épisode). Les chiffres tombent chaque seconde.',
      max: 0,
      ancres: () => [],
      textes: () => [],
      dessin: (p) => `<div class="rebours"><svg width="520" height="520"><circle cx="260" cy="260" r="236" fill="none" stroke="var(--fg)" stroke-opacity=".18" stroke-width="22"/><circle class="anneau" cx="260" cy="260" r="236" fill="none" stroke="var(--ac)" stroke-width="22" stroke-linecap="round" stroke-dasharray="1483" transform="rotate(-90 260 260)"/></svg>${Array.from({ length: p.secondes || 5 }, (_, i) => `<span>${(p.secondes || 5) - i}</span>`).join('')}</div>`,
      jouer(c, el, p, t0) {
        const n = p.secondes || 5, tc = t0 + (p.t || 0), boite = q(el, '.rebours');
        gsap.set(qa(el, '.rebours span'), { opacity: 0 });
        c.ft(boite, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, t0 + 0.1);
        gsap.set(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } });
        c.ft(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': 1483 }, duration: n, ease: 'none' }, tc);
        qa(el, '.rebours span').forEach((s, i) => {
          c.ft(s, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, tc + i);
          c.ft(s, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.7, duration: 0.18, ease: 'power2.in' }, tc + i + 0.8);
          c.ft(boite, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, tc + i);
        });
      },
    },
    // Le jeu de mots fléchés : trois mots qui se croisent, révélés un par un sur leur ancre, avec la barre singe → homme classique → Molière
    // et un petit minuteur par tranche (« cadence » : une réponse toutes les N secondes, calculée par le montage).
    grille: {
      description: 'Jeu de mots fléchés : "mots": [{ "texte", "sens": "h"|"v", "ligne", "colonne", "indice": { "texte", "a", "fin" }, "reponse": { "a" } }] (de trois à six mots qui se croisent, du plus facile au plus dur) ; "palier": le mot après lequel s’allume le palier du milieu (défaut : 1 pour trois mots, 2 au-delà) ; "figures": trois figures parmi singe, classique, moliere, academicien, hugo ; "cadence": 15 (une réponse toutes les 15 s : "indice.fin" = la phrase après laquelle commence le silence de réflexion) ; "titre" : l’accroche en haut ; "decor": "livres" ou "plage" (fond et scène du bas) ; "lueur": false coupe la lueur des cases du mot cherché ; "pulse": { "a" } : l’instant où la barre pulse (intro) ; "stades" : trois noms de palier.',
      max: 60,
      ancres: (p) => (p.muet ? [] : [[p.pulse, 'a'], ...(p.mots || []).flatMap((m) => [[m.indice, 'a'], [m.reponse, 'a']])]),
      textes: (p) => [p.titre, ...(p.mots || []).map((m) => m.indice && m.indice.texte)],
      valider(p) {
        const e = GR.construire(p.mots).erreurs.slice();
        if ((p.mots || []).length < (p.affichage === 'progressif' ? 1 : 3) || (p.mots || []).length > 6) e.push('le jeu prévoit de trois à six mots qui se croisent (un seul mot est permis en affichage progressif)');
        (p.mots || []).forEach((m, k) => {
          if (!m.indice || !m.indice.texte || (!m.indice.a && !p.muet)) e.push(`mot ${k + 1} : "indice": { "texte", "a" }`);
          if (!m.reponse || (!m.reponse.a && !p.muet)) e.push(`mot ${k + 1} : "reponse": { "a" } (le mot dit par l’orbe)`);
          if (p.cadence && !p.muet && !(m.indice && m.indice.fin)) e.push(`mot ${k + 1} : avec "cadence", "indice": { "fin" } est nécessaire (la phrase après laquelle commence la réflexion)`);
        });
        if (p.cadence !== undefined && !(p.cadence >= 5 && p.cadence <= 30)) e.push('"cadence" : entre 5 et 30 secondes');
        return e;
      },
      dessin: (p, u) => {
        const prog = p.affichage === 'progressif', g = GR.couper(GR.construire(p.mots), p.coupure), D = GR.dims(g, prog, !!p.zoneSure), st = p.stades || ['Singe', 'Homme classique', 'Molière'], fig = p.figures || ['singe', 'classique', 'moliere'], xs = [60, 480, 900];
        const neuves = GR.nouvelles(g, p.mots.length);
        // Les cases : du papier découpé aux bords irréguliers (forme stable), une ombre nette, une couleur par mot ; le halo est dessous.
        const cases = g.cases.map((x, n) => {
          const premier = Math.min(...x.mots), col = GR.COULEURS[premier % GR.COULEURS.length];
          const fl = x.mots.filter((k) => neuves[k] && neuves[k][0] === x).map((k) => (p.mots[k].sens === 'h' ? '→' : '↓')).join('');
          const gauche = x.c * D.pas, haut = x.l * D.pas, forme = GR.papier(n + 1, D.caseTaille, D.caseTaille);
          return `<div class="halo" style="left:${gauche}px;top:${haut}px;--wc:${col}"></div><div class="case" data-m="${x.mots.join(' ')}" data-cx="${D.gx + gauche + D.caseTaille / 2}" data-cy="${D.gy + haut + D.caseTaille / 2}" style="left:${gauche}px;top:${haut}px;--wc:${col}"><div class="pap" style="clip-path:${forme}"><i style="background:${col}"></i><u></u><s></s>${fl ? `<b>${fl}</b>` : ''}<em>${u.esc(x.lettre)}</em></div></div>`;
        }).join('');
        const paliers = st.map((nom, i) => `<div class="palier" style="left:${xs[i]}px">${GR.figure(fig[i])}${prog ? '' : `<p>${u.esc(nom)}</p>`}</div>`).join('');
        // Le minuteur : une tranche par mot (de la définition à la réponse, puis de réponse en réponse) ; un chiffre par seconde restante.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const chiffres = debuts.map((d, w) => { const n = Math.max(1, Math.round(fins[w] - d)); return Array.from({ length: n }, (_, j) => `<span data-w="${w}" data-j="${j}">${prog ? '' : n - j}</span>`).join(''); }).join('');
        const minuteur = `<div class="minuteur${prog ? ' prog' : ''}${p.muetCfg && p.muetCfg.etapes ? ' cache' : ''}"><svg width="84" height="84" viewBox="0 0 84 84"><circle class="m-fond" cx="42" cy="42" r="34"/><circle class="m-doux" cx="42" cy="42" r="34"/><circle class="m-vif" cx="42" cy="42" r="34"/></svg><div class="m-nb">${chiffres}</div></div>`;
        let ox = 150, oy = 390;
        try { const e = require('./orbe.js').emplacement({ orbe: p.orbe, grille: true, fond: 'nuit' }); ox = e.x; oy = e.y; } catch (err) { /* page : pas de require */ }
        const etincelles = g.cases.map(() => '<i class="etincelle"></i>').join('');
        const mu = p.muet || p.muetCfg, N = p.mots.length;
        const indices = (mu && mu.texteIntro ? `<p class="i-intro">${u.esc(mu.texteIntro)}</p>` : '') + p.mots.map((m, k) => `<p class="i-ind"${prog ? ` style="font-size:${N === 1 ? (m.indice.texte.length <= 30 ? 100 : m.indice.texte.length <= 48 ? 88 : 74) : m.indice.texte.length <= 30 ? 84 : m.indice.texte.length <= 48 ? 72 : 60}px"` : ''}>${mu && !prog ? `<small>Mot ${k + 1}/${N}</small>` : ''}${(p.presentateur && (p.presentateur.lignes || []).some((l) => l.lecture) && k === 0 ? `<span class="qwrap">${m.indice.texte.split(' ').map((w) => `<span class="qm">${u.esc(w)}</span>`).join(' ')}</span>` : u.esc(m.indice.texte))}</p>`).join('') + (mu && mu.texteFin ? `<p class="i-fin">${u.esc(mu.texteFin)}</p>` : '');
        const dec = DEC.decor(p.decor), fond = `<svg class="fond-papier" viewBox="0 0 1080 1920" style="--titre:${dec.titre}">${dec.fond}${dec.bas}</svg>` + (p.fond3d ? '<canvas class="fond-3d" width="540" height="960"></canvas>' : '') + (p.fondAnime ? fondAnimeSvg(p.fondAnime, !!p.fond3d) : '');
        return `${fond}${p.titre && !prog ? `<p class="jeu-titre${mu && mu.titreFixe ? ' fixe' : ''}" style="--titre:${dec.titre}">${u.md(p.titre)}</p>` : ''}<div class="bandeau${prog ? ' prog' : ''}" style="clip-path:none">${prog ? '' : `<div class="pap" style="clip-path:${GR.papier(77, 770, 172)}"></div>`}<div class="indices">${indices}</div></div>${prog ? '' : '<i class="scotch s1"></i><i class="scotch s2"></i>'}<div class="grille" data-ox="${ox}" data-oy="${oy}" style="left:${D.gx}px;top:${D.gy}px;--case:${D.caseTaille}px">${cases}</div>${prog ? '' : '<div class="tampon">TROUVÉ</div>'}${minuteur}<div class="barre${prog ? ' prog' : ''}"><div class="strip"><div class="pap" style="clip-path:${GR.papier(88, 1004, 156)}"></div></div><div class="rail"><i></i></div>${paliers}</div>${etincelles}${p.rarete ? (p.mots.map((_, k) => { const tiers = p.rarete.couleurs || ['#4da3ff', '#b45cff', '#ffcf3a']; return `<div class="rar" style="--rc:${tiers[Math.min(k, tiers.length - 1)]}"></div>`; }).join('') + '<div class="rayons"></div>') : ''}${prog && N === 1 && mu && mu.etapes ? (() => { const m0 = p.mots[0], D = Math.max(1, Math.round(m0.reponse.t + 0.5 - m0.indice.t)); return `<div class="chronog"><svg viewBox="0 0 220 220" width="220" height="220"><circle class="cg-fond" cx="110" cy="110" r="94"/><circle class="cg-arc" cx="110" cy="110" r="94"/></svg>${Array.from({ length: D }, (_, j) => `<span data-j="${j}"${D - j <= 3 ? ' class="fin"' : ''}>${D - j}</span>`).join('')}</div>`; })() : ''}${p.presentateur ? `<div class="presente">${p.presentateur.accroche ? `<div class="voile"></div>` : ''}<svg viewBox="0 0 1080 1920" width="1080" height="1920"><g transform="translate(230 1470) scale(0.62)">${p.presentateur.allure === 'hibou2' ? '<use href="#h2-hibou" class="h2-fantome" opacity="0"/><use href="#h2-hibou" class="h2-fantome" opacity="0"/><use href="#h2-hibou" class="h2-fantome" opacity="0"/>' : ''}<g class="saut">${PERSO().svg('debout', p.presentateur.allure || 'hibou')}</g></g></svg>${(() => { const h = (k) => { const x = Math.sin(k * 91.7 + 13.1) * 43758.5; return x - Math.floor(x); }, cols = ['#ffd45c', '#ff5d7a', '#4fd1c5', '#c46bff', '#7fb2ff', '#ff9a5c']; return `<svg class="eclats" viewBox="0 0 1080 1920" width="1080" height="1920">${Array.from({ length: 10 }, (_, k) => `<path class="plume" d="M0 -26 C14 -10 12 14 0 26 C-12 14 -14 -10 0 -26 Z M0 -26 V30" fill="#e9f6ff" fill-opacity=".85" stroke="#ffffff" stroke-width="2" transform="translate(${Math.round(120 + h(k) * 230)} ${Math.round(1120 + h(k + 50) * 120)})" opacity="0"/>`).join('')}${Array.from({ length: 5 }, (_, k) => `<circle class="poussiere" cx="${150 + k * 40}" cy="1462" r="0" fill="#ffffff" fill-opacity=".55"/>`).join('')}${Array.from({ length: 28 }, (_, k) => `<rect class="confetti" x="-9" y="-5" width="18" height="10" rx="2" fill="${cols[k % cols.length]}" transform="translate(230 1240)" opacity="0"/>`).join('')}</svg><div class="flash"></div>`; })()}${p.presentateur.accroche ? `<div class="accroche-h"><p>${u.esc(p.presentateur.accroche.texte)}</p><small>${u.esc(p.presentateur.accroche.sous || '')}</small></div>` : ''}${p.presentateur.cta ? `<div class="cta${p.presentateur.cta.haut ? ' haut' : ''}">${u.esc(p.presentateur.cta.texte)}</div>` : ''}${(p.presentateur.lignes || []).map((l) => `<div class="bulle"><p>${u.esc(l.texte)}</p></div>`).join('')}</div>` : ''}${p.intro ? `<div class="intro-jeu"><svg viewBox="0 0 1080 1920" width="1080" height="1920">${dec.fond}</svg><p>${u.esc(p.intro.texte).replace(/\n/g, '<br>')}</p></div>` : ''}${p.regle ? `<div class="regle"${p.regle.length > 14 ? ' style="font-size:50px"' : ''}><svg viewBox="0 0 40 44" width="50" height="55"><rect x="16" y="0" width="8" height="6" rx="2" fill="currentColor"/><circle cx="20" cy="25" r="16" fill="none" stroke="currentColor" stroke-width="5"/><path d="M20 25 L20 15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg><span>${u.esc(p.regle)}</span></div>` : ''}${prog && N === 1 && mu && mu.chrono ? `<div class="compte">${Array.from({ length: mu.chronoDuree || 5 }, (_, j) => `<span data-j="${j}"${j === (mu.chronoDuree || 5) - 1 ? ' class="fin"' : ''}>${(mu.chronoDuree || 5) - j}</span>`).join('')}</div>` : ''}${p.hype ? `<div class="hype"><div class="h-fond"></div>${p.hype.mots.map((w) => `<div class="hw ${w.style || 'sub'}" style="top:${w.top}px;font-size:${w.taille}px">${u.esc(w.texte)}${w.coeur ? '<svg class="coeur" viewBox="0 0 100 90" width="200" height="180"><path d="M50 86 C20 62 4 46 4 28 C4 14 15 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C85 4 96 14 96 28 C96 46 80 62 50 86Z" fill="#ff4fa3" stroke="#ffffff" stroke-width="5"/></svg>' : ''}</div>`).join('')}</div>` : ''}${p.accroche ? `<div class="accroche"><p>${u.esc(p.accroche.texte)}</p></div>` : ''}${prog && p.teaser ? `<div class="teaser"><p>${u.esc(p.teaser.texte)}</p><div class="t-cases">${Array.from({ length: p.teaser.n || 4 }, (_, i) => `<i>${p.teaser.reponse ? `<b style="font-size:${Math.min(110, Math.floor(760 / (p.teaser.n || 4)))}px">${u.esc(p.teaser.reponse[i] || '')}</b>` : ''}</i>`).join('')}</div></div>` : ''}${prog ? DEC.anim(p.animation)[0]() : ''}`;
      },
      jouer(c, el, p, t0, d) {
        const cases = qa(el, '.case'), indices = qa(el, '.indices p.i-ind'), intro = q(el, '.indices p.i-intro'), pFin = q(el, '.indices p.i-fin'), paliers = qa(el, '.palier'), rail = q(el, '.rail i'), grille = q(el, '.grille');
        const ox = +grille.dataset.ox, oy = +grille.dataset.oy, sparks = qa(el, '.etincelle'), bandeau = q(el, '.bandeau'), tampon = q(el, '.tampon'), scotchs = qa(el, '.scotch');
        const premier = p.mots[0].indice.t, muet = !!p.muetCfg, prog = p.affichage === 'progressif', fixe = !!(p.muetCfg && p.muetCfg.titreFixe), N = p.mots.length, mid = p.palier || (N === 3 ? 1 : 2);
        gsap.set(qa(el, '.case em'), { opacity: 0 }); gsap.set(qa(el, '.case u'), { opacity: 0 }); gsap.set(qa(el, '.case s'), { opacity: 0 }); gsap.set(qa(el, '.halo'), { opacity: 0 });
        gsap.set(indices, { opacity: 0 }); if (intro) gsap.set(intro, { opacity: 0 }); if (pFin) gsap.set(pFin, { opacity: 0 }); gsap.set([bandeau, ...scotchs], { opacity: 0 }); gsap.set(rail, { scaleX: 0 }); gsap.set(sparks, { opacity: 0, left: ox - 9, top: oy - 9 });
        gsap.set(paliers[0], { opacity: 1, scale: 1 }); gsap.set(paliers.slice(1), { opacity: 0.35, scale: 0.85 });
        // Le décor : vagues qui se balancent, crabe, dauphin, souris, livres qui sautent, nuages (jeu-decors.js, tout est fini et déterministe).
        DEC.animer(c, el, p.decor, t0, d);
        if (q(el, '.plume')) gsap.set(q(el, '.plume'), { svgOrigin: '976 1690' });
        const titre = q(el, '.jeu-titre');
        if (titre) { c.lignes(titre, t0 + 0.05); if (!fixe) c.ft(titre, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0 + (muet ? Math.min(premier - 0.9, 2.6) : premier - 0.35)); }
        if (prog && !p.grilleComplete) gsap.set(cases, { opacity: 0 }); else if (prog) c.ft(cases, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, t0); else c.ft(cases, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.025 }, t0 + 0.1);
        c.ft(q(el, '.barre'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t0 + 0.4);
        const tBandeau = t0 + (fixe ? 0 : muet && intro ? Math.min(premier - 0.9, 2.6) + 0.3 : premier - 0.2);
        if (prog && fixe) gsap.set([bandeau, ...scotchs], { opacity: 1, y: 0 }); else c.ft([bandeau, ...scotchs], { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, tBandeau);
        if (intro) { c.ft(intro, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tBandeau + 0.2); c.ft(intro, { opacity: 1 }, { opacity: 0, duration: 0.25 }, t0 + premier - 0.15); }
        // L'intro : la barre pulse une fois (« voyons jusqu'où tu arrives »).
        if (p.pulse && p.pulse.t != null) { c.ft(paliers[0], { scale: 1 }, { scale: 1.18, duration: 0.35, ease: 'power2.out' }, t0 + p.pulse.t); c.ft(paliers[0], { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'power2.inOut' }, t0 + p.pulse.t + 0.35); }
        // Le minuteur : l'anneau se vide, un chiffre par seconde ; il passe en couleur vive pendant les trois dernières secondes.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const mn = q(el, '.minuteur'), doux = q(el, '.m-doux'), vif = q(el, '.m-vif'), tour = 213.6;
        gsap.set(mn, { opacity: 0 }); gsap.set([doux, vif], { attr: { 'stroke-dasharray': tour, 'stroke-dashoffset': 0 } }); gsap.set(vif, { opacity: 0 }); gsap.set(qa(el, '.m-nb span'), { opacity: 0 });
        c.ft(mn, { opacity: 0 }, { opacity: 0.85, duration: 0.5 }, t0 + debuts[0]);
        c.ft(mn, { opacity: 0.85 }, { opacity: 0, duration: 0.6 }, t0 + fins[N - 1] + 0.3);
        if (pFin) c.ft(pFin, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t0 + fins[N - 1] + 1.5);
        if (!(prog && N === 1)) c.ft([bandeau, ...scotchs], { opacity: 0.85 }, { opacity: 0, duration: 0.5 }, t0 + (pFin ? Math.max(d - 0.4, fins[N - 1] + 2.4) : fins[N - 1] + 1.6));
        // Mode chrono : l'anneau et le compte à rebours finissent quand la première lettre tombe (le « ding » du chrono, voir montage.js).
        const chrono = !!(p.muetCfg && p.muetCfg.chrono), dChrono = chrono ? (p.muetCfg.chronoDuree || 5) : 0;
        const finsR = chrono ? fins.map((f) => f + GR.LETTRE.vol) : fins, debutsR = chrono ? finsR.map((f) => f - dChrono) : debuts;
        const compte = qa(el, '.compte span');
        if (compte.length) {
          gsap.set(compte, { opacity: 0 });
          compte.forEach((sp, j) => { const tj = t0 + finsR[0] - dChrono + j; c.ft(sp, { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(2.2)' }, tj); c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.14 }, tj + 0.84); });
        }
        debutsR.forEach((d, w) => {
          const fins = finsR, n = Math.max(1, Math.round(fins[w] - d)), ts = t0 + d, dur = fins[w] - d;
          c.ft([doux, vif], { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tour }, duration: dur, ease: 'none' }, ts);
          c.ft(vif, { opacity: 0 }, { opacity: 1, duration: 0.3 }, ts + dur - 3.2);
          c.ft(vif, { opacity: 1 }, { opacity: 0, duration: 0.2 }, ts + dur + 0.02);
          qa(el, `.m-nb span[data-w="${w}"]`).forEach((sp, j) => {
            const tj = ts + j * (dur / n);
            c.ft(sp, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, tj);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, tj + dur / n - 0.1);
            if (j >= n - 3) c.ft(mn, { scale: 1.14 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, tj);
          });
        });
        // Progressif : la caméra (échelle + translation de la grille) cadre les mots déjà posés, puis dézoome à chaque mot qui arrive.
        const vues = [], centres = [], CX = p.zoneSure ? 470 : 540, LW = p.zoneSure ? 860 : 960, CY = p.coupure ? 1075 : 1010;
        if (prog) {
          const gx = parseFloat(grille.style.left), gy = parseFloat(grille.style.top), sz = parseFloat(grille.style.getPropertyValue('--case'));
          const R = cases.map((x) => ({ l: parseFloat(x.style.left), t: parseFloat(x.style.top), k: Math.min(...x.dataset.m.split(' ').map(Number)) }));
          for (let k = 0; k < N; k += 1) {
            const S = R.filter((r) => r.k <= k), l = Math.min(...S.map((r) => r.l)), t = Math.min(...S.map((r) => r.t)), r2 = Math.max(...S.map((r) => r.l + sz)), b = Math.max(...S.map((r) => r.t + sz));
            const s = Math.max(1, Math.min(LW / (r2 - l), 740 / (b - t), 175 / sz));
            centres.push([(l + r2) / 2, (t + b) / 2]);
            vues.push({ scale: s, x: CX - gx - s * (l + r2) / 2, y: CY - gy - s * (t + b) / 2 });
          }
          if (p.grilleComplete) for (let k = 0; k < N; k += 1) { vues[k] = vues[N - 1]; centres[k] = centres[N - 1]; }
          const s0 = vues[0].scale * (N === 1 ? 1 : 1.12), d0 = { scale: s0, x: CX - gx - s0 * centres[0][0], y: CY - gy - s0 * centres[0][1] };
          gsap.set(grille, Object.assign({ transformOrigin: '0 0' }, d0));
          c.ft(grille, d0, Object.assign({ duration: 0.7, ease: 'power3.out' }, vues[0]), t0);
          DEC.anim(p.animation)[1](c, el, p, t0, d);
        }
        // L'accroche : une phrase de défi en très gros dès l'image 0 (pop), qui s'efface au bout de `duree` secondes et laisse la place à la question.
        if (p.accroche) { const ac = q(el, '.accroche p'), da = p.accroche.duree || 2; gsap.set(ac, { opacity: 1 }); c.ft(ac, { scale: 0.88 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, t0); c.ft(ac, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0 + da - 0.1); }
        // La phrase de défi en typographie cinétique, calée sur les mots de la voix : chaque mot arrive à son instant (pop), « feu » qui tremble, « tampon » qui s'écrase ; le calque assombrit la scène puis s'efface.
        if (p.hype) {
          const th = t0 + p.hype.t, fondH = q(el, '.hype .h-fond'), ws = qa(el, '.hype .hw'), fin = th + p.hype.duree;
          gsap.set(fondH, { opacity: 0 }); gsap.set(ws, { opacity: 0 });
          c.ft(fondH, { opacity: 0 }, { opacity: 1, duration: 0.2 }, th - 0.05); c.ft(fondH, { opacity: 1 }, { opacity: 0, duration: 0.3 }, fin);
          p.hype.mots.forEach((w, i) => {
            const e = ws[i], a = th + w.t, sortie = th + (w.sortie == null ? p.hype.duree - 0.12 : w.sortie);
            if (w.style === 'stamp') c.ft(e, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power3.in' }, a);
            else if (w.style === 'sub') c.ft(e, { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, a);
            else c.ft(e, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, a);
            if (w.style === 'like') { const cs = q(e, '.coeur'); if (cs) for (let u2 = a + 0.3, k = 0; u2 + 0.3 < sortie; u2 += 0.3, k += 1) c.ft(cs, { scale: k % 2 ? 1.2 : 1 }, { scale: k % 2 ? 1 : 1.2, duration: 0.3, ease: 'sine.inOut' }, u2); }
            if (w.style === 'feu') for (let u2 = a + 0.3, k = 0; u2 + 0.06 < sortie; u2 += 0.06, k += 1) c.ft(e, { x: k % 2 ? -7 : 7, y: k % 3 ? 3 : -3 }, { x: k % 2 ? 7 : -7, y: k % 3 ? -3 : 3, duration: 0.06, ease: 'none' }, u2);
            c.ft(e, { opacity: 1 }, { opacity: 0, duration: 0.2 }, sortie);   // chaque mot s'efface avant la fin du calque : rien ne reste sur la grille
          });
        }
        // Grand chrono du mode « une lettre de plus » : l'anneau se vide jusqu'à la révélation, un chiffre par seconde, une pulsation à chaque nouvelle lettre.
        const cg = q(el, '.chronog');
        if (cg && p.muetCfg && p.muetCfg.etapes) {
          const m0 = p.mots[0], ts = t0 + m0.indice.t, te = t0 + m0.reponse.t + GR.LETTRE.vol, arc = q(cg, '.cg-arc'), tourG = 2 * Math.PI * 94, chiffres = qa(cg, 'span'), D = chiffres.length;
          gsap.set(arc, { attr: { 'stroke-dasharray': tourG, 'stroke-dashoffset': 0 } }); gsap.set(chiffres, { opacity: 0 }); gsap.set(cg, { svgOrigin: '0 0' });
          c.ft(arc, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tourG }, duration: te - ts, ease: 'none' }, ts);
          chiffres.forEach((sp, j) => { const tj = ts + j * (te - ts) / D; c.ft(sp, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' }, tj); c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.1 }, tj + (te - ts) / D - 0.08); });
          p.muetCfg.etapes.ordre.forEach((_, j) => { const th = ts + p.muetCfg.etapes.pas * (j + 1); c.ft(cg, { scale: 1.12 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, th); });
          c.ft(cg, { opacity: 1, scale: 1.12 }, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power2.in' }, te);
        }
        // Le présentateur (hibou) : il arrive, cligne des yeux, ouvre le bec au rythme de sa voix (enveloppe à 15 valeurs par seconde,
        // calculée à la préparation de la voix), une bulle par phrase, et saute de joie à la révélation.
        if (p.fond3d) {   // fond 3D : la scène est rendue à chaque image par le même pilote fini
          const cv = q(el, '.fond-3d'), F3 = (typeof self !== 'undefined' ? self : this).Avis.fond3d, Lp = d - (p.amorceBoucle || 0);
          if (cv && F3 && F3[p.fond3d]) { const sc3 = F3[p.fond3d](cv, Lp, p.fond3dOpts), pil = { t: 0 }; sc3.maj(0); c.ft(pil, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => sc3.maj(pil.t) }, t0); }
        }
        if (p.fondAnime) animerFond(c, el, p, t0, d);
        if (p.presentateur) {
          const pr = q(el, '.presente'), bec = q(pr, '.bouche'), yeux = q(pr, '.yeux'), saut = q(pr, '.saut'), bulles = qa(pr, '.bulle'), L = p.presentateur.lignes || [];
          const h2 = p.presentateur.allure === 'hibou2';
          if (!h2) PERSO().jouer(c, pr, 'debout', t0 - 0.7, d, true);
          gsap.set(bulles, { opacity: 0 });
          L.forEach((l, i) => {
            const tl = t0 + l.t, fin = i + 1 < L.length ? t0 + L[i + 1].t - 0.08 : t0 + d;
            if (l.lecture) return;   // la question se lit sur l'écran (karaoké), pas dans une bulle
            if (l.t <= 0 || (i === 0 && p.amorceBoucle)) gsap.set(bulles[i], { opacity: 1 }); else c.ft(bulles[i], { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2.4)' }, tl);
            const vo = p.presentateur.vol, finB = vo && l.t < vo.depart && L[i + 1] && L[i + 1].t > vo.depart ? t0 + vo.depart - 0.1 : fin;   // la bulle part quand il s'envole
            if (i + 1 < L.length) c.ft(bulles[i], { opacity: 1 }, { opacity: 0, duration: 0.08 }, finB);
            if (h2) return;
            let prec = 0.1;
            (l.env || []).forEach((v, k) => { const ry = Math.max(0.1, v * 30); c.ft(bec, { attr: { ry: prec } }, { attr: { ry }, duration: 1 / 15, ease: 'none' }, tl + k / 15); prec = ry; });
            if (l.env && l.env.length) c.ft(bec, { attr: { ry: prec } }, { attr: { ry: 0.1 }, duration: 0.08 }, tl + l.env.length / 15);
          });
          if (p.presentateur.cta) { const ct = q(pr, '.cta'); gsap.set(ct, { opacity: 0 }); c.ft(ct, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.6)' }, t0 + p.presentateur.cta.t); }
          if (h2) animerHibou2(c, el, p, t0, d);
          else {
          const yT = -338, cl = (t) => c.ft(yeux, { attr: { transform: 'translate(0 0) scale(1 1)' } }, { attr: { transform: `translate(0 ${yT * 0.9}) scale(1 0.1)` }, duration: 0.07, yoyo: true, repeat: 1 }, t);
          for (let t = 1.7; t < d - 0.3; t += 2.9) cl(t0 + t);
          if (p.presentateur.saut != null) { const ts = t0 + p.presentateur.saut; c.ft(saut, { attr: { transform: 'translate(0 0) rotate(0 0 -250)' } }, { attr: { transform: 'translate(0 -110) rotate(0 0 -250)' }, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3 }, ts); }
          // Les « folies » : une par phrase au plus (zoom, yeux, tete, tremble, ejecte). Tout est fini et calé sur la phrase.
          const svgP = q(pr, 'svg'), cadre = q(el, '.cadre'), plumes = qa(pr, '.plume'), confettis = qa(pr, '.confetti'), flash = q(pr, '.flash');
          const hs = (k) => { const x = Math.sin(k * 57.3 + 7.7) * 43758.5; return x - Math.floor(x); };
          const tr0 = 'translate(0 0) rotate(0 0 -250)';
          const secoue = (cible, t, amp, n) => c.ft(cible, { x: -amp }, { x: amp, duration: 0.045, yoyo: true, repeat: 2 * n - 1, ease: 'none' }, t);
          L.forEach((l, i) => {
            const tl = t0 + l.t;
            if (l.folie === 'zoom') { gsap.set(svgP, { transformOrigin: '230px 1250px' }); c.ft(svgP, { scale: 1 }, { scale: 1.55, duration: 0.14, ease: 'power3.out', yoyo: true, repeat: 1, repeatDelay: 0.35 }, tl + 0.12); secoue(bulles[i], tl + 0.12, 7, 5); }
            if (l.folie === 'yeux') { c.ft(yeux, { attr: { transform: 'translate(0 0) scale(1 1)' } }, { attr: { transform: `translate(0 ${yT * -0.5}) scale(1.5 1.5)` }, duration: 0.12, ease: 'back.out(3)', yoyo: true, repeat: 1, repeatDelay: 0.6 }, tl + 0.05); if (cadre) secoue(cadre, tl + 0.9, 9, 4); }
            if (l.folie === 'tete') c.ft(saut, { attr: { transform: tr0 } }, { attr: { transform: 'translate(0 0) rotate(360 0 -250)' }, duration: 0.55, ease: 'back.inOut(1.6)' }, tl + 0.1);
            if (l.folie === 'tremble') {
              c.ft(saut, { attr: { transform: 'translate(-7 0) rotate(0 0 -250)' } }, { attr: { transform: 'translate(7 0) rotate(0 0 -250)' }, duration: 0.05, yoyo: true, repeat: 27, ease: 'none' }, tl);
              plumes.forEach((pl, k) => { const x0 = 120 + hs(k) * 230, y0 = 1120 + hs(k + 50) * 120, tk = tl + 0.1 + k * 0.12; c.ft(pl, { opacity: 0, attr: { transform: `translate(${x0} ${y0}) rotate(0)` } }, { opacity: 0.95, attr: { transform: `translate(${x0 + (hs(k + 9) - 0.5) * 120} ${y0 + 260}) rotate(${(hs(k + 3) - 0.5) * 300})` }, duration: 1.3, ease: 'sine.in' }, tk); c.ft(pl, { opacity: 0.95 }, { opacity: 0, duration: 0.3 }, tk + 1.3); });
              const cg2 = q(el, '.chronog'); if (cg2) secoue(cg2, tl, 6, 12);
            }
            if (l.folie === 'ejecte') {
              const tm = tl + 0.75;
              c.ft(saut, { attr: { transform: tr0 } }, { attr: { transform: 'translate(-700 -1150) rotate(720 0 -250)' }, duration: 0.75, ease: 'power2.out' }, tl);
              c.ft(saut, { attr: { transform: 'translate(-700 -1150) rotate(720 0 -250)' } }, { attr: { transform: 'translate(0 0) rotate(1080 0 -250)' }, duration: 0.8, ease: 'bounce.out' }, tm);
              confettis.forEach((cf, k) => { const a = (k / confettis.length) * Math.PI * 2 + hs(k) * 0.4, r = 260 + hs(k + 20) * 340, x = 230 + Math.cos(a) * r, y = 1240 + Math.sin(a) * r * 0.8; c.ft(cf, { opacity: 1, attr: { transform: 'translate(230 1240) rotate(0)' } }, { opacity: 1, attr: { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${Math.round(hs(k + 5) * 720)})` }, duration: 0.7, ease: 'power3.out' }, tl + 0.05); c.ft(cf, { opacity: 1 }, { opacity: 0, duration: 0.6 }, tl + 1.2); });
              c.ft(flash, { opacity: 0 }, { opacity: 0.75, duration: 0.06, yoyo: true, repeat: 1 }, tl);
              if (cadre) secoue(cadre, tl, 14, 5);
            }
          });
          }
        }
        // Carte d'introduction : le décor seul (sans grille ni question) avec une phrase en très gros, puis elle s'efface et le jeu commence.
        if (p.intro) {
          const ij = q(el, '.intro-jeu'), it = q(ij, 'p'), di = p.intro.duree || 1.2;
          gsap.set(ij, { opacity: 1 });
          gsap.set(it, { opacity: 1 }); c.ft(it, { scale: 0.86 }, { scale: 1, duration: 0.35, ease: 'back.out(2.2)' }, t0);   // texte visible dès l'image 0 (couverture)
          c.ft(it, { scale: 1 }, { scale: 1.06, duration: Math.max(0.1, di - 0.6), ease: 'sine.inOut' }, t0 + 0.35);
          c.ft(ij, { opacity: 1 }, { opacity: 0, duration: 0.18 }, t0 + di - 0.18);
        }
        // La fin « teaser » : la grille s'efface, une nouvelle question arrive avec ses cases vides et son minuteur ; la vidéo coupe avant la réponse (et reboucle sur la première question).
        if (prog && p.teaser) {
          const tt = t0 + fins[N - 1] + (p.teaser.delai == null ? 5.6 : p.teaser.delai), tq = q(el, '.teaser p'), tc = qa(el, '.teaser i'), fond0 = Math.max(0.1, d - (tt - t0) - 0.3);
          gsap.set(tq, { opacity: 0 }); gsap.set(tc, { opacity: 0 });
          c.ft(grille, { opacity: 1 }, { opacity: 0, duration: 0.4 }, tt);
          c.ft(tq, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tt + 0.3);
          c.ft(tc, { opacity: 0, y: 40, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.9)', stagger: 0.12 }, tt + 0.5);
          c.ft(mn, { opacity: 0 }, { opacity: 0.85, duration: 0.4 }, tt + 0.3);
          c.ft([doux, vif], { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tour * 0.72 }, duration: fond0, ease: 'none' }, tt + 0.3);
          if (p.teaser.reponse) {
            const lettres = qa(el, '.teaser i b'), tRev = Math.max(tt + 2.4, d - 0.8 - 0.35 - 0.12 * (lettres.length - 1));
            gsap.set(lettres, { opacity: 0 });
            c.ft(lettres, { opacity: 0, scale: 0.4, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2.2)', stagger: 0.12 }, tRev);
            c.ft(tc, { backgroundColor: '#fff6e8' }, { backgroundColor: '#ffd45c', duration: 0.3, stagger: 0.12 }, tRev);
            c.ft(mn, { opacity: 0.85 }, { opacity: 0, duration: 0.3 }, tRev);
          }
          c.ft(tc[0], { scale: 1 }, { scale: 1.08, duration: 0.5, ease: 'sine.inOut' }, tt + 1.4);
          c.ft(tc[0], { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'sine.inOut' }, tt + 1.9);
        }
        const niveau = (j) => (j < mid ? 0.5 * j / mid : 0.5 + 0.5 * (j - mid) / (N - mid)), deja = new Set();
        p.mots.forEach((m, k) => {
          const ti = t0 + m.indice.t, tr = t0 + m.reponse.t, suivant = k + 1 < N ? t0 + p.mots[k + 1].indice.t : tr + 2;
          // L'indice en cours remplace le précédent dans le bandeau.
          // Muet : le nouvel indice arrive 0,8 s après le zéro du minuteur, l'ancien est parti à 0,4 s (jamais deux textes superposés).
          if (prog && k === 0 && !p.accroche) gsap.set(indices[0], { opacity: 1, y: 0 }); else if (prog && k === 0) c.ft(indices[0], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t0 + (p.accroche.duree || 2) - 0.1); else c.ft(indices[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, muet && k ? ti + 0.8 : (fixe ? t0 + (prog ? 0 : Math.min(m.indice.t, 0.3)) : ti));
          if (!(prog && N === 1)) c.ft(indices[k], { opacity: 1 }, { opacity: 0, duration: 0.25 }, muet ? tr + 0.4 : Math.max(tr + 1.1, suivant - 0.3));
          // Pendant la recherche, les cases du mot s'illuminent doucement, la case de départ en tête, puis respirent jusqu'à la réponse.
          const siennes = cases.filter((x) => x.dataset.m.split(' ').includes(String(k)));
          const siennes0 = siennes.filter((x) => !deja.has(x)), tp = prog ? ti + (muet && k ? 0.6 : 0) : ti, tpop = prog ? (k ? tp + 0.3 : t0) : ti, donne = prog && p.premiereLettre && k === 0 ? siennes0[0] : null, aRev = siennes0.filter((x) => x !== donne);
          // Mode « une lettre de plus » (un seul mot) : les lettres d'`etapes.ordre` claquent une à une, toutes les `pas` secondes, avant la révélation finale.
          const etapes = p.muetCfg && p.muetCfg.etapes && k === 0 ? p.muetCfg.etapes : null, indicesC = etapes ? etapes.ordre.map((i) => siennes[i]).filter(Boolean) : [], aFin = aRev.filter((x) => !indicesC.includes(x));
          if (donne) { deja.add(donne); gsap.set(donne, { opacity: 1 }); gsap.set(q(donne, 'em'), { opacity: 1 }); gsap.set(q(donne, 'i'), { opacity: 0.5 }); }
          indicesC.forEach((cell, j) => {
            const th = ti + etapes.pas * (j + 1);
            deja.add(cell);
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.5, duration: 0.2 }, th);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, th);
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.4 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, th);
          });
          // Progressif : la suite de cases de ce mot arrive (pop) au début de sa fenêtre ; les croisements déjà posés restent.
          if (prog && !p.grilleComplete) {
            if (N === 1) { const toutes = [donne, ...aRev].filter(Boolean); gsap.set(toutes, { opacity: 1, scale: 1 }); }   // un seul mot : cases immobiles et complètes dès l'image 0 (couverture nette)   // un seul mot : image 0 complète (couverture)
            else c.ft(aRev, { opacity: 0, y: 40, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: k ? 0.4 : 0.3, ease: 'back.out(1.9)', stagger: k ? 0.12 : 0.07 }, tpop);
            if (k) c.ft(grille, vues[k - 1], Object.assign({ duration: 0.9, ease: 'power2.inOut' }, vues[k]), tp - 0.1);
          }
          const H = GR.horaires(tr, aFin.length, t0 + (m.reponse.f == null ? m.reponse.t : m.reponse.f));
          if (p.lueur !== false) {
            const te = H.depart - 0.05;
            aFin.forEach((cell, i) => {
              const lueurs = [q(cell, 's'), cell.previousElementSibling], base = i === 0 ? 0.85 : 0.5, bas = base * 0.45, ta = tpop + (prog ? 0.35 : 0.3) + i * 0.12;
              c.ft(lueurs, { opacity: 0 }, { opacity: base, duration: 0.6, ease: 'power2.out' }, ta);
              if (i === 0 && q(cell, 'b')) { c.ft(q(cell, 'b'), { scale: 1 }, { scale: 1.7, duration: 0.3, ease: 'power2.out' }, ta); c.ft(q(cell, 'b'), { scale: 1.7 }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, ta + 0.3); }
              let v = base, tc = ta + 0.7, bas1 = true;
              while (tc + 0.8 <= te - 0.1) { const v2 = bas1 ? bas : base; c.ft(lueurs, { opacity: v }, { opacity: v2, duration: 0.8, ease: 'sine.inOut' }, tc); v = v2; bas1 = !bas1; tc += 0.8; }
              c.ft(lueurs, { opacity: v }, { opacity: 0, duration: 0.3 }, Math.max(tc, te - 0.05));
            });
          }
          // La révélation : une étincelle part de l'orbe vers chaque case neuve, la case s'illumine d'une onde, la lettre monte en devenant nette.
          aFin.forEach((cell, j) => {
            deja.add(cell);
            const ta = H.pose[j], tl = ta - GR.LETTRE.vol;
            const sp = sparks[cases.indexOf(cell)], dx = +cell.dataset.cx - ox, dy = +cell.dataset.cy - oy;
            if (!prog) {
            c.ft(sp, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.08 }, tl);
            c.ft(sp, { x: 0 }, { x: dx, duration: GR.LETTRE.vol, ease: 'power1.in' }, tl);
            c.ft(sp, { y: 0 }, { y: dy, duration: GR.LETTRE.vol, ease: 'power3.out' }, tl);
            c.ft(sp, { scale: 1 }, { scale: 0.3, duration: 0.2, ease: 'power2.in' }, tl + 0.35);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, ta); }
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.9, duration: 0.14 }, ta);
            c.ft(q(cell, 'i'), { opacity: 0.9 }, { opacity: 0.5, duration: 0.7, ease: 'power2.out' }, ta + 0.14);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, ta);
            if (p.rarete) { const tiers = p.rarete.couleurs || ['#4da3ff', '#b45cff', '#ffcf3a'], cl = tiers[Math.min(k, tiers.length - 1)]; c.ft(q(cell, 'i'), { backgroundColor: q(cell, 'i').style.background || '#ff7a5c' }, { backgroundColor: cl, duration: 0.2 }, ta + 0.14); }
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.55, filter: 'blur(7px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2.2)' }, ta);
          });
          // Un croisement déjà révélé par un mot précédent : un simple éclat de la couleur du nouveau mot.
          siennes.filter((x) => !siennes0.includes(x)).forEach((cell) => { c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.7, duration: 0.6, ease: 'power2.out' }, tr + 0.2); });
          // Le mot complet : une vague de lumière balaie ses lettres, un tampon « TROUVÉ » s'écrase sur le bandeau.
          siennes.forEach((cell, i) => {
            c.ft(q(cell, 'em'), { scale: 1 }, { scale: 1.16, duration: 0.18, ease: 'power2.out' }, H.fin + 0.15 + i * 0.07);
            c.ft(q(cell, 'em'), { scale: 1.16 }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, H.fin + 0.33 + i * 0.07);
          });
          if (p.rarete) {
            const rr = qa(el, '.rar')[k], ray = q(el, '.rayons'), amp = 0.22 + 0.55 * k / Math.max(1, N - 1);
            c.ft(rr, { opacity: 0 }, { opacity: amp, duration: 0.15 }, H.fin + 0.05); c.ft(rr, { opacity: amp }, { opacity: 0, duration: 0.8 }, H.fin + 0.2);
            if (k >= N - 2) { c.ft(ray, { opacity: 0, scale: 0.3, rotation: 0 }, { opacity: 0.7, scale: 1, rotation: 40, duration: 0.8, ease: 'power2.out' }, H.fin); c.ft(ray, { opacity: 0.7, rotation: 40 }, { opacity: 0, rotation: 110, duration: 1.6, ease: 'none' }, H.fin + 0.8); }
          }
          const plume = q(el, '.plume');
          if (plume) { c.ft(plume, { rotation: 0 }, { rotation: -9, duration: 0.18, ease: 'power2.out' }, H.fin + 0.1); c.ft(plume, { rotation: -9 }, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, H.fin + 0.28); }
          if (!prog) { c.ft(tampon, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, H.fin + 0.1);
          c.ft(tampon, { opacity: 1 }, { opacity: 0, duration: 0.35 }, H.fin + 1.3); }
          const tb = H.fin + 0.2;
          c.ft(rail, { scaleX: niveau(k) }, { scaleX: niveau(k + 1), duration: 0.8, ease: 'power2.inOut' }, tb);
          const monte = k === mid - 1 ? 1 : k === N - 1 ? 2 : -1;
          if (monte > 0) {
            c.ft(paliers[monte], { opacity: 0.35, scale: 0.85 }, { opacity: 1, scale: 1.1, duration: 0.5, ease: 'back.out(2)' }, tb + 0.4);
            c.ft(paliers[monte - 1], { opacity: 1, scale: 1 }, { opacity: 0.5, scale: 0.9, duration: 0.4 }, tb + 0.4);
          }
        });
      },
    },
    // La fin, après la voix : la question au spectateur et la flèche vers les commentaires.
    fin: {
      description: 'La fin, après la voix ("apres": durée en secondes) : la question au spectateur, la flèche vers les commentaires.',
      max: 48,
      ancres: () => [],
      textes: (p) => [p.texte, p.sous],
      dessin: (p, u) => `<p class="grand geant">${u.md(p.texte)}</p>${p.sous ? `<p class="moyen bas">${u.md(p.sous)}</p>` : ''}
        <svg class="fleche" width="1080" height="1920"><path d="M620 1150 C800 1170 900 1230 930 1330 M896 1296 L932 1338 L962 1292" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      jouer(c, el, p, t0) {
        c.lignes(q(el, '.grand'), t0 + 0.05);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.35);
        const f = q(el, '.fleche path');
        gsap.set(f, { drawSVG: '0%' });
        c.ft(f, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.out' }, t0 + 0.8);
      },
    },
  };
});
