/*
 * Scène « citation » (V3) : une phrase d'un article ou d'un chercheur, en grand, avec sa référence.
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
    id: 'citation',
    description: 'Une phrase exacte d’un article (ou son titre), avec la référence.',
    params: { texte: 'la phrase exacte, *mot* clé', nature: '« titre de l’article » ou « extrait », affiché au-dessus', source: 'identifiant de la fiche de sources' },
    source: true,
    min: 5.4,
    texteSource: (p) => p.texte,
    textes: (p) => [p.texte],
    sons: () => [['souffle.wav', 0.3, 0.35]],
    dessin: (p, S, u) => `
      <div class="guillemet-txt">«</div>
      <svg class="dessin" width="1080" height="1920"><line class="trait" x1="80" y1="750" x2="260" y2="750" stroke="${S.couleurs.accent}" stroke-width="3"/></svg>
      ${p.nature ? `<div class="nature">${u.esc(p.nature)}</div>` : ''}
      <p class="ph citation">${u.md(p.texte)}</p>
      <div class="src" style="top:1356px">${u.esc(p._source || '')}</div>`,
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s);
      const lignes = c.lignes(q('.citation'));
      c.apparaitre(q('.guillemet-txt'), t0);
      c.tracer(q('.trait'), t0 + 0.3, 0.9);
      c.apparaitre(q('.nature'), t0 + 0.3, 0.6);
      c.entrer(lignes, t0 + 0.6);
      c.apparaitre(q('.src'), t0 + 1.6, 0.6);
      c.sortir(lignes, fin);
      c.disparaitre([q('.dessin'), q('.guillemet-txt'), q('.nature'), q('.src')].filter(Boolean), fin);
    },
  };
});
