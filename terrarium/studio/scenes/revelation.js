/*
 * Scène « revelation » (format « test ») : coupure, flash, zoom rapide dans une zone du cerveau qui s'embrase (ou s'éteint), phrase et étiquette.
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

  const ETATS = {
    alarme: { zones: { amygdale: 1, insula: 0.6 }, decharges: 1 },
    frein: { zones: { pfc: 0.9, amygdale: 0.4, insula: 0.2 }, decharges: 0.6 },
    recompense: { zones: { striatum: 1, amygdale: 0.2 }, decharges: 0.8 },
    deconnexion: { zones: { pfc: 0.05, amygdale: 0.1, cortex: 0.05 }, decharges: 0 },
  };
  const NOMS = { amygdale: 'amygdale', pfc: 'cortex préfrontal', striatum: 'striatum', hippocampe: 'hippocampe', insula: 'insula' };
  return {
    id: 'revelation',
    format: 'test',
    description: 'La révélation : coupure de musique, flash, zoom rapide vers une zone du cerveau qui change d’état, une phrase, une étiquette.',
    params: { texte: 'la phrase (au plus 70 caractères), *mot* clé', zone: 'amygdale, pfc, striatum, hippocampe ou insula', etat: 'alarme, frein, recompense ou deconnexion', role: 'sous-titre de l’étiquette, facultatif (« l’alarme »)' },
    min: 3.4,
    textes: (p) => [p.texte],
    coupure: true,
    sons: () => [['impact.wav', 0, 0.7], ['souffle.wav', 0.1, 0.3]],
    dessin: (p, S, u) => `<p class="ph">${u.md(p.texte)}</p><div class="etiq-z ${p.etat === 'frein' ? 'froid' : 'chaud'}">${NOMS[p.zone] || p.zone}${p.role ? `<span>${u.esc(p.role)}</span>` : ''}</div>`,
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s);
      const e = ETATS[p.etat] || ETATS.alarme;
      c.flash(t0);
      c.camera(p.zone, t0, p.etat === 'frein' ? 0.8 : 0.7);
      c.zones(e.zones, t0, 0.4);
      c.decharges(e.decharges, t0, 0.3);
      c.coup(t0, p.etat === 'frein' ? 1.06 : 1.12);
      const l = c.lignes(q('.ph'));
      gsap.set(l, { yPercent: 110 });
      c.ft(l, { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out', stagger: 0.07 }, t0 + 0.1);
      const etiq = q('.etiq-z');
      c.suivre(etiq, p.zone, p.zone === 'pfc' ? 300 : 150, p.zone === 'pfc' ? -300 : 100);
      gsap.set(etiq, { opacity: 0 });
      c.ft(etiq, { opacity: 0 }, { opacity: 1, duration: 0.3 }, t0 + c.B);
      c.ft(etiq, { opacity: 1 }, { opacity: 0, duration: 0.2 }, fin + 0.2);
      c.ft(l, { yPercent: 0 }, { yPercent: -110, duration: 0.3, ease: 'power2.in', stagger: 0.04 }, t0 + d - 0.35);
    },
  };
});
