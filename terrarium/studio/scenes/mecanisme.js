/*
 * Scène « mecanisme » (V3) : deux à quatre étapes reliées par un trait qui se dessine ; option : une boucle de retour.
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

  const Y0 = 620, PAS = 190, X = 120;
  return {
    id: 'mecanisme',
    description: 'Un enchaînement : déclencheur, réaction, conséquence. Option boucle.',
    params: { titre: 'phrase du haut, *mot* clé', etapes: '2 à 4 étapes courtes (au plus 26 caractères)', boucle: 'true : une flèche ramène de la dernière étape à la première' },
    min: 6,
    textes: (p) => [p.titre, ...p.etapes],
    sons: (p) => [['souffle.wav', 0.2, 0.3], ...p.etapes.map((_, i) => ['tic.wav', 1.4 + i * 0.75, 0.3])],
    dessin(p, S, u) {
      const a = S.couleurs.accent, t = S.couleurs.texte;
      const n = p.etapes.length, yFin = Y0 + (n - 1) * PAS;
      return `
      <p class="ph">${u.md(p.titre)}</p>
      <svg class="dessin" width="1080" height="1920" fill="none" stroke-linecap="round">
        <line class="axe" x1="${X}" y1="${Y0}" x2="${X}" y2="${yFin}" stroke="${t}" stroke-opacity=".35" stroke-width="2"/>
        ${p.boucle ? `<path class="retour" d="M${X - 30} ${yFin} C${X - 70} ${yFin} ${X - 70} ${Y0} ${X - 30} ${Y0}" stroke="${a}" stroke-width="2.4" stroke-dasharray="3 9"/><path class="pointe" d="M${X - 40} ${Y0 - 10} L${X - 28} ${Y0} L${X - 40} ${Y0 + 10}" stroke="${a}" stroke-width="2.4"/>` : ''}
        ${p.etapes.map((_, i) => `<circle class="rond" cx="${X}" cy="${Y0 + i * PAS}" r="20" fill="${S.couleurs.fond}" stroke="${a}" stroke-width="2.4"/><circle class="coeur" cx="${X}" cy="${Y0 + i * PAS}" r="9" fill="${a}"/>`).join('')}
      </svg>
      ${p.etapes.map((e, i) => `<div class="etape" style="top:${Y0 + i * PAS - 44}px"><span class="num">${String(i + 1).padStart(2, '0')}</span><p>${u.md(e)}</p></div>`).join('')}`;
    },
    jouer(c, el, p, t0, d, fin) {
      const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)];
      const titre = c.lignes(q('.ph'));
      c.entrer(titre, t0);
      c.tracer(q('.axe'), t0 + 1.0, 0.75 * p.etapes.length);
      qa('.etape').forEach((e, i) => {
        const t = t0 + 1.2 + i * 0.75;
        c.ft(qa('.rond')[i], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'entree', transformOrigin: '50% 50%' }, t);
        c.ft(qa('.coeur')[i], { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.6, ease: 'entree', transformOrigin: '50% 50%' }, t + 0.15);
        c.apparaitre(e, t + 0.1);
      });
      if (p.boucle) {
        const t = t0 + 1.4 + p.etapes.length * 0.75;
        c.tracer(q('.retour'), t, 1.1);
        c.apparaitre(q('.pointe'), t + 1.0);
      }
      c.sortir(titre, fin);
      c.disparaitre(qa('.etape, .dessin'), fin);
    },
  };
});
