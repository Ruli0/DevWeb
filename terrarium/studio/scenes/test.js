/*
 * Scène « test » (format « test ») : « TEST. » claque sur le premier temps, puis l'annonce.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.scenes = racine.Terrarium.scenes || {})[api.id] = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    id: 'test',
    format: 'test',
    description: 'Ouvre le format « test » : « TEST. » qui claque, puis l’annonce (« 3 secondes. »).',
    params: { texte: 'l’annonce après « TEST. », par exemple « 3 secondes. »', cerveau: 'état du cerveau (facultatif)' },
    min: 1.6,
    textes: (p) => [p.texte],
    lecture: 0.3,
    sons: () => [['impact.wav', 0, 0.6]],
    dessin: (p, S, u) => `<p class="ph choc"><span class="chaud">TEST.</span> ${u.md(p.texte)}</p>`,
    jouer(c, el, p, t0, d) {
      const l = c.lignes(el.querySelector('.ph'));
      gsap.set(l, { yPercent: 110 });
      c.ft(l, { yPercent: 110, scale: 1.3 }, { yPercent: 0, scale: 1, duration: 0.35, ease: 'power4.out', stagger: 0.05 }, t0);
      c.coup(t0, 1.1);
      c.ft(l, { yPercent: 0 }, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, t0 + d - 0.3);
    },
  };
});
