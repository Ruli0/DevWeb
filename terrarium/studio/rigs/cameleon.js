/*
 * Rig du caméléon, style « ombres lumineuses » (direction artistique A2, 13 nov. 2026).
 * Silhouette sombre, contour et taches lumineux, gros œil.
 *
 * Côté Node : dessin(place), ancre(place, nom), GESTES (le catalogue, pour le compilateur).
 * Côté navigateur : ambiance(c), repos(c, p) et gestes[nom](c, t, p).
 * Les gestes ne gardent aucun état : le compilateur donne toujours le départ (de) et l'arrivée (vers).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).cameleon = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // Repère du rig : origine entre les pattes, tourné vers la droite.
  const G = {
    queue: 'M -78 -28 C -125 -24 -158 10 -146 48 C -136 80 -98 80 -94 54 C -91 36 -110 32 -114 46',
    corps: 'M -80 -22 C -92 -72 -42 -112 18 -108 C 50 -106 66 -98 78 -104 L 100 -134 C 122 -114 152 -80 162 -48 C 152 -32 124 -20 92 -20 C 52 -6 -38 -4 -80 -22 Z',
    ventre: 'M -76 -24 C -30 -10 46 -10 96 -22 L 92 -19 C 52 -5 -38 -3 -80 -21 Z',
    patteAv: 'M 52 -22 L 66 2 L 74 20',
    patteAr: 'M -40 -20 L -54 2 L -42 20',
    bouche: 'M 160 -46 C 144 -42 128 -41 114 -39',
    taches: [[-52, -80, 8], [-18, -98, 9], [20, -102, 7], [54, -96, 6], [-30, -58, 5], [8, -72, 6], [-62, -50, 4]],
  };
  const ANCRES = { pieds: [0, 20], oeil: [112, -72], bouche: [160, -46], corps: [20, -60], tete: [110, -80] };
  const NOIR = '#050b12';
  const TEINTES = {
    vert: { lueur: '#8dff6a', tache: '#b6ff5c', bord: '#c9ff8a' },
    turquoise: { lueur: '#5ef2ff', tache: '#9af8ff', bord: '#c8fbff' },
    orange: { lueur: '#ffb347', tache: '#ffd27a', bord: '#ffe0a8' },
    rose: { lueur: '#ff6fb5', tache: '#ff9fd0', bord: '#ffc8e4' },
  };

  // Position d'une ancre dans le décor. place : { x, y, s }.
  const ancre = (place, nom) => {
    const [u, v] = ANCRES[nom] || ANCRES.corps;
    return [+(place.x + u * place.s).toFixed(2), +(place.y + v * place.s).toFixed(2)];
  };
  // Angle (en degrés) de l'œil vers un point du décor.
  const angleVers = (place, cible) => {
    const [ox, oy] = ancre(place, 'oeil');
    return +((Math.atan2(cible[1] - oy, cible[0] - ox) * 180) / Math.PI).toFixed(1);
  };

  function dessin(place) {
    const t = TEINTES.vert;
    const [ox, oy] = ANCRES.oeil;
    const [bx, by] = ANCRES.bouche;
    const membres = (coul, larg, extra = '') => `
      <path d="${G.queue}" stroke="${coul}" stroke-width="${larg + 3}" fill="none" stroke-linecap="round" ${extra}/>
      <path d="${G.patteAv}" stroke="${coul}" stroke-width="${larg}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>
      <path d="${G.patteAr}" stroke="${coul}" stroke-width="${larg}" fill="none" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
    return `
  <g id="cameleon" transform="translate(${place.x} ${place.y}) scale(${place.s})">
   <g id="cameleon-tremble"><g id="cameleon-corps"><g id="cameleon-respire"><g id="cameleon-avaler">
    <g filter="url(#lueur-forte)" opacity="0.9">
      ${membres(t.lueur, 16, 'class="cameleon-lueur"')}
      <path class="cameleon-lueur" d="${G.corps}" fill="none" stroke="${t.lueur}" stroke-width="5"/>
    </g>
    ${membres(NOIR, 11)}
    <path class="cameleon-bord" d="${G.corps}" fill="${NOIR}" stroke="${t.bord}" stroke-width="1.6"/>
    <path d="${G.ventre}" fill="#0d2a1a"/>
    ${G.taches.map(([x, y, r]) => `<circle class="cameleon-tache" cx="${x}" cy="${y}" r="${r}" fill="${t.tache}" filter="url(#lueur)"/>`).join('')}
    <path d="${G.bouche}" stroke="#2c5a3c" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <circle class="cameleon-bord" cx="${ox}" cy="${oy}" r="24" fill="${NOIR}" stroke="${t.bord}" stroke-width="1.6"/>
    <g id="cameleon-sclere"><circle cx="${ox}" cy="${oy}" r="16" fill="#eafff0" filter="url(#lueur)"/>
      <g id="cameleon-pupille"><circle cx="${ox + 7}" cy="${oy}" r="8" fill="${NOIR}"/><circle cx="${ox + 9.5}" cy="${oy - 2.5}" r="2.2" fill="#fff"/></g></g>
    <g id="cameleon-pense" opacity="0">${[0, 1, 2].map((k) => `<circle class="cameleon-point" cx="${120 + k * 22}" cy="${-150 - k * 14}" r="${6 + k * 2}" fill="#d9ffb0" filter="url(#lueur)"/>`).join('')}</g>
    <circle id="cameleon-goutte" cx="${bx}" cy="${by}" r="7" fill="#9af8ff" filter="url(#lueur)" opacity="0"/>
    <g id="cameleon-bulle" opacity="0" transform="translate(190 -120) scale(0.6)"><g id="cameleon-bulle-in">
      <path d="M-58 -38 H58 A20 20 0 0 1 78 -18 V18 A20 20 0 0 1 58 38 H-20 L-46 58 L-40 38 H-58 A20 20 0 0 1 -78 18 V-18 A20 20 0 0 1 -58 -38 Z" fill="#030a08" stroke="#9af8ff" stroke-width="4" filter="url(#lueur)"/>
      <path d="M-50 -14 H50 M-50 4 H38 M-50 22 H20" stroke="#9af8ff" stroke-width="6" stroke-linecap="round"/>
    </g></g>
    <g id="cameleon-langue-g" opacity="0"><line id="cameleon-langue" x1="${bx}" y1="${by}" x2="${bx}" y2="${by}" stroke="#ff6fb5" stroke-width="4.5" stroke-linecap="round" filter="url(#lueur)"/>
      <circle id="cameleon-langue-bout" cx="${bx}" cy="${by}" r="4" fill="#ff9fd0" filter="url(#lueur)"/></g>
   </g></g></g></g>
  </g>`;
  }

  // --- Catalogue des gestes (lu par le compilateur et par catalogue.js) ---------------
  // canal : deux gestes du même canal ne peuvent pas se chevaucher.
  // duree(p, T) : durée occupée, en secondes ; avant : temps occupé avant l'instant donné.
  const GESTES = {
    regarder: { canal: 'pupille', duree: (p) => p.duree || 0.25, params: 'de, vers : angles (calculés par le compilateur) ; duree', role: "L'œil se tourne vers un point." },
    langue: { canal: 'corps', avant: 0.32, duree: (p) => 0.75 + (p.tenir || 0), params: 'cible : point visé ; rate : vrai si la cible a bougé ; tenir : secondes langue sortie', role: 'Recul, élan, la langue part en 0,1 s et revient.' },
    cligner: { canal: 'paupiere', duree: (p) => (p.fois || 2) * 0.3, params: 'fois (2)', role: "Clignement d'incrédulité." },
    avaler: { canal: 'gorge', duree: () => 0.75, params: '—', role: 'Le corps gonfle trois fois : il avale.' },
    reflechir: { canal: 'pupille', duree: (p) => p.duree || 1, params: 'duree', role: "Il réfléchit : l'œil fait un tour, trois points lumineux s'allument au-dessus de sa tête." },
    absorber: { canal: 'gorge', duree: () => 0.7, params: '—', role: "Le résultat de l'outil : une goutte lumineuse remonte de la bouche à la tête, les taches flashent." },
    repondre: { canal: 'bulle', duree: (p) => p.duree || 1.4, params: 'duree', role: 'Une bulle de réponse lumineuse sort de sa bouche.' },
    camoufler: { canal: 'camouflage', duree: () => 0.7, params: 'vers : vrai (presque invisible) ou faux', role: 'Il se camoufle : il devient presque invisible, ou réapparaît.' },
    trembler: { canal: 'tremble', duree: (p) => p.duree || 1, params: 'duree', role: 'Il tremble de peur (petites secousses rapides).' },
    teinte: { canal: 'couleur', duree: (p) => p.duree || 0.8, params: `de, vers : ${Object.keys(TEINTES).join(', ')} ; duree`, role: 'Le contour et les taches changent de couleur.' },
  };

  // --- Navigateur --------------------------------------------------------------------
  const O = ANCRES.oeil.join(' ');
  const PIEDS = ANCRES.pieds.join(' ');
  function ambiance(c) {
    c.cycle(c.q('#cameleon-respire'), { scaleY: 1, svgOrigin: PIEDS }, { scaleY: 1.025, svgOrigin: PIEDS }, 2 * c.T);
    c.qa('.cameleon-tache').forEach((el) => c.cycle(el, { opacity: 0.55 }, { opacity: 1 }, c.T));
  }
  function repos(c, p) {
    c.repos(c.q('#cameleon-pupille'), { rotation: p.regard, svgOrigin: O });
    c.repos(c.q('#cameleon-corps'), { rotation: 0, svgOrigin: PIEDS });
    c.repos(c.q('#cameleon-langue-g'), { opacity: 0 });
    c.repos(c.qa('#cameleon-pense, #cameleon-goutte, #cameleon-bulle'), { opacity: 0 });
    c.repos(c.q('#cameleon'), { opacity: 1 });
    c.repos(c.q('#cameleon-tremble'), { rotation: 0, svgOrigin: PIEDS });
  }
  const gestes = {
    regarder(c, t, p) {
      c.ft(c.q('#cameleon-pupille'), { rotation: p.de, svgOrigin: O }, { rotation: p.vers, svgOrigin: O, duration: p.duree || 0.25, ease: p.ease || 'power2.out' }, t);
    },
    langue(c, t, p) {
      const corps = c.q('#cameleon-corps');
      const [bx, by] = ANCRES.bouche;
      const l = [+((p.cible[0] - p.place.x) / p.place.s).toFixed(2), +((p.cible[1] - p.place.y) / p.place.s).toFixed(2)];
      // Anticipation (il se ramasse), élan, rebond.
      c.ft(corps, { rotation: 0, svgOrigin: PIEDS }, { rotation: -7, svgOrigin: PIEDS, duration: 0.3, ease: 'power2.out' }, t - 0.32);
      c.ft(corps, { rotation: -7, svgOrigin: PIEDS }, { rotation: 4, svgOrigin: PIEDS, duration: 0.08, ease: 'power3.out' }, t - 0.02);
      c.ft(corps, { rotation: 4, svgOrigin: PIEDS }, { rotation: 0, svgOrigin: PIEDS, duration: 0.6, ease: 'elastic.out(1, 0.4)' }, t + 0.06);
      const g = c.q('#cameleon-langue-g'); const ligne = c.q('#cameleon-langue'); const bout = c.q('#cameleon-langue-bout');
      c.tl.set(g, { opacity: 1 }, t);
      c.ft(ligne, { attr: { x2: bx, y2: by } }, { attr: { x2: l[0], y2: l[1] }, duration: 0.1, ease: 'power3.out' }, t);
      c.ft(bout, { attr: { cx: bx, cy: by, r: 4 } }, { attr: { cx: l[0], cy: l[1], r: p.rate ? 6 : 9 }, duration: 0.1, ease: 'power3.out' }, t);
      const retour = t + 0.2 + (p.tenir || 0);
      if (p.tenir) c.ft(bout, { attr: { r: p.rate ? 6 : 9 } }, { attr: { r: (p.rate ? 6 : 9) * 1.3 }, duration: 0.25, yoyo: true, repeat: Math.max(1, 2 * Math.floor(p.tenir / 0.5)) - 1, ease: 'sine.inOut' }, t + 0.12);
      c.ft(ligne, { attr: { x2: l[0], y2: l[1] } }, { attr: { x2: bx, y2: by }, duration: 0.22, ease: 'power2.in' }, retour);
      c.ft(bout, { attr: { cx: l[0], cy: l[1], r: p.rate ? 6 : 9 } }, { attr: { cx: bx, cy: by, r: 4 }, duration: 0.22, ease: 'power2.in' }, retour);
      c.tl.set(g, { opacity: 0 }, retour + 0.22);
    },
    cligner(c, t, p) {
      for (let k = 0; k < (p.fois || 2); k += 1) {
        c.ft(c.q('#cameleon-sclere'), { scaleY: 1, svgOrigin: O }, { scaleY: 0.08, svgOrigin: O, duration: 0.07, yoyo: true, repeat: 1 }, t + k * 0.3);
      }
    },
    avaler(c, t) {
      c.ft(c.q('#cameleon-avaler'), { scaleY: 1, scaleX: 1, svgOrigin: PIEDS }, { scaleY: 1.07, scaleX: 0.97, svgOrigin: PIEDS, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t);
    },
    reflechir(c, t, p) {
      const d = p.duree || 1;
      c.ft(c.q('#cameleon-pupille'), { rotation: p.regard, svgOrigin: O }, { rotation: p.regard + 360, svgOrigin: O, duration: d, ease: 'power1.inOut' }, t);
      const pense = c.q('#cameleon-pense'); const points = c.qa('.cameleon-point');
      c.tl.set(pense, { opacity: 1 }, t);
      points.forEach((el, k) => c.ft(el, { opacity: 0, scale: 0.3, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, transformOrigin: '50% 50%', duration: 0.18, ease: 'back.out(3)' }, t + k * (d / 4)));
      c.ft(pense, { opacity: 1 }, { opacity: 0, duration: 0.2 }, t + d - 0.1);
    },
    absorber(c, t) {
      const g = c.q('#cameleon-goutte'); const [bx, by] = ANCRES.bouche; const [tx, ty] = ANCRES.tete;
      c.tl.set(g, { opacity: 1 }, t);
      c.ft(g, { attr: { cx: bx, cy: by, r: 7 } }, { attr: { cx: tx, cy: ty, r: 4 }, duration: 0.35, ease: 'power2.in' }, t);
      c.tl.set(g, { opacity: 0 }, t + 0.35);
      c.ft(c.qa('.cameleon-tache'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.6, transformOrigin: '50% 50%', duration: 0.12, yoyo: true, repeat: 1, stagger: 0.03 }, t + 0.35);
    },
    repondre(c, t, p) {
      const d = p.duree || 1.4; const b = c.q('#cameleon-bulle');
      c.tl.set(b, { opacity: 1 }, t);
      c.ft(c.q('#cameleon-bulle-in'), { scale: 0.1, svgOrigin: '-40 50' }, { scale: 1, svgOrigin: '-40 50', duration: 0.35, ease: 'back.out(2.5)' }, t);
      c.ft(b, { opacity: 1 }, { opacity: 0, duration: 0.25 }, t + d - 0.25);
    },
    camoufler(c, t, p) {
      const [a, b] = p.vers ? [1, 0.22] : [0.22, 1];
      c.ft(c.q('#cameleon'), { opacity: a }, { opacity: b, duration: 0.7, ease: 'power2.inOut' }, t);
    },
    trembler(c, t, p) {
      const d = p.duree || 1; const n = Math.max(2, Math.round(d / 0.05));
      c.ft(c.q('#cameleon-tremble'), { rotation: -1.4, svgOrigin: PIEDS }, { rotation: 1.4, svgOrigin: PIEDS, duration: 0.05, yoyo: true, repeat: n - 1, ease: 'none' }, t);
      c.ft(c.q('#cameleon-tremble'), { rotation: n % 2 ? 1.4 : -1.4, svgOrigin: PIEDS }, { rotation: 0, svgOrigin: PIEDS, duration: 0.08 }, t + n * 0.05);
    },
    teinte(c, t, p) {
      const de = TEINTES[p.de]; const vers = TEINTES[p.vers]; const d = p.duree || 0.8;
      c.ft(c.qa('.cameleon-lueur'), { stroke: de.lueur }, { stroke: vers.lueur, duration: d }, t);
      c.ft(c.qa('.cameleon-bord'), { stroke: de.bord }, { stroke: vers.bord, duration: d }, t);
      c.ft(c.qa('.cameleon-tache'), { fill: de.tache }, { fill: vers.tache, duration: d }, t);
    },
  };

  return { id: 'cameleon', nom: 'le caméléon', dessin, ancre, angleVers, ANCRES, GESTES, TEINTES, ambiance, repos, gestes };
});
