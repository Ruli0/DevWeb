// Piste C : diorama en papier découpé. Calques de papier aux bords irréguliers, ombres portées,
const path = require('node:path');
// attaches parisiennes aux articulations, et une mouche suspendue à son fil.
const C = require('./commun.cjs');
const V = require('./vecteur.cjs');
const { G, CAM } = V;
const R = C.graine(23);
const entre = (a, b) => a + (b - a) * R();

const feuille = (x, y, l, w, a) => {
  const r = (a * Math.PI) / 180; const c = Math.cos(r); const s = Math.sin(r);
  const P = (u, v) => `${(x + u * c - v * s).toFixed(1)} ${(y + u * s + v * c).toFixed(1)}`;
  return `M${P(0, 0)} C${P(l * 0.3, -w)} ${P(l * 0.75, -w * 0.8)} ${P(l, 0)} C${P(l * 0.75, w * 0.8)} ${P(l * 0.3, w)} ${P(0, 0)}Z`;
};
// Une grande feuille de papier avec sa nervure.
const grandeFeuille = (x, y, l, a, coul, nerv) => `<path d="${feuille(x, y, l, l * 0.28, a)}" fill="${coul}"/><path d="M${x} ${y} L${(x + l * 0.92 * Math.cos(a * Math.PI / 180)).toFixed(1)} ${(y + l * 0.92 * Math.sin(a * Math.PI / 180)).toFixed(1)}" stroke="${nerv}" stroke-width="4" fill="none" opacity="0.6"/>`;
const touffe = (x, y, n, l, coul, nerv, a0, a1) => Array.from({ length: n }, (_, k) => grandeFeuille(x, y, l * (0.75 + 0.25 * R()), a0 + (a1 - a0) * (k / Math.max(1, n - 1)), coul, nerv)).join('');
const colline = (y, amp, coul, graine) => {
  const h = C.graine(graine); let d = `M-40 1920 L-40 ${y}`;
  for (let x = -40; x <= 1120; x += 120) d += ` Q${x + 60} ${(y - amp * h()).toFixed(0)} ${x + 120} ${(y - amp * 0.4 * h()).toFixed(0)}`;
  return `<path d="${d} L1120 1920 Z" fill="${coul}"/>`;
};
const attache = (x, y) => `<circle cx="${x}" cy="${y}" r="4.2" fill="#d9b45a" stroke="#7a5a1e" stroke-width="1.2"/><circle cx="${x - 1.2}" cy="${y - 1.2}" r="1.3" fill="#fff3c4"/>`;

