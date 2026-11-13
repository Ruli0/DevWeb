/*
 * Rig de Mousse, le gardien, en silhouette (direction artistique A2).
 * Il est devant la vitre : en coordonnées d'écran, hors de la caméra. Sa lanterne éclaire la scène.
 * Le dessin vient de public/js/art/gardien.js, recoloré.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).mousse = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const HUMEURS = ['neutre', 'content', 'surpris', 'blase'];
  // Mousse en couleurs claires (13 nov. 2026) : corps bleu, mousse verte, bottes brunes.
  const SILHOUETTE = { '#2a3550': '#5a6fae', '#151c2e': '#34407a', '#3fa34d': '#5fc46a', '#3b2a24': '#7a5236', '#0a1020': '#0a1020' };

  // Node seulement : le dessin du gardien (public/js/art/gardien.js), avec ses ombres et sa lumière (studio/lumiere.js).
  function dessin() {
    const gardien = require('../../public/js/art/gardien.js');
    const lumiere = require('../lumiere.js');
    let s = gardien.mousse();
    for (const [de, vers] of Object.entries(SILHOUETTE)) s = s.split(de).join(vers);
    return `${lumiere.sousMousse()}${s}${lumiere.surMousse()}`;
  }

  const GESTES = {
    expression: { canal: 'oeil', duree: () => 0.3, params: `de, vers : ${HUMEURS.join(', ')}`, role: "Son œil change d'expression, sa pousse frétille." },
    depit: { canal: 'posture', duree: (p) => p.duree || 1.6, params: 'duree', role: "Il s'affaisse et se cache l'œil." },
    pointer: { canal: 'posture', duree: (p) => p.duree || 1.6, params: 'duree', role: 'Il tend sa lanterne vers la scène.' },
    pencher: { canal: 'posture', duree: (p) => p.duree || 1.6, params: 'duree', role: 'Il se penche, curieux.' },
    rire: { canal: 'saut', duree: (p) => p.duree || 1.2, params: 'duree', role: 'Il est secoué de rire, deux secousses par temps.' },
    sauter: { canal: 'saut', duree: (p) => p.duree || 1.6, params: 'fois (2) ; duree', role: 'Il saute de joie.' },
  };

  const PIEDS = '135 336'; const EPAULE = '35 210'; const MAIN = '246 172';
  function ambiance(c) {
    c.cycle(c.q('#mousse-battement'), { y: 7 }, { y: 0 }, c.T);
    c.cycle(c.q('#mousse-pousse'), { rotation: -10, transformOrigin: '0% 100%' }, { rotation: 10, transformOrigin: '0% 100%' }, 2 * c.T);
    c.cycle(c.q('#lanterne-flamme'), { scaleY: 0.9, transformOrigin: '50% 100%' }, { scaleY: 1.08, transformOrigin: '50% 100%' }, c.D / Math.round(c.D / 0.13));
    c.cycle(c.q('#mousse-perche'), { rotation: -2, svgOrigin: MAIN }, { rotation: 2, svgOrigin: MAIN }, 4 * c.T);
    c.cycle(c.q('#lanterne-lueur'), { opacity: 1 }, { opacity: 0.7 }, c.T);
  }
  function repos(c, p) {
    c.repos(c.qa('#mousse-oeil > g'), { opacity: 0 });
    c.repos(c.q('#oeil-' + (p.humeur || 'neutre')), { opacity: 1 });
    c.repos(c.q('#mousse-geste'), { rotation: 0, y: 0, svgOrigin: PIEDS });
  }
  const aller = (c, el, de, vers, t, d, ease) => c.ft(el, de, Object.assign({}, vers, { duration: d, ease: ease || 'back.out(2)' }), t);
  const gestes = {
    expression(c, t, p) {
      if (p.de === p.vers) return;
      c.tl.set(c.q('#oeil-' + p.de), { opacity: 0 }, t);
      c.tl.set(c.q('#oeil-' + p.vers), { opacity: 1 }, t);
      c.ft(c.q('#mousse-pousse'), { scale: 1, transformOrigin: '0% 100%' }, { scale: 1.4, transformOrigin: '0% 100%', duration: 0.09, yoyo: true, repeat: 3 }, t);
      c.ft(c.q('#mousse-oeil'), { scaleX: 1.35, transformOrigin: '50% 50%' }, { scaleX: 1, transformOrigin: '50% 50%', duration: 0.3, ease: 'back.out(3)' }, t);
    },
    depit(c, t, p) {
      const d = p.duree || 1.6; const g = c.q('#mousse-geste'); const bras = c.q('#mousse-bras');
      aller(c, g, { rotation: 0, y: 0, svgOrigin: PIEDS }, { rotation: 7, y: 16, svgOrigin: PIEDS }, t, 0.3);
      aller(c, bras, { rotation: 0, scale: 1, svgOrigin: EPAULE }, { rotation: -109, scale: 1.5, svgOrigin: EPAULE }, t + 0.05, 0.28, 'back.out(1.6)');
      aller(c, bras, { rotation: -109, scale: 1.5, svgOrigin: EPAULE }, { rotation: 0, scale: 1, svgOrigin: EPAULE }, t + d - 0.4, 0.35, 'power2.inOut');
      aller(c, g, { rotation: 7, y: 16, svgOrigin: PIEDS }, { rotation: 0, y: 0, svgOrigin: PIEDS }, t + d - 0.4, 0.4, 'power2.inOut');
    },
    pointer(c, t, p) {
      const d = p.duree || 1.6; const g = c.q('#mousse-geste'); const perche = c.q('#mousse-perche-geste');
      aller(c, perche, { rotation: 0, svgOrigin: MAIN }, { rotation: -13, svgOrigin: MAIN }, t, 0.35, 'back.out(2.5)');
      aller(c, perche, { rotation: -13, svgOrigin: MAIN }, { rotation: 0, svgOrigin: MAIN }, t + d - 0.6, 0.6, 'elastic.out(1, 0.5)');
      aller(c, g, { rotation: 0, svgOrigin: PIEDS }, { rotation: -5, svgOrigin: PIEDS }, t, 0.35);
      aller(c, g, { rotation: -5, svgOrigin: PIEDS }, { rotation: 0, svgOrigin: PIEDS }, t + d - 0.5, 0.45, 'power2.inOut');
    },
    pencher(c, t, p) {
      const d = p.duree || 1.6; const g = c.q('#mousse-geste');
      aller(c, g, { rotation: 0, svgOrigin: PIEDS }, { rotation: -9, svgOrigin: PIEDS }, t, 0.4, 'back.out(1.8)');
      aller(c, g, { rotation: -9, svgOrigin: PIEDS }, { rotation: 0, svgOrigin: PIEDS }, t + d - 0.45, 0.45, 'power2.inOut');
    },
    rire(c, t, p) {
      const d = p.duree || 1.2; const n = Math.max(1, Math.round(d / (c.T / 2)));
      c.ft(c.q('#mousse-saut'), { y: 0 }, { y: -12, duration: d / n / 2, yoyo: true, repeat: 2 * n - 1, ease: 'sine.inOut' }, t);
      c.ft(c.q('#mousse-pousse'), { rotation: 0, transformOrigin: '0% 100%' }, { rotation: 18, transformOrigin: '0% 100%', duration: d / n / 2, yoyo: true, repeat: 2 * n - 1 }, t);
    },
    sauter(c, t, p) {
      const n = p.fois || 2; const un = (p.duree || 1.6) / n; const s = c.q('#mousse-saut'); const h = p.hauteur || 80;
      for (let k = 0; k < n; k += 1) {
        const t0 = t + k * un;
        c.ft(s, { scaleY: 1, svgOrigin: PIEDS }, { scaleY: 0.86, svgOrigin: PIEDS, duration: un * 0.18, ease: 'power2.out' }, t0);
        c.ft(s, { scaleY: 0.86, svgOrigin: PIEDS }, { scaleY: 1.07, svgOrigin: PIEDS, duration: un * 0.14, ease: 'power2.out' }, t0 + un * 0.18);
        c.ft(s, { y: 0 }, { y: -h, duration: un * 0.3, ease: 'power2.out' }, t0 + un * 0.18);
        c.ft(s, { y: -h }, { y: 0, duration: un * 0.3, ease: 'power2.in' }, t0 + un * 0.48);
        c.ft(s, { scaleY: 1.07, svgOrigin: PIEDS }, { scaleY: 0.9, svgOrigin: PIEDS, duration: un * 0.08 }, t0 + un * 0.78);
        c.ft(s, { scaleY: 0.9, svgOrigin: PIEDS }, { scaleY: 1, svgOrigin: PIEDS, duration: un * 0.14, ease: 'back.out(3)' }, t0 + un * 0.86);
      }
    },
  };

  return { id: 'mousse', nom: 'Mousse, le gardien', dessin, HUMEURS, GESTES, ambiance, repos, gestes };
});
