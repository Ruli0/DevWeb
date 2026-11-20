/*
 * Le jeu de mots fléchés de la chaîne « avis » : quelques mots qui se croisent sur une petite grille, révélés un par un, avec une barre
 * de progression à trois paliers (singe → homme classique → Molière). Voir le plan `grille` dans plans.js.
 *   construire(mots)   place les mots, vérifie les croisements → { lignes, colonnes, cases: [{ l, c, lettre, mots, num }], erreurs }
 *   figure(nom)        le dessin (SVG, 120 × 120) d'un palier : singe, classique, moliere, academicien, hugo, voltaire
 *   dims(g)            la taille des cases et la position de la grille (toute la largeur utile)
 *   horaires, nouvelles, papier, COULEURS   l'horaire des lettres (image et son), les cases neuves d'un mot, la forme papier, les couleurs
 *   css(c, P)          le style de la grille, des cartes d'indice et de la barre
 * Un mot : { texte, sens: 'h' | 'v', ligne, colonne } (la première lettre est en [ligne, colonne]). Fonction pure, sans hasard.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.grille = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function construire(mots) {
    const erreurs = [], carte = new Map();
    (mots || []).forEach((m, k) => {
      const lettres = [...String(m.texte || '').toUpperCase().replace(/[^A-ZÀ-ÖØ-Ý]/g, '')];
      if (lettres.length < 3) { erreurs.push(`mot ${k + 1} : au moins trois lettres`); return; }
      if (m.sens !== 'h' && m.sens !== 'v') { erreurs.push(`mot ${k + 1} : "sens" : "h" (horizontal) ou "v" (vertical)`); return; }
      if (!(Number.isInteger(m.ligne) && Number.isInteger(m.colonne) && m.ligne >= 0 && m.colonne >= 0)) { erreurs.push(`mot ${k + 1} : "ligne" et "colonne" : des entiers à partir de 0`); return; }
      lettres.forEach((lettre, i) => {
        const l = m.ligne + (m.sens === 'v' ? i : 0), c = m.colonne + (m.sens === 'h' ? i : 0), cle = `${l},${c}`, ex = carte.get(cle);
        if (ex && ex.lettre !== lettre) erreurs.push(`mot ${k + 1} (${m.texte}) : la lettre ${i + 1} (${lettre}) tombe sur un « ${ex.lettre} » en ligne ${l + 1}, colonne ${c + 1}`);
        else if (ex) ex.mots.push(k);
        else carte.set(cle, { l, c, lettre, mots: [k], nums: i === 0 ? [k + 1] : [] });
        if (ex && i === 0) ex.nums.push(k + 1);
      });
    });
    // Deux mots dans le même sens ne peuvent pas partager une case (un mot ne s'écrit pas dans un autre).
    (mots || []).forEach((m, k) => (mots || []).forEach((n, j) => {
      if (j <= k || m.sens !== n.sens || !['h', 'v'].includes(m.sens)) return;
      const commun = [...carte.values()].some((x) => x.mots.includes(k) && x.mots.includes(j));
      if (commun) erreurs.push(`mots ${k + 1} et ${j + 1} : deux mots dans le même sens se chevauchent`);
    }));
    const cases = [...carte.values()].sort((a, b) => a.l - b.l || a.c - b.c);
    // Deux cases voisines qui n'appartiennent pas au même mot : des mots collés, illisibles dans une grille.
    cases.forEach((a) => cases.forEach((b) => {
      if (a === b || Math.abs(a.l - b.l) + Math.abs(a.c - b.c) !== 1) return;
      if (!a.mots.some((k) => b.mots.includes(k))) { const msg = `mots collés en ligne ${a.l + 1}, colonne ${a.c + 1}`; if (!erreurs.includes(msg)) erreurs.push(msg); }
    }));
    (mots || []).forEach((m, k) => { if (mots.length > 1 && !cases.some((x) => x.mots.length > 1 && x.mots.includes(k))) erreurs.push(`mot ${k + 1} (${m.texte}) : il ne croise aucun autre mot`); });
    return { lignes: cases.length ? Math.max(...cases.map((x) => x.l)) + 1 : 0, colonnes: cases.length ? Math.max(...cases.map((x) => x.c)) + 1 : 0, cases, erreurs };
  }

  // Les trois figures de la barre, en papier découpé : un singe, un homme à perruque claire, Molière (perruque sombre, plume, collerette).
  const PEAU = '#f3c6a0', ENCRE = '#2a1a14';
  const FIGURES = {
    singe: `<circle cx="22" cy="52" r="15" fill="#7b4f33"/><circle cx="98" cy="52" r="15" fill="#7b4f33"/><circle cx="22" cy="52" r="8" fill="${PEAU}"/><circle cx="98" cy="52" r="8" fill="${PEAU}"/>
      <circle cx="60" cy="58" r="40" fill="#8a5a3c"/><ellipse cx="60" cy="68" rx="28" ry="24" fill="${PEAU}"/><circle cx="46" cy="54" r="5" fill="${ENCRE}"/><circle cx="74" cy="54" r="5" fill="${ENCRE}"/>
      <ellipse cx="60" cy="72" rx="13" ry="9" fill="#e9ab82"/><circle cx="55" cy="71" r="2" fill="${ENCRE}"/><circle cx="65" cy="71" r="2" fill="${ENCRE}"/><path d="M50 84 Q60 92 70 84" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/>`,
    classique: `<path d="M20 70 C6 36 22 8 60 8 C98 8 114 36 100 70 C94 52 84 40 60 40 C36 40 26 52 20 70Z" fill="#ece6d8"/><circle cx="20" cy="76" r="10" fill="#ece6d8"/><circle cx="100" cy="76" r="10" fill="#ece6d8"/>
      <ellipse cx="60" cy="62" rx="26" ry="32" fill="${PEAU}"/><circle cx="50" cy="60" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="60" r="3.5" fill="${ENCRE}"/><path d="M52 76 Q60 82 68 76" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/>
      <path d="M42 94 L60 112 L78 94 L70 90 L60 100 L50 90Z" fill="#fff"/>`,
    moliere: `<path d="M12 78 C0 30 26 6 60 6 C94 6 120 30 108 78 C100 56 88 42 60 42 C32 42 20 56 12 78Z" fill="#4a2f22"/><circle cx="14" cy="84" r="11" fill="#4a2f22"/><circle cx="106" cy="84" r="11" fill="#4a2f22"/>
      <ellipse cx="60" cy="64" rx="26" ry="31" fill="${PEAU}"/><circle cx="50" cy="62" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="62" r="3.5" fill="${ENCRE}"/><path d="M40 52 Q50 47 58 52 M62 52 Q70 47 80 52" fill="none" stroke="${ENCRE}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M52 78 Q60 84 68 78" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/><path d="M62 10 C84 -4 108 4 112 26 C96 14 82 16 70 26Z" fill="#ff5d7a"/>
      <path d="M36 96 Q60 114 84 96 L90 106 Q60 124 30 106Z" fill="#fff" stroke="#d9d0c0" stroke-width="2"/>`,
  };
  FIGURES.academicien = `<path d="M10 40 C24 4 96 4 110 40 C96 30 24 30 10 40Z" fill="#1f2a44"/><path d="M10 40 C24 30 96 30 110 40" fill="none" stroke="#e8b84a" stroke-width="4"/>
      <ellipse cx="60" cy="68" rx="27" ry="31" fill="${PEAU}"/><circle cx="50" cy="66" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="66" r="3.5" fill="${ENCRE}"/><path d="M52 82 Q60 88 68 82" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/>
      <path d="M20 118 C22 96 40 92 60 100 C80 92 98 96 100 118Z" fill="#2f7f5a"/><path d="M42 96 L60 108 L78 96" fill="none" stroke="#e8b84a" stroke-width="4" stroke-linecap="round"/><circle cx="60" cy="112" r="3" fill="#e8b84a"/>`;
  FIGURES.hugo = `<path d="M18 62 C8 24 36 6 60 6 C84 6 112 24 102 62 C96 44 84 34 60 34 C36 34 24 44 18 62Z" fill="#f1eee6"/>
      <ellipse cx="60" cy="62" rx="27" ry="30" fill="${PEAU}"/><path d="M36 70 C34 98 50 114 60 114 C70 114 86 98 84 70 C78 82 70 84 60 84 C50 84 42 82 36 70Z" fill="#f1eee6"/>
      <circle cx="50" cy="58" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="58" r="3.5" fill="${ENCRE}"/><path d="M40 48 Q50 43 58 48 M62 48 Q70 43 80 48" fill="none" stroke="#d9d5ca" stroke-width="3" stroke-linecap="round"/>`;

  // Voltaire : perruque poudrée à boucles, visage fin.
  FIGURES.voltaire = `<path d="M16 76 C2 32 30 6 60 6 C90 6 118 32 104 76 C98 52 86 38 60 38 C34 38 22 52 16 76Z" fill="#f4f0e8"/><circle cx="16" cy="84" r="11" fill="#f4f0e8"/><circle cx="104" cy="84" r="11" fill="#f4f0e8"/>
      <ellipse cx="60" cy="64" rx="23" ry="30" fill="${PEAU}"/><circle cx="51" cy="62" r="3" fill="${ENCRE}"/><circle cx="69" cy="62" r="3" fill="${ENCRE}"/><path d="M44 52 Q51 48 57 52 M63 52 Q69 48 76 52" fill="none" stroke="#9a8f80" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M50 78 Q60 86 72 76" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/><path d="M40 98 L60 112 L80 98 L72 94 L60 102 L48 94Z" fill="#fff"/>`;
  FIGURES.touriste = `<ellipse cx="60" cy="40" rx="54" ry="14" fill="#f2c14e"/><path d="M30 40 C30 14 90 14 90 40Z" fill="#f2c14e"/><rect x="30" y="32" width="60" height="9" fill="#e0564a"/>
      <ellipse cx="60" cy="72" rx="26" ry="30" fill="${PEAU}"/><rect x="38" y="62" width="19" height="12" rx="4" fill="#1d1b19"/><rect x="63" y="62" width="19" height="12" rx="4" fill="#1d1b19"/><rect x="56" y="65" width="8" height="3" fill="#1d1b19"/>
      <path d="M50 88 Q60 96 70 88" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/><path d="M30 118 C34 102 48 100 60 104 C72 100 86 102 90 118Z" fill="#ff7a5c"/>`;
  FIGURES.marin = `<path d="M26 52 C26 14 94 14 94 52Z" fill="#1f3a6e"/><rect x="22" y="48" width="76" height="12" rx="5" fill="#fff6e8"/><circle cx="60" cy="30" r="5" fill="#e8b84a"/>
      <ellipse cx="60" cy="76" rx="25" ry="28" fill="${PEAU}"/><circle cx="50" cy="72" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="72" r="3.5" fill="${ENCRE}"/><path d="M50 88 Q60 96 70 88" fill="none" stroke="${ENCRE}" stroke-width="3" stroke-linecap="round"/>
      <path d="M26 118 C30 102 46 100 60 106 C74 100 90 102 94 118Z" fill="#fff6e8"/><path d="M34 110 h52 M30 116 h60" stroke="#1f3a6e" stroke-width="4"/>`;
  FIGURES.robinson = `<path d="M60 4 L70 34 L100 20 L84 46 L110 52 L80 62 L40 62 L10 52 L36 46 L20 20 L50 34Z" fill="#3fbf6e"/><path d="M60 8 V50" stroke="#2e9e5b" stroke-width="4"/>
      <ellipse cx="60" cy="70" rx="26" ry="28" fill="${PEAU}"/><path d="M34 74 C32 104 48 116 60 116 C72 116 88 104 86 74 C80 88 72 92 60 92 C48 92 40 88 34 74Z" fill="#6b4a32"/>
      <circle cx="50" cy="66" r="3.5" fill="${ENCRE}"/><circle cx="70" cy="66" r="3.5" fill="${ENCRE}"/><path d="M52 80 Q60 85 68 80" fill="none" stroke="#e9ab82" stroke-width="3" stroke-linecap="round"/>`;
  const figure = (nom) => `<svg viewBox="0 0 120 120" width="120" height="120">${FIGURES[nom] || ''}</svg>`;

  // La taille des cases s'adapte à la grille : toute la largeur utile (960 px) et la hauteur d'une zone de 770 px (y 490 à 1260), au plus 130 px de pas.
  const ZONE = { largeur: 960, haut: 490, hauteur: 770, vide: 8 };
  const ZONE_PROG = { largeur: 960, haut: 640, hauteur: 740, vide: 8 };
  function dims(g, prog) {
    const Z = prog ? ZONE_PROG : ZONE;
    const pas = Math.max(40, Math.floor(Math.min(Z.largeur / Math.max(1, g.colonnes), Z.hauteur / Math.max(1, g.lignes), 130)));
    const w = g.colonnes * pas - Z.vide, h = g.lignes * pas - Z.vide;
    return { pas, caseTaille: pas - Z.vide, gx: Math.round((1080 - w) / 2), gy: Math.round(Z.haut + (Z.hauteur - h) / 2), w, h };
  }
  // Les couleurs de papier des mots, dans l'ordre de révélation (palette « coucher »).
  const COULEURS = ['#ff9a5c', '#ffd45c', '#4fd1c5', '#c46bff', '#ff5d7a', '#7fb2ff'];
  // L'horaire d'un mot révélé : une lettre nouvelle toutes les 0,22 s, posée 0,5 s après le départ de son étincelle, la première après la voix.
  // Le même calcul sert à l'image et au son. nouvelles : le nombre de cases du mot pas encore révélées par un mot précédent.
  const LETTRE = { ecart: 0.22, vol: 0.5, apresVoix: 0.5 };
  // La première lettre ne se pose jamais avant que la voix ait fini de dire la réponse (fMot : fin de la phrase de réponse, + 0,5 s : même un son en retard de 0,3 s sur l'image arrive avant).
  function horaires(tr, nouvelles, fMot) {
    const premiere = Math.max(tr + LETTRE.vol, (fMot || 0) + LETTRE.apresVoix);
    const pose = Array.from({ length: nouvelles }, (_, j) => premiere + j * LETTRE.ecart);
    return { pose, depart: premiere - LETTRE.vol, fin: nouvelles ? pose[nouvelles - 1] : premiere };
  }
  // Les cases nouvelles de chaque mot, dans l'ordre de lecture.
  function nouvelles(g, n) {
    const vus = new Set();
    return Array.from({ length: n }, (_, k) => {
      const cells = g.cases.filter((x) => x.mots.includes(k) && !x.mots.some((j) => j < k));
      cells.forEach((x) => vus.add(x)); return cells;
    });
  }
  // Un morceau de papier découpé à la main : des sommets légèrement décalés (± 2,5 px), toujours les mêmes pour un numéro donné.
  const hachage = (k, s) => { const x = Math.sin(k * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  function papier(k, w, h) {
    const d = (s) => ((hachage(k, s) - 0.5) * 5).toFixed(1);
    const pts = [[0, 0], [w / 2, 0], [w, 0], [w, h / 2], [w, h], [w / 2, h], [0, h], [0, h / 2]].map(([x, y], i) => `${(x + (x === 0 ? Math.abs(d(i)) * 1 : x === w ? -Math.abs(d(i)) : +d(i))).toFixed(1)}px ${(y + (y === 0 ? Math.abs(d(i + 9)) : y === h ? -Math.abs(d(i + 9)) : +d(i + 9))).toFixed(1)}px`);
    return `polygon(${pts.join(',')})`;
  }

  function css(c, P) {
    return `
.jeu .fond-papier { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }
.jeu .fond-papier path { filter: drop-shadow(0 -9px 0 #0000004d); }
.jeu .jeu-titre { position: absolute; left: 250px; top: 305px; width: 780px; margin: 0; font: 800 58px/1.04 '${P.titre}'; letter-spacing: -.025em; color: var(--titre, ${c.texte}); text-shadow: 3px 4px 0 #00000055; }
.jeu .jeu-titre em { font-style: italic; font-family: '${P.fort}'; font-weight: 400; color: #ffd45c; }
.jeu .jeu-titre.fixe { left: 60px; top: 226px; width: 960px; font-size: 54px; white-space: nowrap; }
.jeu .grille { position: absolute; }
.jeu .case { position: absolute; width: var(--case); height: var(--case); filter: drop-shadow(5px 6px 0 #00000066); }
.jeu .pap { position: absolute; inset: 0; background: #fff6e8; overflow: hidden; }
.jeu .case i { position: absolute; inset: 0; opacity: 0; }
.jeu .case u { position: absolute; left: 50%; top: 50%; width: calc(var(--case) * .85); height: calc(var(--case) * .85); margin: calc(var(--case) * -.425) 0 0 calc(var(--case) * -.425); border-radius: 50%; border: 4px solid #ffd45c; box-sizing: border-box; opacity: 0; }
.jeu .case s { position: absolute; inset: 0; box-shadow: inset 0 0 20px 6px var(--wc); background: radial-gradient(circle, #ffffff00 40%, #ffffff66 100%); opacity: 0; }
.jeu .case b { position: absolute; left: 6px; top: 2px; font: 800 calc(var(--case) * .27) '${P.titre}'; color: #2a1a14; opacity: .8; transform-origin: 0 0; }
.jeu .case em { position: absolute; inset: 0; display: grid; place-items: center; font: 800 calc(var(--case) * .68) '${P.titre}'; font-style: normal; color: #2a1a14; }
.jeu .halo { position: absolute; width: var(--case); height: var(--case); box-shadow: 0 0 28px 12px var(--wc); border-radius: 12px; opacity: 0; }
.jeu .bandeau { position: absolute; left: 250px; top: 300px; width: 770px; height: 172px; filter: drop-shadow(7px 8px 0 #00000066); }
.jeu .bandeau .pap { background: #fff6e8; }
.jeu .scotch { position: absolute; width: 130px; height: 38px; background: repeating-linear-gradient(45deg, #ffd45ce6 0 11px, #ff9a5ce6 11px 22px); opacity: .92; }
.jeu .scotch.s1 { left: 214px; top: 300px; transform: rotate(-6deg); }
.jeu .scotch.s2 { left: 910px; top: 440px; transform: rotate(5deg); }
.jeu .indices p small { position: absolute; left: 150px; top: 12px; font: 800 21px '${P.titre}'; letter-spacing: .08em; text-transform: uppercase; color: #d1603d; }
.jeu .indices p.i-intro, .jeu .indices p.i-fin { font-size: 38px; }
.jeu .indices p { position: absolute; inset: 0; margin: 0; display: flex; align-items: center; padding: 0 135px 0 40px; font: 800 46px/1.06 '${P.titre}'; letter-spacing: -.02em; color: #2a1a14; }
.jeu .minuteur { position: absolute; left: 920px; top: 344px; width: 84px; height: 84px; }
.jeu .minuteur svg { position: absolute; inset: 0; transform: rotate(-90deg); }
.jeu .minuteur circle { fill: none; stroke-width: 7; }
.jeu .m-fond { stroke: #2a1a1422; }
.jeu .m-doux { stroke: #2a1a1488; stroke-linecap: round; }
.jeu .m-vif { stroke: #ff5d7a; stroke-linecap: round; }
.jeu .m-nb { position: absolute; inset: 0; display: grid; place-items: center; }
.jeu .m-nb span { grid-area: 1 / 1; font: 800 36px '${P.titre}'; color: #2a1a14; font-variant-numeric: tabular-nums; }
.jeu .bandeau.prog { left: 60px; top: 270px; width: 960px; height: 330px; filter: none; }
.jeu .bandeau.prog .indices p { padding: 34px 135px 0 6px; color: #fff; text-shadow: 0 4px 18px #0008; }
.jeu .bandeau.prog .indices p.i-intro, .jeu .bandeau.prog .indices p.i-fin { font-size: 46px; padding-top: 0; }
.jeu .bandeau.prog .indices p small { left: 6px; top: 0; color: #d9b8ff; }
.jeu .barre.prog { display: none; }
.jeu .danse { position: absolute; left: 0; top: 1450px; width: 1080px; height: 420px; overflow: visible; }
.jeu .minuteur.prog { top: 300px; }
.jeu .minuteur.prog .m-fond { stroke: #ffffff33; }
.jeu .tampon.prog { left: 720px; top: 580px; background: #1a0b2e; }
.jeu .tampon { position: absolute; left: 740px; top: 436px; padding: 6px 20px 8px; border: 5px solid #d62e4f; border-radius: 12px; color: #d62e4f; font: 800 34px '${P.titre}'; letter-spacing: .08em; background: #fff6e8; opacity: 0; transform-origin: 50% 50%; }
.jeu .barre { position: absolute; left: 60px; top: 1448px; width: 960px; height: 150px; }
.jeu .strip { position: absolute; left: -22px; top: -16px; width: 1004px; height: 156px; filter: drop-shadow(6px 7px 0 #00000066); }
.jeu .strip .pap { background: #fff6e8; }
.jeu .rail { position: absolute; left: 60px; right: 60px; top: 40px; height: 14px; border-radius: 7px; background: #2a1a1426; overflow: hidden; }
.jeu .rail i { display: block; width: 100%; height: 100%; background: linear-gradient(90deg, #ff9a5c, #ffd45c, #ff5d7a); transform-origin: 0 50%; transform: scaleX(0); }
.jeu .palier { position: absolute; top: 0; width: 160px; margin-left: -80px; text-align: center; }
.jeu .palier svg { display: block; margin: 0 auto; width: 84px; height: 84px; filter: drop-shadow(4px 5px 0 #00000066); }
.jeu .palier p { margin: 2px 0 0; font: 800 26px '${P.titre}'; color: #2a1a14; }
.jeu .etincelle { position: absolute; width: 18px; height: 18px; border-radius: 50%; background: radial-gradient(circle, #fff 0 25%, #ffd45c 55%, #ff9a5c00 100%); box-shadow: 0 0 20px 7px #ffb03b99; pointer-events: none; z-index: 5; }`;
  }

  return { construire, figure, css, dims, horaires, nouvelles, papier, COULEURS, LETTRE, FIGURES };
});
