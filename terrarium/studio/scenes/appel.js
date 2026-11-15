/*
 * Scène « appel » (format « test ») : retour au large, « A ou B ? » en commentaire, flèche vers les commentaires, mention.
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
    id: 'appel',
    format: 'test',
    description: 'La fin : retour au large, l’appel à répondre en commentaire (flèche), la mention « information, pas un avis médical ».',
    params: { texte: 'l’appel, *mot* clé (par exemple « Et toi ? *A* ou *B* ? Dis-le en commentaire. »)' },
    min: 3.4,
    textes: (p) => [p.texte],
    sons: () => [['souffle.wav', 0, 0.35], ['tic.wav', 1.0, 0.3]],
    dessin: (p, S, u) => `<p class="ph">${u.md(p.texte)}</p>
      <svg class="dessin"><path class="fleche" d="M700 1180 C860 1200 940 1250 960 1330 M930 1300 L960 1336 L990 1298" fill="none" stroke="#ff7a4d" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="600" stroke-dashoffset="600"/></svg>
      <div class="mention">information, pas un avis médical</div>`,
    jouer(c, el, p, t0, d) {
      const q = (s) => el.querySelector(s);
      c.camera('large', t0, 0.9);
      c.calme(t0, 1);
      c.decharges(0.3, t0, 1);
      c.coup(t0);
      const l = c.lignes(q('.ph'));
      gsap.set(l, { yPercent: 110 });
      c.ft(l, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 }, t0 + 0.1);
      c.ft(q('.fleche'), { attr: { 'stroke-dashoffset': 600 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 0.7, ease: 'power2.out' }, t0 + 1.0);
      c.apparaitre(q('.mention'), t0 + 1.2, 0.6);
    },
  };
});
