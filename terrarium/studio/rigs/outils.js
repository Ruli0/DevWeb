/*
 * Rig des outils de l'IA : des objets lumineux suspendus à des fils, comme la mouche
 * (direction artistique A2). Chaque coup de langue qui en attrape un est un « appel d'outil ».
 *   loupe : la recherche ; page : la lecture.
 * Positions en coordonnées du décor. Les gestes reçoivent toujours l'id de l'outil.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).outils = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const fil = `<line x1="0" y1="-46" x2="0" y2="-2400" stroke="#d9ffb0" stroke-width="7" opacity="0.12"/><line x1="0" y1="-46" x2="0" y2="-2400" stroke="#e9ffd8" stroke-width="2.6" opacity="0.75"/>`;
  const DESSINS = {
    loupe: `
      <circle r="62" fill="url(#halo-outil)"/>
      <path d="M22 22 L52 52" stroke="${NOIR}" stroke-width="16" stroke-linecap="round"/>
      <path d="M22 22 L52 52" stroke="#9af8ff" stroke-width="3" stroke-linecap="round" opacity="0.7"/>
      <circle r="32" fill="#5ef2ff" opacity="0.22"/>
      <circle r="32" fill="none" stroke="#9af8ff" stroke-width="7" filter="url(#lueur)"/>
      <path d="M-14 -16 A20 20 0 0 1 8 -22" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round" opacity="0.8"/>
      <circle cy="-40" r="4" fill="#d9ffb0"/>`,
    page: `
      <circle r="62" fill="url(#halo-outil)"/>
      <path d="M-30 -40 H16 L32 -24 V40 H-30 Z" fill="#eafff0" filter="url(#lueur)"/>
      <path d="M16 -40 V-24 H32" fill="#b6ff5c" opacity="0.6"/>
      <path d="M-20 -18 H20 M-20 -4 H22 M-20 10 H18 M-20 24 H8" stroke="#0d2a1a" stroke-width="5" stroke-linecap="round"/>
      <circle cy="-44" r="4" fill="#d9ffb0"/>`,
  };

  function dessin() {
    return Object.entries(DESSINS).map(([id, d]) => `
  <g id="outil-${id}" class="outil">${fil}<g class="outil-balance" id="outil-${id}-corps">${d}</g></g>`).join('');
  }

  const GESTES = {
    descendre: { canal: 'position', duree: (p) => p.duree || 0.8, params: 'id ; vers ; duree', role: "L'outil descend au bout de son fil (il apparaît)." },
    remonter: { canal: 'position', duree: (p) => p.duree || 0.6, params: 'id ; de ; duree', role: "L'outil remonte et disparaît." },
    attrape: { canal: 'position', duree: () => 0.3, params: 'id', role: "Attrapé par la langue : il est avalé (l'appel d'outil est fait)." },
  };

  function ambiance(c) {
    c.qa('.outil-balance').forEach((el, i) => c.cycle(el, { rotation: -6, svgOrigin: '0 -46' }, { rotation: 6, svgOrigin: '0 -46' }, 2 * c.T * (1 + (i % 2)) ));
  }
  function repos(c, p) {
    Object.entries(p.items || {}).forEach(([id, o]) => c.repos(c.q('#outil-' + id), { x: o.pos[0], y: o.visible ? o.pos[1] : o.pos[1] - 900, opacity: o.visible ? 1 : 0 }));
  }
  const gestes = {
    descendre(c, t, p) {
      const el = c.q('#outil-' + p.id); const d = p.duree || 0.8;
      c.tl.set(el, { opacity: 1, x: p.vers[0] }, t);
      c.ft(el, { y: p.vers[1] - 900 }, { y: p.vers[1], duration: d, ease: 'elastic.out(1, 0.55)' }, t);
    },
    remonter(c, t, p) {
      const el = c.q('#outil-' + p.id); const d = p.duree || 0.6;
      c.ft(el, { y: p.de[1] }, { y: p.de[1] - 900, duration: d, ease: 'power2.in' }, t);
      c.tl.set(el, { opacity: 0 }, t + d);
    },
    attrape(c, t, p) {
      const corps = c.q('#outil-' + p.id + '-corps');
      c.ft(corps, { scale: 1, svgOrigin: '0 0' }, { scale: 0.2, svgOrigin: '0 0', duration: 0.25, ease: 'power2.in' }, t);
      c.tl.set(c.q('#outil-' + p.id), { opacity: 0 }, t + 0.25);
      c.tl.set(corps, { scale: 1, svgOrigin: '0 0' }, t + 0.26);
    },
  };

  return { id: 'outils', nom: 'les outils (loupe, page)', IDS: Object.keys(DESSINS), dessin, GESTES, ambiance, repos, gestes };
});
