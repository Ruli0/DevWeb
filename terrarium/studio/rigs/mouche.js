/*
 * Rig de la mouche : une luciole aux grands yeux, suspendue à un fil de soie lumineux
 * (direction artistique A2 : la mouche au fil de la piste C).
 * Elle se déplace en coordonnées du décor (x, y) ; le fil monte toujours tout droit.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).mouche = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const ECHELLE = 2.3;
  // La mouche n'a qu'une ancre utile : son centre (sa position courante).
  const ancre = (pos) => [pos[0], pos[1]];

  function dessin() {
    return `
  <g id="mouche">
    <line x1="0" y1="-40" x2="0" y2="-2400" stroke="#d9ffb0" stroke-width="7" opacity="0.12"/>
    <line x1="0" y1="-40" x2="0" y2="-2400" stroke="#e9ffd8" stroke-width="2.6" opacity="0.75"/>
    <g id="mouche-flotte"><g transform="scale(${ECHELLE})"><g id="mouche-corps">
      <circle r="34" fill="url(#halo-mouche)"/>
      <ellipse class="mouche-aile" cx="-11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.55" transform="rotate(-25 -11 -13)"/>
      <ellipse class="mouche-aile" cx="11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.55" transform="rotate(25 11 -13)"/>
      <circle r="13" fill="#f6ff7a" filter="url(#lueur)"/>
      <circle cx="-5.5" cy="-3" r="6" fill="#fff"/><circle cx="5.5" cy="-3" r="6" fill="#fff"/>
      <circle cx="-4" cy="-2" r="2.8" fill="${NOIR}"/><circle cx="7" cy="-2" r="2.8" fill="${NOIR}"/>
      <path d="M-3.5 5 q3.5 3 7 0" stroke="${NOIR}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </g></g></g>
  </g>`;
  }

  const GESTES = {
    descendre: { canal: 'position', duree: (p) => p.duree || 1, params: 'vers : point d\'arrivée ; duree', role: 'Elle descend au bout de son fil (elle apparaît).' },
    esquiver: { canal: 'position', duree: () => 0.6, params: 'de, vers', role: "Tirée d'un coup par son fil, elle se balance." },
    yoyo: { canal: 'position', duree: (p, T) => (p.fois || 3) * T, params: 'de ; fois (3) ; amplitude en pixels (70)', role: 'Elle fait le yoyo sur son fil, un rebond par temps : elle se moque.' },
    revenir: { canal: 'position', duree: (p) => p.duree || 1, params: 'de, vers ; duree', role: 'Elle revient en arc de cercle.' },
    remonter: { canal: 'position', duree: (p) => p.duree || 0.6, params: 'de ; duree', role: 'Elle remonte sur son fil et disparaît.' },
    disparaitre: { canal: 'position', duree: () => 0.05, params: '—', role: 'Attrapée : elle disparaît.' },
  };

  function ambiance(c) {
    c.cycle(c.q('#mouche-flotte'), { y: 0 }, { y: -9 }, c.T);
    c.cycle(c.qa('.mouche-aile'), { scaleY: 1, transformOrigin: '50% 100%' }, { scaleY: 0.25, transformOrigin: '50% 100%' }, c.D / Math.round(c.D / 0.1), 'none');
  }
  function repos(c, p) {
    c.repos(c.q('#mouche'), { x: p.pos[0], y: p.pos[1], opacity: p.visible === false ? 0 : 1 });
    c.repos(c.q('#mouche-corps'), { rotation: 0, scaleX: 1, scaleY: 1, svgOrigin: '0 -16' });
  }
  const balancer = (c, t, fois) => c.ft(c.q('#mouche-corps'), { rotation: 0, svgOrigin: '0 -16' }, { rotation: 25, svgOrigin: '0 -16', duration: c.T / 4, yoyo: true, repeat: 2 * fois - 1, ease: 'sine.inOut' }, t);
  const gestes = {
    descendre(c, t, p) {
      const m = c.q('#mouche'); const d = p.duree || 1;
      c.tl.set(m, { opacity: 1, x: p.vers[0] }, t);
      c.ft(m, { y: p.vers[1] - 900 }, { y: p.vers[1], duration: d, ease: 'elastic.out(1, 0.55)' }, t);
    },
    esquiver(c, t, p) {
      c.ft(c.q('#mouche'), { x: p.de[0], y: p.de[1] }, { x: p.vers[0], y: p.vers[1], duration: 0.14, ease: 'power3.out' }, t);
      balancer(c, t + 0.1, 2);
    },
    yoyo(c, t, p) {
      const m = c.q('#mouche'); const a = p.amplitude || 70; const n = p.fois || 3;
      c.ft(m, { y: p.de[1] }, { y: p.de[1] + a, duration: c.T / 2, yoyo: true, repeat: 2 * n - 1, ease: 'power2.in' }, t);
      for (let k = 0; k < n; k += 1) {
        c.ft(c.q('#mouche-corps'), { scaleY: 1, scaleX: 1, svgOrigin: '0 10' }, { scaleY: 0.72, scaleX: 1.2, svgOrigin: '0 10', duration: 0.06, yoyo: true, repeat: 1 }, t + c.T / 2 + k * c.T - 0.03);
      }
    },
    revenir(c, t, p) {
      const mi = { x: (p.de[0] + p.vers[0]) / 2 + 40, y: Math.min(p.de[1], p.vers[1]) - 90 };
      c.ft(c.q('#mouche'), { x: p.de[0], y: p.de[1] }, { motionPath: { path: [{ x: p.de[0], y: p.de[1] }, mi, { x: p.vers[0], y: p.vers[1] }], curviness: 1.3 }, duration: p.duree || 1, ease: 'sine.inOut' }, t);
    },
    remonter(c, t, p) {
      const d = p.duree || 0.6;
      c.ft(c.q('#mouche'), { y: p.de[1] }, { y: p.de[1] - 900, duration: d, ease: 'power2.in' }, t);
      c.tl.set(c.q('#mouche'), { opacity: 0 }, t + d);
    },
    disparaitre(c, t) {
      c.tl.set(c.q('#mouche'), { opacity: 0 }, t);
    },
  };

  return { id: 'mouche', nom: 'la mouche', dessin, ancre, GESTES, ambiance, repos, gestes };
});
