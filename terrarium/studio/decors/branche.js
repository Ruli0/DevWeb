/*
 * Décor « branche » : un coin du terrarium la nuit, en silhouettes sur plusieurs plans
 * (direction artistique A2). Le monde est dessiné en coordonnées d'écran, au cadrage large.
 *
 * calques : du plus loin au plus près ; f est la profondeur (1 : le plan des personnages).
 * places : où se tiennent les rôles.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.decors = racine.Terrarium.decors || {}).branche = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function graine(a) {
    return () => {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const PLACES = {
    ia: { x: 380, y: 920, s: 2.2 }, // le caméléon, sur la branche
    tache: [820, 640], // la mouche, devant la gueule
    outils: { loupe: [905, 530], page: [745, 440] }, // les outils, suspendus à droite de la tête
    grenouille: { x: 880, y: 892, s: 1.7 }, // sur la branche, devant le museau du caméléon
    lucioles: [[540, 500], [650, 430], [770, 510]], // au-dessus du dos du caméléon, grosses
    echelleLucioles: 3.1,
    escargot: { x: 300, y: 1252, s: 1.6 }, // sur la feuille, sous le caméléon
  };

  function dessin() {
    const R = graine(11);
    const entre = (a, b) => a + (b - a) * R();
    const feuille = (x, y, l, w, a) => {
      const r = (a * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
      const P = (u, v) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`;
      return `M${P(0, 0)} C${P(l * 0.3, -w)} ${P(l * 0.75, -w * 0.8)} ${P(l, 0)} C${P(l * 0.75, w * 0.8)} ${P(l * 0.3, w)} ${P(0, 0)}Z`;
    };
    const palme = (x, y, l, a, n, coul) => {
      const r = (a * Math.PI) / 180; let d = '';
      for (let k = 1; k <= n; k += 1) {
        const u = (k / (n + 1)) * l; const px = x + u * Math.cos(r); const py = y + u * Math.sin(r);
        const fl = l * 0.42 * (1 - (k / (n + 1)) * 0.6);
        d += feuille(px, py, fl, fl * 0.22, a - 55) + feuille(px, py, fl, fl * 0.22, a + 55);
      }
      return `<g><path d="M${x} ${y} L${(x + l * Math.cos(r)).toFixed(1)} ${(y + l * Math.sin(r)).toFixed(1)}" stroke="${coul}" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="${coul}"/></g>`;
    };
    const bouquet = (n, x0, x1, y, coul, taille, sens) => {
      let s = '';
      for (let i = 0; i < n; i += 1) s += palme(entre(x0, x1), y, entre(taille * 0.7, taille), sens * entre(55, 125) * -1 + (sens > 0 ? -180 : 0), 6, coul);
      return s;
    };
    const loin = `${bouquet(9, -400, 1480, 1700, '#0f2f45', 620, -1)}${bouquet(8, -400, 1480, -200, '#0d2a40', 560, 1)}`;
    const milieu = `${bouquet(7, -300, 1380, 1850, '#081a2a', 700, -1)}${bouquet(6, -300, 1380, -160, '#071827', 600, 1)}
      <path d="M120 -200 C 140 200 90 360 130 560" stroke="#071827" stroke-width="6" fill="none"/>
      <path d="M960 -200 C 930 180 990 300 950 470" stroke="#071827" stroke-width="5" fill="none"/>`;
    const spores = Array.from({ length: 34 }, () => `<circle class="spore" cx="${entre(-100, 1180).toFixed(0)}" cy="${entre(200, 1800).toFixed(0)}" r="${entre(1.6, 4).toFixed(1)}" fill="#d9ffb0" opacity="${entre(0.3, 0.8).toFixed(2)}" filter="url(#lueur)"/>`).join('');
    const branche = `
      <path d="M-260 1170 C 180 1010 360 975 540 962 C 720 948 880 905 1340 780" stroke="#9ff2c0" stroke-width="44" fill="none" opacity="0.18" filter="url(#lueur-forte)"/>
      <path d="M-260 1175 C 180 1015 360 980 540 967 C 720 953 880 910 1340 785" stroke="#03080d" stroke-width="40" fill="none" stroke-linecap="round"/>
      <path d="M-260 1155 C 180 995 360 960 540 947 C 720 933 880 890 1340 765" stroke="#5fbf9a" stroke-width="2.5" fill="none" opacity="0.55"/>
      ${palme(820, 900, 170, -60, 4, '#03080d')}
      <path d="M-120 1330 C 80 1245 320 1232 520 1272 C 380 1312 140 1326 -120 1390 Z" fill="#03080d" stroke="#5fbf9a" stroke-width="2.2" opacity="0.95"/>`;
    const pres = `${palme(-40, 1720, 520, -55, 6, '#010306')}${palme(1120, 120, 420, 150, 5, '#010306')}`;
    return {
      defs: `
  <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1b36"/><stop offset="0.45" stop-color="#0b2b3e"/><stop offset="1" stop-color="#02070c"/></linearGradient>
  <radialGradient id="lune" cx="760" cy="430" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8f0ff" stop-opacity="0.42"/><stop offset="0.4" stop-color="#4fc3d9" stop-opacity="0.16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <filter id="flou-loin"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="flou-pres" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>`,
      fond: '<rect width="1080" height="1920" fill="url(#ciel)"/><rect width="1080" height="1920" fill="url(#lune)"/>',
      calques: [
        { id: 'loin', f: 0.35, svg: `<g filter="url(#flou-loin)" opacity="0.95">${loin}</g>` },
        // L'éclaircissement de la nuit (dosage A, 13 nov. 2026) : un voile bleu clair en mode « screen ».
        { id: 'milieu', f: 0.7, svg: milieu + spores + '<rect x="-4000" y="-4000" width="9000" height="10000" fill="#3a6f8c" opacity="0.2" style="mix-blend-mode:screen"/>' },
        { id: 'action', f: 1, svg: branche, acteurs: true },
        { id: 'pres', f: 1.5, svg: `<g filter="url(#flou-pres)">${pres}</g>` },
      ],
    };
  }

  function ambiance(c) {
    c.qa('.spore').forEach((s, i) => c.cycle(s, { y: 0, x: 0 }, { y: -30 - (i % 5) * 8, x: i % 2 ? 12 : -12 }, c.D / (1 + (i % 3))));
  }

  return { id: 'branche', nom: 'la branche', PLACES, dessin, ambiance };
});
