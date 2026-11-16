/*
 * Le personnage récurrent de la chaîne « avis » : un double stylisé de l'auteur, en papier découpé, le même dans chaque vidéo.
 * Version 2D (SVG). Il est fait d'un squelette simple : chaque pose est une liste d'angles, donc en ajouter une coûte une ligne.
 *   svg(pose, allure)          le dessin, dans un repère où les pieds sont en (0, 0) et la tête vers le haut (y négatif)
 *   jouer(c, el, pose, t0, d)  son petit mouvement (respiration, geste), en répétitions finies
 *   PLACES                     où il se tient dans chaque décor, à quelle taille, et les poses que le décor accepte
 * Les angles : 0 = vers le bas, 90 = vers la droite de l'image, 180 = vers le haut, négatif = vers la gauche.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.personnage = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const PEAU = '#f3c6a0', PAPIER = '#f6f1e7';
  // Les trois allures proposées à l'auteur ; il en choisit une (studio/avis/style.js, "personnage").
  const ALLURES = {
    bonnet: { nom: 'Le bonnet', coiffe: 'bonnet', couleurCoiffe: '#ff8a3d', cheveux: '#3a2a22', haut: '#2f7f8a', bas: '#22323f', chaussures: '#f2c14e' },
    casquette: { nom: 'La casquette', coiffe: 'casquette', couleurCoiffe: '#5b8cff', cheveux: '#2a2018', haut: '#f2c14e', bas: '#2b3a55', chaussures: '#e0564a' },
    boucles: { nom: 'Les boucles et les lunettes', coiffe: 'boucles', cheveux: '#4a3020', haut: '#e0564a', bas: '#2e3b4e', chaussures: '#f6f1e7', lunettes: true },
  };
  // Les poses : [bras gauche, avant-bras gauche], [bras droit, avant-bras droit], [cuisse g., tibia g.], [cuisse d., tibia d.].
  // « gauche » et « droite » sont celles de l'image. dos : vu de dos (pas de visage). bassin : hauteur du bassin (assis = plus bas).
  const POSES = {
    debout: { bg: [-10, -4], bd: [10, 4], jg: [-5, -2], jd: [5, 2] },
    salue: { bg: [-10, -4], bd: [140, 172], jg: [-5, -2], jd: [5, 2], geste: 'bd' },
    montre: { bg: [-12, -6], bd: [82, 88], jg: [-5, -2], jd: [8, 3], geste: 'bd' },
    reflechit: { bg: [-28, 62], bd: [26, 158], jg: [-5, -2], jd: [5, 2], penche: -4 },
    marche: { bg: [-26, -44], bd: [22, 40], jg: [-22, -6], jd: [24, 42], geste: 'marche' },
    assis: { bg: [-34, 28], bd: [34, -28], jg: [-58, -4], jd: [58, 4], bassin: -118 },
    grimpe: { bg: [-152, -176], bd: [136, 168], jg: [-52, 12], jd: [34, -12], dos: true, geste: 'grimpe' },
  };
  const L = { bras: 82, avant: 78, cuisse: 96, tibia: 100 };
  const rad = (a) => (a * Math.PI) / 180;
  const bout = (p, angle, longueur) => [p[0] + Math.sin(rad(angle)) * longueur, p[1] + Math.cos(rad(angle)) * longueur];
  const f = (n) => Math.round(n * 10) / 10;
  // Un membre en papier : un trait épais, bordé d'un liseré clair (le bord du papier découpé).
  const trait = (pts, largeur, couleur) => { const d = `M${pts.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L')}`; return `<path d="${d}" fill="none" stroke="${PAPIER}" stroke-width="${largeur + 12}" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${couleur}" stroke-width="${largeur}" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const BORD = `stroke="${PAPIER}" stroke-width="7" stroke-linejoin="round" paint-order="stroke"`;

  function svg(pose = 'debout', allure = 'bonnet') {
    const P = POSES[pose] || POSES.debout, A = ALLURES[allure] || ALLURES.bonnet;
    const yB = P.bassin || -200, yE = yB - 150;                    // bassin et épaules
    // Chaque membre est dessiné autour de son articulation (l'origine de son groupe) : il tourne autour d'elle sans calcul.
    const membre = (cls, origine, angles, l1, l2, largeur, couleur, extremite) => {
      const coude = bout([0, 0], angles[0], l1), main = bout(coude, angles[1], l2);
      return `<g transform="translate(${f(origine[0])} ${f(origine[1])})"><g class="${cls}">${trait([[0, 0], coude, main], largeur, couleur)}${extremite(main, angles[1])}</g></g>`;
    };
    const main = (p) => `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="21" fill="${PEAU}" ${BORD}/>`;
    const pied = (p, a) => `<ellipse cx="${f(p[0] + (P.dos ? 0 : Math.sign(a || 1) * 12))}" cy="${f(p[1] + 6)}" rx="34" ry="19" fill="${A.chaussures}" ${BORD}/>`;
    const jambes = membre('jg', [-30, yB], P.jg, L.cuisse, L.tibia, 40, A.bas, pied) + membre('jd', [30, yB], P.jd, L.cuisse, L.tibia, 40, A.bas, pied);
    const bras = (cls, x, angles) => membre(cls, [x, yE + 18], angles, L.bras, L.avant, 32, A.haut, main);
    const torse = `<path d="M-62 ${yE} Q0 ${yE - 26} 62 ${yE} L56 ${yB + 14} Q0 ${yB + 34} -56 ${yB + 14} Z" fill="${A.haut}" ${BORD}/>`
      + (A.coiffe === 'bonnet' && !P.dos ? `<path d="M-16 ${yE + 2} L-12 ${yE + 46} M16 ${yE + 2} L12 ${yE + 46}" stroke="${PAPIER}" stroke-width="5" stroke-linecap="round" opacity=".8"/>` : '');
    // La tête : de face (deux yeux, un sourire) ou de dos (les cheveux seuls).
    const yT = yE - 74;
    let tete = `<circle cx="0" cy="${yT}" r="64" fill="${P.dos ? A.cheveux : PEAU}" ${BORD}/>`;
    if (!P.dos) {
      tete += `<circle cx="-22" cy="${yT + 2}" r="7" fill="#22232a"/><circle cx="22" cy="${yT + 2}" r="7" fill="#22232a"/><path d="M-20 ${yT + 26} Q0 ${yT + 44} 20 ${yT + 26}" fill="none" stroke="#22232a" stroke-width="6" stroke-linecap="round"/>`;
      if (A.lunettes) tete += `<g fill="none" stroke="#22232a" stroke-width="5"><circle cx="-22" cy="${yT + 2}" r="19"/><circle cx="22" cy="${yT + 2}" r="19"/><path d="M-3 ${yT + 2} H3"/></g>`;
    }
    if (A.coiffe === 'bonnet') tete += `<path d="M-66 ${yT - 22} C-66 ${yT - 100} 66 ${yT - 100} 66 ${yT - 22} Z" fill="${A.couleurCoiffe}" ${BORD}/><rect x="-70" y="${yT - 38}" width="140" height="26" rx="12" fill="${A.couleurCoiffe}" ${BORD}/><circle cx="0" cy="${yT - 88}" r="15" fill="${PAPIER}"/>`;
    if (A.coiffe === 'casquette') tete += `<path d="M-64 ${yT - 22} C-64 ${yT - 90} 64 ${yT - 90} 64 ${yT - 22} Z" fill="${A.couleurCoiffe}" ${BORD}/>${P.dos ? '' : `<path d="M10 ${yT - 28} H104 Q112 ${yT - 16} 96 ${yT - 12} H10 Z" fill="${A.couleurCoiffe}" ${BORD}/>`}<path d="M-64 ${yT - 12} Q-70 ${yT + 16} -58 ${yT + 26}" fill="none" stroke="${A.cheveux}" stroke-width="12" stroke-linecap="round"/>`;
    if (A.coiffe === 'boucles') tete += [[-52, -34], [-28, -58], [2, -66], [32, -56], [54, -32], [-62, -6], [62, -6]].map(([x, y]) => `<circle cx="${x}" cy="${yT + y}" r="24" fill="${A.cheveux}" ${BORD}/>`).join('');
    // De dos (escalade) : les bras passent derrière le torse ; de face, devant.
    const bg = bras('bg', -54, P.bg), bd = bras('bd', 54, P.bd);
    const corps = P.dos ? `${bg}${bd}${jambes}${torse}` : `${jambes}${torse}${bg}${bd}`;
    return `<g class="perso" data-pose="${pose}"><g class="elan"><g transform="rotate(${P.penche || 0})">${corps}<g class="tete-p">${tete}</g></g></g></g>`;
  }

  // Le mouvement : il respire toujours ; certaines poses ont un geste (la main qui salue, le pas, la traction).
  // Tout passe par l'attribut « transform » des groupes (jamais par les propriétés x, y ou rotation de GSAP, qui se repèrent
  // dans l'image entière et décalent un dessin déjà placé par un groupe parent).
  function jouer(c, el, pose, t0, d) {
    const P = POSES[pose] || POSES.debout, q = (s) => el.querySelector(s);
    const fois = (periode) => Math.max(1, Math.floor(d / periode));
    const tr = (g, de, vers, plus, t) => c.ft(g, { attr: { transform: de } }, Object.assign({ attr: { transform: vers } }, plus), t);
    c.ft(q('.perso'), { opacity: 0 }, { opacity: 1, duration: 0.2 }, t0 + 0.15);
    tr(q('.perso'), 'translate(0 70) scale(0.6)', 'translate(0 0) scale(1)', { duration: 0.5, ease: 'back.out(1.8)' }, t0 + 0.15);
    tr(q('.tete-p'), 'translate(0 0)', 'translate(0 -7)', { duration: 0.9, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(1.8) - 1 }, t0 + 0.7);
    const balance = (cls, de, vers, periode) => tr(q(cls), `rotate(${de})`, `rotate(${vers})`, { duration: periode / 2, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(periode) - 1 }, t0 + 0.7);
    if (P.geste === 'bd') balance('.bd', -7, 9, 0.7);
    if (P.geste === 'marche') { balance('.jg', -12, 14, 0.9); balance('.jd', 12, -14, 0.9); balance('.bg', 10, -12, 0.9); balance('.bd', -10, 12, 0.9); }
    if (P.geste === 'grimpe') { balance('.bg', -5, 7, 2.2); tr(q('.elan'), 'translate(0 0)', 'translate(0 -16)', { duration: 1.1, ease: 'sine.inOut', yoyo: true, repeat: 2 * fois(2.2) - 1 }, t0 + 0.7); }
  }

  // Où il se tient dans chaque décor (pieds en x, y sur l'image 1080 × 1920), à quelle taille, et dans quelles poses.
  // Règle : le centre de sa tête (y − 424 × taille) reste au-dessus de 1200, pour que les sous-titres (1300 à 1430)
  // passent sur son torse ou ses jambes, jamais sur son visage.
  const PLACES = {
    cave: { x: 250, y: 1884, taille: 1.7, poses: ['reflechit', 'debout', 'montre', 'salue'], figurant: true },
    robot: { x: 232, y: 1884, taille: 1.7, poses: ['montre', 'reflechit', 'debout', 'salue'] },
    scene: { x: 566, y: 1668, taille: 1.3, poses: ['salue', 'debout', 'montre'] },
    mur: { x: 540, y: 1560, taille: 1.3, poses: ['grimpe'], figurant: true },
    salon: { x: 596, y: 1700, taille: 1.3, poses: ['reflechit', 'debout', 'montre', 'assis'] },
    riziere: { x: 760, y: 1560, taille: 0.95, poses: ['marche', 'debout', 'salue'] },
  };

  return { ALLURES, POSES, PLACES, svg, jouer };
});
