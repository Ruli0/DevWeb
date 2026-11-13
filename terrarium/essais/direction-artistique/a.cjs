// Piste A : théâtre d'ombres lumineuses. Décor en silhouettes sur plusieurs plans,
const path = require('node:path');
// personnages sombres soulignés de lumière, yeux et taches qui brillent.
const C = require('./commun.cjs');
const V = require('./vecteur.cjs');
const { G, CAM } = V;
const R = C.graine(11);
const entre = (a, b) => a + (b - a) * R();

// Une feuille en amande, et une palme (tige + feuilles), en silhouette.
const feuille = (x, y, l, w, a) => {
  const r = (a * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  const P = (u, v) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`;
  return `M${P(0, 0)} C${P(l * 0.3, -w)} ${P(l * 0.75, -w * 0.8)} ${P(l, 0)} C${P(l * 0.75, w * 0.8)} ${P(l * 0.3, w)} ${P(0, 0)}Z`;
};
function palme(x, y, l, a, n, coul, extra = '') {
  const r = (a * Math.PI) / 180; let d = '';
  for (let k = 1; k <= n; k += 1) {
    const u = (k / (n + 1)) * l; const px = x + u * Math.cos(r); const py = y + u * Math.sin(r);
    const fl = l * 0.42 * (1 - (k / (n + 1)) * 0.6);
    d += feuille(px, py, fl, fl * 0.22, a - 55) + feuille(px, py, fl, fl * 0.22, a + 55);
  }
  return `<g ${extra}><path d="M${x} ${y} L${(x + l * Math.cos(r)).toFixed(1)} ${(y + l * Math.sin(r)).toFixed(1)}" stroke="${coul}" stroke-width="7" stroke-linecap="round"/><path d="${d}" fill="${coul}"/></g>`;
}
function bouquet(n, x0, x1, y, coul, taille, sens) {
  let s = '';
  for (let i = 0; i < n; i += 1) {
    const x = entre(x0, x1);
    s += palme(x, y, entre(taille * 0.7, taille), sens * entre(55, 125) * -1 + (sens < 0 ? 0 : 0) + (sens > 0 ? -180 : 0), 6, coul);
  }
  return s;
}

const RIM = '#8dff6a';
const NOIR = '#050b12';
const corps = `
  <g id="cam" transform="translate(${CAM.x} ${CAM.y}) scale(${CAM.s})">
   <g id="cam-corps"><g id="cam-respire">
    <g filter="url(#lueur-forte)" opacity="0.9">
      <path d="${G.queue}" stroke="${RIM}" stroke-width="19" fill="none" stroke-linecap="round"/>
      <path d="${G.patteAv}" stroke="${RIM}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${G.patteAr}" stroke="${RIM}" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${G.corps}" fill="none" stroke="${RIM}" stroke-width="5"/>
    </g>
    <path d="${G.queue}" stroke="${NOIR}" stroke-width="14" fill="none" stroke-linecap="round"/>
    <path d="${G.patteAv}" stroke="${NOIR}" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${G.patteAr}" stroke="${NOIR}" stroke-width="11" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${G.corps}" fill="${NOIR}" stroke="#c9ff8a" stroke-width="1.6"/>
    <path d="${G.ventre}" fill="#0d2a1a"/>
    ${G.taches.map(([x, y, r]) => `<circle class="tache" cx="${x}" cy="${y}" r="${r}" fill="#b6ff5c" filter="url(#lueur)"/>`).join('')}
    <path d="${G.bouche}" stroke="#2c5a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle cx="${G.oeil[0]}" cy="${G.oeil[1]}" r="24" fill="${NOIR}" stroke="#c9ff8a" stroke-width="1.6"/>
    <g id="sclere"><circle cx="${G.oeil[0]}" cy="${G.oeil[1]}" r="16" fill="#eafff0" filter="url(#lueur)"/>
      <g id="pupille"><circle cx="${G.oeil[0] + 7}" cy="${G.oeil[1]}" r="8" fill="${NOIR}"/><circle cx="${G.oeil[0] + 9.5}" cy="${G.oeil[1] - 2.5}" r="2.2" fill="#fff"/></g></g>
    <g id="langue-g"><line id="langue" x1="${G.bouchePt[0]}" y1="${G.bouchePt[1]}" x2="${G.bouchePt[0]}" y2="${G.bouchePt[1]}" stroke="#ff6fb5" stroke-width="4.5" stroke-linecap="round" filter="url(#lueur)"/>
      <circle id="langue-bout" cx="${G.bouchePt[0]}" cy="${G.bouchePt[1]}" r="4" fill="#ff9fd0" filter="url(#lueur)"/></g>
   </g></g>
  </g>`;

const mouche = `
  ${[0.4, 0.3, 0.22, 0.15, 0.09].map((o, k) => `<g class="trace"><circle r="${(16 - k * 2.6).toFixed(1)}" fill="#eaff7a" opacity="${o}"/></g>`).join('')}
  <g id="mouche"><g id="mouche-flotte"><g transform="scale(2.3)"><g id="mouche-corps">
    <circle r="34" fill="url(#halo-mouche)"/>
    <ellipse class="aile" cx="-11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.55" transform="rotate(-25 -11 -13)"/>
    <ellipse class="aile" cx="11" cy="-13" rx="9" ry="13" fill="#d8f6ff" opacity="0.55" transform="rotate(25 11 -13)"/>
    <circle r="13" fill="#f6ff7a" filter="url(#lueur)"/>
    <circle cx="-5.5" cy="-3" r="6" fill="#fff"/><circle cx="5.5" cy="-3" r="6" fill="#fff"/>
    <circle cx="-4" cy="-2" r="2.8" fill="${NOIR}"/><circle cx="7" cy="-2" r="2.8" fill="${NOIR}"/>
    <path d="M-3.5 5 q3.5 3 7 0" stroke="${NOIR}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
  </g></g></g></g>`;

const spores = Array.from({ length: 30 }, () => `<circle class="spore" cx="${entre(40, 1040).toFixed(0)}" cy="${entre(300, 1700).toFixed(0)}" r="${entre(1.6, 4).toFixed(1)}" fill="#d9ffb0" opacity="${entre(0.3, 0.8).toFixed(2)}" filter="url(#lueur)"/>`).join('');

const svg = `<svg id="scene" width="1080" height="1920" viewBox="0 0 1080 1920">
 <defs>
  <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1b36"/><stop offset="0.45" stop-color="#0b2b3e"/><stop offset="1" stop-color="#02070c"/></linearGradient>
  <radialGradient id="lune" cx="760" cy="430" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#a8f0ff" stop-opacity="0.42"/><stop offset="0.4" stop-color="#4fc3d9" stop-opacity="0.16"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="chaud" cx="472" cy="1225" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc65c" stop-opacity="0.38"/><stop offset="1" stop-color="#ffc65c" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo-mouche"><stop offset="0" stop-color="#eaff7a" stop-opacity="0.55"/><stop offset="1" stop-color="#eaff7a" stop-opacity="0"/></radialGradient>
  <radialGradient id="vignette" cx="540" cy="880" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0.5" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.8"/></radialGradient>
  <filter id="lueur" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="3" result="f"/><feMerge><feMergeNode in="f"/><feMergeNode in="f"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="lueur-forte" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5"/></filter>
  <filter id="flou-loin"><feGaussianBlur stdDeviation="3"/></filter>
  <filter id="flou-pres" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/></filter>
 </defs>
 <rect width="1080" height="1920" fill="url(#ciel)"/>
 <rect width="1080" height="1920" fill="url(#lune)"/>
 <g id="couche-loin" filter="url(#flou-loin)" opacity="0.95">
  ${bouquet(7, -80, 1160, 1480, '#0f2f45', 520, -1)}
  ${bouquet(6, -60, 1140, -40, '#0d2a40', 460, 1)}
 </g>
 <g id="couche-milieu">
  ${bouquet(6, -60, 1140, 1650, '#081a2a', 620, -1)}
  ${bouquet(5, 0, 1080, -60, '#071827', 520, 1)}
  <path d="M120 0 C 140 200 90 360 130 560" stroke="#071827" stroke-width="6" fill="none"/>
  <path d="M960 0 C 930 180 990 300 950 470" stroke="#071827" stroke-width="5" fill="none"/>
 </g>
 <rect width="1080" height="1920" fill="url(#chaud)" style="mix-blend-mode:screen"/>
 <g id="couche-action">
  <path d="M-60 1095 C 180 1010 360 975 540 962 C 720 948 880 905 1140 835" stroke="#9ff2c0" stroke-width="44" fill="none" opacity="0.18" filter="url(#lueur-forte)"/>
  <path d="M-60 1100 C 180 1015 360 980 540 967 C 720 953 880 910 1140 840" stroke="#03080d" stroke-width="40" fill="none" stroke-linecap="round"/>
  <path d="M-60 1080 C 180 995 360 960 540 947 C 720 933 880 890 1140 820" stroke="#5fbf9a" stroke-width="2.5" fill="none" opacity="0.55"/>
  ${palme(820, 900, 170, -60, 4, '#03080d')}
  ${corps}
  ${mouche}
 </g>
 ${spores}
 <g id="couche-pres" filter="url(#flou-pres)">
  ${palme(-40, 1720, 520, -55, 6, '#010306')}
  ${palme(1120, 120, 420, 150, 5, '#010306')}
 </g>
 ${C.mousse({ '#2a3550': '#0b1424', '#151c2e': '#04080f', '#3fa34d': '#163d28', '#3b2a24': '#06070a', '#0a1020': '#02050a' })}
 <rect width="1080" height="1920" fill="url(#vignette)"/>
 <rect width="1080" height="1920" filter="url(#grain)" opacity="0.06"/>
</svg>`;

C.ecrire(path.join(__dirname, 'sortie', 'A'), {
  id: 'piste-a', titre: 'Piste A · ombres lumineuses', svg, css: C.CSS_TERMINAL,
  apres: C.terminal('mon IA *rate* tout.'), js: V.mise('vol'), sons: V.SONS(C.b),
});
console.log('A écrite');
