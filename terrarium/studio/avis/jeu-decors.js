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
  const onde = (y, a, f, couleur, extra = '') => `<path class="vague" d="M-160 ${y} C 90 ${y - a} 330 ${y + a} 540 ${y} S 900 ${y - a} 1240 ${y + a / 2} V1920 H-160Z" fill="${couleur}"${extra}/>`;

  const LIVRES = {
    titre: '#fff0dc',
    fond: `${onde(560, 60, 1, '#33165a')}${onde(900, 55, 1, '#4d1d63')}${onde(1240, 50, 1, '#7a2563')}${onde(1560, 55, 1, '#ff7a5c')}`,
    bas: (() => {
      const dos = ['#2f7f8a', '#ffd45c', '#c46bff', '#4fd1c5', '#ff9a5c', '#7fb2ff', '#ff5d7a', '#8ad46a'];
      const hauteurs = [190, 150, 220, 170, 205, 140, 230, 160, 195, 150, 215, 175];
      let x = 40, livres = '';
      hauteurs.forEach((h, i) => { const l = 52 + (i % 3) * 12; if (x + l > 600) return; livres += `<g${[1, 3, 4, 6].includes(i) ? ` class="livre-saut" data-k="${i}"` : ''}><rect x="${x}" y="${1812 - h}" width="${l}" height="${h}" fill="${dos[i % dos.length]}"/><rect x="${x}" y="${1812 - h + 22}" width="${l}" height="10" fill="#ffffff55"/><rect x="${x}" y="${1812 - 38}" width="${l}" height="10" fill="#ffffff55"/><rect x="${x + 10}" y="${1812 - h / 2 - 12}" width="${l - 20}" height="22" fill="#fff6e8" opacity=".85"/></g>`; x += l + 6; });
      return `<g style="filter:drop-shadow(5px 6px 0 #00000066)">${livres}<rect x="0" y="1812" width="1080" height="108" fill="#8a4a2f"/><rect x="0" y="1812" width="1080" height="14" fill="#a65e3a"/>
        <g class="souris"><path d="M590 1796 C 630 1796 650 1770 690 1780" fill="none" stroke="#d9a5a0" stroke-width="6" stroke-linecap="round"/><ellipse cx="540" cy="1790" rx="46" ry="24" fill="#b9b3c2"/><ellipse cx="506" cy="1780" rx="22" ry="17" fill="#cfc9d8"/><circle cx="512" cy="1764" r="10" fill="#e8a9b0"/><circle cx="492" cy="1778" r="3" fill="#2a1a14"/><circle cx="486" cy="1786" r="4" fill="#e8a9b0"/><rect x="520" y="1806" width="8" height="8" fill="#8f889c"/><rect x="556" y="1806" width="8" height="8" fill="#8f889c"/></g>
        <g class="avion"><path d="M0 0 L80 -16 L24 10Z" fill="#fff6e8"/><path d="M0 0 L80 -16 L36 -2Z" fill="#e7dcc4"/><path d="M24 10 L36 -2 L34 16Z" fill="#cfc3a8"/></g>
        <g><rect x="620" y="1720" width="300" height="42" fill="#c46bff"/><rect x="636" y="1678" width="270" height="42" fill="#4fd1c5"/><rect x="610" y="1636" width="290" height="42" fill="#ffd45c"/></g>
        <g><rect x="930" y="1700" width="92" height="112" rx="14" fill="#2a1a14"/><rect x="946" y="1684" width="60" height="24" rx="8" fill="#4a2f22"/>
        <g class="plume" style="transform-origin:976px 1690px"><path d="M976 1690 C 1010 1600 1050 1560 1068 1480 C 1020 1520 990 1580 976 1690Z" fill="#fff6e8"/><path d="M976 1690 C 1006 1610 1038 1570 1068 1480" fill="none" stroke="#e8b84a" stroke-width="4"/></g></g></g>`;
    })(),
  };

  const PLAGE = {
    titre: '#ffffff',
    fond: `<rect x="0" y="0" width="1080" height="1920" fill="#4cb8ea"/><rect x="0" y="0" width="1080" height="560" fill="#7fd0f2" opacity=".6"/>
      <g class="soleil" style="transform-origin:900px 160px"><circle cx="900" cy="160" r="150" fill="#ffe27a" opacity=".35"/><circle cx="900" cy="160" r="96" fill="#ffd45c"/><circle cx="900" cy="160" r="70" fill="#ffe9a0"/></g>
      <g transform="translate(0 -110)" style="filter:drop-shadow(0 8px 0 #00000026)"><g fill="#fff" class="nuage" data-d="1"><ellipse cx="240" cy="250" rx="110" ry="34"/><circle cx="200" cy="228" r="36"/><circle cx="270" cy="220" r="44"/></g><g fill="#fff" class="nuage" data-d="-1"><ellipse cx="640" cy="236" rx="96" ry="26"/><circle cx="610" cy="220" r="30"/><circle cx="670" cy="214" r="36"/></g></g>
      ${onde(640, 46, 1, '#2fc4c8')}${onde(960, 52, 1, '#1aa3b5')}${onde(1290, 46, 1, '#0f8aa6')}
      <path d="M-40 1560 C 200 1500 420 1600 640 1545 S 940 1510 1120 1560 V1920 H-40Z" fill="#f5d89a"/><path d="M-40 1700 C 220 1650 440 1730 660 1690 S 960 1660 1120 1700 V1920 H-40Z" fill="#e9c37d"/>`,
    bas: `<g style="filter:drop-shadow(5px 6px 0 #00000055)"><g transform="translate(0 180)">
      <ellipse cx="860" cy="1640" rx="250" ry="60" fill="#e9c37d"/><ellipse cx="860" cy="1625" rx="210" ry="44" fill="#f5d89a"/>
      <path d="M850 1630 C 840 1560 870 1500 900 1440" fill="none" stroke="#8a5a3c" stroke-width="22" stroke-linecap="round"/>
      <path d="M900 1440 C 840 1400 800 1420 770 1470 C 820 1440 860 1440 900 1440Z" fill="#2e9e5b"/><path d="M900 1440 C 950 1380 1010 1390 1040 1440 C 990 1410 940 1420 900 1440Z" fill="#3fbf6e"/><path d="M900 1440 C 880 1380 900 1340 940 1320 C 930 1370 920 1400 900 1440Z" fill="#2e9e5b"/><path d="M900 1440 C 800 1350 740 1360 700 1400 C 770 1390 840 1400 900 1440Z" fill="#3fbf6e"/><path d="M900 1440 C 990 1340 1050 1350 1075 1395 C 1010 1380 950 1400 900 1440Z" fill="#2e9e5b"/>
      <circle cx="880" cy="1452" r="14" fill="#6b3f26"/><circle cx="906" cy="1458" r="14" fill="#6b3f26"/>
      <g><rect x="110" y="1700" width="250" height="26" rx="6" fill="#4fd1c5"/><rect x="110" y="1700" width="250" height="8" fill="#ffffff66"/><rect x="226" y="1470" width="9" height="236" fill="#8a5a3c"/><path d="M90 1520 C 100 1420 340 1420 370 1520Z" fill="#ff5d7a"/><path d="M170 1450 C 165 1480 160 1500 150 1520 L 205 1520 C 198 1490 196 1470 196 1440Z M290 1440 C 290 1470 296 1490 304 1520 L 355 1520 C 345 1490 335 1460 322 1450Z" fill="#fff6e8" opacity=".9"/><path d="M90 1520 q35 24 70 0 q35 24 70 0 q35 24 70 0 q35 24 70 0" fill="#ff5d7a"/></g></g>
      <g transform="translate(390 1850) scale(.8)"><path d="M0 -40 l14 36 38 4 -30 26 10 38 -32 -20 -32 20 10 -38 -30 -26 38 -4z" fill="#ff7a5c"/></g>
      <g transform="translate(470 1900)"><path d="M0 0 q60 -90 120 0z" fill="#ffd9c2"/><path d="M60 0 l-40 -70 M60 0 l0 -76 M60 0 l40 -70" stroke="#e8a58a" stroke-width="5" fill="none"/></g>
      <g class="crabe"><g transform="translate(-150 20)"><ellipse cx="800" cy="1830" rx="48" ry="30" fill="#e84a3a"/><circle cx="780" cy="1802" r="9" fill="#fff"/><circle cx="820" cy="1802" r="9" fill="#fff"/><path d="M752 1818 l-30 -26 M848 1818 l30 -26" stroke="#e84a3a" stroke-width="9" stroke-linecap="round"/></g></g>
      <g class="dauphin"><path d="M-110 0 C -70 -34 0 -40 60 -10 C 90 4 106 -6 126 -34 C 130 -4 126 14 104 24 C 80 30 60 28 40 20 C -10 28 -70 24 -110 0Z" fill="#6b8fb5"/><path d="M-20 -28 L -4 -62 L 8 -26Z" fill="#587aa0"/><path d="M-30 12 L -46 44 L -6 20Z" fill="#587aa0"/><path d="M-100 4 C -50 18 0 22 60 22 C 30 14 -30 14 -100 4Z" fill="#dbe8f2"/><path d="M-126 6 C -108 -4 -96 -10 -84 -12 L -84 12 C -98 14 -114 12 -126 6Z" fill="#6b8fb5"/><circle cx="-80" cy="-6" r="3.5" fill="#1d2a38"/></g>
      <g class="eclaboussure"><circle cx="-22" cy="0" r="8" fill="#fff"/><circle cx="0" cy="-14" r="10" fill="#fff"/><circle cx="24" cy="-2" r="7" fill="#fff"/><circle cx="-8" cy="8" r="5" fill="#fff"/></g><g class="eclaboussure"><circle cx="-22" cy="0" r="8" fill="#fff"/><circle cx="0" cy="-14" r="10" fill="#fff"/><circle cx="24" cy="-2" r="7" fill="#fff"/><circle cx="-8" cy="8" r="5" fill="#fff"/></g></g>`,
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

  // --- L'ambiance animée (côté page) : tout est fini et déterministe. c = contexte du lecteur (c.ft = fromTo), el = le plan, d = durée du plan. -----------------------
  function animer(c, el, nom, t0, d) {
    const qa = (s) => [...el.querySelectorAll(s)], q = (s) => el.querySelector(s);
    qa('.vague').forEach((v, i) => { const T = [6, 7.5, 9, 6.5][i % 4]; gsap.set(v, { x: 0 }); const n = Math.ceil(d / (T / 2)) + 1, ax = [34, 46, 58, 40][i % 4], ay = 9;
      for (let k = 0; k < n; k += 1) c.ft(v, { x: k % 2 ? ax : -ax, y: k % 2 ? ay : -ay }, { x: k % 2 ? -ax : ax, y: k % 2 ? -ay : ay, duration: T / 2, ease: 'sine.inOut' }, t0 + k * T / 2);
      gsap.set(v, { x: -ax, y: -ay }); });
    const soleil = q('.soleil');
    if (soleil) { gsap.set(soleil, { svgOrigin: soleil.dataset.o || '900 160' }); for (let u = 0; u + 3 <= d; u += 3) { c.ft(soleil, { scale: 1 }, { scale: 1.07, duration: 1.5, ease: 'sine.inOut' }, t0 + u); c.ft(soleil, { scale: 1.07 }, { scale: 1, duration: 1.5, ease: 'sine.inOut' }, t0 + u + 1.5); } }
    qa('.nuage').forEach((n) => { const s = +n.dataset.d || 1; gsap.set(n, { x: -60 * s }); c.ft(n, { x: -60 * s }, { x: 60 * s, duration: d, ease: 'none' }, t0); });
    if (q('.plume')) gsap.set(q('.plume'), { svgOrigin: '976 1690' });

    // Un passage : un groupe qui traverse l'écran de part en part (hors champ avant et après), avec un petit rebond de marche.
    const traverse = (g, passages, de, vers, duree, pas, bond) => {
      gsap.set(g, { x: de });
      passages.forEach(([t, sens]) => {
        if (t + duree + 0.5 > d) return;
        const a = sens > 0 ? de : vers, b = sens > 0 ? vers : de;
        c.ft(g, { x: a }, { x: b, duration: duree, ease: 'none' }, t0 + t);
        for (let k = 0; k < Math.floor(duree / pas); k += 1) { c.ft(g, { y: 0 }, { y: -bond, duration: pas / 2, ease: 'sine.out' }, t0 + t + k * pas); c.ft(g, { y: -bond }, { y: 0, duration: pas / 2, ease: 'sine.in' }, t0 + t + k * pas + pas / 2); }
      });
    };
    const crabe = q('.crabe');
    if (crabe) traverse(crabe, [[10, -1], [38, 1]], 620, -800, 9, 0.5, 6);
    const souris = q('.souris');
    if (souris) traverse(souris, [[12, -1], [36, 1]], 640, -760, 7, 0.28, 4);

    // Le dauphin : un arc de 2 s dans la voie de mer, sorti de derrière la bande de papier, museau haut puis museau bas, avec deux éclaboussures.
    const dauphin = q('.dauphin'), eclab = qa('.eclaboussure');
    if (dauphin) {
      gsap.set(dauphin, { x: 0, y: 2400, transformOrigin: '50% 50%' }); eclab.forEach((e) => gsap.set(e, { opacity: 0, x: 0, y: 2400 }));
      [[5, 1], [18, -1], [29, 1], [47, -1]].forEach(([t, s]) => {
        if (t + 2.5 > d) return;
        const x0 = s > 0 ? 130 : 950, x1 = s > 0 ? 480 : 600, T = t0 + t;
        c.ft(dauphin, { scaleX: s, x: x0, y: 1500, rotation: -38 * s }, { scaleX: s, x: x0, y: 1500, rotation: -38 * s, duration: 0.001 }, T - 0.002);
        c.ft(dauphin, { x: x0 }, { x: x1, duration: 2, ease: 'none' }, T);
        c.ft(dauphin, { y: 1500 }, { y: 1285, duration: 1, ease: 'power2.out' }, T);
        c.ft(dauphin, { y: 1285 }, { y: 1500, duration: 1, ease: 'power2.in' }, T + 1);
        c.ft(dauphin, { rotation: -38 * s }, { rotation: 38 * s, duration: 2, ease: 'sine.inOut' }, T);
        c.ft(dauphin, { y: 1500 }, { y: 2400, duration: 0.001 }, T + 2.01);
        [[0.16, x0 + (x1 - x0) * 0.08], [1.84, x0 + (x1 - x0) * 0.92]].forEach(([dt, ex], i) => {
          c.ft(eclab[i], { opacity: 0, x: ex, y: 1428, scale: 0.3 }, { opacity: 1, scale: 1.2, duration: 0.25, ease: 'power2.out' }, T + dt);
          c.ft(eclab[i], { opacity: 1 }, { opacity: 0, duration: 0.4 }, T + dt + 0.25);
        });
      });
    }
    // Les livres qui sautent de la rangée, la bascule autour du pied du livre.
    qa('.livre-saut').forEach((l) => gsap.set(l, { transformOrigin: '50% 100%' }));
    [[7, 1], [21, 3], [33, 4], [45, 6]].forEach(([t, k]) => {
      const l = q(`.livre-saut[data-k="${k}"]`); if (!l || t + 1 > d) return;
      c.ft(l, { y: 0, rotation: 0 }, { y: -70, rotation: -6, duration: 0.35, ease: 'power2.out' }, t0 + t);
      c.ft(l, { y: -70, rotation: -6 }, { y: 0, rotation: 0, duration: 0.35, ease: 'power2.in' }, t0 + t + 0.35);
    });
    // L'avion en papier traverse le bas de l'écran, au-dessus des livres, sous la barre.
    const avion = q('.avion');
    if (avion) { gsap.set(avion, { x: -200, y: 1640 }); [16, 41].forEach((t) => { if (t + 6.5 > d) return; c.ft(avion, { x: -200 }, { x: 1280, duration: 6, ease: 'none' }, t0 + t); [1640, 1610, 1650, 1615, 1640].forEach((y, k, tab) => { if (k) c.ft(avion, { y: tab[k - 1], rotation: k % 2 ? -8 : 8 }, { y, rotation: k % 2 ? 8 : -8, duration: 1.5, ease: 'sine.inOut' }, t0 + t + (k - 1) * 1.5); }); }); }
  }

  const DEGRADE = {
    titre: '#ffffff',
    fond: `<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d28d9"/><stop offset=".45" stop-color="#2a0f5c"/><stop offset="1" stop-color="#050308"/></linearGradient><radialGradient id="dg2" cx=".5" cy=".3" r=".6"><stop offset="0" stop-color="#a855f7" stop-opacity=".35"/><stop offset="1" stop-color="#a855f7" stop-opacity="0"/></radialGradient></defs><rect width="1080" height="1920" fill="url(#dg)"/><rect width="1080" height="1920" fill="url(#dg2)"/>`,
    bas: '',
  };

  // --- Le bonhomme qui danse (jeu progressif) : en bas de l'écran, de plus en plus de fête quand les mots deviennent difficiles. ---------------------------------
  const note = (x, y, col) => `<g class="note" data-x="${x}" data-y="${y}" opacity="0"><ellipse cx="0" cy="0" rx="13" ry="10" fill="${col}" transform="rotate(-20)"/><path d="M11 -3 V-48 C 24 -42 32 -34 28 -22" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round"/></g>`;
  const CONF = ['#ffd45c', '#ff7a5c', '#4fd1c5', '#c46bff', '#ffffff'];
  function danse() {
    const confettis = Array.from({ length: 14 }, (_, i) => `<rect class="confetti" data-i="${i}" x="${70 + i * 70}" y="0" width="14" height="22" rx="3" fill="${CONF[i % 5]}" opacity="0"/>`).join('');
    const notes = [[300, 330, '#ffd45c'], [780, 300, '#4fd1c5'], [420, 280, '#ff7a5c'], [660, 340, '#c46bff']].map((n) => note(...n)).join('');
    const faisceaux = ['#c46bff', '#4fd1c5', '#ffd45c', '#ff7a5c'].map((c2, i) => `<path class="faisceau" data-i="${i}" d="M540 70 L${140 + i * 270} 400 L${230 + i * 270} 400Z" fill="${c2}" opacity="0"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420">
      <ellipse class="sol" cx="540" cy="404" rx="250" ry="26" fill="#c46bff" opacity=".35"/>
      <path class="spot" d="M470 0 L610 0 L760 410 L320 410Z" fill="#ffffff" opacity="0"/>${faisceaux}
      <g class="boule" opacity="0"><path d="M540 -60 V30" stroke="#ffffff88" stroke-width="3"/><circle cx="540" cy="70" r="42" fill="#d9d9e8"/><path d="M500 60 H580 M500 80 H580 M524 30 V108 M556 30 V108" stroke="#8f8fb0" stroke-width="2.5"/></g>
      ${notes}
      <g transform="translate(540 400)"><g class="dn">
        <g class="jg"><rect x="-34" y="-120" width="24" height="120" rx="12" fill="#4fd1c5"/><ellipse cx="-24" cy="0" rx="22" ry="9" fill="#2a1a14"/></g>
        <g class="jd"><rect x="10" y="-120" width="24" height="120" rx="12" fill="#4fd1c5"/><ellipse cx="24" cy="0" rx="22" ry="9" fill="#2a1a14"/></g>
        <rect x="-46" y="-236" width="92" height="132" rx="34" fill="#ffd45c"/>
        <g class="bg"><rect x="-68" y="-222" width="24" height="108" rx="12" fill="#ffd45c"/><circle cx="-56" cy="-112" r="13" fill="#f2c9a0"/></g>
        <g class="bd"><rect x="44" y="-222" width="24" height="108" rx="12" fill="#ffd45c"/><circle cx="56" cy="-112" r="13" fill="#f2c9a0"/></g>
        <g class="tete"><circle cx="0" cy="-282" r="44" fill="#f2c9a0"/><path d="M-46 -286 C-46 -332 46 -332 46 -286 C 30 -306 -30 -306 -46 -286Z" fill="#2a1a14"/>
          <circle cx="-15" cy="-278" r="5" fill="#2a1a14"/><circle cx="15" cy="-278" r="5" fill="#2a1a14"/><path d="M-16 -262 Q0 -246 16 -262" fill="none" stroke="#2a1a14" stroke-width="4" stroke-linecap="round"/></g>
        <g class="lunettes" opacity="0"><rect x="-32" y="-292" width="28" height="16" rx="5" fill="#111"/><rect x="4" y="-292" width="28" height="16" rx="5" fill="#111"/><rect x="-6" y="-288" width="12" height="4" fill="#111"/></g>
      </g></g>${confettis}</svg>`;
  }
  // Niveau de difficulté d'un mot : 0 (facile) ; 1 (milieu) ; 2 (le dernier). Rythme : le tempo de la musique ; plus c'est dur, plus ça bat vite et fort.
  function danser(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], N = p.mots.length, mu = p.muetCfg || {};
    const niv = (k) => (k === 0 ? 0 : k >= N - 1 ? 2 : 1), debut = (k) => t0 + p.mots[k].indice.t + (mu && k ? 0.6 : 0);
    const k1 = Math.min(1, N - 1), k2 = N - 1, T1 = debut(k1), T2 = debut(k2);
    const niveauA = (t) => (t >= T2 ? 2 : t >= T1 ? 1 : 0), beat = 60 / (mu.tempo || 90);
    const dn = q('.dn'), bg = q('.bg'), bd = q('.bd'), jg = q('.jg'), jd = q('.jd'), tete = q('.tete');
    gsap.set(dn, { svgOrigin: '0 0' }); gsap.set(bg, { svgOrigin: '-56 -214' }); gsap.set(bd, { svgOrigin: '56 -214' }); gsap.set(jg, { svgOrigin: '-22 -118' }); gsap.set(jd, { svgOrigin: '22 -118' }); gsap.set(tete, { svgOrigin: '0 -240' });
    let t = t0, i = 0, r = 0, ag = 0, ad = 0;
    const fin = t0 + d;
    while (t + 0.2 < fin) {
      const L = niveauA(t), P = L === 0 ? beat : beat / 2, s = i % 2 ? 1 : -1, h = [14, 26, 44][L], rot = [4, 7, 10][L], bras = [28, 75, 150][L];
      const ease = 'sine.inOut';
      c.ft(dn, { y: 0 }, { y: -h, duration: P / 2, ease: 'sine.out' }, t); c.ft(dn, { y: -h }, { y: 0, duration: P / 2, ease: 'sine.in' }, t + P / 2);
      c.ft(dn, { rotation: r }, { rotation: s * rot, duration: P, ease }, t);
      c.ft(bg, { rotation: ag }, { rotation: s * bras, duration: P, ease }, t); c.ft(bd, { rotation: ad }, { rotation: s * bras, duration: P, ease }, t);
      c.ft(jg, { rotation: 0 }, { rotation: 0, duration: P }, t);
      c.ft(tete, { rotation: -r }, { rotation: -s * rot * 1.2, duration: P, ease }, t);
      r = s * rot; ag = s * bras; ad = s * bras; t += P; i += 1;
    }
    // Niveau 1 : le projecteur, les notes de musique. Niveau 2 : lunettes, boule à facettes, faisceaux colorés, confettis.
    c.ft(q('.spot'), { opacity: 0 }, { opacity: 0.16, duration: 0.8 }, T1);
    c.ft(q('.sol'), { opacity: 0.35 }, { opacity: 0.7, duration: 0.8 }, T1);
    qa('.note').forEach((n, j) => {
      const x = +n.dataset.x, y = +n.dataset.y, dur = 2.4;
      for (let u = T1 + j * 0.6, m = 0; u + dur < fin; u += dur, m += 1) {
        c.ft(n, { opacity: 0, x, y, rotation: -10 }, { opacity: 0.95, duration: 0.3 }, u);
        c.ft(n, { y }, { y: y - 230, rotation: 12, duration: dur, ease: 'sine.out' }, u);
        c.ft(n, { opacity: 0.95 }, { opacity: 0, duration: 0.5 }, u + dur - 0.5);
      }
    });
    c.ft(q('.lunettes'), { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, T2);
    c.ft(q('.boule'), { opacity: 0, y: -200 }, { opacity: 1, y: 0, duration: 0.7, ease: 'bounce.out' }, T2);
    c.ft(q('.sol'), { opacity: 0.7 }, { opacity: 1, duration: 0.5 }, T2);
    gsap.set(q('.boule'), { opacity: 0 });
    qa('.faisceau').forEach((f, j) => { for (let u = T2 + 0.4, m = 0; u + 0.6 < fin; u += 0.6, m += 1) c.ft(f, { opacity: (m + j) % 2 ? 0.5 : 0.05 }, { opacity: (m + j) % 2 ? 0.05 : 0.5, duration: 0.6, ease: 'sine.inOut' }, u); });
    qa('.confetti').forEach((f, j) => { const dur = 2.2; for (let u = T2 + 0.5 + (j % 7) * 0.31, m = 0; u + dur < fin; u += dur, m += 1) {
      c.ft(f, { opacity: 0, y: 0, rotation: 0 }, { opacity: 1, duration: 0.1 }, u);
      c.ft(f, { y: 0 }, { y: 400, duration: dur, ease: 'none' }, u);
      c.ft(f, { rotation: 0 }, { rotation: 360 * (j % 2 ? 1 : -1), duration: dur, ease: 'none' }, u);
      c.ft(f, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); } });
  }
  const DECORS = { degrade: DEGRADE, livres: LIVRES, plage: PLAGE, 'plage-affiche': AFFICHE, 'plage-geo': GEO, 'plage-carte': CARTE, 'plage-crepuscule': CREPUSCULE, 'livres-bureau': BUREAU, 'livres-biblio': BIBLIO };
  const decor = (nom) => DECORS[nom] || DECORS.livres;
  return { decor, DECORS, animer, danse, danser };
});
