/*
 * Les décors illustrés de la chaîne « avis » : des scènes plein écran (1080 × 1920), dessinées en SVG, avec leurs propres couleurs.
 * Le sujet du décor est dans la moitié basse ; le haut reste sombre pour le texte du plan.
 * Chaque décor : description, svg(), jouer(c, el, t0, d). Calques .loin, .milieu, .pres : ils glissent à des vitesses différentes (profondeur).
 * Pas de filtre SVG (flou) : les halos sont des dégradés, pour un rendu rapide. Répétitions en nombre fini.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.decors = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const qa = (el, s) => [...el.querySelectorAll(s)];
  const fois = (d, periode) => Math.max(1, Math.floor(d / periode));
  const aller = (n) => 2 * n - 1;   // nombre de répétitions pour n allers-retours (yoyo)
  // La profondeur : trois calques qui dérivent pendant tout le plan.
  const profondeur = (c, el, t0, d, sens) => {
    [['.loin', 10], ['.milieu', 22], ['.pres', 44]].forEach(([s, dx]) => {
      const g = qa(el, s); if (g.length) c.ft(g, { x: -dx * sens }, { x: dx * sens, duration: d, ease: 'none' }, t0);
    });
  };
  const lignes = (x, y, liste) => liste.map(([dx, w, k], i) => `<rect class="cl" x="${x + dx}" y="${y + i * 30}" width="${w}" height="12" rx="6" fill="${k}"/>`).join('');

  return {
    // La « cave » du développeur : mur de briques, étagère, deux écrans allumés, quelqu'un de dos avec un casque.
    cave: {
      sons: [{ f: 'clavier.wav', t: 0.3, v: 0.3, boucle: true }],
      description: 'La cave du développeur : briques, étagère, deux écrans qui écrivent du code, quelqu’un de dos avec un casque.',
      svg: () => `<defs>
          <linearGradient id="cv-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0d15"/><stop offset="1" stop-color="#1a1d2c"/></linearGradient>
          <radialGradient id="cv-halo"><stop offset="0" stop-color="#5b8cff" stop-opacity=".55"/><stop offset="1" stop-color="#5b8cff" stop-opacity="0"/></radialGradient>
          <radialGradient id="cv-lampe"><stop offset="0" stop-color="#ffb65c" stop-opacity=".5"/><stop offset="1" stop-color="#ffb65c" stop-opacity="0"/></radialGradient>
          <pattern id="cv-briques" width="160" height="80" patternUnits="userSpaceOnUse"><path d="M0 0 H160 M0 40 H160 M0 0 V40 M80 40 V80" stroke="#ffffff" stroke-opacity=".055" stroke-width="3" fill="none"/></pattern>
          <linearGradient id="cv-bois" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a3a"/><stop offset="1" stop-color="#4a2f1f"/></linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#cv-mur)"/>
        <g class="loin"><rect x="-60" width="1200" height="1920" fill="url(#cv-briques)"/>
          <ellipse class="halo" cx="560" cy="1120" rx="640" ry="520" fill="url(#cv-halo)"/>
          <rect x="70" y="820" width="330" height="18" rx="4" fill="#3b2a20"/>
          <rect x="92" y="716" width="34" height="104" rx="4" fill="#e0564a"/><rect x="130" y="738" width="28" height="82" rx="4" fill="#f2c14e"/><rect x="162" y="724" width="40" height="96" rx="4" fill="#4fa58c"/><rect x="206" y="748" width="26" height="72" rx="4" fill="#d9d2c4"/>
          <path d="M300 820 v-34 h60 v34 z" fill="#b5653a"/><path d="M330 786 C300 740 290 720 312 700 M330 786 C330 730 340 715 334 690 M330 786 C360 745 372 730 356 706" stroke="#4fa58c" stroke-width="9" fill="none" stroke-linecap="round"/>
          <ellipse cx="900" cy="770" rx="230" ry="200" fill="url(#cv-lampe)"/>
          <path d="M900 0 V690" stroke="#2a2d3c" stroke-width="6"/><path class="ampoule" d="M868 690 h64 l-12 34 a22 22 0 0 1 -40 0 z" fill="#ffd28a"/>
        </g>
        <g class="milieu">
          <rect x="806" y="1010" width="196" height="290" rx="14" fill="#1b1e2b"/><rect x="820" y="1024" width="168" height="262" rx="6" fill="#0c1a2b"/>
          ${lignes(836, 1046, [[0, 90, '#6fe3ff'], [16, 120, '#e9eef3'], [16, 70, '#e9eef3'], [32, 96, '#f2c14e'], [16, 110, '#e9eef3'], [0, 60, '#ff7a8a'], [16, 100, '#e9eef3']])}
          <rect x="890" y="1300" width="28" height="34" fill="#1b1e2b"/>
          <rect x="262" y="930" width="520" height="352" rx="20" fill="#1b1e2b"/><rect x="280" y="948" width="484" height="316" rx="8" fill="#0c1a2b"/>
          ${lignes(304, 976, [[0, 150, '#ff7a8a'], [28, 250, '#e9eef3'], [28, 190, '#6fe3ff'], [56, 220, '#e9eef3'], [56, 130, '#f2c14e'], [28, 280, '#e9eef3'], [0, 110, '#ff7a8a'], [28, 200, '#6fe3ff'], [28, 160, '#e9eef3']])}
          <rect class="curseur" x="500" y="1214" width="12" height="22" fill="#ffffff"/>
          <rect x="492" y="1282" width="60" height="44" fill="#1b1e2b"/><rect x="420" y="1322" width="204" height="14" rx="7" fill="#1b1e2b"/>
          <rect x="-40" y="1336" width="1160" height="44" fill="url(#cv-bois)"/><rect x="-40" y="1336" width="1160" height="6" fill="#b98258"/>
          <rect x="-40" y="1380" width="1160" height="540" fill="#0c0d14"/>
          <path d="M112 1250 h76 v66 a20 20 0 0 1 -20 20 h-36 a20 20 0 0 1 -20 -20 z" fill="#e9eef3"/><path d="M188 1268 h14 a16 16 0 0 1 0 36 h-14" stroke="#e9eef3" stroke-width="9" fill="none"/>
          <path class="vapeur" d="M132 1236 C118 1212 146 1198 132 1172" stroke="#ffffff" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path class="vapeur" d="M166 1236 C152 1212 180 1198 166 1172" stroke="#ffffff" stroke-opacity=".55" stroke-width="7" fill="none" stroke-linecap="round"/>
          <rect x="640" y="1310" width="250" height="26" rx="8" fill="#2a2e40"/>
        </g>
        <g class="pres"><g class="tete figurant">
          <path d="M210 1920 C210 1640 330 1560 540 1560 C750 1560 870 1640 870 1920 Z" fill="#06070b"/>
          <path d="M214 1900 C220 1650 336 1566 540 1566 C744 1566 860 1650 866 1900" stroke="#5b8cff" stroke-opacity=".55" stroke-width="5" fill="none"/>
          <circle cx="540" cy="1470" r="128" fill="#06070b"/><path d="M420 1430 A128 128 0 0 1 660 1430" stroke="#5b8cff" stroke-opacity=".6" stroke-width="5" fill="none"/>
          <path d="M404 1470 A138 138 0 0 1 676 1470" stroke="#2a2e40" stroke-width="26" fill="none" stroke-linecap="round"/>
          <rect x="376" y="1440" width="52" height="112" rx="24" fill="#2a2e40"/><rect x="652" y="1440" width="52" height="112" rx="24" fill="#2a2e40"/>
        </g></g>`,
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, 1);
        const cl = qa(el, '.cl'); gsap.set(cl, { scaleX: 0, transformOrigin: '0% 50%' });
        c.ft(cl, { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power1.out', stagger: 0.16, transformOrigin: '0% 50%', repeat: fois(d, 4.2) - 1, repeatDelay: 1.2 }, t0 + 0.2);
        c.ft(qa(el, '.curseur'), { opacity: 1 }, { opacity: 0, duration: 0.35, ease: 'steps(1)', yoyo: true, repeat: aller(fois(d, 0.7)) }, t0);
        c.ft(qa(el, '.halo'), { opacity: 0.75 }, { opacity: 1, duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 1.8)) }, t0);
        const v = qa(el, '.vapeur'); gsap.set(v, { opacity: 0 });
        c.ft(v, { y: 10, opacity: 0.7 }, { y: -46, opacity: 0, duration: 1.6, ease: 'sine.out', stagger: 0.5, repeat: fois(d, 1.6) - 1 }, t0 + 0.2);
        c.ft(qa(el, '.tete'), { y: 0, rotation: -1 }, { y: 8, rotation: 1, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.6)), svgOrigin: '540 1800' }, t0);
      },
    },
    // Le robot : un buste de robot devant un mur de circuits ; il cligne des yeux, regarde, « parle ».
    robot: {
      description: 'L’IA : un buste de robot devant un mur de circuits ; ses yeux bougent et clignent, sa bouche s’anime.',
      accent: '#6fe3ff',
      svg: () => `<defs>
          <linearGradient id="rb-fond" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0f22"/><stop offset="1" stop-color="#231a4d"/></linearGradient>
          <radialGradient id="rb-halo"><stop offset="0" stop-color="#7d6bff" stop-opacity=".6"/><stop offset="1" stop-color="#7d6bff" stop-opacity="0"/></radialGradient>
          <linearGradient id="rb-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1f4fa"/><stop offset="1" stop-color="#9aa6c2"/></linearGradient>
          <linearGradient id="rb-corps" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c9d2e6"/><stop offset="1" stop-color="#5d6887"/></linearGradient>
          <radialGradient id="rb-oeil"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#6fe3ff"/><stop offset="1" stop-color="#6fe3ff" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#rb-fond)"/>
        <g class="loin">
          <g stroke="#8f9bff" stroke-opacity=".28" stroke-width="5" fill="none" stroke-linecap="round">
            <path d="M-20 760 H170 V900 H300"/><path d="M1100 820 H930 V700 H800"/><path d="M-20 1280 H140 V1160 H250"/><path d="M1100 1340 H960 V1200 H860"/><path d="M90 1920 V1620 H230"/><path d="M990 1920 V1560 H870"/>
          </g>
          ${[[300, 900], [800, 700], [250, 1160], [860, 1200], [230, 1620], [870, 1560]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="13" fill="#8f9bff" fill-opacity=".55"/>`).join('')}
          <circle class="influx i1" cx="-20" cy="760" r="9" fill="#6fe3ff"/><circle class="influx i2" cx="1100" cy="820" r="9" fill="#6fe3ff"/><circle class="influx i3" cx="-20" cy="1280" r="9" fill="#6fe3ff"/><circle class="influx i4" cx="1100" cy="1340" r="9" fill="#6fe3ff"/>
          <ellipse class="halo" cx="540" cy="1060" rx="560" ry="520" fill="url(#rb-halo)"/>
        </g>
        <g class="milieu"><g class="buste" transform="translate(0 80)">
          <path d="M150 1920 C150 1560 300 1420 540 1420 C780 1420 930 1560 930 1920 Z" fill="url(#rb-corps)"/>
          <rect x="400" y="1560" width="280" height="170" rx="26" fill="#1a1f38"/>
          <circle class="led" cx="456" cy="1612" r="16" fill="#6fe3ff"/><circle class="led" cx="512" cy="1612" r="16" fill="#f2c14e"/><circle class="led" cx="568" cy="1612" r="16" fill="#ff7a8a"/>
          <rect x="432" y="1660" width="216" height="12" rx="6" fill="#3a4168"/><rect x="432" y="1688" width="150" height="12" rx="6" fill="#3a4168"/>
          <rect x="478" y="1330" width="124" height="110" fill="#5d6887"/><rect x="478" y="1360" width="124" height="10" fill="#3a4168"/><rect x="478" y="1392" width="124" height="10" fill="#3a4168"/>
          <g class="tete">
            <path d="M540 880 V790" stroke="#9aa6c2" stroke-width="12"/><circle class="antenne" cx="540" cy="772" r="26" fill="#ff7a8a"/>
            <rect x="282" y="1010" width="46" height="130" rx="18" fill="#7f8aa8"/><rect x="752" y="1010" width="46" height="130" rx="18" fill="#7f8aa8"/>
            <rect x="316" y="870" width="448" height="470" rx="110" fill="url(#rb-metal)"/>
            <rect x="366" y="950" width="348" height="300" rx="80" fill="#12162c"/>
            <g class="yeux"><circle cx="462" cy="1050" r="58" fill="url(#rb-oeil)"/><circle cx="618" cy="1050" r="58" fill="url(#rb-oeil)"/></g>
            ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<rect class="bouche" x="${462 + i * 24}" y="1160" width="12" height="44" rx="6" fill="#6fe3ff"/>`).join('')}
            <path d="M360 930 C420 890 500 880 560 882" stroke="#ffffff" stroke-opacity=".7" stroke-width="10" fill="none" stroke-linecap="round"/>
          </g>
        </g></g>`,
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, -1);
        c.ft(qa(el, '.halo'), { opacity: 0.7 }, { opacity: 1, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.2)) }, t0);
        // Les influx courent le long des circuits.
        [['.i1', [[190, 0], [190, 140], [320, 140]]], ['.i2', [[-170, 0], [-170, -120], [-300, -120]]], ['.i3', [[160, 0], [160, -120], [270, -120]]], ['.i4', [[-140, 0], [-140, -140], [-240, -140]]]].forEach(([s, pas], k) => {
          const e = qa(el, s); let t = t0 + 0.3 * k;
          for (let n = 0; n < fois(d, 2.4); n += 1) {
            let de = { x: 0, y: 0 };
            c.ft(e, { opacity: 0 }, { opacity: 1, duration: 0.1 }, t);
            pas.forEach(([x, y]) => { c.ft(e, de, { x, y, duration: 0.45, ease: 'none' }, t); de = { x, y }; t += 0.45; });
            c.ft(e, { opacity: 1 }, { opacity: 0, duration: 0.2 }, t); t += 1.05;
          }
        });
        c.ft(qa(el, '.tete'), { rotation: -3 }, { rotation: 3, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.4)), svgOrigin: '540 1340' }, t0);
        c.ft(qa(el, '.yeux'), { x: -14 }, { x: 14, duration: 1.1, ease: 'power2.inOut', yoyo: true, repeat: aller(fois(d, 2.2)), repeatDelay: 0.5 }, t0 + 0.3);
        c.ft(qa(el, '.yeux circle'), { scaleY: 1 }, { scaleY: 0.08, duration: 0.09, ease: 'power1.in', yoyo: true, repeat: aller(fois(d, 2.3)), repeatDelay: 1.05, transformOrigin: '50% 50%' }, t0 + 1.2);
        c.ft(qa(el, '.bouche'), { scaleY: 0.25 }, { scaleY: 1, duration: 0.16, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 0.32)), stagger: { each: 0.05, from: 'center' }, transformOrigin: '50% 50%' }, t0 + 0.4);
        c.ft(qa(el, '.antenne'), { scale: 1 }, { scale: 1.35, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 1.0)), transformOrigin: '50% 50%' }, t0);
        c.ft(qa(el, '.led'), { opacity: 1 }, { opacity: 0.25, duration: 0.4, ease: 'steps(1)', yoyo: true, repeat: aller(fois(d, 0.8)), stagger: 0.27 }, t0);
      },
    },
    // Le mur d'escalade : panneaux, prises de couleur, corde, une grimpeuse ou un grimpeur de dos.
    mur: {
      sons: [{ f: 'craie.wav', t: 0.4, v: 0.45 }],
      description: 'La salle d’escalade : panneaux, prises de couleur, corde, quelqu’un de dos sur le mur.',
      accent: '#ff8a3d',
      svg: () => `<defs>
          <linearGradient id="mu-fond" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#252a36"/><stop offset="1" stop-color="#414a5c"/></linearGradient>
          <radialGradient id="mu-craie"><stop offset="0" stop-color="#ffffff" stop-opacity=".8"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#mu-fond)"/>
        <g class="loin">
          <path d="M-60 0 L420 0 L300 1920 L-60 1920 Z" fill="#000000" opacity=".14"/><path d="M760 0 L1140 0 L1140 1920 L880 1920 Z" fill="#ffffff" opacity=".05"/>
          <g stroke="#000000" stroke-opacity=".28" stroke-width="5"><path d="M420 0 L300 1920"/><path d="M760 0 L880 1920"/><path d="M-60 640 H1140"/><path d="M-60 1280 H1140"/></g>
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].flatMap((j) => [0, 1, 2, 3, 4, 5].map((i) => `<circle cx="${90 + i * 180 + (j % 2) * 90}" cy="${80 + j * 160}" r="6" fill="#000000" opacity=".3"/>`)).join('')}
        </g>
        <g class="milieu">
          <path d="M106 720 C106 680 163 672 194 707 C203 746 159 764 128 755 C110 746 106 733 106 720 Z" fill="#ff8a3d"/><circle cx="150" cy="720" r="7" fill="#00000055"/><path d="M342 770 C342 736 391 728 418 759 C426 793 388 808 361 800 C346 793 342 781 342 770 Z" fill="#f2c14e"/><circle cx="380" cy="770" r="7" fill="#00000055"/><path d="M660 850 C660 814 712 806 740 838 C748 874 708 890 680 882 C664 874 660 862 660 850 Z" fill="#3fae7c"/><circle cx="700" cy="850" r="7" fill="#00000055"/><path d="M854 760 C854 719 914 709 946 746 C955 788 909 806 877 797 C859 788 854 774 854 760 Z" fill="#e0564a"/><circle cx="900" cy="760" r="7" fill="#00000055"/><path d="M190 1010 C190 974 242 966 270 998 C278 1034 238 1050 210 1042 C194 1034 190 1022 190 1010 Z" fill="#5b8cff"/><circle cx="230" cy="1010" r="7" fill="#00000055"/><path d="M816 1090 C816 1050 873 1042 904 1077 C913 1116 869 1134 838 1125 C820 1116 816 1103 816 1090 Z" fill="#f2c14e"/><circle cx="860" cy="1090" r="7" fill="#00000055"/><path d="M74 1300 C74 1259 134 1249 166 1286 C175 1328 129 1346 97 1337 C79 1328 74 1314 74 1300 Z" fill="#3fae7c"/><circle cx="120" cy="1300" r="7" fill="#00000055"/><path d="M390 1500 C390 1464 442 1456 470 1488 C478 1524 438 1540 410 1532 C394 1524 390 1512 390 1500 Z" fill="#ff8a3d"/><circle cx="430" cy="1500" r="7" fill="#00000055"/><path d="M608 1570 C608 1532 663 1524 692 1557 C700 1595 658 1612 629 1604 C612 1595 608 1583 608 1570 Z" fill="#e0564a"/><circle cx="650" cy="1570" r="7" fill="#00000055"/><path d="M886 1420 C886 1380 943 1372 974 1407 C983 1446 939 1464 908 1455 C890 1446 886 1433 886 1420 Z" fill="#5b8cff"/><circle cx="930" cy="1420" r="7" fill="#00000055"/><path d="M232 1700 C232 1657 294 1647 328 1686 C338 1729 290 1748 256 1738 C237 1729 232 1714 232 1700 Z" fill="#f2c14e"/><circle cx="280" cy="1700" r="7" fill="#00000055"/><path d="M774 1760 C774 1719 834 1709 866 1746 C875 1788 829 1806 797 1797 C779 1788 774 1774 774 1760 Z" fill="#ff8a3d"/><circle cx="820" cy="1760" r="7" fill="#00000055"/><path d="M524 420 C524 388 571 380 596 409 C603 442 567 456 542 449 C528 442 524 431 524 420 Z" fill="#5b8cff"/><circle cx="560" cy="420" r="7" fill="#00000055"/><path d="M846 360 C846 329 890 323 914 350 C921 380 887 394 863 387 C849 380 846 370 846 360 Z" fill="#3fae7c"/><circle cx="880" cy="360" r="7" fill="#00000055"/><path d="M166 330 C166 299 210 293 234 320 C241 350 207 364 183 357 C169 350 166 340 166 330 Z" fill="#e0564a"/><circle cx="200" cy="330" r="7" fill="#00000055"/>
          <path class="corde" d="M560 -20 C590 400 520 800 540 1230" fill="none" stroke="#e9eef3" stroke-width="9" stroke-linecap="round"/><path class="corde" d="M560 -20 C590 400 520 800 540 1230" fill="none" stroke="#ff8a3d" stroke-width="9" stroke-linecap="round" stroke-dasharray="18 30"/>
        </g>
        <g class="pres"><g class="corps figurant">
          <path d="M500 1270 L410 1390 L428 1492" fill="none" stroke="#2e5a66" stroke-width="62" stroke-linecap="round" stroke-linejoin="round"/><path d="M580 1270 L662 1420 L650 1560" fill="none" stroke="#2e5a66" stroke-width="62" stroke-linecap="round" stroke-linejoin="round"/>
          <ellipse cx="428" cy="1500" rx="40" ry="26" fill="#f2c14e"/><ellipse cx="650" cy="1568" rx="40" ry="26" fill="#f2c14e"/>
          <path d="M590 1030 L690 962 L700 866" fill="none" stroke="#f3c6a0" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/>
          <g class="bras"><path d="M490 1030 L402 910 L382 782" fill="none" stroke="#f3c6a0" stroke-width="44" stroke-linecap="round" stroke-linejoin="round"/></g>
          <rect x="462" y="990" width="156" height="260" rx="56" fill="#ff8a3d"/><rect x="462" y="1200" width="156" height="96" rx="36" fill="#2e5a66"/>
          <path d="M462 1226 H618" stroke="#1b1b1f" stroke-width="14"/><ellipse cx="600" cy="1296" rx="34" ry="42" fill="#e0564a"/>
          <circle cx="540" cy="930" r="58" fill="#3a2a22"/><path d="M500 968 C520 990 560 990 580 968" fill="none" stroke="#f3c6a0" stroke-width="26" stroke-linecap="round"/>
        </g>
          <circle class="craie" cx="382" cy="770" r="70" fill="url(#mu-craie)"/><circle class="craie" cx="700" cy="856" r="60" fill="url(#mu-craie)"/>
        </g>`,
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, -1);
        c.ft(qa(el, '.corps'), { y: 0 }, { y: -18, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.4)) }, t0);
        c.ft(qa(el, '.bras'), { rotation: 0 }, { rotation: 7, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.4)), svgOrigin: '490 1030' }, t0);
        c.ft(qa(el, '.corde'), { x: -10 }, { x: 10, duration: 1.8, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.6)) }, t0);
        const cr = qa(el, '.craie'); gsap.set(cr, { opacity: 0, transformOrigin: '50% 50%' });
        c.ft(cr, { scale: 0.4, opacity: 0.9 }, { scale: 1.6, opacity: 0, duration: 1.1, ease: 'power2.out', stagger: 0.6, repeat: fois(d, 2.2) - 1, repeatDelay: 1.1, transformOrigin: '50% 50%' }, t0 + 0.4);
      },
    },
    // Le salon : une grande fenêtre ouverte sur un dehors brûlant, un canapé, et un thermomètre au mur, loin de la fenêtre.
    salon: {
      description: 'Un salon : fenêtre ouverte sur un dehors très chaud, rideaux qui bougent, canapé, plante, thermomètre au mur à l’opposé.',
      accent: '#ffb238',
      svg: () => `<defs>
          <linearGradient id="sa-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16262f"/><stop offset="1" stop-color="#2c4a55"/></linearGradient>
          <linearGradient id="sa-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8a3d"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
          <linearGradient id="sa-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a06a3f"/><stop offset="1" stop-color="#4a2c18"/></linearGradient>
          <radialGradient id="sa-lueur"><stop offset="0" stop-color="#ffb238" stop-opacity=".5"/><stop offset="1" stop-color="#ffb238" stop-opacity="0"/></radialGradient>
          <radialGradient id="sa-rond"><stop offset="0" stop-color="#e0564a" stop-opacity=".6"/><stop offset="1" stop-color="#e0564a" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#sa-mur)"/>
        <g class="loin">
          <ellipse cx="280" cy="930" rx="520" ry="560" fill="url(#sa-lueur)"/>
          <rect x="90" y="650" width="380" height="560" fill="url(#sa-ciel)"/>
          <circle class="astre" cx="350" cy="800" r="74" fill="#fff3c4"/>
          <path d="M90 1130 C170 1070 230 1110 300 1080 C370 1050 420 1100 470 1070 V1210 H90 Z" fill="#d9772e" opacity=".8"/>
          ${[880, 960, 1040].map((y) => `<path class="onde" d="M130 ${y} q28 -22 56 0 t56 0 t56 0 t56 0 t56 0" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="7" stroke-linecap="round"/>`).join('')}
          <rect x="74" y="634" width="412" height="592" fill="none" stroke="#e9e2d2" stroke-width="22"/>
          <path d="M74 634 L8 676 V1260 L74 1226 Z" fill="#e9e2d2" opacity=".5"/><path d="M486 634 L552 676 V1260 L486 1226 Z" fill="#e9e2d2" opacity=".5"/>
          <rect x="52" y="1226" width="456" height="26" rx="6" fill="#e9e2d2"/>
          <rect x="640" y="700" width="170" height="210" rx="8" fill="#12202a" stroke="#c9a56a" stroke-width="12"/><path d="M660 880 L710 800 L745 846 L770 812 L792 880 Z" fill="#4fa58c"/><circle cx="770" cy="752" r="18" fill="#f2c14e"/>
        </g>
        <g class="milieu">
          <path class="rideau rg" d="M40 610 H170 C150 820 190 1040 130 1290 H40 Z" fill="#f1ead9"/><path class="rideau rd" d="M520 610 H400 C420 820 380 1040 440 1290 H520 Z" fill="#f1ead9"/>
          <rect x="20" y="596" width="520" height="22" rx="11" fill="#8a6a45"/>
          <circle class="alerte" cx="940" cy="900" r="150" fill="url(#sa-rond)"/>
          <rect x="884" y="740" width="112" height="330" rx="20" fill="#f1ead9"/><rect x="926" y="772" width="28" height="210" rx="14" fill="#c9c2b2"/>
          <rect class="mercure" x="926" y="772" width="28" height="210" rx="14" fill="#e0564a"/><circle cx="940" cy="1012" r="34" fill="#e0564a"/>
          ${[800, 850, 900, 950].map((y) => `<path d="M966 ${y} h18" stroke="#6b6558" stroke-width="5"/>`).join('')}
          <path d="M-60 1460 H1140 V1920 H-60 Z" fill="url(#sa-sol)"/><rect x="-60" y="1444" width="1200" height="20" fill="#0f1c23"/>
          <ellipse cx="560" cy="1650" rx="460" ry="110" fill="#c0564a" opacity=".55"/><ellipse cx="560" cy="1650" rx="360" ry="78" fill="none" stroke="#f1ead9" stroke-opacity=".5" stroke-width="8"/>
        </g>
        <g class="pres">
          <rect x="300" y="1270" width="620" height="210" rx="50" fill="#d9a441"/><rect x="330" y="1390" width="560" height="130" rx="40" fill="#e9b653"/>
          <rect x="262" y="1350" width="96" height="190" rx="40" fill="#c9922f"/><rect x="862" y="1350" width="96" height="190" rx="40" fill="#c9922f"/>
          <rect x="350" y="1300" width="150" height="120" rx="30" fill="#4fa58c"/><rect x="330" y="1530" width="24" height="50" fill="#3a2414"/><rect x="866" y="1530" width="24" height="50" fill="#3a2414"/>
          <path d="M110 1560 h110 l-16 130 h-78 z" fill="#b5653a"/>
          <g class="plante"><path d="M165 1560 C120 1440 80 1400 50 1330 M165 1560 C165 1420 180 1360 170 1270 M165 1560 C210 1450 250 1420 280 1350" stroke="#3f8f6c" stroke-width="16" fill="none" stroke-linecap="round"/>
            <ellipse cx="50" cy="1322" rx="34" ry="60" fill="#4fa58c" transform="rotate(-30 50 1322)"/><ellipse cx="170" cy="1256" rx="34" ry="64" fill="#4fa58c"/><ellipse cx="284" cy="1340" rx="34" ry="60" fill="#4fa58c" transform="rotate(34 284 1340)"/></g>
        </g>`,
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, 1);
        c.ft(qa(el, '.rg'), { skewX: -3 }, { skewX: 5, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.6)), transformOrigin: '50% 0%' }, t0);
        c.ft(qa(el, '.rd'), { skewX: 3 }, { skewX: -5, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.0)), transformOrigin: '50% 0%' }, t0);
        c.ft(qa(el, '.onde'), { x: -16, opacity: 0.2 }, { x: 16, opacity: 0.8, duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 1.6)), stagger: 0.2 }, t0);
        c.ft(qa(el, '.astre'), { scale: 1 }, { scale: 1.12, duration: 1.0, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.0)), transformOrigin: '50% 50%' }, t0);
        c.ft(qa(el, '.alerte'), { scale: 0.6, opacity: 1 }, { scale: 1.25, opacity: 0, duration: 1.2, ease: 'power2.out', repeat: fois(d, 1.2) - 1, transformOrigin: '50% 50%' }, t0 + 0.3);
        c.ft(qa(el, '.mercure'), { scaleY: 0.5 }, { scaleY: 0.62, duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.2)), transformOrigin: '50% 100%' }, t0);
        c.ft(qa(el, '.plante'), { rotation: -2 }, { rotation: 3, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.2)), svgOrigin: '165 1560' }, t0);
      },
    },
    // La rizière en terrasses (Vietnam) : montagnes dans la brume, terrasses inondées, paysan au chapeau conique et son buffle, aigrettes.
    riziere: {
      description: 'Une rizière en terrasses au lever du soleil : montagnes dans la brume, eau qui scintille, paysan au chapeau conique avec son buffle, oiseaux, riz qui ondule.',
      accent: '#ffe08a',
      svg: () => {
        // Les terrasses : des bandes courbes de plus en plus hautes vers le premier plan (perspective).
        const verts = ['#8fcf7a', '#6dbb62', '#57a956', '#7cc46c', '#4f9d50', '#69b65e', '#458f49', '#5aa653', '#3c8343'];
        let y = 930; const terrasses = [];
        verts.forEach((v, i) => {
          const h = 46 + i * i * 3.4 + i * 12, s = i % 2 ? 1 : -1, a = 26 + i * 9;
          const haut = `M-80 ${y} C240 ${y - a * s} 520 ${y + a * s} 760 ${y - a * 0.4 * s} S1080 ${y + a * 0.6 * s} 1160 ${y - a * 0.3 * s}`;
          terrasses.push(`<g class="terrasse"><path d="${haut} V${y + h + 80} H-80 Z" fill="url(#rz-eau)"/><path d="${haut} V${y + h + 80} H-80 Z" fill="url(#rz-riz${Math.min(2, Math.floor(i / 3))})" opacity=".6"/>
            <path d="${haut}" fill="none" stroke="${v}" stroke-width="${14 + i * 3}" stroke-linecap="round"/><path d="${haut}" fill="none" stroke="#2f6b3a" stroke-opacity=".55" stroke-width="${4 + i}" transform="translate(0 ${9 + i * 2})"/>
            ${[0, 1, 2].map((k) => `<path class="eclat" d="M${140 + ((i * 197 + k * 331) % 800)} ${Math.round(y + h * (0.35 + 0.2 * k))} h${40 + i * 8}" stroke="#ffffff" stroke-width="${3 + i * 0.6}" stroke-linecap="round" opacity=".7"/>`).join('')}</g>`);
          y += h;
        });
        const riz = (id, e) => `<pattern id="rz-riz${id}" width="${26 * e}" height="${22 * e}" patternUnits="userSpaceOnUse"><path d="M${6 * e} ${18 * e} v${-10 * e} M${6 * e} ${18 * e} l${-4 * e} ${-8 * e} M${6 * e} ${18 * e} l${4 * e} ${-8 * e} M${19 * e} ${8 * e} v${-7 * e} M${19 * e} ${8 * e} l${-3 * e} ${-6 * e} M${19 * e} ${8 * e} l${3 * e} ${-6 * e}" stroke="#3f9a46" stroke-width="${1.6 * e}" stroke-linecap="round" fill="none"/></pattern>`;
        const oiseau = (x, yy, t) => `<g class="oiseau" transform="translate(${x} ${yy}) scale(${t})"><path class="aile" d="M-34 0 C-20 -22 -8 -18 0 0 C8 -18 20 -22 34 0" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></g>`;
        return `<defs>
          <linearGradient id="rz-ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f3a5a"/><stop offset=".45" stop-color="#c9705a"/><stop offset=".8" stop-color="#ffb46b"/><stop offset="1" stop-color="#ffe2a6"/></linearGradient>
          <radialGradient id="rz-halo"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient>
          <linearGradient id="rz-eau" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe6bd"/><stop offset=".45" stop-color="#a6d8c9"/><stop offset="1" stop-color="#63a9a6"/></linearGradient>
          <linearGradient id="rz-brume" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity="0"/><stop offset=".5" stop-color="#ffffff" stop-opacity=".6"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient>
          ${riz(0, 1)}${riz(1, 1.7)}${riz(2, 2.8)}
        </defs>
        <rect width="1080" height="1000" fill="url(#rz-ciel)"/>
        <g class="loin">
          <circle class="halo" cx="760" cy="720" r="330" fill="url(#rz-halo)"/><circle cx="760" cy="720" r="88" fill="#fff3c4"/>
          <g class="nuage"><ellipse cx="240" cy="470" rx="170" ry="30" fill="#ffffff" opacity=".28"/><ellipse cx="330" cy="446" rx="110" ry="26" fill="#ffffff" opacity=".28"/><ellipse cx="900" cy="540" rx="150" ry="24" fill="#ffffff" opacity=".22"/></g>
          <path d="M-80 900 C-20 700 40 660 90 760 C120 600 190 560 240 700 C290 620 340 640 380 780 C430 640 500 600 560 760 C610 690 680 700 720 800 C780 640 860 610 920 760 C980 680 1060 690 1160 820 V960 H-80 Z" fill="#7d95ad" opacity=".75"/>
          <rect class="brume b1" x="-200" y="760" width="1480" height="110" fill="url(#rz-brume)"/>
          ${oiseau(300, 600, 1)}${oiseau(380, 640, 0.75)}${oiseau(220, 660, 0.6)}
          <path d="M-80 960 C0 800 70 770 130 860 C180 740 260 720 320 860 C380 790 450 800 500 900 C560 800 640 780 700 890 C760 820 840 830 900 910 C960 830 1040 820 1160 900 V1000 H-80 Z" fill="#4f8478"/>
          <rect class="brume b2" x="-200" y="850" width="1480" height="120" fill="url(#rz-brume)"/>
        </g>
        <g class="milieu">
          <path d="M-80 1000 C80 900 200 910 320 960 C460 900 620 900 760 950 C900 900 1020 910 1160 960 V1100 H-80 Z" fill="#3f7f4d"/>
          ${terrasses.slice(0, 5).join('')}
          <g class="paysan" transform="translate(0 0)">
            <g transform="translate(300 1120) scale(0.86)"><g class="marche">
              <ellipse cx="150" cy="-34" rx="74" ry="40" fill="#3b3f46"/><circle cx="226" cy="-52" r="28" fill="#3b3f46"/><path d="M214 -78 C196 -108 226 -116 240 -96 M240 -74 C262 -100 284 -84 266 -62" fill="none" stroke="#d9d2c4" stroke-width="8" stroke-linecap="round"/>
              <path class="pattes" d="M104 -6 V34 M134 -4 V36 M172 -4 V36 M200 -6 V34" stroke="#3b3f46" stroke-width="15" stroke-linecap="round"/><path d="M78 -40 C58 -34 54 -8 60 4" fill="none" stroke="#3b3f46" stroke-width="8" stroke-linecap="round"/>
              <path d="M22 -18 L84 -42" stroke="#8a6a45" stroke-width="5"/>
              <path d="M0 34 L8 -24 M22 34 L14 -24" stroke="#22323f" stroke-width="13" stroke-linecap="round"/><rect x="-6" y="-78" width="34" height="62" rx="14" fill="#2f5f7a"/><circle cx="11" cy="-90" r="15" fill="#e2b48c"/>
              <path d="M-36 -92 L11 -128 L58 -92 Z" fill="#f1e2b0"/><path d="M-36 -92 H58" stroke="#c9b477" stroke-width="5" stroke-linecap="round"/>
            </g></g>
          </g>
        </g>
        <g class="pres">
          ${terrasses.slice(5).join('')}
          <g class="palmier" transform="translate(960 1500)"><path d="M0 0 C-14 -180 6 -330 -22 -470" fill="none" stroke="#3a2a1c" stroke-width="26" stroke-linecap="round"/>
            ${[[-270, 40], [-220, -70], [-120, -150], [60, -160], [170, -90], [230, 30], [-150, 120], [130, 120]].map(([x, yy]) => `<path class="palme" d="M-22 -470 Q${Math.round(-22 + x * 0.55)} ${-470 + yy - 110} ${-22 + x} ${-470 + yy}" fill="none" stroke="#2f7a45" stroke-width="22" stroke-linecap="round"/>`).join('')}</g>
          ${[40, 110, 190, 880, 960, 1030, 280, 760].map((x, i) => `<path class="tige" d="M${x} 1930 C${x - 10} 1830 ${x + 16} 1760 ${x + (i % 2 ? 26 : -22)} ${1650 + (i % 3) * 40}" fill="none" stroke="${i % 2 ? '#2f7a3c' : '#3f9a46'}" stroke-width="${12 + (i % 3) * 3}" stroke-linecap="round"/>`).join('')}
        </g>`;
      },
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, 1);
        c.ft(qa(el, '.halo'), { scale: 0.92 }, { scale: 1.1, duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.2)), transformOrigin: '50% 50%' }, t0);
        c.ft(qa(el, '.b1'), { x: -90 }, { x: 90, duration: d, ease: 'none' }, t0);
        c.ft(qa(el, '.b2'), { x: 110 }, { x: -110, duration: d, ease: 'none' }, t0);
        c.ft(qa(el, '.nuage'), { x: -40 }, { x: 60, duration: d, ease: 'none' }, t0);
        // L'eau scintille : de petits éclats s'allument et s'éteignent.
        const e = qa(el, '.eclat'); gsap.set(e, { opacity: 0 });
        c.ft(e, { opacity: 0, scaleX: 0.3 }, { opacity: 0.85, scaleX: 1, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 1.4)), repeatDelay: 0.4, stagger: 0.37, transformOrigin: '50% 50%' }, t0);
        // Les aigrettes traversent le ciel en battant des ailes ; le paysan et son buffle avancent le long d'une terrasse.
        c.ft(qa(el, '.oiseau'), { x: '-=140', y: '+=30' }, { x: '+=520', y: '-=90', duration: d, ease: 'none' }, t0);
        c.ft(qa(el, '.aile'), { scaleY: 1 }, { scaleY: -0.5, duration: 0.32, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 0.64)), transformOrigin: '50% 100%', stagger: 0.1 }, t0);
        c.ft(qa(el, '.paysan'), { x: -150 }, { x: 170, duration: d, ease: 'none' }, t0);
        c.ft(qa(el, '.marche'), { y: 0 }, { y: -5, duration: 0.35, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 0.7)) }, t0);
        c.ft(qa(el, '.tige'), { rotation: -3 }, { rotation: 4, duration: 1.2, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.4)), stagger: 0.15, transformOrigin: '50% 100%' }, t0);
        c.ft(qa(el, '.palme'), { rotation: -3 }, { rotation: 4, duration: 1.5, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.0)), stagger: 0.1, svgOrigin: '938 1030' }, t0);
      },
    },
    // La scène de théâtre : rideaux rouges qui s'ouvrent, projecteurs, micro sur pied, masques de comédie et de tragédie.
    scene: {
      sons: [{ f: 'rideau.wav', t: 0.15, v: 0.5 }],
      description: 'Le théâtre : rideaux rouges qui s’ouvrent, projecteurs, plancher, micro sur pied, masques de comédie et de tragédie.',
      accent: '#f2c14e',
      svg: () => `<defs>
          <linearGradient id="sc-mur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14070c"/><stop offset="1" stop-color="#34101b"/></linearGradient>
          <linearGradient id="sc-rideau" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#6d1220"/><stop offset=".25" stop-color="#b52236"/><stop offset=".5" stop-color="#7a1424"/><stop offset=".75" stop-color="#c0283d"/><stop offset="1" stop-color="#6d1220"/></linearGradient>
          <linearGradient id="sc-sol" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6238"/><stop offset="1" stop-color="#3d2413"/></linearGradient>
          <linearGradient id="sc-feu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff2c9" stop-opacity=".42"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></linearGradient>
          <radialGradient id="sc-rond"><stop offset="0" stop-color="#fff2c9" stop-opacity=".55"/><stop offset="1" stop-color="#fff2c9" stop-opacity="0"/></radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#sc-mur)"/>
        <g class="loin">
          ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<rect x="${-60 + i * 135}" y="0" width="68" height="1440" fill="#000000" opacity=".16"/>`).join('')}
          <path class="feu f1" d="M120 -40 L330 1500 L760 1500 Z" fill="url(#sc-feu)"/><path class="feu f2" d="M960 -40 L330 1500 L760 1500 Z" fill="url(#sc-feu)"/>
        </g>
        <g class="milieu">
          <path d="M-60 1420 H1140 V1920 H-60 Z" fill="url(#sc-sol)"/>
          <g stroke="#2c190d" stroke-opacity=".5" stroke-width="4">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${540 + (i - 4) * 110} 1420 L${540 + (i - 4) * 330} 1920"/>`).join('')}</g>
          <rect x="-60" y="1420" width="1200" height="8" fill="#d59a62"/>
          <ellipse cx="545" cy="1520" rx="330" ry="70" fill="url(#sc-rond)"/>
          <g class="micro"><ellipse cx="400" cy="1532" rx="80" ry="16" fill="#15161c"/><path d="M400 1528 V1080" stroke="#3b3d48" stroke-width="12"/>
            <g transform="rotate(-16 400 1070)"><rect x="366" y="940" width="68" height="140" rx="34" fill="#d9dce6"/><path d="M366 990 H434 M366 1016 H434 M384 944 V1040 M416 944 V1040" stroke="#7b7f8f" stroke-width="5"/><rect x="380" y="1066" width="40" height="60" rx="10" fill="#3b3d48"/></g></g>
          <g class="masque m1"><path d="M560 960 C560 900 760 900 760 960 C760 1090 720 1170 660 1170 C600 1170 560 1090 560 960 Z" fill="#f2c14e"/>
            <path d="M592 990 C610 962 636 962 650 990 C632 978 610 978 592 990 Z M670 990 C684 962 710 962 728 990 C710 978 688 978 670 990 Z" fill="#3a1a0c"/>
            <path d="M604 1070 C630 1130 690 1130 716 1070 C690 1094 630 1094 604 1070 Z" fill="#3a1a0c"/><path d="M572 930 C610 906 690 902 740 924" stroke="#fff3c4" stroke-width="8" fill="none" stroke-linecap="round" opacity=".7"/></g>
          <g class="masque m2"><g transform="rotate(14 820 1180)"><path d="M720 1120 C720 1060 920 1060 920 1120 C920 1250 880 1330 820 1330 C760 1330 720 1250 720 1120 Z" fill="#ece6d8"/>
            <path d="M752 1136 C770 1164 796 1164 810 1136 C792 1148 770 1148 752 1136 Z M830 1136 C844 1164 870 1164 888 1136 C870 1148 848 1148 830 1136 Z" fill="#3a1a0c"/>
            <path d="M764 1270 C790 1216 850 1216 876 1270 C850 1248 790 1248 764 1270 Z" fill="#3a1a0c"/></g></g>
          ${[0, 1, 2, 3, 4, 5, 6].map((i) => `<circle class="rampe" cx="${120 + i * 140}" cy="1428" r="16" fill="#ffe9a8"/>`).join('')}
        </g>
        <g class="pres">
          <path class="rg" d="M-80 0 H330 C300 420 250 980 150 1500 H-80 Z" fill="url(#sc-rideau)"/><path class="rd" d="M1160 0 H750 C780 420 830 980 930 1500 H1160 Z" fill="url(#sc-rideau)"/>
          <path d="M-80 0 H1160 V150 C1090 250 1000 250 930 150 C860 250 770 250 700 150 C630 250 540 250 470 150 C400 250 310 250 240 150 C170 250 80 250 10 150 C-20 200 -60 220 -80 220 Z" fill="#8a1728"/>
          <path d="M-80 150 C-60 220 -20 200 10 150 C80 250 170 250 240 150 C310 250 400 250 470 150 C540 250 630 250 700 150 C770 250 860 250 930 150 C1000 250 1090 250 1160 150" stroke="#e0b24a" stroke-width="9" fill="none"/>
        </g>`,
      jouer(c, el, t0, d) {
        profondeur(c, el, t0, d, 1);
        // Les rideaux s'ouvrent à l'arrivée du plan.
        c.ft(qa(el, '.rg'), { x: 300 }, { x: 0, duration: 1.1, ease: 'power3.inOut' }, t0 + 0.15);
        c.ft(qa(el, '.rd'), { x: -300 }, { x: 0, duration: 1.1, ease: 'power3.inOut' }, t0 + 0.15);
        c.ft(qa(el, '.f1'), { rotation: -5 }, { rotation: 6, duration: 2.2, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 4.4)), svgOrigin: '120 -40' }, t0);
        c.ft(qa(el, '.f2'), { rotation: 5 }, { rotation: -6, duration: 2.6, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 5.2)), svgOrigin: '960 -40' }, t0);
        c.ft(qa(el, '.m1'), { y: -14, rotation: -4 }, { y: 14, rotation: 4, duration: 1.4, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 2.8)), transformOrigin: '50% 50%' }, t0);
        c.ft(qa(el, '.m2'), { y: 12, rotation: 3 }, { y: -12, rotation: -3, duration: 1.7, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 3.4)), transformOrigin: '50% 50%' }, t0);
        c.ft(qa(el, '.rampe'), { opacity: 1 }, { opacity: 0.45, duration: 0.5, ease: 'sine.inOut', yoyo: true, repeat: aller(fois(d, 1.0)), stagger: 0.12 }, t0);
      },
    },
  };
});
