/*
 * Scène « graphique » (V3) : des barres qui partent de zéro ; la valeur importante en accent ; la source.
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

  const Y0 = 640, PAS = 220, L = 800;
  return {
    id: 'graphique',
    description: 'Les données d’une étude : 2 à 5 barres horizontales, valeurs en compteur, source.',
    params: { titre: 'ce que montrent les barres, *mot* clé', barres: '[{ label, valeur }] (2 à 5)', unite: '« % » par défaut', max: 'valeur de la barre pleine (100 par défaut)', accent: 'index de la barre en accent (0 par défaut)', source: 'identifiant de la fiche de sources' },
    source: true,
    min: 6,
    texteSource: (p) => p.titre,
    textes: (p) => [p.titre, ...p.barres.map((b) => b.label)],
    sons: (p) => [['souffle.wav', 0.2, 0.3], ...p.barres.map((_, i) => ['tic.wav', 1.3 + i * 0.35, 0.25])],
    dessin(p, S, u) {
      const a = S.couleurs.accent, t = S.couleurs.texte, max = p.max || 100, unite = p.unite == null ? '%' : p.unite;
      return `
      <p class="ph">${u.md(p.titre)}</p>
      <svg class="dessin" width="1080" height="1920">
        <line class="axe" x1="80" y1="${Y0 - 30}" x2="80" y2="${Y0 + (p.barres.length - 1) * PAS + 90}" stroke="${t}" stroke-opacity=".35" stroke-width="2"/>
        ${p.barres.map((b, i) => `<rect class="barre" x="80" y="${Y0 + i * PAS + 50}" width="${Math.max(4, (L * b.valeur) / max)}" height="56" fill="${i === (p.accent || 0) ? a : t}" fill-opacity="${i === (p.accent || 0) ? 1 : 0.28}"/>`).join('')}
      </svg>
      ${p.barres.map((b, i) => `<div class="barre-label" style="top:${Y0 + i * PAS - 12}px">${u.esc(b.label)}</div>
        <div class="barre-val${i === (p.accent || 0) ? ' acc' : ''}" style="top:${Y0 + i * PAS + 46}px;left:${Math.round(80 + Math.max(4, (L * b.valeur) / max) + 20)}px"><span class="v">${b.valeur}</span>${u.esc(unite)}</div>`).join('')}
      <div class="src" style="top:1356px">${u.esc(p._source || '')}</div>`;
    },
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const titre = c.lignes(q('.ph'));
      c.entrer(titre, t0);
      c.tracer(q('.axe'), t0 + 0.8, 0.8);
      qa('.barre').forEach((b, i) => {
        const t = t0 + 1.2 + i * 0.35;
        c.apparaitre(qa('.barre-label')[i], t - 0.1, 0.7);
        c.ft(b, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: c.M.dureeCompteur, ease: c.M.compteur, transformOrigin: '0% 50%' }, t);
        c.apparaitre(qa('.barre-val')[i], t + 0.3);
        c.compteur(qa('.barre-val .v')[i], p.barres[i].valeur, t, 0);
      });
      c.apparaitre(q('.src'), t0 + 2.4, 0.6);
      c.sortir(titre, fin);
      c.disparaitre(qa('.dessin, .barre-label, .barre-val, .src'), fin);
    },
  };
});
