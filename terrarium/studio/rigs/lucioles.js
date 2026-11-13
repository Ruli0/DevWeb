/*
 * Rig des trois lucioles : de petites bêtes lumineuses aux grands yeux (direction artistique A2).
 * Chacune a un indice « i » (0, 1 ou 2). Elles éclairent autour d'elles.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).lucioles = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const ECHELLE = 2.3;
  const AMP = 2.6;
  const centreOeil = (pos) => [pos[0], pos[1] - 2 * ECHELLE];
  const ancre = (pos) => [pos[0], pos[1]];

  function dessin(positions) {
    return positions.map(([x, y], i) => `
  <g id="luciole-${i}" class="luciole" transform="translate(${x} ${y})"><g class="luciole-flotte"><g transform="scale(${ECHELLE})"><g class="luciole-corps">
    <circle r="34" fill="url(#halo-luciole)"/>
    <ellipse class="luciole-aile" cx="-9" cy="-12" rx="8" ry="11" fill="#d8f6ff" opacity="0.7" transform="rotate(-25 -9 -12)"/><ellipse class="luciole-aile" cx="9" cy="-12" rx="8" ry="11" fill="#d8f6ff" opacity="0.7" transform="rotate(25 9 -12)"/>
    <circle cy="11" r="11" fill="#eaff7a" filter="url(#lueur)"/>
    <circle r="10" fill="${NOIR}" stroke="#c9ff8a" stroke-width="1.2"/>
    <g class="luciole-yeux"><circle class="luciole-sclere" cx="-4" cy="-2" r="5" fill="#fff"/><circle class="luciole-sclere" cx="4" cy="-2" r="5" fill="#fff"/>
    <g class="luciole-pupille"><circle cx="-4" cy="-2" r="2.4" fill="#111"/><circle cx="4" cy="-2" r="2.4" fill="#111"/></g></g>
  </g></g></g></g>`).join('');
  }

  const GESTES = {
    regarder: { canal: 'regard', duree: (p) => p.duree || 0.3, params: 'i ; de, vers : décalages des pupilles ; duree', role: 'Les pupilles de la luciole i suivent un point.' },
    fixer: { canal: 'oeil', duree: () => 0.3, params: 'i', role: 'La luciole i fixe : ses yeux grossissent.' },
    relacher: { canal: 'oeil', duree: () => 0.3, params: 'i', role: 'La luciole i relâche son regard.' },
    danser: { canal: 'danse', duree: (p) => p.duree || 1.2, params: 'i ; duree', role: 'La luciole i fait une petite pirouette de joie.' },
  };

  function ambiance(c) {
    c.qa('.luciole-flotte').forEach((el, i) => c.cycle(el, { y: 0, x: 0 }, { y: -10 - (i % 2) * 4, x: i % 2 ? 6 : -6 }, c.T * (2 + (i % 2))));
    c.qa('.luciole-aile').forEach((el) => c.cycle(el, { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 0.3, transformOrigin: '50% 100%' }, c.D / Math.round(c.D / 0.12), 'none'));
    c.qa('.luciole').forEach((el, i) => c.cycle(el.querySelector('circle'), { opacity: 1 }, { opacity: 0.55 }, c.T * (1 + (i % 2) * 0.5)));
  }
  function repos(c, p) {
    c.qa('.luciole-pupille').forEach((el, i) => { const v = (p.regards && p.regards[i]) || [0, 0]; c.repos(el, { x: v[0], y: v[1] }); });
  }
  const pupille = (c, i) => c.qa('.luciole-pupille')[i];
  const yeux = (c, i) => c.qa('.luciole-sclere').length ? Array.from(c.qa('.luciole-sclere')).slice(i * 2, i * 2 + 2) : [];
  const gestes = {
    regarder(c, t, p) {
      c.ft(pupille(c, p.i), { x: p.de[0], y: p.de[1] }, { x: p.vers[0], y: p.vers[1], duration: p.duree || 0.3, ease: 'power2.out' }, t);
    },
    fixer(c, t, p) {
      c.ft(yeux(c, p.i), { attr: { r: 5 } }, { attr: { r: 7 }, duration: 0.25, ease: 'back.out(2)' }, t);
    },
    relacher(c, t, p) {
      c.ft(yeux(c, p.i), { attr: { r: 7 } }, { attr: { r: 5 }, duration: 0.3 }, t);
    },
    danser(c, t, p) {
      const corps = c.qa('.luciole-corps')[p.i]; const d = p.duree || 1.2;
      c.ft(corps, { rotation: 0, y: 0, svgOrigin: '0 0' }, { rotation: 360, y: -14, svgOrigin: '0 0', duration: d / 2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t);
      c.tl.set(corps, { rotation: 0, y: 0 }, t + d + 0.01);
    },
  };

  return { id: 'lucioles', nom: 'les lucioles', AMP, centreOeil, ancre, dessin, GESTES, ambiance, repos, gestes };
});
