/*
 * Rig de l'escargot, en ombres lumineuses (direction artistique A2) : corps sombre, contour ambre,
 * coquille en spirale, deux yeux au bout de pédoncules. Il est lent, et il pense à sa salade.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).escargot = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const AMBRE = '#ffb347';
  const AMP = 5;
  // Le centre du premier œil, en coordonnées du décor (pour calculer les regards).
  const centreOeil = (place) => [place.x + 76 * place.s, place.y - 94 * place.s];
  const ancre = (place, nom) => (nom === 'oeil' ? centreOeil(place) : nom === 'coquille' ? [place.x - 6 * place.s, place.y - 52 * place.s] : [place.x + 10 * place.s, place.y - 40 * place.s]);

  function dessin(place) {
    const oeil = (x, y) => `<g class="esc-oeil"><circle cx="${x}" cy="${y}" r="15" fill="${NOIR}" stroke="${AMBRE}" stroke-width="2"/>
      <circle cx="${x}" cy="${y}" r="10.5" fill="#fff6e0"/><g class="esc-pupille"><circle cx="${x}" cy="${y}" r="5.5" fill="${NOIR}"/></g></g>`;
    const corps = 'M-74 0 C-76 -20 -46 -28 -22 -28 L28 -28 C46 -28 54 -42 64 -50 C70 -60 82 -58 80 -48 C78 -36 94 -28 94 -12 C94 -2 84 3 72 3 L-62 3 C-70 3 -74 2 -74 0 Z';
    return `
  <g id="escargot" transform="translate(${place.x} ${place.y}) scale(${place.s})"><g id="escargot-rebond"><g id="escargot-corps">
    <path d="${corps}" fill="none" stroke="${AMBRE}" stroke-width="7" filter="url(#lueur-forte)" opacity="0.9"/>
    <circle cx="-6" cy="-52" r="48" fill="none" stroke="${AMBRE}" stroke-width="7" filter="url(#lueur-forte)" opacity="0.9"/>
    <path d="${corps}" fill="${NOIR}" stroke="#ffd98a" stroke-width="1.6"/>
    <circle cx="-6" cy="-52" r="46" fill="${NOIR}" stroke="#ffd98a" stroke-width="1.8"/>
    <path d="M-6 -52 m0 0 c6 -10 24 -8 24 8 c0 22 -34 24 -38 -2 c-4 -34 46 -38 52 -2 c6 42 -58 52 -64 4" fill="none" stroke="${AMBRE}" stroke-width="3.2" stroke-linecap="round" filter="url(#lueur)"/>
    <path d="M58 -10 Q78 -2 88 -14" fill="none" stroke="#2c5a3c" stroke-width="2.6" stroke-linecap="round"/>
    <g id="escargot-yeux"><g class="esc-pedoncule"><path d="M70 -48 L62 -90" stroke="${NOIR}" stroke-width="9" stroke-linecap="round"/><path d="M70 -48 L62 -90" stroke="${AMBRE}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>${oeil(62, -96)}</g>
    <g class="esc-pedoncule"><path d="M84 -46 L92 -88" stroke="${NOIR}" stroke-width="9" stroke-linecap="round"/><path d="M84 -46 L92 -88" stroke="${AMBRE}" stroke-width="2" stroke-linecap="round" opacity="0.8"/>${oeil(94, -94)}</g></g>
  </g></g></g>`;
  }

  const GESTES = {
    regarder: { canal: 'regard', duree: (p) => p.duree || 0.6, params: 'de, vers : décalages des pupilles ; duree', role: 'Ses pupilles suivent un point (lentement : c\'est un escargot).' },
    rentrer: { canal: 'yeux', duree: () => 0.5, params: '—', role: 'Il rentre ses yeux dans sa tête, gêné.' },
    sortir: { canal: 'yeux', duree: () => 0.5, params: '—', role: 'Il ressort ses yeux.' },
  };
  function ambiance(c) {
    c.cycle(c.q('#escargot-corps'), { scaleY: 1, scaleX: 1, svgOrigin: '0 0' }, { scaleY: 1.04, scaleX: 0.99, svgOrigin: '0 0' }, 4 * c.T);
    c.cycle(c.q('#escargot-rebond'), { y: 0 }, { y: -3 }, 2 * c.T, 'power1.inOut');
    c.qa('.esc-pedoncule').forEach((el, i) => c.cycle(el, { rotation: -3, svgOrigin: i ? '84 -46' : '70 -48' }, { rotation: 3, svgOrigin: i ? '84 -46' : '70 -48' }, 3 * c.T));
  }
  function repos(c, p) {
    const v = p.regard || [0, 0];
    c.repos(c.qa('.esc-pupille'), { x: v[0], y: v[1] });
  }
  const gestes = {
    regarder(c, t, p) {
      c.ft(c.qa('.esc-pupille'), { x: p.de[0], y: p.de[1] }, { x: p.vers[0], y: p.vers[1], duration: p.duree || 0.6, ease: 'power1.inOut' }, t);
    },
    rentrer(c, t) {
      c.ft(c.q('#escargot-yeux'), { scaleY: 1, svgOrigin: '77 -47' }, { scaleY: 0.25, svgOrigin: '77 -47', duration: 0.5, ease: 'back.in(1.5)' }, t);
    },
    sortir(c, t) {
      c.ft(c.q('#escargot-yeux'), { scaleY: 0.25, svgOrigin: '77 -47' }, { scaleY: 1, svgOrigin: '77 -47', duration: 0.5, ease: 'back.out(2)' }, t);
    },
  };

  return { id: 'escargot', nom: "l'escargot", AMP, centreOeil, ancre, dessin, GESTES, ambiance, repos, gestes };
});
