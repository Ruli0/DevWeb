/*
 * Les plans visuels de la chaîne « avis ». Ils occupent le haut de l'image (y 280 à 1040) ; les sous-titres sont dessous.
 * Chaque plan : ancres(p) (les champs calés sur un mot de la voix), textes(p), dessin(p, u) côté Node, jouer(c, el, p, t0, d) côté page.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.plans = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const q = (el, s) => el.querySelector(s), qa = (el, s) => [...el.querySelectorAll(s)];
  const GR = typeof require === 'function' ? require('./grille.js') : (typeof self !== 'undefined' ? self : this).Avis.grille;
  const DEC = typeof require === 'function' ? require('./jeu-decors.js') : (typeof self !== 'undefined' ? self : this).Avis.jeuDecors;
  // Fond animé (« vidéo » de fond), dessiné une fois, animé image par image par animerFond(). Tout est périodique sur la durée
  // publiée (durée − amorce) : quand la vidéo reboucle, le fond est exactement au même état. Seul décor pour l'instant : désert.
  const hf = (k) => { const x = Math.sin(k * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };

  // Fond « château » (dessins animés) : un château de conte perché sur une colline, au coucher du soleil (ciel dégradé, soleil et rayons, montagnes
  // et collines lointaines dans la brume, arbres, cerisiers roses, chemin qui serpente), dessiné en SVG. Une caméra s'en approche (échelle autour
  // de la porte, avec parallaxe : les plans lointains grossissent moins) selon un niveau global (fondAnimeOpts.cles : [[temps global, échelle]]),
  // la porte s'ouvre sur une lumière dorée, un flash doré recouvre l'écran, puis le château est de nouveau lointain : la vidéo reboucle sans coupure.
  const GX = 540, GY = 1330;   // centre du bas de la porte (point fixe du zoom)
  function chateauSvg() {
    const E = 'stroke="#5d3399" stroke-width="5" stroke-linejoin="round"', f1 = (v) => v.toFixed(1);
    // crête lisse (quadratiques entre milieux) fermée vers le bas
    const crete = (pts, bas) => { let d = `M${pts[0][0]} ${bas} L${pts[0][0]} ${pts[0][1]}`; for (let i = 1; i < pts.length - 1; i += 1) d += ` Q${pts[i][0]} ${pts[i][1]} ${f1((pts[i][0] + pts[i + 1][0]) / 2)} ${f1((pts[i][1] + pts[i + 1][1]) / 2)}`; const z = pts[pts.length - 1]; return `${d} L${z[0]} ${z[1]} L${z[0]} ${bas} Z`; };
    const monts = crete([[-500, 1190], [-330, 1060], [-120, 1175], [90, 1040], [300, 1170], [500, 1085], [720, 1180], [900, 1050], [1130, 1175], [1330, 1070], [1580, 1190]], 1340);
    const neige = [[-330, 1060], [90, 1040], [500, 1085], [900, 1050], [1330, 1070]].map(([x, y]) => `<path d="M${x - 46} ${y + 40} L${x} ${y} L${x + 46} ${y + 40} L${x + 22} ${y + 30} L${x} ${y + 48} L${x - 22} ${y + 32} Z" fill="#ffe9f6" fill-opacity=".7"/>`).join('');
    const col1 = crete([[-500, 1290], [-250, 1235], [0, 1290], [260, 1225], [520, 1292], [800, 1230], [1050, 1290], [1320, 1235], [1580, 1295]], 1345);
    const col2 = crete([[-500, 1320], [-200, 1285], [140, 1325], [430, 1290], [700, 1330], [980, 1288], [1300, 1328], [1580, 1296]], 1350);
    // arbres : feuillus, pins et cerisiers roses
    const feuillu = (x, y, k, c1, c2, c3) => `<rect x="${f1(x - 5 * k)}" y="${f1(y - 44 * k)}" width="${f1(10 * k)}" height="${f1(44 * k)}" fill="#5a3a2a"/><circle cx="${x}" cy="${f1(y - 78 * k)}" r="${f1(40 * k)}" fill="${c1}"/><circle cx="${f1(x - 26 * k)}" cy="${f1(y - 56 * k)}" r="${f1(30 * k)}" fill="${c1}"/><circle cx="${f1(x + 26 * k)}" cy="${f1(y - 56 * k)}" r="${f1(30 * k)}" fill="${c2}"/><circle cx="${f1(x - 12 * k)}" cy="${f1(y - 92 * k)}" r="${f1(20 * k)}" fill="${c3}" fill-opacity=".85"/>`;
    const pin = (x, y, k) => `<rect x="${f1(x - 4 * k)}" y="${f1(y - 18 * k)}" width="${f1(8 * k)}" height="${f1(18 * k)}" fill="#5a3a2a"/>` + [0, 1, 2].map((i) => `<path d="M${f1(x - (56 - i * 12) * k)} ${f1(y - (14 + i * 40) * k)} L${x} ${f1(y - (74 + i * 40) * k)} L${f1(x + (56 - i * 12) * k)} ${f1(y - (14 + i * 40) * k)} Z" fill="${i === 1 ? '#25785f' : '#1d6a56'}"/>`).join('');
    const vert = [['#2f8f5b', '#3fa86c', '#79d495'], ['#2a7d57', '#379f69', '#6fcf8e']], rose = ['#f27bb4', '#ff9ccb', '#ffd0e6'];
    const arbres = [[-54, 1395, 0.9, 'v'], [-110, 1420, 0.8, 'p'], [-296, 1565, 1.3, 'r'], [-420, 1640, 1.4, 'v'], [-583, 1809, 1.9, 'p'], [-250, 1700, 1.5, 'p'], [1134, 1395, 0.9, 'v'], [1190, 1420, 0.8, 'p'], [1376, 1565, 1.3, 'r'], [1500, 1640, 1.4, 'v'], [1663, 1809, 1.9, 'p'], [1330, 1700, 1.5, 'p'], [58, 1330, 0.7, 'r'], [1022, 1330, 0.7, 'r'], [-8, 1350, 0.75, 'v'], [1088, 1350, 0.75, 'v']]
      .map(([x, y, k, t], i) => (t === 'p' ? pin(x, y, k) : t === 'r' ? feuillu(x, y, k, rose[0], rose[1], rose[2]) : feuillu(x, y, k, ...vert[i % 2]))).join('');
    // chemin qui serpente (du bas de la porte vers l'avant-plan)
    const centre = (u) => [540 + 150 * Math.sin(u * 4.4) * Math.pow(u, 0.85), GY + u * 1500], demi = (u) => 34 + 300 * Math.pow(u, 1.1);
    let g = '', dr = '';
    for (let i = 0; i <= 40; i += 1) { const u = i / 40, [cx, cy] = centre(u); g += `${i ? 'L' : 'M'}${f1(cx - demi(u))} ${f1(cy)} `; }
    for (let i = 40; i >= 0; i -= 1) { const u = i / 40, [cx, cy] = centre(u); dr += `L${f1(cx + demi(u))} ${f1(cy)} `; }
    const chemin = `<path d="${g}${dr}Z" fill="url(#ch-chemin)" stroke="#fff1d6" stroke-opacity=".7" stroke-width="6"/>` + Array.from({ length: 9 }, (_, k) => { const u = 0.08 + k * 0.1, [cx, cy] = centre(u), w = demi(u); return `<path d="M${f1(cx - w * 0.82)} ${f1(cy)} Q${f1(cx)} ${f1(cy - 10 - 16 * u)} ${f1(cx + w * 0.82)} ${f1(cy)}" fill="none" stroke="#b98657" stroke-opacity=".35" stroke-width="${f1(3 + 6 * u)}"/>`; }).join('');
    const fleurs = Array.from({ length: 90 }, (_, k) => { const y = 1480 + hf(k + 3) * 880, x = 540 + (hf(k + 41) - 0.5) * (900 + (y - 1330) * 1.5); return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(5 + hf(k + 7) * 7 * (y - 1330) / 700)}" fill="${['#ffffff', '#ffd4ea', '#ffe27a', '#ff9ccb'][k % 4]}" fill-opacity=".85"/>`; }).join('');
    const bosses = '<ellipse cx="-120" cy="1650" rx="520" ry="110" fill="#8fd68a" fill-opacity=".30"/><ellipse cx="1210" cy="1700" rx="560" ry="120" fill="#8fd68a" fill-opacity=".28"/><ellipse cx="-300" cy="1950" rx="620" ry="160" fill="#1c5a55" fill-opacity=".38"/><ellipse cx="1380" cy="2000" rx="640" ry="170" fill="#1c5a55" fill-opacity=".38"/><ellipse cx="540" cy="2150" rx="900" ry="200" fill="#154a52" fill-opacity=".30"/>';
    // château
    const merlons = Array.from({ length: 14 }, (_, k) => `<rect x="${112 + k * 62}" y="868" width="38" height="36" ${E} fill="url(#ch-mur)"/>`).join('');
    const briques = Array.from({ length: 6 }, (_, k) => `<path d="M120 ${960 + k * 62} H960" stroke="#6f3fb0" stroke-opacity=".22" stroke-width="4"/>`).join('');
    const fen = (cx, y) => `<circle cx="${cx}" cy="${y + 26}" r="34" fill="#ffd36b" fill-opacity=".28"/><path d="M${cx - 17} ${y + 56} V${y + 22} Q${cx} ${y - 8} ${cx + 17} ${y + 22} V${y + 56} Z" ${E} fill="#ffe27a"/>`;
    const tour = (x0, x1, haut, apex, nom) => {
      const cx = (x0 + x1) / 2, w = x1 - x0;
      return `<rect x="${x0}" y="${haut}" width="${w}" height="${GY - haut}" ${E} fill="url(#ch-mur)"/>`
        + `<path d="M${x1 - 12} ${haut + 20} V${GY - 4}" stroke="#5d3399" stroke-opacity=".28" stroke-width="16" stroke-linecap="round"/><path d="M${x0 + 9} ${haut + 70} V${GY - 4}" stroke="#ffffff" stroke-opacity=".32" stroke-width="9" stroke-linecap="round"/>`
        + `<path d="M${x0 - 22} ${haut} L${cx} ${apex} L${x1 + 22} ${haut} Z" ${E} fill="url(#ch-toit)"/><path d="M${cx} ${apex + 8} L${x1 + 8} ${haut - 4} L${cx + 20} ${haut - 4} Z" fill="#5d1f7a" fill-opacity=".28"/>`
        + `<rect x="${x0 - 22}" y="${haut - 8}" width="${w + 44}" height="16" rx="6" ${E} fill="#ffd45c"/>`
        + `<circle cx="${cx}" cy="${apex - 6}" r="12" ${E} fill="#ffd45c"/>`
        + `<g class="ch-drap" data-px="${cx}" data-py="${apex - 18}"><path d="M${cx} ${apex - 18} V${apex - 92}" stroke="#5d3399" stroke-width="5"/><path d="M${cx} ${apex - 92} L${cx + 66} ${apex - 70} L${cx} ${apex - 48} Z" ${E} fill="#ff6fb5"/></g>`
        + fen(cx, haut + (GY - haut) * 0.16) + fen(cx, haut + (GY - haut) * 0.46);
    };
    const tours = tour(110, 230, 840, 700) + tour(850, 970, 840, 700) + tour(270, 390, 760, 610) + tour(690, 810, 760, 610) + tour(445, 635, 620, 380);
    const porte = `<path d="M475 ${GY} V1190 Q540 1075 605 1190 V${GY} Z" fill="#ffe9a0"/><g class="ch-lueur" opacity="0"><circle cx="540" cy="1230" r="70" fill="#ffffff" fill-opacity=".9"/></g>`
      + `<g class="ch-vantaux"><g class="ch-vg"><path d="M475 ${GY} V1190 Q508 1135 540 1126 V${GY} Z" ${E} fill="#5a2f9e"/><circle cx="522" cy="1250" r="7" fill="#ffd45c"/><circle cx="522" cy="1290" r="7" fill="#ffd45c"/></g><g class="ch-vd"><path d="M605 ${GY} V1190 Q572 1135 540 1126 V${GY} Z" ${E} fill="#5a2f9e"/><circle cx="558" cy="1250" r="7" fill="#ffd45c"/><circle cx="558" cy="1290" r="7" fill="#ffd45c"/></g></g>`
      + `<path d="M475 ${GY} V1190 Q540 1075 605 1190 V${GY}" fill="none" ${E}/>`;
    const colline = `<path d="M-1200 2500 C-700 1950 -100 1338 120 1326 L960 1326 C1180 1338 1780 1950 2280 2500 Z" fill="url(#ch-herbe)"/><path d="M-1200 2500 C-700 1950 -100 1338 120 1326 L960 1326 C1180 1338 1780 1950 2280 2500" fill="none" stroke="#c8f0a0" stroke-opacity=".55" stroke-width="8"/>`;
    const herbe = (x0, x1) => { let d = `M${x0} 1352 L${x0} 1326`; for (let x = x0; x < x1; x += 26) d += ` Q${x + 6} ${1306 - (x % 3) * 5} ${x + 13} 1324 Q${x + 20} 1310 ${x + 26} 1326`; return `<path d="${d} L${x1} 1352 Z" fill="#3f9a63"/>`; };
    const ombre = '<ellipse cx="540" cy="1338" rx="470" ry="20" fill="#2a1060" fill-opacity=".28"/><ellipse cx="540" cy="1350" rx="150" ry="22" fill="#ffd36b" fill-opacity=".32"/>';
    // ciel
    const rayons = Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * 2 * Math.PI, b = a + Math.PI / 16, R = 2400; return `<path d="M0 0 L${(R * Math.cos(a)).toFixed(0)} ${(R * Math.sin(a)).toFixed(0)} L${(R * Math.cos(b)).toFixed(0)} ${(R * Math.sin(b)).toFixed(0)} Z"/>`; }).join('');
    const nuages = Array.from({ length: 5 }, (_, k) => `<g class="ch-nuage" data-k="${k}" data-y="${(420 + k * 150 + hf(k + 5) * 60).toFixed(0)}" data-x="${(hf(k + 9) * 1300).toFixed(0)}"><ellipse cx="0" cy="0" rx="${120 + k * 10}" ry="${34 + k * 3}" fill="#ffc9e4" fill-opacity=".42"/><ellipse cx="-62" cy="12" rx="${74 + k * 6}" ry="26" fill="#ffd9c0" fill-opacity=".4"/><ellipse cx="66" cy="14" rx="80" ry="28" fill="#ffc9e4" fill-opacity=".4"/><ellipse cx="0" cy="22" rx="${130 + k * 10}" ry="12" fill="#ffb98a" fill-opacity=".3"/></g>`).join('');
    const etoiles = Array.from({ length: 12 }, (_, k) => `<path class="ch-etoile" data-k="${k}" d="M0 -13 L3.2 -3.2 L13 0 L3.2 3.2 L0 13 L-3.2 3.2 L-13 0 L-3.2 -3.2 Z" fill="${k % 3 ? '#fff4b0' : '#ffffff'}" transform="translate(${(70 + hf(k + 2) * 940).toFixed(0)} ${(310 + hf(k + 17) * 560).toFixed(0)})"/>`).join('');
    const brume = Array.from({ length: 4 }, (_, k) => `<ellipse class="ch-brume" data-k="${k}" data-x="${(hf(k + 21) * 1300).toFixed(0)}" cx="0" cy="${1262 + k * 22}" rx="${330 + k * 30}" ry="${24 + k * 4}" fill="#ffe3f0" fill-opacity=".26"/>`).join('');
    const oiseaux = Array.from({ length: 4 }, (_, k) => `<path class="ch-oiseau" data-k="${k}" d="M-14 0 Q-7 -11 0 0 Q7 -11 14 0" fill="none" stroke="#4a2680" stroke-width="4" stroke-linecap="round"/>`).join('');
    return `<svg class="fond-anime ch" viewBox="0 0 1080 1920" width="1080" height="1920"><defs>`
      + '<linearGradient id="ch-ciel" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1400"><stop offset="0" stop-color="#2c1f78"/><stop offset=".34" stop-color="#7a3fb8"/><stop offset=".6" stop-color="#d561b8"/><stop offset=".8" stop-color="#ff9aa8"/><stop offset="1" stop-color="#ffcf94"/></linearGradient>'
      + '<radialGradient id="ch-soleil" gradientUnits="userSpaceOnUse" cx="540" cy="1240" r="760"><stop offset="0" stop-color="#fff4b8" stop-opacity=".95"/><stop offset=".3" stop-color="#ffc27a" stop-opacity=".6"/><stop offset="1" stop-color="#ff8fb0" stop-opacity="0"/></radialGradient>'
      + '<linearGradient id="ch-mont" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a6fd0"/><stop offset="1" stop-color="#d79bd0"/></linearGradient>'
      + '<linearGradient id="ch-c1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6c8fc4"/><stop offset="1" stop-color="#c9a0d8"/></linearGradient>'
      + '<linearGradient id="ch-c2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f9a9a"/><stop offset="1" stop-color="#9bc4b0"/></linearGradient>'
      + '<linearGradient id="ch-mur" gradientUnits="userSpaceOnUse" x1="110" y1="0" x2="970" y2="0"><stop offset="0" stop-color="#d3adfb"/><stop offset=".55" stop-color="#b58af0"/><stop offset="1" stop-color="#9566d8"/></linearGradient>'
      + '<linearGradient id="ch-toit" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff9ccd"/><stop offset="1" stop-color="#e1469f"/></linearGradient>'
      + '<linearGradient id="ch-herbe" gradientUnits="userSpaceOnUse" x1="0" y1="1326" x2="0" y2="2500"><stop offset="0" stop-color="#5eb872"/><stop offset=".3" stop-color="#3e9a6c"/><stop offset=".7" stop-color="#26705f"/><stop offset="1" stop-color="#154349"/></linearGradient>'
      + '<linearGradient id="ch-chemin" gradientUnits="userSpaceOnUse" x1="0" y1="1330" x2="0" y2="2800"><stop offset="0" stop-color="#fbe9c8"/><stop offset="1" stop-color="#d9a877"/></linearGradient></defs>'
      + '<rect x="0" y="0" width="1080" height="1920" fill="url(#ch-ciel)"/><rect x="0" y="0" width="1080" height="1920" fill="url(#ch-soleil)"/>'
      + `<g transform="translate(540 1240)"><g class="ch-rayons" fill="#fff0b8" fill-opacity=".1">${rayons}</g></g><g class="ch-nuages">${nuages}</g><g class="ch-etoiles">${etoiles}</g>`
      + `<g class="ch-l0"><path d="${monts}" fill="url(#ch-mont)"/>${neige}</g><g class="ch-l1"><path d="${col1}" fill="url(#ch-c1)"/><path d="${col2}" fill="url(#ch-c2)"/></g><g class="ch-brumes">${brume}</g>`
      + `<g class="ch-monde">${colline}${bosses}${fleurs}${arbres}${ombre}${chemin}<rect x="110" y="900" width="860" height="${GY - 900}" ${E} fill="url(#ch-mur)"/>${briques}${merlons}${tours}${porte}${herbe(20, 478)}${herbe(602, 1060)}</g>`
      + `<g class="ch-oiseaux">${oiseaux}</g><rect class="ch-flash" x="0" y="0" width="1080" height="1920" fill="#fff0b8" opacity="0"/></svg>`;
  }
  function animerChateau(c, el, p, t0, d) {
    const sv = q(el, '.fond-anime'), O = p.fondAnimeOpts || {}, L = O.L || 38.9, cles = O.cles || [[0, 0.4], [L, 0.4]];
    const monde = q(sv, '.ch-monde'), l0 = q(sv, '.ch-l0'), l1 = q(sv, '.ch-l1'), vg = q(sv, '.ch-vg'), vd = q(sv, '.ch-vd'), lueur = q(sv, '.ch-lueur'), fl = q(sv, '.ch-flash'), ray = q(sv, '.ch-rayons');
    const drapeaux = qa(sv, '.ch-drap'), nuages = qa(sv, '.ch-nuage'), etoiles = qa(sv, '.ch-etoile'), brumes = qa(sv, '.ch-brume'), oiseaux = qa(sv, '.ch-oiseau');
    const mod = (a, b) => ((a % b) + b) % b, lis = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
    const echelle = (T) => { if (O.flash && T >= O.flash[1]) return cles[0][1];
      if (T <= cles[0][0]) return cles[0][1];
      for (let i = 1; i < cles.length; i += 1) if (T <= cles[i][0]) { const [ta, sa] = cles[i - 1], [tb, sb] = cles[i], u = (T - ta) / (tb - ta); return Math.exp(Math.log(sa) + (Math.log(sb) - Math.log(sa)) * (0.5 * lis(u) + 0.5 * u)); }
      return cles[cles.length - 1][1]; };
    const zoom = (g, k) => g.setAttribute('transform', `translate(${GX} ${GY}) scale(${k.toFixed(4)}) translate(${-GX} ${-GY})`);
    function rendre(t) {
      const T = (O.t0 || 0) + t, s = echelle(T);
      zoom(monde, s); zoom(l1, Math.pow(s, 0.45)); zoom(l0, Math.pow(s, 0.18));
      ray.setAttribute('transform', `rotate(${(45 * T / L).toFixed(3)})`);
      const ou = O.ouvre ? lis((T - O.ouvre[0]) / (O.ouvre[1] - O.ouvre[0])) : 0;
      vg.setAttribute('transform', `translate(475 0) scale(${(1 - 0.93 * ou).toFixed(3)} 1) translate(-475 0)`);
      vd.setAttribute('transform', `translate(605 0) scale(${(1 - 0.93 * ou).toFixed(3)} 1) translate(-605 0)`);
      lueur.setAttribute('opacity', ou.toFixed(3));
      let f = 0; if (O.flash) { const [a, b, e] = O.flash; f = T < b ? lis((T - a) / (b - a)) : 1 - lis((T - b) / (e - b)); f = T < a ? 0 : Math.max(0, f); }
      fl.setAttribute('opacity', (f * 0.96).toFixed(3));
      drapeaux.forEach((g, k) => { const n = 12 + 2 * (k % 3); g.setAttribute('transform', `rotate(${(7 * Math.sin(2 * Math.PI * n * T / L + k)).toFixed(2)} ${g.dataset.px} ${g.dataset.py})`); });
      nuages.forEach((g) => { const k = +g.dataset.k, x = mod(+g.dataset.x + 1300 * (1 + (k % 2)) * T / L, 1300) - 110; g.setAttribute('transform', `translate(${x.toFixed(1)} ${(+g.dataset.y + 14 * Math.sin(2 * Math.PI * 2 * T / L + k)).toFixed(1)})`); });
      brumes.forEach((g) => { const k = +g.dataset.k, x = mod(+g.dataset.x + 1300 * (1 + (k % 2)) * T / L, 1300) - 110; g.setAttribute('cx', x.toFixed(1)); });
      oiseaux.forEach((g) => { const k = +g.dataset.k, x = mod(120 + k * 310 + 1300 * 2 * T / L, 1300) - 110, y = 520 + k * 120 + 30 * Math.sin(2 * Math.PI * 4 * T / L + k * 2), b = 0.55 + 0.45 * Math.sin(2 * Math.PI * 80 * T / L + k); g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 ${b.toFixed(2)})`); });
      etoiles.forEach((g) => { const k = +g.dataset.k, v = Math.pow(Math.abs(Math.sin(Math.PI * (4 + (k % 4)) * T / L + k * 1.7)), 3); g.setAttribute('opacity', (0.15 + 0.85 * v).toFixed(2)); });
    }
    const pilote = { t: 0 }; rendre(0);
    c.ft(pilote, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => rendre(pilote.t) }, t0);
  }
  function fondAnimeSvg(nom, sans2d) {
    if (nom === 'chateau') return chateauSvg();
    if (nom !== 'desert') return '';
    const dune = (base, a1, a2, ph) => { let d = `M0 1920 L0 ${base}`; for (let x = 0; x <= 2160; x += 30) d += ` L${x} ${(base + a1 * Math.sin(2 * Math.PI * x / 1080 * 2 + ph) + a2 * Math.sin(2 * Math.PI * x / 1080 * 3 + ph * 2)).toFixed(1)}`; return `${d} L2160 1920 Z`; };
    const rayons = Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * 2 * Math.PI, b = a + Math.PI / 24, R = 2200; return `<path d="M0 0 L${(R * Math.cos(a)).toFixed(0)} ${(R * Math.sin(a)).toFixed(0)} L${(R * Math.cos(b)).toFixed(0)} ${(R * Math.sin(b)).toFixed(0)} Z"/>`; }).join('');
    const grains = Array.from({ length: 40 }, (_, k) => `<circle class="fa-grain" r="${(2 + hf(k + 3) * 3.5).toFixed(1)}" fill="#ffe7b8" fill-opacity="${(0.3 + hf(k + 7) * 0.35).toFixed(2)}" cx="0" cy="0"/>`).join('');
    const boule = `<g class="fa-boule" opacity="0"><g class="fa-boule-r"><circle r="52" fill="none" stroke="#8a5a2b" stroke-width="7" stroke-opacity=".8"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${(Math.cos(k) * 48).toFixed(0)} ${(Math.sin(k) * 48).toFixed(0)} Q${(Math.cos(k * 2.3) * 20).toFixed(0)} ${(Math.sin(k * 1.7) * 20).toFixed(0)} ${(Math.cos(k + 2.6) * 48).toFixed(0)} ${(Math.sin(k + 2.6) * 48).toFixed(0)}" fill="none" stroke="#a8743b" stroke-width="5" stroke-opacity=".85"/>`).join('')}</g></g>`;
    // Avec le fond 3D, seuls les grains de sable restent (le ciel, le soleil et les dunes sont en 3D).
    const d2d = sans2d ? '' : `<g transform="translate(930 1660)"><g class="fa-rayons" fill="#fff1c2" fill-opacity=".09">${rayons}</g></g><g class="fa-dune1"><path d="${dune(1540, 26, 14, 0.4)}" fill="#c9632e" fill-opacity=".42"/></g><g class="fa-dune2"><path d="${dune(1640, 30, 12, 1.9)}" fill="#9a3f1e" fill-opacity=".5"/></g>`;
    return `<svg class="fond-anime" viewBox="0 0 1080 1920" width="1080" height="1920">${d2d}${sans2d ? '' : boule}<g class="fa-grains">${grains}</g></svg>`;   // pas de buisson roulant avec le fond 3D (demande de Jules)
  }
  function animerFond(c, el, p, t0, d) {
    if (p.fondAnime === 'chateau') return animerChateau(c, el, p, t0, d);
    const sv = q(el, '.fond-anime'); if (!sv) return;
    const Lp = d - (p.amorceBoucle || 0), ray = q(sv, '.fa-rayons'), d1 = q(sv, '.fa-dune1'), d2 = q(sv, '.fa-dune2'), gr = qa(sv, '.fa-grain'), bo = q(sv, '.fa-boule'), bor = q(sv, '.fa-boule-r');
    const G = gr.map((_, k) => ({ x0: hf(k + 11) * 1180, y0: 260 + hf(k + 23) * 1560, m: 1 + Math.floor(hf(k + 31) * 3), a: 6 + hf(k + 41) * 16, ph: hf(k + 53) * 6.28 }));
    const mod = (a, b) => ((a % b) + b) % b;
    function rendre(t) {
      if (ray) ray.setAttribute('transform', `rotate(${(60 * t / Lp).toFixed(3)})`);
      if (d1) d1.setAttribute('transform', `translate(${(-mod(1080 * t / Lp, 1080)).toFixed(2)} 0)`);
      if (d2) d2.setAttribute('transform', `translate(${(-mod(2160 * t / Lp, 1080)).toFixed(2)} 0)`);
      gr.forEach((g, k) => { const P = G[k]; g.setAttribute('cx', (mod(P.x0 - 1180 * P.m * t / Lp, 1180) - 50).toFixed(1)); g.setAttribute('cy', (P.y0 + P.a * Math.sin(2 * Math.PI * 2 * t / Lp + P.ph)).toFixed(1)); });
      const a = 2.4, b = 7.4, u = (t - a) / (b - a);
      if (!bo) return;
      if (u <= 0 || u >= 1) { bo.setAttribute('opacity', '0'); return; }
      const x = -160 + 1400 * u, y = 1740 - Math.abs(Math.sin(Math.PI * u * 5)) * 80;
      bo.setAttribute('opacity', '1'); bo.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); bor.setAttribute('transform', `rotate(${(x / 52 * 57.3).toFixed(1)})`);
    }
    const pilote = { t: 0 }; rendre(0);
    c.ft(pilote, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => rendre(pilote.t) }, t0);
  }

  // Le bloc de glace qui emprisonne le hibou (presentateur.glace) et les deux flammes qui le font fondre.
  // Coordonnées du dessin du hibou (pieds en 0, tête vers -460) ; tout est animé par animerHibou2 (rendre).
  function glaceSvg(G) {
    G = G || {};
    const fl = (cls, x) => `<g class="${cls}" transform="translate(${x} -6)"><path class="f1" fill="#ff5a1f" fill-opacity=".85"/><path class="f2" fill="#ffb020"/><path class="f3" fill="#fff4b0"/></g>`;
    const eclats = Array.from({ length: 12 }, (_, k) => { const a = (k * 47) % 360, r = 40 + (k * 29) % 50; return `<path class="eclat" d="M0 -${r} L${r * 0.7} ${r * 0.3} L-${r * 0.5} ${r * 0.6} Z" fill="#dff6ff" fill-opacity=".85" stroke="#ffffff" stroke-width="3" opacity="0" transform="rotate(${a})"/>`; }).join('');
    const fentes = ['M-60 -470 L-20 -400 L-50 -330 L-10 -260', 'M90 -430 L50 -360 L95 -300', 'M-120 -200 L-70 -160 L-100 -90', 'M40 -150 L100 -110 L70 -40', 'M-20 -520 L10 -470 L-15 -420'].map((d, k) => `<path class="fente" d="${d}" fill="none" stroke="#ffffff" stroke-width="5" stroke-linecap="round" opacity="0" data-k="${k}"/>`).join('');
    const gouttes = Array.from({ length: 8 }, (_, k) => `<ellipse class="goutte" cx="0" cy="0" rx="7" ry="11" fill="#bfeaff" fill-opacity=".85" opacity="0" data-k="${k}"/>`).join('');
    // Mode marteau : fissures en étoile depuis le point d'impact (5 niveaux), copeaux, jauge de 5 glaçons, marteau.
    const IX = -150, IY = -470, hm = (k) => { const x = Math.sin(k * 91.7 + 3.1) * 43758.5; return x - Math.floor(x); };
    const fentesM = G.marteau ? Array.from({ length: 5 }, (_, n) => `<g class="fm" opacity="0">${Array.from({ length: 4 }, (_, j) => { const a = (n * 4 + j) * 0.9 + hm(n * 7 + j) * 0.6, r = 90 + 70 * n + 60 * hm(j + n * 3); let d = `M${IX} ${IY}`, x = IX, y = IY; for (let q2 = 1; q2 <= 3; q2 += 1) { x = IX + Math.cos(a + (hm(q2 + j) - 0.5) * 0.5) * r * q2 / 3; y = IY + Math.abs(Math.sin(a + (hm(q2 + n) - 0.5) * 0.5)) * r * q2 / 3; d += ` L${x.toFixed(0)} ${y.toFixed(0)}`; } return `<path d="${d}" fill="none" stroke="#ffffff" stroke-width="${6 - n * 0.6}" stroke-linecap="round" stroke-linejoin="round"/>`; }).join('')}</g>`).join('') : '';
    const copeaux = G.marteau ? Array.from({ length: 8 }, (_, k) => `<path class="copeau" d="M0 -14 L12 6 L-10 9 Z" fill="#e6f8ff" stroke="#ffffff" stroke-width="2" opacity="0"/>`).join('') : '';
    const jauge = G.marteau ? `<g class="jauge-glace">${Array.from({ length: 5 }, (_, k) => `<g class="jg-cube" transform="translate(${-170 + k * 85} -640)"><rect x="-32" y="-32" width="64" height="64" rx="12" fill="#cdeeff" fill-opacity=".9" stroke="#ffffff" stroke-width="5"/><path d="M-20 -18 L-6 -18" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/></g>`).join('')}</g>` : '';
    const marteau = G.marteau ? `<g class="marteau" transform="translate(60 -900)"><g class="marteau-r"><rect x="-14" y="0" width="28" height="450" rx="10" fill="#8a5a2b" stroke="#3b2412" stroke-width="5"/><rect x="-6" y="10" width="6" height="430" fill="#c08a52" opacity=".7"/><rect x="-17" y="10" width="34" height="70" rx="8" fill="#3b2412"/><g transform="translate(0 478)"><rect x="-95" y="-48" width="190" height="96" rx="14" fill="#9aa6b2" stroke="#2c333a" stroke-width="6"/><rect x="-85" y="-40" width="170" height="20" rx="8" fill="#e8eef4" opacity=".8"/><rect x="-95" y="-48" width="30" height="96" rx="8" fill="#6d7884"/></g></g></g>` : '';
    return `<g class="glace-tout">${fl('flamme fl-g', -205)}${fl('flamme fl-d', 205)}<g class="bloc"><clipPath id="glace-clip"><rect class="bloc-clip" x="-185" y="-540" width="370" height="560" rx="38"/></clipPath>`
      + `<g clip-path="url(#glace-clip)"><rect x="-185" y="-540" width="370" height="560" rx="38" fill="#cdeeff" fill-opacity=".6"/><ellipse cx="-110" cy="0" rx="120" ry="70" fill="#ffffff" fill-opacity=".5"/><ellipse cx="130" cy="-10" rx="110" ry="60" fill="#ffffff" fill-opacity=".42"/><ellipse cx="0" cy="-540" rx="170" ry="40" fill="#ffffff" fill-opacity=".45"/>`
      + `<rect x="-185" y="-540" width="370" height="560" rx="38" fill="none" stroke="#ffffff" stroke-opacity=".95" stroke-width="9"/>`
      + `<path d="M-150 -500 L-120 -500 L-160 -60 L-175 -60 Z" fill="#ffffff" fill-opacity=".55"/><path d="M120 -510 L150 -510 L140 -300 L118 -300 Z" fill="#ffffff" fill-opacity=".35"/>${fentes}${fentesM}</g>`
      + `<path class="bord-fonte" fill="#e6f7ff" fill-opacity=".9"/></g>${gouttes}<g class="eclats">${eclats}</g>${copeaux}${jauge}${marteau}</g>`;
  }

  // Le hibou 2 : animé image par image par une seule fonction du temps (rendre(t)), appelée par un « pilote » GSAP fini.
  // Tout est continu (sinus, courbes lissées), donc fluide et identique à chaque rendu. Les attributs sont posés directement.
  // Émotions par phrase (lignes[].emotion) : sourcils, inclinaison de tête, gestes d'ailes ; synchro labiale (lignes[].env) ;
  // regard vers chaque nouvelle lettre ; clignements ; folies : zoom (phrase 1), tremble (panique), ejecte (révélation).
  function animerHibou2(c, el, p, t0, d) {
    const pr = q(el, '.presente'), Q = (s) => q(pr, s), P = PERSO();
    const pos = Q('.h2-pos'), corps = Q('.h2-corps'), tete = Q('.h2-tete'), ag = Q('.h2-ag'), ad = Q('.h2-ad'), sg = Q('.h2-sg'), sd = Q('.h2-sd');
    const pg = Q('.h2-pg'), pd = Q('.h2-pd'), lg = Q('.h2-lg'), ld = Q('.h2-ld'), bouche = Q('.h2-bouche'), langue = Q('.h2-langue'), mach = Q('.h2-mach');
    const fantomes = qa(pr, '.h2-fantome'), svgP = q(pr, 'svg'), cadre = q(el, '.cadre'), plumes = qa(pr, '.plume'), confettis = qa(pr, '.confetti'), flash = Q('.flash'), poussiere = qa(pr, '.poussiere');
    const L = p.presentateur.lignes || [], m0 = p.mots[0], et = p.muetCfg && p.muetCfg.etapes;
    // La triche (œuf de Pâques pour les revisionnages) : il soulève l'aile, on voit la réponse écrite sur son flanc, il jette un œil, puis la rabat.
    const tr = p.presentateur.triche, trTxt = Q('.h2-triche');
    const ac = p.presentateur.accroche, voile = Q('.voile'), txt = Q('.accroche-h'), bulles = qa(pr, '.bulle');
    if (tr && trTxt) trTxt.textContent = tr.texte;
    const indices = et ? et.ordre.map((_, j) => m0.indice.t + et.pas * (j + 1)) : [];
    const revel = m0.reponse.t + GR.LETTRE.vol;
    const lz = L.find((l) => l.folie === 'zoom'), lp = L.find((l) => l.folie === 'tremble'), le = L.find((l) => l.folie === 'ejecte');
    const tE = le ? le.t : null, tP = lp ? lp.t : null, finP = lp ? lp.t + 1.8 : null;
    const lm = L.find((l) => l.folie === 'emerveille');   // émerveillé : il regarde l'oasis apparaître (éclat doré)
    const cl = (x) => Math.max(0, Math.min(1, x)), lisse = (x) => { x = cl(x); return x * x * (3 - 2 * x); };
    const dos = (x) => { x = cl(x); const s2 = 1.4; return 1 + (s2 + 1) * Math.pow(x - 1, 3) + s2 * Math.pow(x - 1, 2); };   // back.out
    const cloche = (t, a, mont, tenue, desc) => (t < a ? 0 : t < a + mont ? lisse((t - a) / mont) : t < a + mont + tenue ? 1 : lisse(1 - (t - a - mont - tenue) / desc));
    const mix = (a, b, k) => a + (b - a) * k;
    const hs = (k) => { const x = Math.sin(k * 57.3 + 7.7) * 43758.5; return x - Math.floor(x); };
    const EMO = { neutre: { tilt: 0, ailes: [6, -6] }, defi: { tilt: 6, ailes: [8, -78] }, choc: { tilt: 0, ailes: [42, -42] }, agace: { tilt: -8, ailes: [-28, 28] }, panique: { tilt: 0, ailes: [150, -150] }, joie: { tilt: 4, ailes: [165, -165] } };
    const emoDe = (i) => (i < 0 ? 'neutre' : L[i].emotion || 'neutre');
    // Avant la première phrase (amorce de boucle), le hibou est déjà dans l'émotion de la première phrase.
    const ligneA = (t) => { let i = L.length ? 0 : -1; L.forEach((l, k) => { if (l.t <= t + 1e-6) i = k; }); return i; };
    const bouchee = (t) => {   // ouverture du bec (0 à 1) : enveloppe de la phrase en cours, interpolée et adoucie
      const i = ligneA(t); if (i < 0 || t < L[i].t) return 0; const l = L[i], e = l.env || [], hz = l.envHz || 15, x = (t - l.t) * hz;
      if (!e.length || x >= e.length) return 0;
      const v = (k) => (k < 0 || k >= e.length ? 0 : e[k]), k0 = Math.floor(x), f = x - k0;
      return lisse((t - l.t) / 0.06) * lisse((e.length - x) / 2) * cl(0.5 * mix(v(k0), v(k0 + 1), f) + 0.25 * mix(v(k0 - 1), v(k0), f) + 0.25 * mix(v(k0 + 1), v(k0 + 2), f));
    };
    const clignes = [1.15, 3.55, 5.7, 7.95, 10.9].filter((b) => b < d - 0.2);
    const confs = confettis.map((_, k) => { const a = -Math.PI / 2 + (hs(k) - 0.5) * 2.6, v = 700 + hs(k + 20) * 900; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: (hs(k + 5) - 0.5) * 1400 }; });
    const vol = (u) => {   // l'éjection : position, rotation et étirement du hibou, u secondes après le début de la phrase
      if (u < 0 || u > 2.3) return { x: 0, y: 0, r: 0, sx: 1, sy: 1 };
      if (u < 0.16) { const k = Math.sin(Math.PI * 0.5 * u / 0.16); return { x: 0, y: 0, r: 0, sx: 1 + 0.22 * k, sy: 1 - 0.28 * k }; }
      if (u < 0.9) { const k = (u - 0.16) / 0.74, ko = 1 - (1 - k) * (1 - k), b = lisse((u - 0.16) / 0.1); return { x: -700 * ko, y: -1150 * ko, r: 720 * ko, sx: mix(1.22, 0.86, b), sy: mix(0.72, 1.22, b) }; }
      if (u < 1.55) { const k = (u - 0.9) / 0.65, ki = k * k, b = lisse((u - 1.45) / 0.1); return { x: -700 * (1 - ki), y: -1150 * (1 - ki), r: 720 + 360 * k, sx: mix(0.86, 1, b), sy: mix(1.22, 1, b) }; }
      if (u < 1.8) { const k = Math.sin(Math.PI * (u - 1.55) / 0.25); return { x: 0, y: 0, r: 0, sx: 1 + 0.3 * k, sy: 1 - 0.32 * k }; }
      const k = (u - 1.8) / 0.5; return { x: 0, y: -70 * Math.sin(Math.PI * k) * (1 - k * 0.3), r: 0, sx: 1 - 0.06 * Math.sin(Math.PI * k), sy: 1 + 0.08 * Math.sin(Math.PI * k) };
    };
    // Le vol d'arrivée (presentateur.vol) : décollage pendant le dézoom de l'accroche, sortie par le haut, retour par la gauche
    // en planant, vol stationnaire près de la question (le temps de la lire), descente et atterrissage à sa place au sol.
    // Trajectoire : courbes d'Hermite cubiques (position et vitesse continues), en unités du dessin du hibou (× 0,62 à l'écran).
    const VO = p.presentateur.vol;
    const hermite = (K, t) => {   // K : [{t, x, y, vx?, vy?}] ; vitesses intérieures par différences centrées (spline cardinale)
      if (t <= K[0].t) return [K[0].x, K[0].y]; const n = K.length - 1; if (t >= K[n].t) return [K[n].x, K[n].y];
      const m = (i) => (K[i].vx != null ? [K[i].vx, K[i].vy] : [(K[i + 1].x - K[i - 1].x) / (K[i + 1].t - K[i - 1].t), (K[i + 1].y - K[i - 1].y) / (K[i + 1].t - K[i - 1].t)]);
      let i = 0; while (t > K[i + 1].t) i += 1;
      const a = K[i], b = K[i + 1], h = b.t - a.t, u = (t - a.t) / h, ma = m(i), mb = m(i + 1);
      const h00 = 2 * u ** 3 - 3 * u * u + 1, h10 = u ** 3 - 2 * u * u + u, h01 = -2 * u ** 3 + 3 * u * u, h11 = u ** 3 - u * u;
      return [h00 * a.x + h10 * h * ma[0] + h01 * b.x + h11 * h * mb[0], h00 * a.y + h10 * h * ma[1] + h01 * b.y + h11 * h * mb[1]];
    };
    let SEG = [];
    if (VO) {
      const td = VO.depart, ta = VO.arrivee, tp = VO.pose, X = VO.x, Y = VO.y;
      if (VO.direct) SEG = [   // version courte : il décolle du gros plan et monte directement se placer près de la question
        [{ t: td, x: 0, y: 0, vx: 0, vy: -1400 }, { t: td + (ta - td) * 0.5, x: 1032, y: -470 }, { t: ta, x: X, y: Y, vx: 0, vy: 0 }],
        null,
        [{ t: tp - 0.8, x: X, y: Y, vx: 0, vy: 0 }, { t: tp - 0.42, x: 758, y: -355 }, { t: tp, x: 0, y: 0, vx: -1500, vy: 1300 }],
      ]; else SEG = [
        // décollage : vers le haut puis sort par la gauche ; arrivée : entre en haut à droite et descend en douceur à droite
        // de la question (sans la survoler) ; descente : passe à droite puis sous la grille jusqu'à sa place.
        [{ t: td, x: 0, y: 0, vx: 0, vy: -1400 }, { t: td + 0.22, x: -113, y: -516 }, { t: td + 0.5, x: -790, y: -1323, vx: -2600, vy: -1700 }],
        [{ t: ta - 0.9, x: 1645, y: -1694, vx: -1900, vy: 1100 }, { t: ta - 0.5, x: 1242, y: -1339 }, { t: ta - 0.22, x: 984, y: -1000 }, { t: ta, x: X, y: Y, vx: 0, vy: 0 }],
        [{ t: tp - 0.8, x: X, y: Y, vx: 0, vy: 0 }, { t: tp - 0.42, x: 758, y: -355 }, { t: tp, x: 0, y: 0, vx: -1500, vy: 1300 }],
      ];
    }
    const voler = (t) => {   // { x, y, r, kF (0 au sol, 1 en vol), hov (vol stationnaire), sx, sy }
      const R = { x: 0, y: 0, r: 0, kF: 0, hov: 0, sx: 1, sy: 1 };
      if (!VO) return R;
      const td = VO.depart, ta = VO.arrivee, tp = VO.pose;
      if (t >= td - 0.16 && t < td) { const k = Math.sin(Math.PI * (t - td + 0.16) / 0.16); R.sx = 1 + 0.18 * k; R.sy = 1 - 0.22 * k; return R; }   // il se tasse
      if (t >= tp && t < tp + 0.42) { const u = (t - tp) / 0.42, k = Math.sin(Math.PI * Math.min(1, u / 0.45)) * (u < 0.45 ? 1 : 0), r2 = u >= 0.45 ? Math.sin(Math.PI * (u - 0.45) / 0.55) : 0; R.sx = 1 + 0.26 * k - 0.05 * r2; R.sy = 1 - 0.3 * k + 0.07 * r2; R.y = -34 * r2; return R; }   // atterrissage : écrasement, petit rebond
      if (t < td || t >= tp) return R;
      let K = null; const fin0 = SEG[0][SEG[0].length - 1].t;
      if (t <= fin0) K = SEG[0]; else if (SEG[1] && t >= SEG[1][0].t && t <= ta) K = SEG[1]; else if (t >= SEG[2][0].t) K = SEG[2];
      if (!K && SEG[1] && t > fin0 && t < SEG[1][0].t) { R.x = -2000; R.y = -3000; R.kF = 1; return R; }   // hors champ
      const e = 1 / 120; let x, y, vx = 0;
      if (K) { [x, y] = hermite(K, t); const a2 = hermite(K, t - e), b2 = hermite(K, t + e); vx = (b2[0] - a2[0]) / (2 * e); }
      else { x = VO.x; y = VO.y; }   // vol stationnaire
      R.x = x; R.y = y; R.kF = 1;
      R.hov = K ? (K === SEG[1] || (VO.direct && K === SEG[0]) ? lisse((t - ta + 0.25) / 0.25) : K === SEG[2] ? 1 - lisse((t - SEG[2][0].t) / 0.25) : 0) : 1;
      R.r = Math.max(-24, Math.min(24, vx * 0.011));
      R.sx = 0.95; R.sy = 1.06;
      return R;
    };
    const dansLesAirs = (t) => VO && t >= VO.depart - 0.16 && t < VO.pose + 0.42;
    const ll = L.find((l) => l.lecture), mots = ll ? qa(el, '.qm') : [];
    // La danse : dans chaque silence entre deux phrases (et après la dernière), calée sur le tempo de la musique.
    // Jamais pendant l'amorce (le raccord de la boucle reste en « défi ») ni pendant l'éjection.
    const danseOK = !!p.presentateur.danse, temps = 60 / ((p.muetCfg && p.muetCfg.tempo) || 108);
    const silences = danseOK ? L.map((l, k) => [l.t + (l.duree || 1.5) + 0.06, k + 1 < L.length ? L[k + 1].t - 0.04 : d + 1]).filter(([a, b]) => b - a > 0.3) : [];
    const danse = (t) => { if (!danseOK || (tE != null && t >= tE && t < tE + 2.3)) return 0; let k = 0; silences.forEach(([a, b]) => { k = Math.max(k, cloche(t, a, 0.3, Math.max(0, b - a - 0.6), 0.3)); }); return VO ? k * (1 - cloche(t, VO.depart - 0.8, 0.3, VO.pose + 0.3 - VO.depart + 0.5, 0.35)) : k; };   // pas de danse en vol ; reprise en douceur après l'atterrissage
    // Glace : niveau de fonte (0 → paliers.length) aux instants des bonnes réponses, libération à glace.liberation.
    const GL = p.presentateur.glace, gTout = Q('.glace-tout');
    const gBloc = Q('.bloc'), gClip = Q('.bloc-clip'), gBord = Q('.bord-fonte'), gFentes = qa(pr, '.fente'), gGouttes = qa(pr, '.goutte'), gEclats = qa(pr, '.eclat'), gFl = qa(pr, '.flamme');
    // Marteau : coups aux instants glace.coups ; angle du marteau (repos 25°, élan 62°, impact -27°) ; nombre de coups donnés.
    const MT = GL && GL.marteau, COUPS = MT ? GL.coups : [], gM = Q('.marteau-r'), gFM = qa(pr, '.fm'), gCop = qa(pr, '.copeau'), gCubes = qa(pr, '.jg-cube');
    const angleM = (t) => { let a = -20; COUPS.forEach((th) => { const u = t - th; if (u > -0.42 && u < 0.45) { if (u < -0.12) a = -20 - 38 * lisse((u + 0.42) / 0.3); else if (u < 0) a = -58 + 73 * Math.pow((u + 0.12) / 0.12, 2); else if (u < 0.06) a = 15; else a = 15 - 35 * dos((u - 0.06) / 0.39); } }); return a; };
    // Visible pendant le gros plan d'accroche, puis seulement autour de chaque coup (il ne cache pas les réponses).
    const visM = (t) => { if (ac && t < ac.fin) return 1 - lisse((t - ac.fin + 0.3) / 0.3); let v = 0; COUPS.forEach((th) => { v = Math.max(v, cloche(t, th - 0.55, 0.15, 0.8, 0.2)); }); return v; };
    const coupsDonnes = (t) => COUPS.filter((th) => t >= th).length, dernier = (t) => { let r = -9; COUPS.forEach((th) => { if (t >= th) r = th; }); return r; };
    const niveauG = (t) => (GL ? GL.paliers.reduce((v, tp) => v + lisse((t - tp) / 0.7), 0) : 0);
    const libere = (t) => (GL ? lisse((t - GL.liberation) / 0.25) : 1);
    const flamme = (g, t, taille, ph) => {   // trois langues de feu qui ondulent (sinus), hauteur = taille
      if (taille <= 0.01) { g.setAttribute('opacity', '0'); return; } g.setAttribute('opacity', '1');
      [[1, 0], [0.7, 1], [0.42, 2]].forEach(([k, j]) => { const h = 330 * taille * k * (1 + 0.08 * Math.sin(t * 17 + ph + j)), w = 70 * Math.sqrt(taille) * k, sx = 18 * taille * Math.sin(t * 11 + ph + j * 1.3);
        g.children[j].setAttribute('d', `M${(-w).toFixed(1)} 0 Q${(-w * 1.1).toFixed(1)} ${(-h * 0.45).toFixed(1)} ${(sx - w * 0.15).toFixed(1)} ${(-h * 0.72).toFixed(1)} Q${(sx * 0.6).toFixed(1)} ${(-h * 0.88).toFixed(1)} ${sx.toFixed(1)} ${(-h).toFixed(1)} Q${(w * 0.5 + sx * 0.3).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${(w * 1.05).toFixed(1)} ${(-h * 0.3).toFixed(1)} Q${(w * 0.9).toFixed(1)} ${(-h * 0.05).toFixed(1)} ${w.toFixed(1)} 0 Z`); });
    };
    const A = (n, v) => n && n.setAttribute('transform', v);
    function rendre(t) {
      const i = ligneA(t), avant = i === 0 && t < L[0].t, e1 = emoDe(i), e0 = avant || (i === 0 && p.amorceBoucle) ? e1 : emoDe(i - 1), kE = i < 0 || avant ? 1 : lisse((t - L[i].t) / 0.18), kA = i < 0 || avant ? 1 : dos(lisse((t - L[i].t) / 0.55));
      const o = bouchee(t), pan = tP != null && t >= tP && t < finP ? cloche(t, tP, 0.15, 1.4, 0.25) : 0;
      const kD = danse(t), ph = t / temps, sa = Math.sin(Math.PI * ph), ab = Math.abs(sa), at = Math.pow(Math.max(0, Math.cos(2 * Math.PI * ph)), 3);
      const lib = libere(t), gel = GL ? 1 - lib : 0;   // gel = 1 : figé dans la glace (il grelotte seulement)
      let choc = 0;
      if (MT) {
        A(gM, `rotate(${angleM(t).toFixed(2)})`); gM.setAttribute('opacity', visM(t).toFixed(2));
        const nC = coupsDonnes(t), th = dernier(t), u = t - th;
        gFM.forEach((g, k) => g.setAttribute('opacity', (k < nC ? Math.min(1, (t - COUPS[k]) / 0.08) : 0).toFixed(2)));
        const jg2 = Q('.jauge-glace'); if (jg2 && ac) jg2.setAttribute('opacity', lisse((t - ac.fin + 0.38) / 0.38).toFixed(2));
        gCubes.forEach((c3, k) => { const tk = COUPS[k + (COUPS.length - gCubes.length)], v = tk == null ? 0 : t - tk;
          if (v < 0) { c3.setAttribute('opacity', '1'); A(c3, `translate(${-170 + k * 85} -640)`); } else { c3.setAttribute('opacity', Math.max(0, 1 - v / 0.45).toFixed(2)); A(c3, `translate(${(-170 + k * 85 + 60 * v).toFixed(1)} ${(-640 - 220 * v + 900 * v * v).toFixed(1)}) rotate(${(400 * v).toFixed(1)})`); } });
        gCop.forEach((c3, k) => { if (u < 0 || u > 0.7) { c3.setAttribute('opacity', '0'); return; } const a = -2.6 + (k / gCop.length) * 2.2, v = 420 + 90 * (k % 3);
          c3.setAttribute('opacity', (1 - u / 0.7).toFixed(2)); A(c3, `translate(${(-150 + Math.cos(a) * v * u).toFixed(1)} ${(-470 + Math.sin(a) * v * u + 900 * u * u).toFixed(1)}) rotate(${(k * 50 + 600 * u).toFixed(0)})`); });
        choc = u >= 0 && u < 0.25 ? 12 * (1 - u / 0.25) * Math.sin(u * 110) : 0;
      }
      if (GL && gTout) {
        const nv = MT ? 0 : niveauG(t), N0 = GL.paliers.length, topY = -540 + (nv / (N0 + 1)) * 300;
        gClip.setAttribute('y', topY.toFixed(1)); gClip.setAttribute('height', (560 - (topY + 540)).toFixed(1));
        gBord.setAttribute('d', nv > 0.02 ? `M-185 ${topY + 30} Q-120 ${topY - 8 + 6 * Math.sin(t * 3)} -60 ${topY + 18} Q0 ${topY - 4} 60 ${topY + 20} Q120 ${topY - 6 + 6 * Math.sin(t * 2.6)} 185 ${topY + 26} L185 ${topY + 46} L-185 ${topY + 46} Z` : '');
        gBloc.setAttribute('opacity', (1 - lib).toFixed(3));
        gFentes.forEach((f, k) => f.setAttribute('opacity', (0.85 * lisse(nv - k * 0.8)).toFixed(2)));
        gGouttes.forEach((gg, k) => { const per = 0.9 + 0.13 * k, u = ((t + k * 0.37) % per) / per, x = -160 + 46 * k, y0 = topY + 40;
          gg.setAttribute('opacity', (nv > 0.3 && lib < 1 ? 0.9 * (1 - u) : 0).toFixed(2)); gg.setAttribute('cx', x); gg.setAttribute('cy', (y0 + u * (0 - y0)).toFixed(1)); });
        const tl2 = GL.liberation;
        gEclats.forEach((e, k) => { const u = t - tl2; if (u < 0 || u > 1.3) { e.setAttribute('opacity', '0'); return; }
          const a = (k / gEclats.length) * Math.PI * 2, v = 900 + 140 * (k % 4), x = Math.cos(a) * v * u, y = -260 + Math.sin(a) * v * u * 0.8 + 1300 * u * u;
          e.setAttribute('opacity', (1 - u / 1.3).toFixed(2)); e.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(k * 47 + u * 540).toFixed(1)})`); });
        const taille = MT ? 0 : Math.min(1, nv / N0) * (1 - lisse((t - tl2 - 0.3) / 0.6));
        flamme(gFl[0], t, taille, 0); flamme(gFl[1], t, taille, 2.1);
      }
      // sourcils
      const S0 = P.SOURCILS[e0] || P.SOURCILS.neutre, S1 = P.SOURCILS[e1] || P.SOURCILS.neutre;
      const SJ = P.SOURCILS.joie;
      [sg, sd].forEach((n, c2) => { const v = S0[c2].map((x, j) => mix(mix(x, S1[c2][j], kE), SJ[c2][j], kD) - (j % 2 ? o * 6 : 0)); n.setAttribute('d', `M${v[0].toFixed(1)} ${v[1].toFixed(1)} Q${v[2].toFixed(1)} ${v[3].toFixed(1)} ${v[4].toFixed(1)} ${v[5].toFixed(1)}`); });
      // tête : balancement, émotion, syllabes, tremblement de panique
      const tilt = 3 * Math.sin(2 * Math.PI * t / 3.3) + mix(EMO[e0].tilt, EMO[e1].tilt, kE) + 3 * o + pan * 4 * Math.sin(t * 52) - 11 * kD * sa;
      A(tete, `translate(0 ${(-7 * o + 2 * Math.sin(2 * Math.PI * t / 1.7)).toFixed(2)}) rotate(${tilt.toFixed(2)} 0 -250)`);
      const cape = Q('.h2-cape'); if (cape) A(cape, `translate(0 -262) skewX(${(2.2 * Math.sin(2 * Math.PI * t / 2.6) + 1.1 * Math.sin(2 * Math.PI * t / 1.1 + 1)).toFixed(2)}) scale(${(1 + 0.012 * Math.sin(2 * Math.PI * t / 1.9)).toFixed(4)} 1) translate(0 262)`);   // costume prince : la cape ondule
      // corps : respiration (étirement doux depuis les pieds) ; folie « ejecte » : vol complet
      const sR = 0.018 * Math.sin(2 * Math.PI * t / 1.7), V = tE != null ? vol(t - tE) : vol(-1);
      const F = voler(t), fP = 2 * Math.PI * 5.5 * t, bob = F.hov * 16 * Math.sin(fP + Math.PI / 2);   // battements à 5,5 par seconde ; il monte à chaque coup d'ailes
      const saute = GL ? Math.sin(Math.PI * Math.min(1, Math.max(0, (t - GL.liberation - 0.1) / 0.55))) : 0;   // il saute de joie en sortant
      A(corps, `scale(${((1 - sR * (1 - 0.7 * gel)) * V.sx * F.sx * (1 + 0.07 * kD * at) * (1 + 0.12 * saute)).toFixed(4)} ${((1 + sR * (1 - 0.7 * gel)) * V.sy * F.sy * (1 - 0.09 * kD * at) * (1 - 0.08 * saute)).toFixed(4)})`);
      const jx = pan * 6 * Math.sin(t * 61) + pan * 3 * Math.sin(t * 97);
      const gr = GL ? gel * 3.5 * Math.sin(t * 70) : 0;   // il grelotte dans la glace
      A(pos, `translate(${(V.x + F.x + jx + gr + 22 * kD * sa).toFixed(1)} ${(V.y + F.y + bob - 34 * kD * ab - 120 * saute).toFixed(1)}) rotate(${(V.r + F.r).toFixed(1)} 0 -200) rotate(${(8 * kD * sa).toFixed(2)} 0 0)`);
      fantomes.forEach((g, k) => { const u = tE == null ? -1 : t - tE, Vf = vol(u - 0.035 * (k + 1)), vis = u > 0.18 && u < 1.5; g.setAttribute('opacity', vis ? (0.28 - k * 0.08).toFixed(2) : '0'); g.setAttribute('transform', `translate(${Vf.x.toFixed(1)} ${Vf.y.toFixed(1)}) rotate(${Vf.r.toFixed(1)} 0 -200)`); });
      // ailes : geste de l'émotion (arrivée avec dépassement), flottement au repos, battements de joie
      const W0 = EMO[e0].ailes, W1 = EMO[e1].ailes, bat = e1 === 'joie' ? 16 * Math.sin(t * 38) : 0, fl = 4 * Math.sin(2 * Math.PI * t / 1.3);
      const lev = tr ? cloche(t, tr.t, 0.14, tr.duree || 0.55, 0.16) : 0;
      if (trTxt) trTxt.setAttribute('opacity', lisse((lev - 0.4) / 0.4).toFixed(2));
      const dG = 50 + 65 * sa * sa, dD = -(50 + 65 * Math.cos(Math.PI * ph) ** 2);   // sinus au carré : pas d'à-coup au changement de sens
      const kF = VO ? (t < VO.depart ? lisse((t - VO.depart + 0.1) / 0.1) : 1 - lisse((t - VO.pose + 0.05) / 0.2)) : 0, battement = 80 + 62 * Math.sin(fP);
      // croisière (presentateur.croisiere) : une fois posé, il continue de voler en place, ailes qui battent doucement (2,4 par seconde)
      const crV = p.presentateur.croisiere && VO ? lisse((t - VO.pose) / 0.5) * 0.8 : 0, batC = 26 + 24 * Math.sin(2 * Math.PI * 2.4 * t);
      A(ag, `rotate(${(1 - 0.85 * gel) * mix(mix(mix(mix(W0[0], W1[0], kA) + fl + bat + pan * 10 * Math.sin(t * 47) + 78 * lev, dG, kD), battement, kF), batC + 0.3 * (W1[0] + fl), crV).toFixed(2)})`);
      A(ad, `rotate(${(1 - 0.85 * gel) * mix(mix(mix(mix(W0[1], W1[1], kA) - fl - bat - pan * 10 * Math.sin(t * 43) + (e1 === 'defi' ? 6 * Math.sin(t * 9) * (1 - kE * 0.3) : 0), dD, kD), -battement, kF), -batC + 0.3 * (W1[1] - fl), crV).toFixed(2)})`);
      // regard : vers chaque nouvelle lettre, puis vers le spectateur
      let gx = 2 * Math.sin(2 * Math.PI * t / 4.1), gy = 0;
      indices.concat([revel]).forEach((ti) => { const k = cloche(t, ti - 0.05, 0.12, 0.45, 0.2); gx = mix(gx, 13, k); gy = mix(gy, -15, k); });
      if (pan) { gx += pan * 8 * Math.sin(t * 13); }
      if (lm) { const kM = cloche(t, lm.t + 0.05, 0.25, 2.4, 0.4); gx = mix(gx, 17, kM); gy = mix(gy, -13, kM); }
      if (tr) { const kt = cloche(t, tr.t + 0.08, 0.1, (tr.duree || 0.55) - 0.1, 0.12); gx = mix(gx, -16, kt); gy = mix(gy, 12, kt); }
      if (ll) { const kl = cloche(t, ll.t - 0.15, 0.2, (ll.duree || 2) - 0.1, 0.3); gx = mix(gx, -15, kl); gy = mix(gy, -14, kl); }   // il regarde la question
      [pg, pd].forEach((n) => A(n, `translate(${gx.toFixed(2)} ${gy.toFixed(2)})`));
      if (ll && mots.length && ll.mots) {   // karaoké : le mot qu'il dit s'allume, les mots pas encore lus sont atténués
        const kW = cloche(t, ll.t - 0.2, 0.2, (ll.duree || 2) - 0.2, 0.4);
        mots.forEach((sp, k) => { const w = ll.mots[k]; if (!w) return; const a2 = ll.t + w[0], b2 = ll.t + w[1], lu = lisse((t - a2 + 0.04) / 0.08), cur = cloche(t, a2 - 0.04, 0.08, Math.max(0, b2 - a2 - 0.04), 0.22);
          sp.style.opacity = (1 - kW * 0.5 * (1 - lu)).toFixed(3); sp.style.transform = cur ? `scale(${(1 + 0.06 * cur).toFixed(4)})` : '';
          sp.style.color = cur > 0.01 ? `rgb(255, ${Math.round(255 - 43 * cur)}, ${Math.round(255 - 163 * cur)})` : ''; });
      }
      // paupières : clignements, regard à demi fermé quand il est agacé
      let lid = 0; clignes.forEach((b) => { lid = Math.max(lid, cloche(t, b, 0.06, 0.02, 0.09)); });
      lid = Math.max(lid, (e1 === 'agace' ? 0.38 * kE : 0) + (e0 === 'agace' && e1 !== 'agace' ? 0.38 * (1 - kE) : 0));
      lid = Math.max(lid, 0.3 * kD);
      [lg, ld].forEach((n) => n.setAttribute('height', (112 * lid).toFixed(1)));
      // bec
      bouche.setAttribute('ry', (0.1 + 34 * o).toFixed(2)); langue.setAttribute('ry', (0.1 + 12 * o).toFixed(2)); langue.setAttribute('cy', (-338 + 52 + 12 * o).toFixed(1));
      A(mach, `translate(0 ${(24 * o).toFixed(2)})`);
      // zoom-coup de poing de la première phrase
      const z = lz ? 1 + 0.5 * cloche(t, lz.t + 0.12, 0.14, 0.3, 0.22) : 1;
      // Accroche : gros plan du hibou au centre de l'écran (visage en 540, 880), voile sur le jeu, texte géant ; puis dézoom.
      const kC = ac ? 1 - lisse((t - ac.fin + 0.38) / 0.38) : 0, sC = (1 + 1.6 * kC) * z;
      svgP.style.transformOrigin = '230px 1260px';
      svgP.style.transform = sC === 1 && !kC ? '' : `translate(${(310 * kC).toFixed(2)}px, ${(-270 * kC).toFixed(2)}px) scale(${sC.toFixed(4)})`;
      if (ac) {
        voile.style.opacity = ((ac.opaciteVoile || 0.97) * kC).toFixed(3); txt.style.opacity = kC.toFixed(3);
        const pulse = 1 + 0.06 * Math.max(0, Math.sin(2 * Math.PI * t / temps)) ** 4;
        txt.style.transform = `translate(${(4 * Math.sin(t * 53) * kC).toFixed(2)}px, ${(-40 * (1 - kC)).toFixed(1)}px) scale(${(pulse * (0.9 + 0.1 * kC)).toFixed(4)})`;
        if (bulles[0]) bulles[0].style.visibility = kC > 0.03 ? 'hidden' : '';
      }
      // plumes qui tombent pendant la panique
      plumes.forEach((pl, k) => { const tk = tP == null ? -1 : t - tP - 0.1 - k * 0.12, x0 = 120 + hs(k) * 230, y0 = 1120 + hs(k + 50) * 120;
        if (tk < 0 || tk > 1.6) { pl.setAttribute('opacity', '0'); return; }
        const kk = tk / 1.3; pl.setAttribute('opacity', (0.95 * (tk < 1.3 ? 1 : 1 - (tk - 1.3) / 0.3)).toFixed(2));
        pl.setAttribute('transform', `translate(${(x0 + (hs(k + 9) - 0.5) * 120 * kk + 18 * Math.sin(tk * 6 + k)).toFixed(1)} ${(y0 + 260 * kk * kk).toFixed(1)}) rotate(${((hs(k + 3) - 0.5) * 300 * kk + 25 * Math.sin(tk * 5)).toFixed(1)})`); });
      // éjection : confettis, flash, poussière à la retombée, écran qui tremble
      const u = tE == null ? -1 : t - tE;
      confettis.forEach((cf, k) => { const tc = u - 0.05; if (tc < 0 || tc > 1.7) { cf.setAttribute('opacity', '0'); return; } const C = confs[k];
        cf.setAttribute('opacity', (tc < 1.1 ? 1 : 1 - (tc - 1.1) / 0.6).toFixed(2));
        cf.setAttribute('transform', `translate(${(230 + C.vx * tc * 0.6).toFixed(1)} ${(1240 + C.vy * tc * 0.6 + 700 * tc * tc).toFixed(1)}) rotate(${(C.r * tc).toFixed(1)})`); });
      if (GL && t >= GL.liberation - 0.05 && t < GL.liberation + 0.5) { flash.style.background = '#e8faff'; flash.style.opacity = (0.55 * cloche(t, GL.liberation - 0.03, 0.05, 0.03, 0.3)).toFixed(3); }
      else if (lm && t >= lm.t - 0.1 && t < lm.t + 0.7) { flash.style.background = '#ffe2a0'; flash.style.opacity = (0.42 * cloche(t, lm.t - 0.08, 0.08, 0.05, 0.5)).toFixed(3); }
      else { flash.style.background = ''; flash.style.opacity = u >= 0 && u < 0.2 ? (0.5 * cloche(u, 0, 0.04, 0.02, 0.12)).toFixed(3) : '0'; }
      poussiere.forEach((pp, k) => { const tp = u - 1.55 - k * 0.02; if (tp < 0 || tp > 0.6) { pp.setAttribute('r', '0'); return; } pp.setAttribute('r', (14 + 50 * (tp / 0.6)).toFixed(1)); pp.setAttribute('fill-opacity', (0.55 * (1 - tp / 0.6)).toFixed(2)); pp.setAttribute('cx', (150 + k * 40 + (k - 2) * 60 * tp).toFixed(1)); });
      const sec = (u >= 0 && u < 0.35 ? 14 * (1 - u / 0.35) * Math.sin(u * 95) : 0) + (u >= 1.55 && u < 1.8 ? 8 * (1 - (u - 1.55) / 0.25) * Math.sin(u * 90) : 0);
      if (cadre) cadre.style.translate = (sec + choc) ? `${(sec + choc).toFixed(2)}px ${(choc * 0.5).toFixed(2)}px` : '';
      if (MT && svgP) svgP.style.translate = choc ? `${(choc * 0.8).toFixed(2)}px ${(-choc * 0.4).toFixed(2)}px` : '';
      if (p.presentateur.croisiere && svgP) {   // il suit le chemin : dérive vers le côté où le chemin tourne, penche dans le virage, flotte
        const W = typeof self !== 'undefined' ? self : this, Tg = ((p.fond3dOpts && p.fond3dOpts.t0) || 0) + t, E = W.Avis && W.Avis.chemin ? W.Avis.chemin.etat(Tg) : { courbure: 0 };
        const w = (1 - kC) * (VO ? lisse((t - VO.pose + 0.2) / 0.6) : 1), ph = 2 * Math.PI * Tg / ((p.fond3dOpts && p.fond3dOpts.L) || 38.9);
        const dx = Math.max(-120, Math.min(120, E.courbure * 360)) + 10 * Math.sin(ph * 5), dy = -9 * Math.sin(ph * 44) - 5 * Math.sin(ph * 88 + 1);
        svgP.style.translate = `${(dx * w).toFixed(2)}px ${(dy * w).toFixed(2)}px`;
        svgP.style.rotate = `${(Math.max(-12, Math.min(12, E.courbure * 55)) * w).toFixed(2)}deg`;
      }
    }
    const pilote = { t: 0 };
    rendre(0);
    c.ft(pilote, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => rendre(pilote.t) }, t0);
  }
  // Chargé à l'appel : dans la page, personnage.js est lu après ce fichier.
  const PERSO = () => (typeof require === 'function' ? require('./personnage.js') : self.Avis.personnage);
  const kicker = (p, u) => (p.kicker ? `<div class="kicker">${u.esc(p.kicker)}</div>` : '');

  return {
    // Aucun texte : seulement le fond (décor ou fond uni) et, si on veut, une illustration. C'est le plan par défaut :
    // le spectateur lit déjà les sous-titres, il ne faut pas lui donner un second texte à lire.
    visuel: {
      description: 'Aucun texte : le fond et, si on veut, une illustration. "moment": { "a": ancre } déclenche le temps fort de l’illustration ; "repere" : un compteur court (« Mains 1/3 »).',
      max: 14,
      ancres: (p) => [[p.moment, 'a']],
      textes: (p) => [p.repere],
      // "repere" : un compteur très court (« Mains 1/3 ») pour les vidéos en liste. Ce n'est pas une phrase.
      dessin: (p, u) => (p.repere ? `<div class="kicker repere">${u.esc(p.repere)}</div>` : ''),
      jouer(c, el, p, t0) { c.monter(q(el, '.repere'), t0); },
    },
    // Une phrase forte, en grand. "taille": "geant" pour deux ou trois mots.
    titre: {
      description: 'Une phrase forte en grand (avec un surtitre facultatif). "taille": "geant" pour deux ou trois mots.',
      max: 60,
      ancres: () => [],
      textes: (p) => [p.texte],
      dessin: (p, u) => `${kicker(p, u)}<p class="grand${p.taille === 'geant' ? ' geant' : ''}">${u.md(p.texte)}</p><i class="filet"></i>`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        c.lignes(q(el, '.grand'), t0 + 0.08);
        c.ft(q(el, '.filet'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, t0 + 0.35);
      },
    },
    // Une liste dont chaque élément arrive sur son mot. "rayer" : l'ancre où tout est barré ; "conclusion" : la phrase qui suit.
    liste: {
      description: 'Une liste : chaque élément arrive sur son mot ("a"). "rayer" barre tout sur une ancre ; "conclusion" s’affiche ensuite.',
      max: 34,
      ancres: (p) => [...(p.items || []).map((x) => [x, 'a']), [p.rayer, 'a']],
      textes: (p) => [p.titre, p.conclusion, ...(p.items || []).map((x) => x.texte)],
      dessin: (p, u) => `${kicker(p, u)}${p.titre ? `<p class="moyen">${u.md(p.titre)}</p>` : ''}
        <ul class="items">${(p.items || []).map((x) => `<li><span>${u.esc(x.texte)}<i class="rature"></i></span></li>`).join('')}</ul>
        ${p.conclusion ? `<p class="conclusion">${u.md(p.conclusion)}</p>` : ''}`,
      jouer(c, el, p, t0, d) {
        c.monter(q(el, '.kicker'), t0);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.05);
        const lis = qa(el, 'li'), ratures = qa(el, '.rature');
        gsap.set(ratures, { scaleX: 0 });
        lis.forEach((li, i) => c.ft(li, { opacity: 0, x: -90, scale: 0.9 }, { opacity: 1, x: 0, scale: 1, duration: 0.45, ease: 'back.out(1.8)', transformOrigin: '0% 50%' }, t0 + (p.items[i].t == null ? 0.4 + 0.25 * i : p.items[i].t)));
        if (p.rayer) {
          const tr = t0 + p.rayer.t;
          c.ft(ratures, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out', stagger: 0.1 }, tr);
          c.ft(lis, { opacity: 1 }, { opacity: 0.45, duration: 0.3 }, tr + 0.1);
          if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), tr + 0.35);
        } else if (q(el, '.conclusion')) c.monter(q(el, '.conclusion'), t0 + d * 0.6);
      },
    },
    // Deux jauges : celle de gauche se vide, celle de droite se remplit sur son ancre.
    bascule: {
      description: 'Deux jauges : "gauche" (ce qui perd de la valeur) se vide, "droite" (ce qui en prend) se remplit sur son ancre "a".',
      max: 30,
      ancres: (p) => [[p.droite, 'a']],
      textes: (p) => [p.gauche && p.gauche.texte, p.droite && p.droite.texte, p.droite && p.droite.sous],
      dessin: (p, u) => `${kicker(p, u)}
        <div class="jauge g"><p>${u.esc(p.gauche.texte)}</p><div class="rail"><i></i></div></div>
        <div class="jauge d"><p>${u.esc(p.droite.texte)}</p><div class="rail"><i></i></div>${p.droite.sous ? `<span>${u.esc(p.droite.sous)}</span>` : ''}</div>`,
      jouer(c, el, p, t0, d) {
        const g = q(el, '.jauge.g'), dr = q(el, '.jauge.d');
        const tb = t0 + (p.droite.t == null ? d * 0.45 : p.droite.t);
        c.monter(q(el, '.kicker'), t0);
        gsap.set(dr, { opacity: 0 });
        c.ft(g, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, t0 + 0.1);
        c.ft(q(g, 'i'), { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.out' }, t0 + 0.2);
        c.ft(q(g, 'i'), { scaleX: 1 }, { scaleX: 0.22, duration: 0.9, ease: 'power3.inOut' }, tb);
        c.ft(g, { opacity: 1 }, { opacity: 0.45, duration: 0.6 }, tb);
        c.ft(dr, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }, tb);
        c.ft(q(dr, 'i'), { scaleX: 0.05 }, { scaleX: 1, duration: 1.1, ease: 'power3.out' }, tb + 0.15);
      },
    },
    // Le compte à rebours : il occupe une pause de la voix ("pauses" dans l'épisode) pour laisser le spectateur réfléchir.
    rebours: {
      description: 'Un compte à rebours pendant une pause de la voix (voir "pauses" dans l’épisode). Les chiffres tombent chaque seconde.',
      max: 0,
      ancres: () => [],
      textes: () => [],
      dessin: (p) => `<div class="rebours"><svg width="520" height="520"><circle cx="260" cy="260" r="236" fill="none" stroke="var(--fg)" stroke-opacity=".18" stroke-width="22"/><circle class="anneau" cx="260" cy="260" r="236" fill="none" stroke="var(--ac)" stroke-width="22" stroke-linecap="round" stroke-dasharray="1483" transform="rotate(-90 260 260)"/></svg>${Array.from({ length: p.secondes || 5 }, (_, i) => `<span>${(p.secondes || 5) - i}</span>`).join('')}</div>`,
      jouer(c, el, p, t0) {
        const n = p.secondes || 5, tc = t0 + (p.t || 0), boite = q(el, '.rebours');
        gsap.set(qa(el, '.rebours span'), { opacity: 0 });
        c.ft(boite, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, t0 + 0.1);
        gsap.set(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } });
        c.ft(q(el, '.anneau'), { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': 1483 }, duration: n, ease: 'none' }, tc);
        qa(el, '.rebours span').forEach((s, i) => {
          c.ft(s, { opacity: 0, scale: 1.7 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, tc + i);
          c.ft(s, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.7, duration: 0.18, ease: 'power2.in' }, tc + i + 0.8);
          c.ft(boite, { scale: 1.06 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, tc + i);
        });
      },
    },
    // Le jeu de mots fléchés : trois mots qui se croisent, révélés un par un sur leur ancre, avec la barre singe → homme classique → Molière
    // et un petit minuteur par tranche (« cadence » : une réponse toutes les N secondes, calculée par le montage).
    grille: {
      description: 'Jeu de mots fléchés : "mots": [{ "texte", "sens": "h"|"v", "ligne", "colonne", "indice": { "texte", "a", "fin" }, "reponse": { "a" } }] (de trois à six mots qui se croisent, du plus facile au plus dur) ; "palier": le mot après lequel s’allume le palier du milieu (défaut : 1 pour trois mots, 2 au-delà) ; "figures": trois figures parmi singe, classique, moliere, academicien, hugo ; "cadence": 15 (une réponse toutes les 15 s : "indice.fin" = la phrase après laquelle commence le silence de réflexion) ; "titre" : l’accroche en haut ; "decor": "livres" ou "plage" (fond et scène du bas) ; "lueur": false coupe la lueur des cases du mot cherché ; "pulse": { "a" } : l’instant où la barre pulse (intro) ; "stades" : trois noms de palier.',
      max: 60,
      ancres: (p) => (p.muet ? [] : [[p.pulse, 'a'], ...(p.mots || []).flatMap((m) => [[m.indice, 'a'], [m.reponse, 'a']])]),
      textes: (p) => [p.titre, ...(p.mots || []).map((m) => m.indice && m.indice.texte)],
      valider(p) {
        const e = GR.construire(p.mots).erreurs.slice();
        if ((p.mots || []).length < (p.affichage === 'progressif' ? 1 : 3) || (p.mots || []).length > 6) e.push('le jeu prévoit de trois à six mots qui se croisent (un seul mot est permis en affichage progressif)');
        (p.mots || []).forEach((m, k) => {
          if (!m.indice || !m.indice.texte || (!m.indice.a && !p.muet)) e.push(`mot ${k + 1} : "indice": { "texte", "a" }`);
          if (!m.reponse || (!m.reponse.a && !p.muet)) e.push(`mot ${k + 1} : "reponse": { "a" } (le mot dit par l’orbe)`);
          if (p.cadence && !p.muet && !(m.indice && m.indice.fin)) e.push(`mot ${k + 1} : avec "cadence", "indice": { "fin" } est nécessaire (la phrase après laquelle commence la réflexion)`);
        });
        if (p.cadence !== undefined && !(p.cadence >= 5 && p.cadence <= 30)) e.push('"cadence" : entre 5 et 30 secondes');
        return e;
      },
      dessin: (p, u) => {
        const prog = p.affichage === 'progressif', g = GR.couper(GR.construire(p.mots), p.coupure), D = GR.dims(g, prog, !!p.zoneSure), st = p.stades || ['Singe', 'Homme classique', 'Molière'], fig = p.figures || ['singe', 'classique', 'moliere'], xs = [60, 480, 900];
        const neuves = GR.nouvelles(g, p.mots.length);
        // Les cases : du papier découpé aux bords irréguliers (forme stable), une ombre nette, une couleur par mot ; le halo est dessous.
        const cases = g.cases.map((x, n) => {
          const premier = Math.min(...x.mots), col = GR.COULEURS[premier % GR.COULEURS.length];
          const fl = x.mots.filter((k) => neuves[k] && neuves[k][0] === x).map((k) => (p.mots[k].sens === 'h' ? '→' : '↓')).join('');
          const gauche = x.c * D.pas, haut = x.l * D.pas, forme = GR.papier(n + 1, D.caseTaille, D.caseTaille);
          return `<div class="halo" style="left:${gauche}px;top:${haut}px;--wc:${col}"></div><div class="case" data-m="${x.mots.join(' ')}" data-cx="${D.gx + gauche + D.caseTaille / 2}" data-cy="${D.gy + haut + D.caseTaille / 2}" style="left:${gauche}px;top:${haut}px;--wc:${col}"><div class="pap" style="clip-path:${forme}"><i style="background:${col}"></i><u></u><s></s>${fl ? `<b>${fl}</b>` : ''}<em>${u.esc(x.lettre)}</em></div></div>`;
        }).join('');
        const paliers = st.map((nom, i) => `<div class="palier" style="left:${xs[i]}px">${GR.figure(fig[i])}${prog ? '' : `<p>${u.esc(nom)}</p>`}</div>`).join('');
        // Le minuteur : une tranche par mot (de la définition à la réponse, puis de réponse en réponse) ; un chiffre par seconde restante.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const chiffres = debuts.map((d, w) => { const n = Math.max(1, Math.round(fins[w] - d)); return Array.from({ length: n }, (_, j) => `<span data-w="${w}" data-j="${j}">${prog ? '' : n - j}</span>`).join(''); }).join('');
        const minuteur = `<div class="minuteur${prog ? ' prog' : ''}${p.muetCfg && p.muetCfg.etapes ? ' cache' : ''}"><svg width="84" height="84" viewBox="0 0 84 84"><circle class="m-fond" cx="42" cy="42" r="34"/><circle class="m-doux" cx="42" cy="42" r="34"/><circle class="m-vif" cx="42" cy="42" r="34"/></svg><div class="m-nb">${chiffres}</div></div>`;
        let ox = 150, oy = 390;
        try { const e = require('./orbe.js').emplacement({ orbe: p.orbe, grille: true, fond: 'nuit' }); ox = e.x; oy = e.y; } catch (err) { /* page : pas de require */ }
        const etincelles = g.cases.map(() => '<i class="etincelle"></i>').join('');
        const mu = p.muet || p.muetCfg, N = p.mots.length;
        const indices = (mu && mu.texteIntro ? `<p class="i-intro">${u.esc(mu.texteIntro)}</p>` : '') + p.mots.map((m, k) => `<p class="i-ind"${prog ? ` style="font-size:${N === 1 ? (m.indice.texte.length <= 30 ? 100 : m.indice.texte.length <= 48 ? 88 : 74) : m.indice.texte.length <= 30 ? 84 : m.indice.texte.length <= 48 ? 72 : 60}px"` : ''}>${mu && !prog ? `<small>Mot ${k + 1}/${N}</small>` : ''}${(p.presentateur && (p.presentateur.lignes || []).some((l) => l.lecture) && k === 0 ? `<span class="qwrap">${m.indice.texte.split(' ').map((w) => `<span class="qm">${u.esc(w)}</span>`).join(' ')}</span>` : u.esc(m.indice.texte))}</p>`).join('') + (mu && mu.texteFin ? `<p class="i-fin">${u.esc(mu.texteFin)}</p>` : '');
        const dec = DEC.decor(p.decor), fond = `<svg class="fond-papier" viewBox="0 0 1080 1920" style="--titre:${dec.titre}">${dec.fond}${dec.bas}</svg>` + (p.fond3d ? `<canvas class="fond-3d" width="${(p.fond3dRes || [540, 960])[0]}" height="${(p.fond3dRes || [540, 960])[1]}"></canvas>${p.fond3d === 'chemin' ? '<div class="voile-ui"></div>' : ''}` : '') + (p.fondAnime ? fondAnimeSvg(p.fondAnime, !!p.fond3d) : '');
        return `${fond}${p.titre && !prog ? `<p class="jeu-titre${mu && mu.titreFixe ? ' fixe' : ''}" style="--titre:${dec.titre}">${u.md(p.titre)}</p>` : ''}<div class="bandeau${prog ? ' prog' : ''}" style="clip-path:none">${prog ? '' : `<div class="pap" style="clip-path:${GR.papier(77, 770, 172)}"></div>`}<div class="indices">${indices}</div></div>${prog ? '' : '<i class="scotch s1"></i><i class="scotch s2"></i>'}<div class="grille" data-ox="${ox}" data-oy="${oy}" style="left:${D.gx}px;top:${D.gy}px;--case:${D.caseTaille}px">${cases}</div>${prog ? '' : '<div class="tampon">TROUVÉ</div>'}${minuteur}<div class="barre${prog ? ' prog' : ''}"><div class="strip"><div class="pap" style="clip-path:${GR.papier(88, 1004, 156)}"></div></div><div class="rail"><i></i></div>${paliers}</div>${etincelles}${p.rarete ? (p.mots.map((_, k) => { const tiers = p.rarete.couleurs || ['#4da3ff', '#b45cff', '#ffcf3a']; return `<div class="rar" style="--rc:${tiers[Math.min(k, tiers.length - 1)]}"></div>`; }).join('') + '<div class="rayons"></div>') : ''}${prog && N === 1 && mu && mu.etapes ? (() => { const m0 = p.mots[0], D = Math.max(1, Math.round(m0.reponse.t + 0.5 - m0.indice.t)); return `<div class="chronog"><svg viewBox="0 0 220 220" width="220" height="220"><circle class="cg-fond" cx="110" cy="110" r="94"/><circle class="cg-arc" cx="110" cy="110" r="94"/></svg>${Array.from({ length: D }, (_, j) => `<span data-j="${j}"${D - j <= 3 ? ' class="fin"' : ''}>${D - j}</span>`).join('')}</div>`; })() : ''}${p.qcm ? `<div class="qcm${p.qcm.simple ? ' simple' : ''}">${p.qcm.questions.map((x, i) => `<div class="qq"><div class="q-tete${x.tete ? ' fort' : ''}">${x.tete ? u.esc(x.tete) : `QUESTION ${i + 1}/${p.qcm.questions.length} · ${u.esc(x.etage || '')}`}</div><div class="q-carte glacon"><i class="reflet"></i><p>${u.esc(x.q)}</p></div>${x.r.map((r, j) => `<div class="q-rep glacon${j === x.ok ? ' ok' : ''}" style="top:${p.qcm.simple ? 596 + j * 98 : 646 + j * 124}px"><i class="reflet"></i><b>${'ABC'[j]}</b><span>${u.esc(r)}</span></div>`).join('')}${x.ok < 0 ? '<div class="q-mystere">?</div>' : ''}${p.qcm.simple ? '' : '<div class="q-barre"><i></i></div>'}</div>`).join('')}${p.qcm.profondeurs ? '<div class="q-prof glacon"><i class="reflet"></i><small>PROFONDEUR</small><b>0 m</b></div>' : ''}${p.qcm.partage ? `<div class="q-partage">${u.esc(p.qcm.partage.texte)}</div>` : ''}${p.qcm.simple ? '<div class="q-compte"><svg viewBox="0 0 120 120" width="110" height="110"><circle class="qc-fond" cx="60" cy="60" r="52"/><circle class="qc-arc" cx="60" cy="60" r="52"/></svg><span>5</span></div><div class="q-suite">ENSUITE ↓</div>' : ''}</div>` : ''}${p.presentateur ? `<div class="presente">${p.presentateur.accroche ? `<div class="voile"${p.presentateur.accroche.voile ? ` style="background:${p.presentateur.accroche.voile}"` : ''}></div>` : ''}<svg viewBox="0 0 1080 1920" width="1080" height="1920">${p.presentateur.corniche ? '<path d="M70 1468 Q150 1448 238 1452 Q330 1446 400 1470 L384 1502 Q300 1530 236 1520 Q150 1530 86 1500 Z" fill="#cfeeff" fill-opacity=".92" stroke="#ffffff" stroke-width="5" stroke-linejoin="round"/><path d="M110 1478 Q240 1462 370 1478" fill="none" stroke="#ffffff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/><path d="M120 1500 L150 1560 L176 1512 M300 1510 L318 1572 L340 1506" fill="#a9dcf5" fill-opacity=".85" stroke="#ffffff" stroke-width="3"/>' : ''}<g transform="translate(230 1470) scale(0.62)">${p.presentateur.allure === 'hibou2' ? '<use href="#h2-hibou" class="h2-fantome" opacity="0"/><use href="#h2-hibou" class="h2-fantome" opacity="0"/><use href="#h2-hibou" class="h2-fantome" opacity="0"/>' : ''}<g class="saut">${PERSO().svg('debout', p.presentateur.allure || 'hibou', { costume: p.presentateur.costume })}</g>${p.presentateur.glace ? glaceSvg(p.presentateur.glace) : ''}</g></svg>${(() => { const h = (k) => { const x = Math.sin(k * 91.7 + 13.1) * 43758.5; return x - Math.floor(x); }, cols = ['#ffd45c', '#ff5d7a', '#4fd1c5', '#c46bff', '#7fb2ff', '#ff9a5c']; return `<svg class="eclats" viewBox="0 0 1080 1920" width="1080" height="1920">${Array.from({ length: 10 }, (_, k) => `<path class="plume" d="M0 -26 C14 -10 12 14 0 26 C-12 14 -14 -10 0 -26 Z M0 -26 V30" fill="#e9f6ff" fill-opacity=".85" stroke="#ffffff" stroke-width="2" transform="translate(${Math.round(120 + h(k) * 230)} ${Math.round(1120 + h(k + 50) * 120)})" opacity="0"/>`).join('')}${Array.from({ length: 5 }, (_, k) => `<circle class="poussiere" cx="${150 + k * 40}" cy="1462" r="0" fill="#ffffff" fill-opacity=".55"/>`).join('')}${Array.from({ length: 28 }, (_, k) => `<rect class="confetti" x="-9" y="-5" width="18" height="10" rx="2" fill="${cols[k % cols.length]}" transform="translate(230 1240)" opacity="0"/>`).join('')}</svg><div class="flash"></div>`; })()}${p.presentateur.accroche ? `<div class="accroche-h"><p style="${p.presentateur.accroche.taille ? `font-size:${p.presentateur.accroche.taille}px;` : ''}${p.presentateur.accroche.glow ? `text-shadow:0 0 40px ${p.presentateur.accroche.glow},0 12px 0 ${p.presentateur.accroche.ombre || '#3a1060'};` : ''}">${u.esc(p.presentateur.accroche.texte)}</p><small${p.presentateur.accroche.tailleSous ? ` style="font-size:${p.presentateur.accroche.tailleSous}px"` : ''}>${u.esc(p.presentateur.accroche.sous || '')}</small></div>` : ''}${p.presentateur.cta ? `<div class="cta${p.presentateur.cta.haut ? ' haut' : ''}">${u.esc(p.presentateur.cta.texte)}</div>` : ''}${(p.presentateur.lignes || []).map((l) => `<div class="bulle"><p>${u.esc(l.texte)}</p></div>`).join('')}</div>` : ''}${p.intro ? `<div class="intro-jeu"><svg viewBox="0 0 1080 1920" width="1080" height="1920">${dec.fond}</svg><p>${u.esc(p.intro.texte).replace(/\n/g, '<br>')}</p></div>` : ''}${p.regle ? `<div class="regle"${p.regle.length > 14 ? ' style="font-size:50px"' : ''}><svg viewBox="0 0 40 44" width="50" height="55"><rect x="16" y="0" width="8" height="6" rx="2" fill="currentColor"/><circle cx="20" cy="25" r="16" fill="none" stroke="currentColor" stroke-width="5"/><path d="M20 25 L20 15" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></svg><span>${u.esc(p.regle)}</span></div>` : ''}${prog && N === 1 && mu && mu.chrono ? `<div class="compte">${Array.from({ length: mu.chronoDuree || 5 }, (_, j) => `<span data-j="${j}"${j === (mu.chronoDuree || 5) - 1 ? ' class="fin"' : ''}>${(mu.chronoDuree || 5) - j}</span>`).join('')}</div>` : ''}${p.hype ? `<div class="hype"><div class="h-fond"></div>${p.hype.mots.map((w) => `<div class="hw ${w.style || 'sub'}" style="top:${w.top}px;font-size:${w.taille}px">${u.esc(w.texte)}${w.coeur ? '<svg class="coeur" viewBox="0 0 100 90" width="200" height="180"><path d="M50 86 C20 62 4 46 4 28 C4 14 15 4 28 4 C38 4 46 10 50 18 C54 10 62 4 72 4 C85 4 96 14 96 28 C96 46 80 62 50 86Z" fill="#ff4fa3" stroke="#ffffff" stroke-width="5"/></svg>' : ''}</div>`).join('')}</div>` : ''}${p.accroche ? `<div class="accroche"><p>${u.esc(p.accroche.texte)}</p></div>` : ''}${prog && p.teaser ? `<div class="teaser"><p>${u.esc(p.teaser.texte)}</p><div class="t-cases">${Array.from({ length: p.teaser.n || 4 }, (_, i) => `<i>${p.teaser.reponse ? `<b style="font-size:${Math.min(110, Math.floor(760 / (p.teaser.n || 4)))}px">${u.esc(p.teaser.reponse[i] || '')}</b>` : ''}</i>`).join('')}</div></div>` : ''}${prog ? DEC.anim(p.animation)[0]() : ''}`;
      },
      jouer(c, el, p, t0, d) {
        const cases = qa(el, '.case'), indices = qa(el, '.indices p.i-ind'), intro = q(el, '.indices p.i-intro'), pFin = q(el, '.indices p.i-fin'), paliers = qa(el, '.palier'), rail = q(el, '.rail i'), grille = q(el, '.grille');
        const ox = +grille.dataset.ox, oy = +grille.dataset.oy, sparks = qa(el, '.etincelle'), bandeau = q(el, '.bandeau'), tampon = q(el, '.tampon'), scotchs = qa(el, '.scotch');
        const premier = p.mots[0].indice.t, muet = !!p.muetCfg, prog = p.affichage === 'progressif', fixe = !!(p.muetCfg && p.muetCfg.titreFixe), N = p.mots.length, mid = p.palier || (N === 3 ? 1 : 2);
        gsap.set(qa(el, '.case em'), { opacity: 0 }); gsap.set(qa(el, '.case u'), { opacity: 0 }); gsap.set(qa(el, '.case s'), { opacity: 0 }); gsap.set(qa(el, '.halo'), { opacity: 0 });
        gsap.set(indices, { opacity: 0 }); if (intro) gsap.set(intro, { opacity: 0 }); if (pFin) gsap.set(pFin, { opacity: 0 }); gsap.set([bandeau, ...scotchs], { opacity: 0 }); gsap.set(rail, { scaleX: 0 }); gsap.set(sparks, { opacity: 0, left: ox - 9, top: oy - 9 });
        gsap.set(paliers[0], { opacity: 1, scale: 1 }); gsap.set(paliers.slice(1), { opacity: 0.35, scale: 0.85 });
        // Le décor : vagues qui se balancent, crabe, dauphin, souris, livres qui sautent, nuages (jeu-decors.js, tout est fini et déterministe).
        DEC.animer(c, el, p.decor, t0, d);
        if (q(el, '.plume')) gsap.set(q(el, '.plume'), { svgOrigin: '976 1690' });
        const titre = q(el, '.jeu-titre');
        if (titre) { c.lignes(titre, t0 + 0.05); if (!fixe) c.ft(titre, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0 + (muet ? Math.min(premier - 0.9, 2.6) : premier - 0.35)); }
        if (prog && !p.grilleComplete) gsap.set(cases, { opacity: 0 }); else if (prog) c.ft(cases, { scale: 0.92 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, t0); else c.ft(cases, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power3.out', stagger: 0.025 }, t0 + 0.1);
        c.ft(q(el, '.barre'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, t0 + 0.4);
        const tBandeau = t0 + (fixe ? 0 : muet && intro ? Math.min(premier - 0.9, 2.6) + 0.3 : premier - 0.2);
        if (prog && fixe) gsap.set([bandeau, ...scotchs], { opacity: 1, y: 0 }); else c.ft([bandeau, ...scotchs], { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.45, ease: 'back.out(1.6)' }, tBandeau);
        if (intro) { c.ft(intro, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tBandeau + 0.2); c.ft(intro, { opacity: 1 }, { opacity: 0, duration: 0.25 }, t0 + premier - 0.15); }
        // L'intro : la barre pulse une fois (« voyons jusqu'où tu arrives »).
        if (p.pulse && p.pulse.t != null) { c.ft(paliers[0], { scale: 1 }, { scale: 1.18, duration: 0.35, ease: 'power2.out' }, t0 + p.pulse.t); c.ft(paliers[0], { scale: 1.18 }, { scale: 1, duration: 0.5, ease: 'power2.inOut' }, t0 + p.pulse.t + 0.35); }
        // Le minuteur : l'anneau se vide, un chiffre par seconde ; il passe en couleur vive pendant les trois dernières secondes.
        const debuts = p.mots.map((m, k) => (k ? p.mots[k - 1].reponse.t : m.indice.t)), fins = p.mots.map((m) => m.reponse.t);
        const mn = q(el, '.minuteur'), doux = q(el, '.m-doux'), vif = q(el, '.m-vif'), tour = 213.6;
        gsap.set(mn, { opacity: 0 }); gsap.set([doux, vif], { attr: { 'stroke-dasharray': tour, 'stroke-dashoffset': 0 } }); gsap.set(vif, { opacity: 0 }); gsap.set(qa(el, '.m-nb span'), { opacity: 0 });
        c.ft(mn, { opacity: 0 }, { opacity: 0.85, duration: 0.5 }, t0 + debuts[0]);
        c.ft(mn, { opacity: 0.85 }, { opacity: 0, duration: 0.6 }, t0 + fins[N - 1] + 0.3);
        if (pFin) c.ft(pFin, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t0 + fins[N - 1] + 1.5);
        if (!(prog && N === 1)) c.ft([bandeau, ...scotchs], { opacity: 0.85 }, { opacity: 0, duration: 0.5 }, t0 + (pFin ? Math.max(d - 0.4, fins[N - 1] + 2.4) : fins[N - 1] + 1.6));
        // Mode chrono : l'anneau et le compte à rebours finissent quand la première lettre tombe (le « ding » du chrono, voir montage.js).
        const chrono = !!(p.muetCfg && p.muetCfg.chrono), dChrono = chrono ? (p.muetCfg.chronoDuree || 5) : 0;
        const finsR = chrono ? fins.map((f) => f + GR.LETTRE.vol) : fins, debutsR = chrono ? finsR.map((f) => f - dChrono) : debuts;
        const compte = qa(el, '.compte span');
        if (compte.length) {
          gsap.set(compte, { opacity: 0 });
          compte.forEach((sp, j) => { const tj = t0 + finsR[0] - dChrono + j; c.ft(sp, { opacity: 0, scale: 1.8 }, { opacity: 1, scale: 1, duration: 0.22, ease: 'back.out(2.2)' }, tj); c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.14 }, tj + 0.84); });
        }
        debutsR.forEach((d, w) => {
          const fins = finsR, n = Math.max(1, Math.round(fins[w] - d)), ts = t0 + d, dur = fins[w] - d;
          c.ft([doux, vif], { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tour }, duration: dur, ease: 'none' }, ts);
          c.ft(vif, { opacity: 0 }, { opacity: 1, duration: 0.3 }, ts + dur - 3.2);
          c.ft(vif, { opacity: 1 }, { opacity: 0, duration: 0.2 }, ts + dur + 0.02);
          qa(el, `.m-nb span[data-w="${w}"]`).forEach((sp, j) => {
            const tj = ts + j * (dur / n);
            c.ft(sp, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.18, ease: 'power2.out' }, tj);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, tj + dur / n - 0.1);
            if (j >= n - 3) c.ft(mn, { scale: 1.14 }, { scale: 1, duration: 0.4, ease: 'power2.out' }, tj);
          });
        });
        // Progressif : la caméra (échelle + translation de la grille) cadre les mots déjà posés, puis dézoome à chaque mot qui arrive.
        const vues = [], centres = [], CX = p.zoneSure ? 490 : 540, LW = p.zoneSure ? 820 : 960, CY = p.coupure ? 1075 : 1010;
        if (prog) {
          const gx = parseFloat(grille.style.left), gy = parseFloat(grille.style.top), sz = parseFloat(grille.style.getPropertyValue('--case'));
          const R = cases.map((x) => ({ l: parseFloat(x.style.left), t: parseFloat(x.style.top), k: Math.min(...x.dataset.m.split(' ').map(Number)) }));
          for (let k = 0; k < N; k += 1) {
            const S = R.filter((r) => r.k <= k), l = Math.min(...S.map((r) => r.l)), t = Math.min(...S.map((r) => r.t)), r2 = Math.max(...S.map((r) => r.l + sz)), b = Math.max(...S.map((r) => r.t + sz));
            const s = Math.max(1, Math.min(LW / (r2 - l), 740 / (b - t), 175 / sz));
            centres.push([(l + r2) / 2, (t + b) / 2]);
            vues.push({ scale: s, x: CX - gx - s * (l + r2) / 2, y: CY - gy - s * (t + b) / 2 });
          }
          if (p.grilleComplete) for (let k = 0; k < N; k += 1) { vues[k] = vues[N - 1]; centres[k] = centres[N - 1]; }
          const s0 = vues[0].scale * (N === 1 ? 1 : 1.12), d0 = { scale: s0, x: CX - gx - s0 * centres[0][0], y: CY - gy - s0 * centres[0][1] };
          gsap.set(grille, Object.assign({ transformOrigin: '0 0' }, d0));
          c.ft(grille, d0, Object.assign({ duration: 0.7, ease: 'power3.out' }, vues[0]), t0);
          DEC.anim(p.animation)[1](c, el, p, t0, d);
        }
        // L'accroche : une phrase de défi en très gros dès l'image 0 (pop), qui s'efface au bout de `duree` secondes et laisse la place à la question.
        if (p.accroche) { const ac = q(el, '.accroche p'), da = p.accroche.duree || 2; gsap.set(ac, { opacity: 1 }); c.ft(ac, { scale: 0.88 }, { scale: 1, duration: 0.3, ease: 'back.out(2)' }, t0); c.ft(ac, { opacity: 1 }, { opacity: 0, duration: 0.3 }, t0 + da - 0.1); }
        // La phrase de défi en typographie cinétique, calée sur les mots de la voix : chaque mot arrive à son instant (pop), « feu » qui tremble, « tampon » qui s'écrase ; le calque assombrit la scène puis s'efface.
        if (p.hype) {
          const th = t0 + p.hype.t, fondH = q(el, '.hype .h-fond'), ws = qa(el, '.hype .hw'), fin = th + p.hype.duree;
          gsap.set(fondH, { opacity: 0 }); gsap.set(ws, { opacity: 0 });
          c.ft(fondH, { opacity: 0 }, { opacity: 1, duration: 0.2 }, th - 0.05); c.ft(fondH, { opacity: 1 }, { opacity: 0, duration: 0.3 }, fin);
          p.hype.mots.forEach((w, i) => {
            const e = ws[i], a = th + w.t, sortie = th + (w.sortie == null ? p.hype.duree - 0.12 : w.sortie);
            if (w.style === 'stamp') c.ft(e, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'power3.in' }, a);
            else if (w.style === 'sub') c.ft(e, { opacity: 0, y: 60, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: 'back.out(2)' }, a);
            else c.ft(e, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.4)' }, a);
            if (w.style === 'like') { const cs = q(e, '.coeur'); if (cs) for (let u2 = a + 0.3, k = 0; u2 + 0.3 < sortie; u2 += 0.3, k += 1) c.ft(cs, { scale: k % 2 ? 1.2 : 1 }, { scale: k % 2 ? 1 : 1.2, duration: 0.3, ease: 'sine.inOut' }, u2); }
            if (w.style === 'feu') for (let u2 = a + 0.3, k = 0; u2 + 0.06 < sortie; u2 += 0.06, k += 1) c.ft(e, { x: k % 2 ? -7 : 7, y: k % 3 ? 3 : -3 }, { x: k % 2 ? 7 : -7, y: k % 3 ? -3 : 3, duration: 0.06, ease: 'none' }, u2);
            c.ft(e, { opacity: 1 }, { opacity: 0, duration: 0.2 }, sortie);   // chaque mot s'efface avant la fin du calque : rien ne reste sur la grille
          });
        }
        // Grand chrono du mode « une lettre de plus » : l'anneau se vide jusqu'à la révélation, un chiffre par seconde, une pulsation à chaque nouvelle lettre.
        const cg = q(el, '.chronog');
        if (cg && p.muetCfg && p.muetCfg.etapes) {
          const m0 = p.mots[0], ts = t0 + m0.indice.t, te = t0 + m0.reponse.t + GR.LETTRE.vol, arc = q(cg, '.cg-arc'), tourG = 2 * Math.PI * 94, chiffres = qa(cg, 'span'), D = chiffres.length;
          gsap.set(arc, { attr: { 'stroke-dasharray': tourG, 'stroke-dashoffset': 0 } }); gsap.set(chiffres, { opacity: 0 }); gsap.set(cg, { svgOrigin: '0 0' });
          c.ft(arc, { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tourG }, duration: te - ts, ease: 'none' }, ts);
          chiffres.forEach((sp, j) => { const tj = ts + j * (te - ts) / D; c.ft(sp, { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'back.out(2)' }, tj); c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.1 }, tj + (te - ts) / D - 0.08); });
          p.muetCfg.etapes.ordre.forEach((_, j) => { const th = ts + p.muetCfg.etapes.pas * (j + 1); c.ft(cg, { scale: 1.12 }, { scale: 1, duration: 0.35, ease: 'power2.out' }, th); });
          c.ft(cg, { opacity: 1, scale: 1.12 }, { opacity: 0, scale: 0.6, duration: 0.35, ease: 'power2.in' }, te);
        }
        // Le présentateur (hibou) : il arrive, cligne des yeux, ouvre le bec au rythme de sa voix (enveloppe à 15 valeurs par seconde,
        // calculée à la préparation de la voix), une bulle par phrase, et saute de joie à la révélation.
        // QCM : une carte question + trois réponses par question ; elles glissent depuis la droite, la barre se vide en 3 s,
        // la bonne réponse s'allume en vert, les autres s'effacent, puis la carte part vers la gauche.
        // QCM « glaçons » : chaque question est un bloc de glace qui flotte (il tangue doucement), les réponses aussi ;
        // la barre se vide, la bonne réponse s'allume en vert, les autres fondent ; la dernière question reste sans réponse
        // (ok < 0) : un « ? » géant tremble et le spectateur doit répondre en commentaire.
        if (p.qcm) {
          const QS = qa(el, '.qq'), N = QS.length;
          gsap.set(QS, { opacity: 0 });
          p.qcm.questions.forEach((x, i) => {
            const qq = QS[i], ts = t0 + x.t, bar = q(qq, '.q-barre i'), carte = q(qq, '.q-carte'), reps = qa(qq, '.q-rep'), ok = q(qq, '.q-rep.ok'), faux = reps.filter((r) => r !== ok), rev = ts + (p.qcm.reponse || 3.5);
            const fin = i + 1 < N ? t0 + p.qcm.questions[i + 1].t : t0 + d, debut = Math.max(t0, ts - 0.3);
            // Arrivée : le conteneur est visible d'un coup, chaque glaçon monte depuis le bas (sens de la descente) pendant que
            // les glaçons de la question précédente remontent : il y a toujours des glaçons à l'écran.
            // Relais bloc par bloc : chaque glaçon de l'ancienne question s'envole vers le haut (0,3 s) et celui de la nouvelle
            // arrive par le bas en recouvrant la fin de ce départ (0,1 s de chevauchement) : l'écran n'est jamais vide.
            const blocs = [carte, ...reps], tE = ts - 0.37;
            if (p.qcm.simple) {   // QCM simple : la question suivante (carte + réponses) attend en petit sous le décompte, puis monte prendre sa place
              const tg = q(qq, '.q-tete'), prec = i ? t0 + p.qcm.questions[i - 1].t : t0, deb = i ? t0 + p.qcm.questions[i - 1].t : t0;
              const PV = { y: 694, scale: 0.6 };
              gsap.set(qq, { transformOrigin: '490px 372px' });
              if (i === 0) { gsap.set(qq, { opacity: 1, y: 0, scale: 1 }); }
              else {
                gsap.set(qq, { opacity: 0 }); gsap.set(tg, { opacity: 0 });
                if (i === 1) gsap.set(qq, { opacity: 1, y: PV.y, scale: PV.scale });   // la 2e question attend déjà en petit dès l'image 0
                else c.ft(qq, { opacity: 0, y: PV.y + 70, scale: PV.scale }, { opacity: 1, y: PV.y, scale: PV.scale, duration: 0.35, ease: 'power2.out' }, prec + 0.1);
                c.ft(qq, { y: PV.y, scale: PV.scale }, { y: 0, scale: 1, duration: 0.42, ease: 'power3.inOut' }, tE);
                c.ft(tg, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tE + 0.2);
              }
              [carte, ...reps].forEach((g, j) => { const per = 0.7 + 0.08 * j, n = Math.max(1, Math.floor((fin - deb) / per));
                c.ft(g, { y: 0 }, { y: -6 - 2 * (j % 2), duration: per, ease: 'sine.inOut', yoyo: true, repeat: n - 1 }, deb + 0.13 * j); });
              if (ok) {
                c.ft(ok, { '--vert': 0 }, { '--vert': 1, duration: 0.18 }, rev);
                c.ft(ok, { scale: 1 }, { scale: 1.05, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }, rev);
                c.ft(faux, { opacity: 1, scale: 1 }, { opacity: 0.38, scale: 0.96, duration: 0.25 }, rev);
              } else {
                const m = q(qq, '.q-mystere'); gsap.set(m, { opacity: 0 });
                c.ft(m, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, rev);
                c.ft(m, { rotation: -6 }, { rotation: 6, duration: 0.09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, rev + 0.3);
              }
              if (i + 1 < N) { const sortie = (g, j) => c.ft(g, { opacity: 1, marginTop: 0 }, { opacity: 0, marginTop: -120, duration: 0.3, ease: 'power2.in' }, fin - 0.57 + 0.03 * j);
                blocs.forEach(sortie); c.ft(tg, { opacity: 1 }, { opacity: 0, duration: 0.2 }, fin - 0.55);
                c.ft(qq, { opacity: 1 }, { opacity: 0, duration: 0.01 }, fin + 0.02); }
              return;
            }
            if (i === 0) gsap.set(qq, { opacity: 1 });
            else { gsap.set(qq, { opacity: 0 }); c.ft(qq, { opacity: 0 }, { opacity: 1, duration: 0.01 }, tE);
              [q(qq, '.q-tete'), q(qq, '.q-barre')].forEach((g) => c.ft(g, { opacity: 0 }, { opacity: 1, duration: 0.25 }, tE + 0.05));
              blocs.forEach((g, j) => c.ft(g, { opacity: 0, marginTop: 120 }, { opacity: 1, marginTop: 0, duration: 0.4, ease: 'power3.out' }, tE + 0.03 * j)); }
            // le tangage : y et rotation en sinus, une phase différente par bloc
            [carte, ...reps].forEach((g, j) => { const per = 0.7 + 0.08 * j, n = Math.max(1, Math.floor((fin - debut) / per));
              c.ft(g, { y: 0 }, { y: -8 - 2 * (j % 2), duration: per, ease: 'sine.inOut', yoyo: true, repeat: n - 1 }, debut + 0.13 * j);
              c.ft(g, { rotation: j % 2 ? 0.7 : -0.7 }, { rotation: j % 2 ? -0.7 : 0.7, duration: per * 1.6, ease: 'sine.inOut', yoyo: true, repeat: Math.max(0, Math.floor((fin - debut) / (per * 1.6)) - 1) }, debut); });
            gsap.set(bar, { scaleX: 1, transformOrigin: '0 50%' });
            c.ft(bar, { scaleX: 1, backgroundColor: '#bff3ff' }, { scaleX: 0, backgroundColor: '#ff5a3c', duration: rev - ts - 0.5, ease: 'none' }, ts + 0.5);
            if (ok) {
              c.ft(ok, { '--vert': 0 }, { '--vert': 1, duration: 0.18 }, rev);
              c.ft(ok, { scale: 1 }, { scale: 1.07, duration: 0.16, yoyo: true, repeat: 1, ease: 'power2.out' }, rev);
              c.ft(faux, { opacity: 1, scale: 1 }, { opacity: 0.38, scale: 0.96, duration: 0.25 }, rev);
            } else {
              const m = q(qq, '.q-mystere'); gsap.set(m, { opacity: 0 });
              c.ft(m, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.5)' }, rev);
              c.ft(m, { rotation: -6 }, { rotation: 6, duration: 0.09, yoyo: true, repeat: 7, ease: 'sine.inOut' }, rev + 0.3);
              c.ft(reps, { scale: 1 }, { scale: 1.04, duration: 0.25, yoyo: true, repeat: 5, ease: 'sine.inOut', stagger: 0.08 }, rev);
            }
            if (i + 1 < N) { blocs.forEach((g, j) => c.ft(g, { opacity: 1, marginTop: 0 }, { opacity: 0, marginTop: -120, duration: 0.3, ease: 'power2.in' }, fin - 0.57 + 0.03 * j));
              c.ft(q(qq, '.q-tete'), { opacity: 1 }, { opacity: 0, duration: 0.2 }, fin - 0.55); c.ft(q(qq, '.q-barre'), { opacity: 1 }, { opacity: 0, duration: 0.2 }, fin - 0.55);
              c.ft(qq, { opacity: 1 }, { opacity: 0, duration: 0.01 }, fin + 0.02); }
          });
          // Décompte de 5 s (QCM simple) : un anneau qui se vide et un chiffre 5-4-3-2-1 ; à 0, la réponse (✓ ou ?). Piloté par le temps global.
          if (p.qcm.simple) {
            const cp = q(el, '.q-compte'), cn = q(cp, 'span'), ca = q(cp, '.qc-arc'), su = q(el, '.q-suite'), QQ = p.qcm.questions, DUR = p.qcm.compte || 5, C0 = 2 * Math.PI * 52, pc = { t: 0 };
            ca.setAttribute('stroke-dasharray', C0.toFixed(2));
            const majC = () => { const tt = pc.t; let k = 0; QQ.forEach((x, i) => { if (tt >= x.t) k = i; }); const loc = Math.max(0, tt - QQ[k].t), fin = loc >= DUR;
              if (!fin) { const n = Math.ceil(DUR - loc - 1e-9), fr = loc - Math.floor(loc), ps = 1 + 0.22 * Math.max(0, 1 - fr / 0.16);
                cn.textContent = String(n); cn.style.transform = `scale(${ps.toFixed(3)})`; cn.style.color = DUR - loc <= 2 ? '#ff6a4d' : '#ffffff';
                ca.setAttribute('stroke-dashoffset', (C0 * (loc / DUR)).toFixed(2)); ca.setAttribute('stroke', DUR - loc <= 2 ? '#ff6a4d' : '#bff3ff'); }
              else { const ko = QQ[k].ok < 0; cn.textContent = ko ? '?' : '✓'; cn.style.transform = 'scale(1)'; cn.style.color = ko ? '#ffd45c' : '#3ddc84'; ca.setAttribute('stroke-dashoffset', '0'); ca.setAttribute('stroke', ko ? '#ffd45c' : '#3ddc84'); }
              let o = 1; QQ.forEach((x, i) => { if (i) { const dd = x.t - tt; if (dd < 0.45 && dd > -0.1) o = Math.min(o, Math.max(0, Math.min(1, Math.abs(dd - 0.17) / 0.25))); } });
              if (p.qcm.partage) o = Math.min(o, Math.max(0, Math.min(1, 1 - (tt - (p.qcm.partage.t - 0.2)) / 0.25)));
              cp.style.opacity = o.toFixed(3); su.style.opacity = (k + 1 < QQ.length ? o : 0).toFixed(3); };
            majC(); c.ft(pc, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: majC }, t0);
          }
          // Jauge de profondeur : le chiffre compte de palier en palier pendant chaque descente (0,6 s avant la question).
          if (p.qcm.profondeurs) {
            const jb = q(el, '.q-prof b'), PR = p.qcm.profondeurs, QQ = p.qcm.questions, pil = { t: 0 };
            const lis2 = (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); }, fmt = (m) => `${Math.round(m).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' ')} m`;
            const val = (tt) => { let v = PR[0]; QQ.forEach((x, k) => { if (k) { const a = x.t - 0.75; v = v + (PR[k] - v) * lis2((tt - a) / 0.75); } }); const fin = d - 1.1; return v * (1 - lis2((tt - fin) / 0.7)); };
            const maj = () => { jb.textContent = fmt(val(pil.t)); }; maj();
            c.ft(pil, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: maj }, t0);
            QQ.forEach((x, k) => { if (k) c.ft(q(el, '.q-prof'), { scale: 1 }, { scale: 1.08, duration: 0.2, yoyo: true, repeat: 1 }, t0 + x.t - 0.1); });
          }
          if (p.qcm.partage) { const pa = q(el, '.q-partage'); gsap.set(pa, { opacity: 0 }); c.ft(pa, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.35, ease: 'back.out(2)' }, t0 + p.qcm.partage.t); const jg = q(el, '.q-prof'); if (jg) c.ft(jg, { opacity: 1 }, { opacity: 0, duration: 0.25 }, t0 + p.qcm.partage.t - 0.2); }
        }
        if (p.fond3d) {   // fond 3D : la scène est rendue à chaque image par le même pilote fini
          const cv = q(el, '.fond-3d'), F3 = (typeof self !== 'undefined' ? self : this).Avis.fond3d, Lp = d - (p.amorceBoucle || 0);
          if (cv && F3 && F3[p.fond3d]) { const sc3 = F3[p.fond3d](cv, Lp, p.fond3dOpts), pil = { t: 0 }; sc3.maj(0); c.ft(pil, { t: 0 }, { t: d, duration: d, ease: 'none', onUpdate: () => sc3.maj(pil.t) }, t0); }
        }
        if (p.fondAnime) animerFond(c, el, p, t0, d);
        if (p.presentateur) {
          const pr = q(el, '.presente'), bec = q(pr, '.bouche'), yeux = q(pr, '.yeux'), saut = q(pr, '.saut'), bulles = qa(pr, '.bulle'), L = p.presentateur.lignes || [];
          const h2 = p.presentateur.allure === 'hibou2';
          if (!h2) PERSO().jouer(c, pr, 'debout', t0 - 0.7, d, true);
          gsap.set(bulles, { opacity: 0 });
          L.forEach((l, i) => {
            const tl = t0 + l.t, fin = i + 1 < L.length ? t0 + L[i + 1].t - 0.08 : t0 + d;
            if (l.lecture) return;   // la question se lit sur l'écran (karaoké), pas dans une bulle
            if (l.t <= 0 || (i === 0 && p.amorceBoucle)) gsap.set(bulles[i], { opacity: 1 }); else c.ft(bulles[i], { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.2, ease: 'back.out(2.4)' }, tl);
            const vo = p.presentateur.vol, finB = vo && l.t < vo.depart && L[i + 1] && L[i + 1].t > vo.depart ? t0 + vo.depart - 0.1 : fin;   // la bulle part quand il s'envole
            if (l.jusqua != null) c.ft(bulles[i], { opacity: 1 }, { opacity: 0, duration: 0.2 }, t0 + l.jusqua);   // bulle retirée avant la question suivante
            else if (i + 1 < L.length) c.ft(bulles[i], { opacity: 1 }, { opacity: 0, duration: 0.08 }, finB);
            if (h2) return;
            let prec = 0.1;
            (l.env || []).forEach((v, k) => { const ry = Math.max(0.1, v * 30); c.ft(bec, { attr: { ry: prec } }, { attr: { ry }, duration: 1 / 15, ease: 'none' }, tl + k / 15); prec = ry; });
            if (l.env && l.env.length) c.ft(bec, { attr: { ry: prec } }, { attr: { ry: 0.1 }, duration: 0.08 }, tl + l.env.length / 15);
          });
          if (p.presentateur.cta) { const ct = q(pr, '.cta'); gsap.set(ct, { opacity: 0 }); c.ft(ct, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.6)' }, t0 + p.presentateur.cta.t); }
          if (h2) animerHibou2(c, el, p, t0, d);
          else {
          const yT = -338, cl = (t) => c.ft(yeux, { attr: { transform: 'translate(0 0) scale(1 1)' } }, { attr: { transform: `translate(0 ${yT * 0.9}) scale(1 0.1)` }, duration: 0.07, yoyo: true, repeat: 1 }, t);
          for (let t = 1.7; t < d - 0.3; t += 2.9) cl(t0 + t);
          if (p.presentateur.saut != null) { const ts = t0 + p.presentateur.saut; c.ft(saut, { attr: { transform: 'translate(0 0) rotate(0 0 -250)' } }, { attr: { transform: 'translate(0 -110) rotate(0 0 -250)' }, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3 }, ts); }
          // Les « folies » : une par phrase au plus (zoom, yeux, tete, tremble, ejecte). Tout est fini et calé sur la phrase.
          const svgP = q(pr, 'svg'), cadre = q(el, '.cadre'), plumes = qa(pr, '.plume'), confettis = qa(pr, '.confetti'), flash = q(pr, '.flash');
          const hs = (k) => { const x = Math.sin(k * 57.3 + 7.7) * 43758.5; return x - Math.floor(x); };
          const tr0 = 'translate(0 0) rotate(0 0 -250)';
          const secoue = (cible, t, amp, n) => c.ft(cible, { x: -amp }, { x: amp, duration: 0.045, yoyo: true, repeat: 2 * n - 1, ease: 'none' }, t);
          L.forEach((l, i) => {
            const tl = t0 + l.t;
            if (l.folie === 'zoom') { gsap.set(svgP, { transformOrigin: '230px 1250px' }); c.ft(svgP, { scale: 1 }, { scale: 1.55, duration: 0.14, ease: 'power3.out', yoyo: true, repeat: 1, repeatDelay: 0.35 }, tl + 0.12); secoue(bulles[i], tl + 0.12, 7, 5); }
            if (l.folie === 'yeux') { c.ft(yeux, { attr: { transform: 'translate(0 0) scale(1 1)' } }, { attr: { transform: `translate(0 ${yT * -0.5}) scale(1.5 1.5)` }, duration: 0.12, ease: 'back.out(3)', yoyo: true, repeat: 1, repeatDelay: 0.6 }, tl + 0.05); if (cadre) secoue(cadre, tl + 0.9, 9, 4); }
            if (l.folie === 'tete') c.ft(saut, { attr: { transform: tr0 } }, { attr: { transform: 'translate(0 0) rotate(360 0 -250)' }, duration: 0.55, ease: 'back.inOut(1.6)' }, tl + 0.1);
            if (l.folie === 'tremble') {
              c.ft(saut, { attr: { transform: 'translate(-7 0) rotate(0 0 -250)' } }, { attr: { transform: 'translate(7 0) rotate(0 0 -250)' }, duration: 0.05, yoyo: true, repeat: 27, ease: 'none' }, tl);
              plumes.forEach((pl, k) => { const x0 = 120 + hs(k) * 230, y0 = 1120 + hs(k + 50) * 120, tk = tl + 0.1 + k * 0.12; c.ft(pl, { opacity: 0, attr: { transform: `translate(${x0} ${y0}) rotate(0)` } }, { opacity: 0.95, attr: { transform: `translate(${x0 + (hs(k + 9) - 0.5) * 120} ${y0 + 260}) rotate(${(hs(k + 3) - 0.5) * 300})` }, duration: 1.3, ease: 'sine.in' }, tk); c.ft(pl, { opacity: 0.95 }, { opacity: 0, duration: 0.3 }, tk + 1.3); });
              const cg2 = q(el, '.chronog'); if (cg2) secoue(cg2, tl, 6, 12);
            }
            if (l.folie === 'ejecte') {
              const tm = tl + 0.75;
              c.ft(saut, { attr: { transform: tr0 } }, { attr: { transform: 'translate(-700 -1150) rotate(720 0 -250)' }, duration: 0.75, ease: 'power2.out' }, tl);
              c.ft(saut, { attr: { transform: 'translate(-700 -1150) rotate(720 0 -250)' } }, { attr: { transform: 'translate(0 0) rotate(1080 0 -250)' }, duration: 0.8, ease: 'bounce.out' }, tm);
              confettis.forEach((cf, k) => { const a = (k / confettis.length) * Math.PI * 2 + hs(k) * 0.4, r = 260 + hs(k + 20) * 340, x = 230 + Math.cos(a) * r, y = 1240 + Math.sin(a) * r * 0.8; c.ft(cf, { opacity: 1, attr: { transform: 'translate(230 1240) rotate(0)' } }, { opacity: 1, attr: { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${Math.round(hs(k + 5) * 720)})` }, duration: 0.7, ease: 'power3.out' }, tl + 0.05); c.ft(cf, { opacity: 1 }, { opacity: 0, duration: 0.6 }, tl + 1.2); });
              c.ft(flash, { opacity: 0 }, { opacity: 0.75, duration: 0.06, yoyo: true, repeat: 1 }, tl);
              if (cadre) secoue(cadre, tl, 14, 5);
            }
          });
          }
        }
        // Carte d'introduction : le décor seul (sans grille ni question) avec une phrase en très gros, puis elle s'efface et le jeu commence.
        if (p.intro) {
          const ij = q(el, '.intro-jeu'), it = q(ij, 'p'), di = p.intro.duree || 1.2;
          gsap.set(ij, { opacity: 1 });
          gsap.set(it, { opacity: 1 }); c.ft(it, { scale: 0.86 }, { scale: 1, duration: 0.35, ease: 'back.out(2.2)' }, t0);   // texte visible dès l'image 0 (couverture)
          c.ft(it, { scale: 1 }, { scale: 1.06, duration: Math.max(0.1, di - 0.6), ease: 'sine.inOut' }, t0 + 0.35);
          c.ft(ij, { opacity: 1 }, { opacity: 0, duration: 0.18 }, t0 + di - 0.18);
        }
        // La fin « teaser » : la grille s'efface, une nouvelle question arrive avec ses cases vides et son minuteur ; la vidéo coupe avant la réponse (et reboucle sur la première question).
        if (prog && p.teaser) {
          const tt = t0 + fins[N - 1] + (p.teaser.delai == null ? 5.6 : p.teaser.delai), tq = q(el, '.teaser p'), tc = qa(el, '.teaser i'), fond0 = Math.max(0.1, d - (tt - t0) - 0.3);
          gsap.set(tq, { opacity: 0 }); gsap.set(tc, { opacity: 0 });
          c.ft(grille, { opacity: 1 }, { opacity: 0, duration: 0.4 }, tt);
          c.ft(tq, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, tt + 0.3);
          c.ft(tc, { opacity: 0, y: 40, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.9)', stagger: 0.12 }, tt + 0.5);
          c.ft(mn, { opacity: 0 }, { opacity: 0.85, duration: 0.4 }, tt + 0.3);
          c.ft([doux, vif], { attr: { 'stroke-dashoffset': 0 } }, { attr: { 'stroke-dashoffset': tour * 0.72 }, duration: fond0, ease: 'none' }, tt + 0.3);
          if (p.teaser.reponse) {
            const lettres = qa(el, '.teaser i b'), tRev = Math.max(tt + 2.4, d - 0.8 - 0.35 - 0.12 * (lettres.length - 1));
            gsap.set(lettres, { opacity: 0 });
            c.ft(lettres, { opacity: 0, scale: 0.4, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'back.out(2.2)', stagger: 0.12 }, tRev);
            c.ft(tc, { backgroundColor: '#fff6e8' }, { backgroundColor: '#ffd45c', duration: 0.3, stagger: 0.12 }, tRev);
            c.ft(mn, { opacity: 0.85 }, { opacity: 0, duration: 0.3 }, tRev);
          }
          c.ft(tc[0], { scale: 1 }, { scale: 1.08, duration: 0.5, ease: 'sine.inOut' }, tt + 1.4);
          c.ft(tc[0], { scale: 1.08 }, { scale: 1, duration: 0.5, ease: 'sine.inOut' }, tt + 1.9);
        }
        const niveau = (j) => (j < mid ? 0.5 * j / mid : 0.5 + 0.5 * (j - mid) / (N - mid)), deja = new Set();
        p.mots.forEach((m, k) => {
          const ti = t0 + m.indice.t, tr = t0 + m.reponse.t, suivant = k + 1 < N ? t0 + p.mots[k + 1].indice.t : tr + 2;
          // L'indice en cours remplace le précédent dans le bandeau.
          // Muet : le nouvel indice arrive 0,8 s après le zéro du minuteur, l'ancien est parti à 0,4 s (jamais deux textes superposés).
          if (prog && k === 0 && !p.accroche) gsap.set(indices[0], { opacity: 1, y: 0 }); else if (prog && k === 0) c.ft(indices[0], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, t0 + (p.accroche.duree || 2) - 0.1); else c.ft(indices[k], { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, muet && k ? ti + 0.8 : (fixe ? t0 + (prog ? 0 : Math.min(m.indice.t, 0.3)) : ti));
          if (!(prog && N === 1)) c.ft(indices[k], { opacity: 1 }, { opacity: 0, duration: 0.25 }, muet ? tr + 0.4 : Math.max(tr + 1.1, suivant - 0.3));
          // Pendant la recherche, les cases du mot s'illuminent doucement, la case de départ en tête, puis respirent jusqu'à la réponse.
          const siennes = cases.filter((x) => x.dataset.m.split(' ').includes(String(k)));
          const siennes0 = siennes.filter((x) => !deja.has(x)), tp = prog ? ti + (muet && k ? 0.6 : 0) : ti, tpop = prog ? (k ? tp + 0.3 : t0) : ti, donne = prog && p.premiereLettre && k === 0 ? siennes0[0] : null, aRev = siennes0.filter((x) => x !== donne);
          // Mode « une lettre de plus » (un seul mot) : les lettres d'`etapes.ordre` claquent une à une, toutes les `pas` secondes, avant la révélation finale.
          const etapes = p.muetCfg && p.muetCfg.etapes && k === 0 ? p.muetCfg.etapes : null, indicesC = etapes ? etapes.ordre.map((i) => siennes[i]).filter(Boolean) : [], aFin = aRev.filter((x) => !indicesC.includes(x));
          if (donne) { deja.add(donne); gsap.set(donne, { opacity: 1 }); gsap.set(q(donne, 'em'), { opacity: 1 }); gsap.set(q(donne, 'i'), { opacity: 0.5 }); }
          indicesC.forEach((cell, j) => {
            const th = ti + etapes.pas * (j + 1);
            deja.add(cell);
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.5, duration: 0.2 }, th);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, th);
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.4 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: 'back.out(2.4)' }, th);
          });
          // Progressif : la suite de cases de ce mot arrive (pop) au début de sa fenêtre ; les croisements déjà posés restent.
          if (prog && !p.grilleComplete) {
            if (N === 1) { const toutes = [donne, ...aRev].filter(Boolean); gsap.set(toutes, { opacity: 1, scale: 1 }); }   // un seul mot : cases immobiles et complètes dès l'image 0 (couverture nette)   // un seul mot : image 0 complète (couverture)
            else c.ft(aRev, { opacity: 0, y: 40, scale: 0.55 }, { opacity: 1, y: 0, scale: 1, duration: k ? 0.4 : 0.3, ease: 'back.out(1.9)', stagger: k ? 0.12 : 0.07 }, tpop);
            if (k) c.ft(grille, vues[k - 1], Object.assign({ duration: 0.9, ease: 'power2.inOut' }, vues[k]), tp - 0.1);
          }
          const H = GR.horaires(tr, aFin.length, t0 + (m.reponse.f == null ? m.reponse.t : m.reponse.f));
          if (p.lueur !== false) {
            const te = H.depart - 0.05;
            aFin.forEach((cell, i) => {
              const lueurs = [q(cell, 's'), cell.previousElementSibling], base = i === 0 ? 0.85 : 0.5, bas = base * 0.45, ta = tpop + (prog ? 0.35 : 0.3) + i * 0.12;
              c.ft(lueurs, { opacity: 0 }, { opacity: base, duration: 0.6, ease: 'power2.out' }, ta);
              if (i === 0 && q(cell, 'b')) { c.ft(q(cell, 'b'), { scale: 1 }, { scale: 1.7, duration: 0.3, ease: 'power2.out' }, ta); c.ft(q(cell, 'b'), { scale: 1.7 }, { scale: 1, duration: 0.4, ease: 'power2.inOut' }, ta + 0.3); }
              let v = base, tc = ta + 0.7, bas1 = true;
              while (tc + 0.8 <= te - 0.1) { const v2 = bas1 ? bas : base; c.ft(lueurs, { opacity: v }, { opacity: v2, duration: 0.8, ease: 'sine.inOut' }, tc); v = v2; bas1 = !bas1; tc += 0.8; }
              c.ft(lueurs, { opacity: v }, { opacity: 0, duration: 0.3 }, Math.max(tc, te - 0.05));
            });
          }
          // La révélation : une étincelle part de l'orbe vers chaque case neuve, la case s'illumine d'une onde, la lettre monte en devenant nette.
          aFin.forEach((cell, j) => {
            deja.add(cell);
            const ta = H.pose[j], tl = ta - GR.LETTRE.vol;
            const sp = sparks[cases.indexOf(cell)], dx = +cell.dataset.cx - ox, dy = +cell.dataset.cy - oy;
            if (!prog) {
            c.ft(sp, { opacity: 0, x: 0, y: 0, scale: 1 }, { opacity: 1, duration: 0.08 }, tl);
            c.ft(sp, { x: 0 }, { x: dx, duration: GR.LETTRE.vol, ease: 'power1.in' }, tl);
            c.ft(sp, { y: 0 }, { y: dy, duration: GR.LETTRE.vol, ease: 'power3.out' }, tl);
            c.ft(sp, { scale: 1 }, { scale: 0.3, duration: 0.2, ease: 'power2.in' }, tl + 0.35);
            c.ft(sp, { opacity: 1 }, { opacity: 0, duration: 0.12 }, ta); }
            c.ft(q(cell, 'i'), { opacity: 0 }, { opacity: 0.9, duration: 0.14 }, ta);
            c.ft(q(cell, 'i'), { opacity: 0.9 }, { opacity: 0.5, duration: 0.7, ease: 'power2.out' }, ta + 0.14);
            c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.4 }, { opacity: 0, scale: 1.9, duration: 0.6, ease: 'power2.out' }, ta);
            if (p.rarete) { const tiers = p.rarete.couleurs || ['#4da3ff', '#b45cff', '#ffcf3a'], cl = tiers[Math.min(k, tiers.length - 1)]; c.ft(q(cell, 'i'), { backgroundColor: q(cell, 'i').style.background || '#ff7a5c' }, { backgroundColor: cl, duration: 0.2 }, ta + 0.14); }
            c.ft(q(cell, 'em'), { opacity: 0, y: 26, scale: 0.55, filter: 'blur(7px)' }, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.5, ease: 'back.out(2.2)' }, ta);
          });
          // Un croisement déjà révélé par un mot précédent : un simple éclat de la couleur du nouveau mot.
          siennes.filter((x) => !siennes0.includes(x)).forEach((cell) => { c.ft(q(cell, 'u'), { opacity: 0.9, scale: 0.6 }, { opacity: 0, scale: 1.7, duration: 0.6, ease: 'power2.out' }, tr + 0.2); });
          // Le mot complet : une vague de lumière balaie ses lettres, un tampon « TROUVÉ » s'écrase sur le bandeau.
          siennes.forEach((cell, i) => {
            c.ft(q(cell, 'em'), { scale: 1 }, { scale: 1.16, duration: 0.18, ease: 'power2.out' }, H.fin + 0.15 + i * 0.07);
            c.ft(q(cell, 'em'), { scale: 1.16 }, { scale: 1, duration: 0.3, ease: 'power2.inOut' }, H.fin + 0.33 + i * 0.07);
          });
          if (p.rarete) {
            const rr = qa(el, '.rar')[k], ray = q(el, '.rayons'), amp = 0.22 + 0.55 * k / Math.max(1, N - 1);
            c.ft(rr, { opacity: 0 }, { opacity: amp, duration: 0.15 }, H.fin + 0.05); c.ft(rr, { opacity: amp }, { opacity: 0, duration: 0.8 }, H.fin + 0.2);
            if (k >= N - 2) { c.ft(ray, { opacity: 0, scale: 0.3, rotation: 0 }, { opacity: 0.7, scale: 1, rotation: 40, duration: 0.8, ease: 'power2.out' }, H.fin); c.ft(ray, { opacity: 0.7, rotation: 40 }, { opacity: 0, rotation: 110, duration: 1.6, ease: 'none' }, H.fin + 0.8); }
          }
          const plume = q(el, '.plume');
          if (plume) { c.ft(plume, { rotation: 0 }, { rotation: -9, duration: 0.18, ease: 'power2.out' }, H.fin + 0.1); c.ft(plume, { rotation: -9 }, { rotation: 0, duration: 0.4, ease: 'power2.inOut' }, H.fin + 0.28); }
          if (!prog) { c.ft(tampon, { opacity: 0, scale: 1.9 }, { opacity: 1, scale: 1, duration: 0.18, ease: 'power3.in' }, H.fin + 0.1);
          c.ft(tampon, { opacity: 1 }, { opacity: 0, duration: 0.35 }, H.fin + 1.3); }
          const tb = H.fin + 0.2;
          c.ft(rail, { scaleX: niveau(k) }, { scaleX: niveau(k + 1), duration: 0.8, ease: 'power2.inOut' }, tb);
          const monte = k === mid - 1 ? 1 : k === N - 1 ? 2 : -1;
          if (monte > 0) {
            c.ft(paliers[monte], { opacity: 0.35, scale: 0.85 }, { opacity: 1, scale: 1.1, duration: 0.5, ease: 'back.out(2)' }, tb + 0.4);
            c.ft(paliers[monte - 1], { opacity: 1, scale: 1 }, { opacity: 0.5, scale: 0.9, duration: 0.4 }, tb + 0.4);
          }
        });
      },
    },
    // La fin, après la voix : la question au spectateur et la flèche vers les commentaires.
    fin: {
      description: 'La fin, après la voix ("apres": durée en secondes) : la question au spectateur, la flèche vers les commentaires.',
      max: 48,
      ancres: () => [],
      textes: (p) => [p.texte, p.sous],
      dessin: (p, u) => `<p class="grand geant">${u.md(p.texte)}</p>${p.sous ? `<p class="moyen bas">${u.md(p.sous)}</p>` : ''}
        <svg class="fleche" width="1080" height="1920"><path d="M620 1150 C800 1170 900 1230 930 1330 M896 1296 L932 1338 L962 1292" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
      jouer(c, el, p, t0) {
        c.lignes(q(el, '.grand'), t0 + 0.05);
        if (q(el, '.moyen')) c.lignes(q(el, '.moyen'), t0 + 0.35);
        const f = q(el, '.fleche path');
        gsap.set(f, { drawSVG: '0%' });
        c.ft(f, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.7, ease: 'power2.out' }, t0 + 0.8);
      },
    },
  };
});
