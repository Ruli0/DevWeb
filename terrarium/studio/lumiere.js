/*
 * L'éclairage de la série (Node seulement) : lanterne de Mousse, projecteur, liserés, ombres portées.
 * Les liserés (bord éclairé) sont des masques « silhouette moins silhouette décalée » :
 * ils se calculent à partir de <use> des personnages, donc ils suivent leur animation.
 * Décidé le 13 nov. 2026 (maquettes : essais/psycho-styles).
 */
'use strict';
const gardien = require('../public/js/art/gardien.js');

const [FX, FY] = gardien.FLAMME;
// Le caméléon vit dans le décor : sa lumière est calculée en coordonnées du décor.
const LUMIERE_CAM = { x: 380, y: 1250 };

const DEFS = `
  ${gardien.DEFS_LANTERNE}
  <filter id="blanc"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
  <filter id="noir"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/></filter>
  <filter id="flou8" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="8"/></filter>
  <filter id="flou16" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="16"/></filter>
  <filter id="flou26" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>
  <radialGradient id="chaud-grand" cx="${FX}" cy="${FY}" r="600" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffc65c" stop-opacity="0.3"/><stop offset="0.3" stop-color="#ffb347" stop-opacity="0.13"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
  <radialGradient id="chaud-mousse" cx="${FX}" cy="${FY + 40}" r="360" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb347" stop-opacity="0.26"/><stop offset="0.5" stop-color="#ff9a3c" stop-opacity="0.1"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
  <radialGradient id="chaud-rim" cx="${FX}" cy="${FY}" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a0" stop-opacity="1"/><stop offset="0.5" stop-color="#ffb347" stop-opacity="0.75"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0.15"/></radialGradient>
  <radialGradient id="chaud-rim-cam" cx="${LUMIERE_CAM.x}" cy="${LUMIERE_CAM.y}" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffe2a0" stop-opacity="1"/><stop offset="0.5" stop-color="#ffb347" stop-opacity="0.75"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0.15"/></radialGradient>
  <linearGradient id="rim-haut" x1="0" y1="620" x2="0" y2="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff6dc" stop-opacity="1"/><stop offset="1" stop-color="#fff6dc" stop-opacity="0.2"/></linearGradient>
  <linearGradient id="ombre-droite" x1="${FX + 40}" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#050a1c" stop-opacity="0"/><stop offset="1" stop-color="#050a1c" stop-opacity="0.3"/></linearGradient>
  <linearGradient id="ombre-bas" x1="0" y1="1380" x2="0" y2="1610" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#050a1c" stop-opacity="0"/><stop offset="1" stop-color="#050a1c" stop-opacity="0.18"/></linearGradient>
  <linearGradient id="cone-spot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d8" stop-opacity="0.85"/><stop offset="0.6" stop-color="#fff0c0" stop-opacity="0.32"/><stop offset="1" stop-color="#fff0c0" stop-opacity="0.12"/></linearGradient>
  <radialGradient id="flaque"><stop offset="0" stop-color="#fff2c8" stop-opacity="0.85"/><stop offset="0.6" stop-color="#ffe29a" stop-opacity="0.3"/><stop offset="1" stop-color="#ffe29a" stop-opacity="0"/></radialGradient>
  <radialGradient id="flaque-chaude"><stop offset="0" stop-color="#ffc65c" stop-opacity="0.8"/><stop offset="0.6" stop-color="#ff9a3c" stop-opacity="0.3"/><stop offset="1" stop-color="#ff9a3c" stop-opacity="0"/></radialGradient>
  <radialGradient id="halo-luciole"><stop offset="0" stop-color="#eaff7a" stop-opacity="0.5"/><stop offset="1" stop-color="#eaff7a" stop-opacity="0"/></radialGradient>
  <mask id="mk-mousse" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><use href="#mousse" filter="url(#blanc)"/></mask>
  <mask id="rim-mousse" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1920"><use href="#mousse" filter="url(#blanc)"/><use href="#mousse" transform="translate(20 12)" filter="url(#noir)"/></mask>
  <mask id="rim-cam-bas" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4000" height="5000"><use href="#cameleon" filter="url(#blanc)"/><use href="#cameleon" transform="translate(0 -7)" filter="url(#noir)"/></mask>
  <mask id="rim-cam-haut" maskUnits="userSpaceOnUse" x="-1500" y="-1500" width="4000" height="5000"><use href="#cameleon" filter="url(#blanc)"/><use href="#cameleon" transform="translate(0 8)" filter="url(#noir)"/></mask>`;

