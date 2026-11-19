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


  // --- Maquettes proposées (21 nov. 2026) : des décors moins enfantins. -------------------------------------------------------------
  const palmier = (x, y, h, couleur, sens = 1) => `<g fill="${couleur}"><path d="M${x} ${y} C ${x + sens * 20} ${y - h * 0.4} ${x + sens * 10} ${y - h * 0.8} ${x + sens * 40} ${y - h}" fill="none" stroke="${couleur}" stroke-width="${Math.round(h / 22)}" stroke-linecap="round"/>`
    + [[-150, -30], [-110, -90], [-40, -120], [50, -110], [120, -70], [160, -10]].map(([dx, dy]) => `<path d="M${x + sens * 40} ${y - h} C ${x + sens * 40 + dx * 0.5} ${y - h + dy - 30} ${x + sens * 40 + dx * 0.9} ${y - h + dy} ${x + sens * 40 + dx} ${y - h + dy + 55} C ${x + sens * 40 + dx * 0.6} ${y - h + dy + 10} ${x + sens * 40 + dx * 0.3} ${y - h + dy / 2} ${x + sens * 40} ${y - h}Z"/>`).join('') + '</g>';
  const quadrillage = (couleur, pas) => { let d = ''; for (let x = 0; x <= 1080; x += pas) d += `M${x} 0V1920`; for (let y = 0; y <= 1920; y += pas) d += `M0 ${y}H1080`; return `<path d="${d}" stroke="${couleur}" stroke-width="1.5" fill="none"/>`; };
  const etoiles = (n, graine) => Array.from({ length: n }, (_, i) => { const a = Math.sin(i * 12.9898 + graine) * 43758.5453, b = Math.sin(i * 78.233 + graine) * 12345.6789; return `<circle cx="${((a - Math.floor(a)) * 1080).toFixed(0)}" cy="${((b - Math.floor(b)) * 620).toFixed(0)}" r="${(1 + (i % 3)).toFixed(1)}" fill="#fff6e8" opacity="${(0.35 + (i % 4) * 0.15).toFixed(2)}"/>`; }).join('');

  // Affiche de voyage des années 50 : un grand soleil à bandes au ras de l'horizon, des palmiers en silhouette, un ciel sourd.
  const AFFICHE = {
    titre: '#fbf1dc',
    fond: `<defs><linearGradient id="aff-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d343d"/><stop offset=".55" stop-color="#1c6470"/><stop offset=".82" stop-color="#e9915a"/><stop offset="1" stop-color="#f2b66a"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#aff-ciel)"/>
      <g class="soleil" data-o="540 1540" style="transform-origin:540px 1540px"><circle cx="540" cy="1540" r="330" fill="#f25c54" opacity=".9"/><circle cx="540" cy="1540" r="262" fill="#f6845a"/><circle cx="540" cy="1540" r="196" fill="#f4a259"/><circle cx="540" cy="1540" r="130" fill="#f7c873"/></g>`,
    bas: `<rect x="0" y="1540" width="1080" height="380" fill="#11242e"/>${[0, 1, 2, 3, 4, 5].map((i) => `<rect class="vague" x="${240 + i * 18}" y="${1568 + i * 38}" width="${600 - i * 36}" height="${12 - i}" fill="${i % 2 ? '#f4a259' : '#fbf1dc'}" opacity="${(0.85 - i * 0.1).toFixed(2)}"/>`).join('')}
      ${palmier(120, 1840, 520, '#0b1a22', 1)}${palmier(980, 1860, 440, '#0b1a22', -1)}<path d="M70 1500 l20 -14 20 14 M150 1450 l16 -11 16 11" stroke="#fbf1dc" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`,
  };

  // Géométrique et sobre : aplats bleu ardoise, un disque terracotta, des dunes et un palmier réduit à quelques triangles.
  const GEO = {
    titre: '#f3e8d4',
    fond: `<rect width="1080" height="1920" fill="#1f3a4d"/><circle class="soleil" data-o="880 210" cx="880" cy="210" r="120" fill="#d1603d" style="transform-origin:880px 210px"/>
      ${onde(700, 26, 1, '#27495e')}${onde(1020, 30, 1, '#2f5a72')}${onde(1340, 26, 1, '#3a7088')}`,
    bas: `<path d="M-40 1640 C 220 1560 520 1700 780 1620 S 1040 1580 1120 1620 V1920 H-40Z" fill="#e2c9a0"/><path d="M-40 1760 C 260 1700 560 1800 820 1740 S 1040 1720 1120 1750 V1920 H-40Z" fill="#c9a878"/>
      <g fill="#3b6b4f"><path d="M860 1660 L860 1500" stroke="#3b6b4f" stroke-width="14"/><path d="M860 1500 l-120 36 l120 -70z M860 1500 l130 30 l-130 -66z M860 1500 l-30 -110 l60 106z M860 1500 l-90 -80 l100 74z M860 1500 l100 -76 l-92 78z"/></g>
      <rect x="150" y="1630" width="170" height="14" fill="#d1603d"/><path d="M180 1630 a60 60 0 0 1 110 0z" fill="#f3e8d4"/><rect x="233" y="1580" width="5" height="52" fill="#8a5a3c"/>`,
  };

  // Carte marine de nuit : un fond bleu nuit quadrillé, un trait doré, une rose des vents, une route en pointillés entre des îles.
  const CARTE = {
    titre: '#f6e6c0',
    fond: `<rect width="1080" height="1920" fill="#0c2438"/>${quadrillage('#d9b45a22', 90)}<g fill="none" stroke="#d9b45a" stroke-width="2" opacity=".35"><circle cx="540" cy="960" r="420"/><circle cx="540" cy="960" r="560"/></g>${onde(1380, 18, 1, '#102f48')}`,
    bas: `<g fill="none" stroke="#d9b45a" stroke-width="3" opacity=".9"><circle cx="190" cy="1750" r="92"/><circle cx="190" cy="1750" r="62" stroke-width="2"/><path d="M190 1642 L206 1734 L298 1750 L206 1766 L190 1858 L174 1766 L82 1750 L174 1734Z" fill="#d9b45a33"/><path d="M190 1642 V1858 M82 1750 H298" stroke-width="2"/></g>
      <g fill="#e9d3a0" stroke="#d9b45a" stroke-width="3"><path d="M520 1700 C 560 1660 640 1670 660 1710 C 690 1730 650 1790 590 1780 C 540 1790 500 1750 520 1700Z"/><path d="M820 1640 C 850 1620 900 1630 910 1660 C 930 1680 900 1710 860 1706 C 820 1706 800 1670 820 1640Z"/><path d="M890 1810 C 920 1790 980 1800 990 1830 C 1000 1860 950 1880 910 1870 C 880 1860 870 1830 890 1810Z"/></g>
      <path d="M660 1730 C 720 1790 760 1700 830 1670 S 900 1760 905 1800" stroke="#d9b45a" stroke-width="4" stroke-dasharray="4 14" fill="none" stroke-linecap="round"/><path d="M360 1790 q20 -14 40 0 M410 1830 q20 -14 40 0 M420 1740 q20 -14 40 0" stroke="#d9b45a" stroke-width="3" fill="none" opacity=".7"/>
      <g stroke="#f6e6c0" stroke-width="3" fill="none"><path d="M690 1720 l20 12 -6 -26 20 -6" opacity="0"/></g>`,
  };

  // Crépuscule tropical : un dégradé indigo, violet, magenta, orange, un demi-soleil sur la mer, de grands palmiers noirs.
  const CREPUSCULE = {
    titre: '#fff0dc',
    fond: `<defs><linearGradient id="cre-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#150f3a"/><stop offset=".38" stop-color="#4a2a86"/><stop offset=".62" stop-color="#b53f7d"/><stop offset=".8" stop-color="#ff8c42"/><stop offset="1" stop-color="#ffc16a"/></linearGradient><linearGradient id="cre-mer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6e2f6a"/><stop offset="1" stop-color="#120b24"/></linearGradient></defs>
      <rect width="1080" height="1920" fill="url(#cre-ciel)"/>${etoiles(60, 3.3)}<g class="soleil" data-o="540 1500" style="transform-origin:540px 1500px"><circle cx="540" cy="1500" r="230" fill="#ffd27a" opacity=".28"/><circle cx="540" cy="1500" r="170" fill="#ffd27a"/><circle cx="540" cy="1500" r="130" fill="#ffe7a8"/></g>`,
    bas: `<rect x="0" y="1500" width="1080" height="420" fill="url(#cre-mer)"/>${[0, 1, 2, 3, 4].map((i) => `<rect class="vague" x="${300 + i * 22}" y="${1530 + i * 46}" width="${480 - i * 44}" height="8" fill="#ffd27a" opacity="${(0.8 - i * 0.14).toFixed(2)}"/>`).join('')}
      ${palmier(70, 1900, 640, '#0b0718', 1)}${palmier(1010, 1900, 560, '#0b0718', -1)}${palmier(250, 1900, 360, '#0b0718', 1)}`,
  };

  // Bureau d'écrivain la nuit : bois sombre, lampe qui éclaire un livre ouvert, une plume, une pile de livres.
  const BUREAU = {
    titre: '#fff0dc',
    fond: `${onde(560, 40, 1, '#241238')}${onde(900, 40, 1, '#2d1743')}${onde(1240, 36, 1, '#3a1d4a')}<defs><radialGradient id="bur-lampe" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd27a" stop-opacity=".75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><ellipse class="soleil" data-o="830 1700" cx="830" cy="1700" rx="480" ry="340" fill="url(#bur-lampe)" style="transform-origin:830px 1700px"/>`,
    bas: `<rect x="0" y="1760" width="1080" height="160" fill="#4a2a1e"/><rect x="0" y="1760" width="1080" height="12" fill="#6b3f2a"/>
      <g style="filter:drop-shadow(5px 6px 0 #00000066)"><rect x="80" y="1690" width="280" height="30" fill="#7d2e3a"/><rect x="100" y="1660" width="250" height="30" fill="#2f5a4a"/><rect x="90" y="1630" width="260" height="30" fill="#c9a24a"/>
      <path d="M420 1760 L520 1700 L620 1740 L720 1700 L820 1760Z" fill="#f6ecd6"/><path d="M520 1700 L520 1760 M620 1740 V1760 M720 1700 V1760" stroke="#c9b89a" stroke-width="3"/><path d="M440 1752 L520 1708 M540 1712 L610 1744 M640 1744 L710 1708 M740 1708 L800 1752" stroke="#b9a888" stroke-width="3"/>
      <g class="plume" style="transform-origin:870px 1720px"><path d="M870 1730 C 910 1640 960 1600 990 1520 C 940 1560 900 1630 870 1730Z" fill="#fff6e8"/></g>
      <g><rect x="930" y="1690" width="66" height="72" rx="10" fill="#1c1118"/><rect x="944" y="1676" width="38" height="18" rx="6" fill="#322020"/></g>
      <path d="M1010 1760 V1500 C1010 1440 960 1410 900 1420" stroke="#c9a24a" stroke-width="10" fill="none" stroke-linecap="round"/><path d="M860 1420 L940 1420 L920 1470 L880 1470Z" fill="#e9b84a"/></g>`,
  };

  // Bibliothèque ancienne : des rayonnages sombres, des dos de livres aux tons sourds (bordeaux, vert anglais, bleu nuit, ocre).
  const BIBLIO = {
    titre: '#fbeccb',
    fond: `${onde(560, 40, 1, '#26142e')}${onde(900, 40, 1, '#321a3a')}${onde(1240, 36, 1, '#3d2142')}`,
    bas: (() => {
      const tons = ['#6b1f2d', '#244d3b', '#1c2e55', '#a8792f', '#4a2a54', '#7d3b22', '#2d4a52', '#8a2f3f'];
      let svg = '<rect x="0" y="1580" width="1080" height="340" fill="#2a1710"/>';
      [1586, 1722, 1858].forEach((yr, r) => { svg += `<rect x="0" y="${yr + 112}" width="1080" height="14" fill="#4a2a1e"/>`; let x = 14 + (r % 2) * 20; let i = 0; while (x < 1060) { const w = 30 + ((i * 7 + r * 5) % 5) * 9, h = 78 + ((i * 11 + r * 3) % 6) * 6; svg += `<rect x="${x}" y="${yr + 112 - h}" width="${w}" height="${h}" fill="${tons[(i + r * 3) % tons.length]}"/><rect x="${x}" y="${yr + 112 - h + 10}" width="${w}" height="5" fill="#e9c97a" opacity=".55"/><rect x="${x}" y="${yr + 112 - 18}" width="${w}" height="4" fill="#e9c97a" opacity=".35"/>`; x += w + 3; i += 1; } });
      return `<g class="plume" style="transform-origin:540px 1600px">${svg}</g>`;
    })(),
  };

  const DECORS = { livres: LIVRES, plage: PLAGE, 'plage-affiche': AFFICHE, 'plage-geo': GEO, 'plage-carte': CARTE, 'plage-crepuscule': CREPUSCULE, 'livres-bureau': BUREAU, 'livres-biblio': BIBLIO };
  const decor = (nom) => DECORS[nom] || DECORS.livres;
  return { decor, DECORS };
});
