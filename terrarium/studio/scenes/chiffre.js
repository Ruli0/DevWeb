/*
 * Scène « chiffre » (V3) : un chiffre géant qui compte jusqu'à sa valeur, une légende, la source.
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

  // Position du trait d'accent : la scène « cerveau » en part quand la transition est « forme ».
  const FILET = { x1: 80, x2: 260, y: 1012 };
  return {
    id: 'chiffre',
    description: "Le chiffre d'une étude : compteur géant, légende, source.",
    params: { avant: 'petit chapeau (« jusqu’à », « près de »), facultatif', valeur: 'nombre affiché', unite: '« % » ou rien', decimales: '0 par défaut', legende: 'ce que le chiffre mesure, *mot* clé', source: 'identifiant de la fiche de sources (c1…)' },
    source: true,
    FILET,
    min: 5.4,
    texteSource: (p) => p.legende,
    textes: (p) => [p.avant || '', p.legende].filter(Boolean),
    sons: () => [['impact.wav', 0.25, 0.55], ['souffle.wav', 1.3, 0.35]],
    dessin: (p, S, u) => `
      ${p.avant ? `<div class="kicker">${u.esc(p.avant)}</div>` : ''}
      <div class="chiffre"><span class="compte">${u.esc(p.valeur)}</span>${p.unite ? `<span class="pc">${u.esc(p.unite)}</span>` : ''}</div>
      <svg class="filet" width="1080" height="1920"><line x1="${FILET.x1}" y1="${FILET.y}" x2="${FILET.x2}" y2="${FILET.y}" stroke="${S.couleurs.accent}" stroke-width="3"/></svg>
      <p class="legende">${u.md(p.legende)}</p>
      <div class="src" style="top:1356px">${u.esc(p._source || '')}</div>`,
    jouer(c, el, p, t0, d, fin, ctx) {
      const q = (s) => el.querySelector(s);
      const kicker = c.lignes(q('.kicker'));
      const lignes = c.lignes(q('.legende'));
      c.entrer(kicker, t0);
      c.ft(q('.chiffre'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: c.M.dureeEntree, ease: 'entree' }, t0 + 0.15);
      c.compteur(q('.compte'), +p.valeur, t0 + 0.15, p.decimales);
      if (q('.pc')) c.ft(q('.pc'), { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.7, ease: 'entree' }, t0 + 0.9);
      c.tracer(q('.filet line'), t0 + 1.0, 1.0);
      c.entrer(lignes, t0 + 1.3);
      c.apparaitre(q('.src'), t0 + 2.0, 0.6);
      c.sortir([...kicker], fin);
      c.ft(q('.chiffre'), { opacity: 1, yPercent: 0 }, { opacity: 0, yPercent: -20, duration: c.M.dureeSortie, ease: c.M.sortie }, fin);
      c.sortir(lignes, fin + 0.05);
      c.disparaitre(q('.src'), fin);
      // Avec une transition « forme », le trait reste : la scène suivante le transforme.
      if (!(ctx.suivante && ctx.suivante.p.transition === 'forme')) c.disparaitre(q('.filet'), fin);
    },
  };
});