// Sous Mousse : la flaque de lumière chaude sur le sol, et son ombre portée (loin de la lanterne).
const sousMousse = () => `
  <ellipse cx="${FX + 120}" cy="1604" rx="330" ry="34" fill="url(#flaque-chaude)" style="mix-blend-mode:screen"/>
  <ellipse cx="900" cy="1610" rx="230" ry="17" fill="#02050a" opacity="0.5" filter="url(#flou8)"/>
  <path d="M770 1600 L1010 1618 L990 1636 L760 1618Z" fill="#02050a" opacity="0.32" filter="url(#flou8)"/>`;

// Sur Mousse : léger éclaircissement, liseré chaud côté lanterne, ombre de l'autre côté, lueur sur la scène.
const surMousse = () => `
  <rect width="1080" height="1920" fill="url(#chaud-mousse)" mask="url(#mk-mousse)" style="mix-blend-mode:screen"/>
  <rect width="1080" height="1920" fill="url(#chaud-rim)" mask="url(#rim-mousse)" style="mix-blend-mode:screen"/>
  <rect width="1080" height="1920" fill="url(#ombre-droite)" mask="url(#mk-mousse)"/>
  <rect width="1080" height="1920" fill="url(#ombre-bas)" mask="url(#mk-mousse)"/>
  <rect width="1080" height="1920" fill="url(#chaud-grand)" style="mix-blend-mode:screen"/>
  <circle cx="${FX}" cy="${FY - 4}" r="46" fill="#fff1c8" opacity="0.4" filter="url(#flou16)" style="mix-blend-mode:screen"/>`;

// Sur le caméléon (dans le décor) : liseré chaud sous le ventre, liseré clair sur le dos quand le projecteur est allumé.
const surCameleon = () => `
  <rect x="-1500" y="-1500" width="4000" height="5000" fill="url(#chaud-rim-cam)" mask="url(#rim-cam-bas)" style="mix-blend-mode:screen"/>
  <rect id="rim-projecteur" x="-1500" y="-1500" width="4000" height="5000" fill="url(#rim-haut)" mask="url(#rim-cam-haut)" style="mix-blend-mode:screen" opacity="0"/>`;

// Le voile qui assombrit la scène, et le projecteur (faisceau doux, cœur net, flaque, poussière), dans le décor.
function projecteur(x) {
  const R = (() => { let a = 17; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; })();
  const poussiere = Array.from({ length: 22 }, () => { const y = 80 + R() * 1000; const demi = 70 + (y / 1080) * 250; const px = x + (R() * 2 - 1) * demi; return `<circle class="poussiere" cx="${px.toFixed(0)}" cy="${y.toFixed(0)}" r="${(1.5 + R() * 3).toFixed(1)}" fill="#fff6d8" opacity="${(0.3 + R() * 0.5).toFixed(2)}"/>`; }).join('');
  return `
  <rect id="voile" x="-4000" y="-4000" width="9000" height="10000" fill="#02060e" opacity="0"/>
  <g id="projecteur" opacity="0">
    <polygon points="${x - 115},-300 ${x + 115},-300 ${x + 390},1090 ${x - 390},1090" fill="url(#cone-spot)" filter="url(#flou26)" style="mix-blend-mode:screen"/>
    <polygon points="${x - 35},-300 ${x + 35},-300 ${x + 160},1060 ${x - 160},1060" fill="url(#cone-spot)" opacity="0.7" filter="url(#flou16)" style="mix-blend-mode:screen"/>
    <ellipse cx="${x + 20}" cy="1034" rx="360" ry="40" fill="url(#flaque)" style="mix-blend-mode:screen"/>
    <ellipse cx="${x + 10}" cy="1040" rx="250" ry="13" fill="#02050a" opacity="0.4" filter="url(#flou8)"/>
    ${poussiere}
  </g>`;
}

module.exports = { DEFS, sousMousse, surMousse, surCameleon, projecteur, FLAMME: [FX, FY] };
