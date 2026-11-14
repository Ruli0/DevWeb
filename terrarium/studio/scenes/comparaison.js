/*
 * Scène « comparaison » (V3) : deux colonnes (ce qu'on croit / ce qui se passe) ; la colonne de droite s'allume.
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
    id: 'comparaison',
    description: 'Deux états côte à côte : croyance et réalité, avant et après.',
    params: { gauche: '{ titre, texte }', droite: '{ titre, texte } (la réponse, en accent)', source: 'identifiant de la fiche de sources' },
    source: true,
    min: 6,
    texteSource: (p) => p.droite.texte,
    textes: (p) => [p.gauche.titre, p.gauche.texte, p.droite.titre, p.droite.texte],
    sons: () => [['souffle.wav', 0.2, 0.3], ['tic.wav', 1.2, 0.25], ['impact.wav', 2.4, 0.4]],
    dessin: (p, S, u) => `
      <svg class="dessin" width="1080" height="1920"><line class="milieu" x1="540" y1="520" x2="540" y2="1260" stroke="${S.couleurs.texte}" stroke-opacity=".35" stroke-width="2"/></svg>
      <div class="col gauche"><div class="col-titre">${u.esc(p.gauche.titre)}</div><p class="col-texte">${u.md(p.gauche.texte)}</p></div>
      <div class="col droite"><div class="col-titre">${u.esc(p.droite.titre)}</div><p class="col-texte">${u.md(p.droite.texte)}</p></div>
      <div class="src" style="top:1356px">${u.esc(p._source || '')}</div>`,
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const g = c.lignes(q('.gauche .col-texte')), dr = c.lignes(q('.droite .col-texte'));
      c.apparaitre(q('.gauche .col-titre'), t0, 0.6);
      c.entrer(g, t0 + 0.2);
      c.tracer(q('.milieu'), t0 + 1.0, 1.0);
      c.apparaitre(q('.droite .col-titre'), t0 + 1.4, 0.6);
      c.entrer(dr, t0 + 1.6);
      c.ft(q('.gauche'), { opacity: 1 }, { opacity: 0.45, duration: 0.8, ease: 'power2.out' }, t0 + 2.4);
      c.ft(q('.droite .col-texte'), { color: c.S.couleurs.texte }, { color: c.S.couleurs.accent, duration: 0.8, ease: 'power2.out' }, t0 + 2.4);
      c.apparaitre(q('.src'), t0 + 2.6, 0.6);
      c.sortir([...g, ...dr], fin);
      c.disparaitre(qa('.col-titre, .dessin, .src'), fin);
    },
  };
});
