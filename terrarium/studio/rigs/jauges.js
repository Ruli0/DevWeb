/*
 * Les jauges d'une étude : deux barres (« ce qu'ils croient », « ce qui se passe vraiment ») qui se
 * remplissent, avec leur pourcentage, et la source en petit. En bas de l'écran, sur un fond translucide
 * comme le texte (13 nov. 2026 : on veut des faits concrets et des études).
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else {
    racine.Terrarium = racine.Terrarium || {};
    (racine.Terrarium.rigs = racine.Terrarium.rigs || {}).jauges = api;
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const LARGEUR = 600; // largeur d'une barre pleine (100 %)
  const POLICE = 'font-family="Poppins, sans-serif"';
  const LIGNES = { croit: { y: 0, couleur: 'rgba(150,130,255,.95)', label: "ce qu'ils croient" }, reel: { y: 134, couleur: 'rgba(154,248,255,.95)', label: 'ce qui se passe vraiment' } };

  function dessin(source) {
    const ligne = (id) => {
      const l = LIGNES[id];
      return `<text x="36" y="${l.y - 20}" ${POLICE} font-weight="700" font-size="42" fill="#ffffff">${l.label}</text>
      <rect x="36" y="${l.y}" width="${LARGEUR}" height="56" rx="28" fill="rgba(255,255,255,0.14)"/>
      <rect id="jauge-${id}" x="36" y="${l.y}" width="0" height="56" rx="28" fill="${l.couleur}"/>
      <text id="jauge-${id}-val" x="660" y="${l.y + 46}" ${POLICE} font-weight="800" font-size="64" fill="#ffffff">0 %</text>`;
    };
    return `
  <g id="jauges" opacity="0"><g transform="translate(70 1150)"><g id="jauges-in">
    <rect x="0" y="-84" width="870" height="354" rx="44" fill="rgba(20,50,70,0.5)" stroke="rgba(154,248,255,0.22)" stroke-width="2"/>
    ${ligne('croit')}${ligne('reel')}
    <text id="jauges-source" x="36" y="242" ${POLICE} font-weight="600" font-size="32" fill="rgba(255,255,255,0.82)" opacity="0">${source || ''}</text>
  </g></g></g>`;
  }

  const GESTES = {
    apparaitre: { canal: 'visible', duree: () => 0.5, params: '—', role: "Le panneau de l'étude apparaît en bas de l'écran." },
    disparaitre: { canal: 'visible', duree: () => 0.4, params: '—', role: 'Le panneau disparaît.' },
    barre: { canal: 'barre', duree: (p) => p.duree || 1, params: 'id : croit ou reel ; de, vers : pourcentages ; duree', role: 'Une barre se remplit jusqu\'à son pourcentage.' },
    source: { canal: 'source', duree: () => 0.4, params: 'vers : vrai (la source apparaît) ou faux', role: "La source de l'étude s'affiche en petit." },
  };

  let valeurs = null;
  function ecrire(c, id) {
    c.q('#jauge-' + id).setAttribute('width', (LARGEUR * valeurs[id].v) / 100);
    c.q('#jauge-' + id + '-val').textContent = Math.round(valeurs[id].v) + ' %';
  }
  function ambiance() {}
  function repos(c) {
    valeurs = { croit: { v: 0 }, reel: { v: 0 } };
    ecrire(c, 'croit'); ecrire(c, 'reel');
    c.repos(c.q('#jauges'), { opacity: 0 });
    c.repos(c.q('#jauges-source'), { opacity: 0 });
  }
  const gestes = {
    apparaitre(c, t) {
      c.ft(c.q('#jauges'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, t);
      c.ft(c.q('#jauges-in'), { y: 70 }, { y: 0, duration: 0.5, ease: 'back.out(1.6)' }, t);
    },
    disparaitre(c, t) {
      c.ft(c.q('#jauges'), { opacity: 1 }, { opacity: 0, duration: 0.4 }, t);
    },
    barre(c, t, p) {
      c.ft(valeurs[p.id], { v: p.de }, { v: p.vers, duration: p.duree || 1, ease: 'power2.out', onUpdate: () => ecrire(c, p.id) }, t);
    },
    source(c, t, p) {
      const [a, b] = p.vers ? [0, 1] : [1, 0];
      c.ft(c.q('#jauges-source'), { opacity: a }, { opacity: b, duration: 0.4 }, t);
    },
  };

  return { id: 'jauges', nom: "les jauges d'une étude", dessin, GESTES, ambiance, repos, gestes };
});
