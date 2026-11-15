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
        <g class="pres"><g class="tete">
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
    // La scène de théâtre : rideaux rouges qui s'ouvrent, projecteurs, micro sur pied, masques de comédie et de tragédie.
    scene: {
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
