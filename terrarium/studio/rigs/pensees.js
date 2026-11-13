/*
 * Les bulles de pensée : une bulle attachée à un personnage, avec ce qui l'occupe vraiment.
 * Trois bulles pour l'instant : la grenouille (une mouche et un cœur), les lucioles (une lumière),
 * Mousse (une plante). Fond translucide comme le texte, sans lueur (style décidé le 13 nov. 2026).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).pensees = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const NOIR = '#050b12';
  const FORME = 'M-130 0 C-150 -70 -70 -110 -20 -90 C10 -140 110 -130 120 -70 C180 -60 170 30 120 40 C110 90 20 90 -10 60 C-60 90 -140 70 -130 0 Z';
  // Les bulles : où elles se posent (décor ou écran), et où part la petite queue (vers le personnage).
  const BULLES = {
    grenouille: { espace: 'decor', x: 830, y: 560, e: 1, queue: [[38, 108, 9], [32, 128, 13]] },
    lucioles: { espace: 'decor', x: 360, y: 455, e: 0.85, queue: [[205, 62, 11], [240, 82, 16]] },
    mousse: { espace: 'ecran', x: 800, y: 1050, e: 1, queue: [[-92, 128, 11], [-66, 98, 17]] },
    cameleon: { espace: 'decor', x: 470, y: 585, e: 0.85, queue: [[150, 108, 11], [185, 135, 17]] },
  };
  const ICONES = {
    grenouille: `<g transform="translate(0 -4) scale(2.3)"><ellipse cx="-11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.8" transform="rotate(-25 -11 -13)"/><ellipse cx="11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.8" transform="rotate(25 11 -13)"/>
      <circle r="13" fill="#f6ff7a"/><circle cx="-5.5" cy="-3" r="6" fill="#fff"/><circle cx="5.5" cy="-3" r="6" fill="#fff"/><circle cx="-4" cy="-2" r="2.8" fill="#111"/><circle cx="7" cy="-2" r="2.8" fill="#111"/></g>
      <path d="M92 -52 c0 -10 14 -10 14 0 c0 -10 14 -10 14 0 c0 12 -14 18 -14 22 c0 -4 -14 -10 -14 -22Z" fill="#ff6fb5"/>`,
    lucioles: `<g>${Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return `<line x1="${(40 * Math.cos(a)).toFixed(1)}" y1="${(40 * Math.sin(a)).toFixed(1)}" x2="${(62 * Math.cos(a)).toFixed(1)}" y2="${(62 * Math.sin(a)).toFixed(1)}" stroke="#eaff7a" stroke-width="5" stroke-linecap="round"/>`; }).join('')}<circle r="30" fill="#fff6b0"/></g>`,
    cameleon: `<text x="0" y="6" text-anchor="middle" dominant-baseline="central" font-family="Poppins, sans-serif" font-weight="800" font-size="120" fill="#ffffff">?</text>`,
    mousse: `<g><path d="M0 50 C-4 20 4 0 0 -26" stroke="#7fe08a" stroke-width="8" fill="none" stroke-linecap="round"/><path d="M0 -4 C-40 -10 -52 -38 -46 -56 C-14 -52 0 -30 0 -4Z" fill="#7fe08a"/><path d="M0 -22 C36 -26 52 -52 46 -70 C14 -68 -2 -48 0 -22Z" fill="#b6ff5c"/></g>`,
  };

  function bulle(id) {
    const b = BULLES[id];
    return `<g id="pensee-${id}" class="pensee" transform="translate(${b.x} ${b.y}) scale(${b.e})" opacity="0"><g class="pensee-in">
      ${b.queue.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="rgba(20,50,70,0.78)" stroke="rgba(154,248,255,0.45)" stroke-width="3"/>`).join('')}
      <path d="${FORME}" fill="rgba(20,50,70,0.78)" stroke="rgba(154,248,255,0.45)" stroke-width="4"/>
      <g transform="translate(20 -20)">${ICONES[id]}</g></g></g>`;
  }
  const dessinDecor = () => bulle('grenouille') + bulle('lucioles') + bulle('cameleon');
  const dessinEcran = () => bulle('mousse');

  const GESTES = {
    penser: { canal: 'bulle', duree: (p) => p.duree || 1.6, params: 'sur : cameleon (un « ? »), grenouille, lucioles ou mousse ; duree', role: 'Une bulle de pensée apparaît au-dessus du personnage, avec ce qui l\'occupe, puis disparaît.' },
  };
  function ambiance() {}
  function repos(c) { c.repos(c.qa('.pensee'), { opacity: 0 }); }
  const gestes = {
    penser(c, t, p) {
      const el = c.q('#pensee-' + p.sur); const d = p.duree || 1.6;
      const origine = '0 60';
      c.tl.set(el, { opacity: 1 }, t);
      c.ft(el.querySelector('.pensee-in'), { scale: 0.15, svgOrigin: origine }, { scale: 1, svgOrigin: origine, duration: 0.4, ease: 'back.out(2.2)' }, t);
      c.ft(el.querySelector('.pensee-in'), { scale: 1, svgOrigin: origine }, { scale: 0.2, svgOrigin: origine, duration: 0.25, ease: 'power2.in' }, t + d - 0.25);
      c.tl.set(el, { opacity: 0 }, t + d);
    },
  };

  return { id: 'pensees', nom: 'les bulles de pensée', BULLES, dessinDecor, dessinEcran, GESTES, ambiance, repos, gestes };
});
