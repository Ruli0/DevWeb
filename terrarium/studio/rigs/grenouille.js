/*
 * Rig de la grenouille, en ombres lumineuses (direction artistique A2) : corps sombre, contour cyan,
 * gros yeux. Elle observe la scène : ses pupilles suivent un point, et quand elle « fixe » quelqu'un,
 * ses yeux grossissent et rosissent.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).grenouille = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const OEIL_Y = -92;
  const AMP = 7; // décalage maximal d'une pupille, dans le repère du rig
  // Le centre de l'œil droit, en coordonnées du décor (pour calculer les regards).
  const centreOeil = (place) => [place.x, place.y + OEIL_Y * place.s];
  const ancre = (place, nom) => (nom === 'oeil' ? centreOeil(place) : nom === 'bouche' ? [place.x, place.y - 40 * place.s] : [place.x, place.y - 60 * place.s]);

  function dessin(place) {
    const oeil = (dx) => `<g class="gren-oeil"><circle cx="${dx}" cy="${OEIL_Y}" r="25" fill="${NOIR}" stroke="#9af8ff" stroke-width="1.6"/>
      <circle class="gren-sclere" cx="${dx}" cy="${OEIL_Y}" r="17" fill="#eafff0" filter="url(#lueur)"/>
      <g class="gren-pupille"><circle class="gren-pupille-rond" cx="${dx}" cy="${OEIL_Y}" r="9" fill="${NOIR}"/></g></g>`;
    return `
  <g id="grenouille" transform="translate(${place.x} ${place.y}) scale(${place.s})"><g id="grenouille-rebond"><g id="grenouille-corps">
    <ellipse cx="0" cy="-48" rx="74" ry="52" fill="none" stroke="#5ef2ff" stroke-width="5" filter="url(#lueur-forte)"/>
    <ellipse cx="-56" cy="-14" rx="32" ry="18" fill="${NOIR}"/><ellipse cx="56" cy="-14" rx="32" ry="18" fill="${NOIR}"/>
    <ellipse cx="0" cy="-48" rx="70" ry="50" fill="${NOIR}" stroke="#9af8ff" stroke-width="1.6"/>
    <g id="grenouille-gorge"><ellipse cx="0" cy="-28" rx="40" ry="22" fill="#0d2a1a"/></g>
    ${[[-34, -68, 7], [30, -74, 6], [-8, -80, 5]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#9af8ff" filter="url(#lueur)"/>`).join('')}
    <path d="M-40 -52 Q0 -30 40 -52" stroke="#2c6a7a" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="-22" cy="-3" rx="16" ry="7" fill="${NOIR}"/><ellipse cx="22" cy="-3" rx="16" ry="7" fill="${NOIR}"/>
    ${oeil(-28)}${oeil(28)}
  </g></g></g>`;
  }

  const GESTES = {
    regarder: { canal: 'regard', duree: (p) => p.duree || 0.3, params: 'de, vers : décalages des pupilles (calculés par le compilateur) ; duree', role: 'Ses pupilles suivent un point.' },
    fixer: { canal: 'oeil', duree: () => 0.3, params: '—', role: 'Elle fixe : ses yeux grossissent et rosissent, les pupilles rétrécissent.' },
    relacher: { canal: 'oeil', duree: () => 0.3, params: '—', role: 'Elle relâche son regard : ses yeux reviennent à la normale.' },
    cligner: { canal: 'paupiere', duree: (p) => (p.fois || 1) * 0.3, params: 'fois (1)', role: "Elle cligne des yeux, indifférente." },
    coasser: { canal: 'gorge', duree: (p) => (p.fois || 2) * 0.5, params: 'fois (2)', role: 'Sa gorge gonfle : elle coasse.' },
  };

  function ambiance(c) {
    c.cycle(c.q('#grenouille-corps'), { scaleY: 1, svgOrigin: '0 0' }, { scaleY: 1.03, svgOrigin: '0 0' }, 2 * c.T);
    c.cycle(c.q('#grenouille-rebond'), { y: 0 }, { y: -5 }, c.T, 'power1.inOut'); // elle rebondit sur le temps
    c.cycle(c.q('#grenouille-gorge'), { scaleY: 1, scaleX: 1, svgOrigin: '0 -30' }, { scaleY: 1.12, scaleX: 1.04, svgOrigin: '0 -30' }, 4 * c.T);
  }
  function repos(c, p) {
    const v = p.regard || [0, 0];
    c.repos(c.qa('.gren-pupille'), { x: v[0], y: v[1] });
  }
  const gestes = {
    regarder(c, t, p) {
      c.ft(c.qa('.gren-pupille'), { x: p.de[0], y: p.de[1] }, { x: p.vers[0], y: p.vers[1], duration: p.duree || 0.3, ease: 'power2.out' }, t);
    },
    fixer(c, t) {
      c.ft(c.qa('.gren-sclere'), { attr: { r: 17 }, fill: '#eafff0' }, { attr: { r: 22 }, fill: '#ff6fb5', duration: 0.25, ease: 'back.out(2)' }, t);
      c.ft(c.qa('.gren-pupille-rond'), { attr: { r: 9 } }, { attr: { r: 6 }, duration: 0.25 }, t);
    },
    relacher(c, t) {
      c.ft(c.qa('.gren-sclere'), { attr: { r: 22 }, fill: '#ff6fb5' }, { attr: { r: 17 }, fill: '#eafff0', duration: 0.3, ease: 'power2.out' }, t);
      c.ft(c.qa('.gren-pupille-rond'), { attr: { r: 6 } }, { attr: { r: 9 }, duration: 0.3 }, t);
    },
    cligner(c, t, p) {
      for (let k = 0; k < (p.fois || 1); k += 1) {
        c.ft(c.qa('.gren-oeil'), { scaleY: 1, transformOrigin: '50% 50%' }, { scaleY: 0.08, transformOrigin: '50% 50%', duration: 0.08, yoyo: true, repeat: 1 }, t + k * 0.3);
      }
    },
    coasser(c, t, p) {
      const g = c.q('#grenouille-gorge');
      for (let k = 0; k < (p.fois || 2); k += 1) {
        c.ft(g, { scaleX: 1, scaleY: 1, svgOrigin: '0 -30' }, { scaleX: 1.35, scaleY: 1.6, svgOrigin: '0 -30', duration: 0.2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + k * 0.5);
      }
    },
  };

  return { id: 'grenouille', nom: 'la grenouille', AMP, centreOeil, ancre, dessin, GESTES, ambiance, repos, gestes };
});
