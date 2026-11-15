/*
 * Le thème de nuit du vivarium (style B validé le 13 nov. 2026) :
 * tout s'assombrit et bleuit, sauf ce qui est bioluminescent, qui s'allume et luit.
 *
 * nuit(svg) transforme la chaîne SVG du dessin (art.svg()) : c'est du texte pur,
 * calculé une fois à la génération de la vidéo. Rien ne coûte au rendu.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.nuit = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const REGLAGE = { lum: 0.3, teinte: 212, melangeTeinte: 0.75, sat: 1.05 };
  const FOND = ['#050a1a', '#0d2236'];

  // Ce qui s'allume dans le noir : couleur de jour → couleur de nuit lumineuse.
  const BIO = {
    '#9ad25f': '#b6ff5c', '#86c44e': '#8dff6a', // mousse
    '#d6483c': '#5ef2ff', '#e8685a': '#9af8ff', '#fff6e8': '#e9fdff', // champignons
    '#f7a8c4': '#ff7ad9', '#ea6f9d': '#ff4fc6', '#fbd0df': '#ffc1ee', // orchidées, nénuphar
    '#7fd0de': '#41e2ff', '#c8f0f5': '#b8f6ff', '#8fdbe6': '#41e2ff', // eau
    '#f6ffb0': '#eaff7a', // lucioles
    '#e2c89a': '#ffd7a0', // escargot
    '#e8667a': '#ff6fb5', '#f08a9a': '#ff6fb5', // langue du caméléon
    '#f6ffb1': '#eaff7a', '#dff3fe': '#c9f1ff', // la mouche : abdomen lumineux, ailes
  };

  // Recolorées pour rester lisibles la nuit, mais sans lueur (la mouche : corps, yeux, pupilles).
  const NET = { '#2b2b37': '#4a5a94', '#fffffe': '#ffffff', '#111112': '#0a1020' };

  // Le caméléon (couleurs posées par le moteur) : version de nuit, plus lumineuse.
  const PEAU = {
    vert: ['#7dff5a', '#2fd14f'],
    turquoise: ['#5ef2ff', '#1fb8c8'],
    orange: ['#ffb347', '#d9771f'],
    ventre: '#d9ffb0',
  };

  const versHsl = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
    const max = Math.max(r, g, b); const min = Math.min(r, g, b); const l = (max + min) / 2; let h = 0; let s = 0;
    if (max !== min) {
      const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60;
    }
    return [h, s, l];
  };
  const versHex = ([h, s, l]) => {
    const f = (n) => { const k = (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return '#' + [f(0), f(8), f(4)].map((v) => Math.round(Math.max(0, Math.min(1, v)) * 255).toString(16).padStart(2, '0')).join('');
  };
  const normal = (c) => {
    c = c.toLowerCase();
    return /^#[0-9a-f]{3}$/.test(c) ? '#' + c.slice(1).split('').map((x) => x + x).join('') : c;
  };

  // Assombrir et bleuir une couleur de jour.
  function assombrir(c) {
    let [h, s, l] = versHsl(normal(c));
    const dh = ((REGLAGE.teinte - h + 540) % 360) - 180;
    h = (h + dh * REGLAGE.melangeTeinte + 360) % 360;
    return versHex([h, Math.min(1, s * REGLAGE.sat), l * REGLAGE.lum]);
  }

  const DEFS = `
      <filter id="halo" x="-300%" y="-300%" width="700%" height="700%"><feGaussianBlur stdDeviation="5" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <filter id="halo-doux" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="2.5" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <radialGradient id="nuit-trou" gradientUnits="userSpaceOnUse" cx="300" cy="372" r="180">
        <stop offset="0" stop-color="#000" stop-opacity="0"/>
        <stop offset="0.55" stop-color="#000" stop-opacity="0.375"/>
        <stop offset="1" stop-color="#000" stop-opacity="0.75"/>
      </radialGradient>`;

  function nuit(svg) {
    let s = svg;
    // 1. Recoloration de chaque balise : fill, stroke, stop-color. Les couleurs « bio » s'allument et luisent.
    s = s.replace(/<(\w+)([^<>]*?)(\/?)>/g, (tout, nom, attrs, ferme) => {
      if (nom === 'svg' || nom === 'filter' || nom === 'feGaussianBlur') return tout;
      let bio = false;
      const a = attrs.replace(/\b(fill|stroke|stop-color)="(#[0-9a-fA-F]{3,6})"/g, (m, attr, c) => {
        const n = normal(c);
        if (BIO[n]) { bio = true; return `${attr}="${BIO[n]}"`; }
        if (NET[n]) return `${attr}="${NET[n]}"`;
        return `${attr}="${assombrir(n)}"`;
      });
      const halo = bio && !/\bfilter=/.test(a) && nom !== 'stop' ? ' filter="url(#halo)"' : '';
      return `<${nom}${a}${halo}${ferme}>`;
    });
    // 2. Le fond du verre : dégradé de nuit.
    s = s.replace(/(<linearGradient id="g-fond"[^>]*>)([\s\S]*?)(<\/linearGradient>)/, (m, o, corps, f) => `${o}<stop offset="0" stop-color="${FOND[0]}"/><stop offset="0.5" stop-color="${FOND[1]}"/><stop offset="1" stop-color="${FOND[0]}"/>${f}`);
    // 3. Les lucioles grossissent ; les papillons dorment.
    s = s.replace(/<circle class="luciole"([^>]*?) r="([\d.]+)"/g, (m, avant, r) => `<circle class="luciole"${avant} r="${(r * 1.6).toFixed(2)}"`);
    s = s.replace(/<g id="(papillon-\d)" class="papillon">/g, '<g id="$1" class="papillon" style="display:none">');
    // 4. Filtres, et le voile d'obscurité : centré sur le sujet, il suit la caméra (le moteur l'anime).
    s = s.replace('<defs>', '<defs>' + DEFS);
    // Le voile passe juste avant la mouche : mouche, goutte et lucioles brillent par-dessus.
    s = s.replace('<g id="mouche">', '<rect id="nuit-voile" x="0" y="0" width="600" height="744" fill="url(#nuit-trou)" pointer-events="none"/><g id="mouche">');
    return s;
  }

  return { nuit, PEAU, BIO, assombrir };
});
