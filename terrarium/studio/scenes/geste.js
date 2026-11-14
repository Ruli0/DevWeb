/*
 * Scène « geste » (V3) : une action concrète, puis 2 ou 3 points qui se cochent.
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

  const Y0 = 720, PAS = 170;
  return {
    id: 'geste',
    description: 'Le geste concret à essayer : une phrase, puis 2 ou 3 points cochés.',
    params: { texte: 'l’action en une phrase, *mot* clé', points: '2 ou 3 points courts' },
    min: 6,
    textes: (p) => [p.texte, ...(p.points || [])],
    sons: (p) => [['souffle.wav', 0.2, 0.3], ...(p.points || []).map((_, i) => ['tic.wav', 1.5 + i * 0.7, 0.3])],
    dessin: (p, S, u) => `
      <p class="ph">${u.md(p.texte)}</p>
      <svg class="dessin" width="1080" height="1920" fill="none" stroke-linecap="round" stroke-linejoin="round">
        ${(p.points || []).map((_, i) => `<rect class="case" x="80" y="${Y0 + i * PAS}" width="56" height="56" rx="8" stroke="${S.couleurs.texte}" stroke-opacity=".5" stroke-width="2"/>
          <path class="coche" d="M93 ${Y0 + i * PAS + 29} L104 ${Y0 + i * PAS + 41} L124 ${Y0 + i * PAS + 16}" stroke="${S.couleurs.accent}" stroke-width="4"/>`).join('')}
      </svg>
      ${(p.points || []).map((pt, i) => `<p class="point" style="top:${Y0 + i * PAS - 4}px">${u.md(pt)}</p>`).join('')}`,
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const lignes = c.lignes(q('.ph'));
      c.entrer(lignes, t0);
      qa('.point').forEach((pt, i) => {
        const t = t0 + 1.3 + i * 0.7;
        c.apparaitre([qa('.case')[i], pt], t);
        c.tracer(qa('.coche')[i], t + 0.3, 0.5);
      });
      c.sortir(lignes, fin);
      c.disparaitre(qa('.dessin, .point'), fin);
    },
  };
});
