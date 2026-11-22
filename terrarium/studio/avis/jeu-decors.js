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

  // --- Le bonhomme qui danse (jeu progressif) : en bas de l'écran, de plus en plus chaud quand les mots deviennent difficiles : la scène finit en flammes. ---------
  function danse() {
    const flamme = (x, h, i) => `<g class="flamme" data-i="${i}" opacity="0"><path d="M${x - 46} 414 C ${x - 60} 340 ${x - 10} 320 ${x - 6} ${414 - h} C ${x + 14} ${414 - h * 0.55} ${x + 62} 350 ${x + 46} 414Z" fill="#ff4d2e"/><path d="M${x - 24} 414 C ${x - 30} 372 ${x - 2} 362 ${x} ${414 - h * 0.62} C ${x + 10} 370 ${x + 32} 380 ${x + 24} 414Z" fill="#ffb43c"/></g>`;
    const flammes = [[60, 190], [190, 250], [330, 170], [750, 175], [890, 255], [1020, 195], [470, 120], [610, 120]].map((f, i) => flamme(f[0], f[1], i)).join('');
    const braises = Array.from({ length: 12 }, (_, i) => `<circle class="braise" data-i="${i}" cx="${60 + i * 87}" cy="400" r="${4 + (i % 3) * 2}" fill="${i % 2 ? '#ffb43c' : '#ff6a3c'}" opacity="0"/>`).join('');
    const gouttes = [[-30, -310], [32, -306]].map(([x, y], i) => `<path class="goutte" data-i="${i}" d="M${x} ${y} C ${x - 9} ${y + 16} ${x - 9} ${y + 24} ${x} ${y + 24} C ${x + 9} ${y + 24} ${x + 9} ${y + 16} ${x} ${y}Z" fill="#8fd8ff" opacity="0"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420">
      <ellipse class="sol" cx="540" cy="404" rx="250" ry="26" fill="#c46bff" opacity=".35"/>
      <path class="spot" d="M470 0 L610 0 L760 410 L320 410Z" fill="#ff9a5c" opacity="0"/>
      <defs><linearGradient id="chg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4d2e" stop-opacity="0"/><stop offset="1" stop-color="#ff4d2e"/></linearGradient></defs><rect class="chaleur" x="0" y="100" width="1080" height="320" fill="url(#chg)" opacity="0"/>
      ${flammes}
      <g transform="translate(540 400)"><g class="dn">
        <g class="jg"><rect x="-34" y="-120" width="24" height="120" rx="12" fill="#4fd1c5"/><ellipse cx="-24" cy="0" rx="22" ry="9" fill="#2a1a14"/></g>
        <g class="jd"><rect x="10" y="-120" width="24" height="120" rx="12" fill="#4fd1c5"/><ellipse cx="24" cy="0" rx="22" ry="9" fill="#2a1a14"/></g>
        <rect x="-46" y="-236" width="92" height="132" rx="34" fill="#ffd45c"/>
        <g class="bg"><rect x="-68" y="-222" width="24" height="108" rx="12" fill="#ffd45c"/><circle cx="-56" cy="-112" r="13" fill="#f2c9a0"/></g>
        <g class="bd"><rect x="44" y="-222" width="24" height="108" rx="12" fill="#ffd45c"/><circle cx="56" cy="-112" r="13" fill="#f2c9a0"/></g>
        <g class="tete"><circle cx="0" cy="-282" r="44" fill="#f2c9a0"/><path d="M-46 -286 C-46 -332 46 -332 46 -286 C 30 -306 -30 -306 -46 -286Z" fill="#2a1a14"/>
          <circle cx="-15" cy="-278" r="5" fill="#2a1a14"/><circle cx="15" cy="-278" r="5" fill="#2a1a14"/><path d="M-16 -262 Q0 -246 16 -262" fill="none" stroke="#2a1a14" stroke-width="4" stroke-linecap="round"/></g>
        <g class="lunettes" opacity="0"><rect x="-32" y="-292" width="28" height="16" rx="5" fill="#111"/><rect x="4" y="-292" width="28" height="16" rx="5" fill="#111"/><rect x="-6" y="-288" width="12" height="4" fill="#111"/></g>
        ${gouttes}
      </g></g>${braises}</svg>`;
  }
  // Niveau de difficulté d'un mot : 0 (facile) ; 1 (milieu : il transpire, ça chauffe) ; 2 (le dernier : la scène s'enflamme). Le rythme suit le tempo de la musique.
  function danser(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], N = p.mots.length, mu = p.muetCfg || {};
    const debut = (k) => t0 + p.mots[k].indice.t + (mu && k ? 0.6 : 0);
    const T1 = debut(Math.min(1, N - 1)), T2 = debut(N - 1);
    const niveauA = (t) => (t >= T2 ? 2 : t >= T1 ? 1 : 0), beat = 60 / (mu.tempo || 90);
    const dn = q('.dn'), bg = q('.bg'), bd = q('.bd'), jg = q('.jg'), jd = q('.jd'), tete = q('.tete');
    gsap.set(dn, { svgOrigin: '0 0' }); gsap.set(bg, { svgOrigin: '-56 -214' }); gsap.set(bd, { svgOrigin: '56 -214' }); gsap.set(jg, { svgOrigin: '-22 -118' }); gsap.set(jd, { svgOrigin: '22 -118' }); gsap.set(tete, { svgOrigin: '0 -240' });
    let t = t0, i = 0, r = 0, ag = 0, ad = 0;
    const fin = t0 + d, tc = tFinale(p, t0);
    while (t + 0.2 < Math.min(fin, tc)) {
      const L = niveauA(t), P = L === 0 ? beat : beat / 2, s = i % 2 ? 1 : -1, h = [14, 26, 44][L], rot = [4, 7, 10][L], bras = [28, 75, 150][L], ease = 'sine.inOut';
      c.ft(dn, { y: 0 }, { y: -h, duration: P / 2, ease: 'sine.out' }, t); c.ft(dn, { y: -h }, { y: 0, duration: P / 2, ease: 'sine.in' }, t + P / 2);
      c.ft(dn, { rotation: r }, { rotation: s * rot, duration: P, ease }, t);
      c.ft(bg, { rotation: ag }, { rotation: s * bras, duration: P, ease }, t); c.ft(bd, { rotation: ad }, { rotation: s * bras, duration: P, ease }, t);
      c.ft(tete, { rotation: -r }, { rotation: -s * rot * 1.2, duration: P, ease }, t);
      r = s * rot; ag = s * bras; ad = s * bras; t += P; i += 1;
    }
    // Niveau 1 : le sol et le projecteur virent à l'orange, des gouttes de sueur coulent du front.
    c.ft(q('.spot'), { opacity: 0 }, { opacity: 0.2, duration: 0.8 }, T1);
    c.ft(q('.sol'), { opacity: 0.35, fill: '#c46bff' }, { opacity: 0.7, fill: '#ff9a5c', duration: 0.8 }, T1);
    qa('.goutte').forEach((g, j) => { const dur = 1.1; for (let u = T1 + 0.4 + j * 0.55; u + dur < fin; u += dur) {
      c.ft(g, { opacity: 0, y: 0 }, { opacity: 0.95, duration: 0.15 }, u); c.ft(g, { y: 0 }, { y: 70, duration: dur, ease: 'power1.in' }, u); c.ft(g, { opacity: 0.95 }, { opacity: 0, duration: 0.25 }, u + dur - 0.25); } });
    // Niveau 2 : lunettes, la chaleur rougit le fond, les flammes montent des deux côtés et ondulent, des braises s'envolent.
    c.ft(q('.lunettes'), { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.3, ease: 'back.out(2)' }, T2);
    c.ft(q('.sol'), { fill: '#ff9a5c' }, { fill: '#ff4d2e', opacity: 1, duration: 0.6 }, T2);
    c.ft(q('.chaleur'), { opacity: 0 }, { opacity: 0.55, duration: 1 }, T2);
    qa('.flamme').forEach((f, j) => {
      const x = j % 2 ? 1 : -1;
      gsap.set(f, { svgOrigin: `${[60, 190, 330, 750, 890, 1020, 470, 610][j]} 414`, scaleY: 0, scaleX: 1 });
      c.ft(f, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 1, duration: 0.7, ease: 'back.out(1.6)' }, T2 + 0.15 + j * 0.12);
      let u = T2 + 1.1 + j * 0.12, a = true;
      while (u + 0.4 < Math.min(fin, tc)) { c.ft(f, { scaleY: a ? 1 : 0.78, scaleX: a ? 1 : 1.08, skewX: a ? -4 * x : 4 * x }, { scaleY: a ? 0.78 : 1, scaleX: a ? 1.08 : 1, skewX: a ? 4 * x : -4 * x, duration: 0.4, ease: 'sine.inOut' }, u); u += 0.4; a = !a; }
    });
    // Finale : il saute très haut les bras en l'air, les flammes montent, la chaleur explose ; puis il continue de danser dans le feu.
    c.ft(dn, { y: 0 }, { y: -200, duration: 0.55, ease: 'power2.out' }, tc); c.ft(dn, { y: -200 }, { y: 0, duration: 0.55, ease: 'bounce.out' }, tc + 0.55);
    c.ft(bg, { rotation: ag }, { rotation: -165, duration: 0.4, ease: 'power2.out' }, tc); c.ft(bd, { rotation: ad }, { rotation: 165, duration: 0.4, ease: 'power2.out' }, tc);
    c.ft(q('.chaleur'), { opacity: 0.55 }, { opacity: 0.95, duration: 0.6 }, tc);
    qa('.flamme').forEach((f, j) => { c.ft(f, { scaleY: 1, scaleX: 1, skewX: 0 }, { scaleY: 1.9, scaleX: 1.15, duration: 0.5, ease: 'power2.out' }, tc);
      for (let u = tc + 0.6, a = true; u + 0.35 < fin; u += 0.35, a = !a) c.ft(f, { scaleY: a ? 1.9 : 1.6 }, { scaleY: a ? 1.6 : 1.9, duration: 0.35, ease: 'sine.inOut' }, u); });
    for (let u = tc + 1.1, a = true; u + 0.25 < fin; u += 0.25, a = !a) { c.ft(dn, { y: 0 }, { y: -30, duration: 0.125, ease: 'sine.out' }, u); c.ft(dn, { y: -30 }, { y: 0, duration: 0.125, ease: 'sine.in' }, u + 0.125); c.ft(bg, { rotation: a ? -165 : -135 }, { rotation: a ? -135 : -165, duration: 0.25 }, u); c.ft(bd, { rotation: a ? 165 : 135 }, { rotation: a ? 135 : 165, duration: 0.25 }, u); }
    qa('.braise').forEach((b, j) => { const dur = 1.8; for (let u = T2 + 0.6 + (j % 6) * 0.3, m = 0; u + dur < fin; u += dur, m += 1) {
      c.ft(b, { opacity: 0, y: 0, x: 0 }, { opacity: 1, duration: 0.15 }, u); c.ft(b, { y: 0 }, { y: -330 - (j % 4) * 40, duration: dur, ease: 'power1.out' }, u);
      c.ft(b, { x: 0 }, { x: (j % 2 ? 40 : -40), duration: dur, ease: 'sine.inOut' }, u); c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.4 }, u + dur - 0.4); } });
  }

  // --- La fusée (jeu progressif, variante) : au sol, elle s'allume quand les mots durcissent, puis décolle dans un défilé d'étoiles. ---
  function fusee() {
    const fumees = Array.from({ length: 12 }, (_, i) => `<circle class="fumee" data-i="${i}" cx="${i % 2 ? 40 : -40}" cy="-14" r="26" fill="#e8ecf5" opacity="0"/>`).join('');
    const traits = Array.from({ length: 12 }, (_, i) => `<rect class="trait" data-i="${i}" x="${50 + i * 87}" y="-80" width="5" height="${70 + (i % 3) * 30}" rx="2.5" fill="#bfeaff" opacity="0"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420">${traits}
      <ellipse cx="540" cy="412" rx="230" ry="14" fill="#4fd1c5" opacity=".3"/>
      <g transform="translate(540 410)">${fumees}
        <g class="fu">
          <g class="flam" opacity="0"><path d="M-30 -34 C -46 40 -14 110 0 190 C 14 110 46 40 30 -34Z" fill="#ff8a3c"/><path d="M-16 -34 C -22 20 -6 60 0 110 C 6 60 22 20 16 -34Z" fill="#ffe27a"/></g>
          <path d="M-44 -130 L-98 -44 L-44 -66Z" fill="#ff4d5e"/><path d="M44 -130 L98 -44 L44 -66Z" fill="#ff4d5e"/>
          <path d="M0 -340 C 64 -280 66 -130 46 -62 L-46 -62 C -66 -130 -64 -280 0 -340Z" fill="#f4f4fa"/>
          <path d="M0 -340 C 30 -310 42 -282 48 -262 L-48 -262 C -42 -282 -30 -310 0 -340Z" fill="#ff4d5e"/>
          <path d="M-46 -62 L46 -62 L40 -34 L-40 -34Z" fill="#8f8fb0"/>
          <circle cx="0" cy="-196" r="30" fill="#4fd1c5"/><circle cx="0" cy="-196" r="22" fill="#14233a"/><path d="M-12 -206 Q-4 -214 6 -210" fill="none" stroke="#ffffff99" stroke-width="4" stroke-linecap="round"/>
          <rect x="-46" y="-108" width="92" height="10" fill="#ff4d5e" opacity=".85"/>
        </g></g></svg>`;
  }
  function fuser(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], N = p.mots.length, mu = p.muetCfg || {};
    const debut = (k) => t0 + p.mots[k].indice.t + (mu && k ? 0.6 : 0), T1 = debut(Math.min(1, N - 1)), T2 = debut(N - 1), fin = t0 + d, tc = tFinale(p, t0);
    const fu = q('.fu'), fl = q('.flam');
    gsap.set(fu, { svgOrigin: '0 0' }); gsap.set(fl, { svgOrigin: '0 -34', scaleY: 0 }); gsap.set(qa('.trait'), { opacity: 0 });
    // Au sol : un léger balancement ; allumage au niveau 1 (tremblements), décollage au niveau 2 (elle monte, vibre fort).
    for (let u = t0, a = true; u + 1.2 < Math.min(T1, fin); u += 1.2, a = !a) c.ft(fu, { rotation: a ? -1.2 : 1.2 }, { rotation: a ? 1.2 : -1.2, duration: 1.2, ease: 'sine.inOut' }, u);
    c.ft(fl, { opacity: 0, scaleY: 0 }, { opacity: 1, scaleY: 0.5, duration: 0.5, ease: 'power2.out' }, T1);
    c.ft(fu, { y: 0 }, { y: -70, duration: 1.1, ease: 'power2.out' }, T2);
    c.ft(fl, { scaleY: 0.5 }, { scaleY: 1.15, duration: 0.6, ease: 'power2.out' }, T2);
    for (let u = T1 + 0.5, a = true; u + 0.07 < Math.min(fin, tc); u += 0.07, a = !a) {
      const amp = u >= T2 ? 6 : 2.5, h = u >= T2 ? 1.15 : 0.5;
      c.ft(fu, { x: a ? -amp : amp, rotation: 0 }, { x: a ? amp : -amp, duration: 0.07, ease: 'none' }, u);
      c.ft(fl, { scaleY: a ? h : h * 0.8, scaleX: a ? 1 : 0.88 }, { scaleY: a ? h * 0.8 : h, scaleX: a ? 0.88 : 1, duration: 0.07, ease: 'none' }, u);
    }
    // Finale : un dernier grondement puis elle décolle pour de bon et sort de l'écran par le haut, la flamme géante derrière elle.
    c.ft(fl, { scaleY: 1.15 }, { scaleY: 1.9, duration: 0.5, ease: 'power2.out' }, tc);
    c.ft(fu, { y: -70, x: 0 }, { y: -2300, duration: 2.3, ease: 'power2.in' }, tc + 0.1);
    repete(tc + 0.5, fin, 0.07, (u, n) => c.ft(fl, { scaleY: n % 2 ? 1.9 : 1.55 }, { scaleY: n % 2 ? 1.55 : 1.9, duration: 0.07, ease: 'none' }, u));
    // Fumée : des ronds qui montent et s'élargissent ; plus nombreux à partir du niveau 1.
    qa('.fumee').forEach((f, j) => { const dur = 1.7, depart = j < 4 ? t0 + 0.3 * j : T1 + 0.2 * (j - 4); for (let u = depart; u + dur < fin; u += dur) {
      const s = j % 2 ? 1 : -1;
      c.ft(f, { opacity: 0, x: 0, y: 0, scale: 0.4 }, { opacity: 0.8, duration: 0.2 }, u);
      c.ft(f, { x: 0, y: 0, scale: 0.4 }, { x: s * (50 + j * 12), y: -34, scale: 1.5, duration: dur, ease: 'power1.out' }, u);
      c.ft(f, { opacity: 0.8 }, { opacity: 0, duration: dur - 0.2 }, u + 0.2); } });
    // Décollage : des traits d'étoiles défilent vers le bas.
    qa('.trait').forEach((t, j) => { const dur = 0.55; for (let u = T2 + 0.4 + (j % 5) * 0.11; u + dur < fin; u += dur) {
      c.ft(t, { opacity: 0, y: 0 }, { opacity: 0.7, duration: 0.1 }, u); c.ft(t, { y: 0 }, { y: 520, duration: dur, ease: 'none' }, u); c.ft(t, { opacity: 0.7 }, { opacity: 0, duration: 0.15 }, u + dur - 0.15); } });
  }
  const ESPACE = {
    titre: '#ffffff',
    fond: `<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1f4d"/><stop offset=".55" stop-color="#0a4b66"/><stop offset="1" stop-color="#020b14"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#dg)"/>${Array.from({ length: 46 }, (_, i) => `<circle cx="${(i * 197) % 1080}" cy="${(i * 331) % 1500}" r="${1.5 + (i % 3)}" fill="#ffffff" opacity="${0.35 + (i % 4) * 0.15}"/>`).join('')}`,
    bas: '',
  };

  // --- Trois animations de plus (volcan, robot, vague) : même gabarit à trois niveaux (T1 : le mot du milieu, T2 : le dernier mot). ---
  const niveaux = (p, t0) => { const N = p.mots.length, mu = p.muetCfg || {}, deb = (k) => t0 + p.mots[k].indice.t + (mu && k ? 0.6 : 0); return { T1: deb(Math.min(1, N - 1)), T2: deb(N - 1) }; };
  // Le finale : l'animation atteint son sommet (décollage, éruption…) 2,4 s après la dernière réponse (les lettres ont fini de tomber), quelques secondes avant la question mystère.
  const tFinale = (p, t0) => t0 + p.mots[p.mots.length - 1].reponse.t + (p.finaleDelai == null ? 2.4 : p.finaleDelai);
  // Répète une action finie : fn(u, n) pour u = depart, depart + pas, … tant que u + pas < fin.
  const repete = (depart, fin, pas, fn) => { for (let u = depart, n = 0; u + pas < fin; u += pas, n += 1) fn(u, n); };
  const bornes = (cl, n, f) => Array.from({ length: n }, (_, i) => f(i, `class="${cl}" data-i="${i}"`)).join('');

  function volcan() {
    const fumees = bornes('fumee', 8, (i, a) => `<circle ${a} cx="${540 + (i % 2 ? 14 : -14)}" cy="150" r="30" fill="#c9c3d6" opacity="0"/>`);
    const gros = bornes('gros', 14, (i, a) => `<circle ${a} cx="540" cy="150" r="${15 + (i % 4) * 4}" fill="${i % 3 ? '#ffb43c' : '#ff3d1e'}" opacity="0"/>`);
    const jets = bornes('jet', 14, (i, a) => `<circle ${a} cx="540" cy="150" r="${7 + (i % 3) * 3}" fill="${i % 2 ? '#ffb43c' : '#ff5a2e'}" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420"><g class="mont"><path d="M170 420 L450 120 L630 120 L910 420Z" fill="#4a2a24"/><path d="M450 120 L630 120 L675 170 L405 170Z" fill="#6a3a30"/><path d="M500 200 L540 420 L520 420 L470 230Z M600 210 L650 420 L630 420Z" fill="#2a1514" opacity=".6"/>
      <ellipse class="cratere" cx="540" cy="122" rx="86" ry="18" fill="#ff5a2e" opacity=".25"/><path class="coulee" d="M520 130 C 510 220 470 300 450 420 L 520 420 C 520 330 550 230 560 130Z" fill="#ff7a2e" opacity="0"/></g>${fumees}${jets}${gros}
      <rect class="flash" x="-100" y="-1500" width="1300" height="1920" fill="#ffb43c" opacity="0"/></svg>`;
  }
  function volcanner(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), mont = q('.mont');
    gsap.set(mont, { svgOrigin: '540 420' }); gsap.set(qa('.jet'), { opacity: 0 }); gsap.set(qa('.fumee'), { opacity: 0 });
    qa('.fumee').forEach((f, j) => { const dur = 2.2; repete(t0 + 0.4 * j, fin, dur, (u) => {
      const s = j % 2 ? 1 : -1; c.ft(f, { opacity: 0, x: 0, y: 0, scale: 0.4 }, { opacity: 0.75, duration: 0.3 }, u); c.ft(f, { x: 0, y: 0, scale: 0.4 }, { x: s * (20 + j * 8), y: -120, scale: 1.7, duration: dur, ease: 'power1.out' }, u); c.ft(f, { opacity: 0.75 }, { opacity: 0, duration: dur - 0.3 }, u + 0.3); }); });
    c.ft(q('.cratere'), { opacity: 0.25 }, { opacity: 0.8, duration: 0.8 }, T1); c.ft(q('.coulee'), { opacity: 0 }, { opacity: 0.85, duration: 1 }, T1);
    repete(T1 + 0.5, Math.min(fin, tc), 0.08, (u, n) => c.ft(mont, { x: n % 2 ? -2 : 2 }, { x: n % 2 ? 2 : -2, duration: 0.08, ease: 'none' }, u));
    c.ft(q('.cratere'), { opacity: 0.8 }, { opacity: 1, duration: 0.4 }, T2);
    qa('.jet').forEach((b, j) => { const dur = 1.5, hauteur = 220 + (j % 5) * 40, dx = (j - 7) * 38; repete(T2 + 0.2 + (j % 7) * 0.18, fin, dur, (u) => {
      c.ft(b, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.1 }, u); c.ft(b, { x: 0 }, { x: dx, duration: dur, ease: 'none' }, u);
      c.ft(b, { y: 0 }, { y: -hauteur, duration: dur * 0.45, ease: 'power2.out' }, u); c.ft(b, { y: -hauteur }, { y: 40, duration: dur * 0.55, ease: 'power2.in' }, u + dur * 0.45); c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); }); });
    // Finale : la grande éruption : un éclair orange, des jets de lave qui montent très haut, la montagne tremble.
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.85, duration: 0.12 }, tc); c.ft(q('.flash'), { opacity: 0.85 }, { opacity: 0.2, duration: 0.8 }, tc + 0.12);
    repete(tc + 0.2, fin, 0.06, (u, n) => c.ft(mont, { x: n % 2 ? -6 : 6 }, { x: n % 2 ? 6 : -6, duration: 0.06, ease: 'none' }, u));
    qa('.gros').forEach((b, j) => { const dur = 1.9, hauteur = 420 + (j % 5) * 70, dx = (j - 7) * 55; repete(tc + (j % 7) * 0.12, fin, dur, (u) => {
      c.ft(b, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.08 }, u); c.ft(b, { x: 0 }, { x: dx, duration: dur, ease: 'none' }, u);
      c.ft(b, { y: 0 }, { y: -hauteur, duration: dur * 0.45, ease: 'power2.out' }, u); c.ft(b, { y: -hauteur }, { y: 60, duration: dur * 0.55, ease: 'power2.in' }, u + dur * 0.45); c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); }); });
    repete(T2, Math.min(fin, tc), 0.6, (u, n) => { c.ft(q('.flash'), { opacity: 0 }, { opacity: n % 2 ? 0.1 : 0.2, duration: 0.15 }, u); c.ft(q('.flash'), { opacity: n % 2 ? 0.1 : 0.2 }, { opacity: 0, duration: 0.4 }, u + 0.15); });
  }

  function robot() {
    const etincelles = bornes('etin', 12, (i, a) => `<circle ${a} cx="540" cy="-170" r="5" fill="#ffe27a" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420"><ellipse cx="540" cy="410" rx="190" ry="16" fill="#4fd1c5" opacity=".3"/>
      <g transform="translate(540 410)"><g class="rb">
        <rect x="-70" y="-70" width="40" height="70" rx="10" fill="#6c7a99"/><rect x="30" y="-70" width="40" height="70" rx="10" fill="#6c7a99"/><rect x="-90" y="-16" width="70" height="18" rx="9" fill="#2a3350"/><rect x="20" y="-16" width="70" height="18" rx="9" fill="#2a3350"/>
        <rect x="-86" y="-230" width="172" height="170" rx="30" fill="#c9d3ea"/><rect x="-60" y="-200" width="120" height="70" rx="14" fill="#2a3350"/><circle class="coeur" cx="0" cy="-100" r="16" fill="#4fd1c5"/>
        <g class="brg"><rect x="-134" y="-220" width="38" height="120" rx="19" fill="#9fb0d6"/><circle cx="-115" cy="-98" r="20" fill="#6c7a99"/></g>
        <g class="brd"><rect x="96" y="-220" width="38" height="120" rx="19" fill="#9fb0d6"/><circle cx="115" cy="-98" r="20" fill="#6c7a99"/></g>
        <rect x="-8" y="-262" width="16" height="34" fill="#6c7a99"/><circle class="ant" cx="0" cy="-272" r="14" fill="#4fd1c5"/>
        <circle class="oeil" cx="-26" cy="-165" r="14" fill="#7dffd9"/><circle class="oeil" cx="26" cy="-165" r="14" fill="#7dffd9"/>
        <g class="engr" transform="translate(0 -30)"><circle r="26" fill="#2a3350"/><path d="M-26 0 H26 M0 -26 V26 M-18 -18 L18 18 M18 -18 L-18 18" stroke="#9fb0d6" stroke-width="5"/></g>
      </g>${etincelles}</g><rect class="flashr" x="-100" y="-1500" width="1300" height="1920" fill="#ffffff" opacity="0"/></svg>`;
  }
  function roboter(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), rb = q('.rb'), ant = q('.ant'), mu = p.muetCfg || {}, beat = 60 / (mu.tempo || 90);
    gsap.set(rb, { svgOrigin: '0 0' }); gsap.set(q('.brg'), { svgOrigin: '-115 -210' }); gsap.set(q('.brd'), { svgOrigin: '115 -210' }); gsap.set(q('.engr'), { svgOrigin: '0 -30' }); gsap.set(qa('.etin'), { opacity: 0 });
    // Niveau 0 : il se balance en rythme et cligne des yeux ; niveau 1 : l'antenne clignote en rouge, les bras s'agitent ; niveau 2 : il vibre, les yeux rougissent, des étincelles jaillissent.
    let r = 0; repete(t0, Math.min(fin, tc), beat, (u, n) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, a = n % 2 ? 1 : -1, P = L ? beat / 2 : beat;
      c.ft(rb, { rotation: r }, { rotation: a * (2 + L * 2), duration: P, ease: 'sine.inOut' }, u); r = a * (2 + L * 2);
      c.ft(q('.brg'), { rotation: -a * (20 + L * 50) }, { rotation: a * (20 + L * 50), duration: P, ease: 'sine.inOut' }, u); c.ft(q('.brd'), { rotation: a * (20 + L * 50) }, { rotation: -a * (20 + L * 50), duration: P, ease: 'sine.inOut' }, u); });
    repete(t0 + 1.6, fin, 3.2, (u) => { c.ft(qa('.oeil'), { scaleY: 1 }, { scaleY: 0.1, duration: 0.08 }, u); c.ft(qa('.oeil'), { scaleY: 0.1 }, { scaleY: 1, duration: 0.1 }, u + 0.1); });
    gsap.set(qa('.oeil'), { svgOrigin: '0 -165', transformOrigin: '50% 50%' });
    repete(T1, fin, 0.4, (u, n) => c.ft(ant, { fill: n % 2 ? '#4fd1c5' : '#ff4d5e' }, { fill: n % 2 ? '#ff4d5e' : '#4fd1c5', duration: 0.4 }, u));
    repete(t0, fin, 1, (u) => c.ft(q('.engr'), { rotation: u >= T2 ? 0 : 0 }, { rotation: u >= T2 ? 360 : 90, duration: 1, ease: 'none' }, u));
    c.ft(qa('.oeil'), { fill: '#7dffd9' }, { fill: '#ff4d5e', duration: 0.4 }, T2); c.ft(q('.coeur'), { fill: '#4fd1c5' }, { fill: '#ff4d5e', duration: 0.4 }, T2);
    repete(T2 + 0.3, Math.min(fin, tc + 1), 0.06, (u, n) => c.ft(rb, { x: n % 2 ? -5 : 5 }, { x: n % 2 ? 5 : -5, duration: 0.06, ease: 'none' }, u));
    // Finale : il gonfle (surchauffe), puis explose en éclat blanc et saute en vrille.
    c.ft(rb, { scale: 1 }, { scale: 1.3, duration: 1, ease: 'power2.in' }, tc);
    c.ft(q('.flashr'), { opacity: 0 }, { opacity: 0.95, duration: 0.1 }, tc + 1); c.ft(q('.flashr'), { opacity: 0.95 }, { opacity: 0, duration: 0.7 }, tc + 1.1);
    c.ft(rb, { scale: 1.3 }, { scale: 1, duration: 0.2, ease: 'power3.out' }, tc + 1);
    c.ft(rb, { y: 0, rotation: 0 }, { y: -230, rotation: 360, duration: 0.7, ease: 'power2.out' }, tc + 1); c.ft(rb, { y: -230 }, { y: 0, duration: 0.55, ease: 'bounce.out' }, tc + 1.7);
    repete(tc + 2.4, fin, 0.3, (u, n) => { c.ft(rb, { y: 0 }, { y: -26, duration: 0.15, ease: 'sine.out' }, u); c.ft(rb, { y: -26 }, { y: 0, duration: 0.15, ease: 'sine.in' }, u + 0.15); });
    qa('.etin').forEach((e, j) => { const dur = 0.8, ang = (j / 12) * Math.PI * 2, rx = Math.cos(ang) * (110 + (j % 3) * 30), ry = Math.sin(ang) * 90 - 30; repete(T2 + 0.2 + (j % 4) * 0.2, fin, dur, (u) => {
      c.ft(e, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.08 }, u); c.ft(e, { x: 0, y: 0 }, { x: rx, y: ry + 140, duration: dur, ease: 'power2.out' }, u); c.ft(e, { opacity: 1 }, { opacity: 0, duration: 0.3 }, u + dur - 0.3); }); });
  }

  function vague() {
    const gouttes = bornes('pluie', 16, (i, a) => `<rect ${a} x="${30 + i * 66}" y="0" width="4" height="${36 + (i % 3) * 12}" rx="2" fill="#bfe6ff" opacity="0"/>`);
    const onde = (y, col, cl) => `<path class="${cl}" d="M-200 ${y} q 100 -40 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 V 1500 H-200Z" fill="${col}"/>`;
    return `<svg class="danse" viewBox="0 0 1080 420"><rect class="eclair" x="-100" y="-1500" width="1300" height="1920" fill="#ffffff" opacity="0"/>${gouttes}
      <g class="bateau"><g transform="translate(540 330)"><path d="M-110 0 L110 0 L80 50 L-80 50Z" fill="#ff7a5c"/><rect x="-4" y="-190" width="8" height="190" fill="#2a1a14"/><path d="M8 -186 L120 -30 L8 -30Z" fill="#fff6e8"/><path d="M-8 -150 L-90 -30 L-8 -30Z" fill="#ffd45c"/></g></g>
      ${onde(340, '#1aa3b5', 'ond1')}${onde(375, '#0f6f9a', 'ond2')}${onde(405, '#0a4570', 'ond3')}</svg>`;
  }
  function vaguer(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), bat = q('.bateau');
    gsap.set(bat, { svgOrigin: '540 380' }); gsap.set(qa('.pluie'), { opacity: 0 });
    // La mer : les vagues glissent d'un côté à l'autre, plus vite et plus haut avec le niveau ; le bateau tangue de plus en plus fort.
    [q('.ond1'), q('.ond2'), q('.ond3')].forEach((o, j) => { let x = 0; repete(t0, Math.min(fin, tc), 1.4, (u) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, dx = [30, 50, 80][L] * (j % 2 ? -1 : 1), v = [30, 55, 90][L] * (j % 2 ? -1 : 1);
      c.ft(o, { x, y: 0 }, { x: x === 0 ? dx : 0, y: L * 6 * (x === 0 ? -1 : 1), duration: 1.4, ease: 'sine.inOut' }, u); x = x === 0 ? dx : 0; }); });
    let r = 0; repete(t0, Math.min(fin, tc), 1.3, (u, n) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, a = (n % 2 ? 1 : -1) * [3, 7, 14][L], P = [1.3, 0.9, 0.55][L];
      c.ft(bat, { rotation: r, y: 0 }, { rotation: a, y: -[4, 9, 18][L], duration: P, ease: 'sine.inOut' }, u); r = a; });
    qa('.pluie').forEach((g, j) => { const dur = 0.5; repete(T2 + (j % 5) * 0.1, fin, dur, (u) => { c.ft(g, { opacity: 0, y: -20 }, { opacity: 0.8, duration: 0.05 }, u); c.ft(g, { y: -20 }, { y: 330, duration: dur, ease: 'none' }, u); c.ft(g, { opacity: 0.8 }, { opacity: 0, duration: 0.1 }, u + dur - 0.1); }); });
    // Finale : une vague géante soulève le bateau, un éclair, puis il retombe et flotte au-dessus de la houle.
    [q('.ond1'), q('.ond2'), q('.ond3')].forEach((o, j) => { c.ft(o, { x: 0, y: 0 }, { y: -[230, 180, 120][j], duration: 1, ease: 'power2.out' }, tc); c.ft(o, { y: -[230, 180, 120][j] }, { y: -[150, 110, 70][j], duration: 0.8, ease: 'power2.inOut' }, tc + 1);
      repete(tc + 1.8, fin, 1, (u, n) => c.ft(o, { y: -[150, 110, 70][j] + (n % 2 ? 14 : -14) }, { y: -[150, 110, 70][j] + (n % 2 ? -14 : 14), duration: 1, ease: 'sine.inOut' }, u)); });
    c.ft(bat, { rotation: 0, y: 0 }, { rotation: 16, y: -310, duration: 1, ease: 'power2.out' }, tc); c.ft(bat, { rotation: 16, y: -310 }, { rotation: -6, y: -170, duration: 0.8, ease: 'power2.inOut' }, tc + 1);
    repete(tc + 1.8, fin, 1, (u, n) => c.ft(bat, { rotation: n % 2 ? -6 : 6, y: -170 }, { rotation: n % 2 ? 6 : -6, y: -176, duration: 1, ease: 'sine.inOut' }, u));
    c.ft(q('.eclair'), { opacity: 0 }, { opacity: 0.8, duration: 0.06 }, tc + 0.9); c.ft(q('.eclair'), { opacity: 0.8 }, { opacity: 0, duration: 0.5 }, tc + 0.96);
    repete(T2 + 0.5, Math.min(fin, tc), 2.2, (u) => { c.ft(q('.eclair'), { opacity: 0 }, { opacity: 0.5, duration: 0.05 }, u); c.ft(q('.eclair'), { opacity: 0.5 }, { opacity: 0, duration: 0.12 }, u + 0.05); c.ft(q('.eclair'), { opacity: 0 }, { opacity: 0.35, duration: 0.05 }, u + 0.3); c.ft(q('.eclair'), { opacity: 0.35 }, { opacity: 0, duration: 0.2 }, u + 0.35); });
  }

  // --- Quatre scènes « dans le thème » (sans personnage) : iceberg, immeubles, forêt, marmite. Même gabarit à trois niveaux + finale. ---
  const alea = (i) => ((i * 9301 + 49297) % 233280) / 233280;
  const surgir = (c, g, t, dur = 0.55) => c.ft(g, { scaleY: 0 }, { scaleY: 1, duration: dur, ease: 'back.out(1.6)' }, t);

  function iceberg() {
    const neige = bornes('neige', 22, (i, a) => `<circle ${a} cx="${30 + i * 48}" cy="-40" r="${3 + (i % 3)}" fill="#ffffff" opacity="0"/>`);
    const splash = bornes('splash', 10, (i, a) => `<circle ${a} cx="760" cy="350" r="${8 + (i % 3) * 5}" fill="#dff6ff" opacity="0"/>`);
    const onde = (y, col, cl) => `<path class="${cl}" d="M-200 ${y} q 100 -30 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 t 200 0 V 1500 H-200Z" fill="${col}"/>`;
    return `<svg class="danse" viewBox="0 0 1080 420"><defs><linearGradient id="au" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4fffb0"/><stop offset=".5" stop-color="#7dd3ff"/><stop offset="1" stop-color="#c46bff"/></linearGradient></defs>
      <rect class="aurore" x="-100" y="-1500" width="1300" height="1900" fill="url(#au)" opacity="0"/>${neige}
      <g class="ice" transform="translate(540 350)"><g class="gl"><path d="M-190 0 L-130 -110 L-70 -80 L0 -240 L70 -130 L120 -165 L190 0Z" fill="#eaf8ff"/><path d="M0 -240 L70 -130 L40 0 L-20 -60Z" fill="#bfe3f5"/><path d="M-130 -110 L-70 -80 L-60 0 L-190 0Z" fill="#cfeefc"/>
        <g class="chunk"><path d="M70 -130 L120 -165 L190 0 L120 0Z" fill="#ffffff"/><path d="M120 -165 L190 0 L150 0Z" fill="#cdeefb"/></g></g></g>
      ${splash}${onde(350, '#2a8fc2', 'mer1')}${onde(385, '#1b6a9c', 'mer2')}${onde(412, '#0f4a75', 'mer3')}</svg>`;
  }
  function icebergue(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), gl = q('.gl'), chunk = q('.chunk'), ondes = [q('.mer1'), q('.mer2'), q('.mer3')], stop = Math.min(fin, tc);
    gsap.set(gl, { svgOrigin: '0 0' }); gsap.set(chunk, { svgOrigin: '120 -80' }); gsap.set(qa('.neige'), { opacity: 0 }); gsap.set(qa('.splash'), { opacity: 0 }); gsap.set(q('.aurore'), { opacity: 0 });
    // Il flotte : balancement lent, de plus en plus fort ; les vagues glissent ; la neige tombe au niveau 1 (tempête au niveau 2), l'aurore boréale s'allume.
    let t = t0, i = 0, r = 0, y0 = 0;
    while (t + 0.4 < stop) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0, P = [1.6, 1.2, 0.8][L], a = (i % 2 ? 1 : -1) * [1.2, 2.5, 4.5][L], y1 = (i % 2 ? -1 : 1) * [4, 7, 11][L];
      c.ft(gl, { rotation: r, y: y0 }, { rotation: a, y: y1, duration: P, ease: 'sine.inOut' }, t); r = a; y0 = y1; t += P; i += 1; }
    ondes.forEach((o, j) => { let x = 0; repete(t0, stop, 1.4, (u) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, dx = [30, 50, 80][L] * (j % 2 ? -1 : 1); c.ft(o, { x }, { x: x === 0 ? dx : 0, duration: 1.4, ease: 'sine.inOut' }, u); x = x === 0 ? dx : 0; }); });
    qa('.neige').forEach((f, j) => { for (let u = T1 + (j % 7) * 0.3; u + 1.4 < fin; u += (u >= T2 ? 1.4 : 2.6)) { const dur = u >= T2 ? 1.4 : 2.6;
      c.ft(f, { opacity: 0, y: 0, x: 0 }, { opacity: 0.9, duration: 0.15 }, u); c.ft(f, { y: 0 }, { y: 470, duration: dur, ease: 'none' }, u); c.ft(f, { x: 0 }, { x: (j % 2 ? 50 : -50) * (u >= T2 ? 2 : 1), duration: dur, ease: 'sine.inOut' }, u); c.ft(f, { opacity: 0.9 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); } });
    c.ft(q('.aurore'), { opacity: 0 }, { opacity: 0.1, duration: 1.2 }, T1); c.ft(q('.aurore'), { opacity: 0.1 }, { opacity: 0.18, duration: 1 }, T2);
    // Finale : la banquise tremble, un bloc se détache et plonge, éclaboussures, la mer se soulève.
    repete(tc, tc + 0.8, 0.06, (u, n) => c.ft(gl, { x: n % 2 ? -4 : 4 }, { x: n % 2 ? 4 : -4, duration: 0.06, ease: 'none' }, u));
    c.ft(q('.aurore'), { opacity: 0.18 }, { opacity: 0.5, duration: 0.3 }, tc); c.ft(q('.aurore'), { opacity: 0.5 }, { opacity: 0.22, duration: 1.2 }, tc + 0.3);
    c.ft(chunk, { x: 0, y: 0, rotation: 0 }, { x: 170, y: 230, rotation: 45, duration: 1.1, ease: 'power2.in' }, tc + 0.8);
    c.ft(gl, { x: 4, rotation: 0 }, { x: 0, rotation: -5, duration: 0.5, ease: 'power2.out' }, tc + 1.4);
    qa('.splash').forEach((b, j) => { [tc + 1.7, tc + 4].forEach((u) => { if (u + 1.2 > fin) return;
      c.ft(b, { opacity: 0, x: 0, y: 0, scale: 0.4 }, { opacity: 1, x: (j - 5) * 26, y: -150 - (j % 4) * 35, scale: 1, duration: 0.5, ease: 'power2.out' }, u); c.ft(b, { x: (j - 5) * 26, y: -150 - (j % 4) * 35 }, { x: (j - 5) * 34, y: 20, duration: 0.6, ease: 'power2.in' }, u + 0.5); c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.3 }, u + 0.9); }); });
    ondes.forEach((o, j) => { c.ft(o, { y: 0 }, { y: -[70, 50, 30][j], duration: 0.5, ease: 'power2.out' }, tc + 1.7); c.ft(o, { y: -[70, 50, 30][j] }, { y: 0, duration: 1.2, ease: 'sine.inOut' }, tc + 2.2);
      repete(tc + 3.4, fin, 1.4, (u, n) => c.ft(o, { x: n % 2 ? 0 : 50 * (j % 2 ? -1 : 1) }, { x: n % 2 ? 50 * (j % 2 ? -1 : 1) : 0, duration: 1.4, ease: 'sine.inOut' }, u)); });
  }

  const BATS = [[20, 110, 140, 0], [130, 100, 200, 0], [240, 130, 160, 0], [370, 100, 250, 1], [470, 120, 330, 2], [590, 110, 220, 1], [700, 100, 290, 2], [800, 120, 180, 1], [920, 130, 240, 2]];
  function immeubles() {
    const cols = ['#2a2f5c', '#1f2450', '#34396b'];
    const bats = BATS.map(([x, w, h, L], i) => { const fen = []; for (let r = 0; r < Math.floor((h - 30) / 34); r += 1) for (let k = 0; k < Math.floor(w / 32); k += 1) { const fx = x + 10 + k * 32, fy = 420 - h + 16 + r * 34, j = fen.length / 2; fen.push(`<rect x="${fx}" y="${fy}" width="16" height="20" rx="2" fill="#161a3a"/><rect class="fen" data-b="${i}" data-j="${j}" x="${fx}" y="${fy}" width="16" height="20" rx="2" fill="#ffd45c" opacity="0"/>`); }
      return `<g class="bat" data-i="${i}" data-l="${L}" data-cx="${x + w / 2}"><rect x="${x}" y="${420 - h}" width="${w}" height="${h}" fill="${cols[i % 3]}"/>${L === 2 ? `<rect x="${x + w / 2 - 3}" y="${420 - h - 50}" width="6" height="50" fill="#1f2450"/><circle class="balise" cx="${x + w / 2}" cy="${420 - h - 52}" r="6" fill="#ff4d5e"/>` : ''}${fen.join('')}</g>`; }).join('');
    const feux = bornes('feu', 30, (i, a) => `<circle ${a} data-b="${i % 3}" cx="${[300, 540, 800][i % 3]}" cy="${[40, -60, 20][i % 3]}" r="7" fill="${['#ffd45c', '#ff4d5e', '#4fd1c5', '#c46bff', '#ffffff'][i % 5]}" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420"><path class="proj" d="M200 420 L150 -400 L260 -400Z" fill="#ffffff" opacity="0"/><path class="proj" d="M880 420 L830 -400 L940 -400Z" fill="#ffffff" opacity="0"/>${bats}
      <rect x="0" y="408" width="1080" height="30" fill="#0d0f24"/><g class="taxi"><rect x="0" y="388" width="74" height="22" rx="8" fill="#ffd45c"/><rect x="14" y="374" width="42" height="18" rx="5" fill="#ffe27a"/><circle cx="16" cy="412" r="7" fill="#111"/><circle cx="58" cy="412" r="7" fill="#111"/></g>${feux}</svg>`;
  }
  function immeubler(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc);
    const debutB = (L) => (L === 0 ? t0 : L === 1 ? T1 : T2), apparition = {};
    gsap.set(qa('.fen'), { opacity: 0 }); gsap.set(qa('.feu'), { opacity: 0 }); gsap.set(qa('.proj'), { opacity: 0, svgOrigin: '0 0' });
    // Les immeubles poussent : trois petits au début, plus hauts au mot du milieu, les gratte-ciel au dernier mot ; les fenêtres s'allument.
    qa('.bat').forEach((b, i) => { const L = +b.dataset.l, cx = +b.dataset.cx; gsap.set(b, { svgOrigin: `${cx} 420` }); apparition[i] = debutB(L) + (L === 0 ? 0 : 0.12 * (i % 3)); if (L > 0) { gsap.set(b, { scaleY: 0 }); surgir(c, b, apparition[i], 0.6); } });
    qa('.fen').forEach((f) => { const b = +f.dataset.b, j = +f.dataset.j, a = alea(j + b * 17), L = BATS[b][3], base = apparition[b] + 0.5;
      const t = a < 0.35 ? base + a * 3 : a < 0.7 ? Math.max(base, T1) + 0.3 + (a - 0.35) * 5 : Math.max(base, T2) + 0.3 + (a - 0.7) * 4;
      if (t < fin) c.ft(f, { opacity: 0 }, { opacity: 0.95, duration: 0.15 }, t);
      if (a > 0.8 && t < stop) repete(Math.max(T2, t + 0.3) + a, stop, 0.7, (u, n) => c.ft(f, { opacity: n % 2 ? 0.95 : 0.25 }, { opacity: n % 2 ? 0.25 : 0.95, duration: 0.2 }, u)); });
    repete(t0 + 0.5, fin, 4.2, (u) => c.ft(q('.taxi'), { x: -120 }, { x: 1180, duration: 3.6, ease: 'none' }, u));
    qa('.balise').forEach((b) => repete(T2, fin, 0.8, (u, n) => c.ft(b, { opacity: n % 2 ? 1 : 0.2 }, { opacity: n % 2 ? 0.2 : 1, duration: 0.4 }, u)));
    qa('.proj').forEach((pr, j) => { c.ft(pr, { opacity: 0 }, { opacity: 0.07, duration: 0.6 }, T2); gsap.set(pr, { svgOrigin: j ? '880 420' : '200 420' }); repete(T2, stop, 1.6, (u, n) => c.ft(pr, { rotation: (n % 2 ? -1 : 1) * 18 * (j ? -1 : 1) }, { rotation: (n % 2 ? 1 : -1) * 18 * (j ? -1 : 1), duration: 1.6, ease: 'sine.inOut' }, u)); });
    // Finale : un feu d'artifice au-dessus de la ville.
    qa('.feu').forEach((f, j) => { const b = j % 3, ang = (Math.floor(j / 3) / 10) * Math.PI * 2; [tc + b * 0.45, tc + 2 + b * 0.45].forEach((u) => { if (u + 1 > fin) return;
      c.ft(f, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.05 }, u); c.ft(f, { x: 0, y: 0 }, { x: Math.cos(ang) * 150, y: Math.sin(ang) * 150 + 30, duration: 0.9, ease: 'power2.out' }, u); c.ft(f, { scale: 1 }, { scale: 0.3, duration: 0.9 }, u); c.ft(f, { opacity: 1 }, { opacity: 0, duration: 0.3 }, u + 0.65); }); });
    c.ft(qa('.proj'), { opacity: 0.07 }, { opacity: 0.18, duration: 0.4 }, tc);
  }

  const ARBRES = [[70, 0.8, 0], [300, 0.9, 0], [540, 0.85, 0], [180, 1.2, 1], [420, 1.3, 1], [690, 1.1, 1], [830, 1.4, 2], [960, 1.2, 2], [610, 1.5, 2]];
  function foret() {
    const arbres = ARBRES.map(([x, s, L], i) => `<g class="arbre" data-i="${i}" data-x="${x}" data-l="${L}"><rect x="${x - 12 * s}" y="${420 - 95 * s}" width="${24 * s}" height="${95 * s}" fill="#6b4a32"/><circle class="cime" cx="${x}" cy="${420 - 140 * s}" r="${62 * s}" fill="#3fa34d"/><circle class="cime" cx="${x - 40 * s}" cy="${420 - 105 * s}" r="${44 * s}" fill="#3b9a49"/><circle class="cime" cx="${x + 40 * s}" cy="${420 - 105 * s}" r="${44 * s}" fill="#46ad55"/></g>`).join('');
    const feuilles = bornes('feuille', 18, (i, a) => `<ellipse ${a} cx="${40 + i * 58}" cy="-60" rx="9" ry="5" fill="#e8872e" opacity="0"/>`);
    const vent = bornes('vent', 26, (i, a) => `<ellipse ${a} cx="-60" cy="${30 + (i * 53) % 330}" rx="10" ry="6" fill="${i % 2 ? '#e8872e' : '#c9501f'}" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420">${arbres}<rect x="-100" y="408" width="1300" height="400" fill="#1f4d2a"/>${feuilles}${vent}</svg>`;
  }
  function forester(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc);
    gsap.set(qa('.feuille'), { opacity: 0 }); gsap.set(qa('.vent'), { opacity: 0 });
    const arbres = qa('.arbre');
    arbres.forEach((a, i) => { const L = +a.dataset.l, x = +a.dataset.x; gsap.set(a, { svgOrigin: `${x} 420` }); if (L > 0) { gsap.set(a, { scaleY: 0 }); surgir(c, a, (L === 1 ? T1 : T2) + 0.12 * (i % 3), 0.7); } });
    // Le vent : les arbres se balancent de plus en plus fort ; les cimes virent à l'automne au dernier mot, les feuilles tombent.
    arbres.forEach((a, i) => { const x = +a.dataset.x; let t = t0 + (i % 3) * 0.2, k = 0, r = 0; while (t + 0.4 < stop) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0, P = [2, 1.4, 1][L], ang = (k % 2 ? 1 : -1) * [1.5, 3, 5][L]; c.ft(a, { rotation: r }, { rotation: ang, duration: P, ease: 'sine.inOut' }, t); r = ang; t += P; k += 1; } });
    c.ft(qa('.cime'), { fill: '#3fa34d' }, { fill: '#e8872e', duration: 1.6 }, T2);
    qa('.feuille').forEach((f, j) => { for (let u = T1 + (j % 6) * 0.4, k = 0; u + 3 < fin; u += (u >= T2 ? 2 : 3.4), k += 1) { const dur = u >= T2 ? 2 : 3.4;
      c.ft(f, { opacity: 0, y: 0, x: 0, rotation: 0 }, { opacity: 1, duration: 0.2 }, u); c.ft(f, { y: 0 }, { y: 520, duration: dur, ease: 'none' }, u); c.ft(f, { x: 0 }, { x: (j % 2 ? 90 : -90), duration: dur, ease: 'sine.inOut' }, u); c.ft(f, { rotation: 0 }, { rotation: 360, duration: dur, ease: 'none' }, u); c.ft(f, { opacity: 1 }, { opacity: 0, duration: 0.3 }, u + dur - 0.3); } });
    // Finale : une rafale de vent : les arbres plient, un tourbillon de feuilles traverse l'écran.
    arbres.forEach((a, i) => repete(tc + (i % 3) * 0.05, fin, 0.3, (u, n) => c.ft(a, { rotation: n % 2 ? 12 : -4 }, { rotation: n % 2 ? -4 : 12, duration: 0.3, ease: 'sine.inOut' }, u)));
    qa('.vent').forEach((v, j) => { [tc + (j % 9) * 0.1, tc + 2.2 + (j % 9) * 0.1].forEach((u) => { if (u + 1.5 > fin) return;
      c.ft(v, { opacity: 0, x: 0, y: 0, rotation: 0 }, { opacity: 1, duration: 0.1 }, u); c.ft(v, { x: 0 }, { x: 1300, duration: 1.4, ease: 'power1.in' }, u); c.ft(v, { y: 0 }, { y: (j % 2 ? 60 : -60), duration: 0.7, ease: 'sine.inOut' }, u); c.ft(v, { y: (j % 2 ? 60 : -60) }, { y: 0, duration: 0.7, ease: 'sine.inOut' }, u + 0.7); c.ft(v, { rotation: 0 }, { rotation: 720, duration: 1.4, ease: 'none' }, u); c.ft(v, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + 1.3); }); });
  }

  function marmite() {
    const vap = bornes('vap', 8, (i, a) => `<circle ${a} cx="${480 + (i % 4) * 40}" cy="226" r="24" fill="#ffffff" opacity="0"/>`);
    const mousse = bornes('mousse', 10, (i, a) => `<circle ${a} cx="${376 + i * 36}" cy="256" r="19" fill="#fff6e8" opacity="0"/>`);
    const gouttes = bornes('goutte', 16, (i, a) => `<circle ${a} cx="540" cy="240" r="${10 + (i % 4) * 3}" fill="${i % 2 ? '#ff7a4a' : '#ffb43c'}" opacity="0"/>`);
    const flam = [430, 540, 650].map((x, i) => `<path class="flam" data-i="${i}" d="M${x - 26} 400 C ${x - 34} 360 ${x - 6} 350 ${x} 330 C ${x + 8} 350 ${x + 34} 360 ${x + 26} 400Z" fill="#ff8a3c"/><path class="flam" data-i="${i}" d="M${x - 12} 400 C ${x - 14} 376 ${x} 372 ${x} 356 C ${x + 6} 372 ${x + 16} 378 ${x + 12} 400Z" fill="#ffe27a"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420"><rect x="240" y="398" width="600" height="30" rx="8" fill="#3a3a4f"/>${flam}
      <g class="pot"><rect x="360" y="256" width="360" height="142" rx="24" fill="#aeb8cc"/><rect x="334" y="284" width="36" height="18" rx="9" fill="#8f9bb3"/><rect x="710" y="284" width="36" height="18" rx="9" fill="#8f9bb3"/><rect x="360" y="256" width="360" height="14" fill="#8f9bb3"/><ellipse cx="540" cy="256" rx="180" ry="12" fill="#ff7a4a"/>${mousse}
        <g class="couv"><ellipse cx="540" cy="244" rx="192" ry="18" fill="#c3ccdc"/><path d="M500 244 q40 -42 80 0Z" fill="#8f9bb3"/><circle cx="540" cy="210" r="9" fill="#2a2f45"/></g></g>${vap}${gouttes}</svg>`;
  }
  function marmiter(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), couv = q('.couv'), pot = q('.pot');
    gsap.set(couv, { svgOrigin: '540 244' }); gsap.set(qa('.vap'), { opacity: 0 }); gsap.set(qa('.mousse'), { opacity: 0 }); gsap.set(qa('.goutte'), { opacity: 0 });
    qa('.flam').forEach((f) => gsap.set(f, { svgOrigin: `${[430, 540, 650][+f.dataset.i]} 400`, scaleY: 0.5 }));
    // Ça mijote : la vapeur monte ; au mot du milieu ça bout (le couvercle tremble, les flammes grandissent) ; au dernier la mousse déborde.
    qa('.vap').forEach((v, j) => { for (let u = t0 + 0.35 * j; u + 2.4 < fin; u += 2.2) { const fort = u >= T1;
      c.ft(v, { opacity: 0, x: 0, y: 0, scale: 0.5 }, { opacity: fort ? 0.6 : 0.35, duration: 0.3 }, u); c.ft(v, { x: 0, y: 0, scale: 0.5 }, { x: (j % 2 ? 40 : -40), y: -(fort ? 170 : 120), scale: 1.6, duration: 2.2, ease: 'power1.out' }, u); c.ft(v, { opacity: fort ? 0.6 : 0.35 }, { opacity: 0, duration: 1.6 }, u + 0.6); } });
    qa('.flam').forEach((f) => { c.ft(f, { scaleY: 0.5 }, { scaleY: 0.9, duration: 0.5 }, T1); c.ft(f, { scaleY: 0.9 }, { scaleY: 1.3, duration: 0.5 }, T2);
      repete(t0, stop, 0.2, (u, n) => { const h = u >= T2 ? 1.3 : u >= T1 ? 0.9 : 0.5; c.ft(f, { scaleY: n % 2 ? h : h * 0.85 }, { scaleY: n % 2 ? h * 0.85 : h, duration: 0.2, ease: 'none' }, u); }); });
    repete(T1 + 0.3, stop, 0.12, (u, n) => { const a = u >= T2 ? 5 : 2; c.ft(couv, { y: n % 2 ? -a : 0, rotation: n % 2 ? -a * 0.6 : 0 }, { y: n % 2 ? 0 : -a, rotation: n % 2 ? 0 : a * 0.6, duration: 0.12, ease: 'none' }, u); });
    repete(T2 + 0.3, stop, 0.08, (u, n) => c.ft(pot, { x: n % 2 ? -2 : 2 }, { x: n % 2 ? 2 : -2, duration: 0.08, ease: 'none' }, u));
    qa('.mousse').forEach((m, j) => { for (let u = T2 + 0.2 + (j % 5) * 0.12; u + 1.2 < stop + 0.01; u += 1.2) { c.ft(m, { opacity: 0, y: 0, scale: 0.4 }, { opacity: 1, y: -34 - (j % 3) * 12, scale: 1.15, duration: 0.5, ease: 'power2.out' }, u); c.ft(m, { opacity: 1 }, { opacity: 0, duration: 0.5 }, u + 0.7); } });
    // Finale : le couvercle saute, un geyser de soupe jaillit.
    c.ft(couv, { y: 0, rotation: 0, x: 0 }, { y: -1500, rotation: 720, x: 120, duration: 1.4, ease: 'power2.in' }, tc);
    qa('.goutte').forEach((g, j) => { const dur = 1.7, h = 300 + (j % 5) * 80, dx = (j - 8) * 26; repete(tc + (j % 8) * 0.1, fin, dur, (u) => {
      c.ft(g, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.08 }, u); c.ft(g, { x: 0 }, { x: dx, duration: dur, ease: 'none' }, u); c.ft(g, { y: 0 }, { y: -h, duration: dur * 0.45, ease: 'power2.out' }, u); c.ft(g, { y: -h }, { y: 90, duration: dur * 0.55, ease: 'power2.in' }, u + dur * 0.45); c.ft(g, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); }); });
    qa('.vap').forEach((v, j) => repete(tc + 0.2, fin, 0.9, (u) => { c.ft(v, { opacity: 0, y: 0, scale: 0.8 }, { opacity: 0.8, duration: 0.15 }, u + (j % 4) * 0.08); c.ft(v, { y: 0, scale: 0.8 }, { y: -260, scale: 2.4, duration: 0.9, ease: 'power1.out' }, u + (j % 4) * 0.08); c.ft(v, { opacity: 0.8 }, { opacity: 0, duration: 0.4 }, u + 0.5); }));
  }

  // --- Quatre scènes « culture pop » : vinyle (musique), cinéma, stade (sport), blocs (jeux vidéo). ---
  const flashRect = (cl, col) => `<rect class="${cl}" x="-100" y="-1500" width="1300" height="1920" fill="${col}" opacity="0"/>`;
  const jetsHauts = (cl, n, cols, r0) => bornes(cl, n, (i, a) => `<circle ${a} cx="540" cy="200" r="${r0 + (i % 3) * 3}" fill="${cols[i % cols.length]}" opacity="0"/>`);
  // Un jet de particules qui monte puis retombe (finale) ; répété jusqu'à la fin.
  const jaillir = (c, qa, cl, t, fin, haut, ecart) => qa(cl).forEach((b, j) => { const dur = 1.6, h = haut + (j % 5) * 60, dx = (j - qa(cl).length / 2) * ecart; repete(t + (j % 7) * 0.12, fin, dur, (u) => {
    c.ft(b, { opacity: 0, x: 0, y: 0 }, { opacity: 1, duration: 0.08 }, u); c.ft(b, { x: 0 }, { x: dx, duration: dur, ease: 'none' }, u); c.ft(b, { y: 0 }, { y: -h, duration: dur * 0.45, ease: 'power2.out' }, u); c.ft(b, { y: -h }, { y: 60, duration: dur * 0.55, ease: 'power2.in' }, u + dur * 0.45); c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); }); });

  function vinyle() {
    const barres = Array.from({ length: 12 }, (_, i) => `<rect class="eq" data-i="${i}" x="${120 + i * 72}" y="330" width="40" height="90" rx="6" fill="${['#ff4fa3', '#c46bff', '#7dd3ff'][i % 3]}" opacity=".9"/>`).join('');
    const cols = ['#ffd45c', '#4fd1c5', '#ff7a5c', '#c46bff'];
    const notes = Array.from({ length: 8 }, (_, i) => `<g class="nt" data-i="${i}" opacity="0"><ellipse cx="0" cy="0" rx="13" ry="10" fill="${cols[i % 4]}" transform="rotate(-20)"/><path d="M11 -3 V-48 C 24 -42 32 -34 28 -22" fill="none" stroke="${cols[i % 4]}" stroke-width="5" stroke-linecap="round"/></g>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420"><path class="sp" d="M200 -300 L120 420 L420 420Z" fill="#ffffff" opacity="0"/><path class="sp" d="M880 -300 L660 420 L960 420Z" fill="#ffffff" opacity="0"/>
      <g class="dq"><circle cx="540" cy="210" r="150" fill="#14101f"/><circle cx="540" cy="210" r="120" fill="none" stroke="#2a2340" stroke-width="3"/><circle cx="540" cy="210" r="90" fill="none" stroke="#2a2340" stroke-width="3"/><circle cx="540" cy="210" r="52" fill="#ff4fa3"/><circle cx="540" cy="210" r="8" fill="#14101f"/><circle cx="540" cy="82" r="8" fill="#ffffff" opacity=".8"/></g>${barres}${notes}${jetsHauts('gnt', 14, ['#ff4fa3', '#ffd45c', '#7dd3ff'], 8)}${flashRect('flash', '#ff4fa3')}</svg>`;
  }
  function vinyler(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), dq = q('.dq');
    gsap.set(dq, { svgOrigin: '540 210' }); gsap.set(qa('.nt'), { opacity: 0 }); gsap.set(qa('.gnt'), { opacity: 0 }); gsap.set(qa('.sp'), { opacity: 0, svgOrigin: '0 0' });
    let ang = 0, t = t0; while (t + 0.2 < stop) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0, dps = [90, 240, 480][L], P = 0.5; c.ft(dq, { rotation: ang }, { rotation: ang + dps * P, duration: P, ease: 'none' }, t); ang += dps * P; t += P; }
    qa('.eq').forEach((b, j) => { const x = 120 + j * 72 + 20; gsap.set(b, { svgOrigin: `${x} 420`, scaleY: 0.2 }); let h0 = 0.2;
      repete(t0, stop, 0.25, (u, n) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, h = 0.12 + [0.25, 0.55, 0.9][L] * alea(j * 13 + n * 7); c.ft(b, { scaleY: h0 }, { scaleY: h, duration: 0.25, ease: 'sine.inOut' }, u); h0 = h; }); });
    qa('.nt').forEach((n, j) => { const bx = 160 + j * 110, dur = 2.4; gsap.set(n, { x: bx, y: 300 }); repete(T1 + (j % 4) * 0.5, fin, dur, (u) => { c.ft(n, { opacity: 0, x: bx, y: 300 }, { opacity: 0.95, duration: 0.3 }, u); c.ft(n, { y: 300 }, { y: 60, duration: dur, ease: 'sine.out' }, u); c.ft(n, { opacity: 0.95 }, { opacity: 0, duration: 0.5 }, u + dur - 0.5); }); });
    qa('.sp').forEach((sp, j) => { c.ft(sp, { opacity: 0 }, { opacity: 0.1, duration: 0.6 }, T2); repete(T2, stop, 1.4, (u, n) => c.ft(sp, { rotation: (n % 2 ? -1 : 1) * 10 * (j ? -1 : 1) }, { rotation: (n % 2 ? 1 : -1) * 10 * (j ? -1 : 1), duration: 1.4, ease: 'sine.inOut' }, u)); });
    // Finale : le disque s'emballe, les barres montent au maximum, jaillissement de notes et éclat rose.
    c.ft(dq, { rotation: ang }, { rotation: ang + 1080, duration: 1.6, ease: 'power2.in' }, tc); c.ft(dq, { rotation: ang + 1080 }, { rotation: ang + 1080 + 3600, duration: Math.max(0.1, fin - tc - 1.6), ease: 'none' }, tc + 1.6);
    qa('.eq').forEach((b, j) => repete(tc, fin, 0.12, (u, n) => c.ft(b, { scaleY: n % 2 ? 1 : 0.6 }, { scaleY: n % 2 ? 0.6 : 1, duration: 0.12, ease: 'none' }, u + (j % 3) * 0.02)));
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.55, duration: 0.12 }, tc + 1.2); c.ft(q('.flash'), { opacity: 0.55 }, { opacity: 0.1, duration: 0.8 }, tc + 1.32);
    jaillir(c, qa, '.gnt', tc + 1.2, fin, 330, 40);
  }

  function cinema() {
    const trous = [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${540 + Math.cos(i * Math.PI / 3) * 72}" cy="${220 + Math.sin(i * Math.PI / 3) * 72}" r="24" fill="#0c0c12"/>`).join('');
    const etoiles = Array.from({ length: 12 }, (_, i) => `<path class="etoile" data-i="${i}" transform="translate(${60 + i * 88} ${60 + (i * 53) % 220}) scale(${0.7 + (i % 3) * 0.3})" d="M0 -14 L4 -4 L14 -4 L6 3 L9 13 L0 7 L-9 13 L-6 3 L-14 -4 L-4 -4Z" fill="#ffd45c" opacity="0"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420"><path class="beam" d="M540 220 L260 -500 L820 -500Z" fill="#ffffff" opacity="0"/><path class="sp" d="M200 -300 L100 420 L420 420Z" fill="#ffd45c" opacity="0"/><path class="sp" d="M880 -300 L660 420 L980 420Z" fill="#ffd45c" opacity="0"/>${etoiles}
      <rect x="0" y="398" width="1080" height="30" fill="#8f1d2c"/><g class="reel"><circle cx="540" cy="220" r="150" fill="#2a2a33"/><circle cx="540" cy="220" r="132" fill="#383844"/>${trous}<circle cx="540" cy="220" r="22" fill="#14141c"/></g>
      <g class="trophee" transform="translate(540 420) scale(1.5)"><g class="trop"><path d="M-26 -40 L-20 -150 Q0 -168 20 -150 L26 -40Z" fill="#ffd45c"/><circle cx="0" cy="-176" r="19" fill="#ffd45c"/><rect x="-50" y="-40" width="100" height="26" rx="4" fill="#e8b84a"/><rect x="-64" y="-14" width="128" height="16" rx="4" fill="#c99a30"/><path d="M-10 -140 L-6 -60" stroke="#fff6c8" stroke-width="5" stroke-linecap="round" opacity=".7"/></g></g>${jetsHauts('gnt', 16, ['#ffd45c', '#fff6c8', '#ffb43c'], 7)}${flashRect('flash', '#ffe27a')}</svg>`;
  }
  function cineaster(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), reel = q('.reel'), beam = q('.beam'), trop = q('.trop');
    gsap.set(reel, { svgOrigin: '540 220' }); gsap.set(qa('.gnt'), { opacity: 0 }); gsap.set(qa('.sp'), { opacity: 0, svgOrigin: '0 0' }); gsap.set(trop, { y: 330 }); gsap.set(beam, { opacity: 0.05 });
    let ang = 0, t = t0; while (t + 0.2 < fin) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0, dps = [70, 180, 360][L], P = 0.5; c.ft(reel, { rotation: ang }, { rotation: ang + dps * P, duration: P, ease: 'none' }, t); ang += dps * P; t += P; }
    repete(t0, stop, 0.2, (u, n) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, b = [0.05, 0.12, 0.18][L], v = b + (alea(n * 5) - 0.5) * 0.05; c.ft(beam, { opacity: v }, { opacity: b + (alea(n * 5 + 3) - 0.5) * 0.05, duration: 0.2, ease: 'none' }, u); });
    qa('.etoile').forEach((e, j) => { const base = j % 2 ? T2 : T1; repete(base + (j % 5) * 0.15, fin, 0.7, (u, n) => c.ft(e, { opacity: n % 2 ? 1 : 0.35 }, { opacity: n % 2 ? 0.35 : 1, duration: 0.35 }, u)); });
    qa('.sp').forEach((sp, j) => { c.ft(sp, { opacity: 0 }, { opacity: 0.12, duration: 0.6 }, T2); repete(T2, stop, 1.4, (u, n) => c.ft(sp, { rotation: (n % 2 ? -1 : 1) * 12 * (j ? -1 : 1) }, { rotation: (n % 2 ? 1 : -1) * 12 * (j ? -1 : 1), duration: 1.4, ease: 'sine.inOut' }, u)); });
    // Finale : la statuette dorée jaillit du sol dans un éclat de lumière et des étincelles dorées.
    c.ft(trop, { y: 330 }, { y: -10, duration: 1.1, ease: 'back.out(1.5)' }, tc + 0.2);
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.6, duration: 0.1 }, tc + 0.9); c.ft(q('.flash'), { opacity: 0.6 }, { opacity: 0.08, duration: 0.8 }, tc + 1);
    jaillir(c, qa, '.gnt', tc + 0.9, fin, 300, 40);
    repete(tc + 1.4, fin, 0.8, (u, n) => c.ft(trop, { y: n % 2 ? -10 : -24 }, { y: n % 2 ? -24 : -10, duration: 0.8, ease: 'sine.inOut' }, u));
  }

  function stade() {
    const bandes = Array.from({ length: 17 }, (_, i) => `<rect x="${i * 90 - 300}" y="340" width="90" height="90" fill="${i % 2 ? '#1f7a3a' : '#1a6a33'}"/>`).join('');
    const fans = Array.from({ length: 36 }, (_, i) => `<circle class="fan" data-i="${i}" cx="${200 + (i % 18) * 40}" cy="${i < 18 ? 280 : 316}" r="9" fill="${['#ffd45c', '#ff4d5e', '#7dd3ff', '#ffffff'][i % 4]}" opacity=".15"/>`).join('');
    const filet = Array.from({ length: 6 }, (_, i) => `<path d="M${710 + i * 32} 255 V340" stroke="#ffffff88" stroke-width="2"/>`).join('') + Array.from({ length: 4 }, (_, i) => `<path d="M700 ${270 + i * 20} H900" stroke="#ffffff88" stroke-width="2"/>`).join('');
    const conf = Array.from({ length: 20 }, (_, i) => `<rect class="conf" data-i="${i}" x="${40 + i * 52}" y="0" width="12" height="18" rx="2" fill="${['#ffd45c', '#ff4d5e', '#4fd1c5', '#ffffff'][i % 4]}" opacity="0"/>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420"><path class="sp" d="M60 -300 L-60 420 L460 420Z" fill="#ffffff" opacity="0"/><path class="sp" d="M1020 -300 L1140 420 L620 420Z" fill="#ffffff" opacity="0"/><g class="scene" transform="translate(540 420) scale(1.45) translate(-540 -420)"><rect x="-200" y="240" width="1480" height="100" fill="#121a2a"/>${fans}${bandes}
      <g class="filet" opacity=".95">${filet}</g><path d="M700 340 V250 H900 V340" fill="none" stroke="#ffffff" stroke-width="8" stroke-linecap="round"/>
      <g class="ballon"><circle cx="300" cy="372" r="24" fill="#ffffff"/><path d="M300 358 L312 367 L308 381 L292 381 L288 367Z" fill="#2a2a33"/></g></g>${conf}${flashRect('flash', '#ffffff')}</svg>`;
  }
  function stader(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), ball = q('.ballon');
    gsap.set(ball, { svgOrigin: '300 372' }); gsap.set(qa('.conf'), { opacity: 0 }); gsap.set(qa('.sp'), { opacity: 0, svgOrigin: '0 0' }); gsap.set(q('.filet'), { svgOrigin: '900 300' });
    // Le ballon rebondit sur place, puis dribble ; les projecteurs s'allument, les tribunes aussi.
    let t = t0, i = 0, x0 = 0; while (t + 0.3 < stop) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0, P = [0.8, 0.6, 0.45][L], h = [60, 90, 120][L], x1 = L ? (i % 2 ? 1 : -1) * [0, 70, 110][L] : 0;
      c.ft(ball, { y: 0, x: x0 }, { y: -h, x: (x0 + x1) / 2, duration: P / 2, ease: 'sine.out' }, t); c.ft(ball, { y: -h, x: (x0 + x1) / 2 }, { y: 0, x: x1, duration: P / 2, ease: 'sine.in' }, t + P / 2); c.ft(ball, { rotation: i * 180 }, { rotation: (i + 1) * 180, duration: P, ease: 'none' }, t); x0 = x1; t += P; i += 1; }
    qa('.sp').forEach((sp) => c.ft(sp, { opacity: 0 }, { opacity: 0.1, duration: 0.8 }, T1));
    qa('.fan').forEach((f, j) => { const a = alea(j * 11); if (a < 0.4) c.ft(f, { opacity: 0.15 }, { opacity: 0.9, duration: 0.3 }, T1 + a * 2); c.ft(f, { opacity: 0.15 }, { opacity: 0.9, duration: 0.3 }, T2 + a * 1.2); if (a > 0.6) repete(T2 + 0.5, stop, 0.5, (u, n) => c.ft(f, { opacity: n % 2 ? 0.9 : 0.4 }, { opacity: n % 2 ? 0.4 : 0.9, duration: 0.25 }, u)); });
    // Finale : le tir part dans la lucarne, le filet gonfle, la foule explose, confettis.
    c.ft(ball, { x: x0, y: 0, scale: 1 }, { x: 500, y: -50, scale: 0.65, duration: 0.9, ease: 'power1.out' }, tc);
    c.ft(ball, { y: 0 }, { y: -30, duration: 0.4, ease: 'sine.out' }, tc + 0.9); c.ft(ball, { y: -30 }, { y: 30, duration: 0.5, ease: 'bounce.out' }, tc + 1.3);
    [1.25, 1.12, 1.05, 1].forEach((v, k) => c.ft(q('.filet'), { scaleX: k ? [1.25, 1.12, 1.05][k - 1] : 1 }, { scaleX: v, duration: 0.2, ease: 'sine.inOut' }, tc + 0.9 + k * 0.2));
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.25, duration: 0.1 }, tc + 0.9); c.ft(q('.flash'), { opacity: 0.25 }, { opacity: 0, duration: 0.6 }, tc + 1);
    qa('.fan').forEach((f, j) => repete(tc + 0.9, fin, 0.25, (u, n) => c.ft(f, { opacity: n % 2 ? 1 : 0.5 }, { opacity: n % 2 ? 0.5 : 1, duration: 0.25 }, u)));
    qa('.conf').forEach((f, j) => { const dur = 1.8; repete(tc + 0.9 + (j % 8) * 0.1, fin, dur, (u) => { c.ft(f, { opacity: 0, y: -40, rotation: 0 }, { opacity: 1, duration: 0.1 }, u); c.ft(f, { y: -40 }, { y: 440, duration: dur, ease: 'none' }, u); c.ft(f, { rotation: 0 }, { rotation: 540 * (j % 2 ? 1 : -1), duration: dur, ease: 'none' }, u); c.ft(f, { opacity: 1 }, { opacity: 0, duration: 0.2 }, u + dur - 0.2); }); });
  }

  const BLOCS = (() => { const L0 = [0, 1, 2, 3].map((k) => [k, 0, 0]), L1 = [4, 5, 6, 7].map((k) => [k, 0, 1]).concat([[0, 1, 1], [1, 1, 1]]), L2 = [2, 3, 4, 5, 6, 7].map((k) => [k, 1, 2]); return L0.concat(L1, L2); })();
  function blocs() {
    const C = ['#4fd1c5', '#ffd45c', '#c46bff', '#6be36b', '#ff4d5e', '#6b8cff', '#ff9a3c'];
    const grille = Array.from({ length: 9 }, (_, i) => `<path d="M${100 + i * 110} 100 V420" stroke="#ffffff14" stroke-width="2"/>`).join('');
    const bl = BLOCS.map(([col, row, L], i) => `<g class="bloc" data-i="${i}" data-l="${L}" data-row="${row}"><rect x="${100 + col * 110 + 4}" y="${420 - 110 * (row + 1) + 4}" width="102" height="102" rx="10" fill="${C[(col + row * 3) % 7]}"/><rect x="${100 + col * 110 + 14}" y="${420 - 110 * (row + 1) + 14}" width="82" height="14" rx="6" fill="#ffffff55"/></g>`).join('');
    return `<svg class="danse" viewBox="0 0 1080 420">${grille}${bl}${flashRect('flash', '#ffffff')}</svg>`;
  }
  function blocser(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), bl = qa('.bloc'), parNiveau = [0, 1, 2].map((L) => bl.filter((b) => +b.dataset.l === L));
    gsap.set(bl, { opacity: 0 });
    // Les blocs tombent et s'empilent : un par seconde, puis deux par seconde, puis quatre par seconde.
    const depart = [t0 + 0.1, T1, T2], pas = [0.5, 0.35, 0.2];
    parNiveau.forEach((liste, L) => liste.forEach((b, k) => { const u = depart[L] + k * pas[L]; if (u + 0.6 > fin) return; c.ft(b, { opacity: 0, y: -420 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.in' }, u); c.ft(b, { y: 0 }, { y: 0, duration: 0.01 }, u + 0.5); c.ft(b, { scaleY: 1 }, { scaleY: 1, duration: 0.01 }, u + 0.5); }));
    // Finale : les lignes complètes clignotent et disparaissent, les blocs du dessus descendent d'un cran puis s'effacent à leur tour.
    const rang0 = bl.filter((b) => +b.dataset.row === 0), rang1 = bl.filter((b) => +b.dataset.row === 1);
    gsap.set(bl, { svgOrigin: '540 420' });
    repete(tc, tc + 0.6, 0.1, (u, n) => c.ft(rang0, { opacity: n % 2 ? 1 : 0.3 }, { opacity: n % 2 ? 0.3 : 1, duration: 0.1 }, u));
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.3, duration: 0.1 }, tc + 0.6); c.ft(q('.flash'), { opacity: 0.3 }, { opacity: 0, duration: 0.5 }, tc + 0.7);
    c.ft(rang0, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.2, duration: 0.3 }, tc + 0.6);
    c.ft(rang1, { y: 0 }, { y: 110, duration: 0.35, ease: 'bounce.out' }, tc + 0.9);
    repete(tc + 1.4, tc + 2, 0.1, (u, n) => c.ft(rang1, { opacity: n % 2 ? 1 : 0.3 }, { opacity: n % 2 ? 0.3 : 1, duration: 0.1 }, u));
    c.ft(rang1, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.2, duration: 0.3 }, tc + 2);
    c.ft(q('.flash'), { opacity: 0 }, { opacity: 0.3, duration: 0.1 }, tc + 2); c.ft(q('.flash'), { opacity: 0.3 }, { opacity: 0, duration: 0.5 }, tc + 2.1);
  }

  // --- Fondue : un caquelon de fromage qui bout, une fourchette avec du pain qui trempe ; finale : le grand étirement du fromage. ---
  function fondue() {
    const bulles = bornes('bul', 7, (i, a) => `<circle ${a} cx="${450 + i * 30}" cy="252" r="${10 + (i % 3) * 3}" fill="#ffe27a" stroke="#e8b84a" stroke-width="3" opacity="0"/>`);
    const vap = bornes('vap', 6, (i, a) => `<circle ${a} cx="${470 + i * 25}" cy="236" r="22" fill="#ffffff" opacity="0"/>`);
    const gtt = bornes('gtt', 16, (i, a) => `<circle ${a} cx="540" cy="240" r="${9 + (i % 4) * 3}" fill="${i % 2 ? '#ffd45c' : '#f2b632'}" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420"><ellipse class="chaleur2" cx="540" cy="412" rx="210" ry="12" fill="#ff7a2e" opacity=".25"/>
      <line class="fil" x1="540" y1="252" x2="540" y2="200" stroke="#ffd45c" stroke-width="7" stroke-linecap="round" opacity="0"/>
      <g class="fk"><rect x="528" y="-70" width="24" height="90" rx="12" fill="#6b4a32"/><rect x="536" y="10" width="8" height="150" fill="#8f9bb3"/><rect x="504" y="130" width="72" height="70" rx="10" fill="#f2d9a6" stroke="#c9a060" stroke-width="3"/><path d="M514 148 H566 M514 168 H566" stroke="#e5c78a" stroke-width="3"/></g>
      <path d="M360 250 C360 360 420 398 540 398 C660 398 720 360 720 250Z" fill="#d9534f"/><rect x="324" y="268" width="46" height="18" rx="9" fill="#b03a37"/><rect x="710" y="268" width="46" height="18" rx="9" fill="#b03a37"/>
      <ellipse cx="540" cy="250" rx="180" ry="16" fill="#b03a37"/><ellipse class="fromage" cx="540" cy="252" rx="165" ry="12" fill="#ffd45c"/>${bulles}${vap}${gtt}</svg>`;
  }
  function fonduer(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), fk = q('.fk'), fil = q('.fil');
    gsap.set(qa('.bul'), { opacity: 0 }); gsap.set(qa('.vap'), { opacity: 0 }); gsap.set(qa('.gtt'), { opacity: 0 }); gsap.set(fil, { opacity: 0 });
    // Niveau 0 : la fourchette se balance ; niveau 1 : le pain trempe et file du fromage ; niveau 2 : trempage rapide.
    let t = t0, y0 = 0, i = 0;
    while (t + 0.5 < stop) { const L = t >= T2 ? 2 : t >= T1 ? 1 : 0;
      if (L === 0) { const y1 = i % 2 ? 8 : -8; c.ft(fk, { y: y0 }, { y: y1, duration: 1.4, ease: 'sine.inOut' }, t); y0 = y1; t += 1.4; }
      else { const P = L === 1 ? 1.6 : 1.0; c.ft(fk, { y: y0 }, { y: 105, duration: 0.35 * P, ease: 'power2.in' }, t); c.ft(fk, { y: 105 }, { y: 0, duration: 0.4 * P, ease: 'power2.out' }, t + 0.35 * P); y0 = 0;
        c.ft(fil, { opacity: 0, attr: { y2: 252, 'stroke-width': 8 } }, { opacity: 0.95, attr: { y2: 196, 'stroke-width': 4 }, duration: 0.2 * P, ease: 'none' }, t + 0.5 * P); c.ft(fil, { opacity: 0.95 }, { opacity: 0, duration: 0.1 * P }, t + 0.75 * P); t += P; }
      i += 1; }
    qa('.bul').forEach((b, j) => { const dur = 1.3, depart = j < 3 ? t0 + 0.4 * j : T1 + 0.2 * j; repete(depart, fin, dur, (u) => { c.ft(b, { opacity: 0, scale: 0.3, y: 0 }, { opacity: 0.95, scale: 1, y: -10, duration: dur * 0.7, ease: 'sine.out' }, u); c.ft(b, { scale: 1, opacity: 0.95 }, { scale: 1.5, opacity: 0, duration: dur * 0.3 }, u + dur * 0.7); }); });
    qa('.vap').forEach((v, j) => { for (let u = T1 + 0.3 * j; u + 2.2 < fin; u += 2.2) { const fort = u >= T2; c.ft(v, { opacity: 0, x: 0, y: 0, scale: 0.5 }, { opacity: fort ? 0.6 : 0.3, duration: 0.3 }, u); c.ft(v, { x: 0, y: 0, scale: 0.5 }, { x: (j % 2 ? 30 : -30), y: -(fort ? 160 : 110), scale: 1.6, duration: 2.2, ease: 'power1.out' }, u); c.ft(v, { opacity: fort ? 0.6 : 0.3 }, { opacity: 0, duration: 1.5 }, u + 0.7); } });
    c.ft(q('.chaleur2'), { opacity: 0.25 }, { opacity: 0.55, duration: 0.6 }, T1); c.ft(q('.chaleur2'), { opacity: 0.55 }, { opacity: 0.9, duration: 0.6 }, T2);
    // Finale : le grand étirement : le pain monte très haut, le fil de fromage s'amincit, puis casse ; une pluie de gouttes dorées.
    c.ft(fk, { y: y0 }, { y: -330, duration: 1.3, ease: 'power2.out' }, tc);
    c.ft(fil, { opacity: 0, attr: { y2: 200, 'stroke-width': 8 } }, { opacity: 1, duration: 0.1 }, tc); c.ft(fil, { attr: { y2: 200 } }, { attr: { y2: -135 }, duration: 1.3, ease: 'power2.out' }, tc); c.ft(fil, { attr: { 'stroke-width': 8 } }, { attr: { 'stroke-width': 2 }, duration: 1.3, ease: 'none' }, tc);
    c.ft(fil, { opacity: 1 }, { opacity: 0, duration: 0.15 }, tc + 1.3);
    c.ft(fk, { y: -330 }, { y: 0, duration: 0.7, ease: 'back.out(1.5)' }, tc + 1.5);
    jaillir(c, qa, '.gtt', tc + 1.3, fin, 190, 30);
  }

  // --- Dunes (désert) : soleil, dunes qui ondulent, vent puis tempête de sable ; finale : la tempête se dissipe et révèle une oasis. ---
  function dunes() {
    const grains = bornes('grain', 24, (i, a) => `<ellipse ${a} cx="-60" cy="${60 + (i * 37) % 330}" rx="${12 + (i % 3) * 4}" ry="3" fill="#f1d199" opacity="0"/>`);
    const palme = (x, sc) => `<g transform="translate(${x} 392) scale(${sc})"><path d="M0 0 C10 -50 -6 -100 8 -150" stroke="#6b4a32" stroke-width="12" fill="none" stroke-linecap="round"/><g class="palmes"><ellipse cx="-34" cy="-160" rx="40" ry="12" fill="#3fa34d" transform="rotate(-25 -34 -160)"/><ellipse cx="46" cy="-160" rx="40" ry="12" fill="#46ad55" transform="rotate(25 46 -160)"/><ellipse cx="6" cy="-180" rx="34" ry="11" fill="#3b9a49" transform="rotate(-80 6 -180)"/><ellipse cx="-12" cy="-150" rx="34" ry="10" fill="#46ad55" transform="rotate(-8 -12 -150)"/></g></g>`;
    const eclats = bornes('eclat2', 8, (i, a) => `<circle ${a} cx="${420 + i * 34}" cy="${398 + (i % 2) * 8}" r="4" fill="#ffffff" opacity="0"/>`);
    return `<svg class="danse" viewBox="0 0 1080 420"><circle class="sol2" cx="880" cy="120" r="80" fill="#ffd45c" opacity=".95"/><circle cx="880" cy="120" r="120" fill="#ffd45c" opacity=".18"/>
      <path class="dn1" d="M-300 330 C -100 270 100 340 320 300 S 700 270 900 320 S 1200 300 1400 320 V 440 H-300Z" fill="#c67a2c"/><path class="dn2" d="M-300 362 C -100 322 150 380 380 346 S 760 330 960 372 S 1250 350 1400 366 V 440 H-300Z" fill="#a8571a"/>
      <g class="oasis" opacity="0"><ellipse cx="540" cy="400" rx="190" ry="24" fill="#3ec7e8"/><ellipse cx="540" cy="396" rx="150" ry="14" fill="#8fe3f5" opacity=".6"/>${palme(400, 0.9)}${palme(690, 1.05)}${palme(560, 0.7)}${eclats}</g>
      <path class="dn3" d="M-300 396 C -50 376 200 412 460 392 S 840 380 1080 400 S 1300 392 1400 398 V 440 H-300Z" fill="#7a3a10"/>${grains}<rect class="tempete" x="-100" y="-1500" width="1300" height="1960" fill="#c98a3b" opacity="0"/></svg>`;
  }
  function dunader(c, el, p, t0, d) {
    const q = (s) => el.querySelector(s), qa = (s) => [...el.querySelectorAll(s)], { T1, T2 } = niveaux(p, t0), fin = t0 + d, tc = tFinale(p, t0), stop = Math.min(fin, tc), sol = q('.sol2'), oasis = q('.oasis');
    gsap.set(sol, { svgOrigin: '880 120' }); gsap.set(oasis, { svgOrigin: '540 410', opacity: 0 }); gsap.set(qa('.grain'), { opacity: 0 }); gsap.set(qa('.eclat2'), { opacity: 0 }); gsap.set(q('.tempete'), { opacity: 0 });
    qa('.palmes').forEach((pm) => gsap.set(pm, { svgOrigin: '8 -150' }));
    // Les dunes ondulent en glissant, le soleil grossit et rougit au fil des mots.
    [q('.dn1'), q('.dn2'), q('.dn3')].forEach((o, j) => { let x = 0; repete(t0, stop, 2.4, (u) => { const L = u >= T2 ? 2 : u >= T1 ? 1 : 0, dx = [26, 40, 60][L] * (j % 2 ? -1 : 1); c.ft(o, { x }, { x: x === 0 ? dx : 0, duration: 2.4, ease: 'sine.inOut' }, u); x = x === 0 ? dx : 0; }); });
    c.ft(sol, { scale: 1 }, { scale: 1.18, duration: 0.8 }, T1); c.ft(sol, { scale: 1.18, fill: '#ffd45c' }, { scale: 1.35, fill: '#ff9a3c', duration: 0.8 }, T2);
    // Vent (niveau 1), tempête de sable (niveau 2) : des traits de sable traversent l'écran, le ciel brunit.
    qa('.grain').forEach((g, j) => { for (let u = T1 + (j % 8) * 0.18; u + 1 < stop; u += (u >= T2 ? 0.9 : 1.8)) { const dur = u >= T2 ? 0.9 : 1.8; c.ft(g, { opacity: 0, x: 0 }, { opacity: 0.75, duration: 0.1 }, u); c.ft(g, { x: 0 }, { x: 1240, duration: dur, ease: 'none' }, u); c.ft(g, { opacity: 0.75 }, { opacity: 0, duration: 0.15 }, u + dur - 0.15); } });
    c.ft(q('.tempete'), { opacity: 0 }, { opacity: 0.14, duration: 0.8 }, T1); c.ft(q('.tempete'), { opacity: 0.14 }, { opacity: 0.28, duration: 0.8 }, T2);
    // Finale : la tempête culmine, puis se dissipe et révèle une oasis (palmiers, eau qui scintille).
    c.ft(q('.tempete'), { opacity: 0.28 }, { opacity: 0.6, duration: 0.6 }, tc); c.ft(q('.tempete'), { opacity: 0.6 }, { opacity: 0, duration: 1.3 }, tc + 0.6);
    qa('.grain').forEach((g, j) => { for (let u = tc + (j % 6) * 0.1, k = 0; u + 0.7 < Math.min(fin, tc + 1.9); u += 0.6, k += 1) { c.ft(g, { opacity: 0, x: 0 }, { opacity: 0.9, duration: 0.08 }, u); c.ft(g, { x: 0 }, { x: 1240, duration: 0.6, ease: 'none' }, u); c.ft(g, { opacity: 0.9 }, { opacity: 0, duration: 0.1 }, u + 0.5); } });
    c.ft(oasis, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.9, ease: 'back.out(1.5)' }, tc + 1.1);
    qa('.palmes').forEach((pm, j) => repete(tc + 2, fin, 0.9, (u, n) => c.ft(pm, { rotation: n % 2 ? 5 : -5 }, { rotation: n % 2 ? -5 : 5, duration: 0.9, ease: 'sine.inOut' }, u)));
    qa('.eclat2').forEach((e, j) => repete(tc + 2 + (j % 4) * 0.12, fin, 0.7, (u, n) => c.ft(e, { opacity: n % 2 ? 1 : 0.1 }, { opacity: n % 2 ? 0.1 : 1, duration: 0.35 }, u)));
  }
  const ANIMS = { danse: [danse, danser], fusee: [fusee, fuser], volcan: [volcan, volcanner], robot: [robot, roboter], vague: [vague, vaguer], iceberg: [iceberg, icebergue], immeubles: [immeubles, immeubler], foret: [foret, forester], marmite: [marmite, marmiter], vinyle: [vinyle, vinyler], cinema: [cinema, cineaster], stade: [stade, stader], blocs: [blocs, blocser], fondue: [fondue, fonduer], dunes: [dunes, dunader] };
  const anim = (nom) => ANIMS[nom] || ANIMS.danse;
  const degrade3 = (c1, c2, c3, titre) => ({ titre: titre || '#ffffff', bas: '', fond: `<defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset=".55" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs><rect width="1080" height="1920" fill="url(#dg)"/>${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 233) % 1080}" cy="${(i * 397) % 1500}" r="${2 + (i % 3) * 2}" fill="#ffffff" opacity="${0.05 + (i % 4) * 0.03}"/>`).join('')}` });
  const DECORS = { degrade: DEGRADE, espace: ESPACE, musique: degrade3('#5b1a8c', '#2a0f4c', '#07030f'), cinema: degrade3('#7a1522', '#33080f', '#060203'), stade: degrade3('#12503a', '#0b2a24', '#030b09'), jeux: degrade3('#1b2a6b', '#341a6b', '#06040f'), fromage: degrade3('#d98a1f', '#8a4a0c', '#1f0d04'), ocean: degrade3('#0a6fa8', '#06375e', '#020f1f'), jungle: degrade3('#1f7a3a', '#0d3d22', '#030f08'), desert: degrade3('#e0953a', '#8a3d1c', '#1b0a06'), banquise: degrade3('#6fb8e8', '#2a4f8f', '#0a1330'), ville: degrade3('#2b1a5e', '#14123a', '#05050f'), foret: degrade3('#3f8a4f', '#1b4a35', '#05140d'), volcans: degrade3('#a1231a', '#4a0f14', '#0b0305'), abysses: degrade3('#0b3b5c', '#06203a', '#01060f'), cuisine: degrade3('#e0603a', '#8a2a2a', '#1f0a0e'), livres: LIVRES, plage: PLAGE, 'plage-affiche': AFFICHE, 'plage-geo': GEO, 'plage-carte': CARTE, 'plage-crepuscule': CREPUSCULE, 'livres-bureau': BUREAU, 'livres-biblio': BIBLIO };
  const decor = (nom) => DECORS[nom] || DECORS.livres;
  return { decor, DECORS, animer, danse, danser, fusee, fuser, anim };
});
