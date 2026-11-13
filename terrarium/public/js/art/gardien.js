/*
 * Mousse, le gardien du terrarium : petit robot jardinier rond, tête moussue,
 * un œil cyan, une lanterne au bout d'une perche. Dessiné devant la vitre,
 * en coordonnées d'écran (1080 × 1920), en bas à droite, tourné vers la scène.
 *
 * calque() renvoie le calque d'écran complet : la lumière de la lanterne (faisceau
 * vers le sujet), Mousse, le vignettage, le grain, et le noir quand la lanterne est éteinte.
 * Texte pur : calculé à la génération de la vidéo.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    racine.Terrarium.gardien = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const C = {
    metal: '#2a3550', metal2: '#151c2e', mousse: '#3fa34d', mousse2: '#b6ff5c',
    oeil: '#5ef2ff', ecran: '#0a1020', lumiere: '#ffc65c', botte: '#3b2a24',
  };
  // Mousse est dessiné dans son repère, puis placé en miroir en bas à droite de l'écran.
  const POSE = { x: 905, y: 1180, echelle: 1.25 };
  const ecran = (x, y) => [POSE.x - POSE.echelle * x, POSE.y + POSE.echelle * y];
  // Points utiles, en coordonnées d'écran.
  const FLAMME = ecran(346, 62); // le cœur de la lanterne
  const OEIL = ecran(150, 182);
  const SUJET = [540, 768]; // la caméra cadre le sujet aux 2/5 de la hauteur

  // La lanterne : des rayons autour de la flamme, et deux dégradés (halo chaud, reflet du verre).
  const RAYONS = Array.from({ length: 10 }, (_, k) => { const a = (k / 10) * Math.PI * 2; return `<line x1="${(46 * Math.cos(a)).toFixed(1)}" y1="${(46 * Math.sin(a)).toFixed(1)}" x2="${(78 * Math.cos(a)).toFixed(1)}" y2="${(78 * Math.sin(a)).toFixed(1)}" stroke="#ffd98a" stroke-width="3" stroke-linecap="round" opacity="0.45"/>`; }).join('');
  const DEFS_LANTERNE = '<radialGradient id="lanterne-halo"><stop offset="0" stop-color="#ffc65c" stop-opacity="0.55"/><stop offset="0.45" stop-color="#ffc65c" stop-opacity="0.2"/><stop offset="1" stop-color="#ffc65c" stop-opacity="0"/></radialGradient><linearGradient id="lanterne-reflet" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.5"/><stop offset="0.4" stop-color="#fff" stop-opacity="0"/></linearGradient>';

  function mousse() {
    return `
<g id="mousse" transform="translate(${POSE.x} ${POSE.y}) scale(-${POSE.echelle} ${POSE.echelle})">
  <ellipse id="mousse-ombre" cx="135" cy="345" rx="120" ry="16" fill="#000" opacity="0.35"/>
  <g id="mousse-saut">
  <path d="M95 280 v38 M175 280 v38" stroke="${C.metal2}" stroke-width="16" stroke-linecap="round"/>
  <path d="M70 318 h50 a10 10 0 0 1 10 10 v8 h-70 v-8 a10 10 0 0 1 10 -10Z M150 318 h50 a10 10 0 0 1 10 10 v8 h-70 v-8 a10 10 0 0 1 10 -10Z" fill="${C.botte}"/>
  <g id="mousse-geste"><g id="mousse-battement">
  <g id="mousse-perche-geste"><g id="mousse-perche">
    <path d="M215 215 L330 -30" stroke="${C.metal2}" stroke-width="9" stroke-linecap="round"/>
    <path d="M330 -30 q14 -4 16 12" stroke="${C.metal2}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g id="lanterne" transform="translate(346 62) scale(1.24)">
      <g id="lanterne-lueur"><circle r="150" fill="url(#lanterne-halo)" style="mix-blend-mode:screen"/>${RAYONS}</g>
      <path d="M0 -62 L0 -48" stroke="#c8913a" stroke-width="3"/><circle cy="-66" r="7" fill="none" stroke="#c8913a" stroke-width="3.5"/>
      <path d="M-28 -30 Q0 -54 28 -30 Z" fill="#4a3220" stroke="#e0a94a" stroke-width="2.5"/>
      <rect id="lanterne-verre" x="-23" y="-30" width="46" height="60" rx="7" fill="#ffd27a" opacity="0.75"/>
      <rect x="-23" y="-30" width="46" height="60" rx="7" fill="url(#lanterne-reflet)"/>
      <g id="lanterne-flamme"><path d="M0 -14 C10 0 11 9 6 18 A7 7 0 0 1 -6 18 C-11 9 -10 0 0 -14Z" fill="#fff8e0"/><path d="M0 0 C5 7 5 12 2 17 A3 3 0 0 1 -2 17 C-5 12 -5 7 0 0Z" fill="#ffb347"/></g>
      <rect x="-23" y="-30" width="46" height="60" rx="7" fill="none" stroke="#e0a94a" stroke-width="4"/>
      <path d="M-8 -30 V30 M8 -30 V30" stroke="#c8913a" stroke-width="2.5" opacity="0.8"/>
      <rect x="-28" y="29" width="56" height="9" rx="4" fill="#4a3220" stroke="#e0a94a" stroke-width="2.5"/>
    </g>
  </g></g>
  <g id="mousse-corps">
    <ellipse cx="135" cy="200" rx="118" ry="112" fill="${C.metal}"/>
    <ellipse cx="160" cy="165" rx="70" ry="60" fill="${C.lumiere}" opacity="0.12"/>
    <path d="M60 255 q75 40 150 0" stroke="${C.metal2}" stroke-width="6" fill="none" opacity="0.6"/>
    <circle cx="135" cy="262" r="9" fill="${C.oeil}" opacity="0.8"/>
    <path d="M235 205 Q262 215 248 175" stroke="${C.metal2}" stroke-width="16" stroke-linecap="round" fill="none"/>
    <circle cx="246" cy="172" r="13" fill="${C.metal2}"/>
    <g id="mousse-bras"><path d="M35 210 Q10 240 30 265" stroke="${C.metal2}" stroke-width="16" stroke-linecap="round" fill="none"/><circle cx="30" cy="267" r="11" fill="${C.metal2}"/></g>
    <g fill="${C.mousse}">
      <circle cx="70" cy="110" r="34"/><circle cx="112" cy="88" r="40"/><circle cx="162" cy="86" r="42"/><circle cx="205" cy="108" r="34"/><circle cx="138" cy="70" r="30"/>
    </g>
    <g fill="${C.mousse2}"><circle cx="100" cy="76" r="9"/><circle cx="170" cy="66" r="7"/><circle cx="210" cy="96" r="6"/><circle cx="62" cy="98" r="6"/></g>
    <path id="mousse-pousse" d="M150 48 q8 -30 30 -36 q-6 22 -30 36Z" fill="${C.mousse2}"/>
    <circle cx="150" cy="182" r="48" fill="${C.ecran}"/>
    <g id="mousse-oeil">
      <g id="oeil-neutre"><circle cx="150" cy="182" r="34" fill="${C.oeil}" opacity="0.25"/><circle cx="160" cy="180" r="22" fill="${C.oeil}"/><circle cx="168" cy="172" r="7" fill="#fff" opacity="0.9"/></g>
      <g id="oeil-content" opacity="0"><path d="M128 190 Q150 160 172 190" stroke="${C.oeil}" stroke-width="10" fill="none" stroke-linecap="round"/></g>
      <g id="oeil-surpris" opacity="0"><circle cx="150" cy="182" r="34" fill="none" stroke="${C.oeil}" stroke-width="7"/><circle cx="150" cy="182" r="12" fill="${C.oeil}"/></g>
      <g id="oeil-blase" opacity="0"><path d="M126 176 h48" stroke="${C.oeil}" stroke-width="8" stroke-linecap="round"/><path d="M130 180 Q150 202 170 180 Z" fill="${C.oeil}"/></g>
    </g>
  </g>
  </g></g>
  </g>
</g>`;
  }

  function calque() {
    const [lx, ly] = FLAMME;
    const [cx, cy] = SUJET;
    const [ox, oy] = OEIL;
    return `<svg id="calque-lumiere" width="1080" height="1920" viewBox="0 0 1080 1920" aria-hidden="true">
  <defs>
    <radialGradient id="chaud" cx="${cx}" cy="${cy}" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.lumiere}" stop-opacity="0.47"/><stop offset="1" stop-color="${C.lumiere}" stop-opacity="0"/></radialGradient>
    <linearGradient id="cone" x1="${lx}" y1="${ly}" x2="${cx}" y2="${cy}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.lumiere}" stop-opacity="0.64"/><stop offset="1" stop-color="${C.lumiere}" stop-opacity="0.12"/></linearGradient>
    <radialGradient id="vignette" cx="540" cy="900" r="1150" gradientUnits="userSpaceOnUse"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.75"/></radialGradient>
    <radialGradient id="oeil-dans-le-noir" cx="${ox}" cy="${oy}" r="90" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${C.oeil}" stop-opacity="0.9"/><stop offset="0.35" stop-color="${C.oeil}" stop-opacity="0.35"/><stop offset="1" stop-color="${C.oeil}" stop-opacity="0"/></radialGradient>
    ${DEFS_LANTERNE}
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.9 0"/></filter>
    <filter id="flou-cone" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
  </defs>
  <g id="lumiere" style="mix-blend-mode:screen">
    <polygon points="${lx - 30},${ly} ${lx + 30},${ly} ${cx + 170},${cy + 60} ${cx - 120},${cy - 140}" fill="url(#cone)" filter="url(#flou-cone)"/>
    <rect width="1080" height="1920" fill="url(#chaud)"/>
  </g>
  ${mousse()}
  <rect width="1080" height="1920" fill="url(#vignette)"/>
  <rect width="1080" height="1920" filter="url(#grain)" opacity="0.07"/>
  <g id="noir" opacity="0"><rect width="1080" height="1920" fill="#02040a"/><rect width="1080" height="1920" fill="url(#oeil-dans-le-noir)"/></g>
</svg>`;
  }

  // Points d'appui des gestes.
  // (svgOrigin se lit dans le repère de Mousse, avant sa mise en place à l'écran.)
  const PIEDS = [135, 336];
  const EPAULE = [35, 210];
  const MAIN = [246, 172];
  return { calque, mousse, FLAMME, OEIL, SUJET, PIEDS, EPAULE, MAIN, DEFS_LANTERNE, couleurs: C };
});
