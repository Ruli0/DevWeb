/*
 * L'orbe de la chaîne « avis » : une sphère de verre lumineuse, posée au-dessus des sous-titres, qui s'anime doucement quand quelqu'un parle.
 *   niveaux(mots, duree, pas)   le niveau de voix (0 à 99) par pas de temps, déduit des mots affichés (leurs instants dans la vidéo)
 *   svg(couleurs)               le dessin (couleurs : clair, a, b, c, tirées de la palette)
 *   appliquer(racine, n, t)     règle le dessin pour le niveau n (0 à 1) à l'instant t : taille, halo, ondulation, étincelles
 * Tout est une fonction de t et du niveau : ni minuterie, ni hasard, ni répétition infinie. L'orbe est hors du filtre de palette.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.orbe = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const R = 115, C = 200, ETINCELLES = 8, POINTS = 56;

  // Pendant un mot, le niveau monte et redescend comme une syllabe ; entre deux mots il retombe. Attaque rapide, descente lente.
  function niveaux(mots, duree, pas = 30) {
    const n = Math.max(1, Math.ceil(duree * pas) + 1), brut = new Array(n).fill(0);
    (mots || []).forEach((m) => {
      const d = Math.max(0.05, m.f - m.t);
      for (let i = Math.max(0, Math.floor(m.t * pas)); i <= Math.min(n - 1, Math.ceil(m.f * pas)); i += 1) {
        const x = Math.min(1, Math.max(0, (i / pas - m.t) / d));
        brut[i] = Math.max(brut[i], 0.62 + 0.38 * Math.sqrt(Math.sin(Math.PI * x)));
      }
    });
    const montee = 1 - Math.exp(-1 / (0.08 * pas)), descente = 1 - Math.exp(-1 / (0.25 * pas));
    let v = 0;
    return brut.map((b) => { v += (b - v) * (b > v ? montee : descente); return Math.round(Math.min(1, Math.max(0, v)) * 99); });
  }

  function svg(c) {
    const etincelles = Array.from({ length: ETINCELLES }, (_, k) => `<circle class="orbe-et" cx="${C}" cy="${C}" r="${k % 3 === 0 ? 3 : 2}" fill="${c.clair}" opacity="0"/>`).join('');
    return `<defs>
  <radialGradient id="orbe-halo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c.clair}" stop-opacity=".75"/><stop offset=".42" stop-color="${c.a}" stop-opacity=".34"/><stop offset="1" stop-color="${c.a}" stop-opacity="0"/></radialGradient>
  <radialGradient id="orbe-corps" cx="34%" cy="28%" r="88%"><stop offset="0" stop-color="${c.clair}"/><stop offset=".22" stop-color="${c.a}"/><stop offset=".6" stop-color="${c.b}"/><stop offset="1" stop-color="${c.c}"/></radialGradient>
  <radialGradient id="orbe-reflet" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c.clair}" stop-opacity=".85"/><stop offset="1" stop-color="${c.clair}" stop-opacity="0"/></radialGradient>
</defs>
<circle id="orbe-halo-c" cx="${C}" cy="${C}" r="190" fill="url(#orbe-halo)"/>
<g id="orbe-sphere"><path id="orbe-forme" d="" fill="url(#orbe-corps)" stroke="${c.fond}" stroke-opacity=".55" stroke-width="5"/>
<ellipse id="orbe-reflet-e" cx="${C - 40}" cy="${C - 44}" rx="46" ry="30" fill="url(#orbe-reflet)"/></g>
${etincelles}`;
  }

  function appliquer(el, n, t) {
    const $ = (s) => el.querySelector(s);
    const respire = Math.sin(t * 1.5) * 0.03 * (1 - n);
    const s = 1 + respire + 0.12 * n;
    let d = '';
    for (let i = 0; i < POINTS; i += 1) {
      const a = (i / POINTS) * Math.PI * 2;
      const r = R * s * (1 + (0.003 + 0.011 * n) * Math.sin(3 * a + 1.3 * t) + (0.002 + 0.007 * n) * Math.sin(5 * a - 1.9 * t));
      d += (i ? 'L' : 'M') + (C + r * Math.cos(a)).toFixed(1) + ' ' + (C + r * Math.sin(a)).toFixed(1);
    }
    $('#orbe-forme').setAttribute('d', d + 'Z');
    const halo = $('#orbe-halo-c');
    halo.setAttribute('r', (150 + 55 * n + 8 * Math.sin(t * 1.1)).toFixed(1));
    halo.setAttribute('opacity', (0.5 + 0.5 * n).toFixed(3));
    const rf = $('#orbe-reflet-e');
    rf.setAttribute('cx', (C - 40 + 12 * Math.sin(t * 0.55)).toFixed(1));
    rf.setAttribute('cy', (C - 44 + 8 * Math.cos(t * 0.43)).toFixed(1));
    rf.setAttribute('opacity', (0.75 + 0.25 * n).toFixed(3));
    el.querySelectorAll('.orbe-et').forEach((p, k) => {
      const a = (k / ETINCELLES) * Math.PI * 2 + t * 0.22, r = R * s + 26 + 14 * Math.sin(t * 0.9 + k * 1.7);
      p.setAttribute('cx', (C + r * Math.cos(a)).toFixed(1));
      p.setAttribute('cy', (C + r * Math.sin(a)).toFixed(1));
      p.setAttribute('opacity', Math.max(0, 0.18 + 0.7 * n * (0.55 + 0.45 * Math.sin(t * 2.3 + k * 2.1))).toFixed(3));
    });
  }

  return { niveaux, svg, appliquer };
});
