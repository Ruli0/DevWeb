/*
 * Scène « accroche » (V3) : une phrase courte, en grand, centrée ; une ligne d'accent bouge dès la première image.
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
    id: 'accroche',
    description: 'Ouvre la vidéo : une question ou une phrase qui touche, en grand, centrée.',
    params: { texte: 'la phrase (au plus 60 caractères), *mot* pour le mot clé' },
    min: 3.4,
    textes: (p) => [p.texte],
    sons: () => [['souffle.wav', 0.05, 0.4]],
    dessin: (p, S, u) => `
      <div class="centre">
        <svg class="trait-acc" width="900" height="8"><line x1="0" y1="4" x2="900" y2="4" stroke="${S.couleurs.accent}" stroke-width="3"/></svg>
        <p class="ph geant">${u.md(p.texte)}</p>
      </div>`,
    jouer(c, el, p, t0, d, fin) {
      const trait = el.querySelector('.trait-acc line');
      // Mouvement visible dès la première image : la ligne s'étire puis se resserre lentement.
      c.ft(trait, { attr: { x1: 380, x2: 520 } }, { attr: { x1: 0, x2: 160 }, duration: 1.2, ease: 'entree' }, t0);
      c.ft(trait, { attr: { x1: 0, x2: 160 } }, { attr: { x1: 0, x2: 120 }, duration: Math.max(0.5, d - 1.4), ease: 'sine.inOut' }, t0 + 1.2);
      const mots = c.mots(el.querySelector('.ph'));
      gsap.set(mots, { yPercent: 110 });
      c.ft(mots, { yPercent: 110 }, { yPercent: 0, duration: c.M.dureeEntree, ease: 'entree', stagger: 0.07 }, t0 + 0.1);
      c.sortir(el.querySelectorAll('.ph .ligne > *'), fin);
      c.disparaitre(el.querySelector('.trait-acc'), fin);
    },
  };
});
