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
  const FLAMME = ecran(346, 36); // la lanterne
  const OEIL = ecran(150, 182);
  const SUJET = [540, 768]; // la caméra cadre le sujet aux 2/5 de la hauteur

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
    <g id="lanterne" transform="translate(346 -4)">
      <g id="lanterne-lueur"><circle cy="40" r="90" fill="${C.lumiere}" opacity="0.12"/><circle cy="40" r="52" fill="${C.lumiere}" opacity="0.22"/></g>
      <circle cy="-6" r="7" fill="none" stroke="${C.metal2}" stroke-width="4"/>
      <path d="M-20 12 L0 -2 L20 12 Z" fill="${C.metal2}"/>
      <rect x="-20" y="12" width="40" height="5" rx="2" fill="${C.metal2}"/>
      <rect id="lanterne-verre" x="-17" y="17" width="34" height="46" rx="12" fill="${C.lumiere}" opacity="0.55"/>
      <path id="lanterne-flamme" d="M0 26 C9 38 10 46 6 54 A7 7 0 0 1 -6 54 C-10 46 -9 38 0 26Z" fill="#fff8e6"/>
      <path d="M-17 30 h34 M-17 50 h34" stroke="${C.metal2}" stroke-width="2" opacity="0.45"/>
      <rect x="-21" y="62" width="42" height="7" rx="3" fill="${C.metal2}"/>
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
  return { calque, mousse, FLAMME, OEIL, SUJET, PIEDS, EPAULE, MAIN, couleurs: C };
});
