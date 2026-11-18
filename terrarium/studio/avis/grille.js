/*
 * Le jeu de mots fléchés de la chaîne « avis » : quelques mots qui se croisent sur une petite grille, révélés un par un, avec une barre
 * de progression à trois paliers (singe → homme classique → Molière). Voir le plan `grille` dans plans.js.
 *   construire(mots)   place les mots, vérifie les croisements → { lignes, colonnes, cases: [{ l, c, lettre, mots, num }], erreurs }
 *   figure(nom)        le dessin (SVG, 120 × 120) d'un palier : singe, classique, moliere
 *   css(c, P)          le style de la grille, des cartes d'indice et de la barre
 * Un mot : { texte, sens: 'h' | 'v', ligne, colonne } (la première lettre est en [ligne, colonne]). Fonction pure, sans hasard.
 */
(function (racine, fabrique) {
  const api = fabrique();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { racine.Avis = racine.Avis || {}; racine.Avis.grille = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const CASE = 80, PAS = 86;

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
  const figure = (nom) => `<svg viewBox="0 0 120 120" width="120" height="120">${FIGURES[nom] || ''}</svg>`;

  function css(c, P) {
    return `
.jeu .jeu-titre { position: absolute; left: 60px; top: 285px; width: 960px; margin: 0; font: 700 62px/1.05 '${P.titre}'; letter-spacing: -.02em; color: ${c.texte}; }
.jeu .jeu-titre em { font-style: italic; font-family: '${P.fort}'; font-weight: 400; color: var(--ac); }
.jeu .grille { position: absolute; left: 60px; top: 390px; }
.jeu .case { position: absolute; width: ${CASE}px; height: ${CASE}px; background: #fff7ec; border-radius: 14px; box-shadow: 0 6px 0 #00000055; overflow: hidden; }
.jeu .case i { position: absolute; inset: 0; background: var(--ac); opacity: 0; }
.jeu .case b { position: absolute; left: 7px; top: 3px; font: 700 18px '${P.mono}'; color: #2a1a14; opacity: .7; }
.jeu .case em { position: absolute; inset: 0; display: grid; place-items: center; font: 700 56px '${P.titre}'; font-style: normal; color: #2a1a14; }
.jeu .cartes { position: absolute; left: 600px; top: 390px; width: 420px; display: flex; flex-direction: column; gap: 22px; }
.jeu .carte { background: ${c.fond}; color: ${c.texte}; border: 2px solid #ffffff24; border-radius: 22px; padding: 16px 20px 18px; box-shadow: 0 8px 0 #00000055; font: 700 34px/1.12 '${P.titre}'; letter-spacing: -.01em; }
.jeu .carte span { display: inline-block; min-width: 40px; margin-right: 8px; color: var(--ac); font: 700 32px '${P.titre}'; }
.jeu .barre { position: absolute; left: 60px; top: 1084px; width: 960px; height: 190px; }
.jeu .rail { position: absolute; left: 60px; right: 60px; top: 52px; height: 14px; border-radius: 7px; background: #ffffff30; overflow: hidden; }
.jeu .rail i { display: block; width: 100%; height: 100%; background: var(--ac); transform-origin: 0 50%; transform: scaleX(0); }
.jeu .palier { position: absolute; top: 0; width: 160px; margin-left: -80px; text-align: center; }
.jeu .palier svg { display: block; margin: 0 auto; width: 104px; height: 104px; }
.jeu .palier p { margin: 4px 0 0; font: 700 28px '${P.titre}'; color: ${c.texte}; text-shadow: 0 2px 10px #000a; }`;
  }

  return { construire, figure, css, CASE, PAS, FIGURES };
});
