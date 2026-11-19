/*
 * Les décors du jeu de mots fléchés (plan `grille`) : un fond de papiers superposés et, en bas de l'écran (sous les sous-titres), une
 * scène sur le thème des mots. Tout est du papier découpé (ombres nettes), en SVG, sans hasard.
 *   decor(nom) → { fond, bas, titre }   nom : "livres" (langue et littérature, par défaut) ou "plage" (plage et îles)
 * Classes utilisées par l'animation (plans.js) : .vague (dérive lente), .soleil (pulsation), .plume (hoche la tête à chaque mot trouvé).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.jeuDecors = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const onde = (y, a, f, couleur, extra = '') => `<path class="vague" d="M-40 ${y} C 150 ${y - a} 330 ${y + a} 540 ${y} S 900 ${y - a} 1120 ${y + a / 2} V1920 H-40Z" fill="${couleur}"${extra}/>`;

  const LIVRES = {
    titre: '#fff0dc',
    fond: `${onde(560, 60, 1, '#33165a')}${onde(900, 55, 1, '#4d1d63')}${onde(1240, 50, 1, '#7a2563')}${onde(1560, 55, 1, '#ff7a5c')}`,
    bas: (() => {
      const dos = ['#2f7f8a', '#ffd45c', '#c46bff', '#4fd1c5', '#ff9a5c', '#7fb2ff', '#ff5d7a', '#8ad46a'];
      const hauteurs = [190, 150, 220, 170, 205, 140, 230, 160, 195, 150, 215, 175];
      let x = 40, livres = '';
      hauteurs.forEach((h, i) => { const l = 52 + (i % 3) * 12; if (x + l > 600) return; livres += `<g><rect x="${x}" y="${1812 - h}" width="${l}" height="${h}" fill="${dos[i % dos.length]}"/><rect x="${x}" y="${1812 - h + 22}" width="${l}" height="10" fill="#ffffff55"/><rect x="${x}" y="${1812 - 38}" width="${l}" height="10" fill="#ffffff55"/><rect x="${x + 10}" y="${1812 - h / 2 - 12}" width="${l - 20}" height="22" fill="#fff6e8" opacity=".85"/></g>`; x += l + 6; });
      return `<g style="filter:drop-shadow(5px 6px 0 #00000066)">${livres}<rect x="0" y="1812" width="1080" height="108" fill="#8a4a2f"/><rect x="0" y="1812" width="1080" height="14" fill="#a65e3a"/>
        <g><rect x="620" y="1720" width="300" height="42" fill="#c46bff"/><rect x="636" y="1678" width="270" height="42" fill="#4fd1c5"/><rect x="610" y="1636" width="290" height="42" fill="#ffd45c"/></g>
        <g><rect x="930" y="1700" width="92" height="112" rx="14" fill="#2a1a14"/><rect x="946" y="1684" width="60" height="24" rx="8" fill="#4a2f22"/>
        <g class="plume" style="transform-origin:976px 1690px"><path d="M976 1690 C 1010 1600 1050 1560 1068 1480 C 1020 1520 990 1580 976 1690Z" fill="#fff6e8"/><path d="M976 1690 C 1006 1610 1038 1570 1068 1480" fill="none" stroke="#e8b84a" stroke-width="4"/></g></g></g>`;
    })(),
  };

  const PLAGE = {
    titre: '#ffffff',
    fond: `<rect x="0" y="0" width="1080" height="1920" fill="#4cb8ea"/><rect x="0" y="0" width="1080" height="560" fill="#7fd0f2" opacity=".6"/>
      <g class="soleil" style="transform-origin:900px 160px"><circle cx="900" cy="160" r="150" fill="#ffe27a" opacity=".35"/><circle cx="900" cy="160" r="96" fill="#ffd45c"/><circle cx="900" cy="160" r="70" fill="#ffe9a0"/></g>
      <g style="filter:drop-shadow(0 8px 0 #00000026)"><g fill="#fff"><ellipse cx="240" cy="250" rx="110" ry="34"/><circle cx="200" cy="228" r="36"/><circle cx="270" cy="220" r="44"/><ellipse cx="640" cy="236" rx="96" ry="26"/><circle cx="610" cy="220" r="30"/><circle cx="670" cy="214" r="36"/></g></g>
      ${onde(640, 46, 1, '#2fc4c8')}${onde(960, 52, 1, '#1aa3b5')}${onde(1290, 46, 1, '#0f8aa6')}
      <path d="M-40 1560 C 200 1500 420 1600 640 1545 S 940 1510 1120 1560 V1920 H-40Z" fill="#f5d89a"/><path d="M-40 1700 C 220 1650 440 1730 660 1690 S 960 1660 1120 1700 V1920 H-40Z" fill="#e9c37d"/>`,
    bas: `<g style="filter:drop-shadow(5px 6px 0 #00000055)"><g transform="translate(0 180)">
      <ellipse cx="860" cy="1640" rx="250" ry="60" fill="#e9c37d"/><ellipse cx="860" cy="1625" rx="210" ry="44" fill="#f5d89a"/>
      <path d="M850 1630 C 840 1560 870 1500 900 1440" fill="none" stroke="#8a5a3c" stroke-width="22" stroke-linecap="round"/>
      <path d="M900 1440 C 840 1400 800 1420 770 1470 C 820 1440 860 1440 900 1440Z" fill="#2e9e5b"/><path d="M900 1440 C 950 1380 1010 1390 1040 1440 C 990 1410 940 1420 900 1440Z" fill="#3fbf6e"/><path d="M900 1440 C 880 1380 900 1340 940 1320 C 930 1370 920 1400 900 1440Z" fill="#2e9e5b"/><path d="M900 1440 C 800 1350 740 1360 700 1400 C 770 1390 840 1400 900 1440Z" fill="#3fbf6e"/><path d="M900 1440 C 990 1340 1050 1350 1075 1395 C 1010 1380 950 1400 900 1440Z" fill="#2e9e5b"/>
      <circle cx="880" cy="1452" r="14" fill="#6b3f26"/><circle cx="906" cy="1458" r="14" fill="#6b3f26"/>
      <g><rect x="110" y="1700" width="250" height="26" rx="6" fill="#4fd1c5"/><rect x="110" y="1700" width="250" height="8" fill="#ffffff66"/><rect x="226" y="1470" width="9" height="236" fill="#8a5a3c"/><path d="M90 1520 C 100 1420 340 1420 370 1520Z" fill="#ff5d7a"/><path d="M170 1450 C 165 1480 160 1500 150 1520 L 205 1520 C 198 1490 196 1470 196 1440Z M290 1440 C 290 1470 296 1490 304 1520 L 355 1520 C 345 1490 335 1460 322 1450Z" fill="#fff6e8" opacity=".9"/><path d="M90 1520 q35 24 70 0 q35 24 70 0 q35 24 70 0 q35 24 70 0" fill="#ff5d7a"/></g></g></g>
      <g transform="translate(390 1850) scale(.8)"><path d="M0 -40 l14 36 38 4 -30 26 10 38 -32 -20 -32 20 10 -38 -30 -26 38 -4z" fill="#ff7a5c"/></g>
      <g transform="translate(470 1900)"><path d="M0 0 q60 -90 120 0z" fill="#ffd9c2"/><path d="M60 0 l-40 -70 M60 0 l0 -76 M60 0 l40 -70" stroke="#e8a58a" stroke-width="5" fill="none"/></g>
      <g transform="translate(-150 20)"><ellipse cx="800" cy="1830" rx="48" ry="30" fill="#e84a3a"/><circle cx="780" cy="1802" r="9" fill="#fff"/><circle cx="820" cy="1802" r="9" fill="#fff"/><path d="M752 1818 l-30 -26 M848 1818 l30 -26" stroke="#e84a3a" stroke-width="9" stroke-linecap="round"/></g></g>`,
  };

  const DECORS = { livres: LIVRES, plage: PLAGE };
  const decor = (nom) => DECORS[nom] || DECORS.livres;
  return { decor, DECORS };
});
