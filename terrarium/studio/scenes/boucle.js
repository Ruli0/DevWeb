/*
 * Scène « boucle » (V3) : la fin, qui ramène au début : la phrase d'accroche, la mention et l'invitation.
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
    id: 'boucle',
    description: 'La fin : reprend l’accroche (la vidéo boucle), avec la mention « information, pas un avis médical ».',
    params: { texte: 'phrase qui relance (souvent celle de l’accroche), *mot* clé', suite: 'invitation, par exemple « n° 02 : la peur du jugement »' },
    min: 4,
    textes: (p) => [p.texte],
    sons: () => [['souffle.wav', 0.1, 0.35]],
    dessin: (p, S, u) => `
      <div class="centre">
        <svg class="trait-acc" width="900" height="8"><line x1="0" y1="4" x2="120" y2="4" stroke="${S.couleurs.accent}" stroke-width="3"/></svg>
        <p class="ph geant">${u.md(p.texte)}</p>
      </div>
      <div class="mention">${p.suite ? `${u.esc(p.suite)}<br>` : ''}information, pas un avis médical</div>`,
    jouer(c, el, p, t0, d) {
      const q = (s) => el.querySelector(s);
      const trait = q('.trait-acc line');
      // Fin de la vidéo : retour à l’état de la première image de l’accroche (la ligne se recentre).
      c.ft(trait, { attr: { x1: 0, x2: 120 } }, { attr: { x1: 380, x2: 520 }, duration: Math.max(1, d - 0.6), ease: 'sine.inOut' }, t0 + 0.3);
      const mots = c.mots(q('.ph'));
      gsap.set(mots, { yPercent: 110 });
      c.ft(mots, { yPercent: 110 }, { yPercent: 0, duration: c.M.dureeEntree, ease: 'entree', stagger: 0.07 }, t0 + 0.1);
      c.apparaitre(q('.mention'), t0 + 1.2, 0.6);
      c.ft(mots, { yPercent: 0 }, { yPercent: 110, duration: 0.45, ease: c.M.sortie, stagger: 0.03 }, t0 + d - 0.6);
      c.ft(q('.mention'), { opacity: 0.6 }, { opacity: 0, duration: 0.4 }, t0 + d - 0.5);
    },
  };
});
