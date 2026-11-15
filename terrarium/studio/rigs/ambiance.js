/*
 * L'ambiance lumineuse de la scène : le voile qui assombrit, et le projecteur braqué sur le caméléon
 * (faisceau, flaque de lumière, poussière). C'est l'image de « tout le monde me regarde ».
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).ambiance = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Node seulement : le faisceau, centré sur x (le caméléon).
  const dessin = (x) => require('../lumiere.js').projecteur(x);

  const GESTES = {
    projecteur: { canal: 'projecteur', duree: () => 0.5, params: 'etat : allumer ou eteindre', role: "Le projecteur s'allume (la scène s'assombrit autour du caméléon) ou s'éteint." },
  };
  function ambiance(c) {
    c.qa('.poussiere').forEach((el, i) => c.cycle(el, { y: 0, x: 0 }, { y: -26 - (i % 5) * 6, x: i % 2 ? 10 : -10 }, c.D / (1 + (i % 3))));
  }
  function repos(c) {
    c.repos(c.qa('#projecteur, #voile, #rim-projecteur'), { opacity: 0 });
  }
  const gestes = {
    projecteur(c, t, p) {
      const [a, b] = p.etat === 'eteindre' ? [1, 0] : [0, 1];
      c.ft(c.q('#projecteur'), { opacity: a }, { opacity: b, duration: 0.5, ease: 'power2.inOut' }, t);
      c.ft(c.q('#voile'), { opacity: a * 0.42 }, { opacity: b * 0.42, duration: 0.5, ease: 'power2.inOut' }, t);
      c.ft(c.q('#rim-projecteur'), { opacity: a }, { opacity: b, duration: 0.5, ease: 'power2.inOut' }, t);
    },
  };

  return { id: 'ambiance', nom: "l'ambiance (projecteur)", dessin, GESTES, ambiance, repos, gestes };
});