const PEAU = '#74b843'; const FONCE = '#4f8f34';
const corps = `
  <g id="cam" transform="translate(${CAM.x} ${CAM.y}) scale(${CAM.s})" filter="url(#papier)">
   <g id="cam-corps"><g id="cam-respire">
    <path d="${G.queue}" stroke="${FONCE}" stroke-width="15" fill="none" stroke-linecap="round"/>
    <path d="${G.patteAr}" stroke="${FONCE}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="${G.corps}" fill="${PEAU}"/>
    <path d="M -80 -22 C -92 -72 -42 -112 18 -108 C 50 -106 66 -98 78 -104 L 100 -134 L 96 -120 C 70 -90 20 -96 -20 -92 C -60 -86 -80 -60 -80 -22 Z" fill="#8fcc5a"/>
    <path d="${G.ventre}" fill="#c6e08f"/>
    ${G.taches.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4f9535"/>`).join('')}
    <path d="${G.patteAv}" stroke="${FONCE}" stroke-width="12" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
    ${attache(52, -20)}${attache(-40, -18)}${attache(-78, -26)}
    <path d="${G.bouche}" stroke="#2d5a22" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <circle cx="${G.oeil[0]}" cy="${G.oeil[1]}" r="24" fill="#8fcc5a" stroke="${FONCE}" stroke-width="2.5"/>
    <g id="sclere"><circle cx="${G.oeil[0]}" cy="${G.oeil[1]}" r="16" fill="#f6edd5"/>
      <g id="pupille"><circle cx="${G.oeil[0] + 7}" cy="${G.oeil[1]}" r="8" fill="#1d1a1a"/><circle cx="${G.oeil[0] + 9.5}" cy="${G.oeil[1] - 2.5}" r="2.2" fill="#fff"/></g></g>
    ${attache(G.oeil[0], G.oeil[1] + 20)}
    <g id="langue-g"><line id="langue" x1="${G.bouchePt[0]}" y1="${G.bouchePt[1]}" x2="${G.bouchePt[0]}" y2="${G.bouchePt[1]}" stroke="#e2475f" stroke-width="5" stroke-linecap="round"/>
      <circle id="langue-bout" cx="${G.bouchePt[0]}" cy="${G.bouchePt[1]}" r="4" fill="#f07a8a"/></g>
   </g></g>
  </g>`;

const mouche = `
  <g id="mouche">
    <line x1="0" y1="-30" x2="0" y2="-1600" stroke="#efe6cf" stroke-width="2" opacity="0.85"/>
    <g id="mouche-flotte"><g transform="scale(2.3)"><g id="mouche-corps" filter="url(#papier-leger)">
      <ellipse class="aile" cx="-10" cy="-12" rx="8" ry="12" fill="#f3ecd8" opacity="0.92" transform="rotate(-25 -10 -12)"/>
      <ellipse class="aile" cx="10" cy="-12" rx="8" ry="12" fill="#f3ecd8" opacity="0.92" transform="rotate(25 10 -12)"/>
      <ellipse cx="0" cy="5" rx="9" ry="10" fill="#e8c547"/><path d="M-8 6 h16 M-7 11 h14" stroke="#3b3b4a" stroke-width="2.2"/>
      <circle r="11" fill="#3b3b4a"/>
      <circle cx="-5" cy="-3" r="5.6" fill="#f6edd5"/><circle cx="5" cy="-3" r="5.6" fill="#f6edd5"/>
      <circle cx="-3.6" cy="-2.2" r="2.6" fill="#1d1a1a"/><circle cx="6.4" cy="-2.2" r="2.6" fill="#1d1a1a"/>
      <circle cx="0" cy="-12" r="1.8" fill="#d9b45a"/>
    </g></g></g>
  </g>`;

const etoiles = Array.from({ length: 22 }, () => {
  const x = entre(60, 1020); const y = entre(80, 900); const r = entre(5, 11);
  return `<path d="M${x} ${y - r} L${x + r * 0.3} ${y - r * 0.3} L${x + r} ${y} L${x + r * 0.3} ${y + r * 0.3} L${x} ${y + r} L${x - r * 0.3} ${y + r * 0.3} L${x - r} ${y} L${x - r * 0.3} ${y - r * 0.3}Z" fill="#f3e6c4" opacity="${entre(0.55, 0.95).toFixed(2)}"/>`;
}).join('');

const svg = `<svg id="scene" width="1080" height="1920" viewBox="0 0 1080 1920">
 <defs>
  <linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2250"/><stop offset="0.55" stop-color="#2b3670"/><stop offset="1" stop-color="#161b3a"/></linearGradient>
  <radialGradient id="chaud" cx="472" cy="1225" r="560" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffcf7a" stop-opacity="0.42"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient>
  <radialGradient id="vignette" cx="540" cy="880" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0.55" stop-color="#0a0712" stop-opacity="0"/><stop offset="1" stop-color="#0a0712" stop-opacity="0.75"/></radialGradient>
  <filter id="papier" x="-15%" y="-15%" width="135%" height="140%">
    <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="9" result="t"/>
    <feDisplacementMap in="SourceGraphic" in2="t" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/>
    <feDropShadow in="d" dx="7" dy="11" stdDeviation="6" flood-color="#05060f" flood-opacity="0.55"/>
  </filter>
  <filter id="papier-leger" x="-40%" y="-40%" width="190%" height="190%"><feDropShadow dx="2" dy="4" stdDeviation="2.5" flood-color="#05060f" flood-opacity="0.5"/></filter>
  <filter id="fibre"><feTurbulence type="fractalNoise" baseFrequency="0.9 0.35" numOctaves="3" seed="2"/><feColorMatrix values="0 0 0 0 0.98  0 0 0 0 0.92  0 0 0 0 0.8  0 0 0 0.7 0"/></filter>
  <filter id="flou-pres" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="4"/><feDropShadow dx="10" dy="14" stdDeviation="8" flood-color="#000" flood-opacity="0.5"/></filter>
 </defs>
 <rect width="1080" height="1920" fill="url(#ciel)"/>
 <g id="couche-loin" filter="url(#papier)">
  ${etoiles}
  <circle cx="930" cy="560" r="110" fill="#f3e6c4"/><circle cx="895" cy="530" r="20" fill="#e6d6ad"/><circle cx="965" cy="600" r="13" fill="#e6d6ad"/>
  ${colline(1380, 160, '#2c3f73', 3)}
 </g>
 <g id="couche-milieu" filter="url(#papier)">
  ${touffe(40, 1500, 4, 430, '#2f5a52', '#244840', -110, -50)}
  ${touffe(1060, 1450, 4, 400, '#3b6b5a', '#2c5546', -140, -80)}
  ${touffe(160, -20, 3, 380, '#28504a', '#1e3f3a', 60, 110)}
  ${colline(1560, 120, '#24473f', 5)}
 </g>
 <rect width="1080" height="1920" fill="url(#chaud)" style="mix-blend-mode:screen"/>
 <g id="couche-action">
  <g filter="url(#papier)">
   <path d="M-60 1100 C 180 1015 360 980 540 967 C 720 953 880 910 1140 840" stroke="#6b4a33" stroke-width="40" fill="none" stroke-linecap="round"/>
   <path d="M-60 1086 C 180 1001 360 966 540 953 C 720 939 880 896 1140 826" stroke="#8a6345" stroke-width="9" fill="none" stroke-linecap="round"/>
   ${touffe(840, 905, 3, 150, '#4f8f34', '#3a6e25', -120, -40)}
  </g>
  ${corps}
  ${mouche}
 </g>
 <g id="couche-pres" filter="url(#flou-pres)">
  ${touffe(-60, 1900, 4, 520, '#1d3b2e', '#16302a', -80, -30)}
  ${touffe(1140, 60, 3, 420, '#1a3328', '#142a22', 120, 170)}
 </g>
 <g filter="url(#papier-leger)">${C.mousse({ '#2a3550': '#4a557e', '#151c2e': '#2c3352', '#3fa34d': '#4f9b45', '#3b2a24': '#5a3c2c', '#0a1020': '#1b2140', '#b6ff5c': '#a8d86a' })}</g>
 <rect width="1080" height="1920" fill="url(#vignette)"/>
 <rect width="1080" height="1920" filter="url(#fibre)" opacity="0.13" style="mix-blend-mode:overlay"/>
</svg>`;

C.ecrire(path.join(__dirname, 'sortie', 'C'), {
  id: 'piste-c', titre: 'Piste C · diorama en papier', svg, css: C.CSS_TERMINAL,
  apres: C.terminal('mon IA *rate* tout.'), js: V.mise('fil'), sons: V.SONS(C.b),
});
console.log('C écrite');
