/*
 * Le schéma de la boucle d'un agent, en coordonnées d'écran (devant la vitre, comme Mousse) :
 * trois étapes en cercle, pense → outil → résultat, une comète qui tourne de l'une à l'autre,
 * le numéro du tour au centre, et le chrono et les tokens au-dessus.
 * C'est l'élément pédagogique : il montre ce que fait l'IA pendant que la scène bouge.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).schema = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const POSE = { x: 290, y: 1250, s: 1.3 }; // en bas à gauche, dans la zone sûre
  const CENTRE = { x: 540, y: 1000, s: 1.6 }; // au milieu, sous le texte, pour l'explication
  const R = 104;
  const ETAPES = { pense: -90, outil: 30, resultat: 150 };
  const NOMS = { pense: 'pense', outil: 'outil', resultat: 'résultat' };
  const pt = (a) => [+(R * Math.cos((a * Math.PI) / 180)).toFixed(1), +(R * Math.sin((a * Math.PI) / 180)).toFixed(1)];
  const BALOO = 'font-family="&quot;Baloo 2&quot;, sans-serif" font-weight="800"';

  function dessin() {
    const fleches = [-90, 30, 150].map((a) => {
      const [x1, y1] = pt(a + 28); const [x2, y2] = pt(a + 92);
      const [ax, ay] = pt(a + 92);
      const ang = a + 92 + 90;
      return `<path d="M${x1} ${y1} A${R} ${R} 0 0 1 ${x2} ${y2}" fill="none" stroke="#b6ff5c" stroke-width="5" opacity="0.55"/>
        <path d="M-9 -8 L5 0 L-9 8" transform="translate(${ax} ${ay}) rotate(${ang})" fill="none" stroke="#b6ff5c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" opacity="0.8"/>`;
    }).join('');
    const noeuds = Object.entries(ETAPES).map(([id, a]) => {
      const [x, y] = pt(a); const l = NOMS[id].length * 21 + 40;
      return `<g id="schema-${id}" class="schema-noeud" transform="translate(${x} ${y})"><g class="schema-pastille">
        <rect x="${-l / 2}" y="-27" width="${l}" height="54" rx="27" fill="#030a08" stroke="#b6ff5c" stroke-width="3"/>
        <text text-anchor="middle" dominant-baseline="central" ${BALOO} font-size="36" fill="#fbfff6">${NOMS[id]}</text></g></g>`;
    }).join('');
    return `
  <g id="schema" opacity="0"><g id="schema-pos" transform="translate(${POSE.x} ${POSE.y})"><g id="schema-in">
    <circle r="${R + 78}" fill="#02060a" opacity="0.7" filter="url(#flou-schema)"/>
    <circle r="${R}" fill="none" stroke="#b6ff5c" stroke-width="2" opacity="0.18"/>
    ${fleches}
    <g id="schema-comete"><circle cx="0" cy="${-R}" r="11" fill="#9af8ff" filter="url(#lueur)"/><path d="M0 ${-R} A${R} ${R} 0 0 0 ${pt(-130)[0]} ${pt(-130)[1]}" fill="none" stroke="#9af8ff" stroke-width="7" stroke-linecap="round" opacity="0.55"/></g>
    <text id="schema-tour" y="6" text-anchor="middle" dominant-baseline="central" ${BALOO} font-size="58" fill="#fbfff6" filter="url(#lueur)">×0</text>
    ${noeuds}
    <g transform="translate(0 ${-R - 92})">
      <text id="schema-temps" text-anchor="middle" dominant-baseline="central" ${BALOO} font-size="52" fill="#9af8ff" filter="url(#lueur)">⏱ 0:00</text>
      <text id="schema-tokens" y="48" text-anchor="middle" dominant-baseline="central" ${BALOO} font-size="36" fill="#fbfff6" opacity="0.85">0 tokens</text>
    </g>
  </g></g></g>`;
  }

  const GESTES = {
    apparaitre: { canal: 'visible', duree: () => 0.4, params: '—', role: 'Le schéma de la boucle apparaît (en bas à gauche).' },
    disparaitre: { canal: 'visible', duree: () => 0.3, params: '—', role: 'Le schéma disparaît.' },
    etape: { canal: 'etape', duree: () => 0.3, params: 'de, vers : pense, outil, resultat, tout ou aucune ; angle ; erreur', role: "L'étape en cours s'allume, la comète y court." },
    compteur: { canal: 'compteur', duree: (p) => p.duree || 0.8, params: 'de, vers : { tour, s, k } ; duree', role: 'Le tour, le chrono et les tokens avancent (ou reviennent à zéro).' },
    centrer: { canal: 'place', duree: () => 0.6, params: 'vers : vrai (au centre, en grand) ou faux', role: "Le schéma passe au centre de l'écran pour l'explication, ou revient." },
  };

  const temps = (s) => `⏱ ${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`;
  const tokens = (k) => `${String(Math.round(k / 100) * 100).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} tokens`;

  function ambiance(c) {
    c.cycle(c.q('#schema-comete circle'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.35, transformOrigin: '50% 50%' }, c.T);
  }
  // Le compteur : un objet animé, dont chaque image réécrit les textes (comme la caméra).
  // La place du schéma : même principe (animer x, y et scale du groupe ferait dériver son origine).
  let compte = null;
  let place = null;
  const poser = (c) => c.q('#schema-pos').setAttribute('transform', `translate(${place.x.toFixed(2)} ${place.y.toFixed(2)}) scale(${place.s.toFixed(4)})`);
  const ecrire = (c) => {
    c.q('#schema-tour').textContent = '×' + Math.round(compte.tour);
    c.q('#schema-temps').textContent = temps(compte.s);
    c.q('#schema-tokens').textContent = tokens(compte.k);
  };
  function repos(c) {
    compte = { tour: 0, s: 0, k: 0 };
    ecrire(c);
    c.repos(c.q('#schema'), { opacity: 0 });
    place = Object.assign({}, POSE);
    poser(c);
    c.repos(c.qa('.schema-pastille'), { opacity: 0.45, scale: 1, svgOrigin: '0 0' });
    c.repos(c.q('#schema-comete'), { rotation: ETAPES.pense + 90, svgOrigin: '0 0' });
  }
  const pastilles = (c, ids) => ids.map((id) => c.q('#schema-' + id + ' .schema-pastille'));
  const gestes = {
    apparaitre(c, t) {
      c.ft(c.q('#schema'), { opacity: 0 }, { opacity: 1, duration: 0.3 }, t);
      c.ft(c.q('#schema-in'), { scale: 0.6, svgOrigin: '0 0' }, { scale: 1, svgOrigin: '0 0', duration: 0.4, ease: 'back.out(2)' }, t);
    },
    disparaitre(c, t) {
      c.ft(c.q('#schema'), { opacity: 1 }, { opacity: 0, duration: 0.3 }, t);
    },
    etape(c, t, p) {
      const tous = Object.keys(ETAPES);
      const allumees = (e) => (e === 'tout' ? tous : e === 'aucune' ? [] : [e]);
      const avant = allumees(p.de); const apres = allumees(p.vers);
      const eteindre = avant.filter((e) => !apres.includes(e)); const allumer = apres.filter((e) => !avant.includes(e));
      if (eteindre.length) c.ft(pastilles(c, eteindre), { opacity: 1, scale: 1.18 }, { opacity: 0.45, scale: 1, svgOrigin: '0 0', duration: 0.2 }, t);
      if (allumer.length) c.ft(pastilles(c, allumer), { opacity: 0.45, scale: 1 }, { opacity: 1, scale: 1.18, svgOrigin: '0 0', duration: 0.25, ease: 'back.out(3)' }, t);
      if (p.angleVers !== p.angleDe) c.ft(c.q('#schema-comete'), { rotation: p.angleDe + 90, svgOrigin: '0 0' }, { rotation: p.angleVers + 90, svgOrigin: '0 0', duration: 0.3, ease: 'power2.inOut' }, t);
      if (p.erreur) {
        const r = c.q('#schema-resultat rect');
        c.ft(r, { stroke: '#b6ff5c', fill: '#030a08' }, { stroke: '#ff6fb5', fill: '#3a0a1f', duration: 0.1, yoyo: true, repeat: 5 }, t);
      }
    },
    compteur(c, t, p) {
      const d = p.duree || 0.8;
      c.ft(compte, Object.assign({}, p.de), Object.assign({}, p.vers, { duration: d, ease: 'power1.inOut', onUpdate: () => ecrire(c) }), t);
      c.ft(c.q('#schema-temps'), { scale: 1, transformOrigin: '50% 50%' }, { scale: 1.2, transformOrigin: '50% 50%', duration: d / 2, yoyo: true, repeat: 1 }, t);
    },
    centrer(c, t, p) {
      const de = p.vers ? POSE : CENTRE; const vers = p.vers ? CENTRE : POSE;
      c.ft(place, Object.assign({}, de), Object.assign({}, vers, { duration: 0.6, ease: 'power3.inOut', onUpdate: () => poser(c) }), t);
    },
  };

  return { id: 'schema', nom: 'le schéma de la boucle', ETAPES, dessin, GESTES, ambiance, repos, gestes };
});
